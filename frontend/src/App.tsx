import { Routes, Route } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import AdminPage from "./pages/AdminPage"
import SchoolPage from "./pages/SchoolPage"


function App() {
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminPage />} />
        <Route path="/school" element={<SchoolPage />} />
      </Routes>
    </div>
  )
}

export default App
