const express=require("express");
const app=express();

app.get("/" ,(req, res)=>{
    res.send({status: "Started"})

})

app.listen(5001,()=>{
    console.log("node server started")
})