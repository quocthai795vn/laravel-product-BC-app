'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import axiosInstance from '@/lib/axios';

const { Title, Text } = Typography;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function ProfilePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const [form] = Form.useForm();

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axiosInstance.get('/user');
      const user = response.data.user;
      setCurrentUser(user);

      if (user.role !== 'admin') {
        message.error('Access denied. Admin only.');
        router.push('/dashboard');
        return;
      }

      fetchUsers();
    } catch {
      message.error('Failed to verify access');
      router.push('/login');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data.users || []);
    } catch {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (userId: number) => {
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch {
      message.error('Failed to delete user');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        await axiosInstance.put(`/admin/users/${editingUser.id}`, values);
        message.success('User updated successfully');
      }

      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch {
      message.error('Failed to update user');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
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
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'pending' ? 'orange' : 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={currentUser?.id === record.id}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && !currentUser) {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ marginBottom: 4, fontSize: '24px', fontWeight: 600 }}>
              User Management
            </Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Manage user accounts, roles, and permissions
            </Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            size="large"
            onClick={() => router.push('/register')}
          >
            Add New User
          </Button>
        </div>

        <Card bordered={false} style={{ background: '#fff' }}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} users`,
            }}
          />
        </Card>

        <Modal
          title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Edit User</span>}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
          okText="Save Changes"
        >
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 24 }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input user name!' }]}
            >
              <Input placeholder="Enter user name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role!' }]}
            >
              <Select placeholder="Select user role">
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select a status!' }]}
            >
              <Select placeholder="Select user status">
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
