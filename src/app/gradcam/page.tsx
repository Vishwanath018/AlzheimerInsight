"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Microscope,
  UploadCloud,
  Image as ImageIcon,
  Layers3,
  Info,
  ShieldCheck,
} from "lucide-react";

export default function GradCAMPage() {
  const [fileName, setFileName] = useState("");
  const [view, setView] = useState("overlay");

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Model insights / Grad-CAM
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Grad-CAM Visualization
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Explore image regions that influence a supported model's output.
            </p>
          </header>

          <div className="mx-auto max-w-[1400px] space-y-6 p-5 sm:p-8">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <Info className="mt-0.5 shrink-0 text-amber-700" size={19} />
              <p className="text-xs leading-6 text-amber-900">
                <strong>Model connection required.</strong> This page is the
                visualization interface. It does not generate real Grad-CAM
                heatmaps until the model, MRI preprocessing, and gradient
                calculation are integrated.
              </p>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                  <Microscope size={23} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Select an MRI scan</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose a scan for the future visualization pipeline.
                  </p>
                </div>
              </div>

              <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30">
                <UploadCloud size={27} className="text-indigo-600" />
                <span className="mt-3 text-sm font-bold text-slate-800">
                  {fileName || "Choose an MRI file"}
                </span>
                <span className="mt-2 text-xs text-slate-500">
                  NIfTI (.nii), compressed NIfTI (.nii.gz), or DICOM (.dcm)
                </span>
                <input
                  type="file"
                  accept=".nii,.gz,.dcm"
                  className="hidden"
                  onChange={(event) =>
                    setFileName(event.target.files?.[0]?.name || "")
                  }
                />
              </label>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Model
                  </label>
                  <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-indigo-400">
                    <option>Pretrained model — integration pending</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Visualization
                  </label>
                  <select
                    value={view}
                    onChange={(event) => setView(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-indigo-400"
                  >
                    <option value="overlay">MRI + heatmap overlay</option>
                    <option value="heatmap">Heatmap view</option>
                    <option value="original">Original MRI</option>
                  </select>
                </div>
              </div>

              <button
                disabled
                className="mt-5 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-400"
              >
                <Layers3 size={17} />
                Generate Grad-CAM — model integration pending
              </button>
            </section>

            <section>
              <h2 className="text-base font-extrabold">Visualization workspace</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                The real MRI, heatmap, and overlay will appear here after inference.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {[
                  ["Original MRI", "The selected image slice"],
                  ["Grad-CAM heatmap", "Model-derived activation map"],
                  ["Combined overlay", "MRI and activation map together"],
                ].map(([title, description]) => (
                  <article
                    key={title}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold">{title}</h3>
                      <ImageIcon size={17} className="text-slate-400" />
                    </div>
                    <div className="mt-4 flex aspect-square max-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                      <Microscope size={29} className="text-slate-300" />
                      <p className="mt-3 text-xs font-bold text-slate-500">
                        No visualization yet
                      </p>
                      <p className="mt-2 text-[10px] leading-5 text-slate-400">
                        {description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-500">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              Grad-CAM highlights model-relevant regions; it does not independently
              establish a diagnosis or prove that a highlighted region is medically causal.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
