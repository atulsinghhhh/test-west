import express from 'express'

import cors from 'cors'
import cookieParser from "cookie-parser";
import authRoutes from "./routes/user.route.js"
import TeacherRoutes  from "./routes/teacher.route.js"
import StudentRoutes from "./routes/student.route.js"
import AdminRoutes from "./routes/admin.route.js"
import SchoolRoutes from "./routes/school.route.js"
import StandaloneStudentRoutes from "./routes/standaloneStudent.route.js"

const app = express();

// middleware 
app.use(cors(
    {
        origin: process.env.Frontend_URL || 'http://localhost:5173',
        credentials: true,
    }
));
app.use(express.json());
app.use(cookieParser());


// routes
app.use("/api/auth",authRoutes);
app.use("/api/teacher",TeacherRoutes);
app.use("/api/student",StudentRoutes);
app.use("/api/admin",AdminRoutes);
app.use("/api/school",SchoolRoutes);
app.use("/api/standalone",StandaloneStudentRoutes);



export { app }
