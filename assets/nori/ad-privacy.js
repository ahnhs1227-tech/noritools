/* Google Privacy & messaging consent controls; no tool input is collected. */
(function () {
  'use strict';
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  function ready() {
    var link = document.getElementById('nori-ad-privacy');
    if (!link) return;
    link.addEventListener('click', function (event) {
      event.preventDefault();
      window.googlefc.callbackQueue.push({ CONSENT_API_READY: function () {
        window.googlefc.showRevocationMessage();
      }});
    });
    window.googlefc.callbackQueue.push({ CONSENT_API_READY: function () {
      if (typeof window.__tcfapi !== 'function') return;
      window.__tcfapi('addEventListener', 2, function (data, success) {
        if (success && data && data.gdprApplies === true) {
          link.hidden = false;
          link.style.removeProperty('display');
        }
      });
    }});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
