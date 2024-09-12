'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';


// const API_BASE_URL = 'http://localhost:5000';
type Order = {
    _id: string;
    orderNumber: string;
    items: Array<{
        name: string;
        quantity: number;
    }>;
    tableNumber: number;
    createdAt: string;
};

export default function KitchenOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const { restaurantId } = useParams();
    const restid = "rest002"
    useEffect(() => {
        fetchOrders();
        // Set up polling to refresh orders every 30 seconds
        const intervalId = setInterval(fetchOrders, 30000);
        return () => clearInterval(intervalId);
    }, [restaurantId]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${restid}`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const markOrderCompleted = async (orderId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/complete`, {
                method: 'PATCH',
            });
            if (!response.ok) {
                throw new Error('Failed to mark order as completed');
            }
            // Remove the completed order from the list
            setOrders(orders.filter(order => order._id !== orderId));
        } catch (error) {
            console.error('Error marking order as completed:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Kitchen Orders</h1>
            {orders.length === 0 ? (
                <p>No pending orders.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white shadow-md rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-2">Order #{order.orderNumber}</h2>
                            <p className="text-gray-600 mb-2">Table: {order.tableNumber}</p>
                            <p className="text-gray-600 mb-2">
                                Time: {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                            <ul className="list-disc list-inside mb-4">
                                {order.items.map((item, index) => (
                                    <li key={index}>
                                        {item.name} x {item.quantity}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => markOrderCompleted(order._id)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Mark as Completed
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}