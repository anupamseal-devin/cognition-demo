import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, RocketOutlined } from '@ant-design/icons';
import { authApi } from '../services/api';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const data = await authApi.login(values.username, values.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      message.success(`Welcome, ${data.fullName}!`);
      navigate('/');
    } catch {
      message.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: 16,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <RocketOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <div>
            <Title level={3} style={{ margin: 0 }}>Migration Tracker</Title>
            <Text type="secondary">Legacy Code Migration Dashboard</Text>
          </div>
          <Form layout="vertical" onFinish={onFinish} style={{ textAlign: 'left' }}>
            <Form.Item name="username" rules={[{ required: true, message: 'Please enter username' }]}>
              <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please enter password' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Sign In
              </Button>
            </Form.Item>
          </Form>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Demo: admin/admin123 | lead/lead123 | viewer/viewer123
          </Text>
        </Space>
      </Card>
    </div>
  );
}
