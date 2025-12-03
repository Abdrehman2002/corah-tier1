'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Database, Calendar, Building, LogOut, ChevronsRight, ChevronDown, Headset } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  mode: 'admin' | 'user'
  children: React.ReactNode
}

export default function DashboardLayout({ mode, children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('corah_role')
      router.push('/')
    }
  }

  const basePath = `/${mode}`

  const baseNavItems = [
    { label: 'Overview', path: `${basePath}/overview`, icon: LayoutDashboard },
    { label: 'Data', path: `${basePath}/data`, icon: Database },
    { label: 'Appointments', path: `${basePath}/appointments`, icon: Calendar },
    { label: 'Business Info', path: `${basePath}/business-info`, icon: Building },
  ]

  // Add Agent Selector only for admin
  const navItems = mode === 'admin'
    ? [...baseNavItems, { label: 'Agent Selector', path: `${basePath}/agent-selector`, icon: Headset }]
    : baseNavItems

  return (
    <div className="flex min-h-screen w-full bg-[#F8F6F2]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg border border-black/10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <nav
        className={cn(
          "sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out z-40",
          open ? 'w-64' : 'w-16',
          "border-black/5 bg-white p-2 shadow-sm",
          // Mobile styles
          "fixed md:sticky",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Title Section */}
        <div className="mb-6 border-b border-black/5 pb-4">
          <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-black/5">
            <div className="flex items-center gap-3">
              <Logo />
              {open && (
                <div className="transition-opacity duration-200">
                  <span className="block text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#2A2A2A]">
                    CORAH
                  </span>
                  <span className="block text-xs text-[#2A2A2A] opacity-70">
                    {mode === 'admin' ? 'Admin Panel' : 'User Panel'}
                  </span>
                </div>
              )}
            </div>
            {open && (
              <ChevronDown className="h-4 w-4 text-[#2A2A2A] opacity-50" />
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "relative flex h-11 w-full items-center rounded-md transition-all duration-200",
                  isActive
                    ? "bg-[#000000] text-white shadow-sm border-l-2 border-[#000000]"
                    : "text-[#2A2A2A] hover:bg-black/5 hover:text-[#000000]"
                )}
              >
                <div className="grid h-full w-12 place-content-center">
                  <Icon className="h-4 w-4" />
                </div>
                {open && (
                  <span className="text-sm font-medium transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Logout Section */}
        {open && (
          <div className="border-t border-black/5 pt-4 space-y-1">
            <div className="px-3 py-2 text-xs font-medium text-[#2A2A2A] opacity-70 uppercase tracking-wide">
              Account
            </div>
            <button
              onClick={handleLogout}
              className="relative flex h-11 w-full items-center rounded-md transition-all duration-200 text-[#2A2A2A] hover:bg-black/5 hover:text-[#000000]"
            >
              <div className="grid h-full w-12 place-content-center">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        )}

        {/* Toggle Button - Hidden on mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="hidden md:block absolute bottom-0 left-0 right-0 border-t border-black/5 transition-colors hover:bg-black/5"
        >
          <div className="flex items-center p-3">
            <div className="grid size-10 place-content-center">
              <ChevronsRight
                className={cn(
                  "h-4 w-4 transition-transform duration-300 text-[#2A2A2A] opacity-70",
                  open && "rotate-180"
                )}
              />
            </div>
            {open && (
              <span className="text-sm font-medium text-[#2A2A2A] transition-opacity duration-200">
                Hide
              </span>
            )}
          </div>
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-[#000000] to-[#2A2A2A] shadow-sm">
      <svg
        width="20"
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" />
        <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" />
      </svg>
    </div>
  )
}
