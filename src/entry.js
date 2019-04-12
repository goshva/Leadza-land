import payment from "./payment";
import home from "./home";
import signup from "./signup";
import contacts from "./contacts";
import accounts from "./accounts";
import initIntercom from "./intercom";
import getPublicKeys from "./publicKeys";
import "./styles/index.scss";

window.dataLayer = window.dataLayer || [];

window.intercomSettings = {
  app_id: "v94otmxd"
};

// initIntercom();

$(document).ready(() => {
  getPublicKeys();

  const initializersMap = {
    "/": home,
    "/signup": signup,
    "/accounts": accounts,
    "/contacts": contacts,
    "/payment": payment
  };

  const path = window.location.pathname;

  const init = initializersMap[path];

  if (init) {
    init();
  }
});
