'use client';

import React, { useState } from 'react';
import { Layout, Drawer } from 'antd';
import Sidenav from './Sidenav';

const { Content, Sider } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [visible, setVisible] = useState(false);
  const [sidenavColor] = useState('#1890ff');
  const [sidenavType] = useState('transparent');

  return (
    <Layout className="layout-dashboard" style={{ minHeight: '100vh' }}>
      <Drawer
        title={false}
        placement="left"
        closable={false}
        onClose={() => setVisible(false)}
        open={visible}
        width={250}
        className="drawer-sidebar"
      >
        <Layout className="layout-dashboard">
          <Sider
            trigger={null}
            width={250}
            theme="light"
            className="sider-primary ant-layout-sider-primary"
            style={{ background: sidenavType }}
          >
            <Sidenav color={sidenavColor} />
          </Sider>
        </Layout>
      </Drawer>

      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        width={250}
        theme="light"
        className="sider-primary ant-layout-sider-primary"
        style={{ background: sidenavType }}
      >
        <Sidenav color={sidenavColor} />
      </Sider>

      <Layout>
        <Content className="content-ant" style={{ padding: '24px', background: '#f0f2f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
