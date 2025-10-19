'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Select,
  Radio,
  Button,
  Alert,
  Card,
  Typography,
  Space,
  message,
  Divider
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useStores } from '@/hooks';
import type { StoreConnection } from '@/types/store';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface StepExportProps {
  onPrevious: () => void;
}

export default function StepExport({ onPrevious }: StepExportProps) {
  const [form] = Form.useForm();
  const { stores, loading: storesLoading, fetchStores } = useStores();
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportedFile, setExportedFile] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async (values: any) => {
    try {
      setExporting(true);
      setExportComplete(false);

      const selectedStore = stores.find((s: StoreConnection) => s.id === values.store_id);
      if (!selectedStore) {
        message.error('Store not found');
        return;
      }

      message.info('Fetching categories from store...');

      // Call backend export API
      const response = await fetch(
        'https://laravel-product-bc-app.local/api/categories/export',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            store_id: values.store_id,
            format: values.format
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export categories');
      }

      const data = await response.json();
      const categories = data.data || [];

      if (categories.length === 0) {
        message.warning('No categories found to export');
        setExporting(false);
        return;
      }

      message.success(`Found ${categories.length} categories`);

      // Export based on format
      if (values.format === 'csv') {
        exportToCSV(categories, selectedStore.name);
      } else {
        exportToJSON(categories, selectedStore.name);
      }

      setExportComplete(true);
      message.success('Export completed successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      message.error(error.message || 'Failed to export categories');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = (categories: any[], storeName: string) => {
    // Define CSV headers
    const headers = [
      'id',
      'name',
      'parent_id',
      'description',
      'sort_order',
      'page_title',
      'meta_keywords',
      'meta_description',
      'search_keywords',
      'custom_url',
      'image_url',
      'is_visible',
      'default_product_sort',
      'layout_file'
    ];

    // Build CSV rows
    const rows = categories.map((cat: any) => {
      return headers.map(header => {
        const value = cat[header];
        // Escape quotes and wrap in quotes if contains comma or newline
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `${storeName.replace(/\s+/g, '_')}_categories_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedFile(fileName);
  };

  const exportToJSON = (categories: any[], storeName: string) => {
    // Create export object with metadata
    const exportData = {
      export_info: {
        store_name: storeName,
        export_date: new Date().toISOString(),
        total_categories: categories.length,
        version: '1.0'
      },
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        parent_id: cat.parent_id,
        description: cat.description,
        sort_order: cat.sort_order,
        page_title: cat.page_title,
        meta_keywords: cat.meta_keywords,
        meta_description: cat.meta_description,
        search_keywords: cat.search_keywords,
        custom_url: cat.custom_url,
        image_url: cat.image_url,
        is_visible: cat.is_visible,
        default_product_sort: cat.default_product_sort,
        layout_file: cat.layout_file
      }))
    };

    // Create and download file
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `${storeName.replace(/\s+/g, '_')}_categories_${new Date().toISOString().split('T')[0]}.json`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedFile(fileName);
  };

  return (
    <div>
      <Title level={3}>Export Categories</Title>
      <Paragraph type="secondary">
        Export categories from a store to CSV or JSON format
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleExport}
          initialValues={{ format: 'csv' }}
        >
          <Form.Item
            label="Select Store"
            name="store_id"
            rules={[{ required: true, message: 'Please select a store' }]}
          >
            <Select
              placeholder="Choose store to export from"
              loading={storesLoading}
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {stores.map((store: StoreConnection) => (
                <Option key={store.id} value={store.id}>
                  {store.name} ({store.store_hash}) - {store.type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Export Format"
            name="format"
            rules={[{ required: true }]}
          >
            <Radio.Group size="large">
              <Radio.Button value="csv">
                <FileExcelOutlined /> CSV Format
              </Radio.Button>
              <Radio.Button value="json">
                <FileTextOutlined /> JSON Format
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Alert
            message="Export Information"
            description={
              <div>
                <p><strong>CSV Format:</strong> Compatible with Excel and Google Sheets. Best for manual editing and bulk updates.</p>
                <p><strong>JSON Format:</strong> Includes metadata and maintains data types. Best for system integration and re-import.</p>
                <p style={{ marginBottom: 0 }}><strong>Exported Fields:</strong> id, name, parent_id, description, sort_order, page_title, meta_keywords, meta_description, search_keywords, custom_url, image_url, is_visible, default_product_sort, layout_file</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          {exportComplete && exportedFile && (
            <Alert
              message="Export Successful!"
              description={
                <Space direction="vertical">
                  <Text>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    File downloaded: <strong>{exportedFile}</strong>
                  </Text>
                  <Text type="secondary">
                    The file has been saved to your downloads folder.
                  </Text>
                </Space>
              }
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form.Item>
            <Space>
              <Button onClick={onPrevious}>
                Previous
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<DownloadOutlined />}
                loading={exporting}
                size="large"
              >
                {exporting ? 'Exporting...' : 'Export Categories'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
