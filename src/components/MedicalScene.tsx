import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function MedicalScene() {
  const host = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(true);
  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { setAvailable(false); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 50);
    camera.position.set(0, 0, 9);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6a65b8, 3));
    const light = new THREE.DirectionalLight(0xffffff, 5); light.position.set(-3, 5, 6); scene.add(light);
    const rim = new THREE.PointLight(0x8ef5dd, 30); rim.position.set(3, -1, 3); scene.add(rim);
    const mat = (color: number, metalness = .1) => new THREE.MeshPhysicalMaterial({ color, metalness, roughness: .24, clearcoat: 1, clearcoatRoughness: .12 });
    const white = mat(0xfffdf4), blue = mat(0x2154fe), pink = mat(0xff9baa), silver = mat(0xbacbdd, .8), mint = mat(0x00d09c);
    const mesh = (g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, x=0,y=0,z=0) => { const o=new THREE.Mesh(g,m); o.position.set(x,y,z); parent.add(o); return o; };
    const world = new THREE.Group(); scene.add(world);
    const eye = new THREE.Group(); world.add(eye); eye.position.set(.45,.5,0);
    mesh(new THREE.SphereGeometry(.87,48,32),white,eye);
    const iris = mesh(new THREE.SphereGeometry(.46,48,24),blue,eye,0,0,.76); iris.scale.z=.29;
    const pupil=mesh(new THREE.SphereGeometry(.22,32,24),mat(0x071b30),eye,0,0,.895); pupil.scale.z=.2;
    for(let i=0;i<64;i++){const a=i*Math.PI/32;const fiber=mesh(new THREE.BoxGeometry(.012,.17,.008),i%2?mint:mat(0x709bff),eye,Math.sin(a)*.33,Math.cos(a)*.33,.887);fiber.rotation.z=-a;}
    mesh(new THREE.SphereGeometry(.075,16,12),white,eye,-.13,.17,.94);
    const syringe=new THREE.Group(); world.add(syringe); syringe.position.set(-1.4,.05,.25); syringe.rotation.z=-.55;
    mesh(new THREE.CylinderGeometry(.21,.21,1.3,32),white,syringe);
    mesh(new THREE.CylinderGeometry(.215,.215,.4,32),mint,syringe,0,-.3,0);
    mesh(new THREE.CylinderGeometry(.085,.085,.48,20),silver,syringe,0,.88,0);
    mesh(new THREE.CylinderGeometry(.3,.3,.09,32),blue,syringe,0,1.15,0);
    mesh(new THREE.BoxGeometry(.66,.09,.22),blue,syringe,0,.62,0);
    mesh(new THREE.CylinderGeometry(.09,.045,.22,20),blue,syringe,0,-.76,0);
    mesh(new THREE.CylinderGeometry(.015,.008,.62,12),silver,syringe,0,-1.16,0);
    for(let i=0;i<6;i++)mesh(new THREE.BoxGeometry(i%2?.1:.17,.018,.02),blue,syringe,.04,i*.14-.22,.21);
    const bandage=new THREE.Group();world.add(bandage);bandage.position.set(.9,-1.25,.4);bandage.rotation.set(.2,-.25,-.5);
    const strip=mesh(new THREE.CapsuleGeometry(.28,1.05,8,24),pink,bandage);strip.scale.z=.24;strip.rotation.z=Math.PI/2;
    const pad=mesh(new THREE.BoxGeometry(.5,.38,.11),white,bandage,0,0,.08);
    for(const side of [-1,1])for(let x=0;x<3;x++)for(let y=0;y<3;y++)mesh(new THREE.SphereGeometry(.022,8,6),mat(0xcd687d),bandage,side*(.4+x*.11),(y-1)*.11,.073);
    for(let i=0;i<5;i++)mesh(new THREE.SphereGeometry(.045+i*.015,16,12),i%2?mint:blue,world,Math.sin(i*2)*2,Math.cos(i*2)*1.8,-.6);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let targetX=0,targetY=0,frame=0,visible=true,last=0,time=0;
    const pointer=(e:PointerEvent)=>{const r=el.getBoundingClientRect();targetX=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));targetY=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));};
    const draw=(now:number)=>{frame=0;if(!visible||document.hidden)return;const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;
      if(!reduced.matches){world.rotation.y+=(targetX*.18-world.rotation.y)*(1-Math.exp(-dt*4));world.rotation.x+=(-targetY*.1-world.rotation.x)*(1-Math.exp(-dt*4));eye.position.y=.5+Math.sin(time*.65)*.1;eye.rotation.y=targetX*.12;syringe.position.y=Math.sin(time*.7+1)*.14;bandage.position.y=-1.25+Math.sin(time*.6+2)*.12;}
      renderer.render(scene,camera);if(!reduced.matches)frame=requestAnimationFrame(draw);
    };
    const start=()=>{if(!frame){last=performance.now();frame=requestAnimationFrame(draw);}};
    const resize=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();start();});resize.observe(el);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;}});observer.observe(el);
    const visibility=()=>{if(!document.hidden)start();};document.addEventListener('visibilitychange',visibility);window.addEventListener('pointermove',pointer,{passive:true});reduced.addEventListener('change',start);start();
    return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pointermove',pointer);reduced.removeEventListener('change',start);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
  }, []);
  return <div className="medical-scene" role="img" aria-label="Floating three-dimensional eye, syringe and bandage"><div ref={host} className="medical-scene-canvas" aria-hidden="true" />{!available&&<div className="medical-scene-fallback" aria-hidden="true">✚</div>}<div className="medical-glass-label"><span className="medical-status-dot"/> A little science. A lot of care.<small>PRECISION · COMFORT · YOU</small></div></div>;
}
