'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
// import defaultFoodImage from '@/assets/default-food.png'

type MenuItem = {
    name: string
    price: number
    description?: string
    image?: string
    volume?: string
    isAvailable: boolean
}

export default function MenuItemDetails({ categoryId, itemName }: { categoryId: string, itemName: string }) {
    const [item, setItem] = useState<MenuItem | null>(null)
    const [category, setCategory] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchMenuItem = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menus/${categoryId}/item?itemName=${encodeURIComponent(itemName)}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch menu item')
                }
                const data = await response.json()
                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch menu item')
                }
                setItem(data.data)
                setCategory(data.category)
            } catch (err) {
                setError('Failed to load menu item. Please try again later.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        if (categoryId && itemName) {
            fetchMenuItem()
        }
    }, [categoryId, itemName])

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-96 bg-gray-300 rounded-t-lg" />
                    <div className="bg-white rounded-b-lg shadow-lg p-6">
                        <div className="h-8 bg-gray-300 rounded w-2/3 mb-4" />
                        <div className="h-4 bg-gray-300 rounded w-full mb-2" />
                        <div className="h-4 bg-gray-300 rounded w-full mb-4" />
                        <div className="h-6 bg-gray-300 rounded w-24" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !item) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{error || 'Item not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                        &larr; Back to Menu
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="mb-4 text-blue-500 hover:text-blue-600 transition-colors flex items-center"
            >
                <span className="mr-2">&larr;</span>
                <span>Back to Menu</span>
            </button>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-64 sm:h-80 md:h-96 bg-gray-200">
                    <Image
                        src={`data:image/jpeg;base64,${item.image}`}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        priority
                        className="transition-opacity duration-300"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // target.src = .src;
                        }}
                    />
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">{item.name}</h1>
                            {category && (
                                <p className="text-gray-500 text-sm">{category}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-2xl text-blue-600 font-semibold">${item.price.toFixed(2)}</p>
                            {item.volume && (
                                <p className="text-gray-500 text-sm mt-1">{item.volume}</p>
                            )}
                        </div>
                    </div>
                    {!item.isAvailable && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                            Currently Unavailable
                        </div>
                    )}
                    {item.description && (
                        <p className="text-gray-600">{item.description}</p>
                    )}
                </div>
            </div>
        </div>
    )
}