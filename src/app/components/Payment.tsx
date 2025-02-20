'use client'

import { useState, useEffect } from 'react'
import { useCart } from '..//context/CartContext'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { useAuth } from '..//context/AuthContext'
import { useCurrency } from '..//context/CurrencyContext'
import GooglePayButton from '@google-pay/button-react'

const stripePromise = loadStripe('pk_test_your_stripe_publishable_key')

export default function Payment() {
    const { cartItems, clearCart, tableNumber } = useCart()
    const [paymentMethod, setPaymentMethod] = useState<'counter' | 'googlepay' | null>(null)
    const [orderPlaced, setOrderPlaced] = useState(false)
    const router = useRouter()
    const [orderId, setOrderId] = useState<string | null>(null)
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const { user } = useAuth()
    const { currency } = useCurrency()

    // Move localStorage access to useEffect
    useEffect(() => {
        const storedRestaurantId = localStorage.getItem("restaurantId");
        setRestaurantId(storedRestaurantId);
    }, []);

    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const tax = subtotal * 0.13
    const total = subtotal + tax

    const placeOrder = async (paymentMethod: 'counter' | 'googlepay') => {
        if (!restaurantId) {
            console.error('Restaurant ID not found');
            alert('Restaurant ID not found. Please try again.');
            return;
        }

        const orderNumber = `ORD-${restaurantId}-${Math.random().toString(36).substr(2, 9)}`
        const userId = user?.fullname
        const phonenumber = user?.phoneNumber

        const orderItems = cartItems.map(({ image, ...item }) => item)

        const orderDetails = {
            orderNumber,
            items: orderItems,
            subtotal,
            tax,
            total,
            tableNumber,
            paymentMethod,
            paid: paymentMethod === 'googlepay',
            userId,
            restaurantId,
            phonenumber,
            orderStatus: "Notcomplete"
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
            })

            if (!response.ok) {
                throw new Error('Failed to place order')
            }

            const savedOrder = await response.json()
            setOrderId(savedOrder.data._id)
            setOrderPlaced(true)
            clearCart()
        } catch (error) {
            console.error('Error placing order:', error)
            alert('Failed to place order. Please try again.')
        }
    }

    const handleCounterPayment = async () => {
        await placeOrder('counter')
    }

    const handleGooglePayPayment = async (paymentData: any) => {
        try {
            // Send paymentData to your server to process the payment
            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentData,
                    amount: total,
                }),
            })

            if (!response.ok) {
                throw new Error('Payment failed')
            }

            await placeOrder('googlepay')
        } catch (error) {
            console.error('Error processing payment:', error)
            alert('Payment failed. Please try again.')
        }
    }

    if (orderPlaced) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Thank you for your order!</h2>
                <p className="mb-4">Your order has been placed successfully.</p>
                <p className="mb-4">Order Number: {orderId}</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Return to Home
                </button>
                <button
                    onClick={() => router.push(`/order-status/${orderId}`)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    View Order Status
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Select Payment Method</h2>
            <div className="space-y-4 mb-6">
                <button
                    onClick={() => setPaymentMethod('counter')}
                    className={`w-full py-2 px-4 rounded ${paymentMethod === 'counter' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                >
                    Pay at Counter
                </button>
                <div className={`${paymentMethod === 'googlepay' ? 'border-2 border-blue-500 rounded' : ''}`}>
                    <GooglePayButton
                        environment="TEST"
                        paymentRequest={{
                            apiVersion: 2,
                            apiVersionMinor: 0,
                            allowedPaymentMethods: [
                                {
                                    type: 'CARD',
                                    parameters: {
                                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                        allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                    },
                                    tokenizationSpecification: {
                                        type: 'PAYMENT_GATEWAY',
                                        parameters: {
                                            gateway: 'stripe',
                                            'stripe:version': '2018-10-31',
                                            'stripe:publishableKey': 'pk_test_51PvN6URoJOomwVMlAgoueDlCcPK7xL3ntbm7OWCO6q30UVgSVnURF9TFe059jcExl6IcAi6Kg97OBXrsMFEB0H4400xoOqycSI',
                                        },
                                    },
                                },
                            ],
                            merchantInfo: {
                                merchantId: 'your_merchant_id',
                                merchantName: 'Rambavo Restaurant App',
                            },
                            transactionInfo: {
                                totalPriceStatus: 'FINAL',
                                totalPriceLabel: 'Total',
                                totalPrice: total.toFixed(2),
                                currencyCode: 'USD',
                                countryCode: 'US',
                            },
                        }}
                        onLoadPaymentData={handleGooglePayPayment}
                        onClick={() => setPaymentMethod('googlepay')}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
            <div className="mb-6">
                <h3 className="font-bold mb-2">Order Summary</h3>
                {cartItems.map((item) => (
                    <div key={item._id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>{currency}{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="border-t mt-2 pt-2">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{currency}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax (13%):</span>
                        <span>{currency}{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{currency}{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            {paymentMethod === 'counter' && (
                <button
                    onClick={handleCounterPayment}
                    className="w-full py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600"
                >
                    Place Order
                </button>
            )}
        </div>
    )
}