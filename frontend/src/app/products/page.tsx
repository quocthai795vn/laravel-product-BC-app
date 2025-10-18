'use client';

import React from 'react';
import { Card, Typography, Table, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';

const { Title } = Typography;

export default function ProductsPage() {
  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
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
      name: 'Sample Product 1',
      sku: 'SKU-001',
      price: '$29.99',
      stock: '100',
    },
    {
      key: '2',
      name: 'Sample Product 2',
      sku: 'SKU-002',
      price: '$49.99',
      stock: '50',
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>Products</Title>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Product
          </Button>
        </div>

        <Card>
          <Table columns={columns} dataSource={data} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
