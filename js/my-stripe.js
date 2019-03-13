var stripe = Stripe(sessionStorage.getItem("stripe_key"));
var elements = stripe.elements();
var style = {
  base: {
    color: '#32325d',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element.
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission.
var form = document.getElementById('payment-form');
var ownerInfo = {
  owner: {
    name: `${sessionStorage.first_name} ${sessionStorage.last_name}`,
    email: sessionStorage.email
  },
};
form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.createSource(card, ownerInfo).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the source to your server
      stripeSourceHandler(result.source);
    }
  });
});
function stripeSourceHandler(source) {
    document.body.style.cursor='wait';
    document.getElementsByClassName('loadfreeze')[0].style.zIndex = 999;
    fetch(`/api/user/${sessionStorage.userID}/billing/payment_source`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('longToken')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({source_id: source.id})
        })
        .then(function(response) {
            if (response.status === 400) {
            //  window.location.href = "https://my.leadza.ai";
            }
            else {
              getUserPlan(true,sessionStorage.firstAccount, sessionStorage.firstCampsList )
              //window.location.href = sessionStorage.getItem("dashbordLink");
            }
        })
        .catch(function() {
            console.log('user created card abort');
        });
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
              window.location.href = sessionStorage.getItem("dashbordLink");
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

