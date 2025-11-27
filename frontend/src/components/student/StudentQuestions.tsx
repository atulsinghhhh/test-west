import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, HelpCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuestionBatch {
    _id: string;
    batchId: string;
    subjectName: string;
    totalQuestions: number;
    createdAt: string;
}

const StudentQuestions = () => {
    const [batches, setBatches] = useState<QuestionBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/student/questions/published', { withCredentials: true });
            if (response.data.success) {
                setBatches(response.data.batches);
            }
        } catch (err) {
            setError('Failed to load practice questions. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAttempt = (batchId: string) => {
        navigate(`/student/practice/${batchId}`);
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
                <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Practice Questions</h1>
                <p className="text-[var(--color-muted-foreground)] mt-2">Sharpen your skills with topic-wise question batches.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                    <div key={batch._id} className="bg-[var(--color-card)] rounded-xl border border-[var(--color-admin-border)] overflow-hidden hover:border-[var(--color-primary)]/50 transition-all duration-300 group">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                                    <BookOpen size={24} />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-admin-hover)] text-[var(--color-muted-foreground)] border border-[var(--color-admin-border)]">
                                    {batch.subjectName}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2 group-hover:text-purple-400 transition-colors">
                                {batch.batchId}
                            </h3>
                            
                            <div className="space-y-2 text-sm text-[var(--color-muted-foreground)] mb-6">
                                <div className="flex items-center gap-2">
                                    <HelpCircle size={16} />
                                    <span>{batch.totalQuestions} Questions</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleAttempt(batch.batchId)}
                                className="w-full py-2.5 rounded-lg bg-[var(--color-admin-hover)] text-[var(--color-foreground)] font-medium hover:bg-purple-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                            >
                                Start Practice
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {batches.length === 0 && !error && (
                    <div className="col-span-full text-center py-12 text-[var(--color-muted-foreground)]">
                        No practice questions available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentQuestions;
