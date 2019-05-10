import getPublicKeys from "../publicKeys";
import cookier from "../cookier";
function loader (cursor,veil,text){
  document.body.style.cursor = cursor;
  document.getElementsByClassName("loadfreeze")[0].style.display = veil;
  if (typeof text !== "undefined"){
     document.getElementsByClassName("center")[0].innerText = text
  }
}
const initSignup = () => {
  loader("wait","block");
  getPublicKeys();
  let apiToken = null;
  let userInfo = {
    access_token: null,
    email: null,
    first_name: null,
    id: null,
    last_name: null,
    name: null
  };

  let button = document.getElementById("toSign");
  button.style.opacity = "0.5";
  button.style.pointerEvents = "none";

  var finished_rendering = function() {
    loader("auto","none");
    let allowRulesEvent = document.getElementById("agree_box");
    let button = document.getElementById("toSign");
    button.addEventListener("click", function(){alert(1)});
    allowRulesEvent.onclick = function(e) {
      button.style.opacity = allowRulesEvent.checked ? "1" : "0.5";
      button.style.pointerEvents = allowRulesEvent.checked ? "auto" : "none";
    };
  };

  // In your onload handler
  FB.Event.subscribe("xfbml.render", finished_rendering);

 function getUserInfo(accessToken) {
    FB.api(
      `/me?fields=first_name,last_name,email&access_token=${accessToken}`,
      async function(response) {
        if (response.hasOwnProperty("error")) {
          alert(response.error);
        }
        userInfo.name = response.name;
        userInfo.first_name = response.first_name;
        userInfo.last_name = response.last_name;
        userInfo.id = response.id;
        userInfo.email = response.email;
        cookier.setCookie("first_name", userInfo.first_name,{expires:3600});
        cookier.setCookie("last_name", userInfo.last_name,{expires:3600});
        cookier.setCookie("email", userInfo.email,{expires:3600});
        if (userInfo.hasOwnProperty("email") && userInfo.email !== null) { //seems alogic
          cookier.setCookie("email", userInfo.email,{expires:3600});
        }
      window.location.href = "/contacts";
      }
    );
  }

  window.allowRules = () => {};
  window.statusChangeCallback = response => {
    getLongToken(response.authResponse);
  };

  window.checkLoginState = () => {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };
  
 async function checkExistUser(apiToken) {
    loader('wait','block','Cheking user in Leadza...');
    const accountsResponse = await (await fetch(
      `/api/user/${cookier.getCookie("fbid")}/settings`,
      {
      method: "GET",
      headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  }
  )).json();
  try {
    const accountsList = accountsResponse.accounts_and_campaigns.accounts;
    loader('wait','block','Get user Data...');
    if (accountsList.length === 0) {
      window.location.href = "/demo#noAccounts";
    } else {
    window.location.href = cookier.getCookie("dashbordLink");
    }
  } catch(err) {
  getUserInfo(apiToken);
 }
    loader('wait','block','Redirect to contacts form...');
  }

  function getLongToken(fb) {
    cookier.setCookie("fbid", fb.userID,{expires:3600, domain:".leadza.ai"});
    fetch(
      `/api/user/${fb.userID}/exchange_token/?access_token=${fb.accessToken}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${fb.accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      }
    )
      .then(function(response) {
        if (response.status == 403) {
          alert(403);
        } else {
          return response.json();
        }
      })
      .catch(function(err) {
        alert(err);
      })
      .then(function(api) {
        apiToken = api.access_token;
        userInfo.access_token = api.access_token;
        cookier.setCookie("apiToken", apiToken,{expieres:3600, domain:".leadza.ai"});
        checkExistUser(apiToken);
      });
  }
};
export default initSignup;
