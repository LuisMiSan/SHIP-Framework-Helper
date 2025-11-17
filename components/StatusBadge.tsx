import React from 'react';
import { ProjectStatus } from '../types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const statusConfig = {
  pending: {
    text: 'Pendiente',
    classes: 'bg-slate-600 text-slate-200 border-slate-500',
  },
  success: {
    text: 'Éxito',
    classes: 'bg-green-800/80 text-green-200 border-green-700',
  },
  failed: {
    text: 'Falló',
    classes: 'bg-red-800/80 text-red-200 border-red-700',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${config.classes}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;