
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button, Input, Card } from '../components/UI';
import LanguageSelector from '../components/LanguageSelector';
import { ShieldCheck, UserPlus } from 'lucide-react';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [signupData, setSignupData] = useState({ name: '', role: 'worker', phone: '' });
    const [error, setError] = useState('');
    const { login, signup } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(phone);
        if (res.success) {
            if (res.role === 'admin') navigate('/admin');
            else if (res.role === 'doctor') navigate('/doctor');
            else navigate('/worker');
        } else {
            setError(t('login_fail'));
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        const res = await signup({ ...signupData, language: 'en' }); // Default lang or from context
        if (res.success) {
            navigate('/worker'); // Initially worker auto-login
        } else {
            setError(t('reg_fail'));
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <LanguageSelector />
            </div>

            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">{t('app_name')}</h1>
            </div>

            <Card className="w-full max-w-md">
                <div className="flex border-b mb-6">
                    <button
                        className={`flex-1 pb-2 text-sm font-medium ${!isSignup ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                        onClick={() => setIsSignup(false)}
                    >
                        {t('login_tab')}
                    </button>
                    <button
                        className={`flex-1 pb-2 text-sm font-medium ${isSignup ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                        onClick={() => setIsSignup(true)}
                    >
                        {t('signup_tab')}
                    </button>
                </div>

                {!isSignup ? (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <Input
                            label={t('phone_label')}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="9999999999"
                            required
                        />
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                        <Button type="submit" className="mt-2">
                            {t('login_btn')}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="flex flex-col gap-4">
                        <Input
                            label={t('name_label')}
                            value={signupData.name}
                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                            required
                        />
                        <Input
                            label={t('phone_label')}
                            value={signupData.phone}
                            onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                            required
                        />
                        <div>
                            <label className="text-sm font-semibold text-gray-600 block mb-1">{t('role_label')}</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                                value={signupData.role}
                                onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                            >
                                <option value="worker">{t('worker_role')}</option>
                                <option value="doctor">{t('doctor_role')}</option>
                            </select>
                        </div>
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                        <Button type="submit" variant="secondary" className="mt-2">
                            {t('signup_btn')}
                        </Button>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default Login;
