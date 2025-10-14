import React from 'react';
import { ProjectStatus } from '../types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const statusConfig = {
  pending: {
    text: 'Pendiente',
    classes: 'bg-slate-100 text-slate-600 border-slate-300',
  },
  success: {
    text: 'Éxito',
    classes: 'bg-green-100 text-green-700 border-green-300',
  },
  failed: {
    text: 'Falló',
    classes: 'bg-red-100 text-red-700 border-red-300',
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
