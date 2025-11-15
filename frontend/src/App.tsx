import { Routes,Route } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import { Dashboard } from "./pages/teacher/Dashboard"
import Create from "./pages/teacher/Create"

function App() {
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={<Dashboard/>} />
        <Route path="/create" element={<Create/>} />
      </Routes>
    </div>
  )
}

export default App
