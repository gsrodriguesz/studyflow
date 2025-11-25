import { useGamification } from '../context/GamificationContext'
import { ShoppingBag, TrendingUp, Calendar as CalendarIcon, Zap, Palette, Music } from 'lucide-react'
import clsx from 'clsx'

export default function Progress() {
    const { coins, xp } = useGamification()

    const shopItems = [
        { id: 1, name: 'Dark Forest Theme', cost: 500, icon: Palette, type: 'theme' },
        { id: 2, name: 'Rain Sounds', cost: 200, icon: Music, type: 'sound' },
        { id: 3, name: '2x XP Booster (1h)', cost: 300, icon: Zap, type: 'booster' },
        { id: 4, name: 'Cyberpunk Theme', cost: 1000, icon: Palette, type: 'theme' },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Progress & Shop</h1>
                    <p className="text-gray-400">Track your growth and spend your rewards.</p>
                </div>
                <div className="flex items-center gap-4 bg-surface border border-white/10 px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-bold text-white">{coins} Coins</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="font-bold text-white">{xp} XP</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-white">Study Activity</h2>
                        </div>
                        
                        {/* Mock Heatmap */}
                        <div className="grid grid-cols-12 gap-2">
                            {Array.from({ length: 48 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={clsx(
                                        'aspect-square rounded-sm',
                                        Math.random() > 0.7 ? 'bg-primary' : 
                                        Math.random() > 0.4 ? 'bg-primary/50' : 
                                        'bg-white/5'
                                    )}
                                    title={`Day ${i + 1}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-end items-center gap-2 mt-4 text-xs text-gray-500">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-sm bg-white/5" />
                                <div className="w-3 h-3 rounded-sm bg-primary/50" />
                                <div className="w-3 h-3 rounded-sm bg-primary" />
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-white">Weekly Breakdown</h2>
                        </div>
                        <div className="h-48 flex items-end justify-between gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                const height = Math.floor(Math.random() * 80) + 20
                                return (
                                    <div key={day} className="flex flex-col items-center gap-2 flex-1">
                                        <div 
                                            className="w-full bg-primary/20 rounded-t-lg hover:bg-primary/40 transition-colors relative group"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {height / 10}h
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">{day}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Shop Section */}
                <div className="bg-surface border border-white/10 rounded-2xl p-6 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-white">Item Shop</h2>
                    </div>

                    <div className="space-y-4">
                        {shopItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{item.name}</h3>
                                        <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                                    </div>
                                </div>
                                <button 
                                    className={clsx(
                                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                                        coins >= item.cost 
                                            ? 'bg-primary text-background hover:bg-primary/90' 
                                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    )}
                                >
                                    {item.cost} 🪙
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
