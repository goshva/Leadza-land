import cookier from "../cookier";
export default function initAccounts() {
  let longToken = cookier.getCookie("longToken");
  let userID = cookier.getCookie("fbid");
  let accountsList;
  let tryings = 0;

  setTimeout(() => {
      $("select[name=ad_list_option] option:nth-child(2)").remove();
      getSettings();

      $(".js-form-proccess").each(function() {
        $(this).data("success-callback", "window.mySuccessFunction");
        $(this).attr("data-success-callback", "window.mySuccessFunction");
        $(this).attr("data-success-url", "");
      });
      document.body.style.cursor = "wait";
      document.getElementsByClassName("loadfreeze")[0].style.display = "block";
  }, 700);

  window.mySuccessFunction = () => {
    const selector = document.getElementsByName("ad_list_option")[0];
    const value = selector[selector.selectedIndex].value;
    cookier.setCookie("firstAccount", value,{expires:3600});
    cookier.setCookie("firstAccountSpend", getSpendbyID(value),{expires:3600});
    cookier.setCookie("firstCampsList", getCamps(value),{expires:3600});

    window.location.href = "/_onboarding";
  };

  function getSettings() {
    document.body.style.cursor = "wait";
    document.getElementsByClassName("loadfreeze")[0].style.display = "block";
    fetch(`/api/user/${userID}/settings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${longToken}`,
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
          document.getElementsByClassName("loadfreeze")[0].style.display =
            "none";
        }
      })
      .catch(function() {
        //  window.location.href = "/signup.html";
      });
  }

  function addOptions(inputdata) {
    var option;
    var select = document.querySelector("select[name=ad_list_option]");

    inputdata.forEach(function(item) {
      option = document.createElement("option");
      option.textContent = ` ${item.name} $${item.last_month_spend_usd}/month`;
      option.value = item.id;
      select.appendChild(option);
    });
  }
  function getSpendbyID(value) {
    const acc = accountsList.find(acc => acc.id == value);
    return acc.last_month_spend_usd;
  }
  function getCamps(value) {
    const acc = accountsList.find(acc => `${acc.id}` === value);
    const camps = acc.campaigns.map(a => a.id);
    return JSON.stringify(camps);
  }

  $('button[type="submit"]').on("click", e => {
    e.preventDefault();

    submit();
  });

  $(".js-form-proccess").each(function() {
    $(this).data("success-callback", "window.mySuccessFunction");
    $(this).attr("data-success-callback", "window.mySuccessFunction");
    $(this).attr("data-success-url", "");
  });
}
