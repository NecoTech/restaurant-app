"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [fullname, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ fullname, phoneNumber });
  };

  return (
    <div className="min-h-screen bg-black text-white bg-[url(/snacks-bg.webp)] bg-cover bg-center flex items-center justify-center">
      <div className="bg-black bg-opacity-70 p-10 rounded-2xl shadow-2xl w-[400px]">
        <h2 className="text-3xl font-extrabold text-center mb-8">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="fullname"
              className="block text-sm font-medium mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
