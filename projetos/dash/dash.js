/* Utilitários compartilhados dos dashboards de demonstração (Pablo Luz). */
(function(){
"use strict";
var D=window.DASH={};
var nf0=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});

// ---- formatação (pt-BR) ----
D.int=function(n){return nf0.format(Math.round(n));};
D.dec=function(n,d){d=d==null?1:d;return n.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});};
D.brl=function(n){return 'R$ '+nf0.format(Math.round(n));};
D.brlc=function(n){var a=Math.abs(n);
  if(a>=1e6)return 'R$ '+D.dec(n/1e6,a>=1e7?1:2)+' mi';
  if(a>=1e3)return 'R$ '+D.dec(n/1e3,a>=1e5?0:1)+' mil';
  return D.brl(n);};
D.num=function(n){var a=Math.abs(n);
  if(a>=1e6)return D.dec(n/1e6,2)+' mi';
  if(a>=1e3)return D.dec(n/1e3,a>=1e5?0:1)+' mil';
  return D.int(n);};
D.pct=function(x,d){return D.dec(x*100,d==null?1:d)+'%';};

// ---- aleatório com semente (os dados são sempre os mesmos) ----
D.rng=function(seed){var s=seed>>>0;return function(){s+=0x6D2B79F5;var t=s;
  t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};};
D.css=function(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();};

// ---- agregação ----
D.sum=function(rows,f){var s=0;for(var i=0;i<rows.length;i++)s+=f(rows[i]);return s;};
D.group=function(rows,kf){var m=new Map();
  rows.forEach(function(r){var k=kf(r),a=m.get(k);if(!a){a=[];m.set(k,a);}a.push(r);});return m;};
D.pass=function(set,v){return set.size===0||set.has(v);};

// ---- filtro em lista (slicer) ----
// cfg: {title, items:[{v,label}], sel:Set, single:bool, onChange}
D.slicer=function(host,cfg){
  host.classList.add('sl');
  host.innerHTML='<div class="sl-h"><span></span><button type="button" class="sl-x" hidden>limpar</button></div><div class="sl-l"></div>';
  host.querySelector('.sl-h span').textContent=cfg.title;
  var list=host.querySelector('.sl-l'),clr=host.querySelector('.sl-x'),sel=cfg.sel;
  function paint(){
    [].forEach.call(list.children,function(b){b.classList.toggle('on',sel.has(b.dataset.v));});
    clr.hidden=cfg.single?true:sel.size===0;
  }
  cfg.items.forEach(function(it){
    var b=document.createElement('button');b.type='button';b.className='sl-i';
    b.dataset.v=String(it.v);b.textContent=it.label;
    b.onclick=function(){
      var k=String(it.v);
      if(cfg.single){sel.clear();sel.add(k);}
      else if(sel.has(k))sel.delete(k);else sel.add(k);
      paint();cfg.onChange();
    };
    list.appendChild(b);
  });
  clr.onclick=function(){sel.clear();paint();cfg.onChange();};
  paint();
  return {paint:paint};
};

// botão "Filtros" no celular
D.filterToggle=function(btn,panel,countFn){
  btn.onclick=function(){btn.classList.toggle('open');panel.classList.toggle('open');};
  return function(){var n=countFn();btn.firstChild.textContent='Filtros'+(n?' ('+n+' ativos)':'');};
};

// abas
D.tabs=function(host,onChange){
  [].forEach.call(host.querySelectorAll('button'),function(b){
    b.onclick=function(){
      [].forEach.call(host.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b);});
      [].forEach.call(document.querySelectorAll('.panel'),function(p){p.hidden=p.id!==b.dataset.p;});
      if(onChange)onChange(b.dataset.p);
      window.dispatchEvent(new Event('resize'));
    };
  });
};

// tabela: cols [{h,f,r}] (r = alinhar à direita)
D.table=function(el,cols,rows){
  if(!rows.length){el.innerHTML='<div class="empty">Sem dados para o filtro escolhido.</div>';return;}
  el.innerHTML='<table><thead><tr>'+cols.map(function(c){return '<th class="'+(c.r?'r':'')+'">'+c.h+'</th>';}).join('')+
    '</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+cols.map(function(c){
      return '<td class="'+(c.r?'r':'')+'">'+c.f(r)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';
};

// ---- gráficos (Chart.js) ----
D.chartInit=function(){
  var C=window.Chart;
  C.defaults.font.family=D.css('--font').split(',')[0].replace(/"/g,'')+',system-ui,sans-serif';
  C.defaults.font.size=11.5;C.defaults.color=D.css('--mut');
  C.defaults.maintainAspectRatio=false;C.defaults.responsive=true;
  C.defaults.animation.duration=420;
  C.defaults.plugins.legend.display=false;
  var t=C.defaults.plugins.tooltip;
  t.backgroundColor='#14203a';t.titleColor='#fff';t.bodyColor='#e6ecf7';t.padding=10;t.cornerRadius=9;t.boxPadding=4;
  t.titleFont={weight:'700'};
};
D.mk=function(id,type,options,plugins){
  var ch=new window.Chart(document.getElementById(id),{type:type,data:{labels:[],datasets:[]},options:options||{},plugins:plugins||[]});
  ch.set=function(labels,datasets){ch.data.labels=labels;ch.data.datasets=datasets;ch.update();};
  return ch;
};
D.grid=function(){return D.css('--line');};
})();
