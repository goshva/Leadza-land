const initSignup = () => {
  console.log("yo");

  $("#agree_box").on("change", obj => {
    let button = $('a[href="#continue"]')[0];

    button.style.backgroundImage =
      "url('/images/tild3630-3232-4261-b532-343931636565__fb_button.png')";
    button.style.pointerEvents = "auto";
    button.onclick = function(e) {
      e.preventDefault();

      letsAuth();
    };
  });

  let longToken = null;
  let userInfo = {
    access_token: null,
    email: null,
    first_name: null,
    id: null,
    last_name: null,
    name: null
  };
  function statusChangeCallback(response) {
    console.log(response);
    if (response.status === "connected") {
      // Logged into your app and Facebook.
      getUserInfo(response.authResponse);
      sessionStorage.setItem("userID", response.authResponse.userID);
      if (sessionStorage.getItem("longToken") != 0) {
        getLongToken(response);
      }
    } else {
      console.log("Please log into this app.");
      FB.login(function(response) {
        checkLoginState();
      });
    }
  }

  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  // window.fbAsyncInit = function() {
  function letsAuth() {
    document.body.style.cursor = "wait";
    document.getElementsByClassName("loadfreeze")[0].style.display = "block";
    FB.init({
      appId: sessionStorage.getItem("appId"),
      cookie: true, // enable cookies to allow the server to access
      // the session
      xfbml: true, // parse social plugins on this page
      version: "v3.2" // The Graph API version to use for the call
    });

    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }
  // };

  function getUserInfo(response) {
    console.log("Welcome!  Fetching your information.... ");
    FB.api(
      `/me?fields=name,email&access_token=${response.accessToken}`,
      function(response) {
        console.log(response);
        if (response.hasOwnProperty("error")) {
          alert(response.error);
        }
        userInfo.name = response.name;
        userInfo.first_name = response.name.split(" ")[0];
        userInfo.last_name = response.name.split(" ")[1];
        userInfo.id = response.id;
        userInfo.email = response.email;
        sessionStorage.setItem("first_name", userInfo.first_name);
        sessionStorage.setItem("last_name", userInfo.last_name);
        sessionStorage.setItem("email", null);
        if (userInfo.hasOwnProperty("email") && userInfo.email !== null) {
          sessionStorage.setItem("email", userInfo.email);
        }
        sessionStorage.setItem("email", userInfo.email);
        sessionStorage.setItem("fbID", userInfo.id);
        // document.getElementById("status").innerHTML =
        //   "Thanks for logging in, " + response.name + "!";
      }
    );
  }
  function getLongToken(response) {
    fetch(
      `/api/user/${response.authResponse.userID}/exchange_token/?access_token=${
        response.authResponse.accessToken
      }`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${response.authResponse.accessToken}`,
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
        longToken = api.access_token;
        userInfo.access_token = api.access_token;
        sessionStorage.setItem("longToken", longToken);
        //getSettings(longToken,response.authResponse.userID);
        getUser();
      });
  }
  function getUser() {
    fetch(`/api/user/${userInfo.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userInfo.access_token}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }).then(function(response) {
      setMyLeadzaCookies("userId", userInfo.id);
      setMyLeadzaCookies("apiToken", userInfo.access_token);
      if (response.status !== 404) {
        window.location.href = sessionStorage.getItem("dashbordLink");
      } else {
        document.body.style.cursor = "auto";
        window.location.href = "/contacts";
      }
    });
  }
  function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (
      match != null &&
      match.length > 2 &&
      typeof match[2] === "string" &&
      match[2].length > 0
    ) {
      return match[2];
    } else {
      return null;
    }
  }
  function setMyLeadzaCookies(name, value) {
    var cookieName = name;
    var cookieValue = value;
    var now = new Date();
    var myDate = now.getTime() + 1000 * 60 * 60 * 24 * 365;
    document.cookie =
      cookieName +
      "=" +
      cookieValue +
      ";expires=" +
      myDate +
      ";domain=leadza.ai;path=/";
  }
};

export default initSignup;
