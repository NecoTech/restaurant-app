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
    // const { userId } = router.query
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

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
            {orders.length === 0 ? (
                <p>You havent placed any orders yet.</p>
            ) : (
                <ul className="space-y-4">
                    {orders.map((order) => (
                        <li key={order._id} className="border p-4 rounded-lg">
                            <Link href={`/order-status/${order._id}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Order #{order.orderNumber}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">${order.total.toFixed(2)}</p>
                                        <p className={`text-sm ${order.orderStatus === 'Completed' ? 'text-green-500' : 'text-yellow-500'
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
            <button
                onClick={() => router.back()}
                className="mt-8 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
                Back to Menu
            </button>
        </div>
    )
}