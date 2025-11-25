import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

interface QuickAccessCardProps {
    title: string
    description: string
    icon: LucideIcon
    to: string
    image?: string
    color: 'amber' | 'blue' | 'green' | 'purple' | 'rose'
}

const colorStyles = {
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-500', glow: 'bg-amber-500/10 group-hover:bg-amber-500/20' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-500', glow: 'bg-blue-500/10 group-hover:bg-blue-500/20' },
    green: { bg: 'bg-green-500/20', text: 'text-green-500', glow: 'bg-green-500/10 group-hover:bg-green-500/20' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-500', glow: 'bg-purple-500/10 group-hover:bg-purple-500/20' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-500', glow: 'bg-rose-500/10 group-hover:bg-rose-500/20' },
}

export default function QuickAccessCard({ title, description, icon: Icon, to, color }: QuickAccessCardProps) {
    const styles = colorStyles[color] || colorStyles.amber

    return (
        <Link to={to} className="group relative overflow-hidden rounded-2xl bg-surface border border-white/10 hover:border-primary/50 transition-all duration-300 h-48 flex flex-col justify-between p-6">
            <div className={clsx('absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-all', styles.glow)} />

            <div className="relative z-10">
                <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center mb-4', styles.bg, styles.text)}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>

            <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-white/50 group-hover:text-white transition-colors">
                <span>Start Session</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    )
}
