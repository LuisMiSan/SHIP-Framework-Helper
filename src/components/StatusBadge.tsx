import React from 'react';
import { ProjectStatus } from '../types';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const px = size === 'sm' ? 'px-2' : 'px-2.5';
  const py = size === 'sm' ? 'py-0.5' : 'py-0.5';
  const text = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className={`${getStatusColor(status)} ${px} ${py} ${text} font-medium rounded-full border`}>
      {status}
    </span>
  );
};

export default StatusBadge;
