'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientAreaPortal from '../../components/ClientAreaPortal';

export default function AreaCliente() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <ClientAreaPortal />
      <Footer />
    </main>
  );
}
