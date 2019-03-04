function getPubKeys(){
fetch("/api/meta/keys", {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            if (response.status == 404) {
                alert(404);
            }
            else {
            return response.json();
            }
        })
        .catch(function() {
          alert(2);
        })
        .then(function(api) {
                 sessionStorage.setItem('dashbordLink', api.dashbord);
                 sessionStorage.setItem('stripe_key', api.stripe_key);
                 sessionStorage.setItem('appId', api.appId);
})
};
getPubKeys();
