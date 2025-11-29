import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

interface AnalyticsOverview {
    totalAttempts: number;
    avgScore: number;
    highestScore: number;
    lowestScore: number;
    totalTimeTaken?: number;
    avgTimeTaken?: number;
}

interface SubjectAnalytics {
    subjectName: string;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    totalAttempts: number;
    avgTimeTaken?: number;
}

interface StudentPerformance {
    studentName: string;
    studentEmail: string;
    totalAttempts: number;
    avgScore: number;
    scores: { score: number; date: string }[];
}

interface PracticeAnalyticsItem {
    studentName: string;
    practiceQuizCount: number;
    totalQuestionsAttempted: number;
    correctAnswers: number;
    practiceAccuracy: number;
    avgTimeTaken?: number;
}

interface AIInsights {
    overallRating?: string;
    strengthAreas?: string[];
    weakAreas?: string[];
    trend?: string;
    subjectInsights?: { subject: string; insight: string }[];
    practiceHabits?: string;
    suggestions?: string[];
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
    const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
    const [practiceAnalytics, setPracticeAnalytics] = useState<PracticeAnalyticsItem[]>([]);
    const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewRes, submissionsRes] = await Promise.all([
                    axios.get(`${baseurl}/teacher/analytics/overview`,{withCredentials: true}),
                    axios.get(`${baseurl}/teacher/analytics/submissions`,{withCredentials: true})
                ]);
                if (overviewRes.data.success) {
                    setOverview(overviewRes.data.analytics);
                    setSubjectStats(overviewRes.data.subjectAnalytics || []);
                    setStudentPerformance(overviewRes.data.studentPerformance || []);
                    setPracticeAnalytics(overviewRes.data.practiceAnalytics || []);
                    setAiInsights(overviewRes.data.aiInsights || null);
                    // Debug logs
                    // console.log("[Analytics] overview:", overviewRes.data.analytics);
                    // console.log("[Analytics] subjectAnalytics:", overviewRes.data.subjectAnalytics);
                    // console.log("[Analytics] studentPerformance:", overviewRes.data.studentPerformance);
                    // console.log("[Analytics] practiceAnalytics:", overviewRes.data.practiceAnalytics);
                    // console.log("[Analytics] aiInsights:", overviewRes.data.aiInsights);
                }
                if (submissionsRes.data.success) {
                    setSubmissions(submissionsRes.data.attempts || []);
                }

            } catch (error) {
                console.error("Error fetching teacher analytics:", error);
                setError("Failed to load analytics.");
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
        <div className="p-6 space-y-8 bg-admin-bg min-h-screen text-foreground">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Class Analytics</h2>
                {aiInsights?.overallRating && (
                    <span className="px-3 py-1 rounded-full text-sm bg-primary text-white">
                        {aiInsights.overallRating}
                    </span>
                )}
            </div>
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
            {!overview && !loading && (
                <div className="bg-card border border-border rounded p-4 text-sm text-muted-foreground">
                    Overview data not loaded. Check network tab for GET /teacher/analytics/overview and ensure authentication cookie is present.
                </div>
            )}

            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <OverviewCard label="Total Attempts" value={overview.totalAttempts} />
                    <OverviewCard label="Average Score" value={`${overview.avgScore.toFixed(1)}%`} />
                    <OverviewCard label="Highest Score" value={`${overview.highestScore.toFixed(1)}%`} accent="text-green-500" />
                    <OverviewCard label="Lowest Score" value={`${overview.lowestScore.toFixed(1)}%`} accent="text-red-500" />
                    <OverviewCard label="Avg Time / Attempt" value={`${Math.round(overview.avgTimeTaken || 0)}s`} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-lg border border-border p-4 col-span-1 lg:col-span-1">
                    <h3 className="font-semibold mb-4">Subject Performance</h3>
                    <div className="space-y-4">
                        {subjectStats.map((sub) => (
                            <div key={sub.subjectName} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium">{sub.subjectName}</span>
                                    <span className="text-muted-foreground">{sub.accuracy.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-secondary h-2 rounded-full">
                                    <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{ width: `${sub.accuracy}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Q: {sub.totalQuestions}</span>
                                    <span>C: {sub.correctAnswers}</span>
                                    <span>W: {sub.incorrectAnswers}</span>
                                </div>
                            </div>
                        ))}
                        {subjectStats.length === 0 && <p className="text-muted-foreground text-sm">No data available</p>}
                    </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="font-semibold mb-4">Top Students (Avg Score)</h3>
                    <ul className="space-y-3">
                        {studentPerformance.slice(0,5).map(sp => (
                            <li key={sp.studentEmail} className="text-sm flex justify-between">
                                <div>
                                    <div className="font-medium">{sp.studentName}</div>
                                    <div className="text-[11px] text-muted-foreground">{sp.studentEmail}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{sp.avgScore.toFixed(1)}%</div>
                                    <div className="text-[10px] text-muted-foreground">Attempts: {sp.totalAttempts}</div>
                                </div>
                            </li>
                        ))}
                        {studentPerformance.length === 0 && <p className="text-muted-foreground text-sm">No attempts yet.</p>}
                    </ul>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="font-semibold mb-4">Practice Activity</h3>
                    <ul className="space-y-3">
                        {practiceAnalytics.slice(0,5).map(pa => (
                            <li key={pa.studentName} className="text-sm flex justify-between">
                                <div>
                                    <div className="font-medium">{pa.studentName}</div>
                                    <div className="text-[10px] text-muted-foreground">Quizzes: {pa.practiceQuizCount}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{pa.practiceAccuracy.toFixed(1)}%</div>
                                    <div className="text-[10px] text-muted-foreground">Q:{pa.totalQuestionsAttempted}</div>
                                </div>
                            </li>
                        ))}
                        {practiceAnalytics.length === 0 && <p className="text-muted-foreground text-sm">No practice data.</p>}
                    </ul>
                </div>
            </div>

            {aiInsights && (
                <div className="bg-card rounded-lg border border-border p-4 space-y-4">
                    <h3 className="font-semibold">AI Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium mb-2 text-muted-foreground">Strength Areas</h4>
                            <ul className="list-disc ml-5 space-y-1">
                                {aiInsights.strengthAreas?.map(s => <li key={s}>{s}</li>) || <li>No data</li>}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2 text-muted-foreground">Weak Areas</h4>
                            <ul className="list-disc ml-5 space-y-1">
                                {aiInsights.weakAreas?.map(s => <li key={s}>{s}</li>) || <li>No data</li>}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2 text-muted-foreground">Practice Habits</h4>
                            <p className="text-xs leading-relaxed">{aiInsights.practiceHabits || 'Not enough data.'}</p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2 text-muted-foreground">Trend</h4>
                            <p className="text-xs">{aiInsights.trend || 'N/A'}</p>
                        </div>
                    </div>
                    {aiInsights.subjectInsights && aiInsights.subjectInsights.length > 0 && (
                        <div className="text-xs space-y-2">
                            <h4 className="font-medium text-muted-foreground">Subject Insights</h4>
                            {aiInsights.subjectInsights.map(si => (
                                <div key={si.subject} className="border border-border rounded p-2">
                                    <span className="font-semibold">{si.subject}:</span> {si.insight}
                                </div>
                            ))}
                        </div>
                    )}
                    {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
                        <div className="text-xs space-y-1">
                            <h4 className="font-medium text-muted-foreground">Suggestions</h4>
                            <ul className="list-disc ml-5 space-y-1">
                                {aiInsights.suggestions.map(s => <li key={s}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}

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

// Reusable overview card
const OverviewCard = ({ label, value, accent }: { label: string; value: number | string; accent?: string }) => (
    <div className="bg-card p-4 rounded-lg border border-border">
        <h3 className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{label}</h3>
        <p className={`text-xl font-bold mt-1 ${accent || ''}`}>{value}</p>
    </div>
);

export default TeacherAnalytics;