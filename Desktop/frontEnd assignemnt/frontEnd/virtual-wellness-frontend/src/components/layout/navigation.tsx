"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Upcoming Appointments', href: '/appointments/upcoming' },
  { name: 'All Appointments', href: '/appointments' },
  { name: 'Clients', href: '/clients' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`text-sm font-medium hover:text-[var(--primary-color)] ${
            pathname === item.href 
              ? 'font-semibold text-[var(--primary-color)]' 
              : 'text-gray-600'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
