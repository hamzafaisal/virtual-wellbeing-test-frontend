"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '@/lib/api/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/protected-route';
import Link from 'next/link';
import { Users, Calendar, Plus, TrendingUp } from 'lucide-react';

export default function Home() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30_000
  });

  return (
    <ProtectedRoute>
    <div className="flex-1 bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome to Virtual Wellness Admin Portal
              </p>
            </div>
            <Link href="/appointments/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-900">Total Clients</h3>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : dashboardData?.cards?.totalClients || 0}
              </div>
              <p className="text-xs text-gray-500">
                Registered clients
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-900">Upcoming Appointments</h3>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <div className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : dashboardData?.cards?.upcomingAppointments || 0}
              </div>
              <p className="text-xs text-gray-500">
                Scheduled appointments
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-900">This Week</h3>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : dashboardData?.cards?.thisWeek || 0}
              </div>
              <p className="text-xs text-gray-500">
                Appointments scheduled
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-900">Active Clients</h3>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : dashboardData?.cards?.activeClients || 0}
              </div>
              <p className="text-xs text-gray-500">
                Recently active
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Clients</h3>
              <p className="text-sm text-gray-500 mb-4">
                Latest registered clients
              </p>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  dashboardData?.recentClients?.slice(0, 3).map((client) => (
                    <div key={client.id} className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                    </div>
                  ))
                )}
                {!isLoading && (!dashboardData?.recentClients || dashboardData.recentClients.length === 0) && (
                  <p className="text-sm text-gray-500">No clients found</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Appointments</h3>
              <p className="text-sm text-gray-500 mb-4">
                Next scheduled appointments
              </p>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  dashboardData?.upcomingAppointmentsList?.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-900">
                          {appointment.client?.name || 'Unknown Client'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.scheduledAt).toLocaleDateString()}
                          {/* ensure deterministic hydration */}
                          {/* @ts-ignore */}
                          {/* eslint-disable-next-line react/no-unknown-property */}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {!isLoading && (!dashboardData?.upcomingAppointmentsList || dashboardData.upcomingAppointmentsList.length === 0) && (
                  <p className="text-sm text-gray-500">No upcoming appointments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
