(function () {
  window.dataLayer = window.dataLayer || [];
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];

  // 1. Remember UTM / click IDs for this visit (first value wins)
  var qs = new URLSearchParams(location.search);
  KEYS.forEach(function (k) {
    var v = qs.get(k);
    try { if (v && !sessionStorage.getItem(k)) sessionStorage.setItem(k, v); } catch (e) {}
  });
  function getK(k) { try { return sessionStorage.getItem(k) || qs.get(k) || ""; } catch (e) { return qs.get(k) || ""; } }

  // 2. WhatsApp + call click events (GTM listens for these)
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    if (a.classList.contains("js-wa")) window.dataLayer.push({ event: "whatsapp_click", click_location: a.dataset.loc || "" });
    if (a.classList.contains("js-call")) window.dataLayer.push({ event: "call_click", click_location: a.dataset.loc || "" });
    if (a.classList.contains("js-pick")) {
      var s = document.getElementById("service");
      if (s) s.value = a.dataset.service;
    }
  });

  // 3. Lead form
  var form = document.getElementById("leadForm");
  if (!form) return;
  function showErr(el, on) { var box = el.closest(".fg"); var er = box && box.querySelector(".err"); if (er) er.style.display = on ? "block" : "none"; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var name = form.name.value.trim();
    var phone = form.phone.value.replace(/\D/g, "");
    showErr(form.name, !name); if (!name) ok = false;
    var pOk = /^[6-9]\d{9}$/.test(phone); showErr(form.phone, !pOk); if (!pOk) ok = false;
    showErr(form.business, !form.business.value); if (!form.business.value) ok = false;
    showErr(form.service, !form.service.value); if (!form.service.value) ok = false;
    showErr(form.consent, !form.consent.checked); if (!form.consent.checked) ok = false;
    if (!ok) return;
    if (form.website.value) return; // spam bot

    KEYS.forEach(function (k) { form[k].value = getK(k); });
    form.page.value = location.href.split("?")[0];

    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Sending…";

    var data = new URLSearchParams(new FormData(form));
    data.set("phone", "+91" + phone);
    data.delete("website");

    // Hashed-ready values for enhanced conversions / CAPI (picked up on the thank-you page)
    try { sessionStorage.setItem("lead_phone", "+91" + phone); sessionStorage.setItem("lead_name", name); sessionStorage.setItem("lead_service", form.service.value); } catch (err) {}

    var go = function () { location.href = "thank-you/"; };
    if (!window.LEAD_ENDPOINT || window.LEAD_ENDPOINT.indexOf("http") !== 0) { go(); return; }
    fetch(window.LEAD_ENDPOINT, { method: "POST", mode: "no-cors", body: data })
      .then(go).catch(go);
    setTimeout(go, 4000); // never leave the user stuck
  });
})();
