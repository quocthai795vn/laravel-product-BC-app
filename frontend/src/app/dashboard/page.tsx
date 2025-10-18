'use client';

import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, message, Space, Layout, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;

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
      // Check if token exists
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch user data from Laravel API
      const response = await axiosInstance.get('/user');
      setUser(response.data.user);
    } catch (error: any) {
      message.error('Failed to fetch user data');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to revoke token
      await axiosInstance.post('/logout');

      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      message.success('Logged out successfully');
      router.push('/login');
    } catch (error: any) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const navigateToAdmin = () => {
    router.push('/admin');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <Text>Loading...</Text>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#fff',
        padding: '0 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <Title level={3} style={{ margin: 0 }}>SaaS App</Title>
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{user?.name}</Text>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '50px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: 8,
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={2}>Welcome, {user?.name}! 👋</Title>
                <Paragraph type="secondary">
                  You are now logged in to your dashboard.
                </Paragraph>
              </div>

              <Card type="inner" title="Your Profile Information">
                <Space direction="vertical" size="middle">
                  <div>
                    <Text strong>Name: </Text>
                    <Text>{user?.name}</Text>
                  </div>
                  <div>
                    <Text strong>Email: </Text>
                    <Text>{user?.email}</Text>
                  </div>
                  <div>
                    <Text strong>Role: </Text>
                    <Text>{user?.role}</Text>
                  </div>
                  <div>
                    <Text strong>Status: </Text>
                    <Text type={user?.status === 'active' ? 'success' : 'warning'}>
                      {user?.status}
                    </Text>
                  </div>
                </Space>
              </Card>

              {user?.role === 'admin' && (
                <Card
                  type="inner"
                  title="Admin Actions"
                  style={{ background: '#f0f5ff' }}
                >
                  <Space>
                    <Button
                      type="primary"
                      onClick={navigateToAdmin}
                    >
                      Go to Admin Panel
                    </Button>
                  </Space>
                </Card>
              )}
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
