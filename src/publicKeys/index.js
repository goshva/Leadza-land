export default async function getPubKeys() {
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
      const api = response.json();

      sessionStorage.setItem("dashbordLink", api.dashbord);
      sessionStorage.setItem("stripe_key", api.stripe_key);
      sessionStorage.setItem("appId", api.appId);
    }
  } catch (e) {
    alert(e);
  }
}
