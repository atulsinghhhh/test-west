import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

interface Paper {
    _id: string;
    paperId: string;
    subjectId: string; // Or populated object
    duration: number;
    totalMarks: number;
    totalQuestion: number;
    testType: string;
    createdAt: string;
}

const StudentPapers = () => {

    const {baseurl} = useAuth();

    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            const response = await axios.get(`${baseurl}/student/papers/published`, { withCredentials: true });
            if (response.data.success) {
                setPapers(response.data.papers);
            }
        } catch (err) {
            setError('Failed to load papers. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAttempt = (paperId: string) => {
        navigate(`/student/paper/${paperId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Available Papers</h1>
                <p className="text-[var(--color-muted-foreground)] mt-2">Select a paper to start your assessment.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {papers.map((paper) => (
                    <div key={paper._id} className="bg-[var(--color-card)] rounded-xl border border-[var(--color-admin-border)] overflow-hidden hover:border-[var(--color-primary)]/50 transition-all duration-300 group">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                    <FileText size={24} />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-admin-hover)] text-[var(--color-muted-foreground)] border border-[var(--color-admin-border)]">
                                    {paper.testType}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                                {paper.paperId}
                            </h3>
                            
                            <div className="space-y-2 text-sm text-[var(--color-muted-foreground)] mb-6">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>{paper.duration} Minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span>{paper.totalQuestion} Questions • {paper.totalMarks} Marks</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleAttempt(paper._id)}
                                className="w-full py-2.5 rounded-lg bg-[var(--color-admin-hover)] text-[var(--color-foreground)] font-medium hover:bg-[var(--color-primary)] hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(45,212,111,0.2)]"
                            >
                                Start Attempt
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {papers.length === 0 && !error && (
                    <div className="col-span-full text-center py-12 text-[var(--color-muted-foreground)]">
                        No papers available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPapers;
