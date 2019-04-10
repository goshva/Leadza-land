export default function initContacts() {
  var userInfo = {};

  setTimeout(() => {
    var el = document.querySelector("input[name=firstname]");
    el.value = sessionStorage.getItem("first_name");
    var el = document.querySelector("input[name=lastname]");
    el.value = sessionStorage.getItem("last_name");
    var el = document.querySelector("input[name=email]");
    el.value = sessionStorage.getItem("email");
  }, 2000);

  function getuserdata() {
    userInfo.id = sessionStorage.getItem("fbID");
    userInfo.access_token = sessionStorage.getItem("longToken");
    userInfo.first_name = document.querySelector("input[name=firstname]").value;
    userInfo.last_name = document.querySelector("input[name=lastname]").value;
    userInfo.email = document.querySelector("input[name=email]").value;
    createUser();
  }

  function createUser() {
    document.body.style.cursor = "wait";
    document.getElementsByClassName("loadfreeze")[0].style.display = "block";

    fetch(`/api/user/${userInfo.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("longToken")}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userInfo)
    })
      .then(function(response) {
        document.body.style.cursor = "auto";
        if (response.status === 400) {
          window.location.href = sessionStorage.getItem("dashbordLink");
        } else {
          window.location.href = "/accounts";
        }
      })
      .catch(function() {
        console.log("user created abort");
      });
  }
}
