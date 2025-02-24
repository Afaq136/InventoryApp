const express=require("express");
const app=express();
const mongoose= require("mongoose");

const mongoUrl="mongodb+srv://invo_user:invo_user_password@cluster0.47a10.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(mongoUrl).then(()=>{
    console.log("Mongodb Connected");
})
.catch((e)=>{
    console.log(e);
})

app.get("/" ,(req, res)=>{
    res.send({status: "Started"})

})

app.listen(5001,()=>{
    console.log("node server started")
})