import React from 'react'
import CreateStudentForm from "../components/CreateStudentForm";

const SchoolForm = () => {
  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex items-center justify-center p-4">
      <CreateStudentForm 
        role="school" 
        apiUrl="http://localhost:8000/api/student/school/create" 
      />
    </div>
  );
};

export default SchoolForm;