import { Routes, Route } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import AdminPage from "./pages/AdminPage"
import SchoolPage from "./pages/SchoolPage"
import TeacherPage from "./pages/TeacherPage"


function App() {
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminPage />} />
        <Route path="/school" element={<SchoolPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
      </Routes>
    </div>
  )
}

export default App
