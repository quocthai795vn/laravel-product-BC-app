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

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axiosInstance.get('/user');
      setUser(response.data.user);
    } catch {
      message.error('Failed to fetch user data');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 4, fontSize: '24px', fontWeight: 600 }}>Dashboard</Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>Welcome back, {user?.name}!</Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ background: '#fff' }}>
              <Statistic
                title="Total Products"
                value={1234}
                prefix={<ShoppingOutlined style={{ fontSize: '20px' }} />}
                valueStyle={{ color: '#3f8600', fontSize: '28px', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ background: '#fff' }}>
              <Statistic
                title="Total Customers"
                value={567}
                prefix={<UserOutlined style={{ fontSize: '20px' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ background: '#fff' }}>
              <Statistic
                title="Total Orders"
                value={890}
                prefix={<FileTextOutlined style={{ fontSize: '20px' }} />}
                valueStyle={{ color: '#cf1322', fontSize: '28px', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ background: '#fff' }}>
              <Statistic
                title="Revenue"
                value={45678}
                prefix={<DollarOutlined style={{ fontSize: '20px' }} />}
                precision={2}
                valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 600 }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card
              title={<span style={{ fontSize: '16px', fontWeight: 600 }}>Recent Activity</span>}
              bordered={false}
              style={{ background: '#fff' }}
            >
              <Text type="secondary">No recent activity to display</Text>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}
