import { create } from 'zustand';

// --- Type Definitions ---

export interface NotificationType {
  id: string;
  type: 'fault' | 'warning' | 'critical' | 'offline' | 'info';
  title: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High' | 'Normal';
  isRead: boolean;
  faults?: string[];
  warnings?: string[];
  timestamp: Date;
}

export interface DataLogType {
  id: string;
  timestamp: Date;
  status: string;
  primaryVoltage: number;
  secondaryVoltage: number;
  primaryCurrent: number;
  secondaryCurrent: number;
  loss: number;
  efficiency: number;
  severity: string;
}

export interface SensorDataType {
  primaryVoltage: number;
  primaryCurrent: number;
  primaryPower: number;
  primaryEnergy: number;
  primaryFrequency: number;
  primaryPowerFactor: number;
  secondaryVoltage: number;
  secondaryCurrent: number;
  secondaryPower: number;
  secondaryEnergy: number;
  secondaryFrequency: number;
  secondaryPowerFactor: number;
  timestamp: string;
}

export interface PredictionResultType {
  status: string;
  faults: string[];
  warnings: string[];
  severity: string;
}

// --- Store Interface ---

interface AppState {
  activePage: string;
  setActivePage: (page: string) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  notifications: NotificationType[];
  addNotification: (notification: NotificationType) => void;
  markAllRead: () => void;
  clearAllNotifications: () => void;
  recentLogs: DataLogType[];
  addRecentLog: (log: DataLogType) => void;
  connectionStatus: 'online' | 'offline';
  setConnectionStatus: (status: 'online' | 'offline') => void;
  sensorData: SensorDataType | null;
  setSensorData: (data: SensorDataType | null) => void;
  predictionResult: PredictionResultType | null;
  setPredictionResult: (result: PredictionResultType | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  activePage: 'home',
  setActivePage: (page) => set({ activePage: page }),

  // Sidebar
  sidebarExpanded: true,
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),

  // Mobile menu
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
  clearAllNotifications: () => set({ notifications: [] }),

  // Recent logs
  recentLogs: [],
  addRecentLog: (log) =>
    set((state) => ({
      recentLogs: [log, ...state.recentLogs].slice(0, 10),
    })),

  // Connection status
  connectionStatus: 'offline',
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Sensor data
  sensorData: null,
  setSensorData: (data) => set({ sensorData: data }),

  // Prediction result
  predictionResult: null,
  setPredictionResult: (result) => set({ predictionResult: result }),
}));
