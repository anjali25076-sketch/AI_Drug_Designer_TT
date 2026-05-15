import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class ParticlesSwarm {
    constructor(container, count = 20000) {
        this.count = count;
        this.container = container;
        this.speedMult = 1;
        
        // SETUP
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 100);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // POST PROCESSING
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.strength = 1.8; bloomPass.radius = 0.4; bloomPass.threshold = 0;
        this.composer.addPass(bloomPass);

        // OBJECTS
        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
        this.target = new THREE.Vector3();
        this.pColor = new THREE.Color();
        
        this.geometry = new THREE.TetrahedronGeometry(0.25);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.mesh);
        
        this.positions = [];
        for(let i=0; i<this.count; i++) {
            this.positions.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
            this.mesh.setColorAt(i, this.color.setHex(0x00ff88));
        }
        
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate);
        const time = this.clock.getElapsedTime() * this.speedMult;
        
        if(this.material.uniforms && this.material.uniforms.uTime) {
            this.material.uniforms.uTime.value = time;
        }

        // API Stubs
        const PARAMS = {"scale":89,"orbitSpeed":1.05,"shellGap":10,"nucleusSpin":0};
        const addControl = (id, l, min, max, val) => {
             return PARAMS[id] !== undefined ? PARAMS[id] : val;
        };
        const setInfo = () => {};
        const annotate = () => {};
        let THREE_LIB = THREE;
        
        let THREE_LIB = THREE;
        const count = this.count; // Alias for user code
        
        for(let i=0; i<this.count; i++) {
            let target = this.target;
            let color = this.pColor;
            
            // INJECTED CODE
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
            color.setHSL(hue, 0.9, lit);
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
            
            const hue = 0.53 + 0.08 * Math.sin(time + shell + shellIndex * 0.2);
            const lit = 0.17 + glow * 0.68;
            color.setHSL(hue, 1.0, lit);
            }
            
            if (i === 0) {
            setInfo("Bohr Model: Nitrogen Atom", "Seven protons and seven neutrons form the nucleus. Seven electrons orbit in two shells: two inner electrons and five outer valence electrons.");
            annotate("nucleus", new THREE.Vector3(0, 0, 0), "Nitrogen Nucleus: 7p + 7n");
            }
            
            
            // UPDATE
            this.positions[i].lerp(this.target, 0.1);
            this.dummy.position.copy(this.positions[i]);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, this.pColor);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.instanceColor.needsUpdate = true;
        
        this.composer.render();
    }
    
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.mesh);
        this.renderer.dispose();
    }
}