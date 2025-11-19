import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import GradeSection from "./GradeSelector";
import { Trash, Plus } from "lucide-react";

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

export default function ManageSubject() {
    const { baseurl } = useAuth();

    const [gradeId, setGradeId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [chapterId, setChapterId] = useState("");
    const [topicId, setTopicId] = useState("");

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

    const [showSubjectInput, setShowSubjectInput] = useState(false);
    const [showChapterInput, setShowChapterInput] = useState(false);
    const [showTopicInput, setShowTopicInput] = useState(false);
    const [showSubtopicInput, setShowSubtopicInput] = useState(false);

    const [subjectName, setSubjectName] = useState("");
    const [chapterName, setChapterName] = useState("");
    const [topicName, setTopicName] = useState("");
    const [subtopicName, setSubtopicName] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchSubjects = async (gradeId: string) => {
        try {
        const response = await axios.get(
            `${baseurl}/school/grade/${gradeId}/subject`,
            { withCredentials: true }
        );
        setSubjects(response.data.subjects || []);
        } catch {
        setError("Failed to fetch subjects");
        }
    };

    const fetchChapters = async (subjectId: string) => {
        try {
            const response = await axios.get(
                `${baseurl}/school/subject/${subjectId}/chapter`,
                { withCredentials: true }
            );
            setChapters(response.data.chapters || []);
        } catch {
            setError("Failed to fetch chapters");
        }
    };

    const fetchTopics = async (chapterId: string) => {
        try {
            const response = await axios.get(
                `${baseurl}/school/chapter/${chapterId}/topic`,
                { withCredentials: true }
            );
            setTopics(response.data.topics || []);
        } catch {
            setError("Failed to fetch topics");
        }
    };

    const fetchSubtopics = async (topicId: string) => {
        try {
            const response = await axios.get(
                `${baseurl}/school/topic/${topicId}/subtopic`,
                { withCredentials: true }
            );
            setSubtopics(response.data.subtopics || []);
        } catch {
            setError("Failed to fetch subtopics");
        }
    };

    const handleGradeSelect = (id: string) => {
        setGradeId(id);
        setSubjects([]);
        setChapters([]);
        setTopics([]);
        setSubtopics([]);
        setSubjectId("");
        setChapterId("");
        setTopicId("");
        if (id) fetchSubjects(id);
    };

    const handleSubjectSelect = (id: string) => {
        setSubjectId(id);
        setChapters([]);
        setTopics([]);
        setSubtopics([]);
        setChapterId("");
        setTopicId("");
        if (id) fetchChapters(id);
    };

    const handleChapterSelect = (id: string) => {
        setChapterId(id);
        setTopics([]);
        setSubtopics([]);
        setTopicId("");
        if (id) fetchTopics(id);
    };

    const handleTopicSelect = (id: string) => {
        setTopicId(id);
        setSubtopics([]);
        if (id) fetchSubtopics(id);
    };

    const addSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradeId) return setError("Select a grade");
        if (!subjectName.trim()) return setError("Enter subject name");

        try {
            await axios.post(
                `${baseurl}/school/grade/${gradeId}/subject`,
                { subjectName },
                { withCredentials: true }
            );
            fetchSubjects(gradeId);
            setMessage("Subject added");
            setSubjectName("");
            setShowSubjectInput(false);
        } catch {
            setError("Failed to add subject");
        }
    };

    const addChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectId) return setError("Select a subject");
        if (!chapterName.trim()) return setError("Enter chapter name");

        try {
            await axios.post(
                `${baseurl}/school/subject/${subjectId}/chapter`,
                { chapterName },
                { withCredentials: true }
            );
            fetchChapters(subjectId);
            setMessage("Chapter added");
            setChapterName("");
            setShowChapterInput(false);
        } catch {
            setError("Failed to add chapter");
        }
    };

    const addTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chapterId) return setError("Select a chapter");
        if (!topicName.trim()) return setError("Enter topic name");

        try {
            await axios.post(
                `${baseurl}/school/chapter/${chapterId}/topic`,
                { topicName },
                { withCredentials: true }
            );
            fetchTopics(chapterId);
            setMessage("Topic added");
            setTopicName("");
            setShowTopicInput(false);
        } catch {
            setError("Failed to add topic");
        }
    };

    const addSubtopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topicId) return setError("Select a topic");
        if (!subtopicName.trim()) return setError("Enter subtopic name");

        try {
            await axios.post(
                `${baseurl}/school/topic/${topicId}/subtopic`,
                { subtopicName },
                { withCredentials: true }
            );
            fetchSubtopics(topicId);
            setMessage("Subtopic added");
            setSubtopicName("");
            setShowSubtopicInput(false);
        } catch {
            setError("Failed to add subtopic");
        }
    };

    const deleteSubject = async (id: string) => {
        if (!confirm("Delete this subject?")) return;
        try {
            await axios.delete(`${baseurl}/school/subject/${id}`, {
                withCredentials: true,
            });
            fetchSubjects(gradeId);
            setMessage("Subject deleted");
        } catch {
            setError("Failed to delete subject");
        }
    };

    const deleteChapter = async (id: string) => {
        if (!confirm("Delete this chapter?")) return;
        try {
            await axios.delete(`${baseurl}/school/chapter/${id}`, {
                withCredentials: true,
            });
            fetchChapters(subjectId);
            setMessage("Chapter deleted");
        } catch {
            setError("Failed to delete chapter");
        }
    };

    const deleteTopic = async (id: string) => {
        if (!confirm("Delete this topic?")) return;
        try {
            await axios.delete(`${baseurl}/school/topic/${id}`, {
                withCredentials: true,
            });
            fetchTopics(chapterId);
            setMessage("Topic deleted");
        } catch {
            setError("Failed to delete topic");
        }
    };

    const deleteSubtopic = async (id: string) => {
        if (!confirm("Delete this subtopic?")) return;
        try {
            await axios.delete(`${baseurl}/school/subtopic/${id}`, {
                withCredentials: true,
            });
            fetchSubtopics(topicId);
            setMessage("Subtopic deleted");
        } catch {
            setError("Failed to delete subtopic");
        }
    };

    return (
        <div className="bg-admin-bg p-6 rounded-lg text-foreground shadow-md">
        <h2 className="text-2xl font-bold mb-6">Manage Subjects</h2>

        {error && <p className="text-red-500 mb-3 bg-red-900/20 p-2 rounded">{error}</p>}
        {message && <p className="text-green-500 mb-3 bg-green-900/20 p-2 rounded">{message}</p>}

        <GradeSection onGradeSelect={handleGradeSelect} selectedGradeId={gradeId} />

        {/* SUBJECTS */}
        {gradeId && (
            <div className="mb-6 bg-admin-panel p-4 rounded-lg border border-admin-border">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Subjects</h3>
                {!showSubjectInput && (
                <button
                    onClick={() => setShowSubjectInput(true)}
                    className="flex items-center gap-2 bg-primary px-3 py-1.5 rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus size={16} /> Add
                </button>
                )}
            </div>

            {showSubjectInput && (
                <form onSubmit={addSubject} className="mb-3 flex gap-2">
                <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Enter subject name"
                    className="flex-1 bg-background border border-input text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Add
                </button>
                <button
                    type="button"
                    onClick={() => {
                    setShowSubjectInput(false);
                    setSubjectName("");
                    }}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                    Cancel
                </button>
                </form>
            )}

            {subjects.map((s) => (
                <div
                key={s._id}
                className="flex justify-between items-center bg-card p-3 my-1 rounded-lg border border-admin-border cursor-pointer hover:bg-admin-hover transition-colors"
                onClick={() => handleSubjectSelect(s._id)}
                >
                <span>{s.subjectName}</span>
                <Trash
                    size={18}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                    onClick={(e) => {
                    e.stopPropagation();
                    deleteSubject(s._id);
                    }}
                />
                </div>
            ))}
            </div>
        )}

        {/* CHAPTERS */}
        {subjectId && (
            <div className="mb-6 bg-admin-panel p-4 rounded-lg border border-admin-border">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Chapters</h3>
                {!showChapterInput && (
                <button
                    onClick={() => setShowChapterInput(true)}
                    className="flex items-center gap-2 bg-primary px-3 py-1.5 rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus size={16} /> Add
                </button>
                )}
            </div>

            {showChapterInput && (
                <form onSubmit={addChapter} className="mb-3 flex gap-2">
                <input
                    type="text"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="Enter chapter name"
                    className="flex-1 bg-background border border-input text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Add
                </button>
                <button
                    type="button"
                    onClick={() => {
                    setShowChapterInput(false);
                    setChapterName("");
                    }}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                    Cancel
                </button>
                </form>
            )}

            {chapters.map((c) => (
                <div
                key={c._id}
                className="flex justify-between items-center bg-card p-3 my-1 rounded-lg border border-admin-border cursor-pointer hover:bg-admin-hover transition-colors"
                onClick={() => handleChapterSelect(c._id)}
                >
                <span>{c.chapterName}</span>
                <Trash
                    size={18}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                    onClick={(e) => {
                    e.stopPropagation();
                    deleteChapter(c._id);
                    }}
                />
                </div>
            ))}
            </div>
        )}

        {/* TOPICS */}
        {chapterId && (
            <div className="mb-6 bg-admin-panel p-4 rounded-lg border border-admin-border">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Topics</h3>
                {!showTopicInput && (
                <button
                    onClick={() => setShowTopicInput(true)}
                    className="flex items-center gap-2 bg-primary px-3 py-1.5 rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus size={16} /> Add
                </button>
                )}
            </div>

            {showTopicInput && (
                <form onSubmit={addTopic} className="mb-3 flex gap-2">
                <input
                    type="text"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="Enter topic name"
                    className="flex-1 bg-background border border-input text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Add
                </button>
                <button
                    type="button"
                    onClick={() => {
                    setShowTopicInput(false);
                    setTopicName("");
                    }}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                    Cancel
                </button>
                </form>
            )}

            {topics.map((t) => (
                <div
                key={t._id}
                className="flex justify-between items-center bg-card p-3 my-1 rounded-lg border border-admin-border cursor-pointer hover:bg-admin-hover transition-colors"
                onClick={() => handleTopicSelect(t._id)}
                >
                <span>{t.topicName}</span>
                <Trash
                    size={18}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                    onClick={(e) => {
                    e.stopPropagation();
                    deleteTopic(t._id);
                    }}
                />
                </div>
            ))}
            </div>
        )}

        {/* SUBTOPICS */}
        {topicId && (
            <div className="mb-6 bg-admin-panel p-4 rounded-lg border border-admin-border">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Subtopics</h3>
                {!showSubtopicInput && (
                <button
                    onClick={() => setShowSubtopicInput(true)}
                    className="flex items-center gap-2 bg-primary px-3 py-1.5 rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus size={16} /> Add
                </button>
                )}
            </div>

            {showSubtopicInput && (
                <form onSubmit={addSubtopic} className="mb-3 flex gap-2">
                <input
                    type="text"
                    value={subtopicName}
                    onChange={(e) => setSubtopicName(e.target.value)}
                    placeholder="Enter subtopic name"
                    className="flex-1 bg-background border border-input text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Add
                </button>
                <button
                    type="button"
                    onClick={() => {
                    setShowSubtopicInput(false);
                    setSubtopicName("");
                    }}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                    Cancel
                </button>
                </form>
            )}

            {subtopics.map((st) => (
                <div
                key={st._id}
                className="flex justify-between items-center bg-card p-3 my-1 rounded-lg border border-admin-border hover:bg-admin-hover transition-colors"
                >
                <span>{st.subtopicName}</span>
                <Trash
                    size={18}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                    onClick={() => deleteSubtopic(st._id)}
                />
                </div>
            ))}
            </div>
        )}
        </div>
    );
    }


