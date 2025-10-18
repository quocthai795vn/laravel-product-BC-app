'use client';

import React from 'react';
import { Card, Typography, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';

const { Title } = Typography;

export default function CategoriesPage() {
  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Parent Category',
      dataIndex: 'parent',
      key: 'parent',
    },
    {
      title: 'Products Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>Edit</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'Electronics',
      parent: '-',
      count: '45',
      status: 'Active',
    },
    {
      key: '2',
      name: 'Clothing',
      parent: '-',
      count: '30',
      status: 'Active',
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>Categories</Title>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Category
          </Button>
        </div>

        <Card>
          <Table columns={columns} dataSource={data} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
