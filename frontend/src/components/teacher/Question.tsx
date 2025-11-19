import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

interface Subject {
    _id: string;
    subjectName: string;
}

interface Chapter {
    _id: string;
    chapterName: string;
}

interface Topic {
    _id: string;
    topicName: string;
}

interface Subtopic {
    _id: string;
    subtopicName: string;
}

interface GradeInfo {
    gradeId: string;
    gradeName: string;
    questionLimit: number;
    questionUsed: number;
    remainingQuestions: number;
    paperLimit: number;
    paperUsed: number;
}

interface GeneratedQuestion {
    _id: string;
    questiontext: string;
    questionType: string;
    difficulty: string;
    options: string[];
    correctAnswer?: string;
}

const questionTypes = [
    { value: "mcq", label: "Multiple Choice" },
    { value: "msq", label: "Multi Select" },
    { value: "short", label: "Short" },
    { value: "long", label: "Long" },
    { value: "nat", label: "Numerical" }
];

const difficultyLevels = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" }
];

export default function Question() {
    const { baseurl, user } = useAuth();

    const [gradeInfo, setGradeInfo] = useState<GradeInfo | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

    const [subjectId, setSubjectId] = useState("");
    const [chapterId, setChapterId] = useState("");
    const [topicId, setTopicId] = useState("");
    const [subtopicId, setSubtopicId] = useState("");
    const [questionType, setQuestionType] = useState("mcq");
    const [difficulty, setDifficulty] = useState("easy");
    const [noofQuestions, setNoofQuestions] = useState(5);
    const [filterBy, setFilterBy] = useState("subject");

    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // const teacherName = useMemo(() => user?.name ?? "Teacher", [user]);

    const fetchGradeInfo = useCallback(async () => {
        try {
            const response = await axios.get(`${baseurl}/teacher/grade`, {
                withCredentials: true
            });
            if (response.data?.grade) {
                setGradeInfo(response.data.grade);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch grade info");
        }
    }, [baseurl]);

    const fetchSubjects = useCallback(async () => {
        try {
            const response = await axios.get(`${baseurl}/teacher/subjects`, {
                withCredentials: true
            });
            setSubjects(response.data.subjects || []);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch subjects");
        }
    }, [baseurl]);

    const fetchChapters = async (id: string) => {
        try {
            const response = await axios.get(`${baseurl}/teacher/subjects/${id}/chapters`, {
                withCredentials: true
            });
            setChapters(response.data.chapters || []);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch chapters");
        }
    };

    const fetchTopics = async (id: string) => {
        try {
            const response = await axios.get(`${baseurl}/teacher/chapters/${id}/topics`, {
                withCredentials: true
            });
            setTopics(response.data.topics || []);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch topics");
        }
    };

    const fetchSubtopics = async (id: string) => {
        try {
            const response = await axios.get(`${baseurl}/teacher/topics/${id}/subtopics`, {
                withCredentials: true
            });
            setSubtopics(response.data.subtopics || []);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch subtopics");
        }
    };

    useEffect(() => {
        fetchGradeInfo();
        fetchSubjects();
    }, [fetchGradeInfo, fetchSubjects]);

    const handleSubjectChange = (value: string) => {
        setSubjectId(value);
        setChapterId("");
        setTopicId("");
        setSubtopicId("");
        setChapters([]);
        setTopics([]);
        setSubtopics([]);
        if (value) {
            fetchChapters(value);
        }
    };

    const handleChapterChange = (value: string) => {
        setChapterId(value);
        setTopicId("");
        setSubtopicId("");
        setTopics([]);
        setSubtopics([]);
        if (value) {
            fetchTopics(value);
        }
    };

    const handleTopicChange = (value: string) => {
        setTopicId(value);
        setSubtopicId("");
        setSubtopics([]);
        if (value) {
            fetchSubtopics(value);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!subjectId || !chapterId || !topicId || !subtopicId) {
            setError("Select subject, chapter, topic and subtopic");
            return;
        }

        if (!noofQuestions || noofQuestions <= 0) {
            setError("Enter a valid number of questions");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${baseurl}/teacher/question/generate`,
                {
                    subjectId,
                    chapterId,
                    topicId,
                    subtopicId,
                    questionType,
                    difficulty,
                    noofQuestions
                },
                { withCredentials: true }
            );

            setGeneratedQuestions(response.data.questions || []);
            setMessage(response.data.message || "Questions generated");

            setGradeInfo((prev) => {
                if (!prev) return prev;
                const updatedUsed = response.data.teacherQuestionUsed ?? prev.questionUsed + noofQuestions;
                const updatedRemaining =
                    response.data.teacherRemainingLimit ?? Math.max(prev.questionLimit - updatedUsed, 0);
                return {
                    ...prev,
                    questionUsed: updatedUsed,
                    remainingQuestions: updatedRemaining
                };
            });
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to generate questions");
        } finally {
            setLoading(false);
        }
    };

    const gradeLabel = gradeInfo?.gradeName || user?.gradeName || user?.grade || "N/A";
    
    return (
        <div className="min-h-screen bg-admin-bg text-foreground p-6 space-y-6">

            {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
            {message && <p className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg">{message}</p>}

            <section className="bg-card border border-admin-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Generate Questions</h2>
                <form onSubmit={handleGenerate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Class</label>
                            <input
                                type="text"
                                value={gradeLabel}
                                readOnly
                                className="w-full bg-black border border-input rounded-lg px-3 py-2 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Filter By</label>
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value)}
                                className="w-full bg-black border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="subject">Subject wise</option>
                                <option value="chapter" disabled>Chapter wise (coming soon)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Subject</label>
                            <select
                                value={subjectId}
                                onChange={(e) => handleSubjectChange(e.target.value)}
                                className="w-full bg-black border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject._id} value={subject._id}>
                                        {subject.subjectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Question Type</label>
                            <select
                                value={questionType}
                                onChange={(e) => setQuestionType(e.target.value)}
                                className="w-full bg-black border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select type</option>
                                {questionTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Chapter</label>
                            <select
                                value={chapterId}
                                onChange={(e) => handleChapterChange(e.target.value)}
                                disabled={!subjectId}
                                className="w-full bg-black border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                                <option value="">Select chapter</option>
                                {chapters.map((chapter) => (
                                    <option key={chapter._id} value={chapter._id}>
                                        {chapter.chapterName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full bg-black border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select difficulty</option>
                                {difficultyLevels.map((level) => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Number of Questions</label>
                            <input
                                type="number"
                                min={1}
                                value={noofQuestions}
                                onChange={(e) => setNoofQuestions(Number(e.target.value))}
                                className="w-full bg-black border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Topic</label>
                            <select
                                value={topicId}
                                onChange={(e) => handleTopicChange(e.target.value)}
                                disabled={!chapterId}
                                className="w-full bg-black border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                                <option value="">Select topic</option>
                                {topics.map((topic) => (
                                    <option key={topic._id} value={topic._id}>
                                        {topic.topicName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Subtopic</label>
                            <select
                                value={subtopicId}
                                onChange={(e) => setSubtopicId(e.target.value)}
                                disabled={!topicId}
                                className="w-full bg-black border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                                <option value="">Select subtopic</option>
                                {subtopics.map((subtopic) => (
                                    <option key={subtopic._id} value={subtopic._id}>
                                        {subtopic.subtopicName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold shadow hover:bg-[#6d28d9] transition disabled:opacity-40"
                    >
                        {loading ? "Generating..." : "Generate Questions"}
                    </button>
                </form>
            </section>
        </div>
    );
}
