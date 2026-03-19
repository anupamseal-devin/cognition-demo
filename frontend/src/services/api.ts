import axios from 'axios';
import type {
  AuthResponse,
  ExecSummaryResponse,
  ModuleResponse,
  WaveResponse,
  BlockerResponse,
  RiskSummary,
  DefectTrendResponse,
  DependencyResponse,
  BudgetPoint,
  ReadinessResponse,
  EscalationResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { username, password });
    return data;
  },
};

export const projectApi = {
  getSummary: async (projectId: number): Promise<ExecSummaryResponse> => {
    const { data } = await api.get<ExecSummaryResponse>(`/api/projects/${projectId}/summary`);
    return data;
  },
  getModules: async (projectId: number, params?: Record<string, string>): Promise<ModuleResponse[]> => {
    const { data } = await api.get<ModuleResponse[]>(`/api/projects/${projectId}/modules`, { params });
    return data;
  },
  getWaves: async (projectId: number): Promise<WaveResponse[]> => {
    const { data } = await api.get<WaveResponse[]>(`/api/projects/${projectId}/waves`);
    return data;
  },
  getBlockers: async (projectId: number): Promise<BlockerResponse[]> => {
    const { data } = await api.get<BlockerResponse[]>(`/api/projects/${projectId}/blockers`);
    return data;
  },
  getRisks: async (projectId: number): Promise<RiskSummary[]> => {
    const { data } = await api.get<RiskSummary[]>(`/api/projects/${projectId}/risks`);
    return data;
  },
  getDefects: async (projectId: number): Promise<DefectTrendResponse> => {
    const { data } = await api.get<DefectTrendResponse>(`/api/projects/${projectId}/defects`);
    return data;
  },
  getDependencies: async (projectId: number): Promise<DependencyResponse> => {
    const { data } = await api.get<DependencyResponse>(`/api/projects/${projectId}/dependencies`);
    return data;
  },
  getCost: async (projectId: number): Promise<BudgetPoint[]> => {
    const { data } = await api.get<BudgetPoint[]>(`/api/projects/${projectId}/cost`);
    return data;
  },
  getReadiness: async (projectId: number): Promise<ReadinessResponse> => {
    const { data } = await api.get<ReadinessResponse>(`/api/projects/${projectId}/readiness`);
    return data;
  },
  getEscalations: async (projectId: number): Promise<EscalationResponse[]> => {
    const { data } = await api.get<EscalationResponse[]>(`/api/projects/${projectId}/escalations`);
    return data;
  },
};

export const moduleApi = {
  create: async (request: Record<string, unknown>): Promise<ModuleResponse> => {
    const { data } = await api.post<ModuleResponse>('/api/modules', request);
    return data;
  },
  updateStatus: async (moduleId: number, status: string): Promise<ModuleResponse> => {
    const { data } = await api.patch<ModuleResponse>(`/api/modules/${moduleId}/status`, { status });
    return data;
  },
};

export const blockerApi = {
  create: async (request: Record<string, unknown>): Promise<BlockerResponse> => {
    const { data } = await api.post<BlockerResponse>('/api/blockers', request);
    return data;
  },
};

export default api;
