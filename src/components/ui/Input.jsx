import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && <label className="text-sm font-medium text-muted">{label}</label>}
            <input
                className="glass-input p-3 rounded-lg w-full transition-all"
                {...props}
            />
            {error && <span className="text-xs text-danger">{error}</span>}
        </div>
    );
};

export default Input;
