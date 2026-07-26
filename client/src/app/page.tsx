'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import Toast from '../components/Toast';
import ReleaseList from '../components/ReleaseList';
import ReleaseForm from '../components/ReleaseForm';
import DeleteModal from '../components/DeleteModal';
import {
  useReleasesQuery,
  useStepsQuery,
  useCreateReleaseMutation,
  useUpdateReleaseMutation,
  useDeleteReleaseMutation
} from '../hooks/useReleases';
import { formatDateInput } from '../utils/formatters';
import { Release } from '../types/release';

export default function Home() {
  const { data: releases = [], isLoading: isLoadingReleases } = useReleasesQuery();
  const { data: steps = [] } = useStepsQuery();

  const createMutation = useCreateReleaseMutation();
  const updateMutation = useUpdateReleaseMutation();
  const deleteMutation = useDeleteReleaseMutation();

  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);

  // Form local states
  const [formName, setFormName] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAdditionalInfo, setFormAdditionalInfo] = useState('');
  const [formCompletedSteps, setFormCompletedSteps] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenCreate = () => {
    setSelectedRelease(null);
    setFormName('');
    const today = new Date().toISOString().split('T')[0];
    setFormDueDate(today);
    setFormAdditionalInfo('');
    setFormCompletedSteps([]);
    setCurrentView('create');
  };

  const handleOpenDetail = (release: Release) => {
    setSelectedRelease(release);
    setFormName(release.name);
    setFormDueDate(formatDateInput(release.due_date));
    setFormAdditionalInfo(release.additional_info || '');
    setFormCompletedSteps(release.completed_steps || []);
    setCurrentView('detail');
  };

  const handleToggleStep = (stepId: string) => {
    if (formCompletedSteps.includes(stepId)) {
      setFormCompletedSteps(formCompletedSteps.filter(id => id !== stepId));
    } else {
      setFormCompletedSteps([...formCompletedSteps, stepId]);
    }
  };

  const handleSave = () => {
    if (!formName.trim()) {
      showNotification('Please enter a release name.', 'error');
      return;
    }
    if (!formDueDate) {
      showNotification('Please select a due date.', 'error');
      return;
    }

    const payload = {
      name: formName.trim(),
      due_date: formDueDate,
      additional_info: formAdditionalInfo,
      completed_steps: formCompletedSteps
    };

    if (selectedRelease) {
      updateMutation.mutate(
        { id: selectedRelease.id, input: payload },
        {
          onSuccess: (updated) => {
            setSelectedRelease(updated);
            showNotification('Release updated successfully!');
            setCurrentView('list');
          },
          onError: () => {
            showNotification('Failed to update release.', 'error');
          }
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          showNotification('Release created successfully!');
          setCurrentView('list');
        },
        onError: () => {
          showNotification('Failed to create release.', 'error');
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId === null) return;
    deleteMutation.mutate(deleteConfirmId, {
      onSuccess: () => {
        showNotification('Release deleted.');
        setDeleteConfirmId(null);
        if (selectedRelease?.id === deleteConfirmId) {
          setSelectedRelease(null);
          setCurrentView('list');
        }
      },
      onError: () => {
        showNotification('Failed to delete release.', 'error');
      }
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      <Toast notification={notification} />
      <Header />

      {/* Container Card */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoadingReleases ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading releases...</div>
        ) : currentView === 'list' ? (
          <ReleaseList
            releases={releases}
            totalStepsCount={steps.length}
            onOpenCreate={handleOpenCreate}
            onOpenDetail={handleOpenDetail}
            onRequestDelete={(id) => setDeleteConfirmId(id)}
          />
        ) : (
          <ReleaseForm
            selectedRelease={selectedRelease}
            steps={steps}
            formName={formName}
            setFormName={setFormName}
            formDueDate={formDueDate}
            setFormDueDate={setFormDueDate}
            formAdditionalInfo={formAdditionalInfo}
            setFormAdditionalInfo={setFormAdditionalInfo}
            formCompletedSteps={formCompletedSteps}
            onToggleStep={handleToggleStep}
            onBackToList={() => setCurrentView('list')}
            onSave={handleSave}
            onRequestDelete={(id) => setDeleteConfirmId(id)}
            isSaving={isSaving}
          />
        )}
      </div>

      <DeleteModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
