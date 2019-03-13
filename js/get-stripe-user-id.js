let longToken = sessionStorage.getItem('longToken');
let userID = sessionStorage.getItem('userID');
let stripeUser;
let accountsList;
function getUser(){
fetch(`/api/user/${userID}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${longToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(api) {
           stripeUser = api.username;
           alert(stripeUser); 
           //dOptions(api.accounts_and_campaigns.accounts);
        })
        .catch(function() {
          //  window.location.href = "/signup.html";
        });
}

    function addOptions(inputdata){
   var option;
   var select = document.querySelector("select[name=ad_list_option]");
  
    inputdata.forEach(function( item ) {
    option = document.createElement( 'option' );
      option.textContent = ` ${item.name} $${ item.last_month_spend_usd}/month`;
      option.value =  item.id;
      select.appendChild( option );
    });
};
function getSpendbyID(value){
    console.log(accountsList);
    const acc = accountsList.find(acc => acc.id == value);
    return acc.last_month_spend_usd;
};

function hadSeleted(){
   const selector =  document.getElementsByName("ad_list_option")[0];
   const value = selector[selector.selectedIndex].value;
   sessionStorage.setItem('firstAccount', value);
   sessionStorage.setItem('firstAccountSpend', getSpendbyID(value));

};
function submit(){
    window.location.href = "/payment.html";
}
//getUser();
