import React from 'react';
import { Release, Step } from '../types/release';

interface ReleaseFormProps {
  selectedRelease: Release | null;
  steps: Step[];
  formName: string;
  setFormName: (val: string) => void;
  formDueDate: string;
  setFormDueDate: (val: string) => void;
  formAdditionalInfo: string;
  setFormAdditionalInfo: (val: string) => void;
  formCompletedSteps: string[];
  onToggleStep: (stepId: string) => void;
  onBackToList: () => void;
  onSave: () => void;
  onRequestDelete?: (id: number) => void;
  isSaving?: boolean;
}

export default function ReleaseForm({
  selectedRelease,
  steps,
  formName,
  setFormName,
  formDueDate,
  setFormDueDate,
  formAdditionalInfo,
  setFormAdditionalInfo,
  formCompletedSteps,
  onToggleStep,
  onBackToList,
  onSave,
  onRequestDelete,
  isSaving
}: ReleaseFormProps) {
  return (
    <div>
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={onBackToList}
            className="font-medium text-indigo-600 hover:underline cursor-pointer"
          >
            All releases
          </button>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-500 font-medium">
            {selectedRelease ? selectedRelease.name : 'New Release'}
          </span>
        </div>

        {selectedRelease && onRequestDelete && (
          <button
            onClick={() => onRequestDelete(selectedRelease.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Delete
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Form Content */}
      <div className="p-8 space-y-6">
        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Release</label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Version 1.0.1"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={formDueDate}
              onChange={e => setFormDueDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Checklist steps */}
        <div className="pt-2">
          <div className="space-y-3">
            {steps.map(step => {
              const isChecked = formCompletedSteps.includes(step.id);
              return (
                <label
                  key={step.id}
                  className="flex items-center gap-3 cursor-pointer group text-sm text-slate-700 select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleStep(step.id)}
                    className="w-4 h-4 text-indigo-600 rounded-xs border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <span className={`group-hover:text-slate-900 ${isChecked ? 'text-slate-900 font-medium' : ''}`}>
                    {step.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Additional remarks / tasks */}
        <div className="pt-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Additional remarks / tasks
          </label>
          <textarea
            rows={4}
            value={formAdditionalInfo}
            onChange={e => setFormAdditionalInfo(e.target.value)}
            placeholder="Please enter any other important notes for the release"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500 resize-y"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end pt-4">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}
