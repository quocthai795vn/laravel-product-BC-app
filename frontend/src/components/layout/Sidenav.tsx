'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidenavProps {
  color: string;
}

export default function Sidenav({ color }: SidenavProps) {
  const pathname = usePathname();
  const page = pathname?.replace('/', '') || 'dashboard';
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, []);

  const getDashboardIcon = (isActive: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6V4Z"
        fill={isActive ? '#fff' : color}
      />
      <path
        d="M3 10C3 9.44771 3.44772 9 4 9H10C10.5523 9 11 9.44771 11 10V16C11 16.5523 10.5523 17 10 17H4C3.44772 17 3 16.5523 3 16V10Z"
        fill={isActive ? '#fff' : color}
      />
      <path
        d="M14 9C13.4477 9 13 9.44771 13 10V16C13 16.5523 13.4477 17 14 17H16C16.5523 17 17 16.5523 17 16V10C17 9.44771 16.5523 9 16 9H14Z"
        fill={isActive ? '#fff' : color}
      />
    </svg>
  );

  const getProductsIcon = (isActive: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 3C2.89543 3 2 3.89543 2 5V7C2 8.10457 2.89543 9 4 9H7C8.10457 9 9 8.10457 9 7V5C9 3.89543 8.10457 3 7 3H4Z"
        fill={isActive ? '#fff' : color}
      />
      <path
        d="M4 11C2.89543 11 2 11.8954 2 13V15C2 16.1046 2.89543 17 4 17H7C8.10457 17 9 16.1046 9 15V13C9 11.8954 8.10457 11 7 11H4Z"
        fill={isActive ? '#fff' : color}
      />
      <path
        d="M11 5C11 3.89543 11.8954 3 13 3H16C17.1046 3 18 3.89543 18 5V7C18 8.10457 17.1046 9 16 9H13C11.8954 9 11 8.10457 11 7V5Z"
        fill={isActive ? '#fff' : color}
      />
      <path
        d="M13 11C11.8954 11 11 11.8954 11 13V15C11 16.1046 11.8954 17 13 17H16C17.1046 17 18 16.1046 18 15V13C18 11.8954 17.1046 11 16 11H13Z"
        fill={isActive ? '#fff' : color}
      />
    </svg>
  );

  const getCategoriesIcon = (isActive: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 6C3 4.34315 4.34315 3 6 3H14C15.6569 3 17 4.34315 17 6V14C17 15.6569 15.6569 17 14 17H6C4.34315 17 3 15.6569 3 14V6ZM6 5H14C14.5523 5 15 5.44772 15 6V14C15 14.5523 14.5523 15 14 15H6C5.44772 15 5 14.5523 5 14V6C5 5.44772 5.44772 5 6 5Z"
        fill={isActive ? '#fff' : color}
      />
      <path d="M7 7H13V9H7V7Z" fill={isActive ? '#fff' : color} />
      <path d="M7 11H13V13H7V11Z" fill={isActive ? '#fff' : color} />
    </svg>
  );

  const getCustomersIcon = (isActive: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 6C9 7.65685 7.65685 9 6 9C4.34315 9 3 7.65685 3 6C3 4.34315 4.34315 3 6 3C7.65685 3 9 4.34315 9 6Z"
        fill={isActive ? '#fff' : color}
      />
      <path
        d="M17 6C17 7.65685 15.6569 9 14 9C12.3431 9 11 7.65685 11 6C11 4.34315 12.3431 3 14 3C15.6569 3 17 4.34315 17 6Z"
        fill={isActive ? '#fff' : color}
      />
      <path
        d="M12.9291 11C13.5884 11 14.2024 11.2987 14.6165 11.7987C15.4909 12.8523 16 14.1891 16 15.6667C16 16.403 15.403 17 14.6667 17H1.33333C0.596954 17 0 16.403 0 15.6667C0 14.1891 0.509143 12.8523 1.38351 11.7987C1.79764 11.2987 2.41158 11 3.07092 11H12.9291Z"
        fill={isActive ? '#fff' : color}
      />
      <path
        d="M20 15.6667C20 16.403 19.403 17 18.6667 17H16.6154C16.862 16.5952 17 16.1429 17 15.6667C17 14.0315 16.4314 12.5547 15.4749 11.3737C15.7299 11.1384 16.0574 11 16.4032 11H19.5968C19.8155 11 20.0003 11.1848 20.0003 11.4035C20.0003 12.9395 19.6694 14.3935 19.0779 15.6667H20Z"
        fill={isActive ? '#fff' : color}
      />
    </svg>
  );

  const getPagesIcon = (isActive: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 3C2.89543 3 2 3.89543 2 5V15C2 16.1046 2.89543 17 4 17H16C17.1046 17 18 16.1046 18 15V5C18 3.89543 17.1046 3 16 3H4ZM5 7C5 6.44772 5.44772 6 6 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H6C5.44772 8 5 7.55228 5 7ZM6 10C5.44772 10 5 10.4477 5 11C5 11.5523 5.44772 12 6 12H14C14.5523 12 15 11.5523 15 11C15 10.4477 14.5523 10 14 10H6ZM5 15C5 14.4477 5.44772 14 6 14H10C10.5523 14 11 14.4477 11 15C11 15.5523 10.5523 16 10 16H6C5.44772 16 5 15.5523 5 15Z"
        fill={isActive ? '#fff' : color}
      />
    </svg>
  );

  const getBlogIcon = (isActive: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 5C2 3.89543 2.89543 3 4 3H16C17.1046 3 18 3.89543 18 5V15C18 16.1046 17.1046 17 16 17H4C2.89543 17 2 16.1046 2 15V5ZM5 7C5 6.44772 5.44772 6 6 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H6C5.44772 8 5 7.55228 5 7ZM6 10C5.44772 10 5 10.4477 5 11C5 11.5523 5.44772 12 6 12H10C10.5523 12 11 11.5523 11 11C11 10.4477 10.5523 10 10 10H6Z"
        fill={isActive ? '#fff' : color}
      />
    </svg>
  );

  const getProfileIcon = (isActive: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z"
        fill={isActive ? '#fff' : color}
      />
    </svg>
  );

  const menuItems = [
    {
      key: 'dashboard',
      label: (
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <span
            className="icon"
            style={{
              background: page === 'dashboard' ? color : 'rgba(0,0,0,0.04)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              marginRight: '12px',
              flexShrink: 0,
            }}
          >
            {getDashboardIcon(page === 'dashboard')}
          </span>
          <span className="label">Dashboard</span>
        </Link>
      ),
    },
    {
      key: 'products',
      label: (
        <Link href="/products" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <span
            className="icon"
            style={{
              background: page === 'products' ? color : 'rgba(0,0,0,0.04)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              marginRight: '12px',
              flexShrink: 0,
            }}
          >
            {getProductsIcon(page === 'products')}
          </span>
          <span className="label">Products</span>
        </Link>
      ),
    },
    {
      key: 'categories',
      label: (
        <Link href="/categories" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <span
            className="icon"
            style={{
              background: page === 'categories' ? color : 'rgba(0,0,0,0.04)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              marginRight: '12px',
              flexShrink: 0,
            }}
          >
            {getCategoriesIcon(page === 'categories')}
          </span>
          <span className="label">Categories</span>
        </Link>
      ),
    },
    {
      key: 'customers',
      label: (
        <Link href="/customers" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <span
            className="icon"
            style={{
              background: page === 'customers' ? color : 'rgba(0,0,0,0.04)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              marginRight: '12px',
              flexShrink: 0,
            }}
          >
            {getCustomersIcon(page === 'customers')}
          </span>
          <span className="label">Customers</span>
        </Link>
      ),
    },
    {
      key: 'pages',
      label: (
        <Link href="/pages" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <span
            className="icon"
            style={{
              background: page === 'pages' ? color : 'rgba(0,0,0,0.04)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              marginRight: '12px',
              flexShrink: 0,
            }}
          >
            {getPagesIcon(page === 'pages')}
          </span>
          <span className="label">Pages</span>
        </Link>
      ),
    },
    {
      key: 'blog',
      label: (
        <Link href="/blog" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <span
            className="icon"
            style={{
              background: page === 'blog' ? color : 'rgba(0,0,0,0.04)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              marginRight: '12px',
              flexShrink: 0,
            }}
          >
            {getBlogIcon(page === 'blog')}
          </span>
          <span className="label">Blog</span>
        </Link>
      ),
    },
  ];

  // Add Profile menu item only for admin users
  if (isAdmin) {
    menuItems.push({
      key: 'profile',
      label: (
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <span
            className="icon"
            style={{
              background: page === 'profile' ? color : 'rgba(0,0,0,0.04)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              marginRight: '12px',
              flexShrink: 0,
            }}
          >
            {getProfileIcon(page === 'profile')}
          </span>
          <span className="label">Profile</span>
        </Link>
      ),
    });
  }

  return (
    <>
      <div className="brand" style={{ padding: '24px 20px', textAlign: 'left', marginBottom: '8px' }}>
        <h3 style={{
          color: '#1890ff',
          margin: 0,
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '-0.5px'
        }}>BC Migration</h3>
        <span style={{
          fontSize: '12px',
          color: '#8c8c8c',
          fontWeight: 400
        }}>BigCommerce Tool</span>
      </div>
      <hr style={{ margin: '0', border: 'none', borderTop: '1px solid #f0f0f0' }} />
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[page]}
        items={menuItems}
        style={{
          border: 'none',
          marginTop: '8px'
        }}
      />
    </>
  );
}
