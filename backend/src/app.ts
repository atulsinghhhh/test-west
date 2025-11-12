import express from 'express'

const app = express();

app.get("/",(req,res)=>{
    res.send("i make the test series where application give test of different");
})

app.listen(3000,()=>{
    console.log(`server is running on the port ${3000}`);
})