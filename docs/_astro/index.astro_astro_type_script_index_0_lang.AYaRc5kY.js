function r(t,n){return Math.random()*(n-t)+t}function j(t,n){return Math.floor(r(t,n+1))}function u(t){return(t%360+360)%360}function U(t,n,a){n/=100,a/=100;const c=s=>(s+t/30)%12,d=n*Math.min(a,1-a),i=s=>a-d*Math.max(-1,Math.min(c(s)-3,Math.min(9-c(s),1))),e=s=>Math.round(s*255).toString(16).padStart(2,"0");return`#${e(i(0))}${e(i(8))}${e(i(4))}`}function Tt(t,n,a){const c=U(t,n,a),d=parseInt(c.slice(1,3),16)/255,i=parseInt(c.slice(3,5),16)/255,e=parseInt(c.slice(5,7),16)/255,s=v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);return .2126*s(d)+.7152*s(i)+.0722*s(e)}function h(t,n,a,c=t,d=t){const i=Tt(t,n,a),e=u(c+r(-15,15)),s=u(d+r(-10,10));return i>.179?{h:e,s:r(15,45),l:r(2,12)}:{h:s,s:r(5,25),l:r(92,98)}}const Et={analogous(t){const n=Math.random()>.5?1:-1,a=r(20,50)*n,c=r(40,80)*n;return{secondaryHue:u(t+a),accentHue:u(t+c)}},complementary(t){const n=r(-35,35);return{secondaryHue:u(t+n),accentHue:u(t+180+r(-20,20))}},triadic(t){return{secondaryHue:u(t+120+r(-20,20)),accentHue:u(t+240+r(-20,20))}},splitComplementary(t){return{secondaryHue:u(t+150+r(-15,15)),accentHue:u(t+210+r(-15,15))}},tetradic(t){return{secondaryHue:u(t+90+r(-15,15)),accentHue:u(t+270+r(-15,15))}},chaotic(t){return{secondaryHue:r(0,360),accentHue:r(0,360)}}};function $t(){const t=Math.random();return t<.25?"analogous":t<.45?"complementary":t<.65?"triadic":t<.8?"splitComplementary":t<.9?"tetradic":"chaotic"}const f={bold:{name:"bold",primaryS:[55,80],primaryL:[42,58],secondaryS:[25,50],secondaryL:[42,60],accentS:[45,75],accentL:[45,62],bgTintS:[8,25],bgLightL:[95,99],bgDarkL:[5,12],mutedLightL:[89,95],mutedDarkL:[12,22]},soft:{name:"soft",primaryS:[30,55],primaryL:[55,72],secondaryS:[20,40],secondaryL:[55,70],accentS:[30,55],accentL:[55,70],bgTintS:[5,18],bgLightL:[96,99],bgDarkL:[8,15],mutedLightL:[90,96],mutedDarkL:[15,24]},muted:{name:"muted",primaryS:[18,42],primaryL:[35,55],secondaryS:[12,30],secondaryL:[40,58],accentS:[20,45],accentL:[40,58],bgTintS:[3,12],bgLightL:[94,98],bgDarkL:[10,18],mutedLightL:[88,93],mutedDarkL:[18,28]},deep:{name:"deep",primaryS:[45,75],primaryL:[30,48],secondaryS:[25,50],secondaryL:[32,50],accentS:[40,70],accentL:[35,55],bgTintS:[15,30],bgLightL:[92,97],bgDarkL:[2,8],mutedLightL:[85,92],mutedDarkL:[8,16]},vibrant:{name:"vibrant",primaryS:[72,95],primaryL:[48,62],secondaryS:[45,70],secondaryL:[48,65],accentS:[65,95],accentL:[48,65],bgTintS:[10,30],bgLightL:[95,99],bgDarkL:[4,12],mutedLightL:[88,94],mutedDarkL:[12,20]},earthy:{name:"earthy",primaryS:[15,35],primaryL:[30,50],secondaryS:[10,25],secondaryL:[35,55],accentS:[20,40],accentL:[35,55],bgTintS:[10,25],bgLightL:[90,95],bgDarkL:[12,20],mutedLightL:[82,88],mutedDarkL:[20,30]},pastel:{name:"pastel",primaryS:[40,70],primaryL:[70,85],secondaryS:[30,60],secondaryL:[70,85],accentS:[40,75],accentL:[70,85],bgTintS:[15,35],bgLightL:[96,99],bgDarkL:[15,25],mutedLightL:[90,95],mutedDarkL:[25,35]},midnight:{name:"midnight",primaryS:[50,80],primaryL:[50,70],secondaryS:[30,60],secondaryL:[40,60],accentS:[60,90],accentL:[50,70],bgTintS:[25,45],bgLightL:[94,98],bgDarkL:[3,9],mutedLightL:[86,92],mutedDarkL:[9,16]}};function Dt(){const t=Math.random();return t<.25?f.bold:t<.5?f.soft:t<.7?f.muted:t<.85?f.deep:f.vibrant}function Mt(t={}){let n=t.baseHue!==void 0?t.baseHue:r(0,360);t.baseHue===void 0&&n>90&&n<140&&Math.random()>.3&&(n=Math.random()>.5?r(150,170):r(50,80));const a=t.strategyName||$t(),c=Et[a],{secondaryHue:d,accentHue:i}=c(n),e=t.moodName?f[t.moodName]:Dt(),s={h:n,s:r(e.primaryS[0],e.primaryS[1]),l:r(e.primaryL[0],e.primaryL[1])},y={h:Math.random()>.5?r(330,360):r(0,30),s:r(Math.min(90,e.primaryS[0]+15),98),l:r(Math.max(35,e.primaryL[0]-10),Math.min(65,e.primaryL[1]+10))},it={h:d,s:r(e.secondaryS[0],e.secondaryS[1]),l:r(e.secondaryL[0],e.secondaryL[1])},k={h:d,s:r(e.bgTintS[0],e.bgTintS[1]),l:r(Math.max(80,e.mutedLightL[0]-5),e.mutedLightL[1])},T={h:d,s:r(e.bgTintS[0],e.bgTintS[1]),l:r(e.mutedDarkL[0],Math.min(40,e.mutedDarkL[1]+5))},st={h:i,s:r(e.accentS[0],e.accentS[1]),l:r(e.accentL[0],e.accentL[1])},E={h:i,s:r(e.bgTintS[0]+10,e.bgTintS[1]+10),l:r(Math.max(80,e.mutedLightL[0]-5),e.mutedLightL[1])},$={h:i,s:r(e.bgTintS[0]+10,e.bgTintS[1]+10),l:r(e.mutedDarkL[0],Math.min(40,e.mutedDarkL[1]+5))},R=[n,d,i,r(200,260),r(140,180)],l=Math.random()>.35?R[j(0,R.length-1)]:n,m=Math.random()>.6?d:n,p={h:m,s:r(e.bgTintS[0],e.bgTintS[1]),l:r(e.bgLightL[0],e.bgLightL[1])},D={h:l,s:r(e.bgTintS[0]+5,e.bgTintS[1]+15),l:r(e.bgDarkL[0],e.bgDarkL[1])},P={h:m,s:r(e.bgTintS[0],e.bgTintS[1]+5),l:r(e.mutedLightL[0],e.mutedLightL[1])},dt={h:l,s:r(e.bgTintS[0]+5,e.bgTintS[1]+15),l:r(e.mutedDarkL[0],e.mutedDarkL[1])},lt={h:m,s:r(e.bgTintS[0],e.bgTintS[1]),l:r(Math.max(75,e.mutedLightL[0]-8),e.mutedLightL[0])},mt={h:l,s:r(e.bgTintS[0]+5,e.bgTintS[1]+15),l:r(e.mutedDarkL[1],Math.min(45,e.mutedDarkL[1]+12))},_={h:i,s:r(e.accentS[0],e.accentS[1]),l:r(e.accentL[0],e.accentL[1])},ut=h(p.h,p.s,p.l,l,m),gt=h(D.h,D.s,D.l,l,m),Y=h(s.h,s.s,s.l,l,m),ht=h(k.h,k.s,k.l,l,m),Lt=h(T.h,T.s,T.l,l,m),yt=h(E.h,E.s,E.l,l,m),ft=h($.h,$.s,$.l,l,m),J=h(y.h,y.s,y.l,l,m),pt={h:l,s:r(e.bgTintS[0],Math.min(e.bgTintS[1]+15,30)),l:r(35,50)},bt={h:m,s:r(e.bgTintS[0],Math.min(e.bgTintS[1]+15,30)),l:r(55,70)},o=({h:St,s:vt,l:kt})=>U(St,vt,kt);return{name:xt(),id:`theme_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,harmony:a,mood:e.name,baseHue:Math.round(n),light:{background:o(p),foreground:o(ut),primary:o(s),"primary-foreground":o(Y),secondary:o(k),"secondary-foreground":o(ht),muted:o(P),"muted-foreground":o(pt),accent:o(E),"accent-foreground":o(yt),destructive:o(y),"destructive-foreground":o(J),border:o(lt),ring:o(_)},dark:{background:o(D),foreground:o(gt),primary:o(s),"primary-foreground":o(Y),secondary:o(T),"secondary-foreground":o(Lt),muted:o(dt),"muted-foreground":o(bt),accent:o($),"accent-foreground":o(ft),destructive:o(y),"destructive-foreground":o(J),border:o(mt),ring:o(_)},swatches:[o(p),o(s),o(it),o(st),o(y),o(P)]}}const z=["Arctic","Velvet","Neon","Cosmic","Ember","Frosted","Golden","Midnight","Electric","Mystic","Solar","Lunar","Crystal","Pearl","Abyssal","Radiant","Lucid","Vivid","Silent","Dynamic","Fluid","Aero","Stellar","Digital","Quantum","Serene","Wild"],W=["Dawn","Wave","Pulse","Storm","Bloom","Drift","Glow","Spark","Echo","Haze","Tide","Flare","Shade","Crest","Veil","Mist","Peak","Void","Aura","Flux","Core","Edge","Depth","Trace","Beam","Rift","Surge","Blaze","Flow","Dust"];function xt(){const t=z[j(0,z.length-1)],n=W[j(0,W.length-1)];return`${t} ${n}`}function It(t){const{light:n,dark:a}=t,c=Object.entries(n).map(([e])=>`  --color-${e}: var(--${e});`).join(`
`),d=Object.entries(n).map(([e,s])=>`  --${e}: ${s};`).join(`
`),i=Object.entries(a).map(([e,s])=>`  --${e}: ${s};`).join(`
`);return`/* ${t.name} — Armonic Themes (${t.harmony}) */

@import "tailwindcss";

@theme {
${c}
}

:root {
${d}
}

[data-theme="dark"] {
${i}
}`}function Ht(t){const{light:n,dark:a}=t,c=Object.entries(n).map(([i,e])=>`  --${i}: ${e};`).join(`
`),d=Object.entries(a).map(([i,e])=>`  --${i}: ${e};`).join(`
`);return`/* ${t.name} — Armonic Themes (${t.harmony}) */

:root {
${c}
}

[data-theme="dark"] {
${d}
}`}function Ct(t){const{light:n}=t,a=Object.entries(n).map(([i])=>`      '${i}': 'var(--${i})',`).join(`
`),c=Object.entries(n).map(([i,e])=>`    '--${i}': '${e}',`).join(`
`),d=Object.entries(t.dark).map(([i,e])=>`      '--${i}': '${e}',`).join(`
`);return`// ${t.name} — Armonic Themes (${t.harmony})

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
${a}
      },
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        ':root': {
${c}
        },
        '[data-theme="dark"]': {
${d}
        },
      });
    },
  ],
};`}const wt=30,H="armonic_favorites";let S=[];function Bt(t){S.unshift(t),S.length>wt&&S.pop()}function At(){return[...S]}function Ft(){S=[]}function C(){try{const t=localStorage.getItem(H);return t?JSON.parse(t):[]}catch(t){return console.warn("[Armonic] Error al leer favoritos de localStorage:",t),[]}}function jt(t){try{const n=C();return n.some(c=>c.id===t.id)?!1:(n.unshift(t),localStorage.setItem(H,JSON.stringify(n)),!0)}catch(n){return console.warn("[Armonic] Error al guardar en localStorage:",n),!1}}function Ot(t){try{const n=C().filter(a=>a.id!==t);localStorage.setItem(H,JSON.stringify(n))}catch(n){console.warn("[Armonic] Error al eliminar de localStorage:",n)}}function Nt(){try{localStorage.removeItem(H)}catch(t){console.warn("[Armonic] Error al limpiar localStorage:",t)}}function qt(t){return C().some(n=>n.id===t)}let g=null,L="light",O="tw4",M=0,X=!0;const Vt=document.getElementById("preview-root"),Z=document.getElementById("current-swatches"),Gt=document.getElementById("current-theme-name"),Rt=document.getElementById("gen-badges"),Pt=document.getElementById("theme-count-label"),tt=document.getElementById("export-content"),b=document.getElementById("copy-btn"),x=document.getElementById("save-btn"),K=document.getElementById("history-list"),_t=document.getElementById("history-empty"),et=document.getElementById("clear-history-btn"),F=document.getElementById("favorites-list"),Q=document.getElementById("favs-empty"),N=document.getElementById("clear-favs-btn"),Yt=document.getElementById("color-table"),Jt=document.getElementById("app-theme-toggle"),zt=document.getElementById("theme-icon");function nt(t){X=t,document.documentElement.setAttribute("data-app-theme",t?"dark":"light"),zt.textContent=t?"☀":"☾"}Jt.addEventListener("click",()=>nt(!X));nt(!0);const q=document.getElementById("mobile-menu-btn"),I=document.getElementById("nav-links");q.addEventListener("click",()=>{I.classList.toggle("open"),q.textContent=I.classList.contains("open")?"✕":"☰"});I.querySelectorAll(".nav-link").forEach(t=>{t.addEventListener("click",()=>{I.classList.remove("open"),q.textContent="☰"})});const Wt=document.querySelectorAll("section[id]"),Kt=document.querySelectorAll(".nav-link[data-section]");window.addEventListener("scroll",()=>{let t="";Wt.forEach(n=>{window.scrollY>=n.offsetTop-120&&(t=n.id)}),Kt.forEach(n=>n.classList.toggle("active",n.dataset.section===t))});function w(t,n){return Object.values(t[n||L])}function B(t){return t.map(n=>`<div class="sg-cell" style="background:${n};"></div>`).join("")}function rt(t,n){const a=t[n];Object.entries(a).forEach(([c,d])=>{Vt.style.setProperty(`--${c}`,d)})}function at(){if(!g)return;let t="";O==="tw4"?t=It(g):O==="css"?t=Ht(g):t=Ct(g),tt.textContent=t}function ot(t){const n=t[L];Yt.innerHTML=Object.entries(n).map(([a,c])=>`
      <div class="color-row">
        <div class="color-swatch" style="background:${c};"></div>
        <div class="color-info">
          <p class="color-name">${a}</p>
          <p class="color-hex">${c}</p>
        </div>
      </div>
    `).join("")}function Qt(t,n=!1){const a=document.createElement("div");a.className=`theme-card animate-card-in${n?" active":""}`,a.dataset.themeId=t.id;const c=w(t,"light");return a.innerHTML=`
      <div class="swatch-grid sg-small">${B(c)}</div>
      <p class="theme-card-name">${t.name}</p>
    `,a.addEventListener("click",()=>V(t,!0)),a}function Ut(t){const n=document.createElement("div");n.className="theme-card animate-card-in",n.dataset.themeId=t.id;const a=w(t,"light");return n.innerHTML=`
      <div class="swatch-grid sg-small">${B(a)}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:0.3rem;">
        <p class="theme-card-name">${t.name}</p>
        <button data-delete-id="${t.id}" class="fav-delete-btn">✕</button>
      </div>
    `,n.querySelector("[data-delete-id]").addEventListener("click",c=>{c.stopPropagation(),Ot(t.id),A()}),n.addEventListener("click",()=>V(t,!0)),n}function V(t,n=!1){g=t,Gt.textContent=t.name,Rt.innerHTML=`
      <span class="badge badge-accent">${t.harmony||""}</span>
      <span class="badge badge-accent">${t.mood||""}</span>
    `,Z.innerHTML=B(w(t,L)),rt(t,L),ot(t),at(),x.disabled=!1,document.querySelectorAll(".theme-card").forEach(a=>{a.classList.toggle("active",a.dataset.themeId===t.id)}),x.textContent=qt(t.id)?"★ Guardado":"★ Guardar en Favoritos",n&&document.getElementById("generator").scrollIntoView({behavior:"smooth",block:"start"})}function ct(){const t=At();_t.style.display=t.length?"none":"block",et.disabled=t.length===0,K.querySelectorAll(".theme-card").forEach(n=>n.remove()),t.forEach((n,a)=>{const c=Qt(n,g?.id===n.id);c.style.animationDelay=`${a*30}ms`,K.appendChild(c)})}function A(){console.log("[Armonic] Rendering favorites...");const t=C();if(Q&&(Q.style.display=t.length?"none":"block"),N&&(N.disabled=t.length===0),!F)return;F.querySelectorAll(".theme-card").forEach(a=>a.remove()),t.forEach(a=>{F.appendChild(Ut(a))})}function G(){const t=Mt();Bt(t),M++,Pt.textContent=`${M} tema${M!==1?"s":""} generado${M!==1?"s":""} esta sesión`,V(t),ct()}document.getElementById("generate-btn").addEventListener("click",G);document.getElementById("hero-generate-btn").addEventListener("click",()=>{G(),document.getElementById("generator").scrollIntoView({behavior:"smooth"})});x.addEventListener("click",()=>{if(!g)return;const t=jt(g);x.textContent=t?"★ Guardado":"★ Ya en Favoritos",t&&A()});et.addEventListener("click",()=>{Ft(),ct()});N.addEventListener("click",()=>{console.log("[Armonic] Clearing all favorites..."),Nt(),A()});b.addEventListener("click",()=>{navigator.clipboard.writeText(tt.textContent).then(()=>{b.textContent="✓ Copiado",b.classList.add("copied"),setTimeout(()=>{b.textContent="Copiar",b.classList.remove("copied")},2e3)})});document.querySelectorAll("[data-mode]").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll("[data-mode]").forEach(n=>n.classList.remove("active")),t.classList.add("active"),L=t.dataset.mode,g&&(rt(g,L),ot(g),Z.innerHTML=B(w(g,L)))})});document.querySelectorAll("[data-export]").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll("[data-export]").forEach(n=>n.classList.remove("active")),t.classList.add("active"),O=t.dataset.export,at()})});A();G();
