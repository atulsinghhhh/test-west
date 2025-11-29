import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ChevronLeft, Save, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

interface Question {
    _id: string;
    questiontext: string; // Note: backend might return questionText or questiontext, check controller
    options: string[];
    questionType: string;
}

const StandaloneBatchAttempt = () => {
    const {baseurl} = useAuth();
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [batchId]);

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`${baseurl}/standalone/questions/${batchId}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                setQuestions(data.questions);
            } else {
                if (response.status === 403 || response.status === 400) {
                    alert(data.message || "You have already attempted this practice set.");
                    navigate('/standalone/quizzes');
                }
            }
        } catch (error: any) {
            console.error("Error fetching questions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        
        const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
            questionId: qId,
            userAnswer: ans
        }));

        try {
            const response = await fetch(`http://localhost:8000/api/standalone/attempt/batch/${batchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ answers: formattedAnswers })
            });
            const data = await response.json();

            if (data.success) {
                alert("Quiz submitted successfully!");
                navigate('/standalone/quizzes');
            } else {
                alert(data.message || "Failed to submit.");
            }
        } catch (error) {
            console.error("Error submitting answers", error);
            alert("Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>;
    if (questions.length === 0) return <div className="text-center p-8 text-red-500">No questions found in this batch.</div>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto space-y-6 text-gray-100">
            {/* Header */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex items-center justify-between sticky top-4 z-10 shadow-lg">
                <div>
                    <h1 className="text-xl font-bold text-gray-100">Practice Session</h1>
                    <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 font-bold">
                    <BookOpen size={20} />
                    Practice
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
                                {currentQuestion.questiontext || "Question Text Missing"} 
                                {/* Note: Check if backend returns questionText or questiontext */}
                            </h2>
                            
                            {/* Options */}
                            <div className="space-y-3 mt-6">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(currentQuestion._id, option)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group ${
                                            answers[currentQuestion._id] === option
                                                ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                                                : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-purple-500/50 hover:text-gray-100'
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
                                    Your Answer (Optional for practice, required for subjective)
                                </label>
                                <textarea
                                    value={answers[currentQuestion._id] || ''}
                                    onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full h-32 p-4 rounded-lg bg-gray-950 border border-gray-800 text-gray-100 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
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

                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Finish Practice'}
                            <Save size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-100 hover:bg-gray-700 transition-colors"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Question Palette */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Question Palette</h3>
                <div className="flex flex-wrap gap-2">
                    {questions.map((q, idx) => (
                        <button
                            key={q._id}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                                currentQuestionIndex === idx
                                    ? 'ring-2 ring-purple-500 bg-gray-950 text-gray-100'
                                    : answers[q._id]
                                    ? 'bg-purple-600 text-white'
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

export default StandaloneBatchAttempt;
