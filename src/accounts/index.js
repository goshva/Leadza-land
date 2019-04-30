export default function initAccounts() {
  let longToken = window.sessionStorage.getItem("longToken");
  let userID = window.sessionStorage.getItem("fbID");
  let accountsList;
  let tryings = 0;

  let init = false;

  setInterval(() => {
    if (!init) {
      //if ($(".t-animate_started").length) {
        $("select[name=ad_list_option] option:nth-child(2)").remove();

        getSettings();

        $(".js-form-proccess").each(function() {
          $(this).data("success-callback", "window.mySuccessFunction");
          $(this).attr("data-success-callback", "window.mySuccessFunction");
          $(this).attr("data-success-url", "");
        });

        init = true;
      //}
    }
  }, 200);

  window.mySuccessFunction = () => {
    const selector = document.getElementsByName("ad_list_option")[0];
    const value = selector[selector.selectedIndex].value;

    sessionStorage.setItem("firstAccount", value);
    sessionStorage.setItem("firstAccountSpend", getSpendbyID(value));
    sessionStorage.setItem("firstCampsList", getCamps(value));

    window.location.href = "/payment";
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
