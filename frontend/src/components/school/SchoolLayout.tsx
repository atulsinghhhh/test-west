import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserPlus, Users, BookOpen, BarChart3, LogOut, Menu, X, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import axios from 'axios';

const SchoolLayout = () => {
    const { baseurl, setUser, setIsLoggedIn } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/school/create-teacher', icon: UserPlus, label: 'Create Teacher' },
        { path: '/school/view-teachers', icon: Users, label: 'View Teachers' },
        { path: '/school/create-student', icon: GraduationCap, label: 'Create Student' },
        { path: '/school/students', icon: Users, label: 'View Students' },
        { path: '/school/subjects', icon: BookOpen, label: 'Manage Subjects' },
        { path: '/school/analytics', icon: BarChart3, label: 'Analytics' },
    ];

    const handleLogout = async () => {
        try {
            await axios.post(`${baseurl}/auth/logout`, {}, {
                withCredentials: true
            });
            setIsLoggedIn(false);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.log("failed to logout user!");
        }
    };

    return (
        <div className="min-h-screen bg-admin-bg flex text-foreground font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-admin-panel border-r border-admin-border transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:relative lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-admin-border flex items-center justify-between">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                            School Panel
                        </h1>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground">
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
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-muted-foreground hover:bg-admin-hover hover:text-foreground'
                                    }`}
                                >
                                    <Icon size={20} className={isActive ? 'text-primary' : 'group-hover:text-foreground'} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-admin-border">
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
                <header className="lg:hidden bg-admin-panel border-b border-admin-border p-4 flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-muted-foreground">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold">School Panel</span>
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

export default SchoolLayout;
