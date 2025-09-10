"use client";

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAppointmentById, updateAppointment } from '@/lib/api/appointment';
import { toIsoUtc } from '@/lib/utils/datetime';
import { toast } from 'sonner';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';

const schema = z.object({
  date: z.string().min(1, ERROR_MESSAGES.DATETIME_REQUIRED),
  time: z.string().min(1, ERROR_MESSAGES.DATETIME_REQUIRED),
  status: z.enum(['pending', 'confirmed', 'cancelled'])
});

type FormValues = z.infer<typeof schema>;

export default function EditAppointmentPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = useMemo(() => {
    const raw = (params as { id?: string | string[] })?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const { data: appointment, isLoading, isError, error } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => fetchAppointmentById(id as string),
    enabled: !!id
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (appointment) {
      const dt = new Date(appointment.scheduledAt);
      
      // Check if date is valid
      if (isNaN(dt.getTime())) {
        return;
      }
      
      const date = dt.toISOString().split('T')[0];
      const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      reset({
        date,
        time,
        status: (appointment.status as 'pending' | 'confirmed' | 'cancelled') || 'pending'
      });
    }
  }, [appointment, reset]);

  if (isError) {
    toast.error((error as Error)?.message || ERROR_MESSAGES.UNKNOWN);
  }

  const { mutateAsync } = useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.APPOINTMENT_UPDATED);
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      router.push('/appointments');
    },
    onError: (err: Error) => {
      toast.error(err?.message || ERROR_MESSAGES.UNKNOWN);
    }
  });

  return (
    <ProtectedRoute>
      <div className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
                Edit Appointment
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Update the appointment details below.
              </p>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-6">
                <div className="h-10 bg-gray-100 rounded" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="h-10 bg-gray-100 rounded" />
                  <div className="h-10 bg-gray-100 rounded" />
                </div>
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            ) : isError ? (
              <div className="p-6 text-center">
                <div className="text-red-600">
                  <h3 className="text-lg font-medium mb-2">Error loading appointment</h3>
                  <p className="text-sm">{(error as Error)?.message || 'Failed to load appointment data'}</p>
                  <Link 
                    href="/appointments"
                    className="mt-4 inline-block rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Back to Appointments
                  </Link>
                </div>
              </div>
            ) : (
              <form 
                className="p-6"
                onSubmit={handleSubmit(async (values) => {
                  const iso = new Date(`${values.date}T${values.time}`);
                  
                  // Validate the constructed date
                  if (isNaN(iso.getTime())) {
                    toast.error('Invalid date or time selected');
                    return;
                  }
                  
                  await mutateAsync({ 
                    id: id as string,
                    scheduledAt: toIsoUtc(iso),
                    status: values.status
                  });
                })}
              >
                <div className="space-y-6">
                  <div>
                    <label className="form-label" htmlFor="client">Client</label>
                    <div className="relative">
                      <select 
                        className="form-input"
                        id="client"
                        disabled
                        value={appointment?.client?.externalId || ''}
                        onChange={() => {}}
                      >
                        {appointment?.client && (
                          <option value={appointment.client.externalId}>
                            {appointment.client.name}
                          </option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="form-label" htmlFor="date">Date</label>
                      <div className="relative">
                        <input 
                          className="form-input" 
                          id="date" 
                          type="date"
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

                  <div>
                    <label className="form-label" htmlFor="status">Status</label>
                    <div className="relative">
                      <select 
                        className="form-input" 
                        id="status"
                        {...register('status')}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
