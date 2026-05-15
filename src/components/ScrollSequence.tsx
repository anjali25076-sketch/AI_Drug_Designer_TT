'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ScrollSequence.module.css';

interface ScrollSequenceProps {
  frameCount: number;
  imagePathPrefix: string;
}

export default function ScrollSequence({ frameCount, imagePathPrefix }: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    // Preload images
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      // format: ezgif-frame-001.png
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = `${imagePathPrefix}${paddedIndex}.png`;
      img.onload = () => {
        loadedCount++;
        setLoaded(loadedCount);
        if (loadedCount === frameCount) {
          drawFrame(0);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, [frameCount, imagePathPrefix]);

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[frameIndex];
    if (!img) return;

    // Cover scale logic
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (canvasRatio > imgRatio) {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || images.length === 0) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Calculate scroll progress relative to the container
      const scrollStart = 0;
      const scrollEnd = container.scrollHeight - window.innerHeight;
      
      // Calculate how far we've scrolled down the page
      const scrollTop = window.scrollY;
      
      // We want to map the scroll position to the frame index
      // Using a simple height mapping: e.g. 3000px total scroll space
      let progress = scrollTop / scrollEnd;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(progress * frameCount)
      );
      
      requestAnimationFrame(() => drawFrame(frameIndex));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [images, frameCount]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      
      // Redraw current frame based on scroll
      const container = containerRef.current;
      if (container) {
        let progress = window.scrollY / (container.scrollHeight - window.innerHeight);
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        const frameIndex = Math.floor(progress * (frameCount - 1));
        drawFrame(frameIndex);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.popOutVisible);
        } else {
          entry.target.classList.remove(styles.popOutVisible);
        }
      });
    }, { threshold: 0.2 });
    
    const elements = document.querySelectorAll(`.${styles.popOut}`);
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, [loaded]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.stickyCanvas}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className={`${styles.section} ${styles.alignCenter}`}>
          <div className={styles.popOut}>
            <h1 className={`${styles.title} ${styles.textGlow}`}>
              Don't search for a drug.<br />
              <span className={styles.accent}>Design one.</span>
            </h1>
            <p className={styles.sub} style={{ margin: '0 auto' }}>
              AI that generates novel drug molecules tailored to your patient's exact protein target,
              genetic profile, and disease pathway.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem' }}>
              <div className={styles.statGlow}>
                <div className={styles.statNum}>1.2B</div>
                <div className={styles.statLabel}>Molecules Screened</div>
              </div>
              <div className={styles.statGlow}>
                <div className={styles.statNum}>99.4%</div>
                <div className={styles.statLabel}>Binding Accuracy</div>
              </div>
              <div className={styles.statGlow}>
                <div className={styles.statNum}>&lt;5m</div>
                <div className={styles.statLabel}>Discovery Time</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`${styles.section} ${styles.alignLeft}`}>
          <div className={`${styles.hudPointer} ${styles.popOut}`}>
            <h2 className={styles.titleSmall}>100x Faster Discovery</h2>
            <p className={styles.sub}>Skip the 15-year wait. Generate actionable candidates in minutes using state-of-the-art generative diffusion models.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', maxWidth: '600px' }}>
              <div style={{ background: 'rgba(33, 150, 243, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(33, 150, 243, 0.1)' }}>
                <div style={{ color: 'var(--sky)', fontWeight: 700, marginBottom: '0.2rem' }}>Diffusion Models</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>3D pocket generation with unprecedented valid SMILES output.</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <div style={{ color: 'var(--mint)', fontWeight: 700, marginBottom: '0.2rem' }}>Reinforcement Learning</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Optimizes for multiple pharmacological properties simultaneously.</div>
              </div>
            </div>
            <div className={styles.hudLineLeft}><div className={styles.hudTag}>GENERATION ENGINE</div></div>
          </div>
        </div>

        <div className={`${styles.section} ${styles.alignRight}`}>
          <div className={`${styles.hudPointer} ${styles.popOut}`}>
            <h2 className={`${styles.titleSmall} ${styles.textGlow}`}>Atomic Precision</h2>
            <p className={styles.sub}>From billions of possibilities, we synthesize exactly what the target needs. Multi-parameter optimization guarantees high binding affinity.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1.5rem', maxWidth: '500px', marginLeft: 'auto' }}>
              <div style={{ background: 'rgba(251, 191, 36, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.1)', textAlign: 'left' }}>
                <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: '0.2rem' }}>pK_d &gt; 9.0 Guarantee</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Our GNNs predict binding free energy within 0.6 kcal/mol error margin, outperforming traditional docking.</div>
              </div>
            </div>
            <div className={styles.hudLineRight}><div className={styles.hudTag}>BINDING AFFINITY</div></div>
          </div>
        </div>

        <div className={`${styles.section} ${styles.alignLeft}`}>
          <div className={`${styles.hudPointer} ${styles.popOut}`}>
            <h2 className={`${styles.titleSmall} ${styles.textGlow}`}>Federated Intelligence</h2>
            <p className={styles.sub}>Train models directly on secure hospital networks without compromising patient privacy. Real-time insights from global clinical telemetry.</p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div>
                <div style={{ color: 'var(--white)', fontWeight: 600 }}>HIPAA & GDPR Compliant</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Zero-knowledge architecture.</div>
              </div>
            </div>
            <div className={styles.hudLineLeft}><div className={styles.hudTag}>SECURE TELEMETRY</div></div>
          </div>
        </div>

        <div className={`${styles.section} ${styles.alignRight}`}>
          <div className={`${styles.hudPointer} ${styles.popOut}`}>
            <h2 className={styles.titleSmall}>Toxicity Prediction</h2>
            <p className={styles.sub}>Advanced in-silico ADMET screening filters out toxic candidates before they ever reach the lab, ensuring unprecedented safety profiles.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1.5rem', maxWidth: '500px', marginLeft: 'auto' }}>
              {['Hepatotoxicity', 'Cardiotoxicity', 'Mutagenicity'].map(t => (
                <div key={t} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', margin: '0 auto 0.5rem', boxShadow: '0 0 8px var(--accent)' }}></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{t}</div>
                </div>
              ))}
            </div>
            <div className={styles.hudLineRight}><div className={styles.hudTag}>ADMET PROFILING</div></div>
          </div>
        </div>

        <div className={`${styles.section} ${styles.alignCenter}`}>
          <div className={styles.popOut} style={{ textAlign: 'center' }}>
            <h2 className={`${styles.titleSmall} ${styles.textGlow}`}>Ready to synthesize?</h2>
            <p className={styles.sub} style={{ margin: '0 auto 2rem' }}>Experience the future of pharmacology.</p>
            <a href="/platform" className="btn-primary" style={{ display: 'inline-block' }}>Launch Platform</a>
          </div>
        </div>
      </div>
      
      {loaded < frameCount && (
        <div className={styles.loading}>
          Initializing Sequence... {Math.round((loaded / frameCount) * 100)}%
        </div>
      )}
    </div>
  );
}
