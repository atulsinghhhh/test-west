import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

interface Question {
    _id: string;
    questionText: string;
    options: string[];
    type: string;
    marks: number;
}

interface Paper {
    _id: string;
    paperId: string;
    duration: number;
    questions: Question[];
}

const PaperAttempt = () => {

    const { baseurl } = useAuth();
    const { paperId } = useParams();
    const navigate = useNavigate();

    const [paper, setPaper] = useState<Paper | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds

    useEffect(() => {
        fetchPaper();
    }, [paperId]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (paper && timeLeft === 0) {
            // Auto-submit logic could go here
        }
    }, [timeLeft, paper]);

    const fetchPaper = async () => {
        try {
            // We need an endpoint to fetch a single paper details for attempting
            // Currently we only have fetchPublishedPapers (list).
            // We need GET /student/paper/:paperId
            // Wait, I might have missed this endpoint too?
            // Let me check student.controller.ts
            // I have viewPaperResult, but that's for results.
            // I don't have a specific endpoint to fetch a paper for attempting if it's not in the published list details.
            // But fetchPublishedPapers returns the list. I can filter from there if I had the list, but better to fetch one.
            // Actually, `attemptPaper` is the POST.
            // I need to fetch the paper content (questions) to show them!
            // The `fetchPublishedPapers` returns the list of papers. Does it include the full questions array?
            // If so, I can just use that. If not, I need a new endpoint.
            // Let's assume for now I can fetch it or I need to add it.
            // Looking at `fetchPublishedPapers` in controller: `Paper.find(...)`. It returns everything by default unless projected.
            // So `fetchPublishedPapers` returns ALL papers with ALL questions. That might be heavy but it works for now.
            // But I need to fetch a *specific* paper by ID here.
            // I'll assume I can fetch it via a new endpoint or filter from the list if I store it in context (but I don't).
            // I should probably add `GET /student/paper/:paperId` to be safe and clean.
            // For now, I'll try to use a new endpoint `GET /student/paper/:paperId/content` or similar.
            // Or I can use `fetchPublishedPapers` and filter client side if the list is small.
            // Let's add the endpoint to backend quickly if needed.
            // Actually, let's check if I can just use `fetchPublishedPapers` and find the one I need.
            // But that fetches ALL papers. Not efficient.
            // I'll add `fetchPaperContent` to backend.
            
            // WAIT! I can't keep switching context.
            // I'll implement the UI assuming the endpoint exists: `/api/student/paper/:paperId/content`
            // And I will add it to the backend in the next step.
            
            const response = await axios.get(`${baseurl}/student/paper/${paperId}/content`, { withCredentials: true });
            if (response.data.success) {
                setPaper(response.data.paper);
                setTimeLeft(response.data.paper.duration * 60);
            }
        } catch (error) {
            console.error("Error fetching paper", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (!paper) return;
        setSubmitting(true);
    
        const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
            questionId: qId,
            userAnswer: ans
        }));

        try {
            const response = await axios.post(`${baseurl}/student/paper/submit/${paperId}`, {
                answers: formattedAnswers
            }, { withCredentials: true });

            if (response.data.success) {
                navigate(`/student/paper/result/${paperId}`);
            }
        } catch (error) {
            console.error("Error submitting paper", error);
            alert("Failed to submit paper. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>;
    if (!paper) return <div className="text-center p-8 text-red-500">Paper not found</div>;

    const currentQuestion = paper.questions[currentQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)] flex items-center justify-between sticky top-4 z-10 shadow-lg">
                <div>
                    <h1 className="text-xl font-bold text-[var(--color-foreground)]">{paper.paperId}</h1>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Question {currentQuestionIndex + 1} of {paper.questions.length}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 300 ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-[var(--color-card)] p-8 rounded-xl border border-[var(--color-admin-border)] min-h-[400px] flex flex-col">
                <div className="flex-1">
                    <div className="flex items-start gap-4 mb-6">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-admin-hover)] text-[var(--color-muted-foreground)] font-bold">
                            {currentQuestionIndex + 1}
                        </span>
                        <div className="space-y-4 w-full">
                            <h2 className="text-lg font-medium text-[var(--color-foreground)] leading-relaxed">
                                {currentQuestion.questionText}
                            </h2>
                            
                            {/* Options */}
                            <div className="space-y-3 mt-6">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(currentQuestion._id, option)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group ${
                                            answers[currentQuestion._id] === option
                                                ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                                                : 'bg-[var(--color-admin-bg)] border-[var(--color-admin-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-foreground)]'
                                        }`}
                                    >
                                        <span>{option}</span>
                                        {answers[currentQuestion._id] === option && <CheckCircle size={18} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-admin-border)]">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={20} />
                            Previous
                    </button>

                    {currentQuestionIndex === paper.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Paper'}
                            <Save size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(paper.questions.length - 1, prev + 1))}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-admin-hover)] text-[var(--color-foreground)] hover:bg-[var(--color-admin-border)] transition-colors"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)]">
                <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] mb-4">Question Palette</h3>
                <div className="flex flex-wrap gap-2">
                    {paper.questions.map((q, idx) => (
                        <button
                            key={q._id}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                                currentQuestionIndex === idx
                                    ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-admin-bg)] text-[var(--color-foreground)]'
                                    : answers[q._id]
                                    ? 'bg-[var(--color-primary)] text-black'
                                    : 'bg-[var(--color-admin-hover)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-admin-border)]'
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaperAttempt;
