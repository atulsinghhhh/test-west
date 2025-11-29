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
    <div className="min-h-screen bg-admin-bg text-foreground p-6 space-y-6">

      {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
      {message && <p className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg">{message}</p>}

      <section className="bg-card border border-admin-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Generate Question Paper</h2>
        
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">School Name</label>
              <input
                type="text"
                value={schoolName}
                readOnly
                className="w-full bg-admin-panel border border-admin-border rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Subject</label>
              <select
                className="w-full bg-admin-panel border border-admin-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
              >
                <option value="">Select subject</option>
                {subject.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Chapter</label>
              <select
                className="w-full bg-admin-panel border border-admin-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                disabled={!subjectId}
              >
                <option value="">Select chapter</option>
                {chapter.map((ch) => (
                  <option key={ch._id} value={ch._id}>
                    {ch.chapterName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Duration (minutes)</label>
              <input
                type="number"
                className="w-full bg-admin-panel border border-admin-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={paperData.duration}
                onChange={(e) =>
                  setPaperData({ ...paperData, duration: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Total Questions</label>
              <input
                type="number"
                className="w-full bg-admin-panel border border-admin-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={paperData.totalQuestion}
                onChange={(e) =>
                  setPaperData({
                    ...paperData,
                    totalQuestion: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Total Marks</label>
              <input
                type="number"
                className="w-full bg-admin-panel border border-admin-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={paperData.totalMarks}
                onChange={(e) =>
                  setPaperData({ ...paperData, totalMarks: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Paper Type</label>
              <select
                className="w-full bg-admin-panel border border-admin-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={paperData.paperType}
                onChange={(e) =>
                  setPaperData({ ...paperData, paperType: e.target.value })
                }
              >
                <option value="">Select type</option>
                <option value="chapterwise">Chapterwise</option>
                <option value="subjectwise">Subjectwise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Test Type</label>
              <select
                className="w-full bg-admin-panel border border-admin-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={paperData.testType}
                onChange={(e) =>
                  setPaperData({ ...paperData, testType: e.target.value })
                }
              >
                <option value="">Select test type</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Mid Term">Mid Term</option>
                <option value="Final">Final</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Instructions</label>
            <textarea
              className="w-full bg-admin-panel border border-admin-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              value={paperData.Instruction}
              onChange={(e) =>
                setPaperData({ ...paperData, Instruction: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold shadow 
                      hover:bg-green-600 transition disabled:opacity-40"
            >
              {loading ? "Generating..." : "Generate Paper"}
            </button>
            <button
              type="button"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold shadow 
                      hover:bg-green-600 transition"
              onClick={handleDownload}
            >
              Download PDF
            </button>
          </div>
        </form>
      </section>
    </div>
);

}

export default PaperGenerator

