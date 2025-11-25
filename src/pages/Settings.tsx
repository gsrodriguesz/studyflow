import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Check, User, LogOut, Bell, Clock } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function Settings() {
    const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme()
    const { user, userProfile, login, logout, updatePreferences } = useAuth()
    const [pomodoroDuration, setPomodoroDuration] = useState(25)
    const [srsNotifications, setSrsNotifications] = useState(true)

    // Sync local state with user profile
    useEffect(() => {
        if (userProfile?.preferences) {
            setPomodoroDuration(userProfile.preferences.pomodoroDuration)
            setSrsNotifications(userProfile.preferences.srsNotifications)
        }
    }, [userProfile])

    const handleThemeChange = async (newTheme: 'light' | 'dark') => {
        setTheme(newTheme)
        if (user) {
            await updatePreferences({
                theme: newTheme,
                primaryColor: primaryColor,
                pomodoroDuration: pomodoroDuration,
                srsNotifications: srsNotifications,
                ...userProfile?.preferences
            })
        }
    }

    const handleColorChange = async (newColor: string) => {
        setPrimaryColor(newColor as any)
        if (user) {
            await updatePreferences({
                theme: theme,
                primaryColor: newColor,
                pomodoroDuration: pomodoroDuration,
                srsNotifications: srsNotifications,
                ...userProfile?.preferences
            })
        }
    }

    const handlePomodoroChange = async (duration: number) => {
        setPomodoroDuration(duration)
        if (user) {
            await updatePreferences({
                theme: theme,
                primaryColor: primaryColor,
                pomodoroDuration: duration,
                srsNotifications: srsNotifications,
                ...userProfile?.preferences
            })
        }
    }

    const handleNotificationsChange = async (enabled: boolean) => {
        setSrsNotifications(enabled)
        if (user) {
            await updatePreferences({
                theme: theme,
                primaryColor: primaryColor,
                pomodoroDuration: pomodoroDuration,
                srsNotifications: enabled,
                ...userProfile?.preferences
            })
        }
    }

    const colors = [
        { name: 'amber', hex: '#f59e0b' },
        { name: 'blue', hex: '#3b82f6' },
        { name: 'green', hex: '#22c55e' },
        { name: 'purple', hex: '#a855f7' },
        { name: 'rose', hex: '#f43f5e' },
    ] as const


    return (
        <div className="space-y-8 pb-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage your preferences and account</p>
            </div>

            {/* Account Section */}
            <div className="bg-surface rounded-2xl p-6 border border-white/10 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-white">Account</h2>
                </div>

                {user ? (
                    <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
                        <img
                            src={userProfile?.photoURL || 'https://ui-avatars.com/api/?name=User'}
                            alt="Profile"
                            className="w-16 h-16 rounded-full border-2 border-primary"
                        />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{userProfile?.displayName || 'User'}</h3>
                            <p className="text-gray-400">{user.email}</p>
                            <div className="flex gap-2 mt-1 text-xs text-gray-500">
                                <span>Level {userProfile?.level || 1}</span>
                                <span>•</span>
                                <span>{userProfile?.xp || 0} XP</span>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-8 bg-black/20 rounded-xl">
                        <p className="text-gray-400 mb-4">Sign in to sync your progress across devices.</p>
                        <button
                            onClick={() => login()}
                            className="px-6 py-2 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Sign in with Google
                        </button>
                    </div>
                )}
            </div>

            {/* Appearance Section */}
            <div className="bg-surface rounded-2xl p-6 border border-white/10 space-y-6">
                <h2 className="text-xl font-semibold text-white">Appearance</h2>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-medium">Theme</h3>
                        <p className="text-sm text-gray-400">Select your preferred interface theme</p>
                    </div>
                    <div className="flex bg-background rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={clsx(
                                'p-2 rounded-md transition-all',
                                theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'
                            )}
                        >
                            <Sun className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleThemeChange('dark')}
                            className={clsx(
                                'p-2 rounded-md transition-all',
                                theme === 'dark' ? 'bg-zinc-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                            )}
                        >
                            <Moon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Color Picker */}
                <div className="space-y-3">
                    <div>
                        <h3 className="text-white font-medium">Accent Color</h3>
                        <p className="text-sm text-gray-400">Choose the primary color for the application</p>
                    </div>
                    <div className="flex gap-3">
                        {colors.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => handleColorChange(color.name)}
                                className={clsx(
                                    'w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 border-2',
                                    primaryColor === color.name ? 'border-white' : 'border-transparent'
                                )}
                                style={{ backgroundColor: color.hex }}
                            >
                                {primaryColor === color.name && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-surface rounded-2xl p-6 border border-white/10 space-y-6">
                <h2 className="text-xl font-semibold text-white">Preferences</h2>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Pomodoro Duration</h3>
                            <p className="text-sm text-gray-400">Length of focus sessions in minutes</p>
                        </div>
                    </div>
                    <select
                        value={pomodoroDuration}
                        onChange={(e) => handlePomodoroChange(Number(e.target.value))}
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                    >
                        <option value={25}>25 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">SRS Notifications</h3>
                            <p className="text-sm text-gray-400">Get reminded when reviews are due</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleNotificationsChange(!srsNotifications)}
                        className={clsx(
                            'w-12 h-6 rounded-full transition-colors relative',
                            srsNotifications ? 'bg-primary' : 'bg-gray-600'
                        )}
                    >
                        <div className={clsx(
                            'w-4 h-4 bg-white rounded-full absolute top-1 transition-all',
                            srsNotifications ? 'left-7' : 'left-1'
                        )} />
                    </button>
                </div>
            </div>
        </div>
    )
}
