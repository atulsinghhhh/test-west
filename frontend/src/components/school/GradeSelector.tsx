import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

interface Grade {
  _id: string;
  gradeName: string;
}

interface GradeSectionProps {
  onGradeSelect: (gradeId: string) => void;
  selectedGradeId: string;
}

export default function GradeSection({ onGradeSelect, selectedGradeId }: GradeSectionProps) {
  const { baseurl } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`${baseurl}/school/grade`, {
        withCredentials: true,
      });
      setGrades(response.data.grades || []);
    } catch {
      setError("Failed to fetch grades");
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 text-muted-foreground font-medium">Select Grade</label>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <select
        value={selectedGradeId}
        onChange={(e) => onGradeSelect(e.target.value)}
        className="w-full bg-card border border-admin-border p-3 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Choose a grade</option>
        {grades.map((g) => (
          <option key={g._id} value={g._id}>
            {g.gradeName}
          </option>
        ))}
      </select>
    </div>
  );
}
