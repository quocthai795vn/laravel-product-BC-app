'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const { Title, Text, Link } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      // Call Laravel login API
      const response = await axiosInstance.post('/login', {
        email: values.email,
        password: values.password,
      });

      // Store token and user data in localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      notification.success({
        message: 'Login Successful',
        description: response.data.message || 'Welcome back!',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        placement: 'top',
        duration: 3,
      });

      // Redirect to dashboard
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (error: any) {
      // Handle errors
      if (error.response?.status === 403) {
        notification.error({
          message: 'Access Denied',
          description: error.response.data.message || 'Your account is pending approval',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          placement: 'top',
          duration: 5,
        });
      } else if (error.response?.data?.message) {
        notification.error({
          message: 'Login Failed',
          description: error.response.data.message,
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          placement: 'top',
          duration: 5,
        });
      } else if (error.response?.data?.errors) {
        // Validation errors
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          notification.error({
            message: 'Validation Error',
            description: errors[key][0],
            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
            placement: 'top',
            duration: 5,
          });
        });
      } else {
        notification.error({
          message: 'Login Failed',
          description: 'Please try again.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          placement: 'top',
          duration: 5,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Welcome Back</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="email@example.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>
            Don't have an account?{' '}
            <Link href="/register">Register now</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
