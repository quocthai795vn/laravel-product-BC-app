'use client';

import React from 'react';
import { Card, Progress, Space, Typography, Tag, Alert } from 'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { MigrationResults, MigrationDetail } from '@/types/migration';

const { Title, Text } = Typography;

interface MigrationProgressProps {
  progress?: number;
  results: MigrationResults;
  details?: MigrationDetail[];
  currentCategory?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';
}

export default function MigrationProgress({
  progress = 0,
  results,
  details = [],
  currentCategory,
  status = 'in_progress',
}: MigrationProgressProps) {
  const getStatusIcon = (detailStatus: string) => {
    switch (detailStatus) {
      case 'created':
      case 'updated':
      case 'deleted':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'skipped':
        return <MinusCircleOutlined style={{ color: '#d9d9d9' }} />;
      default:
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>Migration Progress</Title>
            {currentCategory && status === 'in_progress' && (
              <Text type="secondary">
                <SyncOutlined spin /> Processing: {currentCategory}
              </Text>
            )}
          </div>

          <Progress
            percent={progress}
            status={
              status === 'completed'
                ? 'success'
                : status === 'failed'
                ? 'exception'
                : 'active'
            }
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />

          <Space size="large">
            <div>
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Created: {results.created}
              </Tag>
            </div>
            <div>
              <Tag color="warning" icon={<SyncOutlined />}>
                Updated: {results.updated}
              </Tag>
            </div>
            {results.deleted !== undefined && (
              <div>
                <Tag color="error" icon={<DeleteOutlined />}>
                  Deleted: {results.deleted}
                </Tag>
              </div>
            )}
            <div>
              <Tag color="default" icon={<MinusCircleOutlined />}>
                Skipped: {results.skipped}
              </Tag>
            </div>
            <div>
              <Tag color="error" icon={<CloseCircleOutlined />}>
                Failed: {results.failed}
              </Tag>
            </div>
          </Space>

          {results.failed > 0 && (
            <Alert
              message="Some operations failed"
              description="Check the log details below for error information."
              type="warning"
              showIcon
            />
          )}
        </Space>
      </Card>

      {details.length > 0 && (
        <Card title="Migration Log" style={{ marginTop: 16 }}>
          <div
            style={{
              maxHeight: 400,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            {details.map((detail, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 8px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Space>
                  {getStatusIcon(detail.status)}
                  <Text strong>[{detail.status.toUpperCase()}]</Text>
                  <Text>{detail.category_name}</Text>
                  {detail.old_category_id && (
                    <Text type="secondary">
                      (Old ID: {detail.old_category_id}
                      {detail.new_category_id && ` → New ID: ${detail.new_category_id}`})
                    </Text>
                  )}
                  {detail.error && (
                    <Text type="danger"> - Error: {detail.error}</Text>
                  )}
                </Space>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
