import styles from './Loader.module.css';

export default function Loader({ progress, stepText }: { progress: number, stepText: string }) {
  return (
    <div className={styles.container}>
      <div className={styles.loaderGraphic}>
        <div className={styles.circle} />
        <div className={styles.circle2} />
      </div>
      <h3 className={styles.title}>Synthesizing Candidates</h3>
      <p className={styles.step}>{stepText}</p>
      
      <div className={styles.progressWrap}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
