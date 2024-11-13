'use client'

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react'

type CartItem = {
    _id: string
    id: string
    name: string
    price: number
    quantity: number
    image: {
        data: {
            type: string
            data: number[]
        }
        contentType: string
    }
    description: string
}

// Type for storage (excluding image)
type StorageCartItem = Omit<CartItem, 'image'> & {
    image?: never
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

    // Helper function to remove image data for storage
    const prepareForStorage = (items: CartItem[]): StorageCartItem[] => {
        return items.map(({ image, ...rest }) => rest)
    }

    // Load initial state from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        const savedRestaurantId = localStorage.getItem('restaurantId')
        const savedTableNumber = localStorage.getItem('tableNumber')

        if (savedCart && savedRestaurantId) {
            try {
                const parsedCart = JSON.parse(savedCart) as StorageCartItem[]
                // Fetch current items to get their images
                const fetchItemDetails = async () => {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${savedRestaurantId}`)
                        if (!response.ok) throw new Error('Failed to fetch menu items')
                        const menuItems = await response.json()

                        // Merge saved cart items with fetched menu items to get images
                        const updatedCart = parsedCart.map(cartItem => {
                            const menuItem = menuItems.find((item: any) => item._id === cartItem._id)
                            return {
                                ...cartItem,
                                image: menuItem?.image || null
                            }
                        })
                        setCartItems(updatedCart)
                    } catch (error) {
                        console.error('Error fetching menu items:', error)
                        // setCartItems(parsedCart as CartItem[]) // Fallback to saved cart without images
                    }
                }

                fetchItemDetails()
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
                const storageItems = prepareForStorage(cartItems)
                localStorage.setItem('cart', JSON.stringify(storageItems))
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

        const timeoutId = setTimeout(saveToStorage, 300)
        return () => clearTimeout(timeoutId)
    }, [cartItems, restaurantId, tableNumber, isInitialized])

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

            if (JSON.stringify(prepareForStorage(newItems)) !== JSON.stringify(prepareForStorage(prevItems))) {
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

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export const CartItemComponent = React.memo(function CartItemComponent({
    item,
    onUpdateQuantity
}: {
    item: CartItem
    onUpdateQuantity: (id: string, quantity: number) => void
}) {
    return (
        <div>
            <span>{item.name}</span>
            <span>Quantity: {item.quantity}</span>
        </div>
    )
})