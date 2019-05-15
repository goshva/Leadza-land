import cookier from "../cookier";
function loader (cursor,veil,text){
  document.body.style.cursor = cursor;
  document.getElementsByClassName("loadfreeze")[0].style.display = veil;
  if (typeof text !== "undefined"){
     document.getElementsByClassName("center")[0].innerText = text
  }
}

export default function initAccounts() {
  //loader("wait","block");
  let apiToken = cookier.getCookie("apiToken");
  let userID = cookier.getCookie("fbid");
  let accountsList;
  let tryings = 0;
  getSettings();
  window.mySuccessFunction = () => {
    const selector = document.getElementsByName("ad_list_option")[0];
    const value = selector[selector.selectedIndex].value;
    const id  = getValue(parseName(value));
    cookier.setCookie("firstAccount", id,{expires:3600});
    cookier.setCookie("firstAccountSpend", getSpendbyID(id),{expires:3600});
    cookier.setCookie("firstCampsList", getCamps(id),{expires:3600});

    window.location.href = "/_onboarding";
  };

  function getSettings() {
    fetch(`/api/user/${userID}/settings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(api) {

        accountsList = api.accounts_and_campaigns.accounts;
        console.log(accountsList)
        if (
          tryings < 3 && accountsList.every(acc => acc.last_month_spend == 0)
        ) {
          tryings++;
          setTimeout(function() {
            getSettings();
          }, 2000);
        } else {
          addOptions(accountsList);
        }
      })
      .catch(function() {
        //  window.location.href = "/signup.html";
      });
  }

  function addOptions(inputdata) {
console.log(inputdata)
  let arra = inputdata.map((element) => {
      var str = element.name+" $"+element.last_month_spend_usd+"/month"
      return str;
  });
  arra = arra.join('\n')
  console.log(arra)
  var textareaDefault = JSON.parse(document.getElementsByTagName("textarea")[0].value);
  console.log(textareaDefault);
  textareaDefault[0].li_variants = arra;
  console.log(textareaDefault);
  document.getElementsByTagName("textarea")[0].value = JSON.stringify(textareaDefault);
  document.getElementsByTagName("textarea")[0].defaultValue = JSON.stringify(textareaDefault);
  document.getElementsByTagName("textarea")[0].innerHTML = JSON.stringify(textareaDefault);
  document.getElementsByTagName("textarea")[0].innerText = JSON.stringify(textareaDefault);
  
reInit();

  }
  function getSpendbyID(value) {
    const acc = accountsList.find(acc => acc.id == value);
    return acc.last_month_spend_usd;
  }
  function getCamps(value) {
    const acc = accountsList.find(acc => acc.id === value);
    const camps = acc.campaigns.map(a => a.id);
    console.log(camps);
    return JSON.stringify(camps);
  }

  function getValue(name){
    console.log(name);
    const acc = accountsList.find(acc => acc.name == name);
    return acc.id;
  }
  function parseName(str) {
    console.log(str);
    return str.split(' \$')[0]
  }
function reInit(){
  jQuery.cachedScript = function(url) {
    var options = {
      dataType: "script",
      cache: true,
      url: url
    };
    return jQuery.ajax(options);
  };
  $.cachedScript("/js/tilda-zero-forms-1.0.min.js").done(function(script, textStatus) {
    if (textStatus == 'success') {
      setTimeout(function() {
        var recid = '98281816';
        var elemid = '1554746778306';
        t_zeroForms__init(recid, elemid);
      }, 500);
    } else {
      console.log('Error init form in zeroblock. Err:' + textStatus);
    }
  });
  loader("auto","none");
};
}
