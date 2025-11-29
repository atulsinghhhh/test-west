import { useEffect, useState } from 'react';
import { TrendingUp, FileText, ListChecks, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { baseurl } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [subjectStats, setSubjectStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${baseurl}/student/dashboard`, {
                    withCredentials: true
                });

                if (response.data.success) {
                    const data = response.data.stats;
                    setStats(data);
                    setRecentActivity(data.recentActivity);
                    setSubjectStats(data.subjectStats);
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${baseurl}/student/me`, { withCredentials: true });
                if (res.data.success) {
                    setFeedbacks(res.data.student.feedbacks || []);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };

        fetchStats();
        fetchProfile();
    }, []);

    if (loading) {
        return <div className="text-foreground">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome back, Student!</h1>
                <p className="text-muted-foreground mt-2">Here's an overview of your learning progress.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Papers Stats */}
                <div className="bg-card p-6 rounded-xl border border-admin-border hover:border-primary/30 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Papers Attempted</p>
                            <h3 className="text-2xl font-bold text-foreground mt-2">{stats?.papers?.count || 0}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Avg Score: {stats?.papers?.avg.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10">
                            <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Batches Stats */}
                <div className="bg-card p-6 rounded-xl border border-admin-border hover:border-primary/30 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Question Batches</p>
                            <h3 className="text-2xl font-bold text-foreground mt-2">{stats?.batches?.count || 0}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Avg Score: {stats?.batches?.avg.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-500/10">
                            <ListChecks className="w-6 h-6 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Practice Stats */}
                <div className="bg-card p-6 rounded-xl border border-admin-border hover:border-primary/30 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Practice Quizzes</p>
                            <h3 className="text-2xl font-bold text-foreground mt-2">{stats?.practice?.count || 0}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Avg Score: {stats?.practice?.avg.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <BrainCircuit className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedbacks */}
            <div className="bg-card p-6 rounded-xl border border-admin-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Teacher Feedback & AI Insights</h3>
                {feedbacks.length > 0 ? (
                    feedbacks.map((f, i) => (
                        <div key={i} className="mb-4 p-4 rounded-lg bg-admin-bg border border-admin-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{f.teacherName || 'Teacher'}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-xs text-muted-foreground">Rating: {f.aiInsights?.overallRating ?? 'N/A'}</div>
                            </div>
                            <div className="mt-3">
                                <p className="text-foreground">{f.feedbackText}</p>
                                {f.aiInsights && (
                                    <div className="mt-3 text-sm text-muted-foreground">
                                        <p className="font-semibold text-foreground">AI Suggestions:</p>
                                        {Array.isArray(f.aiInsights.suggestions) ? (
                                            <ul className="list-disc list-inside">
                                                {f.aiInsights.suggestions.map((s: string, idx: number) => (
                                                    <li key={idx}>{s}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <pre className="whitespace-pre-wrap">{JSON.stringify(f.aiInsights, null, 2)}</pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground">No feedback yet. Your teacher can provide feedback and AI-generated suggestions here.</p>
                )}
            </div>

            {/* Recent Activity & Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-admin-border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Performance Analysis</h3>
                        <TrendingUp className="text-primary w-5 h-5" />
                    </div>
                    <div className="space-y-6">
                        {subjectStats.length > 0 ? (
                            subjectStats.map((sub, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium text-foreground">
                                        <span>{sub.subjectName}</span>
                                        <span>{sub.avgScore.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-admin-bg h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-primary h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${sub.avgScore}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{sub.totalAttempts} attempts</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No performance data available yet.</p>
                        )}
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-admin-border">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
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
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-admin-hover transition-colors cursor-pointer"
                                >
                                    <div className={`w-2 h-2 rounded-full ${activity.percentage >= 40 ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {activity.subjectId?.subjectName || "Unknown Subject"}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-muted-foreground">
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
                            <p className="text-muted-foreground">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
