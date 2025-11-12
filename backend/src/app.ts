import express from 'express'
import cors from 'cors'
import authRoutes from "./routes/user.route.js"

const app = express();

// middleware 
app.use(cors({}));
app.use(express.json());

// routes
app.use("/api/auth",authRoutes);


export { app }