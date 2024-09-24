'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type OrderItem = {
    name: string
    quantity: number
    price: number
}

type Order = {
    _id: string
    orderNumber: string
    items: OrderItem[]
    total: number
    orderStatus: 'pending' | 'preparing' | 'ready' | 'delivered' | 'Notcomplete'
    createdAt: string
}

export default function OrderStatus({ orderId }: { orderId: string }) {
    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchOrderStatus = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch order status')
                }
                const data = await response.json()
                setOrder(data)
            } catch (err) {
                setError('Failed to load order status. Please try again later.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrderStatus()
        // Set up polling to refresh order status every 30 seconds
        const intervalId = setInterval(fetchOrderStatus, 30000)
        return () => clearInterval(intervalId)
    }, [orderId])

    if (isLoading) {
        return <div className="text-center py-4">Loading order status...</div>
    }

    if (error || !order) {
        return <div className="text-center py-4 text-red-500">{error || 'Order not found'}</div>
    }

    const getStatusColor = (status: Order['orderStatus']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500'
            case 'preparing': return 'bg-blue-500'
            case 'ready': return 'bg-green-500'
            case 'delivered': return 'bg-gray-500'
            case 'Notcomplete': return 'bg-red-500'
            default: return 'bg-gray-300'
        }
    }

    return (
        <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Order Status</h2>
            <p className="mb-2">Order Number: {order.orderNumber}</p>
            <p className="mb-4">Placed on: {new Date(order.createdAt).toLocaleString()}</p>

            <div className="mb-6">
                <div className={`inline-block px-3 py-1 rounded-full text-white ${getStatusColor(order.orderStatus)}`}>
                    {order?.orderStatus?.toUpperCase()}
                </div>
            </div>

            <h3 className="text-xl font-semibold mb-2">Order Items:</h3>
            <ul className="mb-4">
                {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between mb-2">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                ))}
            </ul>

            <div className="border-t pt-4">
                <p className="font-bold text-lg">Total: ${order.total.toFixed(2)}</p>
            </div>

            <button
                onClick={() => router.push('/')}
                className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
                Back to Menu
            </button>
        </div>
    )
}