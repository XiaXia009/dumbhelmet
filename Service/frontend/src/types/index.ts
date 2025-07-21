export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'worker';
  avatar?: string;
  department?: string;
  phone?: string;
  createdAt: Date;
}

export interface HelmetDevice {
  id: string;
  deviceId: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  batteryLevel: number;
  assignedTo?: string;
  lastSeen: Date;
  location?: {
    x: number;
    y: number;
    zone: string;
  };
}

export interface UWBZone {
  id: string;
  name: string;
  type: 'safe' | 'warning' | 'danger';
  coordinates: Array<{x: number; y: number}>;
  isActive: boolean;
  description?: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalPersonnel: number;
  onlineDevices: number;
  activeZones: number;
  safetyAlerts: number;
  currentShift: string;
  weatherCondition: string;
}