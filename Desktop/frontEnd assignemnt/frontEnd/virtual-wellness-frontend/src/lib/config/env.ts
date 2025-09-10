export const getApiBaseUrl = (): string => {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
	return base.replace(/\/$/, '');
};

export const APP_NAME = 'Virtual Wellness';

