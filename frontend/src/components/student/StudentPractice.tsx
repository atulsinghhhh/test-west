import { useState, useEffect } from 'react';
import { ArrowRight, Brain, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

const StudentPractice = () => {
    const { baseurl } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${baseurl}/student/questions/published`, {
                withCredentials: true
            });

            if (response.data.success) {
                const uniqueSubjects = Array.from(new Set(response.data.batches.map((b: any) => JSON.stringify({ id: b.subjectId, name: b.subjectName }))))
                    .map((s: any) => JSON.parse(s));
                setSubjects(uniqueSubjects);
                console.log("response for quiz: ",response.data);
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    const startPractice = async () => {
        if (!selectedSubject) return;
        setStarting(true);
        try {
            const response = await axios.post(`${baseurl}/student/practice/create`, {
                subjectId: selectedSubject
            }, {
                withCredentials: true 
            });

            if (response.data.success) {
                navigate('/student/practice/session', { 
                    state: { 
                        questions: response.data.questions,
                        batchId: response.data.batchId
                    } 
                });
            }
        } catch (error) {
            console.error("Error starting practice:", error);
            alert("Failed to start practice. Please try again.");
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Practice Arena</h1>
                <p className="text-[var(--color-muted-foreground)] mt-2">Sharpen your skills with unlimited practice questions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Selection Card */}
                <div className="bg-[var(--color-card)] p-8 rounded-2xl border border-[var(--color-admin-border)] shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-lg bg-blue-500/10">
                            <Brain className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Quick Practice</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Select Subject</label>
                            <select 
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-admin-border)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                            >
                                <option value="">Choose a subject...</option>
                                {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={startPractice}
                            disabled={!selectedSubject || starting}
                            className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {starting ? 'Generating Quiz...' : 'Start Practice'}
                            {!starting && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="space-y-6">
                    <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)]">
                        <h3 className="font-semibold text-[var(--color-foreground)] mb-4">Why Practice?</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-[var(--color-muted-foreground)]">
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                <span>Identify your weak areas and improve them</span>
                            </li>
                            <li className="flex items-start gap-3 text-[var(--color-muted-foreground)]">
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                <span>Get instant feedback on your answers</span>
                            </li>
                            <li className="flex items-start gap-3 text-[var(--color-muted-foreground)]">
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                <span>Build confidence before the actual exam</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPractice;
