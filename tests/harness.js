// Harness de testes do SIM. — carrega app.html no jsdom com stubs e expõe utilitários.
// Uso: const { load } = require('./harness'); load().then(({w,d,A,base,novaData,errors,results})=>{...})
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

function novaData(monthsAhead){
  const dt = new Date();
  dt.setMonth(dt.getMonth() + (monthsAhead||0));
  return dt.toISOString().slice(0,10);
}

// fábrica de estado válido de uma noiva (perfil Ana & Pedro)
function base(){
  return { profile:{a:'Ana',b:'Pedro',date:novaData(8),budget:50000,guests:120},
           cats:[], tasks:[], notes:[], exp:[], events:[], guests:[] };
}

function makeStub(){
  const q = {
    select(){return q;}, insert(){return q;}, update(){return q;}, upsert(){return q;},
    delete(){return q;}, eq(){return q;}, order(){return q;}, limit(){return q;},
    single:async()=>({data:null,error:null}), maybeSingle:async()=>({data:null,error:null}),
    then:(res)=>res({data:[],error:null})
  };
  return {
    auth:{ getSession:async()=>({data:{session:null},error:null}),
           onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),
           signInWithPassword:async()=>({data:{},error:null}),
           signUp:async()=>({data:{},error:null}), signOut:async()=>({error:null}) },
    from:()=>q, rpc:async()=>({data:null,error:null}),
    channel:()=>({on(){return this;},subscribe(){return this;}}),
    removeChannel(){}
  };
}

// expositor injetado no fim do script principal para alcançar variáveis let/const
const EXPOSER = ";try{Object.defineProperty(window,'STATE',{get:function(){return state;},set:function(v){state=v;},configurable:true});"
  + "window.I18N=I18N;window.I18N_LANGS=I18N_LANGS;"
  + "Object.defineProperty(window,'SIMLANG',{get:function(){return simLang;},configurable:true});"
  + "Object.defineProperty(window,'AUTHMODE',{get:function(){return authMode;},configurable:true});}catch(e){console.error('exposer:'+e.message);}";

function load(){
  const appPath = path.join(__dirname, '..', 'app.html');
  let html = fs.readFileSync(appPath, 'utf8');

  // 1) checagem de parse do maior <script> antes de subir o jsdom
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  const body=scripts.reduce((a,c)=>c.length>a.length?c:a,'');
  try{ new Function(body); }
  catch(e){ return Promise.reject(new Error('PARSE FALHOU: '+e.message)); }

  // injeta o expositor no fim do script principal (o que contém setLang)
  const parts = html.split('</script>');
  let injected=false;
  for(let i=0;i<parts.length;i++){
    if(parts[i].includes('function setLang(') && parts[i].includes('initAuth(')){
      parts[i] = parts[i] + EXPOSER; injected=true; break;
    }
  }
  html = parts.join('</script>');
  if(!injected) return Promise.reject(new Error('não achei o script principal para injetar o expositor'));

  const errors=[];
  const dom = new JSDOM(html, {
    runScripts:'dangerously', pretendToBeVisual:true, url:'https://sim-noivas.vercel.app/app.html',
    beforeParse(w){
      w.supabase={ createClient:()=>makeStub() };
      w.matchMedia=()=>({matches:false,media:'',addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
      if(!w.crypto) w.crypto={};
      w.crypto.randomUUID=()=>'x'+Math.random().toString(16).slice(2);
      w.print=()=>{};
      w.scrollTo=()=>{};
      const orig=w.console.error.bind(w.console);
      w.console.error=(...a)=>{ errors.push(a.map(String).join(' ')); };
      w.console.warn=()=>{};
    }
  });

  const results={pass:0,fail:0,fails:[]};
  function A(name,cond){ if(cond) results.pass++; else { results.fail++; results.fails.push(name); } }

  return new Promise((resolve)=>{
    setTimeout(()=>resolve({ w:dom.window, d:dom.window.document, A, base, novaData, errors, results }), 900);
  });
}

module.exports = { load, base, novaData };
