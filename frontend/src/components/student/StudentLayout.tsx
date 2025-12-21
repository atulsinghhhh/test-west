import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, LogOut, Menu, X, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import axios from 'axios';

const StudentLayout = () => {
    const { baseurl,setUser,setIsLoggedIn } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/student/papers', icon: FileText, label: 'Papers' },
        { path: '/student/questions', icon: BookOpen, label: 'Question Bank' },
        { path: '/student/practice', icon: Target, label: 'Practice Arena' },
    ];

    const handleLogout = async() => {
        try {
            await axios.post(`${baseurl}/auth/logout`,{},{
                withCredentials: true
            });
            setIsLoggedIn(false);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.log("falied to logout user!");
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-admin-bg)] flex text-[var(--color-foreground)] font-sans">
            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-admin-panel)] border-r border-[var(--color-admin-border)] transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:relative lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-[var(--color-admin-border)] flex items-center justify-between">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-emerald-400 bg-clip-text text-transparent">
                            Student Panel
                        </h1>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[var(--color-muted-foreground)]">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                                        isActive 
                                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20' 
                                            : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-admin-hover)] hover:text-[var(--color-foreground)]'
                                    }`}
                                >
                                    <Icon size={20} className={isActive ? 'text-[var(--color-primary)]' : 'group-hover:text-[var(--color-foreground)]'} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-[var(--color-admin-border)]">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-[var(--color-admin-panel)] border-b border-[var(--color-admin-border)] p-4 flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-[var(--color-muted-foreground)]">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold">Student Panel</span>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
