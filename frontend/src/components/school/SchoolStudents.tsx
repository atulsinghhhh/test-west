import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import { Loader2, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Student {
    _id: string;
    name: string;
    email: string;
    gradeId: {
        _id: string;
        gradeName: string;
    };
    section: string;
}

const SchoolStudents = () => {
    const { baseurl } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(`${baseurl}/student/`, {
                    withCredentials: true
                });
                if (response.data.success) {
                    setStudents(response.data.students);
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
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">Students</h1>
                <button 
                    onClick={() => navigate("/school/create-student")}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    Add Student
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-card border border-admin-border p-4 rounded-lg">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-card border border-admin-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Grade</th>
                                <th className="px-4 py-3">Section</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-secondary/50">
                                        <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                                        <td className="px-4 py-3 text-foreground">
                                            {student.gradeId?.gradeName || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-foreground">{student.section}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No students found.
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

export default SchoolStudents;
