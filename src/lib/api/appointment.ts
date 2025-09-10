import { http } from '@/lib/api/http';

export type Appointment = {
	id: number;
	externalId: string;
	clientExternalId: string;
	clientId: number;
	scheduledAt: string; // ISO 8601
	status?: 'pending' | 'confirmed' | 'cancelled';
	createdAt: string;
	updatedAt: string;
	client: {
		id: number;
		externalId: string;
		name: string;
		email: string;
		phone: string;
		createdAt: string;
		updatedAt: string;
	};
};

export type AppointmentMeta = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export type AppointmentResponse = {
	success: boolean;
	code: string;
	message: string;
	data: Appointment[];
	meta: AppointmentMeta;
	traceId: string;
};

export const fetchAppointments = async (params: { page?: number; pageSize?: number; from?: string; status?: string } = {}): Promise<{ data: Appointment[]; meta: AppointmentMeta }> => {
	const { page = 1, pageSize = 10, from, status } = params;
	const queryParams: any = { page, pageSize };
	if (from) {
		queryParams.from = from;
	}
	if (status) {
		queryParams.status = status;
	}
	const res = await http.get('/appointments', { params: queryParams });
	const response = res.data as AppointmentResponse;
	return {
		data: response.data,
		meta: response.meta
	};
};

export const createAppointment = async (payload: { clientId: number; scheduledAt: string }): Promise<Appointment> => {
	const res = await http.post('/appointments', payload);
	return res.data as Appointment;
};


export const fetchAppointmentById = async (id: number | string): Promise<Appointment> => {
	const res = await http.get(`/appointments/${id}`);
	// The API returns the appointment nested under 'data'
	return res.data.data as Appointment;
};

export const updateAppointment = async (
	params: { id: number | string; scheduledAt?: string; status?: 'pending' | 'confirmed' | 'cancelled' }
): Promise<Appointment> => {
	const { id, ...body } = params;
	const res = await http.patch(`/appointments/${id}`, body);
	// some endpoints return the updated entity directly, others nest under data
	return res.data?.data ?? (res.data as Appointment);
};

export const cancelAppointment = async (id: number | string): Promise<Appointment> => {
	const res = await http.patch(`/appointments/${id}/cancel`);
	// The API returns the cancelled appointment nested under 'data'
	return res.data.data as Appointment;
};


