import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser";
import authRoutes from "./routes/user.route.js"
import TeacherRoutes  from "./routes/teacher.route.js"
import StudentRoutes from "./routes/student.route.js"

const app = express();

// middleware 
app.use(cors({}));
app.use(express.json());
app.use(cookieParser());


// routes
app.use("/api/auth",authRoutes);
app.use("/api/teacher",TeacherRoutes);
app.use("/api/student",StudentRoutes);


export { app }