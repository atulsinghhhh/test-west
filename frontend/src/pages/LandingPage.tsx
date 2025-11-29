import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, BarChart2, BookOpen, Users, GraduationCap } from "lucide-react";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-admin-bg text-foreground">
            {/* Navbar */}
            <nav className="w-full bg-admin-panel border-b border-admin-border py-4 px-6 fixed top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">TestWest</h1>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate("/login")}
                            className="px-4 py-2 rounded-lg hover:bg-admin-hover transition-colors"
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => navigate("/signup")}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                        Revolutionize Your Assessment Process
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                        A comprehensive platform for schools, teachers, and students to manage assessments, track progress, and improve learning outcomes with AI-powered tools.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => navigate("/signup")}
                            className="px-8 py-4 bg-primary text-white rounded-xl text-lg font-semibold hover:bg-green-600 transition-all flex items-center gap-2"
                        >
                            Start Now <ArrowRight size={20} />
                        </button>
                        <button 
                            onClick={() => navigate("/standalone-signup")}
                            className="px-8 py-4 bg-gray-800 text-white rounded-xl text-lg font-semibold hover:bg-gray-700 transition-all flex items-center gap-2 border border-gray-700"
                        >
                            Independent Student? <GraduationCap size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-admin-panel px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16">Why Choose TestWest?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Users className="w-8 h-8 text-primary" />}
                            title="For Schools"
                            description="Manage teachers, subjects, and view comprehensive analytics across all grades."
                        />
                        <FeatureCard 
                            icon={<BookOpen className="w-8 h-8 text-primary" />}
                            title="For Teachers"
                            description="Generate AI-powered papers, publish questions, and track student performance."
                        />
                        <FeatureCard 
                            icon={<BarChart2 className="w-8 h-8 text-primary" />}
                            title="For Students"
                            description="Attempt papers, practice questions, and visualize your learning progress."
                        />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-6">About TestWest</h2>
                        <p className="text-muted-foreground mb-4 text-lg">
                            TestWest is designed to bridge the gap between traditional assessment methods and modern technology. We believe in empowering educators with tools that save time and provide deep insights.
                        </p>
                        <ul className="space-y-3">
                            <ListItem text="AI-driven question generation" />
                            <ListItem text="Real-time analytics and reporting" />
                            <ListItem text="Seamless collaboration between schools and teachers" />
                            <ListItem text="Personalized learning paths for students" />
                        </ul>
                    </div>
                    <div className="flex-1 bg-card p-8 rounded-2xl border border-admin-border">
                        <div className="aspect-video bg-admin-bg rounded-xl flex items-center justify-center text-muted-foreground">
                            Platform Walkthrough Video Placeholder
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-admin-panel py-12 px-6 border-t border-admin-border">
                <div className="max-w-7xl mx-auto text-center text-muted-foreground">
                    <p>&copy; 2024 TestWest. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="p-8 bg-card rounded-xl border border-admin-border hover:border-primary/50 transition-all">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

const ListItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-3 text-muted-foreground">
        <CheckCircle className="w-5 h-5 text-primary" />
        {text}
    </li>
);

export default LandingPage;
