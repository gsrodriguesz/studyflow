import { FileText, Upload, Clock, BarChart2, Play, Plus, X, Trash2, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { FirestoreService, type Exam } from '../services/firebase'
import clsx from 'clsx'

export default function Simulations() {
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
        const unsubscribe = FirestoreService.subscribeToUserSimulations(user.uid, setExams)
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
            status: editingExam ? editingExam.status : 'upcoming',
            score: editingExam ? editingExam.score : '-'
        }

        try {
            if (editingExam) {
                await FirestoreService.updateDocument('simulations', editingExam.id, examData)
            } else {
                await FirestoreService.addDocument('simulations', examData)
            }
            handleCloseModal()
        } catch (error) {
            console.error("Error saving simulation:", error)
            alert("Failed to save simulation")
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this simulation?')) {
            await FirestoreService.deleteDocument('simulations', id)
        }
    }

    const handleComplete = async (exam: Exam) => {
        const score = prompt('Enter score (e.g. 85%):', '0%')
        if (score !== null) {
            await FirestoreService.updateDocument('simulations', exam.id, {
                status: 'completed',
                score
            })
        }
    }

    // Stats Calculation
    const completedExams = exams.filter(e => e.status === 'completed')
    const examsTaken = completedExams.length
    
    const averageScore = completedExams.length > 0 
        ? Math.round(completedExams.reduce((acc, curr) => {
            const scoreVal = parseInt(curr.score?.replace(/\D/g, '') || '0')
            return acc + scoreVal
        }, 0) / completedExams.length)
        : 0

    return (
        <div className="space-y-8 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Simulations</h1>
                    <p className="text-gray-400">Practice with mock exams and track your performance.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-primary text-background px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Simulation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="bg-surface border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Simulations Taken</p>
                        <h3 className="text-2xl font-bold text-white">{examsTaken}</h3>
                    </div>
                </div>
                <div className="bg-surface border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
                        <BarChart2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Average Score</p>
                        <h3 className="text-2xl font-bold text-white">{averageScore}%</h3>
                    </div>
                </div>
                <div className="bg-surface border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Next Simulation</p>
                        <h3 className="text-xl font-bold text-white truncate max-w-[150px]">
                            {exams.find(e => e.status === 'upcoming')?.date || 'None'}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Exam List */}
            <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Recent & Upcoming Simulations</h2>
                </div>
                <div className="divide-y divide-white/10">
                    {exams.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No simulations found. Add one to get started!
                        </div>
                    ) : (
                        exams.map((exam) => (
                            <div key={exam.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleOpenModal(exam)}>
                                    <div className={clsx(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        exam.status === 'completed' ? "bg-green-500/20 text-green-500" : "bg-white/5 text-gray-400"
                                    )}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{exam.title}</h3>
                                        <p className="text-sm text-gray-400">{exam.date} • {exam.topics || 'No topics'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Score</p>
                                        <p className={clsx("font-mono", exam.score === '-' ? "text-gray-500" : "text-white")}>
                                            {exam.score}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {exam.status === 'upcoming' ? (
                                            <button 
                                                onClick={() => handleComplete(exam)}
                                                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Complete
                                            </button>
                                        ) : (
                                            <span className="px-4 py-2 text-green-500 text-sm font-bold flex items-center gap-2">
                                                Completed
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(exam.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingExam ? 'Edit Simulation' : 'Add New Simulation'}
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
                                    placeholder="e.g. Calculus I Midterm"
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
                                <label className="block text-sm font-medium text-gray-400 mb-1">Topics (Optional)</label>
                                <textarea 
                                    value={topics}
                                    onChange={e => setTopics(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary h-24 resize-none"
                                    placeholder="List topics to study..."
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
                                    Save Simulation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
