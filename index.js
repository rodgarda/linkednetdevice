const express=require("express");
const path=require("path")
const app=express();
const Port=3000;
var ping = require('ping');
const ranges=require('./public/data/ranges')


var publicPath = path.resolve(__dirname, 'public'); 
// Para que los archivos estaticos queden disponibles.
app.use(express.static(publicPath));
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname) + "/public/index.html") 
})

app.get("/device/",(req,res)=>{
    const {ip}=req.query;
    
    console.log("Evaluating " + ip);
    ping.sys.probe(ip, function(isAlive){
        alive = isAlive ? true : false;

        if (alive==true){
            res.send(JSON.stringify({ status: 200 }));
        }else{
            res.send(JSON.stringify({ status: 400  }));
        }
    })
})

app.get("/ranges",(req,res)=>{
    res.send(JSON.stringify({ data:ranges.rangeIp }));
    
})
app.listen(Port,()=>{
    console.log("Server Running on Port " + Port)
})

