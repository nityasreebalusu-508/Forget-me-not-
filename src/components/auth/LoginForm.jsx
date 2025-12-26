import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { LogIn } from 'lucide-react';

const LoginForm = ({ onSwitchToSignup }) => {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const { login, error: authError } = useAuth();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await login(emailOrPhone, password);
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <Input
                label={t.emailOrPhone}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={t.emailOrPhone}
                required
            />
            <Input
                label={t.password}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.password}
                required
            />

            {authError && <div className="text-danger text-sm text-center">{authError}</div>}

            <Button type="submit" isLoading={isLoading} className="mt-2">
                <LogIn size={18} /> {t.login}
            </Button>

            <div className="text-center mt-4">
                <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-primary hover:text-white text-sm underline bg-transparent border-none cursor-pointer"
                >
                    {t.dontHaveAccount}
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
