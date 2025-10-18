import React from 'react';
import { Tag } from 'antd';

type StatusType = 'missing' | 'deleted' | 'updated' | 'unchanged' | 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial' | 'created' | 'skipped';

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { color: string; text: string }> = {
  missing: { color: 'blue', text: 'New' },
  deleted: { color: 'red', text: 'Deleted' },
  updated: { color: 'orange', text: 'Changed' },
  unchanged: { color: 'green', text: 'Unchanged' },
  pending: { color: 'default', text: 'Pending' },
  in_progress: { color: 'processing', text: 'In Progress' },
  completed: { color: 'success', text: 'Completed' },
  failed: { color: 'error', text: 'Failed' },
  partial: { color: 'warning', text: 'Partial' },
  created: { color: 'success', text: 'Created' },
  skipped: { color: 'default', text: 'Skipped' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: 'default', text: status };

  return <Tag color={config.color}>{config.text}</Tag>;
}
