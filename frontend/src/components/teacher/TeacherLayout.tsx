import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
    LayoutDashboard, 
    FileQuestion, 
    FileText, 
    BarChart3, 
    Menu,
    Users,
    LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import axios from "axios";

const TeacherLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { baseurl, user, setUser, setIsLoggedIn } = useAuth();

    const handleLogout = async () => {
        try {
            await axios.post(`${baseurl}/auth/logout`, {}, { withCredentials: true });
            setIsLoggedIn(false);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const navItems = [
        { path: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/teacher/students", label: "Students", icon: Users },
        { path: "/teacher/questions", label: "Generate Questions", icon: FileQuestion },
        { path: "/teacher/papers", label: "Generate Papers", icon: FileText },
        { path: "/teacher/submissions", label: "Submissions", icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen bg-admin-bg flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside 
                    className={`
                        ${isSidebarOpen ? "w-64" : "w-20"} 
                        bg-admin-panel border-r border-admin-border transition-all duration-300 ease-in-out
                        flex flex-col
                    `}
                >
                    <div className="p-4 flex justify-end">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-admin-hover rounded-lg text-muted-foreground"
                        >
                            {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                        ${isActive 
                                            ? "bg-primary/10 text-primary font-medium" 
                                            : "text-muted-foreground hover:bg-admin-hover hover:text-foreground"
                                        }
                                    `}
                                >
                                    <Icon size={20} />
                                    {isSidebarOpen && <span>{item.label}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-admin-border">
                        <div className={`flex items-center gap-3 ${!isSidebarOpen && "justify-center"}`}>
                            
                        </div>
                        <div className="mt-3">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut size={18} />
                                {isSidebarOpen && <span className="font-medium">Logout</span>}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TeacherLayout;
