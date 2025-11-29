import { Routes, Route, Navigate } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import { ProtectedRoute } from "./components/ProtectRoute"
// import SchoolForm from "./pages/SchoolForm"
import StudentLayout from "./components/student/StudentLayout"
import StudentDashboard from "./components/student/StudentDashboard"
import StudentPapers from "./components/student/StudentPapers"
import StudentQuestions from "./components/student/StudentQuestions"
import PaperAttempt from "./components/student/PaperAttempt"
import BatchAttempt from "./components/student/BatchAttempt"
import BatchResult from "./components/student/BatchResult"
import PaperResult from "./components/student/PaperResult"
import StudentPractice from "./components/student/StudentPractice"
import PracticeSession from "./components/student/PracticeSession"
import LandingPage from "./pages/LandingPage"
import { ThemeProvider } from "./context/ThemeContext"
// 
// Admin Components
import AdminLayout from "./components/Admin/AdminLayout"
import CreateSchool from "./components/Admin/CreateSchool"
import ViewSchool from "./components/Admin/ViewSchool"
import Stats from "./components/Admin/Stats"

// School Components
import SchoolLayout from "./components/school/SchoolLayout"
import CreateTeacher from "./components/school/CreateTeacher"
import ViewTeacher from "./components/school/ViewTeacher"
import ManageSubject from "./components/school/ManageSubject"
import SchoolAnalytics from "./components/school/SchoolAnalytics"

import SchoolStudents from "./components/school/SchoolStudents"
import SchoolStudentForm from "./components/school/SchoolStudentForm"

// Teacher Components
import TeacherLayout from "./components/teacher/TeacherLayout"
import TeacherDashboard from "./components/teacher/TeacherDashboard"
import Question from "./components/teacher/Question"
import PaperGenerator from "./components/teacher/PaperGenerator"
import ContentManager from "./components/teacher/ContentManager"
import TeacherAnalytics from "./components/teacher/TeacherAnalytics"
import TeacherStudents from "./components/teacher/TeacherStudents"
import TeacherStudentForm from "./components/teacher/TeacherStudentForm"


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CreateSchool />} />
            <Route path="schools" element={<ViewSchool />} />
            <Route path="analytics" element={<Stats />} />
          </Route>

          {/* School Routes */}
          <Route path="/school" element={
            <ProtectedRoute allowedRoles={['school']}>
              <SchoolLayout/>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="create-teacher" replace />} />
            <Route path="create-teacher" element={<CreateTeacher />} />
            <Route path="view-teachers" element={<ViewTeacher />} />
            <Route path="create-student" element={<SchoolStudentForm />} />
            <Route path="students" element={<SchoolStudents />} />
            <Route path="subjects" element={<ManageSubject />} />
            <Route path="analytics" element={<SchoolAnalytics />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="create-student" element={<TeacherStudentForm />} />
            <Route path="questions" element={<Question />} />
            <Route path="papers" element={<PaperGenerator />} />
            <Route path="publish" element={<ContentManager />} />
            <Route path="submissions" element={<TeacherAnalytics />} />
          </Route>
          

          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="papers" element={<StudentPapers />} />
            <Route path="paper/:paperId" element={<PaperAttempt />} />
            
            {/* Practice & Questions */}
            <Route path="practice" element={<StudentPractice />} />
            <Route path="practice/session" element={<PracticeSession />} />
            <Route path="questions" element={<StudentQuestions />} />
            
            <Route path="practice/:batchId" element={<BatchAttempt />} />
            <Route path="practice/result/:batchId" element={<BatchResult />} />
            <Route path="paper/result/:paperId" element={<PaperResult />} />
          </Route>

        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
