import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    isLoading = false,
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;

    return (
        <button
            className={`${baseClass} ${variantClass} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

export default Button;
