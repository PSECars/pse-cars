"use client";

import { useState } from "react";

export default function TextInput({
                                           placeholder = "Enter your E-Mail Address",
                                           buttonText = "Subscribe",
                                           onSubscribe,
                                           className,
                                       }: {
    placeholder?: string;
    buttonText?: string;
    onSubscribe?: (email: string) => void;
    className?: string;
}) {
    const [email, setEmail] = useState("");

    const baseStyles = "rounded-lg font-medium transition-colors duration-300 ease-in-out bg-transparent border border-outline-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary text-font-primary placeholder:text-neutral-400";

    return (
        <div className={`flex items-center ${baseStyles} py-2 px-4 ${className}`}>
            <input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none outline-none placeholder:text-neutral-400"
            />
            <button
                className="ml-4 py-2 px-4 rounded-md bg-btn-surface-default hover:bg-btn-surface-hover text-font-primary transition-colors duration-300 ease-in-out"
                onClick={() => onSubscribe && onSubscribe(email)}
            >
                {buttonText}
            </button>
        </div>
    );
}