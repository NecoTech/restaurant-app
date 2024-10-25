'use client'

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react'

type CartItem = {
    _id: string
    id: string
    name: string
    price: number
    quantity: number
    image: string
    description: string
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

    // Load initial state from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        const savedRestaurantId = localStorage.getItem('restaurantId')
        const savedTableNumber = localStorage.getItem('tableNumber')

        if (savedCart && savedRestaurantId) {
            try {
                setCartItems(JSON.parse(savedCart))
                setRestaurantId(savedRestaurantId)
            } catch (error) {
                console.error('Error parsing saved cart:', error)
                localStorage.removeItem('cart')
            }
        }

        if (savedTableNumber) {
            setTableNumber(parseInt(savedTableNumber))
        }

        setIsInitialized(true)
    }, [])

    // Save state to localStorage with debounce
    useEffect(() => {
        if (!isInitialized) return

        const saveToStorage = () => {
            try {
                localStorage.setItem('cart', JSON.stringify(cartItems))
                if (restaurantId) {
                    localStorage.setItem('restaurantId', restaurantId)
                }
                if (tableNumber !== null) {
                    localStorage.setItem('tableNumber', tableNumber.toString())
                } else {
                    localStorage.removeItem('tableNumber')
                }
            } catch (error) {
                console.error('Error saving cart to localStorage:', error)
            }
        }

        const timeoutId = setTimeout(saveToStorage, 300) // Debounce for 300ms
        return () => clearTimeout(timeoutId)
    }, [cartItems, restaurantId, tableNumber, isInitialized])

    // Memoized cart operations
    const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i._id === item._id)
            if (existingItem) {
                return prevItems.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prevItems, { ...item, quantity: 1 }]
        })
    }, [])

    const updateQuantity = useCallback((id: string, quantity: number) => {
        setCartItems((prevItems) => {
            const newItems = prevItems.map((item) =>
                item._id === id ? { ...item, quantity: Math.max(0, quantity) } : item
            ).filter((item) => item.quantity > 0)

            // Only trigger update if there's an actual change
            if (JSON.stringify(newItems) !== JSON.stringify(prevItems)) {
                return newItems
            }
            return prevItems
        })
    }, [])

    const removeFromCart = useCallback((id: string) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== id))
    }, [])

    const clearCart = useCallback(() => {
        setCartItems([])
        localStorage.removeItem('cart')
        localStorage.removeItem('restaurantId')
        localStorage.removeItem('tableNumber')
        setTableNumber(null)
    }, [])

    const setRestaurantIdSafely = useCallback((id: string) => {
        if (localStorage.getItem('restaurantId') !== id) {
            setRestaurantId(id)
            setCartItems([])
            setTableNumber(null)
            localStorage.removeItem('cart')
            localStorage.removeItem('tableNumber')
        }
    }, [])

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        cartItems,
        restaurantId,
        tableNumber,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setRestaurantId: setRestaurantIdSafely,
        setTableNumber
    }), [
        cartItems,
        restaurantId,
        tableNumber,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setRestaurantIdSafely
    ])

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    )
}

// Custom hook with error boundary
export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

// Optional: Add a wrapper component for optimized cart item renders
export const CartItemComponent = React.memo(function CartItemComponent({
    item,
    onUpdateQuantity
}: {
    item: CartItem
    onUpdateQuantity: (id: string, quantity: number) => void
}) {
    return (
        <div>
            {/* Your cart item UI here */}
            <span>{item.name}</span>
            <span>Quantity: {item.quantity}</span>
        </div>
    )
})