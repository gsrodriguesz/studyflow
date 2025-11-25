import { useGamification } from '../context/GamificationContext'
import StatsCard from '../components/StatsCard'
import QuickAccessCard from '../components/QuickAccessCard'
import { Flame, Coins, Trophy, Clock, Brain, Calendar } from 'lucide-react'

export default function Dashboard() {
    const { xp, coins, streak, level } = useGamification()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Student!</h1>
                <p className="text-gray-400">Ready to maintain your {streak} day streak?</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    icon={Flame}
                    label="Day Streak"
                    value={streak}
                    color="rose"
                    trend="+1 from yesterday"
                />
                <StatsCard
                    icon={Coins}
                    label="Coins"
                    value={coins}
                    color="amber"
                />
                <StatsCard
                    icon={Trophy}
                    label="Level"
                    value={level}
                    color="purple"
                    trend={`${xp} XP total`}
                />
                <StatsCard
                    icon={Clock}
                    label="Study Hours"
                    value="12.5"
                    color="blue"
                    trend="This week"
                />
            </div>

            {/* Quick Access Section */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickAccessCard
                        title="Focus Session"
                        description="Start a Pomodoro timer and grow your forest."
                        icon={Clock}
                        to="/focus"
                        color="green"
                    />
                    <QuickAccessCard
                        title="Review Queue"
                        description="15 cards due for review today."
                        icon={Brain}
                        to="/notes"
                        color="blue"
                    />
                    <QuickAccessCard
                        title="Today's Plan"
                        description="Check your AI generated schedule."
                        icon={Calendar}
                        to="/planning"
                        color="purple"
                    />
                </div>
            </div>
        </div>
    )
}
