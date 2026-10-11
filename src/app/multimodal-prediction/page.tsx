import Sidebar from "@/components/Sidebar";
import { Construction } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />
        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white px-5 py-6 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              AlzheimerInsight / Workspace
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Multimodal Prediction</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Combine MRI-derived features and cognitive scores using the connected classification model.</p>
          </header>
          <div className="p-5 sm:p-8">
            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                <Construction size={25} />
              </div>
              <h2 className="mt-5 text-lg font-extrabold">Feature implementation in progress</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
                This workspace has been added to the application navigation. Its processing workflow will be implemented and connected to the backend next.
              </p>
              <p className="mt-5 text-xs font-semibold text-amber-700">
                No analysis results are available on this page yet.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
