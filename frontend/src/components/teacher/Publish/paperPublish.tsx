import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthProvider"
import axios from "axios";

interface IPaperAnalytics {
    _id: string;
    paperId: string;
    testType: string;
    totalMarks: number;
    totalQuestion: number;
    paperType: string;
    publishStatus: boolean;
}


function PaperPublish() {
    const { baseurl } = useAuth();

    const [paper, setPaper] = useState<IPaperAnalytics[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const fetchPapers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseurl}/teacher/papers`, {
                    withCredentials: true
                })
                if (response.data.success) {
                    setPaper(response.data.papers);
                } else {
                    setError("Failed to fetch papers");
                }
                console.log("fetch the data: ", response.data.papers);
            } catch (error) {
                console.log("Error fetching papers: ", error);
                setError("Failed to fetch papers");
            } finally {
                setLoading(false);
            }
        }
        fetchPapers();
    }, []);

    const handlePublish = async (paperId: string) => {
        try {
            await axios.put(`${baseurl}/teacher/paper/publish/${paperId}`, {}, {
                withCredentials: true
            })
            setMessage("Paper published successfully");
            setPaper((prev) => (
                prev.map((p) => (
                    p.paperId === paperId ? { ...p, publishStatus: true } : p
                ))
            ))
        } catch (error) {
            console.log("Error publishing paper: ", error);
            setError("Failed to publish paper");
        }
    }

    return (
        <div className="p-6 bg-[--color-admin-bg] min-h-screen text-[--color-foreground] ">
            <h1 className="text-2xl font-semibold mb-6 text-white">📄 Teacher Paper Analytics</h1>

            {loading && <p className="text-[--color-primary]">Loading papers...</p>}
            {error && <p className="text-red-500 font-medium">{error}</p>}
            {message && <p className="text-green-500 font-medium">{message}</p>}

            {!loading && paper.length > 0 && (
                <div className="overflow-x-auto mt-4">
                    <table className="w-full rounded-lg bg-[--color-card]">
                        <thead>
                            <tr className="bg-[--color-admin-panel] text-white">
                                <th className="p-3 text-left">Paper ID</th>
                                <th className="p-3 text-left">Test Type</th>
                                <th className="p-3 text-left">Paper Type</th>
                                <th className="p-3 text-left">Total Marks</th>
                                <th className="p-3 text-left">Total Questions</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paper.map((p) => (
                                <tr
                                    key={p.paperId}
                                    className="hover:bg-[--color-admin-hover] transition text-white"
                                >
                                    <td className="p-3">{p.paperId}</td>
                                    <td className="p-3">{p.testType}</td>
                                    <td className="p-3">{p.paperType}</td>
                                    <td className="p-3">{p.totalMarks}</td>
                                    <td className="p-3">{p.totalQuestion}</td>

                                    <td className="p-3">
                                        {p.publishStatus ? (
                                            <span className="text-green-400 font-semibold">Published</span>
                                        ) : (
                                            <span className="text-red-400 font-semibold">Not Published</span>
                                        )}
                                    </td>

                                    <td className="p-3">
                                        <button
                                            onClick={() => handlePublish(p.paperId)}
                                            className={`px-4 py-1.5 rounded-lg font-medium transition 
                                                ${p.publishStatus
                                                    ? "bg-red-600 hover:bg-red-700"
                                                    : "bg-[--color-primary] hover:bg-green-700"
                                                }`}
                                        >
                                            {p.publishStatus ? "Unpublish" : "Publish"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && paper.length === 0 && (
                <p className="text-[--color-muted-foreground] mt-4">No papers found.</p>
            )}
        </div>

    )
}

export default PaperPublish
