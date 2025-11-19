import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react';

export interface IUser {
    _id: string
    name: string
    email: string
    password: string
    role: "admin" | "school" | "teacher" | "student";
    grade?: string;
    school?: string;
    questionSchoolLimit?: number;
    questionSchoolCount?: number;
    paperSchoolLimit?: number;
    paperSchoolCount?: number;
}

interface IAuthContext {
    baseurl: string
    user: IUser | null
    setUser: (user: IUser | null) => void;
    role: "admin" | "school" | "teacher" | "student" | null;
    setRole: (role: "admin" | "school" | "teacher" | "student" | null) => void;
    isLoggedIn: boolean;
    setIsLoggedIn: (v: boolean) => void;
    loading: boolean;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const baseurl = import.meta.env.VITE_BACKEND_URL

    const initialUser = (() => {
        try {
            const u = localStorage.getItem("user");
            return u ? JSON.parse(u) : null;
        } catch (error) {
            return null;
        }
    })();

    const [user, setUser] = useState<IUser | null>(initialUser);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!initialUser);
    const [loading, setLoading] = useState<boolean>(true);
    const [role, setRole] = useState<"admin" | "school" | "teacher" | "student" | null>(initialUser?.role || null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${baseurl}/auth/me`, {
                    withCredentials: true
                });

                if (response.data?.user) {
                    const u = response.data.user;
                    setUser(u);
                    setRole(u.role);
                    console.log("response: ", u);
                    setIsLoggedIn(true);
                    localStorage.setItem("user", JSON.stringify(u));
                } else {
                    setUser(null);
                    setRole(null);
                    setIsLoggedIn(false);
                    localStorage.removeItem("user");
                }
            } catch (error) {
                setUser(null);
                setIsLoggedIn(false);
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [baseurl]);

    const value: IAuthContext = {
        baseurl,
        user,
        setUser,
        role,
        setRole,
        isLoggedIn,
        setIsLoggedIn,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
};
