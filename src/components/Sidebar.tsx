import { Home, Clock, BookOpen, Calendar, BarChart2, GraduationCap, Settings, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import { useFocus } from '../context/FocusContext'

const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Clock, label: 'Focus', action: 'focus' },
    { icon: BookOpen, label: 'Notes', path: '/notes' },
    { icon: Calendar, label: 'Planning', path: '/planning' },
    { icon: BarChart2, label: 'Progress', path: '/progress' },
    { icon: GraduationCap, label: 'Simulations', path: '/simulations' },
    { icon: Calendar, label: 'Exam Calendar', path: '/calendar' },
]

export default function Sidebar() {
    const { logout } = useAuth()
    const { setFocusOpen, isFocusOpen } = useFocus()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Failed to logout', error)
        }
    }

    return (
        <aside className="w-64 bg-surface border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-background font-bold text-xl">S</span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">StudyFlow</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    if (item.action === 'focus') {
                        return (
                            <button
                                key="focus"
                                onClick={() => setFocusOpen(true)}
                                className={clsx(
                                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                    isFocusOpen
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        )
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path!}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                    isActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-2">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        clsx(
                            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                            isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        )
                    }
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </NavLink>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}
