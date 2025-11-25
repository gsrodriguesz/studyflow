import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { FirestoreService, type Exam } from '../services/firebase'
import Calendar from '../components/Calendar'
import { Plus, X, Trash2, Calendar as CalendarIcon, BookOpen } from 'lucide-react'
import clsx from 'clsx'
import { format, isSameDay, parseISO } from 'date-fns'

export default function ExamCalendar() {
    const { user } = useAuth()
    const [exams, setExams] = useState<Exam[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingExam, setEditingExam] = useState<Exam | null>(null)
    
    // Form State
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [topics, setTopics] = useState('')

    useEffect(() => {
        if (!user) return
        const unsubscribe = FirestoreService.subscribeToUserExams(user.uid, setExams)
        return () => unsubscribe()
    }, [user])

    const handleOpenModal = (exam?: Exam) => {
        if (exam) {
            setEditingExam(exam)
            setTitle(exam.title)
            setDate(exam.date)
            setTopics(exam.topics || '')
        } else {
            setEditingExam(null)
            setTitle('')
            setDate('')
            setTopics('')
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingExam(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        const examData = {
            userId: user.uid,
            title,
            date,
            topics,
            status: 'upcoming', // Exams in calendar are usually upcoming until done
            score: '-'
        }

        try {
            if (editingExam) {
                await FirestoreService.updateDocument('exams', editingExam.id, examData)
            } else {
                await FirestoreService.addDocument('exams', examData)
            }
            handleCloseModal()
        } catch (error) {
            console.error("Error saving exam:", error)
            alert("Failed to save exam")
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this exam?')) {
            await FirestoreService.deleteDocument('exams', id)
        }
    }

    // Transform exams to calendar events
    const calendarEvents = exams.map(exam => ({
        date: parseISO(exam.date),
        title: exam.title,
        type: 'exam' as const
    }))

    const upcomingExams = exams.filter(e => new Date(e.date) >= new Date()).slice(0, 5)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Exam Calendar</h1>
                    <p className="text-gray-400">Manage your exam schedule and study topics.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-background px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Exam
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Calendar events={calendarEvents} />
                </div>
                
                <div className="space-y-6">
                    <div className="bg-surface border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            Upcoming Exams
                        </h2>
                        <div className="space-y-4">
                            {upcomingExams.length === 0 ? (
                                <p className="text-gray-500 text-sm">No upcoming exams scheduled.</p>
                            ) : (
                                upcomingExams.map(exam => (
                                    <div 
                                        key={exam.id} 
                                        className="group p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
                                        onClick={() => handleOpenModal(exam)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">{exam.title}</h3>
                                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                                                {format(parseISO(exam.date), 'MMM d')}
                                            </span>
                                        </div>
                                        {exam.topics && (
                                            <div className="flex items-start gap-2 text-sm text-gray-400 mt-2">
                                                <BookOpen className="w-4 h-4 mt-0.5 shrink-0" />
                                                <p className="line-clamp-2">{exam.topics}</p>
                                            </div>
                                        )}
                                        <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(exam.id) }}
                                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingExam ? 'Edit Exam' : 'Add New Exam'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Subject / Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g. Calculus I Final"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Topics to Study</label>
                                <textarea 
                                    value={topics}
                                    onChange={e => setTopics(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary h-32 resize-none"
                                    placeholder="List chapters, topics, or notes..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-400 hover:text-white font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Save Exam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
