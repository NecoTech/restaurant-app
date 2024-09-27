'use client'

import React, { useState, useEffect } from 'react';

type Order = {
    _id: string;
    orderNumber: string;
    items: Array<{
        name: string;
        quantity: number;
    }>;
    userId: string;
    tableNumber: number;
    createdAt: string;
};

type MenuItem = {
    _id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
    isAvailable: boolean;
};

type WaiterAssistance = {
    _id: string;
    tableNumber: number;
    reason: string;
    createdAt: string;
};

export default function KitchenOrders({ restaurantId }: { restaurantId: string }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [waiterAssistance, setWaiterAssistance] = useState<WaiterAssistance[]>([]);
    const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'assistance'>('orders');

    useEffect(() => {
        fetchOrders();
        fetchMenuItems();
        fetchWaiterAssistance();
        const intervalId = setInterval(() => {
            fetchOrders();
            fetchMenuItems();
            fetchWaiterAssistance();
        }, 30000);
        return () => clearInterval(intervalId);
    }, [restaurantId]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/restaurant/${restaurantId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${restaurantId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch menu items');
            }
            const data = await response.json();
            setMenuItems(data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const fetchWaiterAssistance = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waiter-request/${restaurantId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch waiter assistance requests');
            }
            const data = await response.json();
            setWaiterAssistance(data);
        } catch (error) {
            console.error('Error fetching waiter assistance requests:', error);
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
            setOrders(orders.filter(order => order._id !== orderId));
        } catch (error) {
            console.error('Error marking order as completed:', error);
        }
    };

    const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/menu-item/${itemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isAvailable }),
            });
            if (!response.ok) {
                throw new Error('Failed to update item availability');
            }
            setMenuItems(menuItems.map(item =>
                item._id === itemId ? { ...item, isAvailable } : item
            ));
        } catch (error) {
            console.error('Error updating item availability:', error);
        }
    };

    const markAssistanceCompleted = async (assistanceId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${assistanceId}/complete`, {
                method: 'PATCH',
            });
            if (!response.ok) {
                throw new Error('Failed to mark assistance as completed');
            }
            setWaiterAssistance(waiterAssistance.filter(assistance => assistance._id !== assistanceId));
        } catch (error) {
            console.error('Error marking assistance as completed:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Kitchen Dashboard</h1>

            <div className="mb-4 flex justify-between items-center bg-white shadow-md rounded-lg p-4">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`px-4 py-2 rounded ${activeTab === 'menu' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Menu Availability
                    </button>
                    <button
                        onClick={() => setActiveTab('assistance')}
                        className={`px-4 py-2 rounded ${activeTab === 'assistance' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Waiter Assistance
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold">Unavailable Items: {menuItems.filter(item => !item.isAvailable).length}</span>
                    <span className="text-sm font-semibold">Pending Assistance: {waiterAssistance.length}</span>
                </div>
            </div>

            {activeTab === 'orders' && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Pending Orders</h2>
                    {orders.length === 0 ? (
                        <p>No pending orders.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white shadow-md rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-2">Order #{order.orderNumber}</h3>
                                    <p className="text-gray-600 mb-1">Table: {order.tableNumber}</p>
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
            )}

            {activeTab === 'menu' && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Menu Item Availability</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {menuItems.map((item) => (
                            <div key={item._id} className="bg-white shadow-md rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                                <p className="text-gray-600 mb-2">{item.category}</p>
                                <div className="flex items-center justify-between">
                                    <span className={item.isAvailable ? 'text-green-500' : 'text-red-500'}>
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </span>
                                    <button
                                        onClick={() => toggleItemAvailability(item._id, !item.isAvailable)}
                                        className={`px-4 py-2 rounded ${item.isAvailable
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-green-500 hover:bg-green-600'
                                            } text-white`}
                                    >
                                        {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'assistance' && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Waiter Assistance Requests</h2>
                    {waiterAssistance.length === 0 ? (
                        <p>No pending assistance requests.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {waiterAssistance.map((assistance) => (
                                <div key={assistance._id} className="bg-white shadow-md rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-2">Table {assistance.tableNumber}</h3>
                                    <p className="text-gray-600 mb-2">Reason: {assistance.reason}</p>
                                    <p className="text-gray-600 mb-2">
                                        Time: {new Date(assistance.createdAt).toLocaleTimeString()}
                                    </p>
                                    <button
                                        onClick={() => markAssistanceCompleted(assistance._id)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Mark as Completed
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}