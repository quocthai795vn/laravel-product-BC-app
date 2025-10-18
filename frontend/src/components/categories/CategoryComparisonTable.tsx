'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Input, Tag, Modal } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import StatusBadge from '../shared/StatusBadge';
import { CategoryWithStatus, UpdatedCategory, CategoryChange } from '@/types/category';

interface CategoryComparisonTableProps {
  data: (CategoryWithStatus | UpdatedCategory)[];
  loading?: boolean;
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: any[]) => void;
}

export default function CategoryComparisonTable({
  data,
  loading,
  onSelectionChange,
}: CategoryComparisonTableProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [diffModalVisible, setDiffModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<UpdatedCategory | null>(null);
  const [pageSize, setPageSize] = useState(10);

  const handleShowDiff = (record: UpdatedCategory) => {
    setSelectedCategory(record);
    setDiffModalVisible(true);
  };

  // Filter data based on search
  const filteredData = data.filter(record =>
    record.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<any> = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status as any} />,
      filters: [
        { text: 'New', value: 'missing' },
        { text: 'Changed', value: 'updated' },
        { text: 'Unchanged', value: 'unchanged' },
        { text: 'Deleted', value: 'deleted' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'updated' && record.changes && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleShowDiff(record)}
            >
              View Diff
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRowKeys(selectedRowKeys);
      if (onSelectionChange) {
        onSelectionChange(selectedRowKeys, selectedRows);
      }
    },
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search categories..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record.id || record.target_id || Math.random()}
        loading={loading}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} categories`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onShowSizeChange: (current, size) => setPageSize(size),
        }}
      />

      <Modal
        title="Category Changes"
        open={diffModalVisible}
        onCancel={() => setDiffModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDiffModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedCategory && (
          <div>
            <h3 style={{ marginTop: 0 }}>{selectedCategory.name}</h3>
            <p><strong>Path:</strong> {selectedCategory.path}</p>

            <h4>Changes:</h4>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {selectedCategory.changes?.map((change: CategoryChange, index: number) => (
                <div key={index} style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  <Tag color="blue">{change.field}</Tag>
                  <div style={{ marginTop: 8 }}>
                    <div>
                      <strong>Source:</strong>
                      <pre style={{
                        background: '#e6f7ff',
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 4,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%',
                        overflow: 'auto'
                      }}>
                        {typeof change.source_value === 'object'
                          ? JSON.stringify(change.source_value, null, 2)
                          : change.source_value || '(empty)'}
                      </pre>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <strong>Target:</strong>
                      <pre style={{
                        background: '#fff7e6',
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 4,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%',
                        overflow: 'auto'
                      }}>
                        {typeof change.target_value === 'object'
                          ? JSON.stringify(change.target_value, null, 2)
                          : change.target_value || '(empty)'}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
