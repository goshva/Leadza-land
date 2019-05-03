import cookier from "../cookier";
export default function initContacts() {
  var userInfo = {};

  let init = false;

  setTimeout(() => {
        var el = document.querySelector("input[name=firstname]");
        el.value = cookier.getCookie("first_name");
        var el = document.querySelector("input[name=lastname]");
        el.value =  cookier.getCookie("last_name");
        var el = document.querySelector("input[name=email]");
        el.value = cookier.getCookie("email");
 
        $(".js-form-proccess").each(function() {
          $(this).data("success-callback", "window.mySuccessFunction");
          $(this).attr("data-success-callback", "window.mySuccessFunction");
          $(this).attr("data-success-url", "");
        });

  }, 1200);

  window.mySuccessFunction = () => {
    userInfo.id = cookier.getCookie("fbid");
    userInfo.access_token = cookier.getCookie("apiToken");
    userInfo.first_name = document.querySelector("input[name=firstname]").value;
    userInfo.last_name = document.querySelector("input[name=lastname]").value;
    userInfo.email = document.querySelector("input[name=email]").value;
    createUser();
    console.log(userInfo);
  };

  function createUser() {
    document.body.style.cursor = "wait";
    document.getElementsByClassName("loadfreeze")[0].style.display = "block";

    fetch(`/api/user/${userInfo.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${cookier.getCookie("apiToken")}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userInfo)
    })
      .then(function(response) {
        document.body.style.cursor = "auto";
        if (response.status === 400) {
           window.location.href = cookier.getCookie("dashbordLink");
        } else {
          window.location.href = "/accounts";
        }
      })
      .catch(function() {
        console.log("user created abort");
      });
  }
}
