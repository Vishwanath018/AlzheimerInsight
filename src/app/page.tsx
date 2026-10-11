"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Bell,
  Brain,
  CalendarDays,
  ArrowRight,
  ScanLine,
  Microscope,
  MessageSquareText,
  ChartNoAxesCombined,
  UploadCloud,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "MRI Analysis",
    description: "Prepare brain scans for the imaging analysis pipeline.",
    href: "/mri-analysis",
    icon: ScanLine,
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    title: "Grad-CAM Visualization",
    description: "Explore image regions influencing model predictions.",
    href: "/gradcam",
    icon: Microscope,
    color: "bg-violet-50 text-violet-700",
  },
  {
    title: "RAG-Based Explanation",
    description: "Explore explanations grounded in scientific literature.",
    href: "/rag-explanation",
    icon: MessageSquareText,
    color: "bg-teal-50 text-teal-700",
  },
  {
    title: "Model Evaluation",
    description: "Review verified performance metrics and evaluation results.",
    href: "/model-evaluation",
    icon: ChartNoAxesCombined,
    color: "bg-sky-50 text-sky-700",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Workspace / Overview
              </p>
              <p className="mt-1 text-sm font-extrabold">AlzheimerInsight</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a feature..."
                className="hidden w-48 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none transition focus:border-indigo-300 focus:bg-white sm:block"
              />
              <button
                aria-label="Notifications"
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              >
                <Bell size={18} />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700">
                AR
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1450px] space-y-8 p-5 sm:p-8 xl:p-10">
            <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-[10px] font-bold text-teal-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  RESEARCH WORKSPACE
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                  Alzheimer's Research Dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Explore MRI-derived features, cognitive assessments, model
                  explanations, and scientific evidence in one workspace.
                </p>
              </div>

              <Link
                href="/mri-analysis"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-lg shadow-indigo-600/15 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                <UploadCloud size={17} />
                Start new analysis
              </Link>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "MRI scans analyzed",
                  value: "—",
                  note: "Awaiting backend connection",
                  icon: ScanLine,
                  tone: "bg-indigo-50 text-indigo-700",
                },
                {
                  title: "Multimodal analyses",
                  value: "—",
                  note: "MRI + cognitive assessment",
                  icon: Brain,
                  tone: "bg-teal-50 text-teal-700",
                },
                {
                  title: "Model performance",
                  value: "—",
                  note: "Evaluation not yet connected",
                  icon: ChartNoAxesCombined,
                  tone: "bg-sky-50 text-sky-700",
                },
                {
                  title: "System status",
                  value: "In progress",
                  note: "Research prototype",
                  icon: ShieldCheck,
                  tone: "bg-amber-50 text-amber-700",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-bold text-slate-600">{item.title}</p>
                      <div className={`rounded-xl p-2.5 ${item.tone}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <p className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      {item.note}
                    </p>
                  </article>
                );
              })}
            </section>

            <section>
              <div className="mb-5">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
                  Your research workflow
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Choose a workspace to continue.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {features
                  .filter((feature) =>
                    `${feature.title} ${feature.description}`
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  )
                  .map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <Link
                        key={feature.href}
                        href={feature.href}
                        className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg sm:p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className={`rounded-xl p-3 ${feature.color}`}>
                            <Icon size={22} />
                          </div>
                          <ArrowRight
                            size={18}
                            className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                          />
                        </div>
                        <h3 className="mt-5 text-sm font-extrabold text-slate-900">
                          {feature.title}
                        </h3>
                        <p className="mt-2 min-h-12 text-xs leading-6 text-slate-500">
                          {feature.description}
                        </p>
                        <p className="mt-4 text-[11px] font-bold text-indigo-700">
                          Open workspace →
                        </p>
                      </Link>
                    );
                  })}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
                    <CalendarDays size={21} />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold">Project progress</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Current development status
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["Frontend workspace", "Interface development"],
                    ["Pretrained MRI model", "Integration pending"],
                    ["Grad-CAM", "Model connection pending"],
                    ["RAG explanations", "Knowledge retrieval pending"],
                  ].map(([label, status]) => (
                    <div
                      key={label}
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                    >
                      <span className="text-xs font-semibold text-slate-700">{label}</span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                  <Brain size={23} />
                </div>
                <h2 className="mt-5 text-lg font-extrabold tracking-tight text-slate-950">
                  From brain imaging to evidence
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The planned workflow combines MRI-derived features with
                  cognitive scores, then provides model visualizations and
                  explanations supported by retrieved scientific literature.
                </p>
                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                  This is a research prototype. No diagnostic result is
                  available until the analysis pipeline is connected.
                </p>
              </article>
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-[10px] font-medium text-slate-400">
              <span>AlzheimerInsight · Research prototype</span>
              <span>For research use only</span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
