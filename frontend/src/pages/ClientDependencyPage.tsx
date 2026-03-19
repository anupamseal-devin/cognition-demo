import { useState, useEffect } from 'react';
import { Card, Table, Tag, Spin, Alert, Typography, Row, Col, Statistic, Space, Badge, Button } from 'antd';
import {
  ClockCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { projectApi } from '../services/api';
import type { EscalationResponse, BlockerResponse } from '../types';

const { Text, Title } = Typography;
const PROJECT_ID = 1;

export default function ClientDependencyPage() {
  const [escalations, setEscalations] = useState<EscalationResponse[]>([]);
  const [blockers, setBlockers] = useState<BlockerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectApi.getEscalations(PROJECT_ID),
      projectApi.getBlockers(PROJECT_ID),
    ]).then(([e, b]) => {
      setEscalations(e);
      setBlockers(b);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  // Client-caused blockers (VENDOR, ENVIRONMENT categories are often client-dependent)
  const clientBlockers = blockers
    .filter((b) => ['VENDOR', 'ENVIRONMENT', 'REGULATORY'].includes(b.category) && b.status === 'OPEN')
    .sort((a, b) => b.ageDays - a.ageDays);

  const openEscalations = escalations.filter((e) => e.status === 'OPEN');
  const slaBreached = escalations.filter((e) => e.slaBreached);
  const avgAge = openEscalations.length > 0
    ? Math.round(openEscalations.reduce((s, e) => s + e.ageDays, 0) / openEscalations.length)
    : 0;

  const escalationColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 400,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'OPEN' ? 'red' : 'green'}>{s}</Tag>
      ),
    },
    {
      title: 'Raised Date',
      dataIndex: 'raisedDate',
      key: 'raisedDate',
      sorter: (a: EscalationResponse, b: EscalationResponse) =>
        (a.raisedDate || '').localeCompare(b.raisedDate || ''),
    },
    {
      title: 'Resolved Date',
      dataIndex: 'resolvedDate',
      key: 'resolvedDate',
      render: (d: string | null) => d || <Text type="secondary">Pending</Text>,
    },
    {
      title: 'Age (Days)',
      dataIndex: 'ageDays',
      key: 'ageDays',
      sorter: (a: EscalationResponse, b: EscalationResponse) => a.ageDays - b.ageDays,
      defaultSortOrder: 'descend' as const,
      render: (days: number, record: EscalationResponse) => (
        <Space>
          <Text
            strong
            style={{
              color: days > 30 ? '#ff4d4f' : days > 14 ? '#faad14' : '#52c41a',
              fontSize: 16,
            }}
          >
            {days}
          </Text>
          {record.slaBreached && (
            <Tag color="red" icon={<WarningOutlined />}>SLA BREACH</Tag>
          )}
        </Space>
      ),
    },
  ];

  const blockerColumns = [
    {
      title: 'Blocker',
      dataIndex: 'description',
      key: 'description',
      width: 350,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (c: string) => <Tag color={c === 'VENDOR' ? 'red' : c === 'ENVIRONMENT' ? 'cyan' : 'purple'}>{c}</Tag>,
    },
    {
      title: 'Module',
      dataIndex: 'moduleName',
      key: 'moduleName',
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: 'Days Waiting',
      dataIndex: 'ageDays',
      key: 'ageDays',
      sorter: (a: BlockerResponse, b: BlockerResponse) => a.ageDays - b.ageDays,
      defaultSortOrder: 'descend' as const,
      render: (days: number) => (
        <Tag
          color={days > 30 ? 'red' : days > 14 ? 'orange' : 'blue'}
          icon={<ClockCircleOutlined />}
        >
          {days} days
        </Tag>
      ),
    },
  ];

  const handleExportCSV = () => {
    const headers = ['Description', 'Category', 'Module', 'Owner', 'Days Waiting', 'Status'];
    const rows = clientBlockers.map((b) => [
      `"${b.description}"`, b.category, b.moduleName, b.owner, b.ageDays.toString(), b.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client-dependencies.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Open Escalations"
              value={openEscalations.length}
              valueStyle={{ color: openEscalations.length > 0 ? '#ff4d4f' : '#52c41a' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="SLA Breaches"
              value={slaBreached.length}
              valueStyle={{ color: slaBreached.length > 0 ? '#ff4d4f' : '#52c41a' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Client Blockers"
              value={clientBlockers.length}
              valueStyle={{ color: clientBlockers.length > 0 ? '#faad14' : '#52c41a' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Avg Days Waiting"
              value={avgAge}
              valueStyle={{ color: avgAge > 20 ? '#ff4d4f' : '#faad14' }}
              suffix="days"
            />
          </Card>
        </Col>
      </Row>

      {/* Client Dependencies Alert */}
      <Alert
        message="Client Dependency Tracker"
        description="This section tracks items pending client action. Delays shown here are attributable to client-side dependencies including approvals, environment access, and SME availability."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Client Blockers Table */}
      <Card
        title={
          <Space>
            <Text strong>Items Pending Client Action</Text>
            <Badge count={clientBlockers.length} style={{ backgroundColor: '#faad14' }} />
          </Space>
        }
        bordered={false}
        extra={
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV} size="small">
            Export CSV
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          dataSource={clientBlockers}
          columns={blockerColumns}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          rowClassName={(record) =>
            record.ageDays > 30 ? 'ant-table-row-danger' : record.ageDays > 14 ? 'ant-table-row-warning' : ''
          }
        />
      </Card>

      {/* Escalation Log */}
      <Card
        title={
          <Space>
            <Text strong>Escalation Log</Text>
            <Badge count={openEscalations.length} style={{ backgroundColor: '#ff4d4f' }} />
          </Space>
        }
        bordered={false}
      >
        <Table
          dataSource={escalations}
          columns={escalationColumns}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}
