import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Spin, Alert, Tag, Typography, Row, Col, Table, Space } from 'antd';
import { projectApi } from '../services/api';
import type { DependencyResponse, DependencyNode, DependencyEdge } from '../types';

const { Title, Text } = Typography;
const PROJECT_ID = 1;

const statusColors: Record<string, string> = {
  NOT_STARTED: '#d9d9d9',
  IN_PROGRESS: '#faad14',
  MIGRATED: '#52c41a',
  VALIDATED: '#1677ff',
  DECOMMISSIONED: '#722ed1',
};

const domainColors: Record<string, string> = {
  'Payments': '#1677ff',
  'Lending': '#52c41a',
  'Core Banking': '#722ed1',
};

export default function DependencyMapPage() {
  const [data, setData] = useState<DependencyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.getDependencies(PROJECT_ID).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!data) return <Alert type="error" message="Failed to load dependency data" />;

  const criticalNodes = data.nodes
    .filter((n) => data.criticalPath.includes(n.id))
    .sort((a, b) => b.downstreamCount - a.downstreamCount);

  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));

  const edgeTableData = data.edges.map((e, idx) => ({
    key: idx,
    fromName: nodeMap.get(e.from)?.name || `Module ${e.from}`,
    fromDomain: nodeMap.get(e.from)?.domain || '',
    toName: nodeMap.get(e.to)?.name || `Module ${e.to}`,
    toDomain: nodeMap.get(e.to)?.domain || '',
    type: e.type,
  }));

  // Build SVG dependency graph
  const domains = ['Payments', 'Lending', 'Core Banking'];
  const nodesByDomain = new Map<string, DependencyNode[]>();
  for (const n of data.nodes) {
    const list = nodesByDomain.get(n.domain) || [];
    list.push(n);
    nodesByDomain.set(n.domain, list);
  }

  // Position nodes
  const nodePositions = new Map<number, { x: number; y: number }>();
  const svgWidth = 960;
  const colWidth = svgWidth / domains.length;
  const nodeRadius = 18;
  domains.forEach((domain, colIdx) => {
    const domainNodes = nodesByDomain.get(domain) || [];
    domainNodes.forEach((n, rowIdx) => {
      nodePositions.set(n.id, {
        x: colIdx * colWidth + colWidth / 2,
        y: 60 + rowIdx * 42,
      });
    });
  });

  const maxY = Math.max(...Array.from(nodePositions.values()).map((p) => p.y)) + 60;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Module Dependency Graph" bordered={false}>
            <div style={{ overflow: 'auto', maxHeight: 700 }}>
              <svg width={svgWidth} height={Math.max(maxY, 400)} style={{ background: '#fafafa', borderRadius: 8 }}>
                {/* Domain headers */}
                {domains.map((domain, idx) => (
                  <g key={domain}>
                    <rect
                      x={idx * colWidth + 4}
                      y={4}
                      width={colWidth - 8}
                      height={30}
                      rx={6}
                      fill={domainColors[domain] || '#999'}
                      opacity={0.15}
                    />
                    <text
                      x={idx * colWidth + colWidth / 2}
                      y={24}
                      textAnchor="middle"
                      fontSize={13}
                      fontWeight="bold"
                      fill={domainColors[domain] || '#333'}
                    >
                      {domain}
                    </text>
                  </g>
                ))}

                {/* Edges */}
                {data.edges.map((edge, idx) => {
                  const from = nodePositions.get(edge.from);
                  const to = nodePositions.get(edge.to);
                  if (!from || !to) return null;
                  const isCritical = data.criticalPath.includes(edge.from);
                  return (
                    <line
                      key={idx}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={isCritical ? '#ff4d4f' : '#bfbfbf'}
                      strokeWidth={isCritical ? 2 : 1}
                      strokeDasharray={edge.type === 'DEPENDS_ON' ? '4,4' : undefined}
                      markerEnd="url(#arrow)"
                    />
                  );
                })}

                {/* Arrow marker */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#999" />
                  </marker>
                </defs>

                {/* Nodes */}
                {data.nodes.map((node) => {
                  const pos = nodePositions.get(node.id);
                  if (!pos) return null;
                  const isCritical = data.criticalPath.includes(node.id);
                  return (
                    <g key={node.id}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={nodeRadius}
                        fill={statusColors[node.status] || '#d9d9d9'}
                        stroke={isCritical ? '#ff4d4f' : '#fff'}
                        strokeWidth={isCritical ? 3 : 2}
                      />
                      <text
                        x={pos.x + nodeRadius + 4}
                        y={pos.y + 4}
                        fontSize={10}
                        fill="#333"
                      >
                        {node.name.length > 25 ? node.name.slice(0, 22) + '...' : node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {Object.entries(statusColors).map(([status, color]) => (
                <Space key={status} size={4}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '1px solid #d9d9d9' }} />
                  <Text style={{ fontSize: 11 }}>{status.replace(/_/g, ' ')}</Text>
                </Space>
              ))}
              <Space size={4}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', border: '3px solid #ff4d4f' }} />
                <Text style={{ fontSize: 11 }}>Critical Path</Text>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Critical Path — Top Blockers" bordered={false} style={{ marginBottom: 16 }}>
            {criticalNodes.slice(0, 10).map((node, idx) => (
              <div
                key={node.id}
                style={{
                  padding: '8px 12px',
                  marginBottom: 8,
                  background: idx < 3 ? '#fff2f0' : '#fafafa',
                  borderRadius: 8,
                  borderLeft: `3px solid ${idx < 3 ? '#ff4d4f' : '#faad14'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 13 }}>{node.name}</Text>
                  <Tag color={idx < 3 ? 'red' : 'orange'}>{node.downstreamCount} downstream</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {node.domain} • {node.status.replace(/_/g, ' ')}
                </Text>
              </div>
            ))}
          </Card>

          <Card title="All Dependencies" bordered={false} size="small">
            <Table
              dataSource={edgeTableData}
              columns={[
                { title: 'From', dataIndex: 'fromName', key: 'from', ellipsis: true },
                { title: 'To', dataIndex: 'toName', key: 'to', ellipsis: true },
                {
                  title: 'Type', dataIndex: 'type', key: 'type',
                  render: (t: string) => <Tag color={t === 'BLOCKS' ? 'red' : 'blue'}>{t}</Tag>,
                },
              ]}
              size="small"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 300 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
