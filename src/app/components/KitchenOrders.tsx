'use client'

import React, { useState, useEffect, useRef } from 'react';

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

type StockItem = {
    _id: string;
    name: string;
    quantity: number;
    unit: string;
    minQuantity: number;
    description?: string;
    lastUpdated: string;
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

type MessageStatus = 'sent' | 'delivered' | 'read';

type ChatMessage = {
    _id: string;
    content: string;
    senderEmail: string;
    senderRole: 'admin' | 'kitchen' | 'waiter';
    senderName: string;
    restaurantId: string;
    createdAt: string;
    status: MessageStatus;
    readBy: Array<{ userId: string; readAt: string }>;
    messageType: 'text' | 'image' | 'notification';
    metadata?: {
        orderNumber?: string;
        tableNumber?: number;
        priority?: 'low' | 'medium' | 'high';
    };
    replyTo?: ChatMessage;
};

// Then update your unread messages check logic to use either status or readBy


export default function KitchenOrders({ restaurantId }: { restaurantId: string }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
    const [waiterAssistance, setWaiterAssistance] = useState<WaiterAssistance[]>([]);
    const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'assistance' | 'stock'>('orders');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    // Add to existing state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastMessageId, setLastMessageId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [ownerEmail, setOwnerEmail] = useState<string>('');
    // const userEmail = 'nirmaljohny95@gmail.com'
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
    const [stockUpdateAmount, setStockUpdateAmount] = useState('');
    const [stockSearchQuery, setStockSearchQuery] = useState('');



    useEffect(() => {
        fetchOrders();
        fetchMenuItems();
        fetchWaiterAssistance();
        fetchStockItems();
        const intervalId = setInterval(() => {
            fetchOrders();
            fetchMenuItems();
            fetchWaiterAssistance();
            fetchStockItems();
        }, 30000);
        return () => clearInterval(intervalId);
    }, [restaurantId]);



    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchOwnerEmail();
        if (isChatOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isChatOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const fetchOwnerEmail = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurant/details/${restaurantId}`);
            if (!response.ok) throw new Error('Failed to fetch restaurant details');
            const data = await response.json();
            setOwnerEmail(data.ownerEmail);
        } catch (error) {
            console.error('Error fetching owner email:', error);
        }
    };

    const fetchMessages = async (loadMore = false) => {
        try {
            setIsLoading(true);
            let url = `${process.env.NEXT_PUBLIC_API_URL}/api/messages?restaurantId=${restaurantId}&userEmail=${encodeURIComponent(ownerEmail)}`;

            if (loadMore && lastMessageId) {
                url += `&lastMessageId=${lastMessageId}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch messages');

            const { data, unreadCount: newUnreadCount, hasMore: moreMessages } = await response.json();

            if (loadMore) {
                setMessages(prev => [...prev, ...data]);
            } else {
                setMessages(data);
            }

            setUnreadCount(newUnreadCount);
            setHasMore(moreMessages);

            if (data.length > 0) {
                setLastMessageId(data[data.length - 1]._id);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStockItems = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock/${restaurantId}`);
            if (!response.ok) throw new Error('Failed to fetch stock items');
            const data = await response.json();
            setStockItems(data);
        } catch (error) {
            console.error('Error fetching stock items:', error);
        }
    };

    const handleStockUpdate = async () => {
        if (!selectedStock || !stockUpdateAmount) return;

        try {
            const amount = parseFloat(stockUpdateAmount);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock/${selectedStock._id}/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantity: selectedStock.quantity - amount,
                    lastUpdated: new Date().toISOString(),
                }),
            });

            if (!response.ok) throw new Error('Failed to update stock');

            await fetchStockItems();
            setIsStockDialogOpen(false);
            setSelectedStock(null);
            setStockUpdateAmount('');
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    // Filter stock items based on search query
    const filteredStockItems = stockItems.filter(item =>
        item.name.toLowerCase().includes(stockSearchQuery.toLowerCase())
    );


    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: newMessage.trim(),
                        senderEmail: ownerEmail,
                        senderRole: 'kitchen',  // This is fixed as kitchen for this interface
                        senderName: 'Kitchen Staff',
                        restaurantId,
                        messageType: 'text',
                        metadata: {}
                    }),
                }
            );

            if (!response.ok) throw new Error('Failed to send message');

            // Fetch messages after sending to get the updated list
            await fetchMessages();
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };


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
                        onClick={() => setIsChatOpen(true)}
                        className="px-4 py-2 rounded bg-purple-500 text-white flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        Chat
                        {messages.filter(m => m.status !== 'read').length > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {messages.filter(m => m.status !== 'read').length}
                            </span>
                        )}
                    </button>
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
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-4 py-2 rounded ${activeTab === 'stock' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Stock Management
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold">Unavailable Items: {getUnavailableItemsCount()}</span>
                    <span className="text-sm font-semibold">Pending Assistance: {waiterAssistance.length}</span>
                </div>
            </div>

            {isChatOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white w-full max-w-lg h-[600px] rounded-lg flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Kitchen Chat</h3>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
                            {messages.map((message) => (
                                <div
                                    key={message._id}
                                    className={`flex ${message.senderRole === 'kitchen' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg p-3 relative ${message.senderRole === 'kitchen'
                                            ? 'bg-blue-500 text-white rounded-br-none ml-12'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-none mr-12'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">
                                                {message.senderName}
                                            </span>
                                            <span className={`text-xs ${message.senderRole === 'kitchen' ? 'text-white/75' : 'text-gray-600'}`}>
                                                {message.senderRole}
                                            </span>
                                        </div>

                                        {message.replyTo && (
                                            <div className={`${message.senderRole === 'kitchen'
                                                ? 'bg-blue-600/30 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                                } rounded p-2 mb-2 text-sm`}>
                                                <p className="opacity-75">
                                                    {message.replyTo.senderName}: {message.replyTo.content}
                                                </p>
                                            </div>
                                        )}

                                        <p className="break-words">{message.content}</p>

                                        {message.metadata && (
                                            <div className={`mt-1 text-xs ${message.senderRole === 'kitchen' ? 'text-white/75' : 'text-gray-600'
                                                }`}>
                                                {message.metadata.orderNumber && (
                                                    <span className="mr-2">Order #{message.metadata.orderNumber}</span>
                                                )}
                                                {message.metadata.tableNumber && (
                                                    <span>Table {message.metadata.tableNumber}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <span className={`text-xs ${message.senderRole === 'kitchen' ? 'text-white/75' : 'text-gray-500'
                                                }`}>
                                                {new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {message.senderRole === 'kitchen' && (
                                                <svg
                                                    className={`w-4 h-4 ${message.status === 'read'
                                                        ? 'text-white/75'
                                                        : 'text-white/50'
                                                        }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-center">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

            {activeTab === 'stock' && (
                <div className="bg-white shadow-md rounded-lg p-4">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search stock items..."
                            value={stockSearchQuery}
                            onChange={(e) => setStockSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStockItems.map((item) => (
                            <div key={item._id} className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 border-b">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">{item.name}</h3>
                                        {item.quantity <= item.minQuantity && (
                                            <span className="text-sm px-2 py-1 bg-red-100 text-red-600 rounded-full">
                                                Low Stock
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Current Quantity:</span>
                                            <span className="font-medium">
                                                {item.quantity} {item.unit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Minimum Quantity:</span>
                                            <span className="font-medium">
                                                {item.minQuantity} {item.unit}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Last Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSelectedStock(item);
                                                setIsStockDialogOpen(true);
                                            }}
                                            className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Update Stock
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {isStockDialogOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-md w-full p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">
                                        Update Stock: {selectedStock?.name}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setIsStockDialogOpen(false);
                                            setSelectedStock(null);
                                            setStockUpdateAmount('');
                                        }}
                                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Stock: {selectedStock?.quantity} {selectedStock?.unit}
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount to Remove
                                        </label>
                                        <input
                                            type="number"
                                            value={stockUpdateAmount}
                                            onChange={(e) => setStockUpdateAmount(e.target.value)}
                                            placeholder={`Enter amount in ${selectedStock?.unit}`}
                                            min="0"
                                            max={selectedStock?.quantity}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {selectedStock && parseFloat(stockUpdateAmount) > selectedStock.quantity && (
                                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                            <span className="block sm:inline">
                                                Cannot remove more than available stock
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-2 pt-4">
                                        <button
                                            onClick={() => {
                                                setIsStockDialogOpen(false);
                                                setSelectedStock(null);
                                                setStockUpdateAmount('');
                                            }}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleStockUpdate}
                                            disabled={
                                                !stockUpdateAmount ||
                                                !selectedStock ||
                                                parseFloat(stockUpdateAmount) > selectedStock.quantity
                                            }
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Update Stock
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}