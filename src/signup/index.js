const initSignup = () => {

let longToken = null;
let userInfo = {
        access_token: null,
        email: null,
        first_name: null,
        id: null,
        last_name: null,
        name: null
    };

    let button  = document.getElementById("toSign");
    button.style.opacity = "0.5";
    button.style.pointerEvents = "none";
var finished_rendering = function() {
    let allowRulesEvent  = document.getElementById("agree_box");
    let button  = document.getElementById("toSign");
    allowRulesEvent.onclick = function(e){ 
       button.style.opacity = allowRulesEvent.checked ? "1" : "0.5";
       button.style.pointerEvents = allowRulesEvent.checked ? "auto" : "none";
    }

}

// In your onload handler
FB.Event.subscribe('xfbml.render', finished_rendering);


  function getUserInfo(accessToken) {
    //accessToken = sessionStorage.longToken
    console.log('Welcome!  Fetching your information.... ');
    FB.api(`/me?fields=first_name,last_name,email&access_token=${accessToken}`, function(response) {

      console.log(response);
      if (response.hasOwnProperty("error")) { alert(response.error)}
      userInfo.name = response.name;
      userInfo.first_name = response.first_name
      userInfo.last_name = response.last_name
      userInfo.id = response.id;
      userInfo.email = response.email;
      sessionStorage.setItem('first_name', userInfo.first_name);
      sessionStorage.setItem('last_name', userInfo.last_name);
      sessionStorage.setItem('email', null);
      if (userInfo.hasOwnProperty('email') && userInfo.email !== null ){
          sessionStorage.setItem('email', userInfo.email)
      }
      sessionStorage.setItem('email', userInfo.email);
      sessionStorage.setItem('fbID', userInfo.id);
      window.location = "/contacts";
    });
  }

  window.allowRules = () => { };
  window.statusChangeCallback = (response) => {
   getLongToken(response);
  }

  window.checkLoginState = () => {
    document.body.style.cursor='auto';
    window.location = "#"
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

 function getLongToken(response) {
    fetch(`/api/user/${response.authResponse.userID}/exchange_token/?access_token=${response.authResponse.accessToken}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${response.authResponse.accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
                        if (response.status == 403) {
                                alert(403);
            }
            else {
            return response.json();
            }
        })
        .catch(function(err) {
          alert(err);
        })
        .then(function(api) {
            longToken = api.access_token;
            userInfo.access_token = api.access_token;
            sessionStorage.setItem('longToken', longToken);
            //getSettings(longToken,response.authResponse.userID);
            getUserInfo(longToken);
        });
}


};
export default initSignup;
