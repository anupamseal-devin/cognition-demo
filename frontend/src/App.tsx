import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, theme } from 'antd';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import ExecSummaryPage from './pages/ExecSummaryPage';
import DeliveryDetailPage from './pages/DeliveryDetailPage';
import DependencyMapPage from './pages/DependencyMapPage';
import OperationalReadinessPage from './pages/OperationalReadinessPage';
import ClientDependencyPage from './pages/ClientDependencyPage';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: themeToken } = theme.useToken();

  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Executive Summary' },
    { key: '/delivery', icon: <UnorderedListOutlined />, label: 'Delivery Detail' },
    { key: '/dependencies', icon: <ApartmentOutlined />, label: 'Dependency Map' },
    { key: '/readiness', icon: <SafetyCertificateOutlined />, label: 'Operational Readiness' },
    { key: '/client-deps', icon: <TeamOutlined />, label: 'Client Dependencies' },
  ];

  const userMenu = {
    items: [
      { key: 'role', label: `Role: ${user.role}`, disabled: true },
      { type: 'divider' as const },
      { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#001529',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Text
            strong
            style={{
              color: '#fff',
              fontSize: collapsed ? 14 : 16,
              whiteSpace: 'nowrap',
            }}
          >
            {collapsed ? 'MT' : 'Migration Tracker'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Text strong style={{ fontSize: 18, color: themeToken.colorPrimary }}>
            Global Bank Core Modernization
          </Text>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: themeToken.colorPrimary }} />
              <Text>{user.fullName}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16, minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<ExecSummaryPage />} />
            <Route path="/delivery" element={<DeliveryDetailPage />} />
            <Route path="/dependencies" element={<DependencyMapPage />} />
            <Route path="/readiness" element={<OperationalReadinessPage />} />
            <Route path="/client-deps" element={<ClientDependencyPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
