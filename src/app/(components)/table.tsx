"use client";

import { PropsWithChildren } from 'react';

export function Table({ children }: PropsWithChildren) {
	return <table className="w-full text-sm">{children}</table>;
}

export function THead({ children }: PropsWithChildren) {
	return <thead>{children}</thead>;
}

export function TBody({ children }: PropsWithChildren) {
	return <tbody>{children}</tbody>;
}

export function TR({ children }: PropsWithChildren) {
	return <tr className="border-b last:border-0">{children}</tr>;
}

export function TH({ children }: PropsWithChildren) {
	return <th className="p-3 text-left font-medium">{children}</th>;
}

export function TD({ children }: PropsWithChildren) {
	return <td className="p-3">{children}</td>;
}


