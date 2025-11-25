import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface StatsCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    color: 'amber' | 'blue' | 'green' | 'purple' | 'rose'
    trend?: string
}

const colorStyles = {
    amber: 'bg-amber-500/10 text-amber-500',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    rose: 'bg-rose-500/10 text-rose-500',
}

export default function StatsCard({ icon: Icon, label, value, color, trend }: StatsCardProps) {
    return (
        <div className="bg-surface border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-primary/50 transition-colors">
            <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colorStyles[color])}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                    {trend && <span className="text-xs text-green-400">{trend}</span>}
                </div>
            </div>
        </div>
    )
}
