import React from 'react';
import { ReleaseStatus } from '../types/release';

interface ReleaseStatusBadgeProps {
  status: ReleaseStatus;
}

export default function ReleaseStatusBadge({ status }: ReleaseStatusBadgeProps) {
  const badgeClass =
    status === 'done'
      ? 'badge-done'
      : status === 'ongoing'
      ? 'badge-ongoing'
      : 'badge-planned';

  const label = status === 'done' ? 'Done' : status === 'ongoing' ? 'Ongoing' : 'Planned';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${badgeClass}`}>
      {label}
    </span>
  );
}
