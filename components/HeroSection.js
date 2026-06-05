import styles from './HeroSection.module.css';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}></div>
      <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroText}>
          <div className={styles.badge}>Centro Médico Siqueira Campos</div>
          <h1 className={styles.title}>
            Sua Saúde em <br />
            <span className="gradient-text">Boas Mãos</span>
          </h1>
          <p className={styles.subtitle}>
            Cuidando da sua saúde com carinho e confiança. Consultas médicas e exames laboratoriais em Aracaju.
          </p>
          <div className={styles.actions}>
            <Link href="/agendamento" className="btn-primary">
              Agende Agora
            </Link>
            <Link href="#sobre" className="btn-secondary" style={{ backgroundColor: 'white', color: 'var(--foreground)', border: '1px solid var(--border-color)', boxShadow: '0 4px 14px rgba(8,8,56,0.06)' }}>
              Conheça o Centro Médico
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
