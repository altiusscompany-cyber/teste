/*
 * Form de Consultoria Cirúrgica DENTRO da página do site da Dra. Beatriz Ribas.
 *
 * 1) Na seção #agendar da home, coloque onde o form deve aparecer:
 *      <div id="form-consultoria"></div>
 * 2) Antes de </body> em TODAS as páginas do site:
 *      <script src="/consultoria/form-secao.js" defer></script>
 *
 * O que acontece:
 *  - Todo link de WhatsApp (wa.me, api.whatsapp.com, web.whatsapp.com, whatsapp://) passa a
 *    rolar a página até o form. Em páginas sem o form, leva para a home já na seção #agendar.
 *  - O botão clicado, a página e as UTMs/fbclid vão junto para o lead no Kommo.
 *  - Exceção: um link com o atributo data-whatsapp-direto continua indo direto ao WhatsApp.
 *  - Qualquer outro botão pode abrir o form com o atributo data-abrir-form.
 */
(function () {
  var FORM_URL = '/consultoria/index.html';
  var HOME_SECTION = '/#agendar';
  var WA_RE = /(wa\.me\/|api\.whatsapp\.com|web\.whatsapp\.com|^whatsapp:)/i;
  var TRACK = ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ad_id'];

  var params = new URLSearchParams(location.search);
  var ATTR_KEYS = ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ad_id'];
  // Guarda de onde a pessoa chegou (anúncio, bio, Google...) por 30 dias, para o form saber o canal
  // mesmo que ela navegue por outras páginas antes de preencher.
  (function guardarOrigem() {
    var a = {}, tem = false;
    ATTR_KEYS.forEach(function (k) { if (params.get(k)) { a[k] = params.get(k); tem = true; } });
    if (tem) document.cookie = 'pt_attr=' + encodeURIComponent(JSON.stringify(a)) + '; path=/; max-age=2592000; SameSite=Lax';
  })();
  var box, frame, ready = false, pendingBotao = params.get('botao') || '';

  function mount() {
    box = document.getElementById('form-consultoria');
    if (!box) return;
    var st = document.createElement('style');
    st.textContent =
      '#form-consultoria{position:relative;width:100%;height:min(100vh,860px);min-height:620px;border-radius:28px;overflow:hidden;background:#F1F2F5}' +
      '#form-consultoria iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}' +
      '@media (max-width:600px){#form-consultoria{height:100svh;min-height:600px;border-radius:0;margin-left:calc(50% - 50vw);width:100vw}}';
    document.head.appendChild(st);

    var q = new URLSearchParams({ embed: '1', page: location.href.split('#')[0] });
    TRACK.forEach(function (k) { if (params.get(k)) q.set(k, params.get(k)); });
    if (pendingBotao) q.set('botao', pendingBotao);

    frame = document.createElement('iframe');
    frame.title = 'Formulário de agendamento da consultoria cirúrgica';
    frame.loading = 'lazy';
    frame.src = FORM_URL + '?' + q.toString();
    box.appendChild(frame);

    if (location.hash === '#agendar' || location.hash === '#form-consultoria') {
      setTimeout(function () { scrollToForm(); }, 300);
    }
  }

  function scrollToForm() {
    // desconta o cabeçalho fixo do site, se houver
    var topo = document.querySelector('.topo');
    var y = box.getBoundingClientRect().top + window.pageYOffset - (topo ? topo.offsetHeight + 12 : 10);
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function sendBotao(label) {
    pendingBotao = label;
    if (frame && ready) frame.contentWindow.postMessage({ lpForm: 'botao', botao: label, page: location.href.split('#')[0] }, location.origin);
  }

  // intercepta cliques em fase de captura (passa na frente de outros scripts/plugins)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href], [data-abrir-form]');
    if (!a || a.hasAttribute('data-whatsapp-direto')) return;
    var href = a.getAttribute('href') || '';
    if (!a.hasAttribute('data-abrir-form') && !WA_RE.test(href)) return;
    e.preventDefault(); e.stopPropagation();

    var label = (a.innerText || a.getAttribute('aria-label') || a.title || 'whatsapp').trim().slice(0, 100);
    if (window.fbq) window.fbq('trackCustom', 'AbriuFormConsultoria', { botao: label });

    if (box) { sendBotao(label); scrollToForm(); return; }

    // página sem o form: vai para a home já na seção, levando UTMs e o botão
    var q = new URLSearchParams();
    TRACK.forEach(function (k) { if (params.get(k)) q.set(k, params.get(k)); });
    q.set('botao', label);
    location.href = HOME_SECTION.replace('#', '?' + q.toString() + '#');
  }, true);

  // mensagens vindas do form
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || !e.data.lpForm || !box) return;
    if (e.data.lpForm === 'ready') { ready = true; if (pendingBotao) sendBotao(pendingBotao); }
    if (e.data.lpForm === 'step') {
      // garante que o topo do form esteja visível a cada nova pergunta
      var r = box.getBoundingClientRect();
      if (r.top < -40 || r.top > window.innerHeight * 0.4) scrollToForm();
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.abrirFormConsultoria = function (label) { if (box) { sendBotao(label || 'manual'); scrollToForm(); } else location.href = HOME_SECTION; };
})();
