import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import { Loader2, Plus, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Student {
    _id: string;
    name: string;
    email: string;
    gradeId: {
        gradeName: string;
    };
    section: string;
}

const TeacherStudents = () => {
    const { baseurl } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openFeedbackFor, setOpenFeedbackFor] = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(`${baseurl}/student/teacher`, { withCredentials: true });
                if (response.data.success) {
                    setStudents(response.data.students || []);
                }
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [baseurl]);

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Students</h1>
                    <p className="text-muted-foreground">Manage students in your classes.</p>
                </div>
                <button
                    onClick={() => navigate("/teacher/create-student")}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                    <Plus size={20} /> Add Student
                </button>
            </div>

            <div className="bg-card border border-admin-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-admin-border flex items-center gap-3">
                    <Search className="text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-foreground w-full"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Grade</th>
                                <th className="px-6 py-3">Section</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-admin-hover transition-colors">
                                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User size={16} />
                                        </div>
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                                    <td className="px-6 py-4">{student.gradeId?.gradeName || "N/A"}</td>
                                    <td className="px-6 py-4">{student.section || "N/A"}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/teacher/student/${student._id}`)}
                                                className="px-3 py-1 text-sm bg-secondary text-muted-foreground rounded-md"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setOpenFeedbackFor(student._id);
                                                    setFeedbackText("");
                                                }}
                                                className="px-3 py-1 text-sm bg-primary text-white rounded-md"
                                            >
                                                Give Feedback
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {openFeedbackFor && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-admin-panel rounded-xl p-6 border border-admin-border">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Give Feedback</h3>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            rows={6}
                            className="w-full bg-admin-bg border border-admin-border rounded-md p-3 text-foreground placeholder:text-muted-foreground"
                            placeholder="Write feedback for student — also used for AI insights"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => { setOpenFeedbackFor(null); setFeedbackText(""); }}
                                className="px-4 py-2 rounded-md bg-secondary text-muted-foreground"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!feedbackText.trim()) return;
                                    setSubmitting(true);
                                    try {
                                        await axios.post(`${baseurl}/teacher/student/${openFeedbackFor}/feedback`, { feedback: feedbackText }, { withCredentials: true });
                                        // optimistic UI: close modal
                                        setOpenFeedbackFor(null);
                                        setFeedbackText("");
                                        // Optionally refetch students or show toast — simple console for now
                                        console.log('Feedback submitted');
                                    } catch (err) {
                                        console.error('Failed to submit feedback', err);
                                    } finally { setSubmitting(false); }
                                }}
                                className="px-4 py-2 rounded-md bg-primary text-white disabled:opacity-50"
                                disabled={submitting}
                            >
                                {submitting ? 'Sending...' : 'Send Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;
