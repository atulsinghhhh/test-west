import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthProvider"
import axios from "axios"

export interface ITeacher {
    _id?: string
    name: string
    email: string
    password: string
    gradeId: string
    gradeName?: string
    questionSchoolLimit: number,
    paperSchoolLimit: number
    paperSchoolCount?: number,
    questionSchoolCount?: number,
}


function CreateTeacher() {
    const { baseurl } = useAuth();
    const [teacherData, setTeacherData] = useState<ITeacher>({
        name: "",
        email: "",
        gradeId: "",
        password: "",
        questionSchoolLimit: 0,
        paperSchoolLimit: 0
    });
    const [message, setMessage] = useState<String | null>("");
    const [error, setError] = useState<String | null>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [grades, setGrades] = useState<{ _id: string; gradeName: string }[]>([]);
    const [gradeError, setGradeError] = useState("");

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await axios.get(`${baseurl}/school/grade`, {
                    withCredentials: true
                });
                setGrades(response.data.grades || []);
            } catch (err) {
                console.error(err);
                setGradeError("Failed to fetch grades");
            }
        };
        fetchGrades();
    }, [baseurl]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setTeacherData((prev) => ({
            ...prev,
            [name]: name === "questionSchoolLimit" || name === "paperSchoolLimit"
                ? Number(value)
                : value
        }));
    }

    const createTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);
        try {
            await axios.post(`${baseurl}/school/add`, teacherData, {
                withCredentials: true
            });
            setMessage("Teacher created successfully !")
            setTeacherData({
                name: "",
                email: "",
                password: "",
                gradeId: "",
                questionSchoolLimit: 0,
                paperSchoolLimit: 0
            })
        } catch (error) {
            setError("failed to created a new teacher");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full min-h-full p-8 flex justify-center items-start">
            <div className="w-full max-w-3xl bg-card p-8 rounded-xl border border-admin-border shadow-lg">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Create New Teacher
                </h2>
                {message && (
                    <p className="mb-4 text-sm p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="mb-4 text-sm p-3 rounded-lg bg-red-400 text-destructive border border-destructive/20">
                        {error}
                    </p>
                )}

                <form onSubmit={createTeacher}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-foreground font-medium ">
                            Teacher name
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={teacherData.name}
                            onChange={handleChange}
                            placeholder="Enter school name"
                            className="w-full mt-4 bg-input border border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-foreground font-medium ">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={teacherData.email}
                            onChange={handleChange}
                            placeholder="Enter school name"
                            className="w-full mt-4 bg-input border border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-foreground font-medium ">
                            Password
                        </label>
                        <input
                            id="name"
                            type="password"
                            name="password"
                            value={teacherData.password}
                            onChange={handleChange}
                            placeholder="Enter email"
                            className="w-full mt-4 bg-input border border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="gradeId" className="text-foreground font-medium ">
                            Grade
                        </label>
                        <select
                            id="gradeId"
                            name="gradeId"
                            value={teacherData.gradeId}
                            onChange={handleChange}
                            className="w-full mt-4 bg-input border border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            required
                        >
                            <option value="">Select grade</option>
                            {grades.map((grade) => (
                                <option key={grade._id} value={grade._id}>
                                    {grade.gradeName}
                                </option>
                            ))}
                        </select>
                        {gradeError && (
                            <p className="text-sm text-red-500">{gradeError}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="questionSchoolLimit" className="text-foreground font-medium">
                            Question Limit
                        </label>
                        <input
                            id="questionSchoolLimit"
                            type="number"
                            name="questionSchoolLimit"
                            value={teacherData.questionSchoolLimit}
                            onChange={handleChange}
                            placeholder="Enter question limit"
                            className="w-full bg-input border mt-4 border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="paperSchoolLimit" className="text-foreground font-medium">
                            paper Limit
                        </label>
                        <input
                            id="paperSchoolLimit"
                            type="number"
                            name="paperSchoolLimit"
                            value={teacherData.paperSchoolLimit}
                            onChange={handleChange}
                            placeholder="Enter question limit"
                            className="w-full bg-input border mt-4 border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>

                    <div className="md:col-span-2 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition disabled:bg-muted"
                        >
                            {loading ? "Creating..." : "Create School"}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    )
}

export default CreateTeacher
