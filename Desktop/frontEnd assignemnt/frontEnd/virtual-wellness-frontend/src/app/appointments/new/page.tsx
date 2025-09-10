"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClients } from '@/lib/api/client';
import { createAppointment } from '@/lib/api/appointment';
import { toIsoUtc } from '@/lib/utils/datetime';
import { toast } from 'sonner';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';

const schema = z.object({
	clientId: z.string().min(1, ERROR_MESSAGES.CLIENT_REQUIRED),
	date: z.string().min(1, ERROR_MESSAGES.DATETIME_REQUIRED),
	time: z.string().min(1, ERROR_MESSAGES.DATETIME_REQUIRED)
});

type FormValues = z.infer<typeof schema>;

export default function NewAppointmentPage() {
	const qc = useQueryClient();
	const router = useRouter();
	const [selectedClient, setSelectedClient] = useState<{ name: string } | null>(null);
	const [selectedDate, setSelectedDate] = useState('');
	const [selectedTime, setSelectedTime] = useState('');

	const { data: clientsData } = useQuery({
		queryKey: ['clients', '', 1, 100],
		queryFn: () => fetchClients({ q: '', page: 1, pageSize: 100 }),
		staleTime: 60_000
	});

	const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormValues>({
		resolver: zodResolver(schema)
	});

	const watchedClientId = watch('clientId');
	const watchedDate = watch('date');
	const watchedTime = watch('time');

	// Update selected client when form changes
	useEffect(() => {
		if (watchedClientId && clientsData?.data) {
			const client = clientsData.data.find(c => c.id.toString() === watchedClientId);
			setSelectedClient(client || null);
		}
	}, [watchedClientId, clientsData]);

	// Update selected date/time when form changes
	useEffect(() => {
		setSelectedDate(watchedDate);
		setSelectedTime(watchedTime);
	}, [watchedDate, watchedTime]);

	const { mutateAsync } = useMutation({
		mutationFn: createAppointment,
		onSuccess: () => {
			toast.success(SUCCESS_MESSAGES.APPOINTMENT_CREATED);
			qc.invalidateQueries({ queryKey: ['appointments'] });
			qc.invalidateQueries({ queryKey: ['dashboard'] });
			router.push('/appointments');
		},
		onError: (err: Error) => {
			toast.error(err?.message || ERROR_MESSAGES.UNKNOWN);
		}
	});

	const formatDateTime = (date: string, time: string) => {
		if (!date || !time) return '';
		const dateObj = new Date(`${date}T${time}`);
		return dateObj.toLocaleDateString('en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}) + ' at ' + dateObj.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	return (
		<ProtectedRoute>
		<div className="flex-1 bg-gray-50 py-12">
			<div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
				<div className="rounded-md border border-gray-200 bg-white shadow-sm">
					<div className="border-b border-gray-200 px-6 py-5">
						<h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
							Schedule New Appointment
						</h1>
						<p className="mt-1 text-sm text-gray-600">
							Fill in the details below to create a new appointment for a client.
						</p>
					</div>
					<form 
						className="p-6"
						onSubmit={handleSubmit(async (values) => {
							const iso = new Date(`${values.date}T${values.time}`);
							await mutateAsync({ 
								clientId: parseInt(values.clientId), 
								scheduledAt: toIsoUtc(iso) 
							});
						})}
					>
						<div className="space-y-6">
							<div>
								<label className="form-label" htmlFor="client">Select Client</label>
								<div className="relative">
									<select 
										className="form-input" 
										id="client"
										{...register('clientId')}
									>
										<option value="">Select a client</option>
										{clientsData?.data?.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name}
											</option>
										))}
									</select>
								</div>
								{errors.clientId && (
									<p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
								)}
							</div>
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
								<div>
									<label className="form-label" htmlFor="date">Date</label>
									<div className="relative">
										<input 
											className="form-input" 
											id="date" 
											type="date"
											min={new Date().toISOString().split('T')[0]}
											{...register('date')}
										/>
									</div>
									{errors.date && (
										<p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
									)}
								</div>
								<div>
									<label className="form-label" htmlFor="time">Time</label>
									<div className="relative">
										<input 
											className="form-input" 
											id="time" 
											type="time"
											{...register('time')}
										/>
									</div>
									{errors.time && (
										<p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
									)}
								</div>
							</div>
						</div>
						<div className="mt-8 border-t border-gray-200 pt-6">
							<h2 className="text-lg font-medium text-gray-900">
								Appointment Summary
							</h2>
							<div className="mt-4 space-y-4">
								<div className="flex justify-between rounded-md bg-gray-50 p-4">
									<p className="font-medium text-gray-600">Client:</p>
									<p className="text-gray-800">{selectedClient?.name || 'Not selected'}</p>
								</div>
								<div className="flex justify-between rounded-md bg-gray-50 p-4">
									<p className="font-medium text-gray-600">Date & Time:</p>
									<p className="text-gray-800">{formatDateTime(selectedDate, selectedTime) || 'Not selected'}</p>
								</div>
							</div>
						</div>
						<div className="mt-8 flex justify-end gap-4">
							<Link 
								href="/appointments"
								className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
							>
								Cancel
							</Link>
							<button 
								type="submit"
								disabled={isSubmitting}
								className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
							>
								{isSubmitting ? 'Scheduling...' : 'Confirm and Schedule'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		</ProtectedRoute>
	);
}