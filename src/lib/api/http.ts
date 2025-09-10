import axios, { AxiosError } from 'axios';
import { getApiBaseUrl } from '@/lib/config/env';

export const http = axios.create({
	baseURL: getApiBaseUrl(),
	headers: { 'Accept': 'application/json' }
});

// Request interceptor to add bearer token
http.interceptors.request.use(
	(config) => {
		try {
			const token = localStorage.getItem('access_token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		} catch (error) {
			// Handle localStorage access errors (SSR)
			console.warn('localStorage not available:', error);
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export type ApiError = {
	status?: number;
	message: string;
	code?: string;
	details?: unknown;
};

http.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		const status = error.response?.status;
		const data = error.response?.data as any;
		const message = data?.message || error.message || 'Request failed';
		const code = (data?.code as string) || undefined;
		const requestUrl = (error.config?.url as string) || '';
		
		// Handle unauthorized errors
		if (status === 401) {
			const isAuthLoginRequest = requestUrl.includes('/auth/login');
			const isAlreadyOnLogin = typeof window !== 'undefined' && window.location.pathname === '/login';
			if (!isAuthLoginRequest && !isAlreadyOnLogin) {
				// Clear stored authentication
				try {
					localStorage.removeItem('access_token');
					localStorage.removeItem('user');
				} catch (error) {
					console.warn('localStorage not available:', error);
				}
				// Redirect to login page
				if (typeof window !== 'undefined') {
					window.location.href = '/login';
				}
			}
		}
		
		const normalized: ApiError = { status, message, code, details: data?.details };
		return Promise.reject(normalized);
	}
);


