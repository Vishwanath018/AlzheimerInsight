"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileImage,
  FileText,
  Info,
  ShieldCheck,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";

type SelectedMRI = {
  file: File;
  valid: boolean;
  message: string;
};

export default function MRIAnalysisPage() {
  const [selectedMRI, setSelectedMRI] = useState<SelectedMRI | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File) {
    const name = file.name.toLowerCase();

    const supported =
      name.endsWith(".nii") ||
      name.endsWith(".nii.gz") ||
      name.endsWith(".dcm") ||
      name.endsWith(".zip");

    if (!supported) {
      setSelectedMRI({
        file,
        valid: false,
        message: "Unsupported file type. Select a NIfTI, DICOM, or ZIP file.",
      });
      return;
    }

    if (file.size === 0) {
      setSelectedMRI({
        file,
        valid: false,
        message: "This file is empty. Please select another file.",
      });
      return;
    }

    setSelectedMRI({
      file,
      valid: true,
      message:
        "File format accepted by the interface. MRI preprocessing has not run yet.",
    });
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white px-5 py-6 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace / MRI analysis
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  MRI Analysis
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Prepare a brain MRI scan for the imaging and multimodal
                  classification workflow.
                </p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Model connection pending
              </span>
            </div>
          </header>

          <div className="mx-auto max-w-[1350px] space-y-6 p-5 sm:p-8">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Select MRI",
                  description: "Choose a supported brain scan.",
                  active: true,
                },
                {
                  number: "02",
                  title: "Preprocessing",
                  description: "Prepare the scan for model input.",
                  active: false,
                },
                {
                  number: "03",
                  title: "Feature extraction",
                  description: "Extract model-compatible features.",
                  active: false,
                },
              ].map((step) => (
                <article
                  key={step.number}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    step.active
                      ? "border-indigo-200 bg-white shadow-sm"
                      : "border-slate-200 bg-white/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold ${
                        step.active
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {step.number}
                    </div>
                    <div>
                      <h2 className="text-xs font-extrabold">{step.title}</h2>
                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 xl:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <Brain size={23} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold">
                      Upload brain MRI
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Select the scan you want to prepare for analysis.
                    </p>
                  </div>
                </div>

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);

                    const file = event.dataTransfer.files?.[0];

                    if (file) {
                      validateFile(file);
                    }
                  }}
                  onClick={() => inputRef.current?.click()}
                  className={`mt-7 flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-10 ${
                    dragging
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-300 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/40"
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
                    <UploadCloud size={27} />
                  </div>

                  <h3 className="mt-5 text-sm font-extrabold text-slate-900">
                    Drop your MRI file here
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Or click to browse files on your computer
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {[".nii", ".nii.gz", ".dcm", ".zip"].map((extension) => (
                      <span
                        key={extension}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600"
                      >
                        {extension}
                      </span>
                    ))}
                  </div>

                  <input
                    ref={inputRef}
                    type="file"
                    accept=".nii,.gz,.dcm,.zip"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        validateFile(file);
                      }

                      event.currentTarget.value = "";
                    }}
                  />
                </div>

                {selectedMRI && (
                  <div
                    className={`mt-5 rounded-xl border p-4 ${
                      selectedMRI.valid
                        ? "border-teal-200 bg-teal-50/70"
                        : "border-rose-200 bg-rose-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-white p-2">
                        {selectedMRI.valid ? (
                          <FileImage size={20} className="text-teal-700" />
                        ) : (
                          <XCircle size={20} className="text-rose-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-all text-xs font-extrabold text-slate-900">
                          {selectedMRI.file.name}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {formatSize(selectedMRI.file.size)}
                        </p>
                        <p
                          className={`mt-2 text-[11px] leading-5 ${
                            selectedMRI.valid
                              ? "text-teal-800"
                              : "text-rose-700"
                          }`}
                        >
                          {selectedMRI.message}
                        </p>
                      </div>

                      <button
                        aria-label="Remove selected file"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedMRI(null);
                        }}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <Info size={18} className="mt-0.5 shrink-0 text-indigo-600" />
                  <p className="text-[11px] leading-6 text-slate-600">
                    Selecting a file does not upload or process it. The actual
                    analysis will be enabled after the backend and pretrained
                    model are integrated.
                  </p>
                </div>
              </article>

              <aside className="space-y-5">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-extrabold">Before you begin</h2>

                  <div className="mt-5 space-y-4">
                    {[
                      "Use an MRI scan from your authorized research dataset.",
                      "Confirm that the file matches the selected model's input requirements.",
                      "Ensure the scan can be mapped to the correct participant and assessment.",
                    ].map((text, index) => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[10px] font-extrabold text-indigo-700">
                          {index + 1}
                        </span>
                        <p className="text-[11px] leading-6 text-slate-600">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-indigo-700" />
                    <h2 className="text-xs font-extrabold">Research data</h2>
                  </div>

                  <p className="mt-3 text-[11px] leading-6 text-slate-600">
                    MRI scans can contain sensitive information. Use
                    authorized data and avoid including personal identifiers
                    in filenames.
                  </p>
                </article>

                <Link
                  href="/cognitive-assessment"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div>
                    <p className="text-xs font-extrabold">
                      Next: Cognitive Assessment
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                      Prepare the second model input.
                    </p>
                  </div>
                  <ArrowRight size={19} className="text-indigo-600" />
                </Link>
              </aside>
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-[10px] font-medium text-slate-400">
              <span>AlzheimerInsight · MRI workspace</span>
              <span className="inline-flex items-center gap-1.5">
                <FileText size={12} />
                Interface validation only
              </span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
