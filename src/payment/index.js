// Uses global Scripe loaded via <script /> tag

const initPayment = () => {
  const stripeKey = "	pk_test_19idGtBSxGKNYAETYHV4meDo00trXYCYyJ";

  const selectors = {
    cardNumber: "#stripe-card-number",
    cardExpiry: "#stripe-expiry",
    cardCvc: "#stripe-cvc"
  };

  var stripe = Stripe(stripeKey);

  var elements = stripe.elements({
    locale: "auto",
    fonts: [{
      cssSrc: "https://fonts.googleapis.com/css?family=Lato"
    }]
  });

  var elementStyles = {
    base: {
      color: "#4a4a4a",
      fontWeight: 400,
      fontFamily: "Lato, Roboto, arial",
      fontSize: "16px",
      fontSmoothing: "antialiased",
    },
    invalid: {
      color: "#FE4936",
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
    {ref: cardNumber, id: 'cardNumber'},
    // {ref: cardExpiry, id: 'cardExpiry'},
    // {ref: cardCvc, id: 'cardCvc'},
  ]
  
  elementsArray.forEach(element => {
    element.ref.on('change', data => {
      if (data.error) {
        $(`${selectors[element.id]} + .stripe-input-error`).text(data.error.message);
      } else {
        $(`${selectors[element.id]} + .stripe-input-error`).text('');
      }
    });

  })
  
  $('[data-elem-id="1553731260954"]').on('click', async (e) => {
    e.preventDefault();

    try {
      const result = await stripe.createSource(card, ownerInfo);

      if (result.error) {
        // Inform the user if there was an error
        $('#stripe-expiry + .stripe-input-error').text(result.error.message);
      } else {
        // Send the source to your server
        await stripeSourceHandler(result.source);
      }
    } catch (e) {

    }

    $('#openSuccessPopup').click();
  })


  //   registerElements([cardNumber, cardExpiry, cardCvc], 'example3');
};

async function stripeSourceHandler(source) {
  document.body.style.cursor='wait';
  document.getElementsByClassName('loadfreeze')[0].style.display = "block";

  try {
    const response = await fetch(`/api/user/${sessionStorage.userID}/billing/payment_source`, {
      method: "POST",
      headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('longToken')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({source_id: source.id})
      });

      if (response.status === 400) {
        //  window.location.href = "https://my.leadza.ai";
      }
      else {
        await getUserPlan(true,sessionStorage.firstAccount, sessionStorage.firstCampsList )
        //window.location.href = sessionStorage.getItem("dashbordLink");
      }
  } catch (e) {
    console.log('user created card abort');
  }
}

function getUserPlan(dry_run, enabled_accounts, enabled_campaigns) {
  let params  = {
      enabled_accounts: [parseInt(enabled_accounts)],
      enabled_campaigns:  JSON.parse(enabled_campaigns)
  };
  if (dry_run !== null) {
      params["dry_run"] = dry_run;
  };
  
  fetch(`/api/user/${sessionStorage.userID}/settings`, {
              method: "PATCH",
              headers: {
                  'Authorization': `Bearer ${sessionStorage.getItem('longToken')}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
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
              if (api.hasOwnProperty('recommended_plan_id')){
              changePlan(api.recommended_plan_id);
              } else {
                document.body.style.cursor='auto';
                window.location.href = sessionStorage.getItem("dashbordLink")+"?utm_source=onboarding&utm_content=payment_page";
              }
          })
          .catch(function() {
              console.log('need upgrade plan');
          });
  }
  
  function changePlan(planId) {
  fetch(`/api/user/${sessionStorage.userID}/billing/switch_plan/${planId}`, {
              method: "POST",
              headers: {
                  'Authorization': `Bearer ${sessionStorage.getItem('longToken')}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({sourceid: "data.source.id"})
          })
          .then(function(response) {
              if (response.status === 400) {
              console.log(response.status);
              //  window.location.href = "https://my.leadza.ai";
              }
              else {
              //  window.location.href = sessionStorage.getItem("dashbordLink");
              }
              return response.json();
          })
          .then(function(api) {
              getUserPlan(null,sessionStorage.firstAccount, sessionStorage.firstCampsList )
              console.log(api);
          })
          .catch(function() {
              console.log('need upgrade plan');
          });
  }

module.exports = initPayment;
