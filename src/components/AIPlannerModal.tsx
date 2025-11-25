import { useState } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { AIService, type PlannerInput } from '../services/ai'

interface AIPlannerModalProps {
    isOpen: boolean
    onClose: () => void
    onGenerate: (plan: any[]) => void
}

export default function AIPlannerModal({ isOpen, onClose, onGenerate }: AIPlannerModalProps) {
    const [topic, setTopic] = useState('')
    const [scope, setScope] = useState('')
    const [deadline, setDeadline] = useState('')
    const [capacity, setCapacity] = useState('2 hours/day')
    const [isGenerating, setIsGenerating] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsGenerating(true)

        try {
            const input: PlannerInput = {
                topic,
                scope,
                targetDate: new Date(deadline),
                weeklyCapacity: capacity
            }

            const plan = await AIService.generateStudyPlan(input)
            onGenerate(plan)
            onClose()
        } catch (error) {
            console.error("Failed to generate plan", error)
            // Handle error (show toast, etc.)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-white">AI Study Planner</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Subject / Topic</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Calculus I"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Scope / Details</label>
                        <textarea
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            placeholder="e.g., Limits, Derivatives, Integrals..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary h-24 resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Target Date</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Weekly Capacity</label>
                        <select
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                        >
                            <option value="1 hour/day">Light (1h/day)</option>
                            <option value="2 hours/day">Moderate (2h/day)</option>
                            <option value="4 hours/day">Intense (4h/day)</option>
                            <option value="weekend">Weekend Warrior</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isGenerating}
                        className={clsx(
                            'w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all',
                            isGenerating ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-background'
                        )}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Plan...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Schedule
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
