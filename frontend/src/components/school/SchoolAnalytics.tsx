import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

interface TeacherStats {
    _id: string;
    name: string;
    email: string;
    questionLimit: number;
    paperLimit: number;
    questionCount: number;
    paperCount: number;
    remainingQuestions: number;
    remainingPapers: number;
}

interface SchoolStats {
    totals: {
        totalTeachers: number;
        totalStudents: number;
        totalQuestionLimit: number;
        totalQuestionCount: number;
        totalQuestionRemaining: number;
        totalPaperLimit: number;
        totalPaperCount: number;
        totalPaperRemaining: number;
    };
    teachers: TeacherStats[];
}

const SchoolAnalytics = () => {
    const { baseurl } = useAuth();
    const [stats, setStats] = useState<SchoolStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${baseurl}/school/stats`,{
                    withCredentials:true
                });
                if (response.data.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error("Error fetching school stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center text-muted-foreground">No analytics data available.</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">School Analytics</h2>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Teachers</h3>
                    <p className="text-2xl font-bold text-foreground">{stats.totals.totalTeachers}</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Students</h3>
                    <p className="text-2xl font-bold text-foreground">{stats.totals.totalStudents}</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">Questions Used</h3>
                    <p className="text-2xl font-bold text-foreground">
                        {stats.totals.totalQuestionCount} / {stats.totals.totalQuestionLimit}
                    </p>
                    <div className="w-full bg-secondary h-2 rounded-full mt-2">
                        <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(stats.totals.totalQuestionCount / stats.totals.totalQuestionLimit) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">Papers Used</h3>
                    <p className="text-2xl font-bold text-foreground">
                        {stats.totals.totalPaperCount} / {stats.totals.totalPaperLimit}
                    </p>
                    <div className="w-full bg-secondary h-2 rounded-full mt-2">
                        <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(stats.totals.totalPaperCount / stats.totals.totalPaperLimit) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Teachers Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Teacher Performance & Usage</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Questions Used</th>
                                <th className="px-4 py-3">Papers Used</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stats.teachers.map((teacher) => (
                                <tr key={teacher._id} className="hover:bg-secondary/50">
                                    <td className="px-4 py-3 font-medium text-foreground">{teacher.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{teacher.email}</td>
                                    <td className="px-4 py-3 text-foreground">
                                        {teacher.questionCount} / {teacher.questionLimit}
                                    </td>
                                    <td className="px-4 py-3 text-foreground">
                                        {teacher.paperCount} / {teacher.paperLimit}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SchoolAnalytics;
