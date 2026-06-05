import styles from './AboutSection.module.css';
import { MapPin, Clock, Phone } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="sobre" className="section container">
      <div className={styles.grid}>
        <div className={styles.imageContainer}>
          <div className={styles.imagePlaceholder}>
            {/* Generate Image Placeholder */}
            <div className={styles.imageText}>Centro Médico Moderno e Equipado</div>
          </div>
        </div>
        <div className={styles.content}>
          <h2 className={styles.title}>Tradição e Cuidado em <span className="gradient-text">Aracaju</span></h2>
          <p className={styles.description}>
            O Centro Médico Siqueira Campos nasceu com o propósito de oferecer medicina de qualidade com atendimento humanizado. Cuidando da sua saúde com carinho e confiança.<br /><br />
            <strong>Consultas médicas • Exames ( Laboratoriais )</strong>
          </p>
          
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <MapPin size={24} />
              </div>
              <div>
                <h4 className={styles.infoTitle}>Localização</h4>
                <p className={styles.infoText}>
                  Rua Espirito Santo, 270 - Siqueira Campos<br />
                  Aracaju, SE - 49075-460<br />
                  <strong>WhatsApp:</strong> <a href="https://contate.me/5579998529286" target="_blank" rel="noopener noreferrer">(79) 99852-9286</a>
                </p>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <Clock size={24} />
              </div>
              <div>
                <h4 className={styles.infoTitle}>Horário de Funcionamento</h4>
                <p className={styles.infoText}>
                  Segunda a Sexta: 06h às 16h<br />
                  Sábado: 06h às 12h<br />
                  Domingo e Feriados: Fechado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
