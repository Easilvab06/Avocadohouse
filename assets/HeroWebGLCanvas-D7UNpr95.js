import{a as e,i as t}from"./motion-60UNJKgq.js";import{a as n,c as r,d as i,f as a,i as o,l as s,o as c,s as l,u}from"./index-OgvlyWjU.js";import{A as d,C as f,R as p,T as m,i as h,j as g,l as _,v,z as y}from"./three-Rj-p6Ql3.js";var b=`// Plano a pantalla completa: la geometría ya está en espacio de recorte
// (-1..1), así que no hacen falta matrices de cámara.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,ee=`// Crema de aguacate Hass con hilos de miel y arequipe.
// Ruido simplex 3D + FBM con "domain warping": el campo de ruido deforma sus
// propias coordenadas y produce vetas orgánicas, como dos cremas que se mezclan.
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;      // 0..1, suavizado con lerp en JS
uniform float uMouseForce; // 0..1, sube al mover el cursor
uniform float uScroll;    // progreso del hero 0..1
uniform float uVelocity;  // velocidad de scroll normalizada -1..1
uniform vec3 uCream;
uniform vec3 uAvocado;
uniform vec3 uPistachio;
uniform vec3 uHoney;
uniform vec3 uCacao;

varying vec2 vUv;

// --- Simplex 3D (Stefan Gustavson, dominio público) ---------------------
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p);
    p = p * 2.02 + vec3(1.7, 9.2, 3.1);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float t = uTime * 0.045;

  // El cursor empuja la crema: remolino suave alrededor del puntero
  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
  vec2 toMouse = p - m;
  float dist = length(toMouse);
  float swirl = exp(-dist * 3.2) * (0.35 + uMouseForce * 0.9);
  float angle = swirl * 1.6;
  p = m + mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * toMouse;

  // El scroll estira la mezcla en vertical, como crema que se arrastra
  p.y += uScroll * 0.6;
  p.y *= 1.0 + abs(uVelocity) * 0.35;

  // Domain warping en dos pasos
  vec3 q = vec3(p * 0.8, t);
  vec2 warp1 = vec2(fbm(q), fbm(q + vec3(5.2, 1.3, 2.8)));
  vec3 r = vec3(p * 0.8 + warp1 * 1.1 + vec2(uVelocity * 0.25, 0.0), t * 1.3);
  vec2 warp2 = vec2(fbm(r + vec3(1.7, 9.2, 0.0)), fbm(r + vec3(8.3, 2.8, 0.0)));
  float field = fbm(vec3(p * 0.8 + warp2 * 1.2, t * 0.8));

  // Base cremosa: crema cálida → pistacho → verde Hass
  float cream = smoothstep(-0.55, 0.65, field);
  vec3 color = mix(uPistachio, uCream, cream);
  color = mix(color, uAvocado, smoothstep(0.15, 0.75, -field) * 0.55);

  // Hilos de miel/arequipe: bandas finas sobre el campo deformado
  float threads = abs(sin((field + warp2.x * 0.6) * 4.2));
  float honey = smoothstep(0.16, 0.02, threads) * smoothstep(-0.1, 0.5, warp1.y);
  color = mix(color, uHoney, honey * 0.75);
  // Destellos de cacao muy sutiles en las vetas más profundas
  float cacao = smoothstep(0.05, 0.0, abs(sin((field - warp1.x) * 3.0))) * smoothstep(0.2, 0.6, -warp2.y);
  color = mix(color, uCacao, cacao * 0.35);

  // Brillo sedoso: falsa iluminación a partir del gradiente del campo
  float sheen = smoothstep(0.35, 0.95, field + warp1.x * 0.3);
  color += vec3(1.0, 0.97, 0.9) * sheen * 0.09;
  // Halo cálido alrededor del cursor
  color += uHoney * exp(-dist * 5.0) * 0.08 * (0.3 + uMouseForce);

  // Viñeta hacia crema para que el texto respire en los bordes
  float vignette = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(aspect * 0.8, 1.0)));
  color = mix(uCream, color, 0.35 + vignette * 0.65);

  // Grano para evitar bandas de color en degradados suaves
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.025;

  gl_FragColor = vec4(color, 1.0);
}
`,te=.62,x=1.5,S=.06,C=.08,w=r({__name:`HeroWebGLCanvas`,emits:[`ready`,`unsupported`],setup(r,{emit:w}){let T=w,E=a(null),D=a(null),O=null,k=null,A=null,j=null,M=null,N=null,P=null,F=!1,I=!0,L=0,R=new p(.5,.5),z=0,B=0,V=0;function H(e){let t=new _(e);return new y(t.r,t.g,t.b)}function U(){return{uTime:{value:0},uResolution:{value:new p(1,1)},uMouse:{value:new p(.5,.5)},uMouseForce:{value:0},uScroll:{value:0},uVelocity:{value:0},uCream:{value:H(`#F5EFE6`)},uAvocado:{value:H(`#3A5A28`)},uPistachio:{value:H(`#9CC66B`)},uHoney:{value:H(`#C88A3B`)},uCacao:{value:H(`#3E2415`)}}}function W(){return A?A.uniforms:null}function G(){let e=E.value,t=W();if(!e||!O||!t)return;let n=Math.max(e.clientWidth,1),r=Math.max(e.clientHeight,1),i=Math.min(window.devicePixelRatio||1,x)*te;O.setPixelRatio(i),O.setSize(n,r,!1),t.uResolution.value.set(n,r),F||J()}let K=new d,q=new f(-1,1,1,-1,0,1);function J(){O&&j&&O.render(K,q)}let Y=(e,t)=>{let n=W();n&&(L+=Math.min(t,50)/1e3,n.uTime.value=L,n.uMouse.value.lerp(R,S),n.uMouseForce.value+=(z-n.uMouseForce.value)*S,z*=.96,n.uVelocity.value+=(B-n.uVelocity.value)*C,B*=.92,n.uScroll.value+=(V-n.uScroll.value)*.1,J())};function X(){F||!O||n()||(F=!0,e.ticker.add(Y))}function Z(){F&&(F=!1,e.ticker.remove(Y))}function Q(){I&&document.visibilityState===`visible`?X():Z()}function $(e){let t=E.value;if(!t)return;let n=t.getBoundingClientRect();R.set((e.clientX-n.left)/n.width,1-(e.clientY-n.top)/n.height),z=Math.min(z+Math.hypot(e.movementX,e.movementY)*.004,1)}return o(({scroll:e})=>{V=Math.min(Math.max(e/Math.max(window.innerHeight,1),0),1)}),s(()=>{let e=D.value,r=E.value;if(e&&r){try{O=new h({canvas:e,antialias:!1,alpha:!1,powerPreference:`high-performance`,depth:!1,stencil:!1})}catch{O=null,T(`unsupported`);return}if(k=new m(2,2),A=new g({vertexShader:b,fragmentShader:ee,uniforms:U(),depthTest:!1,depthWrite:!1}),j=new v(k,A),j.frustumCulled=!1,K.add(j),M=new ResizeObserver(G),M.observe(r),G(),N=new IntersectionObserver(e=>{I=e.some(e=>e.isIntersecting),Q()}),N.observe(r),document.addEventListener(`visibilitychange`,Q),window.addEventListener(`pointermove`,$,{passive:!0}),P=t.create({target:window,type:`wheel,touch,scroll`,onChangeY:e=>{B=Math.max(Math.min(e.velocityY/3e3,1),-1)}}),n()){let e=W();e&&(e.uTime.value=12),J()}else Q();T(`ready`)}}),u(()=>{Z(),P?.kill(),P=null,M?.disconnect(),M=null,N?.disconnect(),N=null,document.removeEventListener(`visibilitychange`,Q),window.removeEventListener(`pointermove`,$),j&&K.remove(j),k?.dispose(),A?.dispose(),O&&(O.dispose(),O.forceContextLoss()),k=null,A=null,j=null,O=null}),(e,t)=>(i(),l(`div`,{ref_key:`hostRef`,ref:E,class:`absolute inset-0`,"aria-hidden":`true`},[c(`canvas`,{ref_key:`canvasRef`,ref:D,class:`block size-full`},null,512)],512))}});export{w as default};