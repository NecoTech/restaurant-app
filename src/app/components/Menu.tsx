'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '..//context/CartContext'

type MenuItem = {
    _id: string
    id: string  // This is actually the restaurant ID
    name: string
    description: string
    price: number
    category: string
    image: string
}



// const API_BASE_URL = 'http://localhost:5000';

export default function Menu({ restaurantId }: { restaurantId: string }) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { addToCart } = useCart()


    useEffect(() => {
        const fetchMenuItems = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch(`${process.env.API_BASE_URL}/api/menu/${restaurantId}`)
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

    if (isLoading) {
        return <div className="text-center py-4">Loading menu items...</div>
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>
    }

    const handleAddToCart = (item: MenuItem) => {
        const cartItem = {
            _id: item._id,
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            description: item.description
        }
        addToCart(cartItem)
    }

    return (
        <div className="w-full pb-32">
            <div className="flex overflow-x-auto py-2 mb-4 no-scrollbar">
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
            <div className="space-y-4 mb-4">
                {filteredItems.map((item) => (
                    <div key={item._id} className="flex items-center bg-white p-4 rounded-lg shadow">
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
                            {/* <p className="text-sm text-gray-600">{item.description}</p> */}
                            <p className="text-blue-600 font-semibold mt-1">${item.price.toFixed(2)}</p>
                        </div>
                        <button
                            onClick={() => handleAddToCart(item)}
                            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}