import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthProvider";
import axios from "axios";

export interface ITeacher {
    _id?: string;
    name: string;
    email: string;
    grade: string;
    school: string;

    questionLimit: number;     
    paperLimit: number;         

    questionCount: number;      
    paperCount: number;         
}


function ViewTeacher() {
    const { baseurl } = useAuth();
    const [ teachers,setTeachers] = useState<ITeacher[]>([]);
    const [ message, setMessage ] = useState<String | null>("");
    const [ error, setError ] = useState<String | null> ("");

    useEffect(()=>{
        const viewTeachers = async()=>{
            setMessage("");
            setError("");
            try {
                const response = await axios.get(`${baseurl}/school/`,{withCredentials: true});
                console.log("View all teachers: ",response.data.teachers);
                setMessage("Successfully fetch teacher details")
                setTeachers(response.data.teachers);
            } catch (error) {
                setError("failed to fetch teacher");
            }
        }

        viewTeachers();
    },[])
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-foreground tracking-tight">
                All Teachers
            </h1>

            <div className="rounded-xl border border-admin-border bg-card overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-admin-panel border-b border-admin-border">
                    <tr>
                        <th className="p-4 text-left text-sm font-semibold text-foreground tracking-wide">Name</th>
                        <th className="p-4 text-left text-sm font-semibold text-foreground tracking-wide">Email</th>
                        <th className="p-4 text-left text-sm font-semibold text-foreground tracking-wide">Grade</th>
                        <th className="p-4 text-left text-sm font-semibold text-foreground tracking-wide">Questions</th>
                        <th className="p-4 text-left text-sm font-semibold text-foreground tracking-wide">Papers</th>
                    </tr>
                    </thead>
                    <tbody>
                    {teachers.length > 0 ? (
                        teachers.map((teacher) => (
                        <tr
                            key={teacher._id}
                            className="border-t border-admin-border hover:bg-admin-hover transition-colors"
                        >
                            <td className="p-4 text-foreground font-medium">{teacher.name}</td>
                            <td className="p-4 text-muted-foreground">{teacher.email}</td>
                            <td className="p-4 text-muted-foreground">{teacher.grade}</td>
                            <td className="p-4 text-foreground">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/20">
                                {teacher.questionCount}/{teacher.questionLimit}
                            </span>
                            </td>

                            <td className="p-4 text-foreground">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/20">
                                {teacher.paperCount}/{teacher.paperLimit}
                            </span>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                            No teachers found.
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>

      {/* Messages */}
            {message && (
                <p className="text-primary mt-4 text-sm">{message}</p>
            )}
            {error && (
                <p className="text-red-500 mt-4 text-sm">{error}</p>
            )}
        </div>
    )
}

export default ViewTeacher
