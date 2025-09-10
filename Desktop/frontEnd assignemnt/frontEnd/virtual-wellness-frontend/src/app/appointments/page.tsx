"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAppointments, updateAppointment, cancelAppointment } from '@/lib/api/appointment';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Plus, Calendar, User, Filter, ChevronLeft, ChevronRight, Eye, X, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [statusFilter, setStatusFilter] = useState<string>('');
	

	// Status change modal state
	const [statusModalOpen, setStatusModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
	const [newStatus, setNewStatus] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');

	// Cancel appointment modal state
	const [cancelModalOpen, setCancelModalOpen] = useState(false);
	const [appointmentToCancel, setAppointmentToCancel] = useState<any>(null);


	const qc = useQueryClient();

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['appointments', page, pageSize, statusFilter],
		queryFn: () => fetchAppointments({ page, pageSize, status: statusFilter || undefined }),
		staleTime: 30_000
	});

	// Status change mutation
	const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useMutation({
		mutationFn: updateAppointment,
		onSuccess: () => {
			toast.success(SUCCESS_MESSAGES.APPOINTMENT_UPDATED);
			qc.invalidateQueries({ queryKey: ['appointments'] });
			qc.invalidateQueries({ queryKey: ['dashboard'] });
			setStatusModalOpen(false);
			setSelectedAppointment(null);
		},
		onError: (err: Error) => {
			toast.error(err?.message || ERROR_MESSAGES.UNKNOWN);
		}
	});

	// Cancel appointment mutation
	const { mutateAsync: cancelAppointmentMutation, isPending: isCancelling } = useMutation({
		mutationFn: cancelAppointment,
		onSuccess: () => {
			toast.success(SUCCESS_MESSAGES.APPOINTMENT_CANCELLED);
			qc.invalidateQueries({ queryKey: ['appointments'] });
			qc.invalidateQueries({ queryKey: ['dashboard'] });
			setCancelModalOpen(false);
			setAppointmentToCancel(null);
		},
		onError: (err: Error) => {
			toast.error(err?.message || ERROR_MESSAGES.UNKNOWN);
		}
	});

	if (isError) {
		toast.error((error as Error)?.message || ERROR_MESSAGES.UNKNOWN);
	}

	const hasBackendStatusFilter = statusFilter; // Status is handled by backend
	const hasAnyFilters = hasBackendStatusFilter;


	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	};

	// Status change handlers
	const openStatusModal = (appointment: any) => {
		setSelectedAppointment(appointment);
		setNewStatus(appointment.status || 'pending');
		setStatusModalOpen(true);
	};

	const handleStatusChange = async () => {
		if (!selectedAppointment) return;
		
		await updateStatus({
			id: selectedAppointment.id,
			status: newStatus
		});
	};

	// Cancel appointment handlers
	const openCancelModal = (appointment: any) => {
		setAppointmentToCancel(appointment);
		setCancelModalOpen(true);
	};

	const handleCancelAppointment = async () => {
		if (!appointmentToCancel) return;
		
		await cancelAppointmentMutation(appointmentToCancel.id);
	};

	return (
		<ProtectedRoute>
		<div className="flex-1 bg-gray-50 py-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-gray-900">Appointments</h1>
						<p className="mt-1 text-sm text-gray-600">
							Manage and view all appointments
						</p>
					</div>
					<Link href="/appointments/new">
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							New Appointment
						</Button>
					</Link>
				</div>

				{/* Status Filter */}
				<div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Filter className="h-5 w-5 text-gray-600" />
							<span className="text-sm font-medium text-gray-700">Filter by status:</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="relative">
								<select
									value={statusFilter}
									onChange={(e) => {
										setStatusFilter(e.target.value);
										setPage(1); // Reset to first page when filter changes
									}}
									className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-gray-400 transition-colors min-w-40 appearance-none cursor-pointer pr-8"
								>
									<option value="">All Appointments</option>
									<option value="pending">Pending</option>
									<option value="confirmed">Confirmed</option>
									<option value="cancelled">Cancelled</option>
								</select>
								<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
									<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</div>
							</div>
							{statusFilter && (
								<button
									onClick={() => {
										setStatusFilter('');
										setPage(1);
									}}
									className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
									title="Clear filter"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
				</div>

				

				{/* Results Summary */}
				{hasAnyFilters && (
					<div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
						<span>Showing {data?.data?.length || 0} appointments</span>
						{statusFilter && (
							<>
								<span>•</span>
								<span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
									{statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
								</span>
							</>
						)}
					</div>
				)}

				{/* Appointments Table */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										CLIENT
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										DATE
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										TIME
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										CREATED AT
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										STATUS
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										ACTION
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{isLoading ? (
									Array.from({ length: 5 }).map((_, i) => (
										<tr key={i} className="animate-pulse">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="h-8 w-8 bg-gray-200 rounded-full"></div>
													<div className="ml-4">
														<div className="h-4 bg-gray-200 rounded w-24"></div>
														<div className="h-3 bg-gray-200 rounded w-32 mt-1"></div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-20"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-24"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
										</tr>
									))
								) : (data?.data || []).length > 0 ? (
									(data?.data || []).map((appointment) => {
										return (
											<tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
												<td className="px-6 py-5 whitespace-nowrap">
													<div className="flex items-center">
														<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
															<span className="text-sm font-semibold text-primary">
																{appointment.client.name.charAt(0).toUpperCase()}
															</span>
														</div>
														<div className="ml-4">
															<div className="text-sm font-semibold text-gray-900">
																{appointment.client.name}
															</div>
															<div className="text-sm text-gray-500">
																{appointment.client.email}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900" suppressHydrationWarning>
													{new Date(appointment.scheduledAt).toLocaleDateString('en-US')}
												</td>
												<td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900" suppressHydrationWarning>
													{new Date(appointment.scheduledAt).toLocaleTimeString('en-US', { 
														hour: '2-digit', 
														minute: '2-digit',
														hour12: true 
													})}
												</td>
												<td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900" suppressHydrationWarning>
													{new Date(appointment.createdAt).toLocaleDateString('en-US')} {new Date(appointment.createdAt).toLocaleTimeString('en-US', { 
														hour: '2-digit', 
														minute: '2-digit',
														hour12: true 
													})}
												</td>
												<td className="px-6 py-5 whitespace-nowrap text-xs">
													<span className={`inline-flex items-center rounded-full px-2.5 py-1 font-medium ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
														{appointment.status ? appointment.status.toUpperCase() : 'PENDING'}
													</span>
												</td>
												<td className="px-6 py-5 whitespace-nowrap text-sm">
													<div className="flex items-center space-x-3">
														<Link href={`/appointments/${appointment.id}/edit`} className="text-blue-600 hover:text-blue-700 font-medium">
															Edit
														</Link>
														<button
															onClick={() => openStatusModal(appointment)}
															className="text-gray-600 hover:text-gray-700 font-medium flex items-center"
														>
															<Settings className="h-4 w-4 mr-1" />
															Status
														</button>
														<button
															onClick={() => openCancelModal(appointment)}
															className="text-red-600 hover:text-red-700 font-medium flex items-center"
														>
															<Trash2 className="h-4 w-4 mr-1" />
															Cancel
														</button>
													</div>
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td colSpan={6} className="px-6 py-12 text-center">
											<div className="text-gray-500">
												<Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
												<h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
												<p className="text-gray-500">
													{statusFilter ? 'No appointments found with the selected status' : 'No appointments have been scheduled yet'}
												</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{data && data?.meta && data.meta.totalPages > 1 && (
						<div className="bg-white px-4 py-3 flex items-center justify-between sm:px-6">
							<div className="flex-1 flex justify-between sm:hidden">
								<Button
									variant="outline"
									size="sm"
									disabled={page <= 1}
									onClick={() => setPage(page - 1)}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={page >= (data?.meta?.totalPages || 1)}
									onClick={() => setPage(page + 1)}
								>
									Next
								</Button>
							</div>
							<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
								<div className="flex items-center space-x-4">
									<p className="text-sm text-gray-700">
										Showing{' '}
										<span className="font-medium">{(page - 1) * pageSize + 1}</span>
										{' '}to{' '}
										<span className="font-medium">
											{Math.min(page * pageSize, data?.meta?.total || 0)}
										</span>
										{' '}of{' '}
										<span className="font-medium">{data?.meta?.total || 0}</span>
										{' '}results
									</p>
									<div className="flex items-center space-x-2">
										<label htmlFor="page-size" className="text-sm text-gray-700">
											Show:
										</label>
										<select
											id="page-size"
											value={pageSize}
											onChange={(e) => handlePageSizeChange(Number(e.target.value))}
											className="rounded-md border-gray-300 text-sm focus:border-primary focus:ring-primary"
										>
											<option value={10}>10</option>
											<option value={25}>25</option>
											<option value={50}>50</option>
											<option value={100}>100</option>
										</select>
										<span className="text-sm text-gray-700">per page</span>
									</div>
								</div>
								<div>
									<nav className="relative z-0 inline-flex rounded-md space-x-2" aria-label="Pagination">
										<Button
											variant="outline"
											size="sm"
											disabled={page <= 1}
											onClick={() => setPage(page - 1)}
											className="relative inline-flex items-center px-3 py-2 rounded-md"
										>
											<ChevronLeft className="h-4 w-4" />
										</Button>
										
										{(() => {
											const pages = [];
											const maxVisible = 5;
											const totalPages = data?.meta?.totalPages || 1;
											
											if (totalPages <= maxVisible) {
												// Show all pages if total is small
												for (let i = 1; i <= totalPages; i++) {
													pages.push(
														<Button
															key={i}
															variant={page === i ? "default" : "outline"}
															size="sm"
															onClick={() => setPage(i)}
															className="relative inline-flex items-center px-4 py-2"
														>
															{i}
														</Button>
													);
												}
											} else {
												// Show first page
												pages.push(
													<Button
														key={1}
														variant={page === 1 ? "default" : "outline"}
														size="sm"
														onClick={() => setPage(1)}
														className="relative inline-flex items-center px-4 py-2 rounded-md"
													>
														1
													</Button>
												);
												
												// Show ellipsis if needed
												if (page > 3) {
													pages.push(
														<span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 text-sm text-gray-500">
															...
														</span>
													);
												}
												
												// Show current page and surrounding pages
												const start = Math.max(2, page - 1);
												const end = Math.min(totalPages - 1, page + 1);
												
												for (let i = start; i <= end; i++) {
													if (i !== 1 && i !== totalPages) {
														pages.push(
															<Button
																key={i}
																variant={page === i ? "default" : "outline"}
																size="sm"
																onClick={() => setPage(i)}
																className="relative inline-flex items-center px-4 py-2 rounded-md"
															>
																{i}
															</Button>
														);
													}
												}
												
												// Show ellipsis if needed
												if (page < totalPages - 2) {
													pages.push(
														<span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 text-sm text-gray-500">
															...
														</span>
													);
												}
												
												// Show last page
												if (totalPages > 1) {
													pages.push(
														<Button
															key={totalPages}
															variant={page === totalPages ? "default" : "outline"}
															size="sm"
															onClick={() => setPage(totalPages)}
															className="relative inline-flex items-center px-4 py-2 rounded-md"
														>
															{totalPages}
														</Button>
													);
												}
											}
											
											return pages;
										})()}
										
										<Button
											variant="outline"
											size="sm"
											disabled={page >= (data?.meta?.totalPages || 1)}
											onClick={() => setPage(page + 1)}
											className="relative inline-flex items-center px-3 py-2 rounded-md"
										>
											<ChevronRight className="h-4 w-4" />
										</Button>
									</nav>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>

		{/* Status Change Modal */}
		{statusModalOpen && (
			<div className="fixed inset-0 bg-opacity-50 backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
				<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-gray-900">Change Appointment Status</h3>
							<button
								onClick={() => setStatusModalOpen(false)}
								className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						
						{selectedAppointment && (
							<div className="mb-6">
								<div className="bg-gray-50 rounded-lg p-4 mb-4">
									<p className="text-sm text-gray-700 mb-1">
										<span className="font-medium text-gray-900">Client:</span> {selectedAppointment.client.name}
									</p>
									<p className="text-sm text-gray-700">
										<span className="font-medium text-gray-900">Date:</span> {new Date(selectedAppointment.scheduledAt).toLocaleDateString('en-US')} at {new Date(selectedAppointment.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
									</p>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-3">
										Select New Status
									</label>
									<select
										value={newStatus}
										onChange={(e) => setNewStatus(e.target.value as 'pending' | 'confirmed' | 'cancelled')}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
									>
										<option value="pending">Pending</option>
										<option value="confirmed">Confirmed</option>
										<option value="cancelled">Cancelled</option>
									</select>
								</div>
							</div>
						)}
						
						<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
							<button
								onClick={() => setStatusModalOpen(false)}
								className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors font-medium"
							>
								Cancel
							</button>
							<button
								onClick={handleStatusChange}
								disabled={isUpdatingStatus}
								className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
							>
								{isUpdatingStatus ? 'Updating...' : 'Update Status'}
							</button>
						</div>
					</div>
				</div>
			</div>
		)}

		{/* Cancel Appointment Confirmation Modal */}
		{cancelModalOpen && (
			<div className="fixed inset-0 bg-opacity-50 backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
				<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-gray-900">Cancel Appointment</h3>
							<button
								onClick={() => setCancelModalOpen(false)}
								className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						
						{appointmentToCancel && (
							<div className="mb-6">
								<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
									<div className="flex items-center mb-2">
										<Trash2 className="h-5 w-5 text-red-600 mr-2" />
										<p className="text-sm font-medium text-red-800">Are you sure you want to cancel this appointment?</p>
									</div>
									<p className="text-xs text-red-700">This action cannot be undone.</p>
								</div>
								
								<div className="bg-gray-50 rounded-lg p-4">
									<p className="text-sm text-gray-700 mb-1">
										<span className="font-medium text-gray-900">Client:</span> {appointmentToCancel.client.name}
									</p>
									<p className="text-sm text-gray-700">
										<span className="font-medium text-gray-900">Date:</span> {new Date(appointmentToCancel.scheduledAt).toLocaleDateString('en-US')} at {new Date(appointmentToCancel.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
									</p>
								</div>
							</div>
						)}
						
						<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
							<button
								onClick={() => setCancelModalOpen(false)}
								className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors font-medium"
							>
								Keep Appointment
							</button>
							<button
								onClick={handleCancelAppointment}
								disabled={isCancelling}
								className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
							>
								{isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
							</button>
						</div>
					</div>
				</div>
			</div>
		)}
		</ProtectedRoute>
	);
}