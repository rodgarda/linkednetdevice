const express=require("express");
const path=require("path")
const app=express();
const Port=3000;
var tcpp = require('tcp-ping');


var publicPath = path.resolve(__dirname, 'public'); 
// Para que los archivos estaticos queden disponibles.
app.use(express.static(publicPath));
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname) + "/public/index.html") 
})
app.get("/device/",(req,res)=>{
    const {ip}=req.query;
    console.log(ip);
    tcpp.ping({ address: ip,attempts:3 }, function(err, data) {;
        let tot=0;
        data.results.forEach(element => {
            if (element.time!=undefined){
                //res.setHeader('Content-Type', 'application/json');
                tot++;    
            }
        });
        if (tot>1){
            res.send(JSON.stringify({ status: 200 }));
        }else{
            res.send(JSON.stringify({ status: 400  }));
        }
    });
})
app.listen(Port,()=>{
    console.log("Server Running on Port " + Port)
})

