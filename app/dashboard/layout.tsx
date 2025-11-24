'use client'

import React, { useState } from 'react'
import Header from "@/components/layouts/dashboard/Header";
import Sidebar from "@/components/layouts/dashboard/Sidebar";
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <Header isCollapsed={isCollapsed} />
        <main className={`
          pt-16 transition-all duration-300 ease-in-out min-h-screen
          ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
          ml-0
        `}>
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}