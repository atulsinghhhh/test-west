import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthProvider";
import axios from "axios";

interface IQuestion {
   _id: string;
   batchId: string;
   isPublish: boolean;
   questionType: string;
   difficulty: string;
   noofQuestion: number; 
}

function QuestionPublish() {
    const { baseurl } = useAuth();
    const [Questions, setQuestions] = useState<IQuestion[]>([]);
    const [loading,setLoading] = useState<boolean>(false);
    const [error,setError] = useState<string>("");
    const [message,setMessage] = useState<string>("");

    useEffect(()=>{
        const fetchQuestions = async () =>{
            setLoading(true);
            try{
                const response =await axios.get(`${baseurl}/teacher/questions`,{
                    withCredentials:true
                });
                if(response.data.success){
                    setQuestions(response.data.questions);
                }else{
                    setError("Failed to fetch questions");
                }

                console.log("fetch the data: ", response.data.questions);
            }catch(error){
                console.log("Error fetching questions: ", error);
                setError("Failed to fetch questions");
            } finally{
                setLoading(false);
            }
        }
        fetchQuestions();
    },[]);

    const handlePublish = async (batchId:string)=>{
        try {
            await axios.put(`${baseurl}/teacher/question/publish/${batchId}`,{},{
                withCredentials:true
            })
            setMessage("Question published successfully");
            setQuestions((prev)=>(
                prev.map((q)=>(
                    q.batchId === batchId ? {...q,isPublish:true}:q
                ))
            ))
        } catch (error) {
            console.log("Error publishing question: ", error);
            setError("Failed to publish question");
        }
    }
  return (
     <div className="p-6 bg-[--color-admin-bg] min-h-screen text-[--color-foreground]">
            <h1 className="text-2xl font-semibold mb-6 text-white">📝 Teacher Question Analytics</h1>

            {loading && <p className="text-[--color-primary]">Loading questions...</p>}
            {error && <p className="text-red-500 font-medium">{error}</p>}
            {message && <p className="text-green-500 font-medium">{message}</p>}

            {!loading && Questions.length > 0 && (
                <div className="overflow-x-auto mt-4">
                    <table className="w-full rounded-lg bg-[--color-card] text-white">
                        <thead>
                            <tr className="bg-[--color-admin-panel] text-[--color-muted-foreground]">
                                <th className="p-3 text-left">Batch ID</th>
                                <th className="p-3 text-left">Question Type</th>
                                <th className="p-3 text-left">Difficulty</th>
                                <th className="p-3 text-left">No. of Questions</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Questions.map((q) => (
                                <tr
                                    key={q.batchId}
                                    className="hover:bg-[--color-admin-hover] transition text-white"
                                >
                                    <td className="p-3">{q.batchId}</td>
                                    <td className="p-3">{q.questionType}</td>
                                    <td className="p-3">{q.difficulty}</td>
                                    <td className="p-3">{q.noofQuestion}</td>

                                    <td className="p-3">
                                        {q.isPublish ? (
                                            <span className="text-green-400 font-semibold">Published</span>
                                        ) : (
                                            <span className="text-red-400 font-semibold">Not Published</span>
                                        )}
                                    </td>

                                    <td className="p-3">
                                        <button
                                            onClick={() => handlePublish(q.batchId)}
                                            className={`px-4 py-1.5 rounded-lg font-medium transition 
                                                ${q.isPublish
                                                    ? "bg-red-600 hover:bg-red-700"
                                                    : "bg-[--color-primary] hover:bg-green-700"
                                                }`}
                                        >
                                            {q.isPublish ? "Unpublish" : "Publish"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && Questions.length === 0 && (
                <p className="text-[--color-muted-foreground] mt-4">No questions found.</p>
            )}
        </div>
  )
}

export default QuestionPublish