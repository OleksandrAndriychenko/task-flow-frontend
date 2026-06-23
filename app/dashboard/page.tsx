'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, createTask, updateTask, deleteTask, Task } from '@/api/services';
import { Plus, Trash2, CheckCircle2, ArrowRight, LogOut } from 'lucide-react';
import { AxiosError } from 'axios';

export default function DashboardPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

  // Защита роута: если токена нет, отправляем на вход
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) router.push('/login');
    }, [router]);

  // Получаем таски из кэша / API
    const { data: tasks = [], isLoading } = useQuery<Task[], AxiosError>({
        queryKey: ['tasks'],
        queryFn: fetchTasks,
    });

  // Мутация: Создание задачи
    const createMutation = useMutation<Task, AxiosError, { title: string; description?: string }>({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setTitle('');
            setDescription('');
        },
    });

  // Мутация: Обновление (перемещение по колонкам)
    const updateMutation = useMutation<Task, AxiosError, { id: number; fields: Partial<Task> }>({
        mutationFn: updateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

  // Мутация: Удаление задачи
    const deleteMutation = useMutation<void, AxiosError, number>({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        createMutation.mutate({ title, description });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

  // Конфигурация колонок
    const columns: { id: Task['status']; title: string; color: string }[] = [
        { id: 'todo', title: 'Бэклог', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
        { id: 'in progress', title: 'В работе', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
        { id: 'done', title: 'Готово', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-12">
        {/* Шапка */}
        <header className="max-w-7xl mx-auto flex justify-between items-center mb-12 border-b border-slate-900 pb-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-slate-200">
                    Task Flow
                </h1>
                <p className="text-sm text-slate-500">Управляйте вашими рабочими спринтами</p>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 px-4 py-2 rounded-xl text-sm font-medium transition"
                >
                <LogOut size={16} /> Выйти
            </button>
        </header>

        <main className="max-w-7xl mx-auto space-y-12">
            {/* Форма создания */}
            <form onSubmit={handleCreate} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4 max-w-2xl">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Новая задача</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                type="text"
                required
                placeholder="Название таски..."
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-indigo-500 transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />
                <input
                type="text"
                placeholder="Краткое описание (опционально)..."
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-indigo-500 transition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-6 py-3 rounded-xl transition disabled:opacity-50"
            >
                <Plus size={16} /> Добавить таску
            </button>
            </form>

            {/* Сетка Спринта */}
            {isLoading ? (
            <div className="text-center text-slate-500 py-12">Синхронизация тасок...</div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {columns.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.id);
                return (
                    <div key={col.id} className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-5 flex flex-col min-h-[450px]">
                    {/* Заголовок колонки */}
                    <div className={`flex justify-between items-center p-3 rounded-xl border mb-4 font-bold text-sm ${col.color}`}>
                        <span>{col.title}</span>
                        <span className="bg-slate-950/60 text-xs px-2 py-0.5 rounded-md border border-inherit">
                        {colTasks.length}
                        </span>
                    </div>

                    {/* Карточки задач */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {colTasks.length === 0 && (
                        <div className="text-center text-xs text-slate-600 py-8 border border-dashed border-slate-900/60 rounded-xl">
                            Пока пусто
                        </div>
                        )}
                        {colTasks.map((task) => (
                        <div
                            key={task.id}
                            className="group bg-slate-900/90 border border-slate-800/60 p-4 rounded-xl shadow-lg flex flex-col justify-between gap-4 hover:border-slate-700 transition"
                        >
                            <div>
                            <h3 className={`font-semibold text-sm ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {task.title}
                            </h3>
                            {task.description && <p className="text-xs text-slate-400 mt-1">{task.description}</p>}
                            </div>

                            {/* Кнопки управления */}
                            <div className="flex justify-between items-center border-t border-slate-800/80 pt-3 mt-1">
                            <div className="flex gap-2">
                                {task.status !== 'done' && (
                                <button
                                    title="Переместить далее"
                                    onClick={() =>
                                    updateMutation.mutate({
                                        id: task.id,
                                        fields: { status: task.status === 'todo' ? 'in progress' : 'done' },
                                    })
                                    }
                                    className="text-slate-500 hover:text-indigo-400 transition p-1"
                                >
                                    <ArrowRight size={14} />
                                </button>
                                )}
                                {task.status === 'done' && (
                                <button
                                    title="Вернуть в бэклог"
                                    onClick={() => updateMutation.mutate({ id: task.id, fields: { status: 'todo' } })}
                                    className="text-emerald-400 transition p-1"
                                >
                                    <CheckCircle2 size={14} />
                                </button>
                                )}
                            </div>

                            <button
                                onClick={() => deleteMutation.mutate(task.id)}
                                className="text-slate-600 hover:text-rose-400 lg:opacity-0 lg:group-hover:opacity-100 transition p-1"
                            >
                                <Trash2 size={14} />
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                );
                })}
            </div>
            )}
        </main>
        </div>
    );
}