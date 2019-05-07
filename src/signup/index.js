import cookier from "../cookier";
const initSignup = () => {
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
    let allowRulesEvent = document.getElementById("agree_box");
    let button = document.getElementById("toSign");
    allowRulesEvent.onclick = function(e) {
      button.style.opacity = allowRulesEvent.checked ? "1" : "0.5";
      button.style.pointerEvents = allowRulesEvent.checked ? "auto" : "none";
    };
  };

  // In your onload handler
  FB.Event.subscribe("xfbml.render", finished_rendering);

 function getUserInfo(accessToken) {
    document.body.style.cursor = "wait";
    document.getElementsByClassName("loadfreeze")[0].style.display = "block";
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
    document.body.style.cursor = "auto";
    window.location = "#";
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };
  
 async function checkExistUser(apiToken) {
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
    window.location.href = cookier.getCookie("dashbordLink");
  } catch(err) {
  getUserInfo(apiToken);
 }
     console.log(accountsResponse);
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
