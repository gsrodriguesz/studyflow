import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useGamification } from './GamificationContext'

interface FocusContextType {
    // Timer State
    timeLeft: number
    isActive: boolean
    mode: 'focus' | 'break'
    toggleTimer: () => void
    resetTimer: () => void
    switchMode: (mode: 'focus' | 'break') => void
    
    // UI State
    isFocusOpen: boolean
    isMinimized: boolean
    setFocusOpen: (isOpen: boolean) => void
    setMinimized: (isMinimized: boolean) => void
    
    // Forest State
    growthStage: number
    setGrowthStage: React.Dispatch<React.SetStateAction<number>>
}

const FocusContext = createContext<FocusContextType | undefined>(undefined)

export function FocusProvider({ children }: { children: React.ReactNode }) {
    const { addXp, addCoins } = useGamification()
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [mode, setMode] = useState<'focus' | 'break'>('focus')
    
    // UI State
    const [isFocusOpen, setFocusOpen] = useState(false)
    const [isMinimized, setMinimized] = useState(false)
    
    // Forest State
    const [growthStage, setGrowthStage] = useState(0)

    const handleTimerComplete = useCallback(() => {
        if (mode === 'focus') {
            addXp(50)
            addCoins(20)
            setGrowthStage((prev) => Math.min(prev + 25, 100))
        }
        // Play sound?
    }, [mode, addXp, addCoins])

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1)
            }, 1000)
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false)
            handleTimerComplete()
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isActive, timeLeft, handleTimerComplete])

    const toggleTimer = () => setIsActive(!isActive)

    const resetTimer = useCallback(() => {
        setIsActive(false)
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
    }, [mode])

    const switchMode = (newMode: 'focus' | 'break') => {
        setMode(newMode)
        setIsActive(false)
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60)
    }

    return (
        <FocusContext.Provider value={{
            timeLeft,
            isActive,
            mode,
            toggleTimer,
            resetTimer,
            switchMode,
            isFocusOpen,
            isMinimized,
            setFocusOpen,
            setMinimized,
            growthStage,
            setGrowthStage
        }}>
            {children}
        </FocusContext.Provider>
    )
}

export function useFocus() {
    const context = useContext(FocusContext)
    if (context === undefined) {
        throw new Error('useFocus must be used within a FocusProvider')
    }
    return context
}
