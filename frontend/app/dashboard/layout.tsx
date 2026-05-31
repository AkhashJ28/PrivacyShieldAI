"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  UploadCloud,
  AlertCircle,
  FileText,
  FileLock2,
  History,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

const OFFICER_MENU = [
  { href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
  { href: "/dashboard/incidents", icon: <AlertCircle className="w-4 h-4" />, label: "Incidents" },
  { href: "/dashboard/requests", icon: <FileText className="w-4 h-4" />, label: "My Requests" },
];

const ADMIN_MENU = [
  { href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
  { href: "/dashboard/upload", icon: <UploadCloud className="w-4 h-4" />, label: "Upload Footage" },
  { href: "/dashboard/admin", icon: <FileLock2 className="w-4 h-4" />, label: "Admin Review" },
  { href: "/dashboard/audit", icon: <History className="w-4 h-4" />, label: "Audit Logs" },
  { href: "/dashboard/users", icon: <Users className="w-4 h-4" />, label: "User Management" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null; // Don't flash content while redirecting
  }

  const menuItems = user.role === "admin" ? ADMIN_MENU : OFFICER_MENU;
  const roleLabel = user.role === "admin" ? "ADMIN" : "OFFICER";
  const roleColor = user.role === "admin" ? "text-warning" : "text-primary-light";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-background flex text-slate-100">
      {/* Navigation Sidebar */}
      <aside className="w-64 glass-sidebar flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="h-16 flex items-center px-4 gap-3 border-b border-white/5 mb-6">
            <ShieldAlert className="w-5 h-5 text-primary-light" />
            <span className="text-md font-bold text-white tracking-widest font-mono">PRIVACYSHIELD AI</span>
          </div>

          {/* Role Badge */}
          <div className="mx-4 mb-4 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/5">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${roleColor}`}>
              ● {roleLabel} ACCESS
            </span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? "bg-primary text-white font-semibold shadow-md" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile + Logout */}
        <div className="space-y-2">
          <div className="p-2 border-t border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-primary-light font-mono">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-slate-400 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Dynamic Viewscreen Content */}
      <main className="flex-1 overflow-y-auto p-8 w-full">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}