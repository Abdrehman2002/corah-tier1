'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false, loading: () => <Skeleton className="w-full h-[300px]" /> }
)
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
)
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)

interface CallsLineChartProps {
  data: { date: string; calls: number }[]
}

export default function CallsLineChart({ data }: CallsLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis dataKey="date" stroke="#2A2A2A" />
        <YAxis stroke="#2A2A2A" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="calls" stroke="#000000" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
