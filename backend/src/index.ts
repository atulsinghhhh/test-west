import { app } from './app.js'
import dotenv from "dotenv"
import { dbConnect } from './lib/db.js';


dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

dbConnect()
    .then(()=>{
        app.listen(PORT, '0.0.0.0', ()=>{
            console.log(`Server is running on the port ${PORT}`);
        });
    })
    .catch((error)=>{
        console.log(`Error connecting to the database: ${error}`);
    })