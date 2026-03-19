import { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Tag, Statistic, Alert, Spin, Table, Typography, Badge } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { projectApi } from '../services/api';
import type { ExecSummaryResponse } from '../types';

const { Title, Text } = Typography;

const PROJECT_ID = 1;

const ragColors: Record<string, string> = {
  RED: '#ff4d4f',
  AMBER: '#faad14',
  GREEN: '#52c41a',
};

export default function ExecSummaryPage() {
  const [data, setData] = useState<ExecSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.getSummary(PROJECT_ID).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!data) return <Alert type="error" message="Failed to load dashboard data" />;

  const completedModules = data.migratedModules + data.validatedModules + data.decommissionedModules;

  return (
    <div>
      {data.budgetAlertTriggered && (
        <Alert
          message="Budget Alert"
          description="Actual spend has exceeded 90% of planned budget for the current phase."
          type="warning"
          showIcon
          icon={<AlertOutlined />}
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Overall Progress */}
        <Col xs={24} lg={8}>
          <Card title="Overall Migration Progress" bordered={false}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="dashboard"
                percent={Math.round(data.overallProgressPercent)}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                size={180}
              />
              <div style={{ marginTop: 16 }}>
                <Row gutter={8}>
                  <Col span={8}>
                    <Statistic title="Total" value={data.totalModules} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Completed" value={completedModules} valueStyle={{ color: '#52c41a' }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Remaining" value={data.totalModules - completedModules} valueStyle={{ color: '#faad14' }} />
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </Col>

        {/* Escalations & Alerts */}
        <Col xs={24} lg={8}>
          <Card title="Escalations & Alerts" bordered={false}>
            <Row gutter={[16, 24]}>
              <Col span={12}>
                <Statistic
                  title="Open Escalations"
                  value={data.openEscalations}
                  valueStyle={{ color: data.openEscalations > 0 ? '#ff4d4f' : '#52c41a' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="SLA Breaches"
                  value={data.slaBreachedEscalations}
                  valueStyle={{ color: data.slaBreachedEscalations > 0 ? '#ff4d4f' : '#52c41a' }}
                  prefix={<WarningOutlined />}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 24 }}>
              <Text strong>Module Status Breakdown</Text>
              <div style={{ marginTop: 12 }}>
                <Row gutter={[8, 8]}>
                  <Col span={12}><Badge color="#52c41a" text={`Migrated: ${data.migratedModules}`} /></Col>
                  <Col span={12}><Badge color="#1677ff" text={`Validated: ${data.validatedModules}`} /></Col>
                  <Col span={12}><Badge color="#722ed1" text={`Decommissioned: ${data.decommissionedModules}`} /></Col>
                  <Col span={12}><Badge color="#faad14" text={`Remaining: ${data.totalModules - completedModules}`} /></Col>
                </Row>
              </div>
            </div>
          </Card>
        </Col>

        {/* Top 5 Risks */}
        <Col xs={24} lg={8}>
          <Card title="Top 5 Risks (Unresolved)" bordered={false} style={{ height: '100%' }}>
            {data.topRisks.map((risk, idx) => (
              <div key={risk.id} style={{ marginBottom: 12, padding: 8, background: '#fafafa', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Tag color={risk.severity === 'CRITICAL' ? 'red' : risk.severity === 'HIGH' ? 'orange' : risk.severity === 'MEDIUM' ? 'gold' : 'green'}>
                    {risk.severity}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>{risk.owner}</Text>
                </div>
                <Text style={{ fontSize: 13 }}>{risk.description.slice(0, 80)}...</Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Wave RAG Status Cards */}
      <Card title="Wave RAG Status" style={{ marginTop: 16 }} bordered={false}>
        <Row gutter={[16, 16]}>
          {data.waveRagSummaries.map((wave) => (
            <Col xs={24} sm={12} md={8} lg={4} key={wave.waveId} style={{ minWidth: 180 }}>
              <Card
                size="small"
                style={{
                  borderLeft: `4px solid ${ragColors[wave.ragStatus]}`,
                  cursor: 'pointer',
                }}
                hoverable
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 13 }}>{wave.waveName}</Text>
                  {wave.ragStatus === 'GREEN' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  {wave.ragStatus === 'AMBER' && <ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                  {wave.ragStatus === 'RED' && <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                </div>
                <Progress
                  percent={wave.totalModules > 0 ? Math.round((wave.completedModules / wave.totalModules) * 100) : 0}
                  strokeColor={ragColors[wave.ragStatus]}
                  size="small"
                  style={{ marginTop: 8 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {wave.completedModules}/{wave.totalModules} modules
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Burndown Chart */}
        <Col xs={24} lg={12}>
          <Card title="Migration Burndown — Planned vs Actual" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.burndownData.filter(p => p.actual >= 0 || p.planned >= 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="planned" stroke="#1677ff" strokeWidth={2} name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#52c41a" strokeWidth={2} name="Actual" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Budget Burn Rate */}
        <Col xs={24} lg={12}>
          <Card title="Budget Burn Rate — Cumulative Spend vs Plan" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`} />
                <Legend />
                <Line type="monotone" dataKey="cumulativePlanned" stroke="#1677ff" strokeWidth={2} name="Planned (Cumulative)" />
                <Line type="monotone" dataKey="cumulativeActual" stroke="#ff4d4f" strokeWidth={2} name="Actual (Cumulative)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
