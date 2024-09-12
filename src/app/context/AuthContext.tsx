'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'

type User = {
    // firstName: string
    // lastName: string
    fullname: string
    phoneNumber: string
}

type AuthContextType = {
    user: User | null
    login: (user: User) => void
    logout: () => void
    register: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        // Check if user is stored in localStorage on initial load
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = (userData: User) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    const register = (userData: User) => {
        // In a real app, you would send this data to your backend
        login(userData)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
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