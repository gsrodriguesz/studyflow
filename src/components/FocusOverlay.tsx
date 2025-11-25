import { useState } from 'react'
import Timer from './Timer'
import Forest from './Forest'
import { useFocus } from '../context/FocusContext'
import { Volume2, VolumeX, Music, Minimize2, Maximize2, X } from 'lucide-react'
import clsx from 'clsx'

export default function FocusOverlay() {
    const { 
        isFocusOpen, 
        isMinimized, 
        setFocusOpen, 
        setMinimized,
        growthStage,
        timeLeft,
        isActive,
        toggleTimer
    } = useFocus()

    const [isMuted, setIsMuted] = useState(false)
    const [soundType, setSoundType] = useState<'lofi' | 'white-noise' | 'rain'>('lofi')

    if (!isFocusOpen) return null

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const toggleMute = () => setIsMuted(!isMuted)

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-50 bg-surface border border-white/10 rounded-2xl shadow-2xl p-4 w-80 animate-in slide-in-from-bottom-10 fade-in duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="font-bold text-white">Focus Mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setMinimized(false)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setFocusOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-3xl font-mono font-bold text-white">
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={toggleTimer}
                        className={clsx(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                            isActive ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-primary text-background hover:bg-primary/90'
                        )}
                    >
                        {isActive ? 'Pause' : 'Start'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-200">
                <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                    {/* Header Controls */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                        <button 
                            onClick={() => setMinimized(true)}
                            className="p-2 bg-black/20 hover:bg-black/40 rounded-xl text-white/70 hover:text-white transition-all backdrop-blur-md"
                        >
                            <Minimize2 className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setFocusOpen(false)}
                            className="p-2 bg-black/20 hover:bg-black/40 rounded-xl text-white/70 hover:text-white transition-all backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Forest Visualization */}
                    <Forest growthStage={growthStage} />

                    <div className="p-8">
                        <Timer />
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
        </div>
    )
}
