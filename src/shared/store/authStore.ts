import { create } from 'zustand';
import type { User } from '../types';
interface AuthStore{
    isLoading: boolean,
    user:  User | null,
    isAuthenticated: boolean,
    login: (user : User, token: string) => void,
    logout: () => void,
    setUser: (user: User) => void,
    setLoading: (value: boolean) => void
}

const getStoreduser = () : User | null => {
    try{
        let storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user;
    }catch{
        localStorage.removeItem("user");
        return null;
    }
}

const storedToken = localStorage.getItem('token');
const storedUser = getStoreduser();

export const useAuthStore = create<AuthStore>((set) => ({
    isLoading: Boolean(storedToken),
    user: storedUser,
    isAuthenticated: Boolean(storedUser && storedToken),

    login: (user: User, token: string) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        set({
            user, 
            isAuthenticated: true, 
            isLoading: false
        });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
            user: null, 
            isAuthenticated: false, 
            isLoading: false
        });
    },
    setUser: (user: User) => {
        localStorage.setItem("user", JSON.stringify(user));
        set({
            user, 
            isAuthenticated: Boolean(localStorage.getItem('token')),
            isLoading: false
        });
    },
    setLoading: (value: boolean) => {
        set({isLoading : Boolean(value)});
    }

}))