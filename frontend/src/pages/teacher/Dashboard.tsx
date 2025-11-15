import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export interface IQuestion {
    type: "mcq" | "descriptive";
    question: string;
    options?: string[];     
    correctAnswer?: string; 
    marks: number;
}

export interface ITest {
    _id: string;
    title: string;
    createdBy: string;       
    subject: string;
    institution?: string;
    duration: number;
    isPublished: boolean;
    totalMarks: number;
    questions: IQuestion[];
    createdAt: string;
    updatedAt: string;
}

const Dashboard = () =>{
    const { baseurl } = useAuth();
    const navigate = useNavigate();
    const [tests,setTests] = useState<ITest[]>([]);
    const [loading,setLoading] = useState<boolean| null>(false);
    const [message,setMessage] = useState<String | null>('');
    const [error,setError] = useState<String | null>('');

    useEffect(()=>{
        const FetchTests = async ()=>{
            setError("");
            setMessage("");
            setLoading(true);
            try {
                const response = await axios.get(`${baseurl}/teacher/tests`,{withCredentials: true});
                const data = response?.data;    
                if(data.success){
                    setMessage("fetch all test series");
                    setTests(data.tests)
                    console.log("heii")
                    console.log("test series: ",data.tests);
                }
                
            } catch (error) {
                setError("Something went wrong")
            } finally{
                setLoading(true);
            }
        }
        FetchTests();
    },[])


    return (
    <div className="min-h-screen bg-[#08080A] text-[#E6EEF3] p-6">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-semibold tracking-wide">
                    Teacher Dashboard
                </h1>

                <button
                    onClick={()=> navigate('/create')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 text-black font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                    + Create Test
                </button>
            </div>

            {/* Messages */}
            {error && <p className="text-red-400 text-center mb-4">{error}</p>}
            {message && <p className="text-green-400 text-center mb-4">{message}</p>}
        </div>
    );

}

export { Dashboard }