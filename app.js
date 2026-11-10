(function(){
  var KEY="lista-tareas-v1";
  var state={nombre:"",tareas:[]};
  var filtro="todas";
  var $=function(id){return document.getElementById(id)};

  function load(){
    try{var s=localStorage.getItem(KEY);if(s){var o=JSON.parse(s);if(o&&typeof o==="object"){state.nombre=o.nombre||"";state.tareas=Array.isArray(o.tareas)?o.tareas:[]}}}catch(e){}
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}

  function fmt(iso){
    if(!iso)return "Sin fecha límite";
    var d=new Date(iso);if(isNaN(d))return "Sin fecha límite";
    return "Límite: "+d.toLocaleString("es",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
  }

  function render(){
    if(!state.nombre){$("login").classList.remove("hide");$("app").classList.add("hide");return}
    $("login").classList.add("hide");$("app").classList.remove("hide");
    $("saludo").textContent="Hola, "+state.nombre;
    var total=state.tareas.length,hechas=state.tareas.filter(function(t){return t.hecha}).length,pend=total-hechas;
    $("resumen").textContent=pend===0?"No tienes tareas pendientes.":"Tienes "+pend+(pend===1?" tarea pendiente.":" tareas pendientes.");
    $("prog").style.width=(total?hechas/total*100:0)+"%";
    $("progtxt").textContent=hechas+" de "+total+" completadas";

    var now=Date.now();
    var items=state.tareas.filter(function(t){return filtro==="todas"||(filtro==="hechas"?t.hecha:!t.hecha)});
    items.sort(function(a,b){
      if(a.hecha!==b.hecha)return a.hecha?1:-1;
      var da=a.limite?new Date(a.limite).getTime():Infinity,db=b.limite?new Date(b.limite).getTime():Infinity;
      return da-db;
    });
    var ul=$("lista");ul.innerHTML="";
    if(!items.length){var e=document.createElement("li");e.className="empty";e.style.display="block";e.textContent="No hay tareas aquí.";ul.appendChild(e);return}
    items.forEach(function(t){
      var li=document.createElement("li");
      var late=!t.hecha&&t.limite&&new Date(t.limite).getTime()<now;
      li.className=(t.hecha?"done ":"")+(late?"late":"");
      var cb=document.createElement("input");cb.type="checkbox";cb.checked=!!t.hecha;cb.setAttribute("aria-label","Marcar como hecha");
      cb.onchange=function(){t.hecha=cb.checked;save();render()};
      var box=document.createElement("div");box.className="t";
      var sp=document.createElement("span");sp.textContent=t.texto;
      var sm=document.createElement("small");sm.textContent=(late?"Vencida · ":"")+fmt(t.limite);
      box.appendChild(sp);box.appendChild(sm);
      var del=document.createElement("button");del.className="del";del.textContent="✕";del.setAttribute("aria-label","Eliminar tarea");
      del.onclick=function(){state.tareas=state.tareas.filter(function(x){return x.id!==t.id});save();render()};
      li.appendChild(cb);li.appendChild(box);li.appendChild(del);ul.appendChild(li);
    });
  }

  function entrar(){
    var n=$("nombre").value.trim();
    if(!n){$("nombre").focus();return}
    state.nombre=n;save();render();
  }
  function agregar(){
    var tx=$("texto").value.trim();
    if(!tx){$("texto").focus();return}
    state.tareas.push({id:Date.now()+Math.random().toString(36).slice(2,6),texto:tx,limite:$("limite").value||"",hecha:false});
    $("texto").value="";$("limite").value="";
    save();render();$("texto").focus();
  }

  $("entrar").onclick=entrar;
  $("nombre").onkeydown=function(e){if(e.key==="Enter")entrar()};
  $("agregar").onclick=agregar;
  $("texto").onkeydown=function(e){if(e.key==="Enter")agregar()};
  $("salir").onclick=function(){state.nombre="";save();$("nombre").value="";render()};
  $("tabs").onclick=function(e){
    var f=e.target.getAttribute&&e.target.getAttribute("data-f");if(!f)return;
    filtro=f;[].forEach.call($("tabs").children,function(b){b.classList.toggle("on",b===e.target)});render();
  };

  load();render();
  setInterval(function(){if(state.nombre)render()},60000);
})();