'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CalendarPlus, History, ArrowLeft } from 'lucide-react';
import BookingWizard from '../../components/BookingWizard';
import ClientAreaPortal from '../../components/ClientAreaPortal';
import styles from './central-agendamento.module.css';

function CentralAgendamentoContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('agendar');

  // Detect tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'minhas-consultas' || tabParam === 'consultas' || tabParam === 'area-cliente') {
      setActiveTab('minhas-consultas');
    } else {
      setActiveTab('agendar');
    }
  }, [searchParams]);

  return (
    <div className={styles.portalContainer}>
      {/* Standalone minimalist header */}
      <header className={styles.portalHeader}>
        <div className={`container ${styles.headerContent}`}>
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="Centro Médico Siqueira Campos" 
              className={styles.logoImg} 
            />
          </Link>
        </div>
      </header>

      {/* Main Portal Body */}
      <main className={styles.portalBody}>
        <div className="container">
          
          {/* Tab Switcher */}
          <div className={styles.tabWrapper}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'agendar' ? styles.activeTabButton : ''}`}
              onClick={() => setActiveTab('agendar')}
              aria-label="Novo Agendamento"
            >
              <CalendarPlus size={18} />
              Novo Agendamento
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'minhas-consultas' ? styles.activeTabButton : ''}`}
              onClick={() => setActiveTab('minhas-consultas')}
              aria-label="Minhas Consultas"
            >
              <History size={18} />
              Minhas Consultas
            </button>
          </div>

          {/* Render Active Component */}
          <div className={styles.tabContent}>
            {activeTab === 'agendar' ? (
              <div className="glass contentCard" style={{ maxWidth: '1200px' }}>
                <h2 className="text-center responsiveTitle">
                  Agende sua Consulta ou Exame
                </h2>
                <BookingWizard />
              </div>
            ) : (
              <ClientAreaPortal />
            )}
          </div>

        </div>
      </main>

      {/* Standalone minimalist footer */}
      <footer className={styles.portalFooter}>
        <div className="container">
          <p className={styles.footerText}>
            <strong>Centro Médico Siqueira Campos</strong> &copy; {new Date().getFullYear()} • Todos os direitos reservados.
            <br />
            Rua Espírito Santo, 270 - Siqueira Campos, Aracaju - SE • Contato/WhatsApp: <a href="tel:79998529286">(79) 99852-9286</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function CentralAgendamentoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6fafd' }}>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>Carregando Portal de Agendamento...</p>
      </div>
    }>
      <CentralAgendamentoContent />
    </Suspense>
  );
}
