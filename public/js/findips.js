var firstIp =new Array();
var secondIpFail =new Array();

document.getElementById("bsround").style.display="none";
document.getElementById("btround").style.display="none";


const valideIp=function(textip){
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(textip))
  {
      return (true)
  }
  return (false)
}

const groupBy=function(arr, criteria) {
  const newObj = arr.reduce(function (acc, currentValue) {
      if (!acc[currentValue[criteria]]) {
        acc[currentValue[criteria]] = [];
      }
      acc[currentValue[criteria]].push(currentValue);
      return acc;
    }, {});
    return newObj
}
function valideData(){
  const fip=document.getElementById('tipi');
  const sip=document.getElementById('tipf');
  if(valideIp(fip.value)==true){
      const arrIp1=fip.value.split('.')
      if(valideIp(sip.value)==true){
        const arrIp2=sip.value.split('.')
        const valIni=arrIp1[3]
        const valFin=arrIp2[3]
        const baseIp=arrIp1[0]+'.'+ arrIp1[1]+'.'+arrIp1[2]+'.'
        borraBoton('dbbuttons');
        document.getElementById("bsround").style.display="none"
        document.getElementById("btround").style.display="none"
        firstIp.length=0;
        secondIpFail.length=0;
        if (valIni<valFin){
          for(let i=valIni;i<=valFin;i++){
            creaBoton('dbbuttons',baseIp+i,i)
          }
        }
        return true
      }
     return false
  }
  return false
}

function loadRanges(){
  getRanges()
  .then((ranges)=>{
    const rangesGroup=groupBy(ranges.data,'name');
    const selectra=document.getElementById('srange')
    for (let name in rangesGroup){
      let optgroup=document.createElement("optgroup");
      optgroup.label=name;
      for(let i=0; i < rangesGroup[name].length; i++){ 
          let option = document.createElement("option");
          option.setAttribute("value", rangesGroup[name][i]['ipini'] + '-' + rangesGroup[name][i]['ipfin']);
          option.innerHTML=rangesGroup[name][i]['subname'] + '-' + rangesGroup[name][i]['ipini'] + '-' + rangesGroup[name][i]['ipfin'];
          optgroup.appendChild(option)
        }
        selectra.appendChild(optgroup);

    }
  })
  .catch((err)=>{
    console.log(err)
  })
}


function creaBoton(div,ip,pos){
  const button = document.createElement('button'); 
  button.type = 'button'; 
  button.name= 'bip'; 
  button.value=ip;
  button.innerText = pos; 
  divbutton=document.getElementById(div);
  divbutton.appendChild(button); 
}

function borraBoton(div){
  divbutton=document.getElementById(div);
  while( divbutton.hasChildNodes() ){
    divbutton.removeChild(divbutton.lastChild);
  }
}

function escribeLog(Text,txtId){
  const txtArea=document.getElementById(txtId);
  txtArea.value=txtArea.value + '\r\n' + Text
  txtArea.scrollTop=txtArea.scrollHeight;
}

function escribeLogReplace(textIni,textFin,txtId){
  const txtArea=document.getElementById(txtId);
  txtArea.value=txtArea.value.replace(textIni,textFin);
}

function putDataText(value){
  const rangesIps=value.split('-')
  const txtini=document.getElementById('tipi')
  const txtfin=document.getElementById('tipf')
  txtini.value=rangesIps[0];
  txtfin.value=rangesIps[1];
}

function callIpUrl(ip){
  return new Promise((resolve,reject)=>{
    const url = 'http://localhost:3000/device?ip='+ ip
    const http = new XMLHttpRequest()
    http.open("GET", url)
    escribeLog(ip + '....','process',)
    http.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var resultado = JSON.parse(this.responseText)
            escribeLogReplace(ip + '....','','process')
            if (resultado['status']==200){
              escribeLog(ip + '....OK','process')
              resolve(true)
            }else if (resultado['status']==400){
              escribeLog(ip + '....FAIL','process')
              reject()
            }
        }
    }
    http.send()
  })
}

function getRanges(){
  return new Promise((resolve,reject)=>{
    const url = 'http://localhost:3000/ranges'
    const http = new XMLHttpRequest()
    http.open("GET", url)
    http.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var resultado = JSON.parse(this.responseText)
            resolve(resultado)
        }else if(this.readyState == 4 && this.status != 200){
          reject('No data Ranges');
        }
    }
    http.send()
  })
}

function firstRound(){
    if (valideData()==true){
      const buttons = document.getElementsByName('bip');
      buttons.forEach((element,index) => {
        callIpUrl(element.value)
        .then((data)=>{
          element.className="ipok"
          firstIp.push(element.value)
        })
        .catch((err)=>{
          element.className="ipfail"
        })
        .finally(()=>{
            if (buttons.length==index+1) document.getElementById("bsround").style.display="";
        })
      });
  
    }
}

function secondRound(){
  const buttons = document.getElementsByName('bip');
  let countArr=0;
  buttons.forEach((element)=> {
    const evalFirstOnline=firstIp.includes(element.value)
    if(evalFirstOnline){
      escribeLog(element.value + '....','offline')
      callIpUrl(element.value)
      .then((data)=>{
        escribeLogReplace(element.value + '....','','offline')
        element.className="ipok"
      })
      .catch((err)=>{
        element.className="ipfailsecond"
        secondIpFail.push(element.value);
        escribeLogReplace(element.value + '....','','offline')
        escribeLog(element.value + '....FAIL','offline')
      })
      .finally(()=>{
        countArr++;
        if (firstIp.length==countArr) document.getElementById("btround").style.display="";
      })
    }
  });
}


//All devices should be online in this moment
function thirdRound(){
  const buttons = document.getElementsByName('bip');
  let countArr=0;
  buttons.forEach((element)=> {
    const evalSecondOnline=secondIpFail.includes(element.value)
    if(evalSecondOnline){
      escribeLog(element.value + '....','notrecover')
      callIpUrl(element.value)
      .then((data)=>{
        element.className="ipok"
        escribeLogReplace(element.value + '....',element.value + '....OK','notrecover')
      })
      .catch((err)=>{
        element.className="ipfailthird"
        escribeLogReplace(element.value + '....','','notrecover')
        escribeLog(element.value + '....FAIL','notrecover')
      })
      .finally(()=>{
        countArr++;
        if (secondIpFail.length==countArr) document.getElementById("btround").style.display="";
      })
    }
  });
}


window.onload = loadRanges;

