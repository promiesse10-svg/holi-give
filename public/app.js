// app.js — i18n + local save + Square Web Payments SDK (Card, ApplePay, GooglePay, Cash App Pay, ACH, Gift Card, Afterpay) + app teaser
(function(){
  const root = document.documentElement;
  const body = document.body;

  // ---------------- i18n ----------------
  const i18n = {
    en: {
      scripture: "“A new command I give you: Love one another. As I have loved you, so you must love one another. By this everyone will know that you are my disciples, if you love one another.” — John 13:34–35",
      amountLabel: "Amount",
      amountPlaceholder: "Enter amount",
      amountHelp: "Minimum $1.00. (Tip: use the chips or type a custom amount.)",
      amountError: "Enter a valid amount between $1 and $10,000.",
      fundLabel: "Fund",
      Tithe: "Tithe",
      Offering: "Offering",
      Missions: "Missions",
      "Building Fund": "Building Fund",
      name: "Your Name (required once)",
      email: "Email (required once)",
      giveNow: "Give Now",
      sheet: { title:"Secure Payment", fund:"Fund", gift:"Gift", total:"Total", demo:"Payments processed securely by Square." },
      cancel: "Cancel",
      confirmGive: "Confirm & Give",
      app: {
        soon: "App coming soon",
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
      Tithe: "Icyacumi",
      Offering: "Ituro",
      Missions: "Ivugabutumwa",
      "Building Fund": "Ikigega cy'ubwubatsi",
      name: "Izina ryawe (bikenewe rimwe)",
      email: "Imeli (bikenewe rimwe)",
      giveNow: "Tanga Ubu",
      sheet: { title:"Kwishyura kwizewe", fund:"Ikigega", gift:"Ituro", total:"Igiteranyo", demo:"Ubwishyu bukorwa mu buryo bwizewe na Square." },
      cancel: "Hagarika",
      confirmGive: "Emeza utange",
      app: {
        soon: "Porogaramu (app) iraje vuba",
        previewTitle: "Igaragaza Porogaramu ya HOLI",
        point1: "Reba umuvugabutumwa wo kuri iki cyumweru",
        point2: "Wakire amakuru y'ako kanya y'itorero",
        point3: "Reba inyigisho n'ibyo kuramya",
        point4: "Tanga mu buryo bwizewe vuba",
        point5: "Reba ibirori n'amasaha y'ibadahiro",
        point6: "Injira mu itsinda cyangwa itsinda ry'abakora",
        point7: "Ohereza ibyifuzo by'amasengesho",
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
      Tithe: "Dîme",
      Offering: "Offrande",
      Missions: "Missions",
      "Building Fund": "Fonds de construction",
      name: "Votre nom (requis une fois)",
      email: "E-mail (requis une fois)",
      giveNow: "Donner maintenant",
      sheet: { title:"Paiement sécurisé", fund:"Fonds", gift:"Don", total:"Total", demo:"Paiements traités en toute sécurité par Square." },
      cancel: "Annuler",
      confirmGive: "Confirmer et donner",
      app: {
        soon: "Application bientôt disponible",
        previewTitle: "Aperçu de l’application HOLI",
        point1: "Voir le prédicateur de ce dimanche",
        point2: "Recevoir des mises à jour en temps réel",
        point3: "Regarder les prédications et la louange",
        point4: "Donner en toute sécurité en quelques secondes",
        point5: "Voir les événements et les horaires",
        point6: "Rejoindre un groupe ou l'équipe de service",
        point7: "Envoyer des requêtes de prière",
        close: "Fermer"
      }
    }
  };

  const supportedLangs = ['en','rw','fr'];
  const STATE = { lang: 'en' };

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
    setupAppTeaser();
  });

  // ----- Ambient parallax/oscillation -----
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

  // ----- i18n -----
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

  // ---------------- Giving + Square sheet ----------------
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

    const sheet = document.getElementById('paySheet');
    const sFund = document.getElementById('sFund');
    const sBase = document.getElementById('sBase');
    const sTotal = document.getElementById('sTotal');
    const confirmPay = document.getElementById('confirmPay');
    const confirmSpin = document.getElementById('confirmSpin');
    const confirmText = document.getElementById('confirmText');
    const payError = document.getElementById('payError');

    const appleBtn = document.getElementById('apple-pay-button');
    const gpayEl  = document.getElementById('google-pay-button');
    const cashAppEl = document.getElementById('cash-app-pay-button');
    const achBtn  = document.getElementById('ach-button');
    const giftCardEl = document.getElementById('gift-card-container');
    const giftCardBtn = document.getElementById('gift-card-button');
    const afterpayEl = document.getElementById('afterpay-button');

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
      summary.textContent = (!invalid && amt)
        ? `${fmtUSD(amt)} → ${fundText}. ${i18n[STATE.lang].sheet.total}: ${fmtUSD(amt)}.`
        : '';
      STATE._updateSummary = updateSummary;
      return !invalid;
    }

    // Persist prefs
    fundSel.addEventListener('change', ()=>{ LS.set('holi.fund', fundSel.value); updateSummary(); });
    nameInput.addEventListener('blur', ()=>{ const v=nameInput.value.trim(); if(v){ LS.set('holi.name', v); } updateSummary(); });
    emailInput.addEventListener('blur', ()=>{ const v=emailInput.value.trim(); if(emailOK(v)){ LS.set('holi.email', v); } updateSummary(); });

    // Interactions
    chips.forEach(ch => ch.addEventListener('click', () => {
      chips.forEach(x => x.classList.remove('on'));
      ch.classList.add('on');
      amountInput.value = parseFloat(ch.dataset.amount).toFixed(2);
      updateSummary();
      amountInput.focus();
    }));
    amountInput.addEventListener('input', () => { chips.forEach(x => x.classList.remove('on')); updateSummary(); });
    amountInput.addEventListener('blur', () => { formatInput(); updateSummary();
      const v = parseAmt(); const match = chips.find(c => parseFloat(c.dataset.amount) === v); if (match) match.classList.add('on');
    });
    amountInput.addEventListener('keydown', (e)=>{ if (e.key === 'Enter'){ e.preventDefault(); if (updateSummary()) openSheet(); } });
    giveBtn.addEventListener('click', ()=> { if (updateSummary()) openSheet(); });

    // Sheet open/close
    let cardReadyPromise = null;
    function openSheet(){
      if (!updateSummary()) return;
      const amt = parseAmt();
      const fundText = fundSel.options[fundSel.selectedIndex].textContent.trim();

      sFund.textContent = fundText;
      sBase.textContent = fmtUSD(amt);
      sTotal.textContent = fmtUSD(amt);

      sheet.classList.remove('hidden');
      payError.classList.add('hidden');
      confirmPay.disabled = true;

      cardReadyPromise = setupSquareForAmount(amt)
        .then((ok)=>{
          if (!ok) { showPayError("Square isn’t initialized. Check App ID, Location ID, HTTPS, and allowed domain."); return; }
          confirmPay.disabled = false;
          confirmPay.focus();
        })
        .catch(err=> showPayError(err?.message || "Failed to initialize payment form."));
    }
    function closeSheet(){ sheet.classList.add('hidden'); }
    sheet.addEventListener('click', (e) => { if (e.target.matches('[data-close]')) closeSheet(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeSheet(); } });

    function showPayError(msg){
      payError.textContent = msg;
      payError.classList.remove('hidden');
    }

    // ----- Square client setup -----
    let SQ = { payments:null, card:null, applePay:null, googlePay:null, cashAppPay:null, ach:null, giftCard:null, afterpay:null };

    function readSquareIds(){
      const appId = (document.querySelector('meta[name="square:app-id"]')||{}).content || '';
      const locationId = (document.querySelector('meta[name="square:location-id"]')||{}).content || '';
      return { appId, locationId };
    }

    async function ensurePayments(){
      if (SQ.payments) return SQ.payments;
      const { appId, locationId } = readSquareIds();
      if (!window.Square) return null;
      if (!appId || !locationId) return null;
      try {
        SQ.payments = window.Square.payments(appId, locationId);
        return SQ.payments;
      } catch (e) { return null; }
    }

    function paymentRequestFor(amount, opts={}){
      // For Afterpay, we must include requestShippingContact (can be false)
      return SQ.payments.paymentRequest({
        countryCode: 'US',
        currencyCode: 'USD',
        total: { amount: amount.toFixed(2), label: 'Total' },
        requestShippingContact: !!opts.requestShippingContact
      });
    }

    function uuid(){
      if (window.crypto?.randomUUID) return crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
        const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16);
      });
    }

    async function setupSquareForAmount(amount){
      const payments = await ensurePayments();
      if (!payments) return false;

      // Clear mounts
      document.querySelector('#card-container').innerHTML = '';
      gpayEl.innerHTML = '';
      cashAppEl.innerHTML = '';
      afterpayEl.innerHTML = '';
      giftCardEl.innerHTML = '';

      // CARD
      SQ.card = await payments.card();
      await SQ.card.attach('#card-container');

      // APPLE PAY
      try {
        const pr = paymentRequestFor(amount);
        const ap = await payments.applePay(pr);
        const canApple = await ap.canMakePayment();
        if (canApple) {
          SQ.applePay = ap;
          appleBtn.classList.remove('hidden');
          appleBtn.onclick = (e)=> handleWalletTokenize(e, SQ.applePay);
        } else { appleBtn.classList.add('hidden'); }
      } catch { appleBtn.classList.add('hidden'); }

      // GOOGLE PAY
      try {
        const pr = paymentRequestFor(amount);
        const gp = await payments.googlePay(pr);
        const canGoogle = await gp.canMakePayment();
        if (canGoogle) {
          SQ.googlePay = gp;
          await gp.attach('#google-pay-button');
          gpayEl.classList.remove('hidden');
          gpayEl.addEventListener('click', (e)=> handleWalletTokenize(e, SQ.googlePay));
        } else { gpayEl.classList.add('hidden'); }
      } catch { gpayEl.classList.add('hidden'); }

      // CASH APP PAY
      try {
        const pr = paymentRequestFor(amount);
        const cap = await payments.cashAppPay(pr, { redirectURL: window.location.href });
        await cap.attach('#cash-app-pay-button');
        SQ.cashAppPay = cap;
        cashAppEl.classList.remove('hidden');
        cap.addEventListener('ontokenization', async (ev)=>{
          const { tokenResult, error } = ev.detail || {};
          if (error) return showPayError(error?.message || 'Cash App Pay error');
          if (tokenResult?.status === 'OK') await completePayment(tokenResult.token);
        });
      } catch { cashAppEl.classList.add('hidden'); }

      // ACH (US only)
      try {
        SQ.ach = await payments.ach({
          redirectURI: window.location.href,
          transactionId: uuid()
        });
        achBtn.classList.remove('hidden');
        achBtn.onclick = async (e)=>{
          e.preventDefault();
          try{
            SQ.ach.addEventListener('ontokenization', async (ev)=>{
              const { tokenResult, error } = ev.detail || {};
              if (error) return showPayError(String(error));
              if (tokenResult?.status === 'OK') await completePayment(tokenResult.token);
            });
            await SQ.ach.tokenize({
              accountHolderName: (nameInput.value || 'Donor').trim(),
              intent: 'CHARGE',
              amount: amount.toFixed(2),
              currency: 'USD'
            });
          }catch(err){ showPayError(err?.message || 'ACH error'); }
        };
      } catch { achBtn.classList.add('hidden'); }

      // GIFT CARD
      try{
        SQ.giftCard = await payments.giftCard();
        await SQ.giftCard.attach('#gift-card-container');
        giftCardEl.classList.remove('hidden');
        giftCardBtn.classList.remove('hidden');
        giftCardBtn.onclick = async (e)=>{
          e.preventDefault();
          try{
            const res = await SQ.giftCard.tokenize();
            if (res?.status === 'OK') await completePayment(res.token);
            else showPayError(res?.errors?.[0]?.message || 'Gift card error');
          }catch(err){ showPayError(err?.message || 'Gift card error'); }
        };
      } catch { giftCardEl.classList.add('hidden'); giftCardBtn.classList.add('hidden'); }

      // AFTERPAY/CLEARPAY (availability varies by region/account)
      try{
        const pr = paymentRequestFor(amount, { requestShippingContact: false });
        const apcp = await payments.afterpayClearpay(pr);
        await apcp.attach('#afterpay-button');
        afterpayEl.classList.remove('hidden');
        afterpayEl.addEventListener('click', async (e)=>{
          e.preventDefault();
          try{
            const res = await apcp.tokenize();
            if (res?.status === 'OK') await completePayment(res.token);
            else showPayError(res?.errors?.[0]?.message || 'Afterpay/Clearpay error');
          }catch(err){ showPayError(err?.message || 'Afterpay/Clearpay error'); }
        });
      } catch { afterpayEl.classList.add('hidden'); }

      return true;
    }

    // Confirm (Card)
    confirmPay.addEventListener('click', async (e)=>{
      e.preventDefault();
      if (cardReadyPromise) { try { await cardReadyPromise; } catch {} }
      const method = SQ.card;
      if (!method || typeof method.tokenize !== 'function'){
        showPayError("Card isn’t ready yet. Please wait a second and try again.");
        return;
      }
      await withSpinner(async ()=>{
        const tokenResult = await method.tokenize();
        if (tokenResult.status !== 'OK') throw new Error(tokenResult.errors?.[0]?.message || 'Card tokenization failed');
        await completePayment(tokenResult.token);
      });
    });

    async function handleWalletTokenize(event, method){
      event.preventDefault();
      if (!method) return;
      await withSpinner(async ()=>{
        const tokenResult = await method.tokenize();
        if (tokenResult.status !== 'OK') throw new Error(tokenResult.errors?.[0]?.message || 'Tokenization failed');
        await completePayment(tokenResult.token);
      });
    }

    async function withSpinner(fn){
      confirmPay.disabled = true; confirmSpin.classList.remove('hidden'); confirmText.textContent = i18n[STATE.lang].confirmGive + '…';
      try{ await fn(); }
      catch(err){ showPayError(err?.message || 'Payment error'); }
      finally{ confirmSpin.classList.add('hidden'); confirmText.textContent = i18n[STATE.lang].confirmGive; confirmPay.disabled = false; }
    }

    async function completePayment(sourceId){
      const amt = parseAmt();
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          amount: Math.round(amt * 100),
          currency: 'USD',
          fund: fundSel.value,
          fundLabel: fundSel.options[fundSel.selectedIndex].textContent.trim(),
          buyerName: nameInput.value.trim(),
          buyerEmail: emailInput.value.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Payment failed');

      // Save contact for next time
      const nm = nameInput.value.trim(); const em = emailInput.value.trim();
      if (nm) LS.set('holi.name', nm);
      if (emailOK(em)) LS.set('holi.email', em);

      closeSheet();
      confettiBurst();
      const fundText = fundSel.options[fundSel.selectedIndex].textContent.trim();
      showToast(`Gift received — thank you!`);
      document.getElementById('summary').textContent = `$${amt.toFixed(2)} → ${fundText} • ${i18n[STATE.lang].sheet.total}: $${amt.toFixed(2)}.`;
    }

    // Init
    updateSummary();
  }

  // Toast
  function showToast(msg){
    const toast = document.getElementById('toast'); if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    requestAnimationFrame(()=> toast.classList.add('show'));
    setTimeout(()=> { toast.classList.remove('show'); setTimeout(()=> toast.classList.add('hidden'), 250); }, 2200);
  }

  // Confetti
  function confettiBurst(){
    const n = 18;
    for (let i=0;i<n;i++){
      const s = document.createElement('span');
      s.style.position='fixed'; s.style.left='50%'; s.style.top='20%';
      s.style.width='6px'; s.style.height='6px'; s.style.borderRadius='2px';
      s.style.background= `hsl(${Math.floor(Math.random()*360)}, 85%, 58%)`;
      s.style.transform = 'translate(-50%,-50%)';
      s.style.zIndex='80'; s.style.pointerEvents='none'; s.style.opacity='1';
      document.body.appendChild(s);
      const dx = (Math.random()*2-1)*180, dy = 240 + Math.random()*240, rot = Math.random()*720;
      s.animate([{transform:'translate(-50%,-50%) rotate(0deg)'},{transform:`translate(${dx}px,${dy}px) rotate(${rot}deg)`}],{duration:900+Math.random()*600,easing:'cubic-bezier(.2,.8,.2,1)'});
      setTimeout(()=> s.remove(), 1600);
    }
  }

  // Footer micro-parallax drift
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

  // Dev Neon Dial (?dev=1 shows panel)
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

  // App teaser modal wiring
  function setupAppTeaser(){
    const modal = document.getElementById('appModal');
    const openers = ['appPill'].map(id => document.getElementById(id)).filter(Boolean);
    function open(){ modal && modal.classList.remove('hidden'); }
    function close(){ modal && modal.classList.add('hidden'); }
    openers.forEach(el => el.addEventListener('click', open));
    if (modal){ modal.addEventListener('click', (e)=>{ if (e.target.matches('[data-close]')) close(); }); }
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });
  }

  // theme-color
  try{ document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff'); }catch{}
})();
