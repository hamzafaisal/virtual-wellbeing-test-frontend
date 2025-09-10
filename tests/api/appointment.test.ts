import { fetchAppointments, createAppointment } from '@/lib/api/appointment';
import { http } from '@/lib/api/http';

jest.mock('@/lib/api/http', () => {
	const actual = jest.requireActual('@/lib/api/http');
	return {
		...actual,
		http: {
			get: jest.fn(),
			post: jest.fn()
		}
	};
});

describe('appointments api', () => {
	it('fetchAppointments calls GET with query params', async () => {
		const mockedGet = http.get as jest.Mock;
		mockedGet.mockResolvedValueOnce({ data: { data: [], page: 1, pageSize: 10, total: 0 } });
		await fetchAppointments({ from: '2025-01-01T00:00:00Z', page: 2, pageSize: 5 });
		expect(mockedGet).toHaveBeenCalledWith('/appointments', { params: { from: '2025-01-01T00:00:00Z', page: 2, pageSize: 5 } });
	});

	it('createAppointment posts payload and returns data', async () => {
		const mockedPost = http.post as jest.Mock;
		mockedPost.mockResolvedValueOnce({ data: { id: 'a1', client_id: '1', starts_at: '2025-07-15T09:00:00Z' } });
		const res = await createAppointment({ clientId: 1, scheduledAt: '2025-07-15T09:00:00Z' });
		expect(mockedPost).toHaveBeenCalledWith('/appointments', { clientId: 1, scheduledAt: '2025-07-15T09:00:00Z' });
		expect(res.id).toBe('a1');
	});
});


