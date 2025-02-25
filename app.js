const express=require("express");
const app=express();
const mongoose= require("mongoose");

const mongoUrl="mongodb+srv://invo_user:invo_user_password@cluster0.47a10.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(mongoUrl).then(()=>{
    console.log("Mongodb Connected");
})
.catch((e)=>{
    console.log(e);
});
require('./UserDetails')

const User=mongoose.model("Users")


app.get("/" ,(req, res)=>{
    res.send({status: "Started"})

})

app.post('/register',async(req, res)=>{
    const {email, password} = req.body;

    const oldUser= await User.findOne({email:email});
    if(oldUser){
        return res.send({status:"error", data: "User Already Exists"})
    }
    try{
        await User.create({
            email:email,
            password:password
        });
        res.send({status:"ok", data: "User Created"})
    } catch (error){
        res.send({status:"error", data: "Error Creating User"})
    }

})

app.listen(5001,()=>{
    console.log("node server started")
})