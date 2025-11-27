import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Grade {
    _id: string;
    gradeName: string;
}

interface CreateStudentFormProps {
    role: 'school' | 'teacher';
    apiUrl: string; // URL to post data to
    onSuccess?: () => void;
}

const CreateStudentForm: React.FC<CreateStudentFormProps> = ({ role, apiUrl, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        section: '',
        gradeId: ''
    });
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingGrades, setFetchingGrades] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        setFetchingGrades(true);
        try {
            // Fetch grades based on role. Assuming endpoints exist.
            // For School: /api/school/grades (Need to verify this exists or use generic)
            // For Teacher: /api/teacher/grade (Teacher usually has one grade assigned, but maybe list if multiple?)
            // Let's assume a common endpoint or pass it as prop? 
            // For now, let's try to fetch from a likely endpoint or assume grades are passed.
            // Actually, let's use the specific endpoints for fetching grades if we know them.
            // School: /api/school/get/grade
            // Teacher: /api/teacher/grade (returns single grade object usually)
            
            let url = '';
            if (role === 'school') url = 'http://localhost:8000/api/school/get/grade';
            if (role === 'teacher') url = 'http://localhost:8000/api/teacher/grade';

            const response = await axios.get(url, { withCredentials: true });
            
            if (response.data.success) {
                if (role === 'school') {
                    setGrades(response.data.grades);
                } else {
                    // Teacher might return a single grade object in `grade`
                    const grade = response.data.grade;
                    if (grade) {
                        setGrades([grade]);
                        setFormData(prev => ({ ...prev, gradeId: grade.gradeId })); // Auto-select for teacher
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching grades", error);
        } finally {
            setFetchingGrades(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await axios.post(apiUrl, formData, { withCredentials: true });
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Student created successfully!' });
                setFormData({ name: '', email: '', password: '', section: '', gradeId: formData.gradeId }); // Keep grade for teacher
                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create student' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-[var(--color-card)] p-8 rounded-xl border border-[var(--color-admin-border)] shadow-lg">
            <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6 text-center">Create New Student</h2>
            
            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)]">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-lg py-2.5 pl-10 pr-4 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)]">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-lg py-2.5 pl-10 pr-4 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)]">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-lg py-2.5 pl-10 pr-4 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-muted-foreground)]">Grade</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                            <select
                                name="gradeId"
                                value={formData.gradeId}
                                onChange={handleChange}
                                required
                                disabled={fetchingGrades || (role === 'teacher' && grades.length === 1)}
                                className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-lg py-2.5 pl-10 pr-4 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none"
                            >
                                <option value="">Select Grade</option>
                                {grades.map(grade => (
                                    <option key={grade._id} value={grade._id}>{grade.gradeName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-muted-foreground)]">Section</label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                            <input
                                type="text"
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                required
                                className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-lg py-2.5 pl-10 pr-4 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                placeholder="A"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-black font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Student'}
                </button>
            </form>
        </div>
    );
};

export default CreateStudentForm;
