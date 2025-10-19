'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Space, Card, message, Select, Alert } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useStores } from '@/hooks';
import { StoreConnectionForm as StoreFormData, CategoryTree } from '@/types/store';

const { Option } = Select;

interface StoreConnectionFormProps {
  type: 'source' | 'target';
  onSuccess?: () => void;
}

export default function StoreConnectionForm({ type, onSuccess }: StoreConnectionFormProps) {
  const [form] = Form.useForm();
  const { connectStore, loading } = useStores();
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [availableTrees, setAvailableTrees] = useState<CategoryTree[]>([]);
  const [selectedTree, setSelectedTree] = useState<number | null>(null);

  const handleTestConnection = async () => {
    try {
      await form.validateFields(['name', 'store_hash', 'access_token']);
      const values = form.getFieldsValue();

      setTestingConnection(true);
      setConnectionTested(false);
      setAvailableTrees([]);
      setSelectedTree(null);

      // Test connection and fetch trees
      const response = await fetch(
        `https://laravel-product-bc-app.local/api/bc/stores/test-and-get-trees`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            store_hash: values.store_hash,
            access_token: values.access_token
          })
        }
      );

      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Connection test failed');
      }

      const trees = data.trees || [];
      setAvailableTrees(trees);
      setConnectionTested(true);

      // Auto-select if only one tree
      if (trees.length === 1) {
        const autoSelectedTree = trees[0];
        setSelectedTree(autoSelectedTree.id);
        form.setFieldsValue({
          tree_id: autoSelectedTree.id,
          tree_name: autoSelectedTree.name
        });
        message.success(`Connection successful! Auto-selected tree: ${autoSelectedTree.name}`);
      } else if (trees.length > 1) {
        message.success(`Connection successful! Please select a category tree (${trees.length} available)`);
      } else {
        message.warning('Connection successful but no category trees found');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to test connection');
      setConnectionTested(false);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTreeSelect = (treeId: number) => {
    const selectedTreeData = availableTrees.find(t => t.id === treeId);
    if (selectedTreeData) {
      setSelectedTree(treeId);
      form.setFieldsValue({
        tree_id: treeId,
        tree_name: selectedTreeData.name
      });
    }
  };

  const handleSubmit = async (values: any) => {
    // For source stores, tree is optional
    // For target stores, tree is required if available trees exist
    if (type === 'target' && availableTrees.length > 0 && !selectedTree) {
      message.error('Please select a category tree');
      return;
    }

    try {
      const formData: StoreFormData = {
        name: values.name,
        store_hash: values.store_hash,
        access_token: values.access_token,
        type: type,
        tree_id: selectedTree || undefined,
        tree_name: values.tree_name || undefined,
      };

      await connectStore(formData);
      form.resetFields();
      setConnectionTested(false);
      setAvailableTrees([]);
      setSelectedTree(null);
      if (onSuccess) onSuccess();
    } catch {
      // Error already handled in hook
    }
  };

  const canSubmit = connectionTested && (type === 'source' || (type === 'target' && (availableTrees.length === 0 || selectedTree !== null)));

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

        {/* Hidden fields for tree data */}
        <Form.Item name="tree_id" hidden>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="tree_name" hidden>
          <Input />
        </Form.Item>

        {!connectionTested && (
          <Alert
            message="Test Connection First"
            description="Click 'Test Connection' to verify your store credentials and fetch available category trees."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {connectionTested && availableTrees.length > 1 && (
          <Form.Item
            label="Select Category Tree"
            required
          >
            <Select
              placeholder="Choose a category tree"
              value={selectedTree}
              onChange={handleTreeSelect}
              size="large"
            >
              {availableTrees.map(tree => (
                <Option key={tree.id} value={tree.id}>
                  {tree.name} (ID: {tree.id}) - Channels: {tree.channels.join(', ')}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {connectionTested && availableTrees.length === 1 && (
          <Alert
            message="Category Tree Auto-Selected"
            description={`${availableTrees[0].name} (ID: ${availableTrees[0].id})`}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {connectionTested && availableTrees.length === 0 && (
          <Alert
            message="No Category Trees Found"
            description="This store has no category trees configured."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item>
          <Space>
            <Button
              onClick={handleTestConnection}
              loading={testingConnection}
              type={connectionTested ? 'default' : 'primary'}
            >
              Test Connection
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!canSubmit}
              icon={connectionTested ? <CheckCircleOutlined /> : undefined}
            >
              Connect Store
            </Button>

            {connectionTested && (
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
