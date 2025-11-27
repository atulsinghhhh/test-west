import { User, Mail, Lock, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";

interface Grade {
  _id: string;
  gradeName: string
}

const SchoolForm = () => {
  const { baseurl } = useAuth();
  const [student, setStudent] = useState({
    name: '',
    email: '',
    password: '',
    section: '',
    gradeId: ''
  });
  const [grades,setGrades] = useState<Grade[]>([]);
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState<string>("");
  const [error,setError] = useState<string>("");
  const [grade,setGrade] = useState(false);

  useEffect(()=>{
    const fetchGrade = async()=>{
      setGrade(true);
      try {
        const response = await axios.get(`${baseurl}/school/grade`,{
          withCredentials: true
        });
        setGrades(response.data.grades);
      } catch (error) {
        setError("failed to fetch the grade");
      } finally {
        setGrade(false);
      }
    }
    fetchGrade();
  },[])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e: React.FormEvent)=>{
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await axios.post(`${baseurl}/student/school/create`,student,{
        withCredentials: true
      });
      setStudent({ name: '', email: '', password: '', section: '', gradeId: student.gradeId });
      
    } catch (error) {
      setError("failed to create a student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--color-card)] p-8 rounded-xl border border-[var(--color-admin-border)] shadow-lg">
                <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6 text-center">Create New Student</h2>

                {error && <p className="text-red-500 mb-2">{error}</p>}
                {message && <p className="text-green-500 mb-2">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-muted-foreground)]">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                            <input
                                type="text"
                                name="name"
                                value={student.name}
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
                                value={student.email}
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
                                value={student.password}
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
                                    value={student.gradeId}
                                    onChange={handleChange}
                                    required
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
                                    value={student.section}
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

export default SchoolForm;