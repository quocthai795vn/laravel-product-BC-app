'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const { Title, Text, Link } = Typography;

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);

    try {
      // Call Laravel register API
      const response = await axiosInstance.post('/register', {
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      notification.success({
        message: 'Registration Successful',
        description: response.data.message || 'Your account is pending admin approval. Please wait for confirmation.',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        placement: 'top',
        duration: 6,
      });

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      // Handle errors
      if (error.response?.data?.message) {
        notification.error({
          message: 'Registration Failed',
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
          message: 'Registration Failed',
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
          width: 450,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Create Account</Title>
          <Text type="secondary">Sign up to get started</Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Please input your full name!' },
              { min: 2, message: 'Name must be at least 2 characters!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="John Doe"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="email@example.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="password_confirmation"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
