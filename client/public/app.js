// Application Security Module
(function(w,d){
var f=function(){
var h=w.location.hostname;
var isDev=h==='localhost'||h.includes('replit')||h.includes('127.0.0.1');
if(!isDev){
d.addEventListener('selectstart',function(e){e.preventDefault();});
d.addEventListener('contextmenu',function(e){e.preventDefault();});
d.addEventListener('keydown',function(e){
if((e.ctrlKey||e.metaKey)&&(e.keyCode===85||e.keyCode===83||e.keyCode===73||e.keyCode===74||e.keyCode===67)){e.preventDefault();}
if(e.keyCode===123){e.preventDefault();}
});
var c=w.console||{};
['log','warn','error','info','debug','trace','dir','dirxml','group','groupEnd','time','timeEnd','profile','profileEnd','count','exception','table','clear'].forEach(function(m){c[m]=function(){};});
}
};
if(d.readyState==='loading'){d.addEventListener('DOMContentLoaded',f);}else{f();}
})(window,document);