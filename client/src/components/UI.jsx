
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ children, onClick, variant = 'primary', className, disabled, ...props }) => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-primary text-white hover:bg-opacity-90 shadow-md hover:shadow-lg",
        secondary: "bg-secondary text-white hover:bg-opacity-90 shadow-md",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
        danger: "bg-red-500 text-white hover:bg-red-600",
        ghost: "text-gray-600 hover:bg-gray-100"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={twMerge(baseClass, variants[variant], className)}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export const Input = ({ label, error, className, ...props }) => (
    <div className={clsx("flex flex-col gap-1", className)}>
        {label && <label className="text-sm font-semibold text-gray-600">{label}</label>}
        <input
            className={clsx(
                "px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all",
                error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            )}
            {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
);

export const Card = ({ children, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={twMerge("bg-white rounded-xl shadow-sm border border-gray-100 p-6", className)}
    >
        {children}
    </motion.div>
);
