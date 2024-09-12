'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Menu from '..//../components/Menu'
import { CartProvider, useCart } from '..//../context/CartContext'
import { AuthProvider, useAuth } from '..//../context/AuthContext'
import CartIcon from '..//../components/CartIcon'
import FloatingCartIcon from '..//../components/FloatingCartIcon'
import Login from '..//../components/Login'
import Register from '..//../components/Register'

// const RESTAURANT_DATA = {
//     '1': {
//         name: 'Burger Palace',
//         banner: 'https://picsum.photos/200/300.jpg'
//     },
//     '2': {
//         name: 'Pizza Heaven',
//         banner: 'https://picsum.photos/200/400.jpg'
//     }
// }
type Restaurant = {
    id: string;
    name: string;
    bannerImage: string;
    // Add other properties as needed
}

const API_BASE_URL = 'http://localhost:5000';

function RestaurantContent() {
    const params = useParams()
    const { id } = params
    const [restaurant, setRestaurant] = useState({ name: '', bannerImage: '' })
    const { user } = useAuth()
    const { setRestaurantId } = useCart()
    const [showRegister, setShowRegister] = useState(false)
    const { clearCart } = useCart()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRestaurant = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch(`${API_BASE_URL}/api/restaurant/${id}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch restaurant details')
                }
                const data = await response.json()
                setRestaurant(data[0])
                setRestaurantId(id as string)
            } catch (err) {
                setError('Failed to load restaurant details. Please try again later.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRestaurant()
    }, [id, setRestaurantId])

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                {showRegister ? <Register /> : <Login />}
                <button
                    onClick={() => setShowRegister(!showRegister)}
                    className="mt-4 text-blue-500 hover:text-blue-700"
                >
                    {showRegister ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
                </button>
            </div>
        )
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading restaurant details...</div>
    }

    if (error || !restaurant) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500">{error || 'Failed to load restaurant'}</div>
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="relative h-64 w-full">
                <Image
                    src={restaurant.bannerImage}
                    alt={restaurant.name}
                    layout="fill"
                    objectFit="cover"
                    className="brightness-50"
                />
                <div className="absolute inset-0 flex items-center justify-between px-6">
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">{restaurant.name}</h1>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <Menu restaurantId={id as string} />
            </div>
            <FloatingCartIcon restaurantId={id as string} />
        </div>
    )
}

export default function RestaurantPage() {
    return (
        <AuthProvider>
            <CartProvider>
                <RestaurantContent />
            </CartProvider>
        </AuthProvider>
    )
}