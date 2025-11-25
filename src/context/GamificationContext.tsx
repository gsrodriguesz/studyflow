import React, { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'
import { FirestoreService } from '../services/firebase'

interface GamificationContextType {
    xp: number
    coins: number
    level: number
    streak: number
    addXp: (amount: number) => void
    addCoins: (amount: number) => void
    setStreak: (streak: number) => void
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const { user, userProfile } = useAuth()

    // Fallback values if not logged in
    const xp = userProfile?.xp || 0
    const coins = userProfile?.coins || 0
    const streak = userProfile?.streak || 0
    const level = userProfile?.level || 1

    const addXp = async (amount: number) => {
        if (!user || !userProfile) return
        
        const newXp = xp + amount
        // Simple level up logic: Level = sqrt(XP/100) + 1
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1
        
        await FirestoreService.updateDocument('users', user.uid, {
            xp: newXp,
            level: newLevel
        })
    }

    const addCoins = async (amount: number) => {
        if (!user || !userProfile) return
        await FirestoreService.updateDocument('users', user.uid, {
            coins: coins + amount
        })
    }

    const setStreak = async (newStreak: number) => {
        if (!user || !userProfile) return
        await FirestoreService.updateDocument('users', user.uid, {
            streak: newStreak
        })
    }

    return (
        <GamificationContext.Provider value={{ xp, coins, level, streak, addXp, addCoins, setStreak }}>
            {children}
        </GamificationContext.Provider>
    )
}

export function useGamification() {
    const context = useContext(GamificationContext)
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider')
    }
    return context
}
