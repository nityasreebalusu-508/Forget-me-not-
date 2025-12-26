import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative glass-panel rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in border border-glass-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
};

export default Modal;
