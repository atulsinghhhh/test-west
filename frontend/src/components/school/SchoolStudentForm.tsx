import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SchoolStudentForm = () => {
    const { baseurl } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        gradeId: "",
        section: "A" // Default section
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    interface Grade {
        _id: string;
        gradeName: string;
    }

    const [grades, setGrades] = useState<Grade[]>([]);

    useEffect(() => {
        const fetchGrade = async () => {
            try {
                // Fetch all grades available in the school
                const response = await axios.get(`${baseurl}/school/grade`, {
                    withCredentials: true
                });
                if (response.data.success) {
                    setGrades(response.data.grades);
                }
            } catch (error) {
                console.error("Failed to fetch grades", error);
            }
        }
        fetchGrade();
    }, [baseurl]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(
                `${baseurl}/student/school/create`,
                formData,
                { withCredentials: true }
            );

            if (response.data.success) {
                setSuccess("Student created successfully!");
                setFormData({ name: "", email: "", password: "", gradeId: "", section: "A" });
                setTimeout(() => navigate("/school/students"), 1500);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create student");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button 
                onClick={() => navigate("/school/students")}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Back to Students
            </button>

            <div className="bg-card border border-admin-border rounded-xl p-8">
                <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
                
                {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">{error}</div>}
                {success && <div className="bg-green-500/10 text-green-500 p-4 rounded-lg mb-6">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Grade</label>
                        <select
                            name="gradeId"
                            value={formData.gradeId}
                            onChange={handleChange}
                            required
                            className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select Grade</option>
                            {grades.map((grade) => (
                                <option key={grade._id} value={grade._id}>
                                    {grade.gradeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Section</label>
                        <select
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            className="w-full bg-admin-panel border border-admin-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                            <option value="D">Section D</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Create Student"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SchoolStudentForm;
