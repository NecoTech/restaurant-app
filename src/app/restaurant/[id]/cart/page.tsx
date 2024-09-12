'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Cart from '..//..//../components/Cart'
import { CartProvider, useCart } from '..//..//../context/CartContext'
import { useEffect } from 'react'

function CartContent() {
    const params = useParams()
    const { id } = params
    const { cartItems, setRestaurantId } = useCart()

    // useEffect(() => {
    //     setRestaurantId(id as string)
    // }, [id, setRestaurantId])

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
                    <Link href={`/restaurant/${id}`} className="text-blue-500 hover:text-blue-700 transition-colors">
                        Back to Menu
                    </Link>
                </div>
                {cartItems.length > 0 ? (
                    <Cart restaurantId={id as string} />
                ) : (
                    <p className="text-center text-gray-500 my-8">Your cart is empty.</p>
                )}
            </div>
        </div>
    )
}

export default function CartPage() {
    return (
        <CartProvider>
            <CartContent />
        </CartProvider>
    )
}