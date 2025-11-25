import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, AuthService, type UserProfile } from '../services/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'

interface AuthContextType {
    user: User | null
    userProfile: UserProfile | null
    loading: boolean
    login: () => Promise<void>
    logout: () => Promise<void>
    updatePreferences: (preferences: NonNullable<UserProfile['preferences']>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let profileUnsubscribe: (() => void) | undefined;

        const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            
            // Cleanup previous profile subscription if exists
            if (profileUnsubscribe) {
                profileUnsubscribe()
                profileUnsubscribe = undefined
            }

            if (currentUser) {
                profileUnsubscribe = AuthService.subscribeToProfile(currentUser.uid, (data) => {
                    setUserProfile(data)
                    setLoading(false)
                })
            } else {
                setUserProfile(null)
                setLoading(false)
            }
        })

        return () => {
            authUnsubscribe()
            if (profileUnsubscribe) profileUnsubscribe()
        }
    }, [])

    const login = async () => {
        await AuthService.loginWithGoogle()
    }

    const logout = async () => {
        await AuthService.logout()
    }

    const updatePreferences = async (preferences: NonNullable<UserProfile['preferences']>) => {
        if (user) {
            await AuthService.updatePreferences(user.uid, preferences)
        }
    }

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, login, logout, updatePreferences }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
