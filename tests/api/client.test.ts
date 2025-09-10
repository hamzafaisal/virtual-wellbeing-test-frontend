import { fetchClients } from '@/lib/api/client';
import { http } from '@/lib/api/http';

jest.mock('@/lib/api/http', () => {
	const actual = jest.requireActual('@/lib/api/http');
	return {
		...actual,
		http: {
			get: jest.fn()
		}
	};
});

describe('fetchClients', () => {
	it('passes params and returns data', async () => {
		const mocked = http.get as jest.Mock;
		mocked.mockResolvedValueOnce({ data: { data: [{ id: '1', name: 'John' }], page: 1, pageSize: 10, total: 1 } });
		const res = await fetchClients({ q: 'jo', page: 2, pageSize: 5 });
		expect(mocked).toHaveBeenCalledWith('/clients', { params: { q: 'jo', page: 2, pageSize: 5 } });
		expect(res.data[0].id).toBe('1');
	});
});


