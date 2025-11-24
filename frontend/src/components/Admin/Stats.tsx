import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

import StatsCard from "./stats/StatsCard";
import ProgressBar from "./stats/ProgressBar";
import SchoolCard from "./stats/SchoolCard";

import { Users, GraduationCap, FileText } from "lucide-react";

export default function Stats() {
    const { baseurl } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchStats = async()=>{
            setLoading(true);
            try {
                const response = await axios.get(`${baseurl}/admin/stats`,{withCredentials: true});
                console.log("response: ",response.data);
                setStats(response.data);
            } catch (error) {
                console.log("error occuring fetching the stats")
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [baseurl]);

    if (loading || !stats) return <div className="text-center py-10">Loading...</div>;

    const { totalSchools, totalTeachers, totalUsage, schools } = stats;

    const qPercent = totalUsage.totalQuestionLimit
        ? (totalUsage.totalQuestionCount / totalUsage.totalQuestionLimit) * 100
        : 0;

    const pPercent = totalUsage.totalPaperLimit
        ? (totalUsage.totalPaperCount / totalUsage.totalPaperLimit) * 100
        : 0;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 text-foreground">

            <h1 className="text-xl font-semibold">
                Admin — Usage Overview
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

                <StatsCard
                    title="Total Teachers"
                    value={totalTeachers}
                    icon={<Users className="w-5 h-5 text-muted-foreground" />}
                />

                <StatsCard
                    title="Total Schools"
                    value={totalSchools}
                    icon={<GraduationCap className="w-5 h-5 text-muted-foreground" />}
                />

                <div className="sm:col-span-2 p-4 rounded-lg border border-admin-border bg-white/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Questions (used / limit)</p>
                            <p className="text-2xl font-semibold mt-2">
                                {totalUsage.totalQuestionCount} / {totalUsage.totalQuestionLimit}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Remaining: {totalUsage.totalQuestionRemaining}
                            </p>
                        </div>

                        <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>

                    <div className="mt-3">
                        <ProgressBar value={qPercent} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-admin-border bg-white/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Papers (used / limit)</p>
                            <p className="text-xl font-semibold mt-2">
                                {totalUsage.totalPaperCount} / {totalUsage.totalPaperLimit}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Remaining: {totalUsage.totalPaperRemaining}
                        </p>
                    </div>

                    <div className="mt-3">
                        <ProgressBar value={pPercent} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schools.map((school: any) => (
                    <SchoolCard key={school._id} school={school} />
                ))}
            </div>
        </div>

    );
}