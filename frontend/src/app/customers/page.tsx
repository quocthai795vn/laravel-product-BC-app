'use client';

import React from 'react';
import { Card, Typography, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';

const { Title } = Typography;

export default function CustomersPage() {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
    },
    {
      title: 'Total Spent',
      dataIndex: 'spent',
      key: 'spent',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>View</a>
          <a>Edit</a>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Doe',
      email: 'john@example.com',
      orders: '15',
      spent: '$1,234.50',
      status: 'Active',
    },
    {
      key: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      orders: '8',
      spent: '$567.80',
      status: 'Active',
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>Customers</Title>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Customer
          </Button>
        </div>

        <Card>
          <Table columns={columns} dataSource={data} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
