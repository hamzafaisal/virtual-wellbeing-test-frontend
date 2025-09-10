"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchAppointments } from '@/lib/api/appointment';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

export default function UpcomingAppointmentsPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [searchQuery] = useState('');

	// Get current date/time as ISO string for the 'from' parameter - memoized to prevent infinite loops
	const currentDateTime = useMemo(() => new Date().toISOString(), []);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['upcoming-appointments', page, pageSize, currentDateTime, 'confirmed'],
		queryFn: () => fetchAppointments({ page, pageSize, from: currentDateTime, status: 'confirmed' }),
		staleTime: 30_000
	});

	if (isError) {
		toast.error((error as Error)?.message || ERROR_MESSAGES.UNKNOWN);
	}

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	};

	// Filter appointments by search query (client-side filtering)
	const filteredAppointments = data?.data?.filter(appointment => {
		if (!searchQuery) return true;
		return appointment.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			   appointment.client.email.toLowerCase().includes(searchQuery.toLowerCase());
	}) || [];

	return (
		<ProtectedRoute>
		<div className="flex-1 bg-gray-50 py-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
							Upcoming Appointments
						</h1>
						<p className="mt-1 text-sm text-gray-600">
							View and manage upcoming appointments
						</p>
					</div>
					<Link href="/appointments/new">
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							New Appointment
						</Button>
					</Link>
				</div>

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
										</tr>
									))
								) : filteredAppointments.length > 0 ? (
									filteredAppointments.map((appointment) => {
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
											</tr>
										);
									})
								) : (
									<tr>
										<td colSpan={4} className="px-6 py-12 text-center">
											<div className="text-gray-500">
												<Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
												<h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments found</h3>
												<p className="text-gray-500">
													{searchQuery ? 'Try adjusting your search criteria' : 'No upcoming appointments have been scheduled'}
												</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{data && data.data && data.data.length > 0 && (
						<div className="bg-white px-6 py-3">
							<div className="flex items-center justify-between">
								<div className="flex flex-1 justify-between sm:hidden">
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
						</div>
					)}
				</div>
			</div>
		</div>
		</ProtectedRoute>
	);
}
