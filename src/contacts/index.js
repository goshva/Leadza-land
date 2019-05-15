import cookier from "../cookier";
function loader (cursor,veil,text){
  document.body.style.cursor = cursor;
  document.getElementsByClassName("loadfreeze")[0].style.display = veil;
  if (typeof text !== "undefined"){
     document.getElementsByClassName("center")[0].innerText = text
  }
}
export default function initContacts() {

  var userInfo = {};
  $('*[data-field-formnam="fio_form"]').data('success-callback', 'window.mySuccessFunction');
  let textareaDefault = JSON.parse(document.getElementsByTagName("textarea")[0].value);
  textareaDefault[0].li_ph = cookier.getCookie("first_name");
  textareaDefault[0].li_value = cookier.getCookie("first_name"); //Tilda do not use default props 
  textareaDefault[1].li_ph = cookier.getCookie("last_name");
  textareaDefault[1].li_value = cookier.getCookie("last_name"); //Tilda do not use default props 
  textareaDefault[2].li_ph = cookier.getCookie("email");
  textareaDefault[2].li_value = cookier.getCookie("email"); //Tilda do not use default props 
  document.getElementsByTagName("textarea")[0].value = JSON.stringify(textareaDefault);
  let init = false;

window.addEventListener(`resize`, event => {
  $(".js-form-proccess").each(function() {
  $(this).data("success-callback", "window.mySuccessFunction");
  $(this).attr("data-success-callback", "mySuccessFunction");
  $(this).attr("data-success-url", "");
});

}, false);
  window.mySuccessFunction = () => {
    userInfo.id = cookier.getCookie("fbid");
    userInfo.access_token = cookier.getCookie("apiToken");
    userInfo.first_name = document.querySelector("input[name=firstname]").value;
    userInfo.last_name = document.querySelector("input[name=lastname]").value;
    userInfo.email = document.querySelector("input[name=email]").value;
    createUser();
  };

  function createUser() {
    loader("wait","block","Creating user in Leadza...");

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
