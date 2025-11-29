import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  BrainCircuit
} from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

export default function StandaloneStudentLayout() {
  const {baseurl} = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${baseurl}/auth/logout`, { method: "POST" });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/standalone/dashboard" },
    { icon: FileText, label: "All Papers", path: "/standalone/papers" },
    { icon: BrainCircuit, label: "All Quizzes", path: "/standalone/quizzes" },
    // { icon: HelpCircle, label: "Questions", path: "/standalone/questions" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Independent Learner
            </h1>
            <button 
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-blue-400" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button 
              className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold">TestWest</span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
