'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Select,
  Upload,
  Button,
  Alert,
  Card,
  Typography,
  Space,
  message,
  Progress,
  Table,
  Tag,
  Divider
} from 'antd';
import {
  UploadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useStores } from '@/hooks';
import type { StoreConnection } from '@/types/store';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface StepImportProps {
  onPrevious: () => void;
}

interface ImportResult {
  status: 'success' | 'failed' | 'skipped';
  category_name: string;
  category_id?: number;
  old_id?: number;
  message?: string;
}

export default function StepImport({ onPrevious }: StepImportProps) {
  const [form] = Form.useForm();
  const { stores, loading: storesLoading, fetchStores } = useStores();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importComplete, setImportComplete] = useState(false);

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];

    // Limit to one file
    newFileList = newFileList.slice(-1);

    setFileList(newFileList);

    if (info.file.status === 'done' || info.file.originFileObj) {
      const file = info.file.originFileObj || info.file;
      parseFile(file);
    }
  };

  const parseFile = async (file: File) => {
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.csv')) {
        await parseCSV(file);
      } else if (fileName.endsWith('.json')) {
        await parseJSON(file);
      } else {
        message.error('Unsupported file format. Please use CSV or JSON.');
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      message.error('Failed to parse file: ' + error.message);
      setParsedData([]);
    }
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      message.error('CSV file is empty or invalid');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const categories = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const category: any = {};

      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/^"|"$/g, '');

        // Convert data types
        if (header === 'id' || header === 'parent_id' || header === 'sort_order') {
          category[header] = value ? parseInt(value, 10) : 0;
        } else if (header === 'is_visible') {
          category[header] = value === 'true' || value === '1';
        } else {
          category[header] = value || '';
        }
      });

      if (category.name) {
        categories.push(category);
      }
    }

    setParsedData(categories);
    message.success(`Parsed ${categories.length} categories from CSV`);
  };

  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  };

  const parseJSON = async (file: File) => {
    const text = await file.text();
    const json = JSON.parse(text);

    let categories = [];

    if (Array.isArray(json)) {
      categories = json;
    } else if (json.categories && Array.isArray(json.categories)) {
      categories = json.categories;
    } else {
      message.error('Invalid JSON format. Expected array or object with "categories" property');
      return;
    }

    setParsedData(categories);
    message.success(`Parsed ${categories.length} categories from JSON`);
  };

  const handleImport = async (values: any) => {
    if (parsedData.length === 0) {
      message.error('Please upload and parse a file first');
      return;
    }

    const selectedStore = stores.find((s: StoreConnection) => s.id === values.store_id);
    if (!selectedStore) {
      message.error('Store not found');
      return;
    }

    try {
      setImporting(true);
      setImportProgress(0);
      setImportResults([]);
      setImportComplete(false);

      message.info(`Starting import of ${parsedData.length} categories...`);

      // Call backend import API
      const response = await fetch(
        'https://laravel-product-bc-app.local/api/categories/import',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            store_id: values.store_id,
            categories: parsedData
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import categories');
      }

      const data = await response.json();
      const results = data.results || {};

      // Convert backend results to frontend format
      const importResults: ImportResult[] = (results.details || []).map((detail: any) => ({
        status: detail.status,
        category_name: detail.category_name,
        category_id: detail.category_id,
        old_id: detail.old_id,
        message: detail.message
      }));

      setImportResults(importResults);
      setImportProgress(100);
      setImportComplete(true);

      const successCount = results.created || 0;
      const failedCount = results.failed || 0;

      message.success(
        `Import completed! Success: ${successCount}, Failed: ${failedCount}`
      );
    } catch (error: any) {
      console.error('Import error:', error);
      message.error('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const uploadProps = {
    accept: '.csv,.json',
    beforeUpload: () => false,
    onChange: handleFileChange,
    fileList,
    maxCount: 1
  };

  const previewColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Parent ID',
      dataIndex: 'parent_id',
      key: 'parent_id',
      width: 100
    },
    {
      title: 'Custom URL',
      dataIndex: 'custom_url',
      key: 'custom_url',
      width: 150
    },
    {
      title: 'Visible',
      dataIndex: 'is_visible',
      key: 'is_visible',
      width: 80,
      render: (visible: boolean) => (
        <Tag color={visible ? 'green' : 'red'}>
          {visible ? 'Yes' : 'No'}
        </Tag>
      )
    }
  ];

  const resultColumns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config: any = {
          success: { icon: <CheckCircleOutlined />, color: 'success', text: 'Success' },
          failed: { icon: <CloseCircleOutlined />, color: 'error', text: 'Failed' },
          skipped: { icon: <WarningOutlined />, color: 'warning', text: 'Skipped' }
        };
        const { icon, color, text } = config[status] || config.failed;
        return <Tag icon={icon} color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Category Name',
      dataIndex: 'category_name',
      key: 'category_name'
    },
    {
      title: 'Old ID',
      dataIndex: 'old_id',
      key: 'old_id',
      width: 80
    },
    {
      title: 'New ID',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 80
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message'
    }
  ];

  return (
    <div>
      <Title level={3}>Import Categories</Title>
      <Paragraph type="secondary">
        Import categories from CSV or JSON file into your store
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleImport}>
          <Form.Item
            label="Select Target Store"
            name="store_id"
            rules={[{ required: true, message: 'Please select a store' }]}
          >
            <Select
              placeholder="Choose store to import into"
              loading={storesLoading}
              size="large"
              showSearch
              optionFilterProp="children"
              disabled={importing}
            >
              {stores.map((store: StoreConnection) => (
                <Option key={store.id} value={store.id}>
                  {store.name} ({store.store_hash}) - {store.type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Upload File" required>
            <Dragger {...uploadProps} disabled={importing}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area</p>
              <p className="ant-upload-hint">
                Support for CSV or JSON format. File must match export format.
              </p>
            </Dragger>
          </Form.Item>

          {parsedData.length > 0 && !importing && !importComplete && (
            <>
              <Divider />
              <Alert
                message={`File Preview: ${parsedData.length} categories found`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={previewColumns}
                dataSource={parsedData.slice(0, 10)}
                rowKey={(record) => record.id || record.name}
                pagination={false}
                scroll={{ y: 300 }}
                size="small"
                style={{ marginBottom: 24 }}
              />
              {parsedData.length > 10 && (
                <Text type="secondary">
                  Showing first 10 of {parsedData.length} categories
                </Text>
              )}
            </>
          )}

          {importing && (
            <Card style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>
                  <SyncOutlined spin /> Importing categories...
                </Text>
                <Progress percent={importProgress} status="active" />
                <Text type="secondary">
                  Processed: {importResults.length} / {parsedData.length}
                </Text>
              </Space>
            </Card>
          )}

          {importComplete && importResults.length > 0 && (
            <>
              <Divider />
              <Alert
                message="Import Complete"
                description={
                  <Space direction="vertical">
                    <Text>
                      Total: {importResults.length} |{' '}
                      Success: <Text type="success">{importResults.filter(r => r.status === 'success').length}</Text> |{' '}
                      Failed: <Text type="danger">{importResults.filter(r => r.status === 'failed').length}</Text>
                    </Text>
                  </Space>
                }
                type={importResults.every(r => r.status === 'success') ? 'success' : 'warning'}
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={resultColumns}
                dataSource={importResults}
                rowKey={(record, index) => `${record.category_name}-${index}`}
                pagination={{ pageSize: 10 }}
                scroll={{ y: 400 }}
                size="small"
              />
            </>
          )}

          <Divider />

          <Alert
            message="Import Requirements"
            description={
              <div>
                <p><strong>Required Fields:</strong> name</p>
                <p><strong>Optional Fields:</strong> parent_id, description, sort_order, page_title, meta_keywords, meta_description, search_keywords, custom_url, image_url, is_visible, default_product_sort, layout_file</p>
                <p><strong>Format:</strong> Use files exported from this system for best compatibility</p>
                <p style={{ marginBottom: 0 }}><strong>Note:</strong> Categories are created in order of parent_id. Parent categories must exist or be in the same import file.</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form.Item>
            <Space>
              <Button onClick={onPrevious} disabled={importing}>
                Previous
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<UploadOutlined />}
                loading={importing}
                disabled={parsedData.length === 0 || importing}
                size="large"
              >
                {importing ? 'Importing...' : 'Start Import'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
