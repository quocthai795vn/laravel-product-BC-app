'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Table, Button, Space, Select, Divider } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import StatusBadge from '../shared/StatusBadge';
import MigrationLogViewer from './MigrationLogViewer';
import { useMigration } from '@/hooks';
import { MigrationLog, MigrationStatusFilter } from '@/types/migration';

const { Title, Text } = Typography;
const { Option } = Select;

interface StepLogsProps {
  onPrevious?: () => void;
}

export default function StepLogs({ onPrevious }: StepLogsProps) {
  const { logs, pagination, loading, fetchLogs, fetchLog } = useMigration();
  const [selectedLog, setSelectedLog] = useState<MigrationLog | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MigrationStatusFilter>('all');

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadLogs = (page = 1) => {
    const params: any = { page, per_page: 15 };
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    fetchLogs(params);
  };

  const handleViewLog = async (record: MigrationLog) => {
    try {
      const log = await fetchLog(record.id);
      setSelectedLog(log);
      setModalVisible(true);
    } catch {
      // Error handled in hook
    }
  };

  const columns: ColumnsType<MigrationLog> = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
      width: 180,
    },
    {
      title: 'Source Store',
      dataIndex: ['source_store', 'name'],
      key: 'source_store',
    },
    {
      title: 'Target Store',
      dataIndex: ['target_store', 'name'],
      key: 'target_store',
    },
    {
      title: 'Categories',
      dataIndex: 'categories_count',
      key: 'categories_count',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status as any} />,
      width: 120,
    },
    {
      title: 'Duration',
      dataIndex: 'duration_formatted',
      key: 'duration',
      render: (duration: string | undefined, record: MigrationLog) =>
        duration || (record.duration ? `${record.duration}s` : 'N/A'),
      width: 100,
    },
    {
      title: 'Results',
      key: 'results',
      render: (_, record: MigrationLog) => {
        if (!record.results) return 'N/A';
        return (
          <Space size="small">
            <Text type="success">✓ {record.results.created}</Text>
            <Text type="warning">↻ {record.results.updated}</Text>
            {record.results.failed > 0 && (
              <Text type="danger">✗ {record.results.failed}</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: MigrationLog) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewLog(record)}
        >
          View
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <div>
      <Title level={3}>Migration Logs</Title>
      <Text type="secondary">
        View history of all category migration operations.
      </Text>

      <Divider />

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button size="large" onClick={onPrevious}>
          Previous
        </Button>

        <Space>
          <Text strong>Filter by Status:</Text>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All</Option>
            <Option value="completed">Completed</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="failed">Failed</Option>
            <Option value="partial">Partial</Option>
          </Select>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadLogs(pagination.current_page)}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current_page,
          pageSize: pagination.per_page,
          total: pagination.total,
          showSizeChanger: false,
          onChange: (page) => loadLogs(page),
        }}
      />

      <MigrationLogViewer
        log={selectedLog}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
}
