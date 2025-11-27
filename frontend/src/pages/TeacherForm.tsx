import CreateStudentForm from "../components/CreateStudentForm";

const TeacherForm = () => {
  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex items-center justify-center p-4">
      <CreateStudentForm 
        role="teacher" 
        apiUrl="http://localhost:8000/api/student/teacher/create" 
      />
    </div>
  );
};

export default TeacherForm;