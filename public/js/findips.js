var firstIp =new Array();
var secondIpFail =new Array();


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
  const dError=document.getElementById('derror');
  if(valideIp(fip.value)==true){
      const arrIp1=fip.value.split('.')
      if(valideIp(sip.value)==true){
          const arrIp2=sip.value.split('.')
          if(arrIp1[0]==arrIp2[0]&&arrIp1[1]==arrIp2[1]&&arrIp1[2]==arrIp2[2]){
            if(arrIp1[3]<arrIp2[3]){
            const valIni=arrIp1[3]
            const valFin=arrIp2[3]
            const baseIp=arrIp1[0]+'.'+ arrIp1[1]+'.'+arrIp1[2]+'.'
            deleteButtons('dbbuttons');
            prepareProcess();
            firstIp.length=0;
            secondIpFail.length=0;
            if (valIni<valFin){
              for(let i=valIni;i<=valFin;i++){
                addButtons('dbbuttons',baseIp+i,i)
              }
              document.getElementById("bfround").disabled=true;
            }
            return true
          }
          dError.innerHTML="The initial IP should be lower thar de second IP"
          return false
        }
        dError.innerHTML="Only can evaluate 255 hosts"
        return false
      }
      dError.innerHTML="the final Ip is not correct"
      return false
    }
    dError.innerHTML="the initial Ip is not correct"
    return false
}

function preparePage(){
  document.getElementById("bsround").style.display="none";
  document.getElementById("btround").style.display="none";
  document.getElementById("derror").style.display="none";
  document.getElementById("process").style.display="none";
  document.getElementById("offline").style.display="none";
  document.getElementById("notrecover").style.display="none";
  loadRanges();
}

function prepareProcess(){
  document.getElementById("bsround").style.display="none"
  document.getElementById("btround").style.display="none"
  document.getElementById("derror").style.display="none"
  document.getElementById("process").style.display="";
  document.getElementById("offline").style.display="";
  document.getElementById("notrecover").style.display="";
}

function loadRanges(){
  getRanges()
  .then((ranges)=>{
    const rangesGroup=groupBy(ranges.data,'name');
    const selectra=document.getElementById('srange')
    let option = document.createElement("option");
    option.setAttribute("value", '-');
    option.innerHTML='Select a Range';
    selectra.appendChild(option);
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


function addButtons(div,ip,pos){
  const button = document.createElement('button'); 
  button.type = 'button'; 
  button.name= 'bip'; 
  button.value=ip;
  button.innerText = pos; 
  divbutton=document.getElementById(div);
  divbutton.appendChild(button); 
}

function deleteButtons(div){
  divbutton=document.getElementById(div);
  while( divbutton.hasChildNodes() ){
    divbutton.removeChild(divbutton.lastChild);
  }
}

function writeLog(Text,txtId){
  const txtArea=document.getElementById(txtId);
  txtArea.value=txtArea.value + '\r\n' + Text
  txtArea.scrollTop=txtArea.scrollHeight;
}

function writeLogReplace(textIni,textFin,txtId){
  const txtArea=document.getElementById(txtId);
  txtArea.value=txtArea.value.replace(textIni,textFin);
  txtArea.value = txtArea.value.trim();
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
    writeLog(ip + '....','process',)
    http.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var resultado = JSON.parse(this.responseText)
            writeLogReplace(ip + '....','','process')
            if (resultado['status']==200){
              writeLog(ip + '....OK','process')
              resolve(true)
            }else if (resultado['status']==400){
              writeLog(ip + '....FAIL','process')
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
            if (buttons.length==index+1) {
              document.getElementById("bsround").style.display="";
              document.getElementById("bfround").disabled=false;
            }
        })
      });
    }else{
      document.getElementById("derror").style.display="";
    }
    
}

function secondRound(){
  const buttons = document.getElementsByName('bip');
  let countArr=0;
  writeLog('Evaluating 1 Round onlines..','offline')
  buttons.forEach((element)=> {
    const evalFirstOnline=firstIp.includes(element.value)
    if(evalFirstOnline){
      writeLog(element.value + '....','offline')
      callIpUrl(element.value)
      .then((data)=>{
         writeLogReplace(element.value + '....',element.value + '....OK','offline')
        element.className="ipok"
      })
      .catch((err)=>{
        element.className="ipfailsecond"
        secondIpFail.push(element.value);
        writeLogReplace(element.value + '....','','offline')
        writeLog(element.value + '....FAIL','offline')
      })
      .finally(()=>{
        countArr++;
        if (firstIp.length==countArr) document.getElementById("btround").style.display="";
      })
    }
  });
  writeLog('Finish','offline')
}


//All devices should be online in this moment
function thirdRound(){
  const buttons = document.getElementsByName('bip');
  let countArr=0;
  writeLog('Evaluating fails en 2 Round..','notrecover')
  buttons.forEach((element)=> {
    const evalSecondOnline=secondIpFail.includes(element.value)
    if(evalSecondOnline){
      writeLog(element.value + '....','notrecover')
      callIpUrl(element.value)
      .then((data)=>{
        element.className="ipok"
        writeLogReplace(element.value + '....',element.value + '....OK','notrecover')
      })
      .catch((err)=>{
        element.className="ipfailthird"
        writeLogReplace(element.value + '....','','notrecover')
        writeLog(element.value + '....FAIL','notrecover')
      })
      .finally(()=>{
        countArr++;
        if (secondIpFail.length==countArr) document.getElementById("btround").style.display="";
      })
    }
  });
  writeLog('Finish','notrecover')
}


window.onload = preparePage;

