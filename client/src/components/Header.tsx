import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <div className="text-center mb-8 relative w-full max-w-4xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2 px-2">
        <div></div>
        <Link
          href="/health"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Health Check
        </Link>
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">ReleaseCheck</h1>
      <p className="text-sm text-slate-500 mt-1">Your all-in-one release checklist tool</p>
    </div>
  );
}
