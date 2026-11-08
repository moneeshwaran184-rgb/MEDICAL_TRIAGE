import { useEffect, useRef } from 'react';

/** A bounded, linear-cost flock; no video download or extra WebGL context. */
export function AmbientBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas=ref.current!, ctx=canvas.getContext('2d', { alpha: false });
    if(!ctx)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let w=0,h=0,frame=0,last=0,t=0;
    let pointer={x:.5,y:.5};
    const colors=['#8957ff','#16cbe5','#ff6b8b','#00d09c','#ffcc24'];
    const birds=Array.from({length:innerWidth<700?90:240},(_,i)=>({phase:i*2.399, speed:.12+(i%7)*.012, radius:.2+(i%13)*.025, size:3.8+(i%7)*.85, color:colors[i%colors.length]}));
    const paint=()=>{
      ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
      for(const color of colors){ctx.fillStyle=color;ctx.beginPath();
      for(const b of birds){
        if(b.color!==color)continue;
        const angle=b.phase+t*b.speed;
        const x=w*(.5+Math.cos(angle)*b.radius)+(pointer.x-.5)*18;
        const y=h*(.5+Math.sin(angle*.83+b.phase)*.42)+(pointer.y-.5)*12;
        const depth=.6+(Math.sin(angle)+1)*.3;
        const wing=(.3+Math.abs(Math.sin(t*2.4+b.phase))*.7)*b.size*depth;
        const dx=-Math.sin(angle),dy=Math.cos(angle*.83+b.phase);
        const inv=1/Math.sqrt(dx*dx+dy*dy+.0001),ux=dx*inv,uy=dy*inv;
        ctx.moveTo(x+ux*b.size*1.6,y+uy*b.size*1.6);
        ctx.lineTo(x-ux*b.size-uy*wing,y-uy*b.size+ux*wing);
        ctx.lineTo(x,y);
        ctx.lineTo(x-ux*b.size+uy*wing,y-uy*b.size-ux*wing);
        ctx.closePath();
      }
      ctx.fill();}

    };
    const tick=(now:number)=>{frame=0;if(document.hidden)return;if(now-last>=1000/60){t+=Math.min((now-last)/1000,.06);last=now;paint();}if(!reduced.matches)frame=requestAnimationFrame(tick);};
    const start=()=>{if(!frame&&!document.hidden){last=performance.now();paint();if(!reduced.matches)frame=requestAnimationFrame(tick);}};
    const resize=()=>{w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio,1);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);paint();};
    const move=(e:PointerEvent)=>{pointer={x:e.clientX/w,y:e.clientY/h};};
    const visibility=()=>{cancelAnimationFrame(frame);frame=0;start();};
    const change=()=>{cancelAnimationFrame(frame);frame=0;paint();start();};
    const theme=new MutationObserver(()=>paint());theme.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    resize();start();addEventListener('resize',resize);addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',change);
    return()=>{cancelAnimationFrame(frame);theme.disconnect();removeEventListener('resize',resize);removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',change);};
  },[]);
  return <div className="ambient-background" aria-hidden="true"><canvas ref={ref}/></div>;
}
