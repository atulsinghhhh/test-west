import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider';

const PracticeSession = () => {
    const { baseurl } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { questions } = location.state || {};

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<any>({}); // { questionId: userAnswer }
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!questions || questions.length === 0) {
        return <div className="p-8 text-center text-[var(--color-foreground)]">No questions loaded. Please start from the practice page.</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleAnswer = (option: string) => {
        if (submitted) return;
        setAnswers({ ...answers, [currentQuestion._id]: option });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const submitQuiz = async () => {
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
                questionId: qId,
                userAnswer: ans
            }));

            const response = await axios.post(`${baseurl}/student/practice/submit`, {
                answers: formattedAnswers
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                setSubmitted(true);
                setResult(response.data.result);
            }
        } catch (error) {
            console.error("Error submitting practice:", error);
            alert("Failed to submit practice.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Practice Session</h1>
                    <p className="text-[var(--color-muted-foreground)]">Question {currentQuestionIndex + 1} of {questions.length}</p>
                </div>
                {submitted && result && (
                    <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-lg font-bold">
                        Score: {result.obtainedMarks}/{result.totalMarks} ({result.percentage.toFixed(1)}%)
                    </div>
                )}
            </div>

            {/* Question Card */}
            <div className="bg-[var(--color-card)] p-8 rounded-2xl border border-[var(--color-admin-border)] shadow-sm mb-8">
                <h3 className="text-xl font-medium text-[var(--color-foreground)] mb-6">
                    {currentQuestion.questiontext || currentQuestion.questionText}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option: string, idx: number) => {
                        const isSelected = answers[currentQuestion._id] === option;
                        let optionClass = "w-full p-4 rounded-xl border-2 text-left transition-all ";
                        
                        if (submitted) {
                            const isCorrect = option === currentQuestion.correctAnswer;
                            if (isCorrect) optionClass += "border-green-500 bg-green-500/10 text-green-500";
                            else if (isSelected) optionClass += "border-red-500 bg-red-500/10 text-red-500";
                            else optionClass += "border-[var(--color-admin-border)] text-[var(--color-muted-foreground)] opacity-50";
                        } else {
                            if (isSelected) optionClass += "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]";
                            else optionClass += "border-[var(--color-admin-border)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]/50";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option)}
                                disabled={submitted}
                                className={optionClass}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {submitted && option === currentQuestion.correctAnswer && <CheckCircle className="w-5 h-5" />}
                                    {submitted && isSelected && option !== currentQuestion.correctAnswer && <XCircle className="w-5 h-5" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-2 rounded-lg text-[var(--color-foreground)] hover:bg-[var(--color-admin-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                {!submitted ? (
                    isLastQuestion ? (
                        <button
                            onClick={submitQuiz}
                            disabled={submitting}
                            className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            {submitting ? 'Submitting...' : 'Submit Practice'}
                            <Save className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-colors flex items-center gap-2"
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )
                ) : (
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                )}
            </div>
        </div>
    );
};

export default PracticeSession;
