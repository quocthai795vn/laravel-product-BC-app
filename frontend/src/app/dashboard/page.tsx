'use client';

import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, message } from 'antd';
import { ShoppingOutlined, UserOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import DashboardLayout from '@/components/layout/DashboardLayout';

const { Title, Text } = Typography;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axiosInstance.get('/user');
      setUser(response.data.user);
    } catch (error: any) {
      message.error('Failed to fetch user data');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text>Loading...</Text>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Welcome back, {user?.name}!</Text>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Products"
                value={1234}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Customers"
                value={567}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={890}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Revenue"
                value={45678}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="Recent Activity">
              <p>No recent activity to display</p>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}
