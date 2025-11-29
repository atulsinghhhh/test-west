import { useEffect, useState } from "react";
import { Loader2, ListChecks, Calendar, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

interface Batch {
  _id: string;
  batchId: string;
  subjectName: string;
  totalQuestions: number;
  createdAt: string;
}

export default function StandaloneQuizzes() {
  const {baseurl} = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch(`${baseurl}/standalone/quizzes`, {
        credentials: "include"
      });
      const data = await response.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (error) {
      console.error("Failed to fetch quizzes", error);
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
        <h2 className="text-2xl font-bold text-white">Practice Quizzes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <div key={batch._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-100">
                {batch.subjectName}
              </h3>
              <span className="px-2 py-1 rounded text-xs border border-purple-500/30 text-purple-400">
                Quiz
              </span>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <ListChecks className="h-4 w-4" />
                  <span>{batch.totalQuestions} Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <button 
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
              onClick={() => navigate(`/student/practice/${batch.batchId}`)} 
              // Note: Reusing student batch attempt route. 
              // Similar issue as papers - need to ensure it works for standalone.
              // I'll probably need to update BatchAttempt to handle standalone API.
            >
              Start Quiz <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        ))}
        
        {batches.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                No quizzes available at the moment.
            </div>
        )}
      </div>
    </div>
  );
}
