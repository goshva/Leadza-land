import cookier from "../cookier";
export default function initAccounts() {
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
        document.body.style.cursor = "auto";
        window.location = "#";

        accountsList = api.accounts_and_campaigns.accounts;
        if (
          tryings < 3 &&
          accountsList.every(acc => acc.last_month_spend == 0)
        ) {
          tryings++;
          setTimeout(function() {
            getSettings();
          }, 2000);
        } else {
          addOptions(accountsList);
          reInit();
          document.getElementsByClassName("loadfreeze")[0].style.display = "none";
        }
      })
      .catch(function() {
        //  window.location.href = "/signup.html";
      });
  }

  function addOptions(inputdata) {
  let arra = inputdata.map((element) => {
      var str = element.name+" $"+element.last_month_spend_usd+"/month."
      return str;
  });
  arra = arra.join('\n')
  let textareaDefault = JSON.parse(document.getElementsByTagName("textarea")[0].value);
  console.log(textareaDefault);
  textareaDefault[0].li_variants = arra;
  document.getElementsByTagName("textarea")[0].value = JSON.stringify(textareaDefault);

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
  window.dispatchEvent(new Event('resize'));
  console.log(selector)
  console.log(value)
};
}
