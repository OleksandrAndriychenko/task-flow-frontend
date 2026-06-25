'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { registerUser, loginUser } from '@/api/services';
import Link from 'next/link';
import { AxiosError } from 'axios';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Мутация для отправки данных регистрации на бэкенд
    const mutation = useMutation({
        mutationFn: async (formData: { email: string; password?: string }) => {
            // 1. Сначала регистрируем пользователя
            await registerUser(formData);
            // 2. Сразу после этого логиним его (loginUser сам запишет токен в localStorage)
            return await loginUser(formData);
        },
        onSuccess: () => {
            // Теперь токен ГАРАНТИРОВАННО на месте, и дашборд нас не выкинет
            router.push('/dashboard');
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            setErrorMsg(err.response?.data?.message || 'Что-то пошло не так');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        mutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 px-4">
            <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-center mb-1">
                    Регистрация
                </h1>
                <p className="text-slate-400 text-sm text-center mb-8">
                    Создайте аккаунт для распределения ваших задач
                </p>

                {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl mb-6 text-center">
                    {errorMsg}
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Пароль
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition active:scale-[0.99] disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Создание...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p className="text-slate-500 text-sm text-center mt-6">
                    Уже есть профиль? Sec{' '}
                    <Link href="/login" className="text-indigo-400 hover:underline transition">
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );
}