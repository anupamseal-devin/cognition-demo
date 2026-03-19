import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Select, Input, Spin, Tabs, Typography, Badge, Space, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { projectApi } from '../services/api';
import type { ModuleResponse, BlockerResponse, DefectTrendResponse } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;
const PROJECT_ID = 1;

const statusColors: Record<string, string> = {
  NOT_STARTED: 'default',
  IN_PROGRESS: 'processing',
  MIGRATED: 'success',
  VALIDATED: 'blue',
  DECOMMISSIONED: 'purple',
};

const blockerCatColors: Record<string, string> = {
  TECHNICAL: '#1677ff',
  REGULATORY: '#722ed1',
  DATA: '#faad14',
  VENDOR: '#ff4d4f',
  ENVIRONMENT: '#13c2c2',
};

export default function DeliveryDetailPage() {
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [blockers, setBlockers] = useState<BlockerResponse[]>([]);
  const [defects, setDefects] = useState<DefectTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    Promise.all([
      projectApi.getModules(PROJECT_ID),
      projectApi.getBlockers(PROJECT_ID),
      projectApi.getDefects(PROJECT_ID),
    ]).then(([m, b, d]) => {
      setModules(m);
      setBlockers(b);
      setDefects(d);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const filteredModules = modules.filter((m) => {
    if (domainFilter && m.domain !== domainFilter) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    if (searchText && !m.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const moduleColumns = [
    { title: 'Module', dataIndex: 'name', key: 'name', sorter: (a: ModuleResponse, b: ModuleResponse) => a.name.localeCompare(b.name) },
    { title: 'Domain', dataIndex: 'domain', key: 'domain', render: (d: string) => <Tag>{d}</Tag> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={statusColors[s]}>{s.replace(/_/g, ' ')}</Tag>,
    },
    { title: 'Owner', dataIndex: 'owner', key: 'owner' },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', sorter: (a: ModuleResponse, b: ModuleResponse) => a.priority - b.priority },
    { title: 'Wave', dataIndex: 'waveNames', key: 'wave', render: (w: string[]) => w.join(', ') || '-' },
    {
      title: 'Blockers', dataIndex: 'blockerCount', key: 'blockers',
      render: (c: number) => c > 0 ? <Badge count={c} style={{ backgroundColor: '#ff4d4f' }} /> : <Text type="secondary">0</Text>,
    },
    {
      title: 'Defects', dataIndex: 'defectCount', key: 'defects',
      render: (c: number) => c > 0 ? <Badge count={c} style={{ backgroundColor: '#faad14' }} /> : <Text type="secondary">0</Text>,
    },
  ];

  // Blocker board data grouped by category
  const blockerByCategory = ['TECHNICAL', 'REGULATORY', 'DATA', 'VENDOR', 'ENVIRONMENT'].map((cat) => ({
    category: cat,
    blockers: blockers.filter((b) => b.category === cat).sort((a, b) => b.ageDays - a.ageDays),
  }));

  const teamVelocityData = [
    { name: 'Payments Alpha', velocity: 32, target: 35 },
    { name: 'Payments Beta', velocity: 28, target: 30 },
    { name: 'Lending', velocity: 35, target: 32 },
    { name: 'Core Banking', velocity: 30, target: 33 },
    { name: 'Integration', velocity: 25, target: 28 },
    { name: 'Data Migration', velocity: 38, target: 35 },
    { name: 'QA & Validation', velocity: 22, target: 25 },
    { name: 'DevOps', velocity: 18, target: 20 },
  ];

  return (
    <Tabs
      defaultActiveKey="modules"
      type="card"
      items={[
        {
          key: 'modules',
          label: 'Module List',
          children: (
            <Card bordered={false}>
              <Space style={{ marginBottom: 16 }} wrap>
                <Input
                  placeholder="Search modules..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select
                  placeholder="Filter by domain"
                  allowClear
                  style={{ width: 180 }}
                  value={domainFilter}
                  onChange={setDomainFilter}
                >
                  <Option value="Payments">Payments</Option>
                  <Option value="Lending">Lending</Option>
                  <Option value="Core Banking">Core Banking</Option>
                </Select>
                <Select
                  placeholder="Filter by status"
                  allowClear
                  style={{ width: 180 }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="NOT_STARTED">Not Started</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="MIGRATED">Migrated</Option>
                  <Option value="VALIDATED">Validated</Option>
                  <Option value="DECOMMISSIONED">Decommissioned</Option>
                </Select>
              </Space>
              <Table
                dataSource={filteredModules}
                columns={moduleColumns}
                rowKey="id"
                size="middle"
                pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} modules` }}
                scroll={{ x: 900 }}
              />
            </Card>
          ),
        },
        {
          key: 'blockers',
          label: `Blocker Board (${blockers.filter(b => b.status === 'OPEN').length} open)`,
          children: (
            <Row gutter={[12, 12]}>
              {blockerByCategory.map((group) => (
                <Col xs={24} sm={12} lg={Math.floor(24 / 5)} key={group.category} style={{ minWidth: 220 }}>
                  <Card
                    size="small"
                    title={
                      <Space>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: blockerCatColors[group.category] }} />
                        <Text strong>{group.category}</Text>
                        <Badge count={group.blockers.length} style={{ backgroundColor: '#999' }} />
                      </Space>
                    }
                    style={{ height: '100%' }}
                    bodyStyle={{ maxHeight: 500, overflow: 'auto' }}
                  >
                    {group.blockers.map((b) => (
                      <Card
                        key={b.id}
                        size="small"
                        style={{
                          marginBottom: 8,
                          borderLeft: `3px solid ${b.status === 'OPEN' ? '#ff4d4f' : '#52c41a'}`,
                          background: b.status === 'OPEN' ? '#fff2f0' : '#f6ffed',
                        }}
                      >
                        <Text style={{ fontSize: 12 }}>{b.description.slice(0, 80)}</Text>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>{b.moduleName}</Text>
                          <Tag color={b.ageDays > 30 ? 'red' : b.ageDays > 14 ? 'orange' : 'blue'} style={{ fontSize: 10 }}>
                            {b.ageDays}d
                          </Tag>
                        </div>
                      </Card>
                    ))}
                    {group.blockers.length === 0 && <Text type="secondary">No blockers</Text>}
                  </Card>
                </Col>
              ))}
            </Row>
          ),
        },
        {
          key: 'velocity',
          label: 'Team Velocity',
          children: (
            <Card bordered={false} title="Team Velocity — Current Sprint">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={teamVelocityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <RTooltip />
                  <Legend />
                  <Bar dataKey="velocity" fill="#1677ff" name="Actual Velocity" />
                  <Bar dataKey="target" fill="#d9d9d9" name="Target Velocity" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          ),
        },
        {
          key: 'defects',
          label: `Defect Trend (${defects?.totalDefects || 0})`,
          children: defects ? (
            <Card bordered={false}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Statistic title="Critical" value={defects.criticalDefects} valueStyle={{ color: '#ff4d4f' }} /></Col>
                <Col span={6}><Statistic title="High" value={defects.highDefects} valueStyle={{ color: '#fa8c16' }} /></Col>
                <Col span={6}><Statistic title="Medium" value={defects.mediumDefects} valueStyle={{ color: '#faad14' }} /></Col>
                <Col span={6}><Statistic title="Low" value={defects.lowDefects} valueStyle={{ color: '#52c41a' }} /></Col>
              </Row>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={defects.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <RTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="critical" stroke="#ff4d4f" strokeWidth={2} name="Critical" />
                  <Line type="monotone" dataKey="high" stroke="#fa8c16" strokeWidth={2} name="High" />
                  <Line type="monotone" dataKey="medium" stroke="#faad14" strokeWidth={2} name="Medium" />
                  <Line type="monotone" dataKey="low" stroke="#52c41a" strokeWidth={2} name="Low" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          ) : null,
        },
      ]}
    />
  );
}

function Statistic({ title, value, valueStyle }: { title: string; value: number; valueStyle?: React.CSSProperties }) {
  return (
    <Card size="small">
      <Text type="secondary">{title}</Text>
      <div style={{ fontSize: 24, fontWeight: 'bold', ...valueStyle }}>{value}</div>
    </Card>
  );
}
