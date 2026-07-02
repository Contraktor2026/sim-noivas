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
    A('L3 idioma padrão ao entrar é ES', w.SIMLANG === 'es');
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

  // ---------- I18N: Dinheiro dinâmico + moeda ----------
  try {
    setLang('es');
    w.STATE = { profile:{a:'Ana',b:'Pedro',date:'2026-12-01',budget:30000}, cats:[], tasks:[], notes:[], events:[], guests:[],
      exp:[{id:'e1',desc:'Flora',cat:'Decoración',val:400,due:'2026-06-23',paid:true},
           {id:'e2',desc:'Hacienda',cat:'Salón',val:1167,due:'2026-07-01',paid:false}] };
    w.renderFin();
    const h = $('finList').innerHTML, cats = $('finCats').innerHTML;
    A('IDF1 mês em espanhol', /junio/i.test(h));
    A('IDF2 selos PAGADO/POR PAGAR', h.includes('PAGADO') && h.includes('POR PAGAR'));
    A('IDF3 "todo pagado" e "por pagar"', h.includes('todo pagado') && h.includes('por pagar'));
    A('IDF4 moeda vira $ (sem R$)', !h.includes('R$') && h.includes('$'));
    A('IDF5 "Dónde está el dinero"', cats.includes('Dónde está el dinero'));
    setLang('pt'); w.renderFin();
    A('IDF6 PT mantém R$', $('finList').innerHTML.includes('R$'));
  } catch (e) { results.fail++; results.fails.push('I18N-DINF EXCEÇÃO: ' + e.message); }

  // ---------- I18N: Convidados (parte 1) ----------
  try {
    setLang('es');
    const q = sel => d.querySelector(sel).textContent.trim();
    A('IG1 export ES', q('#sh-export [data-i18n=g_export_title]') === 'Exportar lista' && q('[data-i18n=g_export_csv]') === 'Hoja de cálculo');
    A('IG2 ficha ES (chip + status + salvar)', q('#sh-guest [data-i18n=g_grp_bridefam]') === 'Familia de la novia' && q('#sh-guest [data-i18n=g_st_pending]') === 'Pendiente' && q('#sh-guest [data-i18n=g_save]') === 'Guardar invitado');
    A('IG3 bulk ES', q('#sh-bulk [data-i18n=g_bulk_title]') === 'Agregar varios' && q('#sh-bulk [data-i18n=g_bulk_add]') === 'Agregar a la lista');
    A('IG4 ajuda: resumo mantém <b>', d.querySelector('[data-i18n=g_help_summary]').innerHTML.includes('<b'));
    A('IG5 cabeçalhos lista ES', q('.fsectitle[data-i18n=g_help_mine]') === 'Mi lista' && q('.fsectitle[data-i18n=g_help_rsvp]') === 'Confirmaciones');
    w.STATE = { profile:{a:'Ana',b:'Pedro',date:'2026-12-01',budget:50000}, cats:[], tasks:[], notes:[], events:[], exp:[],
      guests:[{id:'x1',name:'Tío Juan',status:'yes',group:'Amigos',comps:[]},{id:'x2',name:'Niña',status:'pending',child:true,comps:[]}] };
    w.renderGuests();
    A('IG6 lista dinâmica ES (status + stats)', $('s-guests').innerHTML.includes('Confirmado') && /Adulto|Niño/.test($('s-guests').innerHTML));
    w.openGuest('x1');
    A('IG7 título ficha (editar) ES', $('gsTitle').textContent === 'Editar invitado');
    w.closeSheet();
    A('IG8 chaves dinâmicas (toasts)', w.t('m_g_saved') === 'Invitado guardado' && w.t('m_bulk_one') === ' invitado agregado');
    setLang('pt');
    A('IG9 volta pro PT', q('#sh-guest [data-i18n=g_save]') === 'Salvar convidado');
  } catch (e) { results.fail++; results.fails.push('I18N-GUEST EXCEÇÃO: ' + e.message); }

  // ---------- I18N: Convidados (parte 2) ----------
  try {
    setLang('es');
    const base = { profile:{a:'Ana',b:'Pedro',date:'2026-12-01',budget:50000}, cats:[], tasks:[], notes:[], events:[], exp:[], guests:[] };
    w.STATE = { ...base }; w.renderLinkSection();
    let ls = $('rsvpSection').innerHTML;
    A('IG2-1 link sem slug ES', ls.includes('Confirmación en línea') && ls.includes('Crear enlace de confirmación'));
    w.STATE = { ...base, publicSlug:'ana-pedro' }; w.renderLinkSection();
    ls = $('rsvpSection').innerHTML;
    A('IG2-2 link com slug ES', ls.includes('Enlace de confirmación') && ls.includes('Copiar enlace') && ls.includes('Personalizar'));
    A('IG2-3 estáticos add ES', d.querySelector('[data-i18n=g_add_guest]').textContent === 'Agregar invitado' && d.querySelector('[data-i18n=g_paste_list]').textContent === 'o pegar una lista de nombres');
    A('IG2-4 chaves fila de revisão ES', w.t('g_rev_new').replace('{n}','3') === '3 nuevas confirmaciones para revisar' && w.t('g_rev_other') === 'Es otra persona' && w.t('g_rev_isbtn') === 'Es');
    A('IG2-5 chaves CSV/PDF ES', w.t('g_th_status') === 'Estado' && w.t('g_csv_total') === 'Total de personas' && w.t('g_sum_notcoming') === 'no asisten' && w.t('g_pdf_title') === 'Lista de invitados');
    A('IG2-6 grupo fallback + link group ES', w.t('g_nogroup') === 'Sin grupo' && w.t('g_grp_link') === 'Confirmados por el enlace');
    setLang('pt'); w.STATE = { ...base }; w.renderLinkSection();
    A('IG2-7 volta pro PT', $('rsvpSection').innerHTML.includes('Confirmação online') && w.t('g_pdf_title') === 'Lista de convidados');
  } catch (e) { results.fail++; results.fails.push('I18N-GUEST2 EXCEÇÃO: ' + e.message); }

  // ---------- I18N: login landing ----------
  try {
    setLang('es');
    A('LND1 hint + svg preservado', d.querySelector('[data-i18n=ld_hint]').textContent === 'Conoce SIM.' && !!d.querySelector('.ldhint svg'));
    A('LND2 título mantém <i>', d.querySelector('[data-i18n=ld_title]').innerHTML.includes('<i') && d.querySelector('[data-i18n=ld_title]').textContent.includes('sueño'));
    A('LND3 intro mantém <b>', d.querySelector('[data-i18n=ld_intro]').innerHTML.includes('<b') && d.querySelector('[data-i18n=ld_intro]').innerHTML.includes('Tú solo decides'));
    A('LND4 cartões ES', d.querySelector('[data-i18n=ld_c1_h]').textContent === 'Dinero bajo control' && d.querySelector('[data-i18n=ld_c2_h]').textContent === 'Proveedores comparados de verdad');
    setLang('pt');
    A('LND5 volta pro PT', d.querySelector('[data-i18n=ld_c1_h]').textContent === 'Dinheiro sob controle');
  } catch (e) { results.fail++; results.fails.push('I18N-LANDING EXCEÇÃO: ' + e.message); }

  // ---------- I18N: Configurações ----------
  try {
    setLang('es');
    const q = k => d.querySelector('#s-set [data-i18n=' + k + ']').textContent.trim();
    A('SET1 campos ES', q('set_yourname') === 'Tu nombre' && q('set_partner') === 'Nombre de tu pareja' && q('set_city') === 'Ciudad');
    A('SET2 orçamento vira $', q('set_budget') === 'Presupuesto ($)');
    A('SET3 seções + botões ES', q('set_account') === 'Cuenta' && q('set_save') === 'Guardar cambios' && q('set_wipe') === 'Borrar todos los datos');
    A('SET4 lista sugerida mantém <b>', d.querySelector('[data-i18n=set_suggested_p]').innerHTML.includes('<b'));
    A('SET5 fmtTempo localizado', w.fmtTempo(3) === '3 meses' && w.fmtTempo(0.03) === '1 día');
    A('SET6 toasts ES', w.t('m_set_saved') === 'Cambios guardados' && w.t('m_rot_full_adapted').replace('{t}', 'X') === 'Guía completa adaptada a los X que faltan');
    setLang('pt');
    A('SET7 volta pro PT', q('set_save') === 'Salvar alterações' && q('set_budget') === 'Orçamento (R$)' && w.fmtTempo(3) === '3 meses');
  } catch (e) { results.fail++; results.fails.push('I18N-SET EXCEÇÃO: ' + e.message); }

  // ---------- I18N: Personalizar RSVP (ES) ----------
  try {
    setLang('es');
    const q = k => { const el = d.querySelector('#s-rsvpcustom [data-i18n=' + k + ']'); return el ? el.textContent.trim() : ''; };
    A('RC1 tela ES', q('rc_title') === 'Personalizar la página' && q('rc_preview') === 'Vista previa' && q('rc_save') === 'Guardar personalización');
    A('RC2 switches ES', q('rc_allow_comp') === 'Permitir acompañantes' && q('rc_allow_kids') === 'Permitir niños');
    A('RC3 overlay IA ES', d.querySelector('[data-i18n=rc_ai_reading]').textContent.trim() === 'Leyendo con la IA…');
    w.STATE = { profile:{a:'Ana',b:'Pedro',date:'2026-12-01',budget:50000}, cats:[], tasks:[], notes:[], events:[], exp:[], guests:[] };
    w.renderRcPhoto();
    A('RC4 foto pick ES', $('rcPhotoArea').innerHTML.includes('Agregar una foto'));
    w.STATE = { ...w.STATE, publicPhoto:'data:image/jpeg;base64,x' }; w.renderRcPhoto();
    A('RC5 foto adicionada ES', $('rcPhotoArea').innerHTML.includes('Foto agregada') && $('rcPhotoArea').innerHTML.includes('Quitar'));
    A('RC6 toasts ES', w.t('m_page_custom') === 'Página personalizada 🤍' && w.t('m_link_first') === 'Crea el enlace primero');
    setLang('pt');
  } catch (e) { results.fail++; results.fails.push('I18N-RC EXCEÇÃO: ' + e.message); }

  // ---------- I18N: Tarefas (ES) ----------
  try {
    setLang('es');
    w.STATE = { profile:{a:'Ana',b:'Pedro',date:'2027-06-01',budget:50000}, cats:[], tasks:[], notes:[], events:[], exp:[], guests:[], phaseOrder:[] };
    w.renderChk();
    const empty = $('chkBody').innerHTML;
    A('TK1 estado vazio ES', empty.includes('Aún no tienes tareas') && empty.includes('Cargar guía esencial'));
    w.loadSuggested('ess');
    const tasks = w.STATE.tasks;
    A('TK2 roteiro essencial em ES', tasks.length > 10 && tasks[0].t === 'Definir el presupuesto total y quién aporta');
    A('TK3 nenhuma tarefa em PT', !tasks.some(t => /ção|Definir o |Reservar o |Agendar deg/.test(t.t)));
    w.renderChk();
    A('TK4 toggle ES + numerada', $('chkBody').innerHTML.includes('Esencial') && $('chkBody').innerHTML.includes('1.'));
    A('TK5 toasts + ficha ES', w.t('m_task_done') === 'Un paso más dado' && w.t('tk_save') === 'Guardar tarea' && w.t('m_task_deleted') === 'Tarea eliminada');
    setLang('pt');
  } catch (e) { results.fail++; results.fails.push('I18N-TASKS EXCEÇÃO: ' + e.message); }

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
    setLang('es');
    const docES = w.buildReportDoc();
    A('R5 relatório segue idioma (ES)', docES.includes('Informe de la boda') && docES.includes('Finanzas') && docES.includes('Proveedores cerrados'));
    A('R6 relatório ES sem PT e com $', !docES.includes('Finanças') && !docES.includes('R$') && docES.includes('$'));
    setLang('pt');
  } catch (e) { results.fail++; results.fails.push('REPORT EXCEÇÃO: ' + e.message); }

  // ---------- relatório ----------
  console.log('\n═══════ SUÍTE SIM. ═══════');
  console.log('✓ Passou:', results.pass);
  console.log((results.fail ? '✗' : ' '), 'Falhou:', results.fail);
  if (results.fails.length) { console.log('\nFALHAS:'); results.fails.forEach(f => console.log('  - ' + f)); }
  console.log(results.fail ? '\n⚠ HÁ FALHAS' : '\n🎉 TODOS OS TESTES PASSARAM');
  process.exit(results.fail ? 1 : 0);
}).catch(e => { console.error('ERRO AO CARREGAR:', e.message); process.exit(2); });
