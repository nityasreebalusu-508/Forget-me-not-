import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`glass-panel p-6 rounded-xl ${className}`} {...props}>
            {children}
        </div>
    );
};

export default Card;
