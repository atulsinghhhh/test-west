import { Routes, Route } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import AdminPage from "./pages/AdminPage"
import SchoolPage from "./pages/SchoolPage"
import TeacherPage from "./pages/TeacherPage"
// import StudentPage from "./pages/StudentPage"
import { ProtectedRoute } from "./components/ProtectRoute"
import SchoolForm from "./pages/SchoolForm"
import TeacherForm from "./pages/TeacherForm"
import StudentLayout from "./components/student/StudentLayout"
import StudentDashboard from "./components/student/StudentDashboard"
import StudentPapers from "./components/student/StudentPapers"
import StudentQuestions from "./components/student/StudentQuestions"
import PaperAttempt from "./components/student/PaperAttempt"
import BatchAttempt from "./components/student/BatchAttempt"
import BatchResult from "./components/student/BatchResult"
import PaperResult from "./components/student/PaperResult"


function App() {
  return (
    <div>
      <Routes>
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
        <Route 
          path="/teacher/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherPage/>
            </ProtectedRoute>
        } />
        <Route path="/teacher/create/" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherForm/>
          </ProtectedRoute>
        }/>
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="papers" element={<StudentPapers />} />
          <Route path="paper/:paperId" element={<PaperAttempt />} />
          <Route path="practice" element={<StudentQuestions />} />
          <Route path="practice/:batchId" element={<BatchAttempt />} />
          <Route path="practice/result/:batchId" element={<BatchResult />} />
          <Route path="paper/result/:paperId" element={<PaperResult />} />
        </Route>

      </Routes>
    </div>
  )
}

export default App
