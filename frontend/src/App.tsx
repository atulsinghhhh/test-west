import { Routes, Route, Navigate } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import AdminPage from "./pages/AdminPage"
import SchoolPage from "./pages/SchoolPage"
import { ProtectedRoute } from "./components/ProtectRoute"
import SchoolForm from "./pages/SchoolForm"
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
import StudentForm from "./pages/StudentForm"

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
          <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          <Route 
            path="/school/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['school']}>
                <SchoolPage/>
              </ProtectedRoute>
          } />
          <Route path="/school/create/" element={
            <ProtectedRoute allowedRoles={['school']}>
              <SchoolForm/>
            </ProtectedRoute>
          }/>
          <Route path="/school/create-student" element={
            <ProtectedRoute allowedRoles={['school']}>
              <StudentForm/>
            </ProtectedRoute>
          }/>

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
