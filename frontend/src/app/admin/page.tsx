'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  message,
  Space,
  Layout,
  Typography,
  Tag,
  Avatar,
  Popconfirm,
  Tabs
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    fetchPendingUsers();
    fetchAllUsers();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axiosInstance.get('/user');
      const user = response.data.user;

      if (user.role !== 'admin') {
        message.error('Unauthorized. Admin access required.');
        router.push('/dashboard');
        return;
      }

      setCurrentUser(user);
    } catch (error: any) {
      message.error('Failed to verify admin access');
      router.push('/login');
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/pending');
      setPendingUsers(response.data.users);
    } catch (error: any) {
      message.error('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      setAllUsers(response.data.users);
    } catch (error: any) {
      message.error('Failed to fetch users');
    }
  };

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await axiosInstance.post(`/admin/approve/${userId}`);
      message.success(response.data.message || 'User approved successfully');

      // Refresh lists
      await fetchPendingUsers();
      await fetchAllUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await axiosInstance.post(`/admin/reject/${userId}`);
      message.success(response.data.message || 'User rejected successfully');

      // Refresh lists
      await fetchPendingUsers();
      await fetchAllUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      message.success('Logged out successfully');
      router.push('/login');
    } catch (error: any) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const pendingColumns: ColumnsType<User> = [
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
      title: 'Registered',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Approve this user?"
            description="The user will be able to log in."
            onConfirm={() => handleApprove(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={actionLoading === record.id}
              size="small"
            >
              Approve
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Reject this user?"
            description="The user will be marked as inactive."
            onConfirm={() => handleReject(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<CloseCircleOutlined />}
              loading={actionLoading === record.id}
              size="small"
            >
              Reject
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const allUsersColumns: ColumnsType<User> = [
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
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'active') color = 'success';
        if (status === 'pending') color = 'warning';
        if (status === 'inactive') color = 'error';

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Registered',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

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
        <Title level={3} style={{ margin: 0 }}>Admin Panel</Title>
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{currentUser?.name}</Text>
          <Button
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </Button>
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
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Tabs
            defaultActiveKey="pending"
            items={[
              {
                key: 'pending',
                label: `Pending Approvals (${pendingUsers.length})`,
                children: (
                  <Card>
                    <Table
                      columns={pendingColumns}
                      dataSource={pendingUsers}
                      rowKey="id"
                      locale={{
                        emptyText: 'No pending users',
                      }}
                    />
                  </Card>
                ),
              },
              {
                key: 'all',
                label: `All Users (${allUsers.length})`,
                children: (
                  <Card>
                    <Table
                      columns={allUsersColumns}
                      dataSource={allUsers}
                      rowKey="id"
                    />
                  </Card>
                ),
              },
            ]}
          />
        </div>
      </Content>
    </Layout>
  );
}
