import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react';

export interface IUser {
    _id: string
    name: string
    email: string
    password: string
    username?: string
}

interface IAuthContext {
    baseurl: string
    user: IUser | null
    setUser: (user: IUser | null) => void;
    isLoggedIn: boolean;
    setIsLoggedIn: (v: boolean) => void;
    loading: boolean;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider = ({children}:{children: React.ReactNode})=>{
    const baseurl = import.meta.env.VITE_BACKEND_URL

    const initialUser = (() => {
        try {
            const u = localStorage.getItem("user");
            return u ? JSON.parse(u) : null;
        } catch (error) {
            return null;
        }
    })();

    const [user,setUser] = useState<IUser | null>(initialUser);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!initialUser);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(()=>{
        const fetchUser = async ()=>{
            try {
                const response = await axios.get(`${baseurl}/auth/me`, {
                    withCredentials: true
                });

                if(response.data?.user){
                    setUser(response.data.user);
                    console.log("response: ",response.data.user);
                    setIsLoggedIn(true);
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                    localStorage.removeItem("user");
                }
            } catch (error) {
                setUser(null);
                setIsLoggedIn(false);
                localStorage.removeItem("user");
            } finally{
                setLoading(false);
            }
        };
        fetchUser();
    }, [baseurl]);

    const value: IAuthContext = {
        baseurl,
        user,
        setUser,
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
