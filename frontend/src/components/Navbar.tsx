import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, LogOut } from "lucide-react";

function Navbar() {
    const { baseurl, user, setUser, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setTheme } = useTheme();

    const handleLogout = async () => {
        try {
            await axios.post(
                `${baseurl}/auth/logout`,
                {},
                { withCredentials: true }
            );
            setIsLoggedIn(false);
            setUser(null);
            navigate("/login");
        } catch (error) {
            console.log("Failed to logout", error);
        }
    };

    return (
        <nav className="w-full bg-admin-panel/80 backdrop-blur-md text-foreground py-4 sticky top-0 z-50 border-b border-admin-border transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                
                {/* Left - Logo */}
                <div 
                    onClick={() => navigate(user ? `/${user.role}/dashboard` : "/")} 
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        T
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent group-hover:text-primary transition-colors">
                        TestWest
                    </h1>
                </div>


                {/* Right - User & Theme */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-full hover:bg-admin-hover text-muted-foreground hover:text-foreground transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-4 pl-4 border-l border-admin-border">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold leading-none">{user.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate("/login")}
                                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => navigate("/signup")}
                                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-green-600 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
