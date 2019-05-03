// Uses global Scripe loaded via <script /> tag
import cookier from "../cookier";
const initPayment = () => {
  const trialSelector = 'div[field="tn_text_1553730778125"] span';
  const priceSelector = 'div[field="tn_text_1549485147160"] span span';

  const date = Date.now();
  const datePlus7 = new Date(date + 7 * 24 * 60 * 60 * 1000);
  const noDayname = datePlus7.toDateString().substr(4, 6);

  $(trialSelector).text(datePlus7.toDateString().substr(4, 6));

  const spend = cookier.getCookie("firstAccountSpend");
  let planPrice;
  if (spend > 100000) {
    planPrice = 979;
  }
  if (25000 < spend < 100000) {
    planPrice = 379;
  }
  if (5000 < spend < 25000) {
    planPrice = 179;
  }
  if (spend < 5000) {
    planPrice = 59;
  }

  $(priceSelector).text(`$${planPrice}`);

  const stripeKey = cookier.getCookie("stripe_key");

  const selectors = {
    cardNumber: "#stripe-card-number",
    cardExpiry: "#stripe-expiry",
    cardCvc: "#stripe-cvc"
  };

  var stripe = Stripe(stripeKey);

  var elements = stripe.elements({
    locale: "en",
    fonts: [
      {
        cssSrc: "https://fonts.googleapis.com/css?family=Lato"
      }
    ]
  });

  var elementStyles = {
    base: {
      color: "#4a4a4a",
      fontWeight: 400,
      fontFamily: "Lato, Roboto, arial",
      fontSize: "16px",
      fontSmoothing: "antialiased"
    },
    invalid: {
      color: "#FE4936"
    }
  };

  var elementClasses = {
    focus: "focus",
    empty: "empty",
    invalid: "invalid"
  };

  var cardNumber = elements.create("cardNumber", {
    style: elementStyles,
    classes: elementClasses
  });
  cardNumber.mount(selectors.cardNumber);

  var cardExpiry = elements.create("cardExpiry", {
    style: elementStyles,
    classes: elementClasses
  });
  cardExpiry.mount(selectors.cardExpiry);

  var cardCvc = elements.create("cardCvc", {
    style: elementStyles,
    classes: elementClasses
  });
  cardCvc.mount(selectors.cardCvc);

  const elementsArray = [
    { ref: cardNumber, id: "cardNumber" },
    { ref: cardExpiry, id: "cardExpiry" },
    { ref: cardCvc, id: "cardCvc" }
  ];

  let previousBrand;

  elementsArray.forEach(element => {
    element.ref.on("change", data => {
      if (element.id === "cardNumber" && data.brand !== previousBrand) {
        $("#stripe-card-brand")
          .removeClass(previousBrand)
          .addClass(data.brand);

        previousBrand = data.brand;
      }

      if (data.error) {
        $(`${selectors[element.id]} + .stripe-input-error`).text(
          data.error.message
        );

        if (element.id === "cardNumber") {
          $("#stripe-card-brand")
            .removeClass(previousBrand)
            .addClass("invalid");

          previousBrand = "invalid";
        }
      } else {
        $(`${selectors[element.id]} + .stripe-input-error`).text("");
      }
    });
  });

  cardCvc.on("focus", () => {
    $("#stripe-card-brand").addClass("cvc");
  });

  cardCvc.on("blur", () => {
    $("#stripe-card-brand").removeClass("cvc");
  });

  $('[data-elem-id="1553731260954"]').on("click", async e => {
    e.preventDefault();

    document.body.style.cursor = "wait";
    document.getElementsByClassName("loadfreeze")[0].style.display = "block";

    try {
      const result = await stripe.createSource(cardNumber, {
        type: "card"
      });

      if (result.error) {
        // Inform the user if there was an error
        $("#stripe-expiry + .stripe-input-error").text(result.error.message);
      } else {
        // Send the source to your server
        await stripeSourceHandler(result.source);

        setTimeout(() => {
          window.location =
            "https://my.leadza.ai?utm_source=onboarding&utm_content=payment_page";
        }, 1500);

        $("#openSuccessPopup").click();
      }
    } catch (e) {
      console.log(e);
    }

    document.body.style.cursor = "default";
    document.getElementsByClassName("loadfreeze")[0].style.display = "none";
  });

  //   registerElements([cardNumber, cardExpiry, cardCvc], 'example3');
};

async function stripeSourceHandler(source) {
  try {
    const response = await fetch(
      `/api/user/${cookier.getCookie("fbID")}/billing/payment_source`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookier.getCookie("apiToken")}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ source_id: source.id })
      }
    );

    if (response.status === 400) {
      //  window.location.href = "https://my.leadza.ai";
    } else {
      await getUserPlan(
        true,
        cookier.getCookie("firstAccount"),
        cookier.getCookie("firstCampsList")
      );
      //window.location.href = sessionStorage.getItem("dashbordLink");
    }
  } catch (e) {
    console.log("user created card abort");
  }
}

function getUserPlan(dry_run, enabled_accounts, enabled_campaigns) {
  let params = {
    enabled_accounts: [parseInt(enabled_accounts)],
    enabled_campaigns: JSON.parse(enabled_campaigns)
  };
  if (dry_run !== null) {
    params["dry_run"] = dry_run;
  }

  fetch(`/api/user/${cookier.getCookie("fbID")}/settings`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${cookier.getCookie("apiToken")}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  })
    .then(function(response) {
      if (response.status === 400) {
        console.log(response.status);
        //  window.location.href = "https://my.leadza.ai";
      }
      return response.json();
    })
    .then(function(api) {
      if (api.hasOwnProperty("recommended_plan_id")) {
        changePlan(api.recommended_plan_id);
      } else {
        document.body.style.cursor = "auto";
        window.location.href = cookier.getCookie("dashbordLink") +
          "?utm_source=onboarding&utm_content=payment_page";
      }
    })
    .catch(function() {
      console.log("need upgrade plan");
    });
}

function changePlan(planId) {
  fetch(
    `/api/user/${cookier.getCookie("fbID")}/billing/switch_plan/${planId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cookier.getCookie("apiToken")}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sourceid: "data.source.id" })
    }
  )
    .then(function(response) {
      if (response.status === 400) {
        console.log(response.status);
        //  window.location.href = "https://my.leadza.ai";
      } else {
        //  window.location.href = sessionStorage.getItem("dashbordLink");
      }
      return response.json();
    })
    .then(function(api) {
      getUserPlan(
        null,
        cookier.getCookie("firstAccount"),
        cookier.getCookie("firstCampsList")
      );
      console.log(api);
    })
    .catch(function() {
      console.log("need upgrade plan");
    });
}

//module.exports = initPayment;
export default initPayment;

