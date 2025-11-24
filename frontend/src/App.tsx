import { Routes, Route } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import AdminPage from "./pages/AdminPage"
import SchoolPage from "./pages/SchoolPage"
import TeacherPage from "./pages/TeacherPage"
import { ProtectedRoute } from "./components/ProtectRoute"


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
        <Route 
          path="/teacher/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherPage/>
            </ProtectedRoute>
        } />

      </Routes>
    </div>
  )
}

export default App
