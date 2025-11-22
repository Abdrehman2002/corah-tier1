'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem('corah_role')
    if (role !== 'user') {
      router.push('/')
    }
  }, [router])

  return <DashboardLayout mode="user">{children}</DashboardLayout>
}
