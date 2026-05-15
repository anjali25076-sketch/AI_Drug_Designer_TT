import ScrollSequence from '@/components/ScrollSequence';

export default function Home() {
  return (
    <main>
      <ScrollSequence 
        frameCount={210} 
        imagePathPrefix="/frames/ezgif-frame-" 
      />
    </main>
  );
}
