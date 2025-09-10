import { http } from '@/lib/api/http';

export type DashboardCard = {
  totalClients: number;
  upcomingAppointments: number;
  thisWeek: number;
  activeClients: number;
};

export type DashboardClient = {
  id: number;
  externalId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardAppointment = {
  id: number;
  externalId: string;
  clientExternalId: string;
  clientId: number;
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
  client: DashboardClient;
};

export type DashboardData = {
  cards: DashboardCard;
  recentClients: DashboardClient[];
  upcomingAppointmentsList: DashboardAppointment[];
};

export type DashboardResponse = {
  success: boolean;
  code: string;
  message: string;
  data: DashboardData;
  traceId: string;
};

export const fetchDashboard = async (): Promise<DashboardData> => {
  const res = await http.get('/dashboard');
  const response = res.data as DashboardResponse;
  return response.data;
};
