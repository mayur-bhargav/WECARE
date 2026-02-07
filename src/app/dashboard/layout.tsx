'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiHome, FiUsers, FiCalendar, FiStar, FiBell,
  FiSettings, FiLogOut, FiMenu, FiX, FiShield,
  FiUserCheck, FiBarChart2
} from 'react-icons/fi';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/dashboard/users', label: 'Users', icon: FiUsers },
  { href: '/dashboard/nanny-approvals', label: 'Nanny Approvals', icon: FiUserCheck },
  { href: '/dashboard/providers', label: 'Providers', icon: FiHome },
  { href: '/dashboard/bookings', label: 'Bookings', icon: FiCalendar },
  { href: '/dashboard/reviews', label: 'Reviews', icon: FiStar },
  { href: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
  { href: '/dashboard/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/dashboard/settings', label: 'Settings', icon: FiSettings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem('wecare_admin');
    if (!stored) {
      router.push('/');
      return;
    }
    setAdmin(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('wecare_admin');
    router.push('/');
  };

  if (!admin) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-md shadow-red-200">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none">
                  <span className="text-red-600">We</span>
                  <span className="text-gray-800">Care</span>
                </h1>
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest">Admin</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-red-50 text-red-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-red-600' : ''}`} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-red-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Admin info & logout */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-700 font-bold text-sm">
                  {admin?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{admin?.phoneNumber}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
            >
              <FiLogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">{admin?.name?.charAt(0) || 'A'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
