'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Order = {
    _id: string
    orderNumber: string
    total: number
    createdAt: string
    orderStatus: string
}

export default function Orders({ userId }: { userId: string }) {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOrders = async () => {
            if (!userId) return
            setIsLoading(true)
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/${userId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch orders')
                }
                const data = await response.json()
                setOrders(data)
            } catch (err) {
                setError('Failed to load orders. Please try again later.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrders()
    }, [userId])

    if (isLoading) {
        return (
            <div className="container mx-auto px-4">
                <div className="sticky top-0 bg-white z-10 py-4 border-b">
                    <button
                        onClick={() => router.back()}
                        className="text-blue-500 hover:text-blue-600 transition-colors flex items-center"
                    >
                        <span className="mr-2">&larr;</span>
                        <span>Back to Menu</span>
                    </button>
                </div>
                <div className="py-8 text-center">Loading...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4">
                <div className="sticky top-0 bg-white z-10 py-4 border-b">
                    <button
                        onClick={() => router.back()}
                        className="text-blue-500 hover:text-blue-600 transition-colors flex items-center"
                    >
                        <span className="mr-2">&larr;</span>
                        <span>Back to Menu</span>
                    </button>
                </div>
                <div className="py-8 text-center text-red-500">Error: {error}</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4">
            <div className="sticky top-0 bg-white z-10 py-4 border-b">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="text-blue-500 hover:text-blue-600 transition-colors flex items-center"
                    >
                        <span className="mr-2">&larr;</span>
                        <span>Back to Menu</span>
                    </button>
                </div>
            </div>

            <div className="py-8">
                <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
                {orders.length === 0 ? (
                    <p className="text-gray-500">You havent placed any orders yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {orders.map((order) => (
                            <li key={order._id} className="bg-white border p-4 rounded-lg shadow-sm hover:shadow transition-shadow">
                                <Link href={`/order-status/${order._id}`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">Order #{order.orderNumber}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">${order.total.toFixed(2)}</p>
                                            <p className={`text-sm ${order.orderStatus === 'Completed'
                                                    ? 'text-green-500'
                                                    : 'text-yellow-500'
                                                }`}>
                                                {order.orderStatus}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}