# BuildRun landing page: setup (all free except the domain)

Files: `index.html`, `thank-you/`, `privacy-policy/`, `assets/` (style.css, main.js, images).

## Part 1: Check it on your laptop
Download the `landing` folder → double-click `index.html`. It opens in Chrome. The form works and goes to the thank-you page (it saves leads only after Part 2).

## Part 2: Send leads to Google Sheets + email (10 min)
1. Go to sheets.new → name the Sheet **BuildRun Leads**
2. Row 1 headers (A–N): `time | name | phone | business | service | budget | utm_source | utm_medium | utm_campaign | utm_content | utm_term | gclid | fbclid | page`
3. Menu **Extensions → Apps Script** → delete everything → paste the code below → 💾 Save
4. **Deploy → New deployment** → ⚙️ type **Web app** → Execute as: **Me** → Who has access: **Anyone** → Deploy → allow permissions
5. Copy the **Web app URL** (ends with `/exec`)
6. In `index.html`, near the bottom, replace `PASTE_APPS_SCRIPT_URL_HERE` with that URL

```javascript
function doPost(e) {
  var p = e.parameter;
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sh.appendRow([new Date(), p.name, "'" + p.phone, p.business, p.service, p.budget,
    p.utm_source, p.utm_medium, p.utm_campaign, p.utm_content, p.utm_term, p.gclid, p.fbclid, p.page]);
  MailApp.sendEmail("praveen.tadi33@gmail.com",
    "New BuildRun lead: " + p.name + " (" + p.service + ")",
    "Name: " + p.name + "\nWhatsApp: " + p.phone + "\nBusiness: " + p.business +
    "\nService: " + p.service + "\nBudget: " + p.budget +
    "\nSource: " + (p.utm_source || "direct") + " / " + (p.utm_campaign || "-") +
    "\n\nReply on WhatsApp: https://wa.me/" + String(p.phone).replace(/\D/g, ""));
  return ContentService.createTextOutput("ok");
}
```

## Part 3: Host it free (GitHub Pages)
1. Create a new public GitHub repo, **buildrun-site**
2. Upload everything inside the `landing` folder (keep the folders)
3. Repo **Settings → Pages** → Source: `main` branch, `/ (root)` → Save
4. Live in ~1 min at `https://tadipraveen9618.github.io/buildrun-site/`

## Part 4: Connect buildrundigital.in (after you buy it, ~₹500–900/yr)
1. Repo **Settings → Pages → Custom domain** → `buildrundigital.in` → Save
2. At the domain seller (DNS settings) add:
   - 4 × **A** records, host `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **CNAME** record, host `www` → `tadipraveen9618.github.io`
3. Wait 1–24 hours → tick **Enforce HTTPS** in GitHub Pages

## Part 5: Tracking
Step G: paste the GTM code where the HTML says `STEP G`. Events are already pushed:
- `generate_lead` on /thank-you/ (only after a real form submit, with phone + first name for enhanced conversions / CAPI)
- `whatsapp_click`, `call_click` (with `click_location`)
- UTMs + gclid + fbclid are saved with every lead in the Sheet
