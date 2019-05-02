import cookier from "../cookier";
export default async function getPubKeys() {
  if (typeof(cookier.getCookie('dashbordLink')) == 'undefined' ||
      typeof(cookier.getCookie('stripe_key')) == 'undefined' ||
      typeof(cookier.getCookie('appId')) == 'undefined') {
  try {
    const response = await fetch("/api/meta/keys", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    if (response.status == 404) {
      alert(404);
    } else {
      const api = await response.json();
      cookier.setCookie("dashbordLink", api.dashbord,{expires:3600});
      cookier.setCookie("stripe_key", api.stripe_key,{expires:3600});
      cookier.setCookie("appId", api.appId,{expires:3600});
    }
  } catch (e) {
    alert(e);
  }
}
}
