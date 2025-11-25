import { TreeDeciduous, TreePine, Flower2 } from 'lucide-react'
import clsx from 'clsx'

interface ForestProps {
    growthStage: number // 0 to 100
    isWithering?: boolean
}

export default function Forest({ growthStage, isWithering = false }: ForestProps) {
    // Determine which tree to show based on growth
    const getTreeIcon = () => {
        if (growthStage < 30) return Flower2
        if (growthStage < 60) return TreeDeciduous
        return TreePine
    }

    const TreeIcon = getTreeIcon()
    const scale = 0.5 + (growthStage / 200) // Scale from 0.5 to 1.0

    return (
        <div className="relative w-full h-64 bg-gradient-to-b from-transparent to-green-900/20 rounded-b-3xl flex items-end justify-center overflow-hidden">
            {/* Ground */}
            <div className="absolute bottom-0 w-full h-4 bg-green-800/50 blur-sm" />

            {/* Tree */}
            <div
                className={clsx(
                    'transition-all duration-1000 transform origin-bottom mb-4',
                    isWithering ? 'grayscale opacity-50' : 'text-green-500'
                )}
                style={{ transform: `scale(${scale})` }}
            >
                <TreeIcon className="w-32 h-32 drop-shadow-2xl" />
            </div>

            {/* Particles/Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Simple CSS animation for particles could go here */}
            </div>

            {/* Status Text */}
            <div className="absolute top-4 left-0 w-full text-center">
                <p className={clsx('text-sm font-medium', isWithering ? 'text-gray-500' : 'text-green-400')}>
                    {isWithering ? 'The forest is withering...' : 'Growing your focus tree...'}
                </p>
            </div>
        </div>
    )
}
