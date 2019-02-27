const date = Date.now() ;
const datePlus7 = new Date(date+(7*24*60*60*1000));
const  noDayname  = datePlus7.toDateString().substr(4,6);
trialCount  = document.getElementById('trialCount')
trialCount.innerText = datePlus7.toDateString().substr(4,6);
