'use client';

import React, { useState } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Row, Col, Statistic, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';

const { Title, Text } = Typography;
const { Search } = Input;

export default function BlogPage() {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const columns = [
    {
      title: 'Post Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      sorter: (a: any, b: any) => a.views - b.views,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Published' ? 'green' : status === 'Draft' ? 'orange' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Published Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}>Edit</Button>
          <Button type="link" size="small" icon={<EyeOutlined />}>View</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>Delete</Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      title: 'How to Migrate Your BigCommerce Store Successfully',
      author: 'Admin',
      category: 'Tutorials',
      status: 'Published',
      date: '2025-01-15',
      views: 1234,
    },
    {
      key: '2',
      title: 'BigCommerce Best Practices for 2025',
      author: 'Admin',
      category: 'Tips',
      status: 'Draft',
      date: '2025-01-10',
      views: 567,
    },
    {
      key: '3',
      title: 'Top 10 Features of BigCommerce Platform',
      author: 'John Doe',
      category: 'Reviews',
      status: 'Published',
      date: '2025-01-08',
      views: 2145,
    },
    {
      key: '4',
      title: 'Understanding Product Categories in BigCommerce',
      author: 'Jane Smith',
      category: 'Tutorials',
      status: 'Published',
      date: '2025-01-05',
      views: 890,
    },
    {
      key: '5',
      title: 'How to Optimize Your Store Performance',
      author: 'Admin',
      category: 'Tips',
      status: 'Published',
      date: '2025-01-03',
      views: 1567,
    },
    {
      key: '6',
      title: 'Customer Management Strategies',
      author: 'John Doe',
      category: 'Business',
      status: 'Draft',
      date: '2025-01-01',
      views: 234,
    },
    {
      key: '7',
      title: 'SEO Tips for E-commerce Websites',
      author: 'Jane Smith',
      category: 'Marketing',
      status: 'Published',
      date: '2024-12-28',
      views: 3421,
    },
    {
      key: '8',
      title: 'Building Trust with Your Customers',
      author: 'Admin',
      category: 'Business',
      status: 'Scheduled',
      date: '2025-01-20',
      views: 0,
    },
  ];

  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPosts = data.length;
  const publishedPosts = data.filter(item => item.status === 'Published').length;
  const draftPosts = data.filter(item => item.status === 'Draft').length;
  const totalViews = data.reduce((sum, item) => sum + item.views, 0);

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>Blog Posts</Title>
              <Text type="secondary">Manage your blog content and articles</Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Create New Post
            </Button>
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Posts"
                  value={totalPosts}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Published"
                  value={publishedPosts}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Drafts"
                  value={draftPosts}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Views"
                  value={totalViews}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        <Card>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Search
              placeholder="Search posts by title or author..."
              allowClear
              style={{ width: 300 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={(value) => setFilterStatus(value)}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Published', value: 'Published' },
                { label: 'Draft', value: 'Draft' },
                { label: 'Scheduled', value: 'Scheduled' },
              ]}
            />
          </div>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} posts`,
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
