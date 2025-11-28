import { useEffect, useState } from 'react';
import { Trophy, Clock, Target, TrendingUp, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { baseurl } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [subjectStats, setSubjectStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${baseurl}/student/dashboard`, {
                    withCredentials: true
                });

                if (response.data.success) {
                    const data = response.data.stats;

                    const statsArray = [
                        {
                            label: "Total Attempts",
                            value: data.totalAttempts,
                            icon: Trophy,
                            color: "text-yellow-500",
                            bg: "bg-yellow-500/10"
                        },
                        {
                            label: "Average Score",
                            value: `${data.avgScore.toFixed(1)}%`,
                            icon: Target,
                            color: "text-blue-500",
                            bg: "bg-blue-500/10"
                        },
                        {
                            label: "Subjects",
                            value: data.subjectStats.length,
                            icon: BookOpen,
                            color: "text-purple-500",
                            bg: "bg-purple-500/10"
                        },
                        {
                            label: "Recent Activity",
                            value: data.recentActivity.length,
                            icon: Clock,
                            color: "text-green-500",
                            bg: "bg-green-500/10"
                        }
                    ];

                    setStats(statsArray);
                    setRecentActivity(data.recentActivity);
                    setSubjectStats(data.subjectStats);
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-[var(--color-foreground)]">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Welcome back, Student!</h1>
                <p className="text-[var(--color-muted-foreground)] mt-2">Here's an overview of your learning progress.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[var(--color-muted-foreground)] text-sm font-medium">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-[var(--color-foreground)] mt-2 group-hover:text-[var(--color-primary)] transition-colors">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity & Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Performance Analysis</h3>
                        <TrendingUp className="text-[var(--color-primary)] w-5 h-5" />
                    </div>
                    <div className="space-y-6">
                        {subjectStats.length > 0 ? (
                            subjectStats.map((sub, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium text-[var(--color-foreground)]">
                                        <span>{sub.subjectName}</span>
                                        <span>{sub.avgScore.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-[var(--color-admin-bg)] h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${sub.avgScore}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">{sub.totalAttempts} attempts</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-[var(--color-muted-foreground)]">No performance data available yet.</p>
                        )}
                    </div>
                </div>

                <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)]">
                    <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => {
                                        if (activity.batchId) {
                                            navigate(`/student/practice/result/${activity.batchId}`);
                                        } else if (activity.paperId) {
                                            navigate(`/student/paper/result/${activity.paperId}`);
                                        }
                                    }}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--color-admin-hover)] transition-colors cursor-pointer"
                                >
                                    <div className={`w-2 h-2 rounded-full ${activity.percentage >= 40 ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--color-foreground)]">
                                            {activity.subjectId?.subjectName || "Unknown Subject"}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-[var(--color-muted-foreground)]">
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className={`text-xs font-bold ${activity.percentage >= 40 ? 'text-green-500' : 'text-red-500'}`}>
                                                {activity.percentage.toFixed(0)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-[var(--color-muted-foreground)]">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
