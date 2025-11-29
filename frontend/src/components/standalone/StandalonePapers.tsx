import { useEffect, useState } from "react";
import { Loader2, FileText, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

interface Paper {
  _id: string;
  title: string;
  subjectId: string; // Or populated object
  totalMarks: number;
  duration: number;
  createdAt: string;
}

export default function StandalonePapers() {
  const {baseurl} = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await fetch(`${baseurl}/standalone/papers`, {
        credentials: "include"
      });
      const data = await response.json();
      if (data.success) {
        setPapers(data.papers);
      }
    } catch (error) {
      console.error("Failed to fetch papers", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Available Papers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <div key={paper._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-100 line-clamp-2">
                {paper.title}
              </h3>
              <span className="px-2 py-1 rounded text-xs border border-blue-500/30 text-blue-400">
                Paper
              </span>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{paper.duration} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{paper.totalMarks} Marks</span>
                </div>
              </div>
            </div>

            <button 
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
              onClick={() => navigate(`/student/paper/${paper._id}`)} 
              // Note: Reusing student paper attempt route. 
              // Ensure PaperAttempt component handles standalone logic or create a wrapper.
              // I will create a StandalonePaperAttempt wrapper or update PaperAttempt.
              // For now, let's assume I'll update PaperAttempt or create a new one.
              // Actually, I should probably create `StandalonePaperAttempt` to use the standalone API.
            >
              Attempt Paper <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        ))}
        
        {papers.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                No papers available at the moment.
            </div>
        )}
      </div>
    </div>
  );
}
