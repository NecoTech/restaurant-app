"use client";

import { useCart } from "..//context/CartContext";
import { useCurrency } from "..//context/CurrencyContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DotLoader } from "react-spinners";

type CartItemType = {
  _id: string;
  categoryId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  volume?: string;
  isAvailable: boolean;
};

export default function Cart({ restaurantId }: { restaurantId: string }) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    tableNumber,
    setTableNumber,
  } = useCart();
  const [localTableNumber, setLocalTableNumber] = useState<string>("");
  const { currency } = useCurrency();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tableNumber !== null) {
      setLocalTableNumber(tableNumber.toString());
    }
  }, [tableNumber]);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  const handleTableNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalTableNumber(value);
    if (value && !isNaN(parseInt(value))) {
      setTableNumber(parseInt(value));
    } else {
      setTableNumber(null);
    }
  };

  if (cartItems.length === 0) {
    return (
      <p className="text-center text-gray-500 my-8">Your cart is empty.</p>
    );
  }

  const handleProceedToCheckout = () => {
    router.push(`/restaurant/${restaurantId}/payment`);
  };

  return (
    <div className="w-full bg-white/20 backdrop-blur-lg s text-white rounded-lg shadow-md p-6 ">
      <div className="mb-6">
        <label
          htmlFor="tableNumber"
          className="block text-sm font-medium text-white mb-2"
        >
          Table Number
        </label>
        <input
          type="number"
          id="tableNumber"
          value={localTableNumber}
          onChange={handleTableNumberChange}
          className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your table number"
        />
      </div>
      {cartItems.map((item) => (
        <div key={item._id} className="flex items-center mb-4 pb-4 border-b">
          <div className="relative w-20 h-20 mr-4 bg-gray-200 rounded-md">
            {item.image && (
              <Image
                src={`data:image/jpeg;base64,${item.image}`}
                alt={item.name}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            )}
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-white">
              {currency}
              {item.price.toFixed(2)} each
            </p>
            {item.volume && (
              <p className="text-gray-500 text-sm">{item.volume}</p>
            )}
          </div>
          <div className="flex items-center">
            <button
              onClick={() => updateQuantity(item._id, item.quantity - 1)}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l hover:bg-gray-300 transition-colors"
            >
              -
            </button>
            <span className="bg-gray-100 px-4 py-1 text-black">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item._id, item.quantity + 1)}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-300 transition-colors"
              disabled={!item.isAvailable}
            >
              +
            </button>
            <button
              onClick={() => removeFromCart(item._id)}
              className="ml-4 text-red-500 hover:text-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="mt-8 border-t pt-4 text-white">
        <div className="flex justify-between mb-2">
          <span className="text-white">Subtotal:</span>
          <span>
            {currency}
            {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-white">Tax (13%):</span>
          <span>
            {currency}
            {tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>
            {currency}
            {total.toFixed(2)}
          </span>
        </div>
      </div>
      <button
        className={`mt-6 w-full py-3 px-4 rounded-md text-white font-bold
                    ${
                      tableNumber
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    } transition-colors`}
        disabled={!tableNumber}
        onClick={handleProceedToCheckout}
      >
        {tableNumber ? "Proceed to Checkout" : "Please enter table number"}
      </button>
    </div>
  );
}
