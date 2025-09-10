"use client";

import { PropsWithChildren } from 'react';

export function ErrorBanner({ children }: PropsWithChildren) {
	return (
		<div className="p-3 rounded border border-red-300 bg-red-50 text-red-800 text-sm">
			{children}
		</div>
	);
}


