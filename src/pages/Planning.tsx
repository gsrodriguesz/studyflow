import { useState, useEffect } from 'react'
import Calendar from '../components/Calendar'
import AIPlannerModal from '../components/AIPlannerModal'
import { Plus, Sparkles } from 'lucide-react'
import type { StudySession } from '../services/ai'
import { useAuth } from '../context/AuthContext'
import { FirestoreService, db } from '../services/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

export default function Planning() {
    const { user } = useAuth()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [events, setEvents] = useState<{ date: Date; title: string; type: 'study' | 'exam' | 'deadline' }[]>([])

    useEffect(() => {
        if (!user) return

        const q = query(collection(db, 'users', user.uid, 'plans'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedEvents = snapshot.docs.map(doc => {
                const data = doc.data()
                return {
                    date: new Date(data.date),
                    title: data.topic,
                    type: 'study' as const
                }
            })
            setEvents(loadedEvents)
        })

        return () => unsubscribe()
    }, [user])

    const handleGeneratePlan = async (plan: StudySession[]) => {
        if (!user) {
            alert("Please login to save your plan")
            return
        }

        // Save to Firestore
        for (const session of plan) {
            await FirestoreService.addDocument(`users/${user.uid}/plans`, {
                date: session.date,
                topic: session.topic,
                durationMinutes: session.durationMinutes,
                description: session.description,
                completed: false
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Planning</h1>
                    <p className="text-gray-400">Manage your schedule and let AI optimize your study time.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-background px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Sparkles className="w-5 h-5" />
                    AI Planner
                </button>
            </div>

            <Calendar events={events} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Upcoming Deadlines</h3>
                    <div className="space-y-4">
                        {events.filter(e => e.type === 'exam' || e.type === 'deadline').map((event, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                                <div className="w-2 h-12 rounded-full bg-red-500" />
                                <div>
                                    <h4 className="font-bold text-white">{event.title}</h4>
                                    <p className="text-sm text-gray-400">{event.date.toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                        {events.filter(e => e.type === 'exam' || e.type === 'deadline').length === 0 && (
                            <p className="text-gray-500 text-sm">No upcoming deadlines.</p>
                        )}
                    </div>
                </div>

                <div className="bg-surface border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Study Queue</h3>
                    <div className="space-y-4">
                        {events.filter(e => e.type === 'study').slice(0, 5).map((event, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                                <div className="w-2 h-12 rounded-full bg-blue-500" />
                                <div>
                                    <h4 className="font-bold text-white">{event.title}</h4>
                                    <p className="text-sm text-gray-400">{event.date.toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && (
                            <p className="text-gray-500 text-sm">No study sessions planned. Use the AI Planner!</p>
                        )}
                    </div>
                </div>
            </div>

            <AIPlannerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGenerate={handleGeneratePlan}
            />
        </div>
    )
}
