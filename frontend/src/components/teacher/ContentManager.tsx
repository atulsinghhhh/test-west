import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import { FileText, BookOpen, Loader2 } from "lucide-react";

interface Batch {
    _id: string;
    batchId: string;
    questionType: string;
    difficulty: string;
    isPublish: boolean;
    createdAt: string;
    noofQuestion: number;
}

interface Paper {
    paperId: string;
    testType: string;
    paperType: string;
    totalQuestion: number;
    totalMarks: number;
    publishStatus: boolean;
}

const ContentManager = () => {
    const { baseurl } = useAuth();
    const [questions, setQuestions] = useState<Batch[]>([]);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [questionsRes, papersRes] = await Promise.all([
                axios.get(`${baseurl}/teacher/questions`, { withCredentials: true }),
                axios.get(`${baseurl}/teacher/papers`, { withCredentials: true })
            ]);

            if (questionsRes.data.success) {
                setQuestions(questionsRes.data.questions || []);
            }
            if (papersRes.data.success) {
                setPapers(papersRes.data.papers || []);
            }
        } catch (error) {
            console.error("Error fetching content:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePublish = async (id: string, type: 'question' | 'paper') => {
        setPublishing(id);
        try {
            const endpoint = type === 'question' 
                ? `${baseurl}/teacher/question/publish/${id}`
                : `${baseurl}/teacher/paper/publish/${id}`;
            
            const response = await axios.put(endpoint, {}, { withCredentials: true });

            if (response.data.success) {
                // Refresh data
                fetchData();
            }
        } catch (error) {
            console.error(`Error publishing ${type}:`, error);
        } finally {
            setPublishing(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-6 space-y-8">
            {/* Question Batches Section */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="text-primary" /> Question Batches
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {questions.length > 0 ? questions.map((batch) => (
                        <div key={batch._id} className="bg-card p-4 rounded-lg border border-admin-border flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold capitalize">{batch.questionType} - {batch.difficulty}</h3>
                                <p className="text-sm text-muted-foreground">Questions: {batch.noofQuestion}</p>
                                <p className="text-xs text-muted-foreground">Created: {new Date(batch.createdAt).toLocaleDateString()}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${batch.isPublish ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                    {batch.isPublish ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <button
                                onClick={() => handlePublish(batch.batchId, 'question', batch.isPublish)}
                                disabled={publishing === batch.batchId}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    batch.isPublish 
                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                            >
                                {publishing === batch.batchId ? <Loader2 className="animate-spin w-4 h-4" /> : (batch.isPublish ? 'Unpublish' : 'Publish')}
                            </button>
                        </div>
                    )) : (
                        <p className="text-muted-foreground col-span-full">No question batches found.</p>
                    )}
                </div>
            </div>

            {/* Papers Section */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="text-primary" /> Papers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {papers.length > 0 ? papers.map((paper) => (
                        <div key={paper.paperId} className="bg-card p-4 rounded-lg border border-admin-border flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold capitalize">{paper.paperType}</h3>
                                <p className="text-sm text-muted-foreground">{paper.testType}</p>
                                <p className="text-xs text-muted-foreground">Marks: {paper.totalMarks} | Qs: {paper.totalQuestion}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${paper.publishStatus ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                    {paper.publishStatus ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <button
                                onClick={() => handlePublish(paper.paperId, 'paper', paper.publishStatus)}
                                disabled={publishing === paper.paperId}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    paper.publishStatus 
                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                            >
                                {publishing === paper.paperId ? <Loader2 className="animate-spin w-4 h-4" /> : (paper.publishStatus ? 'Unpublish' : 'Publish')}
                            </button>
                        </div>
                    )) : (
                        <p className="text-muted-foreground col-span-full">No papers found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentManager;
