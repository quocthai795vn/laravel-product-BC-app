'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Space, Card, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useStores } from '@/hooks';
import { StoreConnectionForm as StoreFormData } from '@/types/store';

interface StoreConnectionFormProps {
  type: 'source' | 'target';
  onSuccess?: () => void;
}

export default function StoreConnectionForm({ type, onSuccess }: StoreConnectionFormProps) {
  const [form] = Form.useForm();
  const { connectStore, loading } = useStores();
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (values: any) => {
    try {
      const formData: StoreFormData = {
        name: values.name,
        store_hash: values.store_hash,
        access_token: values.access_token,
        type: type,
        tree_id: values.tree_id,
        tree_name: values.tree_name,
      };

      await connectStore(formData);
      form.resetFields();
      setConnectionStatus(null);
      if (onSuccess) onSuccess();
    } catch {
      // Error already handled in hook
    }
  };

  const handleTestConnection = async () => {
    try {
      await form.validateFields(['store_hash', 'access_token', 'tree_id']);
      const values = form.getFieldsValue();

      setTestingConnection(true);
      setConnectionStatus(null);

      // Create temporary connection to test
      const tempData: StoreFormData = {
        name: values.name || 'Test Store',
        store_hash: values.store_hash,
        access_token: values.access_token,
        type: type,
        tree_id: values.tree_id,
        tree_name: values.tree_name,
      };

      await connectStore(tempData);
      setConnectionStatus('success');
      message.success('Connection successful!');
    } catch {
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Card title={`${type === 'source' ? 'Source' : 'Target'} Store Connection`}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Store Name"
          name="name"
          rules={[{ required: true, message: 'Please enter store name' }]}
        >
          <Input placeholder="e.g., FineWineHouse" />
        </Form.Item>

        <Form.Item
          label="Store Hash"
          name="store_hash"
          rules={[{ required: true, message: 'Please enter store hash' }]}
        >
          <Input placeholder="e.g., e8559" />
        </Form.Item>

        <Form.Item
          label="Access Token"
          name="access_token"
          rules={[{ required: true, message: 'Please enter access token' }]}
        >
          <Input.Password placeholder="Enter your BigCommerce API token" />
        </Form.Item>

        <Form.Item
          label="Tree ID"
          name="tree_id"
          rules={[{ required: true, message: 'Please enter tree ID' }]}
        >
          <Input type="number" placeholder="e.g., 5" />
        </Form.Item>

        <Form.Item label="Tree Name" name="tree_name">
          <Input placeholder="e.g., FineWineHouse Tree" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={connectionStatus === 'success' ? <CheckCircleOutlined /> : undefined}
            >
              Connect Store
            </Button>

            <Button
              onClick={handleTestConnection}
              loading={testingConnection}
            >
              Test Connection
            </Button>

            {connectionStatus === 'success' && (
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
            )}
            {connectionStatus === 'error' && (
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
