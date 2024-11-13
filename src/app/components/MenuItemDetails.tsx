'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type MenuItem = {
    _id: string
    id: string
    name: string
    price: number
    category: string
    image: {
        data: {
            type: string
            data: number[]
        }
        contentType: string
    }
    description: string
}

export default function MenuItemDetails({ itemid }: { itemid: string }) {
    const [item, setItem] = useState<MenuItem | null>(null)
    const [imageUrl, setImageUrl] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchMenuItem = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/menu-item/${itemid}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch menu item')
                }
                const data = await response.json()
                setItem(data)

                // Convert image buffer to base64 URL
                if (data.image?.data?.data) {
                    const base64String = Buffer.from(data.image.data.data).toString('base64')
                    const url = `data:${data.image.contentType};base64,${base64String}`
                    setImageUrl(url)
                }
            } catch (err) {
                setError('Failed to load menu item. Please try again later.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMenuItem()
    }, [itemid])

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
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                            priority
                            className="transition-opacity duration-300"
                        />
                    )}
                </div>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <p className="text-2xl text-blue-600 font-semibold mb-4">${item.price.toFixed(2)}</p>
                </div>
            </div>
        </div>
    )
}