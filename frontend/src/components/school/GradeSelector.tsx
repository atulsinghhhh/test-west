import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import { Plus, X } from "lucide-react";

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
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGradeName, setNewGradeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGrades = useCallback(async () => {
    try {
      setError("");
      const response = await axios.get(`${baseurl}/school/grade`, {
        withCredentials: true,
      });
      setGrades(response.data.grades || []);
    } catch {
      setError("Failed to fetch grades");
    }
  }, [baseurl]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleGradeSelect = (value: string) => {
    setError("");
    setSuccess("");
    onGradeSelect(value);
  };

  const toggleAddForm = () => {
    setShowAddForm((prev) => !prev);
    setNewGradeName("");
    setError("");
    setSuccess("");
  };

  const addGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeName.trim()) {
      setError("Grade name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const response = await axios.post(
        `${baseurl}/school/grade`,
        { gradeName: newGradeName.trim() },
        { withCredentials: true }
      );

      const createdGrade: Grade | undefined = response.data?.newGrade;
      setSuccess("Grade created successfully");
      setNewGradeName("");
      setShowAddForm(false);
      await fetchGrades();

      if (createdGrade?._id) {
        onGradeSelect(createdGrade._id);
      }
    } catch {
      setError("Failed to create grade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2 gap-2">
        <label className="text-muted-foreground font-medium">Grade</label>
        <button
          type="button"
          onClick={toggleAddForm}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
        >
          {showAddForm ? (
            <>
              <X size={14} />
              Close
            </>
          ) : (
            <>
              <Plus size={14} />
              Add Grade
            </>
          )}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-2 bg-red-500/10 px-3 py-2 rounded">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-2 bg-green-500/10 px-3 py-2 rounded">{success}</p>}

      {showAddForm && (
        <form onSubmit={addGrade} className="flex gap-2 mb-3">
          <input
            type="text"
            value={newGradeName}
            onChange={(e) => setNewGradeName(e.target.value)}
            placeholder="Enter grade name"
            className="flex-1 bg-background border border-input text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:bg-muted"
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </form>
      )}

      <select
        value={selectedGradeId}
        onChange={(e) => handleGradeSelect(e.target.value)}
        className="w-full bg-card border border-admin-border p-3 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Choose a grade</option>
        {grades.map((g) => (
          <option key={g._id} value={g._id}>
            {g.gradeName}
          </option>
        ))}
      </select>

      {grades.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground mt-2">
          No grades yet. Create a grade to start adding subjects.
        </p>
      )}
    </div>
  );
}
