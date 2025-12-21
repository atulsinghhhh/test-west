import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

interface Answer {
    questionId: string;
    questionText: string;
    userAnswer: string;
    correctAnswer: string[];
    isCorrect: boolean;
    marks: number;
}

interface Attempt {
    _id: string;
    batchId: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    answers: Answer[];
}

const BatchResult = () => {
    const { baseurl } = useAuth();
    
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResult();
    }, [batchId]);

    const fetchResult = async () => {
        try {
            const response = await axios.get(`${baseurl}/student/question/result/${batchId}`, { withCredentials: true });
            if (response.data.success) {
                setAttempt(response.data.attempt);
                console.log("response: ",response.data.attempt);
            }
        } catch (error) {
            console.error("Error fetching result", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>;
    if (!attempt) return <div className="text-center p-8 text-red-500">Result not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)] flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Practice Result</h1>
                    <p className="text-[var(--color-muted-foreground)]">Batch: {attempt.batchId}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-purple-500">{attempt.percentage.toFixed(1)}%</div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Score: {attempt.obtainedMarks} / {attempt.totalMarks}</p>
                </div>
            </div>

            <div className="space-y-6">
                {attempt.answers.map((ans, idx) => (
                    <div key={idx} className={`bg-[var(--color-card)] p-6 rounded-xl border ${ans.isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                        <div className="flex items-start gap-4">
                            <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold ${ans.isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {idx + 1}
                            </span>
                            <div className="space-y-4 w-full">
                                <h3 className="text-lg font-medium text-[var(--color-foreground)]">{ans.questionText}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)]">
                                        <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase block mb-1">Your Answer</span>
                                        <p className={`font-medium ${ans.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                            {ans.userAnswer || <span className="italic text-gray-500">Not attempted</span>}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)]">
                                        <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase block mb-1">Correct Answer</span>
                                        <p className="font-medium text-green-500">
                                            {Array.isArray(ans.correctAnswer) ? ans.correctAnswer.join(', ') : ans.correctAnswer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                {ans.isCorrect ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={() => navigate('/student/practice')}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-admin-hover)] text-[var(--color-foreground)] hover:bg-[var(--color-admin-border)] transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Practice
            </button>
        </div>
    );
};

export default BatchResult;
