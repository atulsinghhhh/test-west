import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";

interface Grade {
    _id: string;
    gradeName: string;
}

const StudentForm = () => {
    const { baseurl } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [section, setSection] = useState("");
    const [gradeId, setGradeId] = useState("");
    const [grades, setGrades] = useState<Grade[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await axios.get(`${baseurl}/school/grade`, { withCredentials: true });
                if (response.data.success) {
                    setGrades(response.data.grades);
                }
            } catch (err) {
                console.error("Failed to fetch grades", err);
            }
        };
        fetchGrades();
    }, [baseurl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${baseurl}/student/school/create`,
                { name, email, password, section, gradeId },
                { withCredentials: true }
            );

            if (response.data.success) {
                setSuccess("Student created successfully!");
                setName("");
                setEmail("");
                setPassword("");
                setSection("");
                setGradeId("");
                setTimeout(() => navigate("/school/dashboard"), 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create student");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md p-8 rounded-xl border border-admin-border shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Create Student</h2>
                </div>

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                {success && <div className="bg-green-500/10 text-green-500 p-3 rounded-lg mb-4 text-sm">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Grade</label>
                            <select
                                value={gradeId}
                                onChange={(e) => setGradeId(e.target.value)}
                                className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Select Grade</option>
                                {grades.map((g) => (
                                    <option key={g._id} value={g._id}>{g.gradeName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Section</label>
                            <input
                                type="text"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g. A"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Student"}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate("/school/dashboard")}
                        className="w-full bg-transparent text-muted-foreground hover:text-foreground py-2 text-sm"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
