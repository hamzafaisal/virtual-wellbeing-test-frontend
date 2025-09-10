import { http } from '@/lib/api/http';

export type Client = {
	id: number;
	externalId: string;
	name: string;
	email?: string | null;
	phone?: string | null;
	createdAt: string;
	updatedAt: string;
};

export type ClientMeta = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export type ClientResponse = {
	success: boolean;
	code: string;
	message: string;
	data: Client[];
	meta: ClientMeta;
	traceId: string;
};

export const fetchClients = async (params: { q?: string; page?: number; pageSize?: number } = {}): Promise<{ data: Client[]; meta: ClientMeta }> => {
	const { q = '', page = 1, pageSize = 10 } = params;
	const queryParams: any = { page, pageSize };
	if (q) {
		queryParams.q = q;
	}
	const res = await http.get('/clients', { params: queryParams });
	const response = res.data as ClientResponse;
	return {
		data: response.data,
		meta: response.meta
	};
};


