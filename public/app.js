// app.js — HOLI give page (Square wallets fixed: proper teardown + deterministic mounts)
(function(){
  const root = document.documentElement;
  const body = document.body;

  // ---------- DEBUG ----------
  const DEBUG = new URLSearchParams(location.search).has('debug');
  const dlog = (...a)=> { if (DEBUG) console.log('[HOLI SDK]', ...a); };

  // ---------- i18n ----------
  const i18n = {
    en: {
      scripture: "“A new command I give you: Love one another. As I have loved you, so you must love one another. By this everyone will know that you are my disciples, if you love one another.” — John 13:34–35",
      amountLabel: "Amount",
      amountPlaceholder: "Enter amount",
      amountHelp: "Minimum $1.00. (Tip: use the chips or type a custom amount.)",
      amountError: "Enter a valid amount between $1 and $10,000.",
      fundLabel: "Fund",
      tithe: "Tithe",
      offering: "Offering",
      missions: "Missions",
      building: "Building Fund",
      name: "Your Name (required once)",
      email: "Email (required once)",
      giveNow: "Give Now",
      cancel: "Cancel",
      confirmGive: "Confirm & Give",
      sheet: { title:"Secure Payment", fund:"Fund", gift:"Gift", total:"Total" },
      nav: { about:"About", give:"Give", contact:"Contact" },
      app: {
        soon: "App coming soon",
        manageSoon: "Manage giving in our app (soon)",
        footerWhisper: "The HOLI app is nearly here.",
        previewTitle: "HOLI App Preview",
        point1: "View this Sunday’s preacher",
        point2: "Get real-time updates with the church",
        point3: "Watch sermons & worship",
        point4: "Give securely in seconds",
        point5: "See events & service times",
        point6: "Join a group or serve team",
        point7: "Send prayer requests",
        close: "Close"
      }
    },
    rw: {
      scripture: "“Ndabaha itegeko rishya: mukundane. Nk'uko nabakunze, namwe mukundane. Ibyo ni byo bose bazamenyeraho ko muri abigishwa banjye, nimukundana.” — Yohana 13:34–35",
      amountLabel: "Umubare",
      amountPlaceholder: "Injiza umubare",
      amountHelp: "Ntoya ni $1.00. (Inama: koresha udupfundi cyangwa andika umubare.)",
      amountError: "Injiza umubare wemewe hagati ya $1 na $10,000.",
      fundLabel: "Ikigega",
      tithe: "Icyacumi",
      offering: "Ituro",
      missions: "Ivugabutumwa",
      building: "Ikigega cy'ubwubatsi",
      name: "Izina ryawe (bikenewe rimwe)",
      email: "Imeli (bikenewe rimwe)",
      giveNow: "Tanga Ubu",
      cancel: "Hagarika",
      confirmGive: "Emeza utange",
      sheet: { title:"Kwishyura kwizewe", fund:"Ikigega", gift:"Ituro", total:"Igiteranyo" },
      nav: { about:"Ibyerekeye", give:"Tanga", contact:"Twandikire" },
      app: {
        soon: "Porogaramu (app) iraje vuba",
        manageSoon: "Muyobore amaturo muri porogaramu (vuba)",
        footerWhisper: "Porogaramu ya HOLI iri hafi hano.",
        previewTitle: "Igaragaza Porogaramu ya HOLI",
        point1: "Reba umubwiriza w’iki cyumweru",
        point2: "Wakire amakuru ako kanya y’itorero",
        point3: "Reba inyigisho n’iramya",
        point4: "Tanga mu buryo bwizewe vuba",
        point5: "Reba gahunda n’amasaha ya gahunda",
        point6: "Injira mu itsinda cyangwa serivisi",
        point7: "Ohereza amasengesho",
        close: "Funga"
      }
    },
    fr: {
      scripture: "« Je vous donne un commandement nouveau : aimez-vous les uns les autres ; comme je vous ai aimés, vous aussi aimez-vous les uns les autres. À ceci tous connaîtront que vous êtes mes disciples, si vous avez de l’amour les uns pour les autres. » — Jean 13:34–35",
      amountLabel: "Montant",
      amountPlaceholder: "Saisir le montant",
      amountHelp: "Minimum 1,00 $. (Astuce : utilisez les boutons ou saisissez un montant.)",
      amountError: "Entrez un montant valide entre 1 $ et 10 000 $.",
      fundLabel: "Fonds",
      tithe: "Dîme",
      offering: "Offrande",
      missions: "Missions",
      building: "Fonds de construction",
      name: "Votre nom (requis une fois)",
      email: "E-mail (requis une fois)",
      giveNow: "Donner maintenant",
      cancel: "Annuler",
      confirmGive: "Confirmer et donner",
      sheet: { title:"Paiement sécurisé", fund:"Fonds", gift:"Don", total:"Total" },
      nav: { about:"À propos", give:"Donner", contact:"Contact" },
      app: {
        soon: "Application bientôt disponible",
        manageSoon: "Gérez vos dons dans notre app (bientôt)",
        footerWhisper: "L’app HOLI arrive bientôt.",
        previewTitle: "Aperçu de l’application HOLI",
        point1: "Voir le prédicateur de dimanche",
        point2: "Recevez des actus en direct de l’église",
        point3: "Regardez les sermons & la louange",
        point4: "Donnez en toute sécurité en quelques secondes",
        point5: "Voir les événements & horaires",
        point6: "Rejoindre un groupe ou une équipe",
        point7: "Envoyer des requêtes de prière",
        close: "Fermer"
      }
    }
  };
  const supportedLangs = ['en','rw','fr'];
  const STATE = { lang: 'en' };

  // ---------- Local storage ----------
  const LS = {
    get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  window.addEventListener('load', () => {
    body.classList.add('loaded');
    const ySpan = document.getElementById('year');
    if (ySpan) ySpan.textContent = new Date().getFullYear();

    startAmbientOscillation();
    initI18n();
    setupGiving();
    setupParallaxFooter();
    setupDevPanel();
    setupManageLinks();
    setupAppTeaser();
    try{ document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff'); }catch{}
  });

  // ---------- Ambient parallax/oscillation ----------
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  let baseX = 0, baseY = 0;
  function setStage(x,y){ root.style.setProperty('--stage-x', x.toFixed(1) + 'px'); root.style.setProperty('--stage-y', y.toFixed(1) + 'px'); }
  window.addEventListener('pointermove', (e) => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 3;
    const dx = (e.clientX - cx) / window.innerWidth;
    const dy = (e.clientY - cy) / window.innerHeight;
    const x = clamp(dx * 18, -20, 20);
    const y = clamp(dy * 14, -16, 16);
    setStage(baseX + x, baseY + y);
  });
  window.addEventListener('scroll', () => { const sc = window.scrollY || 0; baseY = clamp(sc * -0.05, -22, 0); setStage(baseX, baseY); }, {passive:true});
  function startAmbientOscillation(){
    let t = 0; const spd = 0.0018;
    function tick(){ t += spd * 16; const x = Math.sin(t) * 6; const y = Math.cos(t*0.8) * 5; setStage(baseX + x, baseY + y); requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  }

  // ---------- i18n helpers ----------
  function t(key){
    const langMap = i18n[STATE.lang] || i18n.en;
    return key.split('.').reduce((o,k)=> (o && o[k] != null) ? o[k] : null, langMap) ?? key;
  }
  function applyI18n(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n'); const val = t(k); if (val) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el=>{
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(pair=>{
        const [attr, key] = pair.split(':');
        const val = t(key); if (val) el.setAttribute(attr.trim(), val);
      });
    });
  }
  function initI18n(){
    let savedLang = LS.get('holi.lang');
    if (!supportedLangs.includes(savedLang)) {
      savedLang = 'en';
      LS.set('holi.lang', savedLang);
    }
    STATE.lang = savedLang || 'en';

    const langSel = document.getElementById('lang');
    if (langSel) {
      langSel.value = STATE.lang;
      langSel.addEventListener('change', ()=>{
        const next = langSel.value;
        STATE.lang = supportedLangs.includes(next) ? next : 'en';
        LS.set('holi.lang', STATE.lang);
        applyI18n();
        if (STATE._updateSummary) STATE._updateSummary();
      });
    }
    applyI18n();
  }

  // ---------- Payments: shared state & helpers ----------
  const SQ = {}; // will hold instances per open
  function cryptoRandom(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c=>{
      const r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8); return v.toString(16);
    });
  }
  function getSquareCreds(){
    const appId = document.querySelector('meta[name="square:app-id"]')?.content?.trim();
    const locationId = document.querySelector('meta[name="square:location-id"]')?.content?.trim();
    return { appId, locationId };
  }
  async function ensurePayments(){
    if (!window.Square){ showPayError('Square SDK not loaded. Add <script src="https://web.squarecdn.com/v1/square.js"></script>'); return null; }
    if (window.__holi_sq_payments) return window.__holi_sq_payments;
    const { appId, locationId } = getSquareCreds();
    if (!appId || !locationId){ showPayError('Missing Square App ID or Location ID in meta tags.'); return null; }
    try{
      window.__holi_sq_payments = await window.Square.payments(appId, locationId);
      return window.__holi_sq_payments;
    }catch(err){
      showPayError(err?.message || 'Square payments init failed. Check Allowed Domains and IDs.');
      return null;
    }
  }
  function paymentRequestFor(amount){
    const amtStr = (amount ?? 0).toFixed(2);
    return {
      countryCode: 'US',
      currencyCode: 'USD',
      total: { amount: amtStr, label: 'HOLI Gift' },
      requestBillingContact: true
    };
  }
  async function completePayment(sourceId, amount, fundValue, fundLabel, buyerName, buyerEmail){
    try{
      const resp = await fetch('/api/pay', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          sourceId,
          amount: Math.round((amount||0) * 100),
          currency: 'USD',
          fund: fundValue,
          fundLabel,
          buyerName,
          buyerEmail
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) throw new Error(data?.error || 'Payment failed');
      dlog('payment success:', data?.payment?.id);
      return true;
    }catch(err){
      showPayError(err?.message || 'Payment error');
      throw err;
    }
  }
  function showPayError(msg){
    const el = document.getElementById('payError');
    if (!el) { alert(msg); return; }
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  // ---------- Teardown to avoid disappearing wallets on re-open ----------
  async function teardownSquare(){
    const keys = ['card','applePay','googlePay','cashAppPay','ach','giftCard','afterpay'];
    for (const k of keys){
      const inst = SQ[k];
      if (!inst) continue;
      try{
        if (typeof inst.destroy === 'function') { await inst.destroy(); dlog(k, 'destroyed'); }
      }catch(e){ dlog(k, 'destroy error', e); }
      SQ[k] = null;
    }
    // Clear DOM mounts
    const ids = ['card-container','google-pay-button','cash-app-pay-button','afterpay-button','gift-card-container'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
    // Hide wallet shells
    const appleBtn = document.getElementById('applePayBtn');
    const gpayEl  = document.getElementById('google-pay-button');
    const cashEl  = document.getElementById('cash-app-pay-button');
    const aftEl   = document.getElementById('afterpay-button');
    const achBtn  = document.getElementById('achBtn');
    appleBtn && appleBtn.classList.add('hidden');
    gpayEl && gpayEl.classList.add('hidden');
    cashEl && cashEl.classList.add('hidden');
    aftEl && aftEl.classList.add('hidden');
    achBtn && achBtn.classList.add('hidden');
  }

  // ---------- Giving logic (no frequency/fees/receipt) ----------
  function setupGiving(){
    const form = document.getElementById('donationForm');
    if (!form) return;

    const chips = Array.from(form.querySelectorAll('.chip'));
    const amountInput = form.querySelector('#amount');
    const fundSel = form.querySelector('#fund');
    const giveBtn = form.querySelector('#giveBtn');

    const amountError = document.getElementById('amountError');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const summary = document.getElementById('summary');

    // Sheet bits
    const sheet = document.getElementById('paySheet');
    const sFund = document.getElementById('sFund');
    const sBase = document.getElementById('sBase');
    const sTotal = document.getElementById('sTotal');
    const confirmPay = document.getElementById('confirmPay');
    const confirmSpin = document.getElementById('confirmSpin');
    const confirmText = document.getElementById('confirmText');

    // Prefill
    const saved = { fund: LS.get('holi.fund'), name: LS.get('holi.name'), email: LS.get('holi.email') };
    if (saved.fund) fundSel.value = saved.fund;
    if (saved.name) nameInput.value = saved.name;
    if (saved.email) emailInput.value = saved.email;

    const MIN = 1, MAX = 10000;
    const fmtUSD = (n)=> n.toLocaleString(undefined,{style:'currency',currency:'USD'});
    const emailOK = (s)=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");

    function parseAmt(){
      const raw = (amountInput.value || '').replace(/[^\d.]/g,'');
      const n = parseFloat(raw);
      return isFinite(n) ? n : 0;
    }
    function formatInput(){
      const n = parseAmt();
      amountInput.value = n ? n.toFixed(2) : '';
    }
    function setFieldInvalid(inputEl, errorEl, on){
      if (!inputEl || !errorEl) return;
      inputEl.setAttribute('aria-invalid', on ? 'true' : 'false');
      errorEl.classList.toggle('hidden', !on);
    }
    function updateSummary(){
      const amt = parseAmt();
      const invalidAmt = !(amt >= MIN && amt <= MAX);
      setFieldInvalid(amountInput, amountError, invalidAmt);
      const nameMissing = !(nameInput.value || '').trim();
      const emailMissing = !emailOK(emailInput.value);
      setFieldInvalid(nameInput, nameError, nameMissing);
      setFieldInvalid(emailInput, emailError, emailMissing);
      const invalid = invalidAmt || nameMissing || emailMissing;
      giveBtn.disabled = invalid;
      const fundText = fundSel.options[fundSel.selectedIndex].textContent.trim();
      summary.textContent = (!invalid && amt) ? `${fmtUSD(amt)} → ${fundText}. ${i18n[STATE.lang].sheet.total}: ${fmtUSD(amt)}.` : '';
      STATE._updateSummary = updateSummary;
      return !invalid;
    }

    function ensurePaymentDOM(){
      const body = sheet.querySelector('.sheet-body');
      let payErr = document.getElementById('payError');
      if (!payErr){
        payErr = document.createElement('div');
        payErr.id = 'payError';
        payErr.className = 'error hidden';
        body.prepend(payErr);
      }
      let card = document.getElementById('card-container');
      if (!card){ card = document.createElement('div'); card.id = 'card-container'; body.appendChild(card); }
      const pm = sheet.querySelector('.pay-methods') || (()=>{ const w=document.createElement('div'); w.className='pay-methods'; body.prepend(w); return w;})();
      let appleBtn = document.getElementById('applePayBtn');
      if (!appleBtn){ appleBtn = document.createElement('button'); appleBtn.id='applePayBtn'; appleBtn.className='paybtn apple hidden'; appleBtn.type='button'; appleBtn.textContent='Buy with  Pay'; pm.appendChild(appleBtn); }
      let gpayDiv = document.getElementById('google-pay-button');
      if (!gpayDiv){ gpayDiv = document.createElement('div'); gpayDiv.id='google-pay-button'; gpayDiv.className='hidden'; pm.appendChild(gpayDiv); }
      let cashDiv = document.getElementById('cash-app-pay-button');
      if (!cashDiv){ cashDiv = document.createElement('div'); cashDiv.id='cash-app-pay-button'; cashDiv.className='hidden'; pm.appendChild(cashDiv); }
      let afterDiv = document.getElementById('afterpay-button');
      if (!afterDiv){ afterDiv = document.createElement('div'); afterDiv.id='afterpay-button'; afterDiv.className='hidden'; pm.appendChild(afterDiv); }
      let achBtn = document.getElementById('achBtn');
      if (!achBtn){ achBtn = document.createElement('button'); achBtn.id='achBtn'; achBtn.className='paybtn bank hidden'; achBtn.type='button'; achBtn.textContent='Pay from bank (ACH)'; pm.appendChild(achBtn); }
    }

    async function openSheet(){
      if (!updateSummary()) return;
      const amt = parseAmt();
      const fundText = fundSel.options[fundSel.selectedIndex].textContent.trim();
      sFund && (sFund.textContent = fundText);
      sBase && (sBase.textContent = fmtUSD(amt));
      sTotal && (sTotal.textContent = fmtUSD(amt));

      sheet.classList.remove('hidden');
      ensurePaymentDOM();

      const payError = document.getElementById('payError');
      payError && payError.classList.add('hidden');
      confirmPay.disabled = true;

      // Tear down any old instances BEFORE mounting fresh ones
      await teardownSquare();

      // Allow one frame so the sheet is visible (prevents hidden-mount glitches)
      await new Promise(requestAnimationFrame);

      setupSquareForAmount(amt).then((ok)=>{
        if (ok) { confirmPay.disabled = false; confirmPay.focus(); }
      }).catch((err)=>{
        showPayError(err?.message || 'Failed to initialize payment form.');
      });
    }
    async function closeSheet(){
      sheet.classList.add('hidden');
      await teardownSquare(); // ensure clean state for next open
    }

    document.getElementById('openReceipt')?.addEventListener('click', (e)=> e.preventDefault());
    document.getElementById('previewBtn')?.addEventListener('click', (e)=> e.preventDefault());
    sheet.addEventListener('click', (e) => { if (e.target.matches('[data-close]')) closeSheet(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeSheet(); } });

    confirmPay.addEventListener('click', async () => {
      confirmPay.disabled = true; confirmSpin.classList.remove('hidden');
      confirmText.textContent = i18n[STATE.lang].confirmGive + '…';
      try{
        if (!SQ.card) throw new Error('Card not ready');
        const res = await SQ.card.tokenize();
        if (res.status !== 'OK') throw new Error(res?.errors?.[0]?.message || 'Could not tokenize card');
        await completePayment(res.token, parseAmt(), fundSel.value, fundSel.options[fundSel.selectedIndex]?.textContent.trim(), nameInput.value.trim(), emailInput.value.trim());
        showToast('Gift received. Thank you!');
        try{ confettiBurst(); }catch{}
        closeSheet();
      }catch(err){
        showPayError(err?.message || 'Payment error');
      }finally{
        confirmSpin.classList.add('hidden'); confirmText.textContent = i18n[STATE.lang].confirmGive; confirmPay.disabled = false;
      }
    });

    // Init
    updateSummary();
    giveBtn.addEventListener('click', openSheet);
  }

  // ---------- Square mount logic (idempotent, deterministic) ----------
  async function setupSquareForAmount(amount){
    const payments = await ensurePayments();
    if (!payments) { showPayError("Square not initialized (check App ID, Location ID, HTTPS, Allowed Domains)."); return false; }

    // Elements
    const cardContainer = document.getElementById('card-container');
    const appleBtn = document.getElementById('applePayBtn');
    const gpayEl = document.getElementById('google-pay-button');
    const cashAppEl = document.getElementById('cash-app-pay-button');
    const afterpayEl = document.getElementById('afterpay-button');
    const achBtn = document.getElementById('achBtn');

    // Ensure clean state
    cardContainer && (cardContainer.innerHTML = '');
    gpayEl && (gpayEl.innerHTML = '');
    cashAppEl && (cashAppEl.innerHTML = '');
    afterpayEl && (afterpayEl.innerHTML = '');

    // Wait one frame so sheet is fully visible
    await new Promise(requestAnimationFrame);

    // CARD (should always render)
    try {
      SQ.card = await payments.card();
      await SQ.card.attach('#card-container');
      dlog('card: attached');
    } catch (e) {
      dlog('card: failed', e);
      showPayError('Could not load card input. Check Console for details.');
    }

    const pr = ()=> paymentRequestFor(amount);

    // APPLE PAY
    try {
      if (!('ApplePaySession' in window)) {
        dlog('applePay: not supported on this browser');
        appleBtn && appleBtn.classList.add('hidden');
      } else {
        const ap = await payments.applePay(pr());
        const can = await ap.canMakePayment();
        dlog('applePay.canMakePayment:', can);
        if (can && appleBtn) {
          SQ.applePay = ap;
          appleBtn.classList.remove('hidden');
          appleBtn.onclick = async (e)=>{
            e.preventDefault();
            try{
              const res = await SQ.applePay.tokenize();
              if (res?.status === 'OK') await completePayment(res.token, amount);
              else showPayError(res?.errors?.[0]?.message || 'Apple Pay error');
            }catch(err){ showPayError(err?.message || 'Apple Pay error'); }
          };
        } else { appleBtn && appleBtn.classList.add('hidden'); }
      }
    } catch (e) {
      dlog('applePay init error:', e);
      appleBtn && appleBtn.classList.add('hidden');
    }

    // GOOGLE PAY
    try {
      const gp = await payments.googlePay(pr());
      const can = await gp.canMakePayment();
      dlog('googlePay.canMakePayment:', can);
      if (can) {
        SQ.googlePay = gp;
        await gp.attach('#google-pay-button');
        gpayEl && gpayEl.classList.remove('hidden');
      } else { gpayEl && gpayEl.classList.add('hidden'); }
    } catch (e) {
      dlog('googlePay init error:', e);
      gpayEl && gpayEl.classList.add('hidden');
    }

    // CASH APP PAY
    try {
      const cap = await payments.cashAppPay(pr(), { redirectURL: location.origin + location.pathname });
      await cap.attach('#cash-app-pay-button');
      SQ.cashAppPay = cap;
      cashAppEl && cashAppEl.classList.remove('hidden');
      cap.addEventListener('ontokenization', async (ev)=>{
        const { tokenResult, error } = ev.detail || {};
        if (error) return showPayError(error?.message || 'Cash App Pay error');
        if (tokenResult?.status === 'OK') await completePayment(tokenResult.token, amount);
      });
      dlog('cashAppPay: attached');
    } catch (e) {
      dlog('cashAppPay init error (likely not enabled/region):', e);
      cashAppEl && cashAppEl.classList.add('hidden');
    }

    // AFTERPAY/CLEARPAY (optional)
    try{
      const apcp = await payments.afterpayClearpay(pr());
      await apcp.attach('#afterpay-button');
      SQ.afterpay = apcp;
      afterpayEl && afterpayEl.classList.remove('hidden');
      afterpayEl?.addEventListener('click', async (e)=>{
        e.preventDefault();
        try{
          const res = await apcp.tokenize();
          if (res?.status === 'OK') await completePayment(res.token, amount);
          else showPayError(res?.errors?.[0]?.message || 'Afterpay/Clearpay error');
        }catch(err){ showPayError(err?.message || 'Afterpay/Clearpay error'); }
      });
      dlog('afterpay: attached');
    } catch (e) {
      dlog('afterpay init error:', e);
      afterpayEl && afterpayEl.classList.add('hidden');
    }

    // ACH (optional)
    try {
      SQ.ach = await payments.ach({ redirectURI: location.origin + location.pathname, transactionId: cryptoRandom() });
      achBtn && achBtn.classList.remove('hidden');
      achBtn && (achBtn.onclick = async (e)=>{
        e.preventDefault();
        try{
          SQ.ach.addEventListener('ontokenization', async (ev)=>{
            const { tokenResult, error } = ev.detail || {};
            if (error) return showPayError(String(error));
            if (tokenResult?.status === 'OK') await completePayment(tokenResult.token, amount);
          });
          await SQ.ach.tokenize({
            accountHolderName: (document.getElementById('name')?.value || 'Donor').trim(),
            intent: 'CHARGE',
            amount: amount.toFixed(2),
            currency: 'USD'
          });
        }catch(err){ showPayError(err?.message || 'ACH error'); }
      });
    } catch (e) {
      dlog('ach init error:', e);
      achBtn && achBtn.classList.add('hidden');
    }

    return true;
  }

  // ---------- Footer micro-parallax ----------
  function setupParallaxFooter(){
    const links = Array.from(document.querySelectorAll('.drift-link'));
    function onScroll(){
      const max = 4; const p = Math.min(1, (window.scrollY || 0) / 600);
      const y = -p * max;
      links.forEach((a)=> a.style.transform = `translateY(${y}px)`);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  // ---------- Dev Neon Dial ----------
  function setupDevPanel(){
    const params = new URLSearchParams(location.search);
    const dev = params.get('dev') === '1';
    const panel = document.getElementById('devPanel');
    if (!dev || !panel) return;
    panel.classList.remove('hidden');
    const dial = document.getElementById('neonDial');
    const val = document.getElementById('neonVal');
    function set(v){ root.style.setProperty('--neon-strength', v); val.textContent = `${(+v).toFixed(1)}×`; }
    dial.addEventListener('input', ()=> set(dial.value));
    set(dial.value);
  }

  // ---------- Manage links (stub) ----------
  function setupManageLinks(){
    const url = '#';
    const a1 = document.getElementById('manageLink');
    const a2 = document.getElementById('manageLinkMobile');
    if (a1) a1.href = url;
    if (a2) a2.href = url;
  }

  // ---------- App teaser modal ----------
  function setupAppTeaser(){
    const modal = document.getElementById('appModal');
    const openers = ['appPill','appLink','appFooterLink']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    function open(){ modal && modal.classList.remove('hidden'); }
    async function close(){ modal && modal.classList.add('hidden'); }
    openers.forEach(el => el.addEventListener('click', open));
    if (modal){ modal.addEventListener('click', (e)=>{ if (e.target.matches('[data-close]')) close(); }); }
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });
  }

  // ---------- Toast ----------
  function showToast(msg){
    const toast = document.getElementById('toast'); if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    requestAnimationFrame(()=> toast.classList.add('show'));
    setTimeout(()=> { toast.classList.remove('show'); setTimeout(()=> toast.classList.add('hidden'), 250); }, 2200);
  }

  // ---------- Confetti ----------
  function confettiBurst(){
    const c = document.createElement('canvas');
    c.style.position = 'fixed'; c.style.inset = '0'; c.style.pointerEvents = 'none'; c.style.zIndex = '80';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    let W,H; const P=[]; const N=120; const G=0.15;
    function resize(){ W= c.width = innerWidth; H = c.height = innerHeight; }
    resize(); addEventListener('resize', resize, {passive:true});
    for(let i=0;i<N;i++) P.push({x:Math.random()*W,y:-20-Math.random()*H*0.3, vx:(Math.random()-0.5)*6, vy:Math.random()*2, sz:2+Math.random()*3, a:1});
    let t=0;
    (function tick(){
      t+=1/60; ctx.clearRect(0,0,W,H);
      for(const p of P){
        p.vy += G; p.x += p.vx; p.y += p.vy; p.a -= 0.006;
        ctx.globalAlpha = Math.max(0,p.a);
        ctx.fillStyle = `hsl(${(t*120 + p.x)%360} 80% 60%)`;
        ctx.fillRect(p.x,p.y,p.sz,p.sz);
      }
      if (P.some(p=>p.a>0 && p.y<H+10)) requestAnimationFrame(tick);
      else document.body.removeChild(c);
    })();
  }

})();
