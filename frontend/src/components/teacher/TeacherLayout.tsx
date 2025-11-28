import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
    LayoutDashboard, 
    FileQuestion, 
    FileText, 
    BarChart3, 
    Menu,
    Users
} from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import Navbar from "../Navbar";

const TeacherLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const navItems = [
        { path: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/teacher/students", label: "Students", icon: Users },
        { path: "/teacher/questions", label: "Generate Questions", icon: FileQuestion },
        { path: "/teacher/papers", label: "Generate Papers", icon: FileText },
        { path: "/teacher/submissions", label: "Submissions", icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen bg-admin-bg flex flex-col">
            <Navbar />
            
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
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {user?.name?.[0] || "T"}
                            </div>
                            {isSidebarOpen && (
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            )}
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
