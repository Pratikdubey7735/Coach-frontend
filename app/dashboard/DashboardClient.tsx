"use client";

import { useState } from "react";
import type { AuthUser } from "@/lib/auth-service";
import LogoutButton from "@/components/LogoutButton";
import {
  LayoutDashboard,
  GraduationCap,
  LogOut,
  Bell,
//   Menu,
  X,
  ChevronDown,
  Clock,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "My Classes", icon: GraduationCap, active: false },
];

const quickOverview = [
  { label: "My Classes", value: 8 },
  { label: "Total Students", value: 124 },
  { label: "Pending Assignments", value: 5 },
];

const todaysSchedule = [
  { time: "10:00 AM", title: "Advanced Tactics", className: "Class 8A" },
  { time: "02:00 PM", title: "Endgame Strategies", className: "Class 7B" },
];

interface DashboardClientProps {
  user: AuthUser | null;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#F4F6FB]">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/30 transition-opacity duration-300 lg:hidden"
        />
      )}

      <aside
        className={`fixed z-30 flex h-screen w-64 flex-col bg-[#0B1730] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-7">
          <div className="flex items-center gap-3">
            <GraduationCap size={26} className="text-blue-400" />
            <div>
              <p className="text-base font-bold leading-tight">Upstep</p>
              <p className="text-xs tracking-widest text-blue-300">ACADEMY</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-blue-200 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navItems.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-blue-200 hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <LogoutButton>
            <span className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-blue-200 hover:bg-white/5">
              <LogOut size={18} />
              <span>Log Out</span>
            </span>
          </LogoutButton>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between bg-white px-8 py-5 shadow-sm">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
          >
            {/* <Menu size={22} /> */}
          </button>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={22} className="text-gray-600" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                3
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                {(user?.name ?? "C").charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium text-[#0B1730]">
                {user?.role ?? "Coach"}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-8 py-10">
          <h1 className="text-2xl font-bold text-[#0B1730]">
            Welcome{user?.name ? `, ${user.name}` : " Back"}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.email ?? "coach@upstepacademy.com"}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {quickOverview.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white p-5 text-center shadow-sm"
              >
                <p className="text-2xl font-bold text-[#0B1730]">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0B1730]">
              Today&apos;s Schedule
            </h2>
            <div className="mt-4 space-y-4">
              {todaysSchedule.map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <Clock size={18} className="text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-[#0B1730]">
                      {item.title}{" "}
                      <span className="font-normal text-gray-400">
                        · {item.className}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}