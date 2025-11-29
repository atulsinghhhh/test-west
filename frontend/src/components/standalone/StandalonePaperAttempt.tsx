import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ChevronRight, ChevronLeft, Save } from 'lucide-react';
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
    title: string; // Added title if available in paper object
    duration: number;
    questions: Question[];
}

const StandalonePaperAttempt = () => {
    const {baseurl } =useAuth();
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
            const response = await fetch(`${baseurl}/standalone/paper/${paperId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setPaper(data.paper);
                setTimeLeft(data.paper.duration * 60);
            } else {
                if (response.status === 403 || response.status === 400) {
                    alert(data.message || "You have already attempted this paper.");
                    navigate('/standalone/papers');
                }
            }
        } catch (error: any) {
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
            const response = await fetch(`${baseurl}/standalone/attempt/paper/${paperId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ answers: formattedAnswers })
            });
            const data = await response.json();

            if (data.success) {
                // Navigate to a result page or dashboard
                // For now, redirect to dashboard or papers list with a success message
                alert("Paper submitted successfully!");
                navigate('/standalone/papers');
            } else {
                alert(data.message || "Failed to submit paper.");
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

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
    if (!paper) return <div className="text-center p-8 text-red-500">Paper not found</div>;

    const currentQuestion = paper.questions[currentQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto space-y-6 text-gray-100">
            {/* Header */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex items-center justify-between sticky top-4 z-10 shadow-lg">
                <div>
                    <h1 className="text-xl font-bold text-gray-100">{paper.title || "Paper Attempt"}</h1>
                    <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {paper.questions.length}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 300 ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 min-h-[400px] flex flex-col">
                <div className="flex-1">
                    <div className="flex items-start gap-4 mb-6">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 font-bold">
                            {currentQuestionIndex + 1}
                        </span>
                        <div className="space-y-4 w-full">
                            <h2 className="text-lg font-medium text-gray-100 leading-relaxed">
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
                                                ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                                                : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-blue-500/50 hover:text-gray-100'
                                        }`}
                                    >
                                        <span>{option}</span>
                                        {answers[currentQuestion._id] === option && <CheckCircle size={18} />}
                                    </button>
                                ))}
                            </div>

                            {/* Answer Textarea */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Your Answer (Optional for objective, required for subjective)
                                </label>
                                <textarea
                                    value={answers[currentQuestion._id] || ''}
                                    onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full h-32 p-4 rounded-lg bg-gray-950 border border-gray-800 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={20} />
                            Previous
                    </button>

                    {currentQuestionIndex === paper.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Paper'}
                            <Save size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(paper.questions.length - 1, prev + 1))}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-100 hover:bg-gray-700 transition-colors"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Question Palette</h3>
                <div className="flex flex-wrap gap-2">
                    {paper.questions.map((q, idx) => (
                        <button
                            key={q._id}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                                currentQuestionIndex === idx
                                    ? 'ring-2 ring-blue-500 bg-gray-950 text-gray-100'
                                    : answers[q._id]
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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

export default StandalonePaperAttempt;
