export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
}

export interface WaveRagSummary {
  waveId: number;
  waveName: string;
  ragStatus: 'RED' | 'AMBER' | 'GREEN';
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  totalModules: number;
  completedModules: number;
}

export interface BurndownPoint {
  date: string;
  planned: number;
  actual: number;
}

export interface BudgetPoint {
  month: string;
  planned: number;
  actual: number;
  cumulativePlanned: number;
  cumulativeActual: number;
}

export interface RiskSummary {
  id: number;
  severity: string;
  description: string;
  mitigation: string;
  owner: string;
  status: string;
}

export interface ExecSummaryResponse {
  overallProgressPercent: number;
  totalModules: number;
  migratedModules: number;
  validatedModules: number;
  decommissionedModules: number;
  waveRagSummaries: WaveRagSummary[];
  burndownData: BurndownPoint[];
  budgetData: BudgetPoint[];
  openEscalations: number;
  slaBreachedEscalations: number;
  topRisks: RiskSummary[];
  budgetAlertTriggered: boolean;
}

export interface ModuleResponse {
  id: number;
  name: string;
  domain: string;
  status: string;
  owner: string;
  priority: number;
  waveNames: string[];
  blockerCount: number;
  defectCount: number;
}

export interface WaveResponse {
  id: number;
  name: string;
  ragStatus: string;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  modules: ModuleResponse[];
}

export interface BlockerResponse {
  id: number;
  moduleId: number;
  moduleName: string;
  category: string;
  description: string;
  owner: string;
  status: string;
  createdDate: string | null;
  resolvedDate: string | null;
  ageDays: number;
}

export interface DefectWeek {
  week: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface DefectTrendResponse {
  weeklyTrend: DefectWeek[];
  totalDefects: number;
  criticalDefects: number;
  highDefects: number;
  mediumDefects: number;
  lowDefects: number;
}

export interface DependencyNode {
  id: number;
  name: string;
  domain: string;
  status: string;
  downstreamCount: number;
}

export interface DependencyEdge {
  from: number;
  to: number;
  type: string;
}

export interface DependencyResponse {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  criticalPath: number[];
}

export interface ModuleReadiness {
  moduleId: number;
  moduleName: string;
  domain: string;
  status: string;
  totalChecklistItems: number;
  completedChecklistItems: number;
  checklistProgressPercent: number;
  rollbackTestedCount: number;
  rollbackNotTestedCount: number;
  decommissioned: boolean;
  dataValidationPassed: boolean;
  readyForDecommission: boolean;
}

export interface ReadinessResponse {
  modules: ModuleReadiness[];
}

export interface EscalationResponse {
  id: number;
  description: string;
  raisedDate: string | null;
  resolvedDate: string | null;
  slaBreached: boolean;
  ageDays: number;
  status: string;
}

export interface TestCoverageData {
  moduleId: number;
  moduleName: string;
  legacyCoveragePercent: number;
  newCoveragePercent: number;
  regressionPassRatePercent: number;
}

export interface DataValidationData {
  moduleId: number;
  moduleName: string;
  reconciliationStatus: string;
  recordsCompared: number;
  mismatchCount: number;
}
