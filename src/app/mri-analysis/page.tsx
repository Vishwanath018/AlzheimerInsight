"use client";

import {useMemo, useState, useEffect} from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  ArrowRight,
  Bell,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  Download,
  FileImage,
  FileText,
  FolderOpen,
  Grid2X2,
  Info,
  LoaderCircle,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const CLASSES: Record<string, string> = {
  Mild_Demented: "Mild Demented",
  Moderate_Demented: "Moderate Demented",
  Non_Demented: "Non Demented",
  Very_Mild_Demented: "Very Mild Demented",
};

const CATEGORY_COLORS: Record<string, string> = {
  Mild_Demented: "bg-emerald-500",
  Moderate_Demented: "bg-amber-500",
  Non_Demented: "bg-violet-500",
  Very_Mild_Demented: "bg-rose-500",
};

type Prediction = {
  filename: string;
  relative_path: string;
  actual_class: string;
  predicted_class: string;
  scores: Record<string, number>;
};


type SinglePrediction = {
  predicted_class: string;
  scores: Record<string, number>;
  model: string;
  input_filename: string;
  research_notice?: string;
};
type DatasetInfo = {
  total: number;
  categories: Record<string, number>;
};

type AnalysisResponse = {
  requested: number;
  processed: number;
  model: string;
  actual_counts?: Record<string, number>;
  predicted_counts?: Record<string, number>;
  accuracy_on_selected_folder_labels?: number | null;
  results: Prediction[];
  detail?: string;
};

function readable(value: string) {
  return CLASSES[value] ?? value.replaceAll("_", " ");
}

function csvEscape(value: string | number) {
  return '"' + String(value).replaceAll('"', '""') + '"';
}

function formatDate() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export default function MRIAnalysisPage() {
  const [localDate, setLocalDate] = useState("");
  useEffect(() => {
    setLocalDate(new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).format(new Date()));
  }, []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [singlePrediction, setSinglePrediction] = useState<SinglePrediction | null>(null);
  const [predictingSingle, setPredictingSingle] = useState(false);

  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [limit, setLimit] = useState("32");
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<Prediction[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");


  async function predictSingleImage() {
    if (!selectedFile) {
      setError("Please select an MRI image first.");
      return;
    }

    setPredictingSingle(true);
    setError("");
    setSinglePrediction(null);
    setStatus("Analyzing the selected MRI image...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "MRI prediction failed.");
      }

      setSinglePrediction(data as SinglePrediction);
      setStatus("MRI image prediction completed.");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "MRI prediction failed.";

      setError(
        message.includes("Failed to fetch")
          ? "Cannot connect to the backend. Make sure FastAPI is running on port 8000."
          : message
      );
    } finally {
      setPredictingSingle(false);
    }
  }
  async function loadDataset() {
    setLoadingDataset(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/dataset/images`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to read the dataset.");
      }

      setDataset(data as DatasetInfo);
      setStatus(`${data.total.toLocaleString()} images found in your local dataset.`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Dataset request failed.";
      setError(
        message.includes("Failed to fetch")
          ? "Cannot connect to the backend. Start the FastAPI server on port 8000."
          : message
      );
    } finally {
      setLoadingDataset(false);
    }
  }

  async function runAnalysis() {
    const requested = Number.parseInt(limit, 10);

    if (!dataset) {
      setError("Scan the local dataset before starting analysis.");
      return;
    }

    if (!Number.isFinite(requested) || requested < 1 || requested > dataset.total) {
      setError(`Choose a value between 1 and ${dataset.total}.`);
      return;
    }

    setAnalyzing(true);
    setError("");
    setResults([]);
    setAnalysis(null);
    setStatus(`Analyzing ${requested.toLocaleString()} images...`);

    try {
      const response = await fetch(
        `${API_URL}/dataset/analyze?limit=${requested}`,
        { method: "POST" }
      );
      const data = await response.json() as AnalysisResponse;

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed.");
      }

      setAnalysis(data);
      setResults(data.results ?? []);
      setStatus(
        `Completed ${data.processed.toLocaleString()} of ${requested.toLocaleString()} requested images.`
      );
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Analysis failed.";
      setError(
        message.includes("Failed to fetch")
          ? "The backend connection was interrupted. Check your backend terminal."
          : message
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function downloadCsv() {
    if (!results.length) return;

    const classKeys = Object.keys(CLASSES);
    const headers = [
      "Image",
      "Folder_Label",
      "Predicted_Class",
      ...classKeys.map((key) => `Score_${key}`),
    ];

    const rows = results.map((item) => [
      item.relative_path,
      item.actual_class,
      item.predicted_class,
      ...classKeys.map((key) => String(item.scores?.[key] ?? "")),
    ]);

    const content = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", content], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "alzheimerinsight_results.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const predictedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(CLASSES).forEach((key) => {
      counts[key] = results.filter((item) => item.predicted_class === key).length;
    });
    return counts;
  }, [results]);

  const pieBackground = useMemo(() => {
    const colors = ["#10b981", "#f59e0b", "#8b5cf6", "#e11d48"];
    let cursor = 0;
    const segments = Object.keys(CLASSES).map((key, index) => {
      const percentage = results.length ? predictedCounts[key] / results.length * 100 : 0;
      const start = cursor;
      cursor += percentage;
      return `${colors[index]} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [predictedCounts, results.length]);

  const accuracy = analysis?.accuracy_on_selected_folder_labels;


  return (
    <main className="min-h-screen bg-[#f3f7fa] text-[#102c43]">
      <div className="mx-auto flex min-h-screen max-w-[1900px]">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <div className="min-h-[calc(100vh-32px)] bg-[#f4f8f7] px-4 py-8 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">

              {/* Page heading */}
              <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#16816b]">
                    <span className="h-2 w-2 rounded-full bg-[#84cc16]" />
                    RESEARCH WORKSPACE
                    <ChevronRight size={14} />
                    MRI ANALYSIS
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-[#103b3b] sm:text-4xl">
                    MRI Image Analysis
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                    Upload a brain MRI image and use your trained ViT-B/16 V2 model
                    to generate an experimental four-class classification.
                  </p>
                </div>

                <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#dcebe4] bg-white px-4 py-3 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f7d9] text-[#47751e]">
                    <Brain size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#174b40]">ViT-B/16 V2</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Local model
                    </p>
                  </div>
                </div>
              </div>

              {/* Main upload card */}
              <section className="overflow-hidden rounded-3xl border border-[#dce9e5] bg-white shadow-[0_12px_45px_-25px_rgba(15,72,58,0.25)]">

                <div className="border-b border-[#edf2ef] px-5 py-5 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf6d9] text-[#3c6922]">
                      <FileImage size={22} />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-[#173d37]">
                        Upload MRI Image
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Select an image from your device to begin.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-8">

                  <label
                    htmlFor="mri-image-upload"
                    className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cbded4] bg-[#f8fbf8] px-5 py-9 text-center transition hover:border-[#80b83b] hover:bg-[#f3faec] sm:min-h-[260px]"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#548b36] shadow-sm ring-1 ring-[#e3eddf] transition group-hover:scale-105">
                      <FolderOpen size={30} strokeWidth={1.7} />
                    </div>

                    <p className="text-base font-extrabold text-[#21483e]">
                      {selectedFile ? "Image selected successfully" : "Choose an MRI image"}
                    </p>

                    <p className="mt-2 max-w-md break-all text-sm text-slate-500">
                      {selectedFile
                        ? selectedFile.name
                        : "Browse your device to select a JPG, JPEG, or PNG image."}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#d7e8cb] bg-white px-4 py-2.5 text-xs font-extrabold text-[#426b2b] shadow-sm transition group-hover:bg-[#eff8e7]">
                      <FileImage size={16} />
                      {selectedFile ? "Choose another image" : "Browse files"}
                    </span>

                    <input
                      id="mri-image-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setSelectedFile(file);
                        setSinglePrediction(null);
                        setError("");
                        setStatus("");
                      }}
                    />
                  </label>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-slate-500">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      JPG and PNG supported
                    </span>
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-emerald-600" />
                      Processed by your local backend
                    </span>
                  </div>

                  {error && (
                    <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <XCircle size={18} className="mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  {status && !error && !singlePrediction && (
                    <div role="status" className="mt-5 rounded-xl border border-[#dcebe4] bg-[#f5faf5] p-3 text-sm text-[#32694a]">
                      {status}
                    </div>
                  )}

                  <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#edf2ef] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md text-[11px] leading-5 text-slate-500">
                      Experimental research tool only. Results are not a medical diagnosis.
                    </p>

                    <button
                      type="button"
                      onClick={predictSingleImage}
                      disabled={!selectedFile || predictingSingle}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#b9f20d] px-7 py-3 text-sm font-extrabold text-[#193b28] shadow-sm transition hover:bg-[#a9e600] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#b9f20d]/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      {predictingSingle ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <Sparkles size={18} />
                      )}
                      {predictingSingle ? "Analyzing image..." : "Analyze MRI"}
                      {!predictingSingle && <ArrowRight size={17} />}
                    </button>
                  </div>
                </div>
              </section>

              {/* Prediction result */}
              {singlePrediction && (
                <section aria-live="polite" className="mt-6 overflow-hidden rounded-3xl border border-[#dce9e5] bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf2ef] px-5 py-5 sm:px-8">
                    <div>
                      <p className="text-[10px] font-extrabold tracking-[0.15em] text-[#548b36]">
                        ANALYSIS COMPLETE
                      </p>
                      <h2 className="mt-2 text-xl font-black text-[#173d37]">
                        Prediction Results
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        File: {singlePrediction.input_filename}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full bg-[#edf8df] px-3 py-2 text-xs font-bold text-[#426b2b]">
                      <CheckCircle2 size={15} />
                      Result available
                    </span>
                  </div>

                  <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[0.85fr_1.15fr]">
                    <div className="rounded-2xl border border-[#dcebe4] bg-[#f6faf7] p-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Predicted class
                      </p>

                      <h3 className="mt-3 text-2xl font-black leading-tight text-[#174b40]">
                        {readable(singlePrediction.predicted_class)}
                      </h3>

                      <div className="mt-5 space-y-3 border-t border-[#dcebe4] pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500">Model architecture</span>
                          <span className="text-right text-xs font-bold text-[#174b40]">
                            {singlePrediction.model}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs text-slate-500">Input image</span>
                          <span className="max-w-[65%] break-all text-right text-xs font-semibold text-slate-700">
                            {singlePrediction.input_filename}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500">Analysis status</span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Completed
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs leading-5 text-amber-900">
                          Experimental image classification only. This result is not a medical diagnosis.
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="mb-4">
                        <h3 className="text-base font-extrabold text-[#173d37]">
                          Individual image scores
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Scores returned by the model for this uploaded image.
                        </p>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                          <thead className="bg-[#f3f7f5] text-xs uppercase tracking-wide text-slate-600">
                            <tr>
                              <th scope="col" className="px-4 py-3 font-bold">Class</th>
                              <th scope="col" className="px-4 py-3 text-right font-bold">Score</th>
                              <th scope="col" className="px-4 py-3 text-center font-bold">Result</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {Object.entries(CLASSES).map(([key, label]) => {
                              const score = singlePrediction.scores?.[key] ?? 0;
                              const percentage = score * 100;
                              const isPredicted = key === singlePrediction.predicted_class;

                              return (
                                <tr
                                  key={key}
                                  className={isPredicted ? "bg-emerald-50/70" : "hover:bg-slate-50"}
                                >
                                  <th scope="row" className="px-4 py-3 font-semibold text-slate-700">
                                    {label}
                                  </th>
                                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums text-[#174b40]">
                                    {percentage.toFixed(2)}%
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {isPredicted ? (
                                      <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800">
                                        Predicted
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-400">?</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <p className="mt-3 text-[11px] leading-5 text-slate-500">
                        These scores are not calibrated clinical probabilities or measures of diagnostic certainty.
                      </p>
                    </div>
                  </div>

                  {/* Previously evaluated model performance; separate from the current image result. */}
                  <section className="border-t border-slate-100 px-5 py-6 sm:px-8">
                    <div className="mb-5">
                      <h3 className="text-lg font-black text-[#173d37]">
                        Model evaluation metrics
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Previously measured ViT-B/16 V2 performance on the experimental image-level test split.
                        These metrics are not calculated from the uploaded image.
                      </p>
                    </div>

                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#dcebe4] bg-[#f6faf7] p-5">
                        <p className="text-xs font-semibold text-slate-500">Test accuracy</p>
                        <p className="mt-2 text-3xl font-black tabular-nums text-[#174b40]">93.85%</p>
                        <p className="mt-1 text-[11px] text-slate-500">Experimental held-out test set</p>
                      </div>

                      <div className="rounded-xl border border-[#dcebe4] bg-[#f6faf7] p-5">
                        <p className="text-xs font-semibold text-slate-500">Macro F1-score</p>
                        <p className="mt-2 text-3xl font-black tabular-nums text-[#174b40]">90.19%</p>
                        <p className="mt-1 text-[11px] text-slate-500">Average F1 across four classes</p>
                      </div>
                    </div>

                    <h4 className="mb-3 text-sm font-extrabold text-[#173d37]">
                      Per-class evaluation
                    </h4>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                        <thead className="bg-[#f3f7f5] text-xs uppercase tracking-wide text-slate-600">
                          <tr>
                            <th scope="col" className="px-4 py-3 font-bold">Class</th>
                            <th scope="col" className="px-4 py-3 text-right font-bold">Precision</th>
                            <th scope="col" className="px-4 py-3 text-right font-bold">Recall</th>
                            <th scope="col" className="px-4 py-3 text-right font-bold">F1-score</th>
                            <th scope="col" className="px-4 py-3 text-right font-bold">Test support</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          <tr className="hover:bg-slate-50">
                            <th scope="row" className="px-4 py-3 font-semibold text-slate-700">Mild Demented</th>
                            <td className="px-4 py-3 text-right tabular-nums">98%</td>
                            <td className="px-4 py-3 text-right tabular-nums">89%</td>
                            <td className="px-4 py-3 text-right font-bold tabular-nums">93%</td>
                            <td className="px-4 py-3 text-right tabular-nums">135</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <th scope="row" className="px-4 py-3 font-semibold text-slate-700">Moderate Demented</th>
                            <td className="px-4 py-3 text-right tabular-nums">100%</td>
                            <td className="px-4 py-3 text-right tabular-nums">67%</td>
                            <td className="px-4 py-3 text-right font-bold tabular-nums">80%</td>
                            <td className="px-4 py-3 text-right tabular-nums">9</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <th scope="row" className="px-4 py-3 font-semibold text-slate-700">Non Demented</th>
                            <td className="px-4 py-3 text-right tabular-nums">95%</td>
                            <td className="px-4 py-3 text-right tabular-nums">95%</td>
                            <td className="px-4 py-3 text-right font-bold tabular-nums">95%</td>
                            <td className="px-4 py-3 text-right tabular-nums">480</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <th scope="row" className="px-4 py-3 font-semibold text-slate-700">Very Mild Demented</th>
                            <td className="px-4 py-3 text-right tabular-nums">91%</td>
                            <td className="px-4 py-3 text-right tabular-nums">94%</td>
                            <td className="px-4 py-3 text-right font-bold tabular-nums">92%</td>
                            <td className="px-4 py-3 text-right tabular-nums">336</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-bold text-amber-900">Evaluation limitations</p>
                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        These are experimental image-level evaluation results, not clinically validated diagnostic
                        performance. Patient-level independence has not been verified, and the Moderate Demented
                        test group contains only 9 images. Do not use these results for medical decisions.
                      </p>
                    </div>
                  </section>

                  <div className="mx-5 mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:mx-8 sm:mb-8">
                    <div className="flex items-start gap-3">
                      <Info size={18} className="mt-0.5 shrink-0 text-amber-700" />
                      <div>
                        <p className="text-xs font-extrabold text-amber-900">
                          Research disclaimer
                        </p>
                        <p className="mt-1 text-xs leading-5 text-amber-800">
                          These are experimental image-classification scores, not clinically validated diagnostic probabilities.
                          This result must not be used to diagnose or exclude Alzheimer’s disease.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] text-slate-400">
                <span>AlzheimerInsight · Research prototype</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  Not a clinical diagnostic system
                </span>
              </div>
            </div>
          </div>


          <footer className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500 lg:px-8">
            AlzheimerInsight · Research prototype · Not a clinical diagnostic system
          </footer>
        </section>
      </div>
    </main>
  );
}


