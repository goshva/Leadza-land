!function(e){var t={};function o(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,o),r.l=!0,r.exports}o.m=e,o.c=t,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)o.d(n,r,function(t){return e[t]}.bind(null,r));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=1)}([function(e,t){function o(e,t,n){let r={enabled_accounts:[parseInt(t)],enabled_campaigns:JSON.parse(n)};null!==e&&(r.dry_run=e),fetch(`/api/user/${sessionStorage.userID}/settings`,{method:"PATCH",headers:{Authorization:`Bearer ${sessionStorage.getItem("longToken")}`,Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(r)}).then(function(e){return 400===e.status&&console.log(e.status),e.json()}).then(function(e){var t;e.hasOwnProperty("recommended_plan_id")?(t=e.recommended_plan_id,fetch(`/api/user/${sessionStorage.userID}/billing/switch_plan/${t}`,{method:"POST",headers:{Authorization:`Bearer ${sessionStorage.getItem("longToken")}`,Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({sourceid:"data.source.id"})}).then(function(e){return 400===e.status&&console.log(e.status),e.json()}).then(function(e){o(null,sessionStorage.firstAccount,sessionStorage.firstCampsList),console.log(e)}).catch(function(){console.log("need upgrade plan")})):(document.body.style.cursor="auto",window.location.href=sessionStorage.getItem("dashbordLink")+"?utm_source=onboarding&utm_content=payment_page")}).catch(function(){console.log("need upgrade plan")})}e.exports=(()=>{const e={cardNumber:"#stripe-card-number",cardExpiry:"#stripe-expiry",cardCvc:"#stripe-cvc"};var t=Stripe("\tpk_test_19idGtBSxGKNYAETYHV4meDo00trXYCYyJ"),n=t.elements({locale:"auto",fonts:[{cssSrc:"https://fonts.googleapis.com/css?family=Lato"}]}),r={base:{color:"#4a4a4a",fontWeight:400,fontFamily:"Lato, Roboto, arial",fontSize:"16px",fontSmoothing:"antialiased"},invalid:{color:"#FE4936"}},a={focus:"focus",empty:"empty",invalid:"invalid"},s=n.create("cardNumber",{style:r,classes:a});s.mount(e.cardNumber),n.create("cardExpiry",{style:r,classes:a}).mount(e.cardExpiry),n.create("cardCvc",{style:r,classes:a}).mount(e.cardCvc),[{ref:s,id:"cardNumber"}].forEach(t=>{t.ref.on("change",o=>{o.error?$(`${e[t.id]} + .stripe-input-error`).text(o.error.message):$(`${e[t.id]} + .stripe-input-error`).text("")})}),$('[data-elem-id="1553731260954"]').on("click",async e=>{e.preventDefault();try{const n=await t.createSource(card,ownerInfo);n.error?$("#stripe-expiry + .stripe-input-error").text(n.error.message):await async function(e){document.body.style.cursor="wait",document.getElementsByClassName("loadfreeze")[0].style.display="block";try{const t=await fetch(`/api/user/${sessionStorage.userID}/billing/payment_source`,{method:"POST",headers:{Authorization:`Bearer ${sessionStorage.getItem("longToken")}`,Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({source_id:e.id})});400===t.status||await o(!0,sessionStorage.firstAccount,sessionStorage.firstCampsList)}catch(e){console.log("user created card abort")}}(n.source)}catch(e){}$("#openSuccessPopup").click()})})},function(e,t,o){"use strict";o.r(t);var n=o(0),r=o.n(n);o(2);$(document).ready(()=>{const e={"/payment2":r.a}[window.location.pathname];e&&e()})},function(e,t,o){}]);