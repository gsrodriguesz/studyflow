import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

interface CalendarProps {
    events?: { date: Date; title: string; type: 'study' | 'exam' | 'deadline' }[]
}

export default function Calendar({ events = [] }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    return (
        <div className="bg-surface border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-sm font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                    const isCurrentMonth = isSameMonth(day, monthStart)
                    const isToday = isSameDay(day, new Date())
                    const dayEvents = events.filter(e => isSameDay(e.date, day))

                    return (
                        <div
                            key={day.toString()}
                            className={clsx(
                                'min-h-[100px] p-2 rounded-lg border border-transparent transition-colors',
                                isCurrentMonth ? 'bg-white/5 hover:bg-white/10' : 'bg-transparent text-gray-600',
                                isToday && 'border-primary/50 bg-primary/5'
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={clsx('text-sm font-medium', isToday ? 'text-primary' : 'text-gray-400')}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                            <div className="mt-2 space-y-1">
                                {dayEvents.map((event, i) => (
                                    <div
                                        key={i}
                                        className={clsx(
                                            'text-xs px-1.5 py-0.5 rounded truncate',
                                            event.type === 'study' && 'bg-blue-500/20 text-blue-400',
                                            event.type === 'exam' && 'bg-red-500/20 text-red-400',
                                            event.type === 'deadline' && 'bg-amber-500/20 text-amber-400'
                                        )}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
