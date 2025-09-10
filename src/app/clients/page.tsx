"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchClients, Client } from '@/lib/api/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Search, Users, Mail, Phone, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function ClientsPage() {
	const [q, setQ] = useState('');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['clients', q, page, pageSize],
		queryFn: () => fetchClients({ q, page, pageSize }),
		staleTime: 30_000
	});

	if (isError) {
		toast.error((error as Error)?.message || ERROR_MESSAGES.UNKNOWN);
	}

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	};

	return (
		<ProtectedRoute>
		<div className="flex-1 bg-gray-50 py-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
								Clients
							</h1>
							<p className="mt-1 text-sm text-gray-600">
								Manage your client database
							</p>
						</div>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										value={q}
										onChange={(e) => setQ(e.target.value)}
										placeholder="Search clients by name, email, or phone..."
										className="pl-10"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="rounded-md border border-gray-200 bg-white shadow-sm">
					{isLoading ? (
						<div className="p-6">
							<div className="animate-pulse space-y-4">
								{Array.from({ length: 5 }).map((_, i) => (
									<div key={i} className="flex items-center space-x-4 py-4">
										<div className="h-10 w-10 rounded-full bg-gray-200" />
										<div className="flex-1 space-y-2">
											<div className="h-4 bg-gray-200 rounded w-1/4" />
											<div className="h-3 bg-gray-200 rounded w-1/3" />
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<>
							{/* Table Header */}
							<div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
								<div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
									<div className="col-span-5">Client</div>
									<div className="col-span-4">Email</div>
									<div className="col-span-3">Phone</div>
								</div>
							</div>

							{/* Table Body */}
							<div className="divide-y divide-gray-200">
								{data?.data?.map((client: Client) => (
									<div key={client.id} className="px-6 py-5 hover:bg-gray-50">
										<div className="grid grid-cols-12 gap-4 items-center">
											{/* Client Info */}
											<div className="col-span-5 flex items-center space-x-3">
												<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
													<span className="text-sm font-semibold text-blue-600">
														{client.name.charAt(0).toUpperCase()}
													</span>
												</div>
												<div>
													<p className="text-sm font-semibold text-gray-900">{client.name}</p>
												</div>
											</div>

											{/* Email */}
											<div className="col-span-4">
												<div className="flex items-center space-x-2">
													<Mail className="h-4 w-4 text-gray-400" />
													<span className="text-sm text-gray-900">
														{client.email || 'No email'}
													</span>
												</div>
											</div>

											{/* Phone */}
											<div className="col-span-3">
												<div className="flex items-center space-x-2">
													<Phone className="h-4 w-4 text-gray-400" />
													<span className="text-sm text-gray-900">
														{client.phone || 'No phone'}
													</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Empty State */}
							{(!data?.data || data.data.length === 0) && (
								<div className="p-12 text-center">
									<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
									<p className="text-gray-500">
										{q ? 'Try adjusting your search criteria' : 'No clients have been registered yet'}
									</p>
								</div>
							)}
						</>
					)}
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
		</ProtectedRoute>
	);
}