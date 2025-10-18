'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Button, Select, Space, Divider, message } from 'antd';
import StatsCard from '../shared/StatsCard';
import CategoryComparisonTable from './CategoryComparisonTable';
import LoadingState from '../shared/LoadingState';
import { useStores, useCategories } from '@/hooks';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface StepCompareProps {
  onNext?: (data: any) => void;
  onPrevious?: () => void;
}

export default function StepCompare({ onNext, onPrevious }: StepCompareProps) {
  const { stores, fetchStores } = useStores();
  const { comparison, compareCategories, loading } = useCategories();
  const [sourceStoreId, setSourceStoreId] = useState<number | null>(null);
  const [targetStoreId, setTargetStoreId] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing' | 'updated' | 'deleted'>('all');

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sourceStores = stores.filter(s => s.type === 'source');
  const targetStores = stores.filter(s => s.type === 'target');

  const handleCompare = async () => {
    if (!sourceStoreId || !targetStoreId) {
      message.error('Please select both source and target stores');
      return;
    }

    try {
      await compareCategories({
        source_store_id: sourceStoreId,
        target_store_id: targetStoreId,
      });
    } catch {
      // Error handled in hook
    }
  };

  const getFilteredData = () => {
    if (!comparison) return [];

    let data: any[] = [];

    if (statusFilter === 'all') {
      data = [
        ...comparison.missing,
        ...comparison.updated,
        ...comparison.deleted,
      ];
    } else if (statusFilter === 'missing') {
      data = comparison.missing;
    } else if (statusFilter === 'updated') {
      data = comparison.updated;
    } else if (statusFilter === 'deleted') {
      data = comparison.deleted;
    }

    return data;
  };

  const handleNext = () => {
    if (!comparison) {
      message.error('Please compare categories first');
      return;
    }

    if (onNext) {
      onNext({
        sourceStoreId,
        targetStoreId,
        comparison,
        selectedCategories,
      });
    }
  };

  const handleSelectionChange = (_selectedRowKeys: React.Key[], selectedRows: any[]) => {
    setSelectedCategories(selectedRows);
  };

  return (
    <div>
      <Title level={3}>Compare Categories</Title>
      <Text type="secondary">
        Compare categories between source and target stores to identify differences.
      </Text>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={10}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Source Store"
            value={sourceStoreId}
            onChange={setSourceStoreId}
          >
            {sourceStores.map(store => (
              <Option key={store.id} value={store.id}>
                {store.name} ({store.store_hash})
              </Option>
            ))}
          </Select>
        </Col>

        <Col span={10}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Target Store"
            value={targetStoreId}
            onChange={setTargetStoreId}
          >
            {targetStores.map(store => (
              <Option key={store.id} value={store.id}>
                {store.name} - Tree {store.tree_id}
              </Option>
            ))}
          </Select>
        </Col>

        <Col span={4}>
          <Button
            type="primary"
            onClick={handleCompare}
            loading={loading}
            block
          >
            Compare
          </Button>
        </Col>
      </Row>

      {!comparison && !loading && (
        <div style={{ marginTop: 24 }}>
          <Button size="large" onClick={onPrevious}>
            Previous
          </Button>
        </div>
      )}

      {loading && <LoadingState tip="Comparing categories..." />}

      {comparison && !loading && (
        <>
          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="New Categories"
                value={comparison.summary.missing_count}
                icon={<PlusOutlined />}
                color="#1890ff"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Changed"
                value={comparison.summary.updated_count}
                icon={<EditOutlined />}
                color="#faad14"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Deleted"
                value={comparison.summary.deleted_count}
                icon={<DeleteOutlined />}
                color="#ff4d4f"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Unchanged"
                value={comparison.summary.unchanged_count}
                icon={<CheckOutlined />}
                color="#52c41a"
              />
            </Col>
          </Row>

          <Divider />

          <Space style={{ marginBottom: 16 }}>
            <Text strong>Filter by Status:</Text>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All</Option>
              <Option value="missing">New</Option>
              <Option value="updated">Changed</Option>
              <Option value="deleted">Deleted</Option>
            </Select>

            <Text type="secondary">
              {selectedCategories.length > 0 && `${selectedCategories.length} selected`}
            </Text>
          </Space>

          <CategoryComparisonTable
            data={getFilteredData()}
            loading={loading}
            onSelectionChange={handleSelectionChange}
          />

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              size="large"
              onClick={onPrevious}
            >
              Previous
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleNext}
              disabled={selectedCategories.length === 0}
            >
              Next: Migrate Selected ({selectedCategories.length})
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
