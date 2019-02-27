//      document.getElementsByName("fb_checkbox")[0].addEventListener('change', (event) => {
//          document.getElementsByTagName("fb:login-button")[0].style.opacity =  event.target.checked ? 1 : 0;
//      })

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
    console.log('statusChangeCallback');
    console.log('response');
    console.log(response);
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      getUserInfo(response.authResponse);
      sessionStorage.setItem('userID', response.authResponse.userID);
      if  (sessionStorage.getItem('longToken') !=0) { getLongToken(response)};
    } else {
      document.getElementsByName("fb_checkbox")[0].addEventListener('change', (event) => {
          document.getElementsByTagName("fb:login-button")[0].style.opacity =  event.target.checked ? 1 : 0;
      })
      console.log('Please log into this app.');
    }
  }

  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
    FB.init({
// for dev1     
//      appId      : '1835942169980580',
      // for prod : // 
      appId      : '1654144768160322',
      cookie     : true,  // enable cookies to allow the server to access 
                          // the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v3.2' // The Graph API version to use for the call
    });

    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  function getUserInfo(response) {
    console.log('Welcome!  Fetching your information.... ');
    FB.api(`/me?fields=name,email&access_token=${response.accessToken}`, function(response) {
      console.log(response);
      userInfo.name = response.name;
      userInfo.first_name = response.name.split(' ')[0]
      userInfo.last_name = response.name.split(' ')[1]
      userInfo.id = response.id;
      userInfo.email = response.email;
      sessionStorage.setItem('first_name', userInfo.first_name);
      sessionStorage.setItem('last_name', userInfo.last_name);
      sessionStorage.setItem('email', userInfo.email);
      sessionStorage.setItem('fbID', userInfo.id);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
      
    });
  }
  function getLongToken(response) {
fetch(`/api/user/${response.authResponse.userID}/exchange_token/?access_token=${response.authResponse.accessToken}`, {
            method: "get",
            headers: {
                'Authorization': `Bearer ${response.authResponse.accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(api) {
            longToken = api.access_token;
            userInfo.access_token = api.access_token;
            sessionStorage.setItem('longToken', longToken);
            //getSettings(longToken,response.authResponse.userID);
            getUser();
        });
}
function getUser(){
fetch(`/api/user/${userInfo.id}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${userInfo.access_token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            if (response.status === 404) {
                window.location.href = "https://my.leadza.ai";
            //  createUser();
            }
            else {
                return response.json();
            }
        })
        .then(function(api) {
          window.location.href = "/contacts";
        })
};
