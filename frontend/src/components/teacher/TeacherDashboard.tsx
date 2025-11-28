import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import { FileQuestion, FileText, Upload, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
    const { baseurl, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        questionLimit: 0,
        questionCount: 0,
        remainingQuestions: 0,
        paperLimit: 0,
        paperCount: 0,
        remainingPapers: 0
    });

    useEffect(() => {
        const fetchQuota = async () => {
            try {
                const response = await axios.get(`${baseurl}/teacher/quota`, { withCredentials: true });
                if (response.data.success) {
                    setStats(response.data.quota);
                }
            } catch (error) {
                console.error("Failed to fetch quota", error);
            }
        };
        fetchQuota();
    }, [baseurl]);

    const cards = [
        {
            title: "Generate Questions",
            description: "Create AI-powered questions for your students.",
            icon: FileQuestion,
            path: "/teacher/questions",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            stat: `${stats.remainingQuestions} Remaining`
        },
        {
            title: "Generate Papers",
            description: "Create complete exam papers with multiple sections.",
            icon: FileText,
            path: "/teacher/papers",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            stat: `${stats.remainingPapers} Remaining`
        },
        {
            title: "Manage Content",
            description: "Publish and manage your generated content.",
            icon: Upload,
            path: "/teacher/publish",
            color: "text-green-500",
            bg: "bg-green-500/10",
            stat: "View All"
        },
        {
            title: "Student Submissions",
            description: "View and analyze student performance.",
            icon: Users,
            path: "/teacher/submissions",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            stat: "Analytics"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}</h1>
                <p className="text-muted-foreground mt-2">Manage your classroom, content, and students efficiently.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <div 
                        key={index}
                        onClick={() => navigate(card.path)}
                        className="bg-card border border-admin-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                                {card.stat}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                        <div className="flex items-center text-sm font-medium text-primary">
                            Go to {card.title} <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats or Recent Activity could go here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-admin-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Quota Overview</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Questions Used</span>
                                <span className="font-medium">{stats.questionCount} / {stats.questionLimit}</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${(stats.questionCount / stats.questionLimit) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Papers Used</span>
                                <span className="font-medium">{stats.paperCount} / {stats.paperLimit}</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${(stats.paperCount / stats.paperLimit) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-card border border-admin-border rounded-xl p-6 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Upload size={32} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Publish?</h3>
                    <p className="text-muted-foreground mb-6">Review your generated content and publish it for students.</p>
                    <button 
                        onClick={() => navigate("/teacher/publish")}
                        className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                        Go to Content Manager
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
