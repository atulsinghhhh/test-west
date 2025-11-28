import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthProvider"


interface Subject {
    _id: string,
    subjectName: string
}

interface Chapter{
    _id: string,
    chapterName: string
}


interface GeneratedPaper{
    duration: number,
    totalQuestion: number,
    totalMarks: number
    Instruction: string
    paperType: string
    testType: string,
    schoolId:{
      name: string
    }
}

function PaperGenerator() {

  const { baseurl } = useAuth();

  const [subject, setSubject] = useState<Subject[]>([]);
  const [subjectId,setSubjectId] = useState<string>("");
  const [chapter, setChapter] = useState<Chapter[]>([]);
  const [chapterId,setChapterId] = useState<string>("");
  const [schoolName, setSchoolName] = useState<string>("");

  const [paperData,setPaperData] = useState<GeneratedPaper>({
    duration: 0,
    totalQuestion: 0,
    totalMarks: 0,
    Instruction: "",
    paperType: "",
    testType: "",
    schoolId: {
      name: ""
    }
  })
  const [paperId,setPaperId] = useState<string>("");
  const [loading,setLoading] = useState<boolean>(false);
  const [error,setError] = useState<string>("");
  const [message,setMessage] = useState<string>("");


  useEffect(()=>{
    const fetchSubjects = async() =>{
      try {
        const response = await axios.get(`${baseurl}/teacher/subjects`, {
              withCredentials: true
        });
        setSubject(response.data.subjects || []);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch subjects");
      }
    }
    const fetchTeacher = async () => {
      try {
        const response = await axios.get(`${baseurl}/teacher/school/me`, {
          withCredentials: true,
        });

        setSchoolName(response.data.teacher.school.name);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTeacher();
    fetchSubjects();
  },[]);
  const fetchChapters = async(id: string) =>{
      try {
        const response = await axios.get(`${baseurl}/teacher/subjects/${id}/chapters`, {
          withCredentials: true
        });
        setChapter(response.data.chapters || []);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch chapters");
      }
    }

  const handleSubjectChange = (value: string) =>{
    setSubjectId(value);
    setChapterId("");
    setChapter([]);

    if(value){
      fetchChapters(value)
    }
  }

  const handleGenerate = async(e: React.FormEvent)=>{
    e.preventDefault();
    setError("");
    setMessage("");

    if(!subjectId || !chapterId){
      setError("Select subject, chapter");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${baseurl}/teacher/paper/generate`,{
        duration: paperData.duration,
        totalMarks: paperData.totalMarks,
        totalQuestion: paperData.totalQuestion,
        Instructions: paperData.Instruction,
        paperType: paperData.paperType,
        testType: paperData.testType,
        subjectId,
        chapterId,
      },{
        withCredentials: true
      });
      console.log("Generate Paper Response:", response.data);
      console.log(response.data.schoolId);
      setPaperData((prev) => ({
        ...prev,
        schoolId: response.data.schoolId
      }));
      setPaperId(response.data.paperId);
      setMessage("Paper generated successfully!");
      console.log("hello world");
      console.log("Generated School Name:", response.data.schoolId?.name);
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to generate paper");
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async () =>{
    if(!paperId){
      alert("No paperId available");
      return;
    }

    const url = `${baseurl}/teacher/paper/download/${paperId}`;
    const link = document.createElement("a");
    link.href = url;

    link.setAttribute("download" , `Paper_${paperId}.pdf`);
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
  <div className="max-w-4xl mx-auto p-6 rounded-lg bg-admin-bg text-foreground">
      <h2 className="text-2xl font-bold mb-4">Generate Question Paper</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {message && <p className="text-green-500 mb-2">{message}</p>}

      
      <form
        onSubmit={handleGenerate}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
          <div className="md:col-span-2">
        <label className="block mb-1 text-sm">School Name</label>
        <input
          type="text"
          value={schoolName}
          readOnly
          className="w-full p-2 rounded font-semibold bg-admin-panel text-foreground border border-admin-border cursor-not-allowed"
        />
      </div>

        {/* Subject */}
        <div>
          <label className="block mb-1 text-sm">Select Subject</label>
          <select
            className="w-full p-2 rounded bg-admin-panel text-foreground border border-admin-border"
            value={subjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subject.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.subjectName}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter */}
        <div>
          <label className="block mb-1 text-sm">Select Chapter</label>
          <select
            className="w-full p-2 rounded bg-admin-panel text-foreground border border-admin-border"
            value={chapterId}
            onChange={(e) => setChapterId(e.target.value)}
          >
            <option value="">Select Chapter</option>
            {chapter.map((ch) => (
              <option key={ch._id} value={ch._id}>
                {ch.chapterName}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block mb-1 text-sm">Duration (minutes)</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-admin-panel text-foreground border border-admin-border"
            value={paperData.duration}
            onChange={(e) =>
              setPaperData({ ...paperData, duration: Number(e.target.value) })
            }
          />
        </div>

        {/* Total Marks */}
        <div>
          <label className="block mb-1 text-sm">Total Marks</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-admin-panel text-foreground border border-admin-border"
            value={paperData.totalMarks}
            onChange={(e) =>
              setPaperData({ ...paperData, totalMarks: Number(e.target.value) })
            }
          />
        </div>

        {/* Total Questions */}
        <div>
          <label className="block mb-1 text-sm">Total Questions</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-admin-panel text-foreground border border-admin-border"
            value={paperData.totalQuestion}
            onChange={(e) =>
              setPaperData({
                ...paperData,
                totalQuestion: Number(e.target.value),
              })
            }
          />
        </div>

        {/* Instructions */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm">Instructions</label>
          <textarea
            className="w-full p-2 rounded bg-admin-panel text-foreground border border-admin-border"
            rows={3}
            value={paperData.Instruction}
            onChange={(e) =>
              setPaperData({ ...paperData, Instruction: e.target.value })
            }
          />
        </div>

        {/* Paper Type */}
        <div>
          <label className="block mb-1 text-sm">Paper Type</label>
          <select
            className="w-full p-2 rounded bg-admin-panel text-foreground border border-admin-border"
            value={paperData.paperType}
            onChange={(e) =>
              setPaperData({ ...paperData, paperType: e.target.value })
            }
          >
            <option value="">Select Type</option>
            <option value="chapterwise">Chapterwise</option>
            <option value="subjectwise">Subjectwise</option>
          </select>
        </div>

        {/* Test Type */}
        <div>
          <label className="block mb-1 text-sm">Test Type</label>
          <select
            className="w-full p-2 rounded bg-admin-panel text-foreground border border-admin-border"
            value={paperData.testType}
            onChange={(e) =>
              setPaperData({ ...paperData, testType: e.target.value })
            }
          >
            <option value="">Select Test Type</option>
            <option value="Unit Test">Unit Test</option>
            <option value="Mid Term">Mid Term</option>
            <option value="Final">Final</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded font-semibold bg-primary text-foreground hover:bg-green-600 transition-colors"
          >
            {loading ? "Generating..." : "Generate Paper"}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded font-semibold bg-admin-hover text-foreground hover:bg-admin-border transition-colors"
            onClick={handleDownload}
          >
            Download PDF
          </button>
        </div>
      </form>
    </div>
);

}

export default PaperGenerator

