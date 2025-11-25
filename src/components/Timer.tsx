import { Play, Pause, RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import { useFocus } from '../context/FocusContext'

export default function Timer() {
    const { 
        timeLeft, 
        isActive, 
        mode, 
        toggleTimer, 
        resetTimer, 
        switchMode 
    } = useFocus()

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60
    const progress = ((totalTime - timeLeft) / totalTime) * 100

    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            {/* Mode Toggles */}
            <div className="flex bg-surface rounded-full p-1 border border-white/10">
                <button
                    onClick={() => switchMode('focus')}
                    className={clsx(
                        'px-6 py-2 rounded-full text-sm font-medium transition-all',
                        mode === 'focus' ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                    )}
                >
                    Focus
                </button>
                <button
                    onClick={() => switchMode('break')}
                    className={clsx(
                        'px-6 py-2 rounded-full text-sm font-medium transition-all',
                        mode === 'break' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'
                    )}
                >
                    Break
                </button>
            </div>

            {/* Timer Display */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Circular Progress (SVG) */}
                <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-surface"
                    />
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                        className={clsx('transition-all duration-1000', mode === 'focus' ? 'text-primary' : 'text-green-500')}
                        strokeLinecap="round"
                    />
                </svg>

                <div className="text-6xl font-bold font-mono tracking-wider z-10">
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTimer}
                    className={clsx(
                        'w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105',
                        isActive ? 'bg-surface border border-white/10 text-white' : 'bg-primary text-background'
                    )}
                >
                    {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
