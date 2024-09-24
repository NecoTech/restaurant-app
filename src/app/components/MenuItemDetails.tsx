'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
// import { useCart } from '..//context/CartContext'

type MenuItem = {
    _id: string
    id: string
    name: string
    price: number
    category: string
    image: string
    description: string
}

export default function MenuItemDetails({ itemid }: { itemid: string }) {
    const [item, setItem] = useState<MenuItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    // const { addToCart, updateQuantity, cartItems } = useCart()

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
            } catch (err) {
                setError('Failed to load menu item. Please try again later.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMenuItem()
    }, [itemid])

    // const getItemQuantity = (itemId: string) => {
    //     const cartItem = cartItems.find(item => item._id === itemId)
    //     return cartItem ? cartItem.quantity : 0
    // }

    // const handleAddToCart = (item: MenuItem) => {
    //     addToCart(item)
    // }

    // const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    //     updateQuantity(itemId, newQuantity)
    // }

    if (isLoading) {
        return <div className="text-center py-4">Loading menu item...</div>
    }

    if (error || !item) {
        return <div className="text-center py-4 text-red-500">{error || 'Item not found'}</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="mb-4 text-blue-500 hover:text-blue-600 transition-colors"
            >
                &larr; Back to Menu
            </button>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-64 sm:h-80 md:h-96">
                    <Image
                        src={item.image}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <p className="text-2xl text-blue-600 font-semibold mb-4">${item.price.toFixed(2)}</p>
                    {/* <div className="flex items-center justify-center">
                        <button
                            onClick={() => handleUpdateQuantity(item._id, getItemQuantity(item._id) - 1)}
                            className="bg-gray-200 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                            disabled={getItemQuantity(item._id) === 0}
                        >
                            -
                        </button>
                        <span className="mx-4 text-xl">{getItemQuantity(item._id)}</span>
                        <button
                            onClick={() => handleAddToCart(item)}
                            className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                        >
                            +
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    )
}