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
              window.location.href = sessionStorage.getItem("dashbordLink");
            }
        })
        .catch(function() {
            console.log('user created abort');
        });
}
