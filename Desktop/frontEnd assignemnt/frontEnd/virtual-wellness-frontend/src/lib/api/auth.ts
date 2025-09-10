import { http } from '@/lib/api/http';

export type LoginCredentials = {
	email: string;
	password: string;
};

export type User = {
	id: number;
	email: string;
	name: string;
	role: string;
};

export type LoginResponse = {
	success: boolean;
	code: string;
	message: string;
	data: {
		access_token: string;
		user: User;
	};
	traceId: string;
};

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
	const res = await http.post('/auth/login', credentials);
	return res.data as LoginResponse;
};
