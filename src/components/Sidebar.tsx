"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Brain,
  ChartNoAxesCombined,
  FileText,
  LayoutDashboard,
  Microscope,
  ScanLine,
  Settings,
  MessageSquareText,
  ClipboardList,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const groups = [
  {
    heading: "WORKSPACE",
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "MRI Analysis", href: "/mri-analysis", icon: ScanLine },
      { label: "Cognitive Assessment", href: "/cognitive-assessment", icon: ClipboardList },
      { label: "Multimodal Prediction", href: "/multimodal-prediction", icon: Brain },
    ],
  },
  {
    heading: "ANALYSIS & INSIGHTS",
    items: [
      { label: "Grad-CAM Visualization", href: "/gradcam", icon: Microscope },
      { label: "RAG-Based Explanation", href: "/rag-explanation", icon: MessageSquareText },
      { label: "Model Evaluation", href: "/model-evaluation", icon: ChartNoAxesCombined },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[285px] shrink-0 flex-col border-r border-slate-200 bg-white p-4 xl:p-5 lg:flex">

      {/* Brand */}
      <Link
        href="/"
        className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-indigo-100 hover:bg-slate-50/70"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-600/25">
          <Brain size={26} strokeWidth={2.3} />
        </div>

        <div className="min-w-0">
          <h1 className="text-[16px] font-black tracking-[-0.04em] text-slate-950">
            AlzheimerInsight
          </h1>
          <p className="mt-1 text-[9px] font-extrabold tracking-[0.16em] text-indigo-600">
            RESEARCH PLATFORM
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="mt-7 flex-1 space-y-6 overflow-y-auto pr-1">
        {groups.map((group) => (
          <section key={group.heading}>
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black tracking-[0.17em] text-slate-400">
                {group.heading}
              </h2>
              <span className="h-px w-8 bg-slate-200" />
            </div>

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-[47px] items-center gap-3 overflow-hidden rounded-xl border px-3 transition-all duration-200 ${
                      active
                        ? "border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/60"
                        : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    {active && (
                      <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-indigo-600" />
                    )}

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                        active
                          ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                          : "bg-slate-100/80 text-slate-500 group-hover:bg-white group-hover:text-indigo-600"
                      }`}
                    >
                      <Icon size={17} strokeWidth={active ? 2.4 : 2} />
                    </span>

                    <span
                      className={`min-w-0 flex-1 text-[11px] leading-5 ${
                        active ? "font-extrabold" : "font-semibold"
                      }`}
                    >
                      {item.label}
                    </span>

                    {active ? (
                      <ChevronRight
                        size={15}
                        strokeWidth={2.5}
                        className="shrink-0 text-indigo-500"
                      />
                    ) : (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-transparent transition group-hover:bg-slate-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      {/* Research environment card */}
      <div className="mt-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Activity size={18} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <h3 className="text-[11px] font-extrabold text-slate-900">
              Research environment
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-[9px] font-bold text-amber-700">
                Integration in progress
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[10px] leading-[1.8] text-slate-600">
          MRI processing, model evaluation, and evidence-based explanations
          will become available as their services are connected.
        </p>

        <div className="mt-3 flex items-center gap-2 border-t border-indigo-100 pt-3">
          <ShieldCheck size={14} className="shrink-0 text-indigo-600" />
          <span className="text-[9px] font-semibold text-slate-500">
            Research use only
          </span>
        </div>
      </div>

      {/* Settings */}
      <Link
        href="/settings"
        className={`mt-3 flex min-h-[44px] items-center gap-3 rounded-xl border px-3 transition ${
          pathname === "/settings"
            ? "border-indigo-100 bg-indigo-50 text-indigo-700"
            : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
        }`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Settings size={17} />
        </span>
        <span className="flex-1 text-[11px] font-bold">Settings</span>
        <ChevronRight size={14} className="text-slate-400" />
      </Link>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 px-2 pt-3">
        <span className="text-[9px] font-semibold text-slate-400">
          ALZHEIMERINSIGHT
        </span>
        <span className="text-[9px] font-medium text-slate-400">
          v1.0
        </span>
      </div>
    </aside>
  );
}
