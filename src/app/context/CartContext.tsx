'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'

type CartItem = {
    _id: string  // Changed from number to string
    id: string   // This is the restaurant ID
    name: string
    price: number
    quantity: number
    image: string
    description: string  // Added this field
}

type CartContextType = {
    cartItems: CartItem[]
    restaurantId: string | null
    tableNumber: number | null
    addToCart: (item: Omit<CartItem, 'quantity'>) => void
    updateQuantity: (id: string, quantity: number) => void
    removeFromCart: (id: string) => void
    clearCart: () => void
    setRestaurantId: (id: string) => void
    setTableNumber: (number: number | null) => void
}


const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [tableNumber, setTableNumber] = useState<number | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        const savedRestaurantId = localStorage.getItem('restaurantId')
        const savedTableNumber = localStorage.getItem('tableNumber')
        if (savedCart && savedRestaurantId) {
            setCartItems(JSON.parse(savedCart))
            setRestaurantId(savedRestaurantId)
        }
        if (savedTableNumber) {
            setTableNumber(parseInt(savedTableNumber))
        }
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cartItems))
            if (restaurantId) {
                localStorage.setItem('restaurantId', restaurantId)
            }
            if (tableNumber !== null) {
                localStorage.setItem('tableNumber', tableNumber.toString())
            } else {
                localStorage.removeItem('tableNumber')
            }
        }
    }, [cartItems, restaurantId, tableNumber, isInitialized])

    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i._id === item._id)
            if (existingItem) {
                return prevItems.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prevItems, { ...item, quantity: 1 }]
        })
    }

    const updateQuantity = (id: string, quantity: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item._id === id ? { ...item, quantity: Math.max(0, quantity) } : item
            ).filter((item) => item.quantity > 0)
        )
    }

    const removeFromCart = (id: string) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== id))
    }

    const clearCart = () => {
        setCartItems([])
        // setRestaurantId(null)
        localStorage.removeItem('cart')
        localStorage.removeItem('restaurantId')
        localStorage.removeItem('tableNumber')
        setTableNumber(null)
    }

    const setRestaurantIdSafely = (id: string) => {
        if (localStorage.getItem('restaurantId') !== id) {
            setRestaurantId(id)
            setCartItems([])
            setTableNumber(null)
            localStorage.removeItem('cart')
            localStorage.removeItem('tableNumber')
        }
    }

    return (
        <CartContext.Provider value={{
            cartItems,
            restaurantId,
            tableNumber,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            setRestaurantId: setRestaurantIdSafely,
            setTableNumber
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}