'use client';

import React from 'react';
import { Modal, Descriptions, Tag, Timeline } from 'antd';
import { MigrationLog, MigrationDetail } from '@/types/migration';
import StatusBadge from '../shared/StatusBadge';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

interface MigrationLogViewerProps {
  log: MigrationLog | null;
  visible: boolean;
  onClose: () => void;
}

export default function MigrationLogViewer({
  log,
  visible,
  onClose,
}: MigrationLogViewerProps) {
  if (!log) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
      case 'updated':
      case 'deleted':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'skipped':
        return <MinusCircleOutlined style={{ color: '#d9d9d9' }} />;
      default:
        return <SyncOutlined />;
    }
  };

  return (
    <Modal
      title="Migration Log Details"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Migration ID">{log.id}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <StatusBadge status={log.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Source Store">
          {log.source_store?.name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Target Store">
          {log.target_store?.name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Categories Count">
          {log.categories_count}
        </Descriptions.Item>
        <Descriptions.Item label="Duration">
          {log.duration_formatted || `${log.duration}s`}
        </Descriptions.Item>
        <Descriptions.Item label="Started At">
          {log.started_at
            ? new Date(log.started_at).toLocaleString()
            : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Completed At">
          {log.completed_at
            ? new Date(log.completed_at).toLocaleString()
            : 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      {log.results && (
        <div style={{ marginTop: 24 }}>
          <h4>Results</h4>
          <div>
            <Tag color="success">Created: {log.results.created}</Tag>
            <Tag color="warning">Updated: {log.results.updated}</Tag>
            {log.results.deleted !== undefined && (
              <Tag color="error">Deleted: {log.results.deleted}</Tag>
            )}
            <Tag color="default">Skipped: {log.results.skipped}</Tag>
            <Tag color="error">Failed: {log.results.failed}</Tag>
          </div>
        </div>
      )}

      {log.error_message && (
        <div style={{ marginTop: 24 }}>
          <h4>Error Message</h4>
          <pre style={{ background: '#fff2f0', padding: 12, borderRadius: 4 }}>
            {log.error_message}
          </pre>
        </div>
      )}

      {log.details && log.details.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4>Detailed Log</h4>
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            <Timeline
              items={log.details.map((detail: MigrationDetail) => ({
                dot: getStatusIcon(detail.status),
                children: (
                  <div>
                    <strong>[{detail.status.toUpperCase()}]</strong>{' '}
                    {detail.category_name}
                    {detail.old_category_id && (
                      <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                        {' '}
                        (Old ID: {detail.old_category_id}
                        {detail.new_category_id &&
                          ` → New ID: ${detail.new_category_id}`}
                        )
                      </span>
                    )}
                    {detail.error && (
                      <div style={{ color: '#ff4d4f', marginTop: 4 }}>
                        Error: {detail.error}
                      </div>
                    )}
                  </div>
                ),
              }))}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
