import apiClient from './apiClient';


export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: 'todo' | 'in progress' | 'done';
    userId: number;
    createdAt: string;
    updatedAt: string;
}


interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
    };
}

// --- Авторизация ---

export const registerUser = async (data: { email: string; password?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('auth/register', data);
    
    
    if (res.data.token) {
        localStorage.setItem('token', res.data.token);
    }
    
    return res.data;
};

export const loginUser = async (data: { email: string; password?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('auth/login', data);
    if (res.data.token) {
        // Сохраняем токен в браузере для последующих запросов
        localStorage.setItem('token', res.data.token);
    }
    return res.data;
};

// --- Задачи (CRUD) ---

// Получить все задачи текущего пользователя
export const fetchTasks = async (): Promise<Task[]> => {
    const { data } = await apiClient.get<Task[]>('tasks');
    return data;
};

// Создать новую задачу
export const createTask = async (task: { title: string; description?: string }): Promise<Task> => {
    const { data } = await apiClient.post<Task>('tasks', task);
    return data;
};

// Обновить поля задачи (например, статус или название)
export const updateTask = async (payload: { id: number; fields: Partial<Task> }): Promise<Task> => {
    const { data } = await apiClient.put<Task>(`tasks/${payload.id}`, payload.fields);
    return data;
};

// Удалить задачу по ID
export const deleteTask = async (id: number): Promise<void> => {
    await apiClient.delete(`tasks/${id}`);
};