import payment from "./payment";
import "./styles/index.scss";

$(document).ready(() => {
  const initializersMap = {
    "/payment2": payment,
    "/payment2.html": payment
  };

  const path = window.location.pathname;

  const init = initializersMap[path];

  if (init) {
    init();
  }
});
