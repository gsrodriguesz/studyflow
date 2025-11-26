import { FileText, BarChart2, Play, Plus, X, CheckCircle, Loader2, ChevronRight, ChevronLeft, BookOpen, Target, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { FirestoreService, type Exam } from '../services/firebase'
import { FileParser } from '../utils/fileParser'
import { AIService } from '../services/ai'
import clsx from 'clsx'

export default function Simulations() {
    const { user } = useAuth()
    const [exams, setExams] = useState<Exam[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingExam, setEditingExam] = useState<Exam | null>(null)
    
    // Upload State
    const [examFile, setExamFile] = useState<File | null>(null)
    const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Navigation State
    const [viewMode, setViewMode] = useState<'list' | 'details' | 'taking' | 'results'>('list')
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null)

    // Taking Simulation State
    const [activeQuestions, setActiveQuestions] = useState<NonNullable<Exam['questions']>>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [userAnswers, setUserAnswers] = useState<Record<string, number>>({})
    const [sessionScore, setSessionScore] = useState(0)

    // Form State
    const [title, setTitle] = useState('')
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
            setTopics(exam.topics || '')
        } else {
            setEditingExam(null)
            setTitle('')
            setTopics('')
        }
        // Reset files
        setExamFile(null)
        setAnswerKeyFile(null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingExam(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setIsProcessing(true)

        try {
            let questions = editingExam?.questions || []
            
            // Process files if uploaded
            if (examFile) {
                let simulationData: any = null;

                // Check file type
                if (examFile.type === 'application/pdf') {
                    // Use Image-based extraction for PDFs (Better for layout/OCR)
                    try {
                        const images = await FileParser.convertPDFToImages(examFile);
                        
                        let answerKeyText = ''
                        if (answerKeyFile) {
                            answerKeyText = await FileParser.extractText(answerKeyFile)
                        }

                        simulationData = await AIService.generateSimulationFromImages(images, answerKeyText)
                    } catch (err) {
                        console.error("Error processing PDF as images:", err);
                        alert("Error processing PDF. Falling back to text extraction...");
                        // Fallback to text extraction if image conversion fails
                        const examText = await FileParser.extractText(examFile);
                        let answerKeyText = ''
                        if (answerKeyFile) {
                            answerKeyText = await FileParser.extractText(answerKeyFile)
                        }
                        simulationData = await AIService.generateSimulationFromText(examText, answerKeyText)
                    }
                } else {
                    // DOCX or other text formats
                    const examText = await FileParser.extractText(examFile)
                    
                    if (!examText || examText.trim().length === 0) {
                        alert("Could not extract text from the file.")
                        setIsProcessing(false)
                        return
                    }

                    let answerKeyText = ''
                    if (answerKeyFile) {
                        answerKeyText = await FileParser.extractText(answerKeyFile)
                    }

                    simulationData = await AIService.generateSimulationFromText(examText, answerKeyText)
                }
                
                if (simulationData?.questions && simulationData.questions.length > 0) {
                    questions = simulationData.questions
                } else {
                    alert("AI could not generate questions from this file. Please try a different file.")
                    setIsProcessing(false)
                    return
                }
            }

            const examData = {
                userId: user.uid,
                title,
                topics,
                status: editingExam ? editingExam.status : 'upcoming',
                score: editingExam ? editingExam.score : '-',
                questions: questions
            }

            if (editingExam) {
                await FirestoreService.updateDocument('simulations', editingExam.id, examData)
            } else {
                await FirestoreService.addDocument('simulations', examData)
            }
            handleCloseModal()
        } catch (error) {
            console.error("Error saving simulation:", error)
            alert("Failed to save simulation")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this simulation?')) {
            await FirestoreService.deleteDocument('simulations', id)
            if (selectedExam?.id === id) {
                setViewMode('list')
                setSelectedExam(null)
            }
        }
    }

    const openSimulationDetails = (exam: Exam) => {
        setSelectedExam(exam)
        setViewMode('details')
    }

    const startSession = (questions: NonNullable<Exam['questions']>) => {
        if (questions.length === 0) {
            alert("No questions available for this selection.")
            return
        }
        setActiveQuestions(questions)
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setViewMode('taking')
    }

    const handleAnswerSelect = (questionId: string, optionIndex: number) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
    }

    const submitSession = async () => {
        if (!selectedExam || !user) return
        
        let correctCount = 0
        activeQuestions.forEach(q => {
            if (userAnswers[q.id] === q.correctAnswer) correctCount++
        })

        const scorePercentage = Math.round((correctCount / activeQuestions.length) * 100)
        setSessionScore(scorePercentage)

        // Update Firestore with new answers (merging with existing)
        // We want to preserve the history of answers in the main document
        const updatedQuestions = selectedExam.questions?.map(q => {
            if (userAnswers[q.id] !== undefined) {
                return { ...q, userAnswer: userAnswers[q.id] }
            }
            return q
        })

        // Calculate overall score for the exam based on all questions answered so far
        const totalAnsweredCorrectly = updatedQuestions?.filter(q => q.userAnswer === q.correctAnswer).length || 0
        const totalQuestions = updatedQuestions?.length || 1
        const overallScore = Math.round((totalAnsweredCorrectly / totalQuestions) * 100) + '%'

        await FirestoreService.updateDocument('simulations', selectedExam.id, {
            questions: updatedQuestions,
            score: overallScore,
            status: 'completed' // Mark as completed if at least one session is done? Or maybe keep it open.
        })

        setViewMode('results')
    }

    const returnToDetails = () => {
        setViewMode('details')
    }

    const returnToList = () => {
        setViewMode('list')
        setSelectedExam(null)
    }

    // Stats Calculation
    const completedExams = exams.filter(e => e.status === 'completed')
    
    const averageScore = completedExams.length > 0 
        ? Math.round(completedExams.reduce((acc, curr) => {
            const scoreVal = parseInt(curr.score?.replace(/\D/g, '') || '0')
            return acc + scoreVal
        }, 0) / completedExams.length)
        : 0

    // --- RENDER HELPERS ---

    const renderList = () => (
        <div className="space-y-8 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Simulations</h1>
                    <p className="text-gray-400">Your digital notebook of questions and exams.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-background px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Simulation
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Simulations</p>
                        <h3 className="text-2xl font-bold text-white">{exams.length}</h3>
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
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Questions</p>
                        <h3 className="text-xl font-bold text-white">
                            {exams.reduce((acc, curr) => acc + (curr.questions?.length || 0), 0)}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Available Simulations</h2>
                </div>
                <div className="divide-y divide-white/10">
                    {exams.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No simulations found. Add one to get started!
                        </div>
                    ) : (
                        exams.map((exam) => (
                            <div key={exam.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => openSimulationDetails(exam)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{exam.title}</h3>
                                        <p className="text-sm text-gray-400">{exam.topics || 'General'}</p>
                                        {exam.questions && (
                                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
                                                {exam.questions.length} Questions
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Score</p>
                                        <p className={clsx("font-mono", exam.score === '-' ? "text-gray-500" : "text-white")}>
                                            {exam.score}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )

    const renderDetails = () => {
        if (!selectedExam) return null
        
        // Group questions by topic
        const questionsByTopic = (selectedExam.questions || []).reduce((acc, q) => {
            const topic = q.topic || 'General'
            if (!acc[topic]) acc[topic] = []
            acc[topic].push(q)
            return acc
        }, {} as Record<string, typeof selectedExam.questions>)

        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <button onClick={returnToList} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Simulations
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{selectedExam.title}</h1>
                        <p className="text-gray-400">{selectedExam.questions?.length || 0} Questions Total</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleOpenModal(selectedExam)}
                            className="bg-surface border border-white/10 text-white px-4 py-2 rounded-xl font-bold hover:bg-white/5 transition-colors"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => handleDelete(selectedExam.id)}
                            className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-bold hover:bg-red-500/20 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Exam Card */}
                    <div className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => startSession(selectedExam.questions || [])}>
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Full Simulation</h3>
                        <p className="text-gray-400 text-sm mb-4">Practice all {selectedExam.questions?.length} questions in this simulation.</p>
                        <span className="text-primary font-bold text-sm flex items-center gap-1">
                            Start Now <ChevronRight className="w-4 h-4" />
                        </span>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-surface border border-white/10 rounded-2xl p-6">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 mb-4">
                            <BarChart2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Performance</h3>
                        <p className="text-gray-400 text-sm mb-4">Current overall score based on answered questions.</p>
                        <div className="text-3xl font-bold text-white">{selectedExam.score || '-'}</div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Practice by Topic
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(questionsByTopic).map(([topic, questions]) => (
                            <button 
                                key={topic}
                                onClick={() => startSession(questions || [])}
                                className="bg-surface border border-white/10 rounded-xl p-4 text-left hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white truncate pr-2">{topic}</h4>
                                    <span className="bg-white/10 text-xs text-gray-300 px-2 py-1 rounded">
                                        {questions?.length}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 group-hover:text-primary transition-colors">Click to practice</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderTaking = () => {
        const question = activeQuestions[currentQuestionIndex]
        const totalQuestions = activeQuestions.length
        const isLastQuestion = currentQuestionIndex === totalQuestions - 1

        return (
            <div className="h-full flex flex-col max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">{selectedExam?.title}</h2>
                    <button onClick={returnToDetails} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 bg-surface border border-white/10 rounded-2xl p-8 overflow-y-auto">
                    <div className="space-y-8">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                            <span className="text-primary">{question.topic || 'General'}</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div 
                                className="bg-primary h-full transition-all duration-300" 
                                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                            />
                        </div>

                        <h3 className="text-xl font-medium text-white leading-relaxed">
                            {question.question}
                        </h3>

                        <div className="space-y-3">
                            {question.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(question.id, idx)}
                                    className={clsx(
                                        "w-full text-left p-4 rounded-xl border transition-all duration-200",
                                        userAnswers[question.id] === idx
                                            ? "bg-primary/20 border-primary text-white"
                                            : "bg-white/5 border-transparent text-gray-300 hover:bg-white/10"
                                    )}
                                >
                                    <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 rounded-xl font-medium text-white disabled:opacity-50 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>
                    
                    {isLastQuestion ? (
                        <button
                            onClick={submitSession}
                            className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                            Finish Session
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                            className="px-6 py-3 bg-primary text-background rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    const renderResults = () => (
        <div className="h-full flex flex-col max-w-3xl mx-auto text-center">
            <div className="flex-1 bg-surface border border-white/10 rounded-2xl p-8 overflow-y-auto">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Session Completed!</h3>
                <p className="text-xl text-gray-400 mb-8">
                    You scored <span className="text-white font-bold">{sessionScore}%</span> on this session.
                </p>

                <div className="grid gap-4 text-left">
                    {activeQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 bg-black/20 rounded-lg border border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-white">{idx + 1}. {q.question}</p>
                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{q.topic}</span>
                            </div>
                            <div className="text-sm space-y-1">
                                <p className={clsx(
                                    userAnswers[q.id] === q.correctAnswer ? "text-green-400" : "text-red-400"
                                )}>
                                    Your Answer: {q.options[userAnswers[q.id]] || 'Skipped'}
                                </p>
                                {userAnswers[q.id] !== q.correctAnswer && (
                                    <p className="text-green-400">Correct Answer: {q.options[q.correctAnswer]}</p>
                                )}
                                {q.explanation && (
                                    <p className="text-gray-500 mt-2 italic">Explanation: {q.explanation}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-6">
                <button 
                    onClick={returnToDetails}
                    className="px-8 py-3 bg-primary text-background rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    )

    return (
        <>
            {viewMode === 'list' && renderList()}
            {viewMode === 'details' && renderDetails()}
            {viewMode === 'taking' && renderTaking()}
            {viewMode === 'results' && renderResults()}

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
                                <label className="block text-sm font-medium text-gray-400 mb-1">Topics (Optional)</label>
                                <textarea 
                                    value={topics}
                                    onChange={e => setTopics(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary h-24 resize-none"
                                    placeholder="List topics to study..."
                                />
                            </div>

                            {/* File Inputs */}
                            <div className="pt-4 border-t border-white/10">
                                <h3 className="text-sm font-bold text-white mb-3">Upload Content (Optional)</h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Exam File (PDF/DOCX)</label>
                                        <input 
                                            type="file" 
                                            accept=".pdf,.docx"
                                            onChange={e => setExamFile(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Answer Key (PDF/DOCX)</label>
                                        <input 
                                            type="file" 
                                            accept=".pdf,.docx"
                                            onChange={e => setAnswerKeyFile(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                    </div>
                                </div>
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
                                    disabled={isProcessing}
                                    className="px-6 py-2 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isProcessing ? 'Processing...' : 'Save Simulation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
