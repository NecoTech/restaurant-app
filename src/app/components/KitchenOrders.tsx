'use client'

import React, { useState, useEffect } from 'react';

type OrderItem = {
    name: string;
    quantity: number;
};

type Order = {
    _id: string;
    orderNumber: string;
    items: OrderItem[];
    userId: string;
    tableNumber: number;
    createdAt: string;
};

type MenuItem = {
    name: string;
    price: number;
    description?: string;
    isAvailable: boolean;
    image?: string;
    volume?: string;
};

type MenuCategory = {
    _id: string;
    id: string;
    category: string;
    items: MenuItem[];
};

type WaiterAssistance = {
    _id: string;
    tableNumber: number;
    reason: string;
    createdAt: string;
};

export default function KitchenOrders({ restaurantId }: { restaurantId: string }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
    const [waiterAssistance, setWaiterAssistance] = useState<WaiterAssistance[]>([]);
    const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'assistance'>('orders');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${restaurantId}`);
            if (!response.ok) throw new Error('Failed to fetch menu items');
            const data = await response.json();
            setMenuCategories(data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const fetchWaiterAssistance = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waiter-request/${restaurantId}`);
            if (!response.ok) throw new Error('Failed to fetch waiter assistance requests');
            const data = await response.json();
            setWaiterAssistance(data);
        } catch (error) {
            console.error('Error fetching waiter assistance requests:', error);
        }
    };

    const toggleItemAvailability = async (categoryId: string, itemName: string, currentAvailability: boolean) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menus/${categoryId}/item`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemName,
                    isAvailable: !currentAvailability
                }),
            });

            if (!response.ok) throw new Error('Failed to update item availability');

            setMenuCategories(prevCategories =>
                prevCategories.map(category => {
                    if (category._id === categoryId) {
                        return {
                            ...category,
                            items: category.items.map(item =>
                                item.name === itemName
                                    ? { ...item, isAvailable: !currentAvailability }
                                    : item
                            )
                        };
                    }
                    return category;
                })
            );
        } catch (error) {
            console.error('Error updating item availability:', error);
        }
    };

    const markOrderCompleted = async (orderId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/complete`, {
                method: 'PATCH',
            });
            if (!response.ok) throw new Error('Failed to mark order as completed');
            setOrders(orders.filter(order => order._id !== orderId));
        } catch (error) {
            console.error('Error marking order as completed:', error);
        }
    };

    const markAssistanceCompleted = async (assistanceId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${assistanceId}/complete`, {
                method: 'PATCH',
            });
            if (!response.ok) throw new Error('Failed to mark assistance as completed');
            setWaiterAssistance(waiterAssistance.filter(assistance => assistance._id !== assistanceId));
        } catch (error) {
            console.error('Error marking assistance as completed:', error);
        }
    };

    const getUnavailableItemsCount = () => {
        return menuCategories.reduce((count, category) =>
            count + category.items.filter(item => !item.isAvailable).length, 0
        );
    };

    const categories = ['all', ...menuCategories.map(cat => cat.category)];
    const filteredCategories = selectedCategory === 'all'
        ? menuCategories
        : menuCategories.filter(cat => cat.category === selectedCategory);

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
                    <span className="text-sm font-semibold">Unavailable Items: {getUnavailableItemsCount()}</span>
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
                    <div className="mb-4 flex space-x-2 overflow-x-auto pb-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded whitespace-nowrap ${selectedCategory === category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200'
                                    }`}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCategories.map((category) => (
                            <div key={category._id} className="bg-white shadow-md rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                                <div className="space-y-3">
                                    {category.items.map((item) => (
                                        <div
                                            key={`${category._id}-${item.name}`}
                                            className="flex items-center justify-between border-b pb-2"
                                        >
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                {item.volume && (
                                                    <p className="text-sm text-gray-500">{item.volume}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={item.isAvailable ? 'text-green-500' : 'text-red-500'}>
                                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                                <button
                                                    onClick={() => toggleItemAvailability(category._id, item.name, item.isAvailable)}
                                                    className={`px-3 py-1 rounded text-sm ${item.isAvailable
                                                        ? 'bg-red-500 hover:bg-red-600'
                                                        : 'bg-green-500 hover:bg-green-600'
                                                        } text-white`}
                                                >
                                                    Toggle
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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