"use client"

export default function Button({
    children,
    className,
    variant = "primary",
    size="big",
    onClick,
}: {
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary";
    onClick?: () => void;
    size?: "big" | "small";
}) {
    const baseStyles = "rounded-lg font-medium transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary";
    const sizeStyles = size === "big" ? "px-8 py-4 text-lg" : "px-4 py-2 text-sm";
    const variantStyles = {
        primary: "bg-btn-surface-default text-font-primary hover:bg-btn-surface-hover border border-1 border-outline-primary",
        secondary: "text-font-primary hover:bg-btn-surface-hover",
    };

    return (
        <button
            className={`${baseStyles} ${sizeStyles} ${variantStyles[variant]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}