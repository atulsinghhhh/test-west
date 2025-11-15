import axios from "axios"
import { useState } from "react"
import { useAuth } from "../../context/AuthProvider"

interface ITestCreate {
    _id?: string
    title?: string
    institution?: string
    subject?: string
    duration?: number
    totalMarks?: number
    questions?: [IQuestion]
}
interface IQuestion {
    type: "mcq" | "descriptive";
    question: string;
    options?: string[];     
    correctAnswer?: string; 
    marks: number;
}

function Create() {
    const { baseurl } = useAuth();
    const [testForm,setTestForm] = useState<ITestCreate>({
        title: '',
        institution: '',
        subject: '',
        duration: 0,
        totalMarks: 0,

    });
    const [error,setError] =useState<string | null> ("");
    const [message,setMessage] = useState<string | null>("");
    const [loading,setLoading] = useState<boolean>(false);
    const [questionForm, setQuestionForm] = useState<IQuestion>({
        type: "mcq",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name ,value } = e.target;
        setTestForm((prev)=>({
            ...prev,
            [name]: name === "duration" || name === "totalMarks" ? Number(value).toString() : value,
        }))
    }

    const handleCreateTest = async(e: React.FormEvent)=>{
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);
        try {
            const response = await axios.post(`${baseurl}/teacher/tests/create`,testForm,{
                withCredentials: true
            });

            const data = response?.data;
            if(data.success){
                setMessage("You Test form is created successfully");
                setTestForm({
                    title: '',
                    institution: '',
                    subject: '',
                    duration: 0,
                    totalMarks: 0
                });
            }
        } catch (error) {
            setError("Something went wrong");
        } finally { 
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#08080A] text-[#E6EEF3] p-8 ">

            <h1 className="text-3xl font-semibold mb-6">Create New Test</h1>

            {/* Messages */}
            {error && <p className="text-red-400 mb-4">{error}</p>}
            {message && <p className="text-green-400 mb-4">{message}</p>}

            {/* TEST FORM */}
            <form
                onSubmit={handleCreateTest}
                className="bg-[#0D0F12] border border-white/10 p-6 rounded-2xl w-full max-w-2xl"
            >
                {/* Title */}
                <label className="block mb-3">
                    <span className="text-sm text-gray-300">Title</span>
                    <input
                        type="text"
                        name="title"
                        value={testForm.title}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 p-2 rounded-lg bg-[#1A1C1F] border border-white/10"
                    />
                </label>

                {/* Institution */}
                <label className="block mb-3">
                    <span className="text-sm text-gray-300">Institution</span>
                    <input
                        type="text"
                        name="institution"
                        value={testForm.institution}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 rounded-lg bg-[#1A1C1F] border border-white/10"
                    />
                </label>

                {/* Subject */}
                <label className="block mb-3">
                    <span className="text-sm text-gray-300">Subject</span>
                    <input
                        type="text"
                        name="subject"
                        value={testForm.subject}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 p-2 rounded-lg bg-[#1A1C1F] border border-white/10"
                    />
                </label>

                {/* Duration */}
                <label className="block mb-3">
                    <span className="text-sm text-gray-300">Duration (minutes)</span>
                    <input
                        type="number"
                        name="duration"
                        value={testForm.duration}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 p-2 rounded-lg bg-[#1A1C1F] border border-white/10"
                    />
                </label>

                {/* Total Marks */}
                <label className="block mb-4">
                    <span className="text-sm text-gray-300">Total Marks</span>
                    <input
                        type="number"
                        name="totalMarks"
                        value={testForm.totalMarks}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 p-2 rounded-lg bg-[#1A1C1F] border border-white/10"
                    />
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-cyan-600 text-black font-semibold shadow hover:bg-cyan-500 transition"
                >
                    {loading ? "Creating..." : "Create Test"}
                </button>

                {/* ADD QUESTION BUTTON */}
                <button
                    type="button"
                    className="mt-4 w-full py-3 rounded-xl bg-green-600 text-black font-semibold shadow hover:bg-green-500 transition"
                    // onClick={}
                >
                    + Add Questions
                </button>
            </form>
        </div>
    )
}

export default Create
