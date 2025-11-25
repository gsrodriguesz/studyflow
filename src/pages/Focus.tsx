import { useState } from 'react'
import Timer from '../components/Timer'
import Forest from '../components/Forest'
import { useGamification } from '../context/GamificationContext'
import { Volume2, VolumeX, Music } from 'lucide-react'
import clsx from 'clsx'

export default function Focus() {
    const { addXp, addCoins } = useGamification()
    const [isMuted, setIsMuted] = useState(false)
    const [soundType, setSoundType] = useState<'lofi' | 'white-noise' | 'rain'>('lofi')
    const [growthStage, setGrowthStage] = useState(0)

    const handleTimerComplete = () => {
        addXp(50)
        addCoins(20)
        setGrowthStage((prev) => Math.min(prev + 25, 100))
        // In a real app, we would reset growth after a session or keep it for the day
    }

    // Mock sound control
    const toggleMute = () => setIsMuted(!isMuted)

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Deep Focus</h1>
                <p className="text-gray-400">Plant trees while you study. Stay focused!</p>
            </div>

            <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Forest Visualization */}
                <Forest growthStage={growthStage} />

                <div className="p-8">
                    <Timer onComplete={handleTimerComplete} />
                </div>

                {/* Sound Controls */}
                <div className="bg-black/20 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex gap-2">
                            {(['lofi', 'white-noise', 'rain'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSoundType(type)}
                                    className={clsx(
                                        'text-xs px-3 py-1 rounded-full transition-all',
                                        soundType === type ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                                    )}
                                >
                                    {type.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Music className="w-4 h-4" />
                        <span>{isMuted ? 'Muted' : `Playing ${soundType}`}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
