'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '..//context/CartContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '..//context/AuthContext'

type MenuItem = {
    _id: string
    id: string
    name: string
    price: number
    category: string
    image: string
    description: string
}

export default function Menu({ restaurantId }: { restaurantId: string }) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { addToCart, updateQuantity, cartItems } = useCart()
    const router = useRouter()
    const { user } = useAuth()

    useEffect(() => {
        const fetchMenuItems = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${restaurantId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch menu items')
                }
                const data = await response.json()
                setMenuItems(data)
            } catch (err) {
                setError('Failed to load menu items. Please try again later.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMenuItems()
    }, [restaurantId])

    const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))]

    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory)

    const handleViewOrders = () => {
        router.push(`/orders/${user?.phoneNumber}`)
    }

    const getItemQuantity = (itemId: string) => {
        const cartItem = cartItems.find(item => item._id === itemId)
        return cartItem ? cartItem.quantity : 0
    }

    const handleAddToCart = (item: MenuItem) => {
        addToCart(item)
    }

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        updateQuantity(itemId, newQuantity)
    }

    const handleItemClick = (itemId: string) => {
        router.push(`/menu-item/${itemId}`)
    }

    if (isLoading) {
        return <div className="text-center py-4">Loading menu items...</div>
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>
    }

    return (
        <div className="w-full pb-32">
            <div className="sticky top-0 bg-white z-10 p-4 shadow-md flex justify-between items-center">
                <h1 className="text-xl font-bold">Menu</h1>
                <button
                    onClick={handleViewOrders}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                    aria-label="View Your Orders"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </button>
            </div>

            <div className="mt-4 space-y-4 mb-4">
                {filteredItems.map((item) => (
                    <div
                        key={item._id}
                        className="flex items-center bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleItemClick(item._id)}
                    >
                        <div className="relative w-24 h-24 mr-4">
                            <Image
                                src={item.image}
                                alt={item.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-md"
                            />
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                            <p className="text-blue-600 font-semibold mt-1">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                            {getItemQuantity(item._id) === 0 ? (
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
                                >
                                    Add
                                </button>
                            ) : (
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleUpdateQuantity(item._id, getItemQuantity(item._id) - 1)}
                                        className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="mx-2 w-8 text-center">{getItemQuantity(item._id)}</span>
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md z-10">
                <div className="flex overflow-x-auto py-2 px-4 no-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`flex-shrink-0 px-4 py-2 mx-1 rounded-full whitespace-nowrap ${activeCategory === category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}