"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginUser } from '@/lib/api/auth';
import { useAuth } from '@/lib/contexts/auth-context';
import { Mail, Lock, Eye, EyeOff, Shield, Users, Calendar, Loader2 } from 'lucide-react';

const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof loginSchema>;


export default function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();
	const { login: authLogin, isAuthenticated, isLoading } = useAuth();

	const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema)
	});

	// Redirect if already authenticated
	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			router.push('/');
		}
	}, [isAuthenticated, isLoading, router]);

	const { mutateAsync: login } = useMutation({
		mutationFn: loginUser,
		onSuccess: (data) => {
			toast.success('Login successful!');
			// Use auth context login method
			authLogin(data.data.access_token, data.data.user);
			setIsRedirecting(true);
			router.replace('/');
			// Force a refresh so header renders immediately
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Login failed');
		}
	});

	const onSubmit = async (data: LoginFormData) => {
		await login(data);
	};

	const handleDemoLogin = () => {
		setValue('email', 'admin@virtualwellness.com');
		setValue('password', 'admin123');
		toast.success('Demo credentials filled! Click Login to continue.');
	};

	// Show loading while checking authentication
	if (isLoading) {
		return (
			<div className="login-page min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="login-page min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				{/* Logo and Title */}
				<div className="text-center">
					<div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
						<svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
							<path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Virtual Wellness
					</h1>
					<p className="text-sm text-gray-600">
						Sign in to your admin account
					</p>
				</div>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow-lg border border-gray-200 rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
						{/* Email Field */}
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								Email Address
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									id="email"
									type="email"
									{...register('email')}
									className="pl-10"
									placeholder="Enter your email"
									disabled={isSubmitting}
								/>
							</div>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
							)}
						</div>

						{/* Password Field */}
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									id="password"
									type={showPassword ? 'text' : 'password'}
									{...register('password')}
									className="pl-10 pr-10"
									placeholder="Enter your password"
									disabled={isSubmitting}
								/>
								<button
									type="button"
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
									onClick={() => setShowPassword(!showPassword)}
									disabled={isSubmitting}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
							)}
						</div>

						{/* Demo Credentials */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</h3>
							<div className="text-xs text-blue-700 space-y-1">
								<p><strong>Email:</strong> admin@virtualwellness.com</p>
								<p><strong>Password:</strong> admin123</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleDemoLogin}
								className="mt-3 w-full border-blue-300 text-blue-700 hover:bg-blue-100"
								disabled={isSubmitting}
							>
								Fill Demo Credentials
							</Button>
						</div>

						{/* Login Button */}
						<Button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
							disabled={isSubmitting || isRedirecting}
						>
							{(isSubmitting || isRedirecting) && (
								<Loader2 className="h-4 w-4 animate-spin" />
							)}
							{(isSubmitting || isRedirecting) ? 'Signing in...' : 'Sign In'}
						</Button>
					</form>

					{/* Features Preview */}
					<div className="mt-8 pt-6 border-t border-gray-200">
						<h3 className="text-sm font-medium text-gray-900 mb-4 text-center">
							What you can do:
						</h3>
						<div className="grid grid-cols-1 gap-3">
							<div className="flex items-center space-x-3 text-sm text-gray-600">
								<Users className="h-4 w-4 text-blue-600" />
								<span>Manage client database</span>
							</div>
							<div className="flex items-center space-x-3 text-sm text-gray-600">
								<Calendar className="h-4 w-4 text-blue-600" />
								<span>Schedule and view appointments</span>
							</div>
							<div className="flex items-center space-x-3 text-sm text-gray-600">
								<Shield className="h-4 w-4 text-blue-600" />
								<span>Access admin dashboard</span>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">
						Virtual Wellness Clinic Management System
					</p>
				</div>
			</div>
		</div>
	);
}
