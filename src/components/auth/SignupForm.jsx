import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { UserPlus } from 'lucide-react';

const SignupForm = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: ''
    });
    const [localError, setLocalError] = useState('');
    const { signup, error: authError } = useAuth();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (formData.password.length < 6) return 'Password must be at least 6 characters';
        if (!/[A-Z]/.test(formData.password)) return 'Password must contain a capital letter';
        if (!/[0-9]/.test(formData.password)) return 'Password must contain a number';

        const cleanPhone = formData.phone.replace(/^\+91/, '').replace(/[\s-]/g, '');
        if (cleanPhone.length !== 10 || !/^\d+$/.test(cleanPhone)) return 'Phone number must be 10 digits';

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        const validationError = validate();
        if (validationError) {
            setLocalError(validationError);
            return;
        }

        setIsLoading(true);
        await signup(formData);
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <Input
                label={t.email}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                required
            />
            <Input
                label={t.phoneNumber}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 99999 99999"
                required
            />
            <Input
                label={t.password}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="******"
                required
            />

            {(localError || authError) && (
                <div className="text-danger text-sm text-center">{localError || authError}</div>
            )}

            <Button type="submit" isLoading={isLoading} className="mt-2">
                <UserPlus size={18} /> {t.signUp}
            </Button>

            <div className="text-center mt-4">
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-primary hover:text-white text-sm underline bg-transparent border-none cursor-pointer"
                >
                    {t.alreadyHaveAccount}
                </button>
            </div>
        </form>
    );
};

export default SignupForm;
