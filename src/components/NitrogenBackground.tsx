'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default function NitrogenBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const count = 20000;
    const speedMult = 1;
    
    // SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.01);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 100);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent so global background shows through
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // POST PROCESSING
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.strength = 1.8; 
    bloomPass.radius = 0.4; 
    bloomPass.threshold = 0;
    composer.addPass(bloomPass);

    // OBJECTS
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const target = new THREE.Vector3();
    const pColor = new THREE.Color();
    
    const geometry = new THREE.TetrahedronGeometry(0.25);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);
    
    const positions: THREE.Vector3[] = [];
    for(let i=0; i<count; i++) {
        positions.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
        mesh.setColorAt(i, color.setHex(0x00ff88)); // base neon green
    }
    mesh.instanceColor!.needsUpdate = true;
    
    const clock = new THREE.Clock();
    let animationId: number;

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);

    const PARAMS = {"scale":150,"orbitSpeed":1.05,"shellGap":10,"nucleusSpin":0};
    const addControl = (id: string, l: string, min: number, max: number, val: number) => {
         return (PARAMS as any)[id] !== undefined ? (PARAMS as any)[id] : val;
    };

    const animate = () => {
        animationId = requestAnimationFrame(animate);
        const time = clock.getElapsedTime() * speedMult;
        
        for(let i=0; i<count; i++) {
            // INJECTED CODE ADAPTED FROM nitrogen.js
            const scale = addControl("scale", "Atom Scale", 20, 170, 90);
            const orbitSpeed = addControl("orbitSpeed", "Electron Speed", 0, 5, 1.18);
            const shellGap = addControl("shellGap", "Shell Gap", 10, 90, 38);
            const nucleusSpin = addControl("nucleusSpin", "Nucleus Spin", 0, 4, 0.72);
            
            const f = i / count;
            const t = time * orbitSpeed;
            
            const nucleusPortion = 0.23;
            const electronCount = 7.0;
            
            if (f < nucleusPortion) {
              const nf = f / nucleusPortion;
              const ni = i % 14;
              const isProton = ni < 7 ? 1.0 : 0.0;
              
              const ga = 2.399963229728653;
              const a = ni * ga + time * nucleusSpin;
              const zc = 1.0 - 2.0 * ((ni + 0.5) / 14.0);
              const rc = Math.sqrt(Math.max(0.0, 1.0 - zc * zc));
              
              const pulse = 1.0 + 0.055 * Math.sin(time * 4.0 + i * 0.29);
              const jitter = 0.12 * Math.sin(time * 2.0 + i * 1.37);
              const nr = scale * 0.135 * pulse;
              
              const x = Math.cos(a + jitter) * rc * nr;
              const y = Math.sin(a + jitter) * rc * nr;
              const z = zc * nr;
              
              target.set(x, y, z);
              
              const hue = isProton * 0.0 + (1.0 - isProton) * 0.58;
              const lit = 0.52 + 0.14 * Math.sin(time * 3.0 + ni);
              pColor.setHSL(hue, 0.9, lit);
            } else {
              const ef = (f - nucleusPortion) / (1.0 - nucleusPortion);
              const eSlot = Math.floor(ef * electronCount);
              const eLocal = ef * electronCount - eSlot;
              
              const shell = eSlot < 2.0 ? 1.0 : 2.0;
              const shellIndex = shell < 1.5 ? eSlot : eSlot - 2.0;
              const shellElectrons = shell < 1.5 ? 2.0 : 5.0;
              
              const orbitR = scale * 0.32 + shell * shellGap;
              const trailAngle = eLocal * 6.283185307179586;
              const baseAngle = trailAngle + t * (1.48 + shell * 0.32) + shellIndex * 6.283185307179586 / shellElectrons;
              
              const tiltA = shellIndex * 1.2566370614359172 + shell * 0.55;
              const tiltB = shellIndex * 0.6283185307179586 + shell * 0.38;
              
              const ox = Math.cos(baseAngle) * orbitR;
              const oy = Math.sin(baseAngle) * orbitR * 0.72;
              const oz = Math.sin(baseAngle + t * 0.14) * orbitR * 0.08;
              
              const ca = Math.cos(tiltA);
              const sa = Math.sin(tiltA);
              const cb = Math.cos(tiltB);
              const sb = Math.sin(tiltB);
              
              const x1 = ox;
              const y1 = oy * ca - oz * sa;
              const z1 = oy * sa + oz * ca;
              
              const x2 = x1 * cb + z1 * sb;
              const y2 = y1;
              const z2 = -x1 * sb + z1 * cb;
              
              const glow = Math.pow(1.0 - eLocal, 2.0);
              const pulse = 1.0 + glow * 0.04;
              
              target.set(x2 * pulse, y2 * pulse, z2 * pulse);
              
              const hue = 0.53 + 0.08 * Math.sin(time + shell + shellIndex * 0.2); // neon greens and blues
              const lit = 0.17 + glow * 0.68;
              pColor.setHSL(hue, 1.0, lit);
            }
            
            // UPDATE
            positions[i].lerp(target, 0.1);
            dummy.position.copy(positions[i]);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            mesh.setColorAt(i, pColor);
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        
        composer.render();
    };
    
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      geometry.dispose();
      material.dispose();
      scene.remove(mesh);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        width: '100%',
        height: '100%',
        opacity: 0.85,
        mixBlendMode: 'screen'
      }}
    />
  );
}
