// Suíte principal do SIM. — roda com: npm test
const { load } = require('./harness');

load().then(({ w, d, A, base, novaData, errors, results }) => {
  const $ = id => d.getElementById(id);
  const t = w.t, setLang = w.setLang, go = w.go;

  // ---------- L. carga sem erros ----------
  try {
    A('L1 app carrega sem erros de console', errors.length === 0);
    if (errors.length) console.log('   erros:', errors.slice(0, 4));
    A('L2 funções principais existem', ['go','openSheet','closeSheet','saveExpense','finalizePay','setLang','t','buildReportDoc','simHandleBack'].every(f => typeof w[f] === 'function'));
  } catch (e) { results.fail++; results.fails.push('L EXCEÇÃO: ' + e.message); }

  // ---------- NAV ----------
  try {
    go('fin'); A('NAV1 vai para Dinheiro', $('s-fin').classList.contains('on'));
    go('forn'); A('NAV2 vai para Fornecedores', $('s-forn').classList.contains('on'));
    go('home'); A('NAV3 volta para Início', $('s-home').classList.contains('on'));
    A('NAV4 nav destaca a aba ativa', d.querySelector('.nav button[data-s=home]').classList.contains('on'));
  } catch (e) { results.fail++; results.fails.push('NAV EXCEÇÃO: ' + e.message); }

  // ---------- I18N: motor + login ----------
  try {
    const I = w.I18N, LANGS = w.I18N_LANGS;
    A('I1 quatro idiomas com login_head', LANGS.length === 4 && ['pt','es','en','fr'].every(l => I[l] && I[l].login_head));
    setLang('pt'); A('I2 t() PT', t('login_go_up') === 'Começar grátis');
    setLang('es'); A('I3 ES', t('login_go_up') === 'Empezar gratis');
    setLang('en'); A('I4 EN', t('login_go_up') === 'Get started free');
    setLang('fr'); A('I5 FR', t('login_go_up') === 'Commencer gratuitement');
    setLang('zz'); A('I6 idioma inválido cai pro PT', w.SIMLANG === 'pt');
    A('I7 detectLang válido', LANGS.includes(w.detectLang()));
    setLang('es');
    A('I8 applyI18n traduz manchete', d.querySelector('#login .lghead').innerHTML.includes('Dijiste'));
    A('I9 applyI18n traduz placeholder', $('lgEmail').getAttribute('placeholder') === 'tu@correo.com');
    A('I10 botão segue authMode+idioma', $('lgGo').textContent === 'Empezar gratis');
    setLang('pt');
  } catch (e) { results.fail++; results.fails.push('I18N EXCEÇÃO: ' + e.message); }

  // ---------- I18N: navegação + cabeçalhos ----------
  try {
    setLang('es');
    A('IN1 nav traduz', d.querySelector('.nav button[data-s=fin] span').textContent === 'Dinero');
    A('IN2 cabeçalho Dinheiro traduz', $('s-fin').querySelector('.sec').textContent === 'Dinero');
    A('IN3 cabeçalho Fornecedores traduz', $('s-forn').querySelector('.sec').textContent === 'Proveedores');
    setLang('fr');
    A('IN4 nav em FR', d.querySelector('.nav button[data-s=guests] span').textContent === 'Invités');
    setLang('pt');
    A('IN5 volta pro PT', d.querySelector('.nav button[data-s=fin] span').textContent === 'Dinheiro');
  } catch (e) { results.fail++; results.fails.push('I18N-NAV EXCEÇÃO: ' + e.message); }

  // ---------- I18N: tela Dinheiro ----------
  try {
    setLang('es');
    A('ID1 botão adicionar', d.querySelector('#s-fin .add span[data-i18n]').textContent === 'Agregar gasto');
    A('ID2 salvar despesa', d.querySelector('[data-i18n=exp_save]').textContent === 'Guardar gasto');
    A('ID3 placeholder descrição', $('exDesc').getAttribute('placeholder') === 'Ej.: Anticipo del salón');
    A('ID4 categoria sugerida', d.querySelector('[data-i18n=cat_opt_venue]').textContent === 'Salón');
    A('ID5 toast dinâmico', t('m_paid') === 'Cuota pagada · ' && t('exp_title_edit') === 'Editar gasto');
    A('ID6 card "Comprometido"', d.querySelector('[data-i18n=money_committed]').textContent === 'Comprometido:');
    setLang('pt');
    A('ID7 volta pro PT', d.querySelector('[data-i18n=exp_save]').textContent === 'Salvar despesa');
  } catch (e) { results.fail++; results.fails.push('I18N-DIN EXCEÇÃO: ' + e.message); }

  // ---------- I18N: tela Fornecedores ----------
  try {
    setLang('es');
    A('IV1 ficha de orçamento: salvar', d.querySelector('[data-i18n=q_save]').textContent === 'Guardar presupuesto');
    A('IV2 ficha: rótulo fornecedor', d.querySelector('[data-i18n=q_vendor_label]').textContent === 'Proveedor');
    A('IV3 confirmar contrato', d.querySelector('[data-i18n=cc_title]').textContent === 'Confirmar contrato');
    A('IV4 plano de pagamento', d.querySelector('[data-i18n=parc_title]').textContent === 'Plan de pago');
    A('IV5 botão PDF fornecedores', d.querySelector('[data-i18n=vendors_pdf_btn]').textContent === 'Generar PDF de proveedores');
    A('IV6 chaves dinâmicas existem', w.t('v_hired') === 'Contratados' && w.t('v_quoting') === 'En cotización' && w.t('v_contract_this') === 'Contratar este proveedor');
    A('IV7 toast dinâmico', w.t('m_q_saved') === 'Presupuesto guardado' && w.t('m_contracted').startsWith('Contratado'));
    setLang('pt');
    A('IV8 volta pro PT', d.querySelector('[data-i18n=q_save]').textContent === 'Salvar orçamento');
  } catch (e) { results.fail++; results.fails.push('I18N-FORN EXCEÇÃO: ' + e.message); }

  // ---------- FIN: fluxo de despesa ----------
  try {
    w.STATE = base();
    w.openExpense();
    A('F1 abre ficha de despesa', $('ov').classList.contains('open'));
    $('exDesc').value = 'Teste'; $('exVal').value = '500'; $('exCat').value = 'Buffet';
    const antes = w.STATE.exp.length;
    w.saveExpense();
    A('F2 saveExpense adiciona despesa', w.STATE.exp.length === antes + 1);
    w.STATE.exp = [{ id: 'e1', desc: 'Sinal', cat: 'Buffet', val: 1000, due: '', paid: false }];
    w.finalizePay(w.STATE.exp[0]);
    A('F3 finalizePay marca pago', w.STATE.exp[0].paid === true);
    A('F4 finalizePay oferece comprovante', $('sh-proof').style.display !== 'none');
    w.closeSheet();
  } catch (e) { results.fail++; results.fails.push('FIN EXCEÇÃO: ' + e.message); }

  // ---------- BACK: botão voltar ----------
  try {
    $('login').style.display = 'none'; $('onb').style.display = 'none';
    w.STATE = base();
    w.openSheet('sh-exp');
    A('BK1 voltar fecha a ficha', w.simHandleBack() === true && !$('ov').classList.contains('open'));
    w.STATE.cats = [{ id: 'c1', name: 'Foto', quotes: [{ id: 'q1', name: 'X', val: 100, win: true }] }];
    w.STATE.exp = [];
    w.openVendor('c1', 'q1');
    A('BK2 subtela volta pra Fornecedores', w.simHandleBack() === true && $('s-forn').classList.contains('on'));
    go('chk'); A('BK3 aba volta pro Início', w.simHandleBack() === true && $('s-home').classList.contains('on'));
    go('home'); A('BK4 raiz não intercepta', w.simHandleBack() === false);
  } catch (e) { results.fail++; results.fails.push('BACK EXCEÇÃO: ' + e.message); }

  // ---------- REPORT: PDFs ----------
  try {
    w.STATE = base(); w.STATE.profile.budget = 60000;
    w.STATE.exp = [{ id: 'e1', desc: 'Sinal', cat: 'Buffet', val: 5000, due: '', paid: true, vendorId: 'q1' }];
    w.STATE.cats = [{ id: 'c1', name: 'Buffet', quotes: [{ id: 'q1', name: 'Sabor', val: 5000, win: true, dif: 'forno a lenha' }, { id: 'q2', name: 'Festa', val: 6000 }] }];
    const doc = w.buildReportDoc();
    A('R1 relatório com 3 seções', doc.includes('Finanças') && doc.includes('Cotações') && doc.includes('Fornecedores fechados'));
    A('R2 relatório traz despesa + contratado', doc.includes('Sinal') && doc.includes('CONTRATADO') && doc.includes('Sabor'));
    const vd = w.buildVendorsReportDoc();
    A('R3 PDF fornecedores: cotações + fechados', vd.includes('Cotações') && vd.includes('Fornecedores fechados') && vd.includes('Sabor'));
    A('R4 PDF fornecedores: sem Finanças', !vd.includes('Finanças'));
  } catch (e) { results.fail++; results.fails.push('REPORT EXCEÇÃO: ' + e.message); }

  // ---------- relatório ----------
  console.log('\n═══════ SUÍTE SIM. ═══════');
  console.log('✓ Passou:', results.pass);
  console.log((results.fail ? '✗' : ' '), 'Falhou:', results.fail);
  if (results.fails.length) { console.log('\nFALHAS:'); results.fails.forEach(f => console.log('  - ' + f)); }
  console.log(results.fail ? '\n⚠ HÁ FALHAS' : '\n🎉 TODOS OS TESTES PASSARAM');
  process.exit(results.fail ? 1 : 0);
}).catch(e => { console.error('ERRO AO CARREGAR:', e.message); process.exit(2); });
