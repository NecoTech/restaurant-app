'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '..//context/CartContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '..//context/AuthContext'
import DinoGame from '../components/Dinogame'

type MenuItem = {
    _id: string
    id: string
    name: string
    price: number
    category: string
    image: string
    description: string
    isAvailable: boolean
}

export default function Menu({ restaurantId }: { restaurantId: string }) {

    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { addToCart, updateQuantity, cartItems } = useCart()
    const router = useRouter()
    const { user } = useAuth()
    const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false)
    const [waiterReason, setWaiterReason] = useState<string>('Assistance')
    const [tableNumber, setTableNumber] = useState<string>('')

    const handleQuantityUpdate = (e: React.MouseEvent, itemId: string, action: 'increase' | 'decrease') => {
        e.preventDefault()
        e.stopPropagation()

        const currentQuantity = getItemQuantity(itemId)
        const item = menuItems.find(item => item._id === itemId)

        if (!item) return

        if (action === 'increase') {
            handleAddToCart(item)
        } else {
            handleUpdateQuantity(itemId, currentQuantity - 1)
        }
    }

    const fetchMenuItems = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${restaurantId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch menu items')
            }
            const data = await response.json()
            setMenuItems(data)
            setIsLoading(false)
        } catch (err) {
            setError('Failed to load menu items. Please try again later.')
            console.error(err)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMenuItems()

        // Set up interval to fetch menu items every 15 seconds
        const intervalId = setInterval(fetchMenuItems, 25000)

        // Clean up interval on component unmount
        return () => clearInterval(intervalId)
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
        if (item.isAvailable) {
            addToCart(item)
        }
    }

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        updateQuantity(itemId, newQuantity)
    }

    const handleItemClick = (itemId: string) => {
        router.push(`/menu-item/${itemId}`)
    }

    const handleCallWaiter = async () => {
        if (!tableNumber) {
            alert('Please enter a table number.')
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waiter-request/waiter-assistance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    restaurantId,
                    tableNumber: parseInt(tableNumber),
                    reason: waiterReason,
                }),
            })
            if (!response.ok) {
                throw new Error('Failed to call waiter')
            }
            alert(`Waiter has been called for ${waiterReason.toLowerCase()} at table ${tableNumber}.`)
            setIsWaiterModalOpen(false)
            setWaiterReason('Assistance')
            setTableNumber('')
        } catch (error) {
            console.error('Error calling waiter:', error)
            alert('Failed to call waiter. Please try again.')
        }
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
                <div className="flex items-center space-x-4">
                    <DinoGame />
                    <button
                        onClick={() => setIsWaiterModalOpen(true)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition-colors"
                    >
                        Call Waiter
                    </button>
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
            </div>

            {/* Waiter Call Modal */}
            {isWaiterModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Call Waiter</h2>
                        <select
                            value={waiterReason}
                            onChange={(e) => setWaiterReason(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                        >
                            <option value="Assistance">General Assistance</option>
                            <option value="Clean Table">Clean Table</option>
                            <option value="Order Issue">Order Issue</option>
                            <option value="Refill">Refill</option>
                        </select>
                        <input
                            type="number"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="Enter table number"
                            className="w-full p-2 mb-4 border rounded"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsWaiterModalOpen(false)}
                                className="mr-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCallWaiter}
                                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                            >
                                Call Waiter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 space-y-4 mb-4">
                {filteredItems.map((item) => (
                    <div
                        key={item._id}
                        className={`flex items-center bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${!item.isAvailable ? 'opacity-50' : ''}`}
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
                            {!item.isAvailable && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                                    <span className="text-white font-bold">Out of Stock</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-blue-600 font-semibold mt-1">${item.price.toFixed(2)}</p>
                        </div>
                        <div
                            className="flex items-center"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                        >
                            {item.isAvailable ? (
                                getItemQuantity(item._id) === 0 ? (
                                    <button
                                        onClick={(e) => handleQuantityUpdate(e, item._id, 'increase')}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
                                    >
                                        Add
                                    </button>
                                ) : (
                                    <div className="flex items-center">
                                        <button
                                            onClick={(e) => handleQuantityUpdate(e, item._id, 'decrease')}
                                            className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="mx-2 w-8 text-center">{getItemQuantity(item._id)}</span>
                                        <button
                                            onClick={(e) => handleQuantityUpdate(e, item._id, 'increase')}
                                            className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                )
                            ) : (
                                <span className="text-red-500 font-semibold">Unavailable</span>
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