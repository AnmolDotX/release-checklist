import React from 'react';
import { Release } from '../types/release';
import { formatDateDisplay, computeStatus } from '../utils/formatters';
import ReleaseStatusBadge from './ReleaseStatusBadge';

interface ReleaseListProps {
  releases: Release[];
  totalStepsCount: number;
  onOpenCreate: () => void;
  onOpenDetail: (release: Release) => void;
  onRequestDelete: (id: number) => void;
}

export default function ReleaseList({
  releases,
  totalStepsCount,
  onOpenCreate,
  onOpenDetail,
  onRequestDelete
}: ReleaseListProps) {
  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-200">
        <span className="text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 pb-0.5">
          All releases
        </span>
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          New release <span className="text-base leading-none">+</span>
        </button>
      </div>

      {/* Releases Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-700 text-xs font-bold bg-slate-50/30">
              <th className="py-3.5 px-6">Release</th>
              <th className="py-3.5 px-6">Date</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-center w-24">View</th>
              <th className="py-3.5 px-6 text-center w-24">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-800">
            {releases.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No releases found. Click &quot;New release +&quot; to create one.
                </td>
              </tr>
            ) : (
              releases.map(rel => {
                const status = computeStatus(rel.completed_steps || [], totalStepsCount);
                return (
                  <tr key={rel.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{rel.name}</td>
                    <td className="py-4 px-6 text-slate-600">{formatDateDisplay(rel.due_date)}</td>
                    <td className="py-4 px-6">
                      <ReleaseStatusBadge status={status} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => onOpenDetail(rel)}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-600 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        View
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => onRequestDelete(rel.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Delete
                        <svg className="w-4 h-4 text-slate-500 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
