"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  MessageSquareText,
  BookOpen,
  Search,
  FileText,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";

export default function RAGExplanationPage() {
  const [question, setQuestion] = useState("");

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Model insights / Scientific explanations
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              RAG-Based Explanation
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Explore Alzheimer's research questions through retrieved scientific
              evidence and source-linked explanations.
            </p>
          </header>

          <div className="mx-auto max-w-[1150px] space-y-6 p-5 sm:p-8">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <Info className="mt-0.5 shrink-0 text-amber-700" size={19} />
              <p className="text-xs leading-6 text-amber-900">
                <strong>Knowledge retrieval is not connected yet.</strong> The
                interface is ready for integration, but it will not produce
                answers or citations until a document collection, retrieval
                pipeline, and answer-generation service are configured.
              </p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-teal-50 p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                  <MessageSquareText size={24} />
                </div>
                <h2 className="mt-5 text-xl font-extrabold tracking-tight">
                  Ask a research question
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Ask about MRI-derived features, cognitive assessments,
                  Alzheimer's classification research, or model explainability.
                </p>
              </div>

              <div className="p-5 sm:p-8">
                <label
                  htmlFor="research-question"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  Your question
                </label>

                <textarea
                  id="research-question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Example: What does published research say about combining MRI features with cognitive scores?"
                  rows={4}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />

                <button
                  disabled
                  className="mt-4 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-400 sm:w-auto sm:px-5"
                >
                  <Search size={16} />
                  Retrieve evidence and explain
                </button>

                <p className="mt-3 text-[10px] leading-5 text-slate-400">
                  {question.length} characters · Answers become available after
                  connecting the retrieval and generation pipeline.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                    <BookOpen size={21} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">Retrieved evidence</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Relevant scientific passages
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                  <FileText size={24} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-xs font-bold text-slate-600">
                    No documents retrieved
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    Connect scientific papers and a search index to display
                    supporting passages here.
                  </p>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
                    <MessageSquareText size={21} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">Research explanation</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Evidence-grounded response
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                  <BookOpen size={24} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-xs font-bold text-slate-600">
                    Waiting for evidence
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    The explanation will include references to the sources
                    retrieved for the question.
                  </p>
                </div>
              </article>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-sm font-extrabold">How this feature will work</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  ["01", "Retrieve", "Search relevant scientific documents."],
                  ["02", "Explain", "Generate an answer grounded in retrieved evidence."],
                  ["03", "Reference", "Show the sources used to support the answer."],
                ].map(([number, title, description]) => (
                  <div key={number} className="rounded-xl bg-slate-50 p-4">
                    <span className="text-[10px] font-extrabold tracking-widest text-indigo-600">
                      STEP {number}
                    </span>
                    <h3 className="mt-2 text-xs font-extrabold">{title}</h3>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-500">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              Scientific explanations provide research context. They do not
              establish a patient's diagnosis or replace professional medical review.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
