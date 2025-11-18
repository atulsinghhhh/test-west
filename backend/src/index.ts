import { app } from './app.js'
import dotenv from "dotenv"
import { dbConnect } from './lib/db.js';


dotenv.config();

const PORT = process.env.PORT || 3000;

dbConnect()
    .then(()=>{
        app.listen(PORT,()=>{
            console.log(`Server is running on the port ${PORT}`);
        });
    })
    .catch((error)=>{
        console.log(`Error connecting to the database: ${error}`);
    })