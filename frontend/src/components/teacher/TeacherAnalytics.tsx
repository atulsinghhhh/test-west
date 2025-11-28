import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

interface AnalyticsOverview {
    totalAttempts: number;
    avgScore: number;
    highestScore: number;
    lowestScore: number;
}

interface SubjectAnalytics {
    subjectName: string;
    avgScore: number;
    totalAttempts: number;
}

interface Submission {
    _id: string;
    studentId: {
        name: string;
        email: string;
    };
    paperId: {
        paperType: string;
        testType: string;
    };
    subjectId: {
        subjectName: string;
    };
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    createdAt: string;
}

const TeacherAnalytics = () => {
    const { baseurl } = useAuth();
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [subjectStats, setSubjectStats] = useState<SubjectAnalytics[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewRes, submissionsRes] = await Promise.all([
                    axios.get(`${baseurl}/teacher/analytics/overview`,{withCredentials: true}),
                    axios.get(`${baseurl}/teacher/analytics/submissions`,{withCredentials: true})
                ]);

                if (overviewRes.data.success) {
                    setOverview(overviewRes.data.analytics);
                    setSubjectStats(overviewRes.data.subjectAnalytics);
                }

                if (submissionsRes.data.success) {
                    setSubmissions(submissionsRes.data.attempts);
                }

            } catch (error) {
                console.error("Error fetching teacher analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-admin-bg min-h-screen text-foreground">
            <h2 className="text-2xl font-bold">Class Analytics</h2>

            {/* Overview Cards */}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Attempts</h3>
                        <p className="text-2xl font-bold">{overview.totalAttempts}</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
                        <p className="text-2xl font-bold">{overview.avgScore.toFixed(1)}%</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="text-sm font-medium text-muted-foreground">Highest Score</h3>
                        <p className="text-2xl font-bold text-green-500">{overview.highestScore.toFixed(1)}%</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="text-sm font-medium text-muted-foreground">Lowest Score</h3>
                        <p className="text-2xl font-bold text-red-500">{overview.lowestScore.toFixed(1)}%</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="font-semibold mb-4">Subject Performance</h3>
                    <div className="space-y-4">
                        {subjectStats.map((sub, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>{sub.subjectName}</span>
                                    <span>{sub.avgScore.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-secondary h-2 rounded-full">
                                    <div 
                                        className="bg-primary h-2 rounded-full" 
                                        style={{ width: `${sub.avgScore}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {subjectStats.length === 0 && <p className="text-muted-foreground">No data available</p>}
                    </div>
                </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Recent Student Submissions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3">Paper Type</th>
                                <th className="px-4 py-3">Subject</th>
                                <th className="px-4 py-3">Score</th>
                                <th className="px-4 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {submissions.map((sub) => (
                                <tr key={sub._id} className="hover:bg-secondary/50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{sub.studentId?.name || "Unknown"}</div>
                                        <div className="text-xs text-muted-foreground">{sub.studentId?.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="capitalize">{sub.paperId?.paperType || "N/A"}</span>
                                        <span className="text-xs text-muted-foreground block">{sub.paperId?.testType}</span>
                                    </td>
                                    <td className="px-4 py-3">{sub.subjectId?.subjectName || "N/A"}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold">
                                            {sub.obtainedMarks}/{sub.totalMarks}
                                        </div>
                                        <div className={`text-xs ${sub.percentage >= 40 ? 'text-green-500' : 'text-red-500'}`}>
                                            {sub.percentage.toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(sub.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No submissions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherAnalytics;