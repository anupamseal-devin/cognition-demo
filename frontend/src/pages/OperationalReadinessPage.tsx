import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Progress, Spin, Alert, Typography, Space, Badge, Tabs } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { projectApi } from '../services/api';
import type { ReadinessResponse, ModuleReadiness } from '../types';

const { Text, Title } = Typography;
const PROJECT_ID = 1;

const statusColors: Record<string, string> = {
  NOT_STARTED: 'default',
  IN_PROGRESS: 'processing',
  MIGRATED: 'success',
  VALIDATED: 'blue',
  DECOMMISSIONED: 'purple',
};

export default function OperationalReadinessPage() {
  const [data, setData] = useState<ReadinessResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.getReadiness(PROJECT_ID).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!data) return <Alert type="error" message="Failed to load readiness data" />;

  const totalModules = data.modules.length;
  const readyForDecom = data.modules.filter((m) => m.readyForDecommission).length;
  const alreadyDecom = data.modules.filter((m) => m.decommissioned).length;
  const dvPassed = data.modules.filter((m) => m.dataValidationPassed).length;
  const avgChecklist = totalModules > 0
    ? Math.round(data.modules.reduce((s, m) => s + m.checklistProgressPercent, 0) / totalModules)
    : 0;

  const checklistChartData = data.modules
    .filter((m) => m.status !== 'NOT_STARTED')
    .slice(0, 20)
    .map((m) => ({
      name: m.moduleName.length > 20 ? m.moduleName.slice(0, 18) + '...' : m.moduleName,
      completed: m.completedChecklistItems,
      remaining: m.totalChecklistItems - m.completedChecklistItems,
    }));

  const columns = [
    {
      title: 'Module',
      dataIndex: 'moduleName',
      key: 'moduleName',
      sorter: (a: ModuleReadiness, b: ModuleReadiness) => a.moduleName.localeCompare(b.moduleName),
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (d: string) => <Tag>{d}</Tag>,
      filters: [
        { text: 'Payments', value: 'Payments' },
        { text: 'Lending', value: 'Lending' },
        { text: 'Core Banking', value: 'Core Banking' },
      ],
      onFilter: (value: unknown, record: ModuleReadiness) => record.domain === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Tag color={statusColors[s]}>{s.replace(/_/g, ' ')}</Tag>,
    },
    {
      title: 'Cutover Progress',
      key: 'checklist',
      render: (_: unknown, record: ModuleReadiness) => (
        <Progress
          percent={Math.round(record.checklistProgressPercent)}
          size="small"
          strokeColor={record.checklistProgressPercent === 100 ? '#52c41a' : record.checklistProgressPercent >= 50 ? '#1677ff' : '#faad14'}
        />
      ),
      sorter: (a: ModuleReadiness, b: ModuleReadiness) => a.checklistProgressPercent - b.checklistProgressPercent,
    },
    {
      title: 'Rollback',
      key: 'rollback',
      render: (_: unknown, record: ModuleReadiness) => {
        const total = record.rollbackTestedCount + record.rollbackNotTestedCount;
        return total > 0 ? (
          <Space>
            <Badge
              status={record.rollbackNotTestedCount === 0 ? 'success' : 'warning'}
            />
            <Text style={{ fontSize: 12 }}>
              {record.rollbackTestedCount}/{total} tested
            </Text>
          </Space>
        ) : <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Data Validation',
      key: 'dv',
      render: (_: unknown, record: ModuleReadiness) => (
        record.dataValidationPassed
          ? <Tag color="success" icon={<CheckCircleOutlined />}>PASSED</Tag>
          : <Tag color="warning" icon={<ExclamationCircleOutlined />}>PENDING</Tag>
      ),
    },
    {
      title: 'Decom Ready',
      key: 'ready',
      render: (_: unknown, record: ModuleReadiness) => (
        record.decommissioned
          ? <Tag color="purple">DECOMMISSIONED</Tag>
          : record.readyForDecommission
            ? <Tag color="success" icon={<CheckCircleOutlined />}>READY</Tag>
            : <Tag color="default" icon={<CloseCircleOutlined />}>NOT READY</Tag>
      ),
      filters: [
        { text: 'Ready', value: 'ready' },
        { text: 'Not Ready', value: 'notready' },
        { text: 'Decommissioned', value: 'decom' },
      ],
      onFilter: (value: unknown, record: ModuleReadiness) => {
        if (value === 'decom') return record.decommissioned;
        if (value === 'ready') return record.readyForDecommission && !record.decommissioned;
        return !record.readyForDecommission && !record.decommissioned;
      },
    },
  ];

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 28, color: '#1677ff' }} />
              <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 8 }}>{avgChecklist}%</div>
              <Text type="secondary">Avg Checklist Progress</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 28, color: '#52c41a' }} />
              <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 8, color: '#52c41a' }}>{readyForDecom}</div>
              <Text type="secondary">Ready for Decom</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, color: '#722ed1' }}>
                <SafetyCertificateOutlined />
              </div>
              <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 8, color: '#722ed1' }}>{alreadyDecom}</div>
              <Text type="secondary">Decommissioned</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, color: '#1677ff' }}>
                <CheckCircleOutlined />
              </div>
              <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 8, color: '#1677ff' }}>{dvPassed}</div>
              <Text type="secondary">Data Validation Passed</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="table"
        type="card"
        items={[
          {
            key: 'table',
            label: 'Readiness Matrix',
            children: (
              <Card bordered={false}>
                <Table
                  dataSource={data.modules}
                  columns={columns}
                  rowKey="moduleId"
                  size="middle"
                  pagination={{ pageSize: 15, showSizeChanger: true }}
                  scroll={{ x: 1000 }}
                />
              </Card>
            ),
          },
          {
            key: 'chart',
            label: 'Checklist Progress Chart',
            children: (
              <Card bordered={false} title="Cutover Checklist — Items Completed vs Remaining">
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={checklistChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#52c41a" name="Completed" />
                    <Bar dataKey="remaining" stackId="a" fill="#ff4d4f" name="Remaining" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
