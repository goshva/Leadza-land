const spend = sessionStorage.getItem("firstAccountSpend")
let planPrice;
if ( spend > 100000) {
  planPrice =  979;
}
if (25000 < spend < 100000) {
  planPrice =  379;
}
if (5000 < spend < 25000) {
  planPrice =  179;
}
if (spend< 5000) {
  planPrice =  59;
}
var el = document.querySelector("#planPrice");
el.innerText = `$${planPrice}`;
