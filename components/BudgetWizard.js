'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Plus, Check, FileText, Phone, User, ShoppingCart, RefreshCw, AlertTriangle } from 'lucide-react';
import { getCentros, getConvenios, getProcedimentosPreco } from '../services/orcamento';
import styles from './BudgetWizard.module.css';

export default function BudgetWizard() {
  // Lists from API
  const [convenios, setConvenios] = useState([]);
  const [centros, setCentros] = useState([]);
  const [procedures, setProcedures] = useState([]);
  
  // Flow Step State (1: Select Convenio, 2: Search and Cart)
  const [step, setStep] = useState(1);

  // Selection States
  const [selectedConvenio, setSelectedConvenio] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart State (array of { codProcedimento, procedimento, centro, codCentro, valor })
  const [cart, setCart] = useState([]);
  
  // Client Info for PDF
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [loadingProcedures, setLoadingProcedures] = useState(false);
  const [error, setError] = useState(null);
  const [errorProcedures, setErrorProcedures] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Load Initial Data (Centros and Convenios)
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);
        const [convs, cents] = await Promise.all([getConvenios(), getCentros()]);
        
        // Clean and sort agreements
        const cleanedConvs = (convs || []).map(c => ({
          codigo: c.codigo,
          convenio: (c.convenio || '').trim()
        }));
        
        const cleanedCents = (cents || []).map(c => ({
          codigo: c.codigo,
          centro: (c.centro || '').trim()
        }));
        
        setConvenios(cleanedConvs);
        setCentros(cleanedCents);
        
        // Set default to PARTICULAR (code 100) if it exists, else first
        const defaultConv = cleanedConvs.find(c => c.codigo === 100) || cleanedConvs[0];
        if (defaultConv) {
          setSelectedConvenio(defaultConv.codigo);
        }
      } catch (err) {
        console.error("Erro ao carregar convênios/centros:", err);
        setError("Não foi possível carregar os dados do servidor. Por favor, recarregue a página.");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Load Procedures when selected convenio changes
  useEffect(() => {
    if (!selectedConvenio) return;
    
    async function loadProcedures() {
      try {
        setLoadingProcedures(true);
        setErrorProcedures(null);
        const procs = await getProcedimentosPreco(selectedConvenio);
        
        // Clean up text
        const cleanedProcs = (procs || []).map(p => ({
          ...p,
          convenio: (p.convenio || '').trim(),
          centro: (p.centro || '').trim(),
          procedimento: (p.procedimento || '').trim(),
        }));
        
        setProcedures(cleanedProcs);
      } catch (err) {
        console.error("Erro ao carregar procedimentos:", err);
        setErrorProcedures("Não foi possível carregar os exames para o convênio selecionado.");
      } finally {
        setLoadingProcedures(false);
      }
    }
    
    loadProcedures();
  }, [selectedConvenio]);

  // Format Phone Input
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    setClientPhone(value);
  };

  // In-memory Filtered Procedures (limited to 50 for performance)
  const filteredProcedures = useMemo(() => {
    if (!procedures) return [];
    
    return procedures.filter(p => {
      // Filter by search term (code or description)
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.procedimento.toLowerCase().includes(term) ||
        p.codProcedimento.toLowerCase().includes(term)
      );
    }).slice(0, 50); // limit output size to prevent lag
  }, [procedures, searchTerm]);

  // Update Cart details based on current procedures (in case convenio changes, update values)
  const cartItems = useMemo(() => {
    return cart.map(cartItem => {
      // Find matching procedure in the currently loaded convenio list
      const match = procedures.find(p => p.codProcedimento === cartItem.codProcedimento);
      if (match) {
        return {
          codProcedimento: cartItem.codProcedimento,
          procedimento: match.procedimento,
          centro: match.centro,
          codCentro: match.codCentro,
          valor: match.valor,
          indisponivel: false
        };
      }
      // If the exam is not available under the newly selected convenio
      return {
        ...cartItem,
        valor: 0,
        indisponivel: true
      };
    });
  }, [cart, procedures]);

  // Calculate Total
  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.valor || 0), 0);
  }, [cartItems]);

  // Scroll to cart on mobile devices
  const scrollToCart = () => {
    const cartElement = document.getElementById('cart-section');
    if (cartElement) {
      cartElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Toggle Add / Remove from Cart
  const handleToggleCart = (exam) => {
    const exists = cart.some(item => item.codProcedimento === exam.codProcedimento);
    if (exists) {
      setCart(prev => prev.filter(item => item.codProcedimento !== exam.codProcedimento));
    } else {
      setCart(prev => [...prev, {
        codProcedimento: exam.codProcedimento,
        procedimento: exam.procedimento,
        centro: exam.centro,
        codCentro: exam.codCentro,
        valor: exam.valor
      }]);
    }
  };

  const handleRemoveFromCart = (codProcedimento) => {
    setCart(prev => prev.filter(item => item.codProcedimento !== codProcedimento));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    if (cart.length === 0) return;
    
    try {
      setPdfGenerating(true);
      
      // Dynamic imports to prevent SSR issues in Next.js
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const convenioName = convenios.find(c => c.codigo === Number(selectedConvenio))?.convenio || 'Particular';

      // Design Pallette
      const primaryColor = [8, 8, 56]; // #080838 - Dark Blue
      const secondaryColor = [104, 200, 248]; // #68c8f8 - Light Blue
      const greenColor = [152, 200, 8]; // #98c808 - Green Accent
      
      // 1. Header (Clinic details)
      doc.setFillColor(246, 250, 253); // Light background
      doc.rect(0, 0, 210, 40, 'F');
      
      // Draw a line accent
      doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setLineWidth(1.5);
      doc.line(0, 40, 210, 40);

      // Clinic Name
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text("CENTRO MÉDICO SIQUEIRA CAMPOS", 15, 18);
      
      // Clinic Subtitle / Address
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(92, 102, 96); // Muted grey
      doc.text("Rua Espirito Santo, 270 - Siqueira Campos, Aracaju, SE - CEP: 49075-460", 15, 25);
      doc.text("Contato: (79) 99852-9286 | Agendamento Online: siqueiracampos.com.br", 15, 30);

      // 2. Document Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("ORÇAMENTO DE PROCEDIMENTOS E EXAMES", 15, 52);
      
      // Decorative small block
      doc.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
      doc.rect(15, 55, 25, 1.5, 'F');

      // 3. Metadata (Date, Patient Info, Agreement)
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(50, 50, 50);
      
      const dateStr = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Left Column metadata
      doc.setFont('Helvetica', 'bold');
      doc.text("Paciente:", 15, 65);
      doc.setFont('Helvetica', 'normal');
      doc.text(clientName || "Não Informado", 32, 65);

      doc.setFont('Helvetica', 'bold');
      doc.text("Telefone:", 15, 71);
      doc.setFont('Helvetica', 'normal');
      doc.text(clientPhone || "Não Informado", 32, 71);

      // Right Column metadata
      doc.setFont('Helvetica', 'bold');
      doc.text("Convênio:", 120, 65);
      doc.setFont('Helvetica', 'normal');
      doc.text(convenioName, 140, 65);

      doc.setFont('Helvetica', 'bold');
      doc.text("Emissão:", 120, 71);
      doc.setFont('Helvetica', 'normal');
      doc.text(dateStr, 140, 71);

      // 4. Table of Items
      const tableRows = cartItems.map((item, index) => [
        String(index + 1).padStart(2, '0'),
        item.codProcedimento,
        item.procedimento,
        item.centro,
        item.indisponivel ? 'Não coberto' : `R$ ${item.valor.toFixed(2).replace('.', ',')}`
      ]);

      autoTable(doc, {
        startY: 78,
        head: [['Item', 'Código', 'Procedimento / Exame', 'Área / Centro', 'Valor']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [8, 8, 56],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [40, 40, 40]
        },
        columnStyles: {
          0: { width: 10, halign: 'center' },
          1: { width: 22 },
          2: { width: 85 },
          3: { width: 45 },
          4: { width: 28, halign: 'right' }
        },
        margin: { left: 15, right: 15 }
      });

      // 5. Total Price
      const finalY = (doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || 80) + 8;
      
      // Total Box
      doc.setFillColor(246, 250, 253);
      doc.setDrawColor(224, 240, 248);
      doc.rect(130, finalY, 65, 12, 'FD');
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("VALOR TOTAL:", 134, finalY + 7.5);
      
      doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
      doc.setFontSize(13);
      doc.text(`R$ ${cartTotal.toFixed(2).replace('.', ',')}`, 164, finalY + 7.5);

      // 6. Notes & Terms
      const noteY = finalY + 22;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text("Informações Importantes:", 15, noteY);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(92, 102, 96);
      
      const notes = [
        "1. Este orçamento é informativo, baseado na tabela de valores vigente e convênio selecionado.",
        "2. Validade deste orçamento: 15 dias a partir da data de emissão.",
        "3. Alguns exames laboratoriais ou de imagem necessitam de preparo especial (como jejum completo,",
        "   suspensão temporária de medicamentos ou ingestão prévia de água). Por favor, entre em contato para orientações.",
        "4. Para agendar seus exames, utilize o agendamento online no site ou entre em contato via WhatsApp pelo (79) 99852-9286."
      ];

      notes.forEach((note, idx) => {
        doc.text(note, 15, noteY + 5 + (idx * 4));
      });

      // 7. Footer Page Number / Branding
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text("Centro Médico Siqueira Campos - Cuidando da sua saúde com carinho e confiança.", 15, 287);
        doc.text(`Página ${i} de ${pageCount}`, 180, 287);
      }

      // Save PDF
      const fileName = `Orcamento_${clientName ? clientName.replace(/\s+/g, '_') : 'Siqueira_Campos'}.pdf`;
      doc.save(fileName);
      
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Houve um erro ao gerar o arquivo PDF. Por favor, tente novamente.");
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingText}>
        <RefreshCw className="animate-spin" style={{ margin: '0 auto 1rem', animation: 'spin 1.5s linear infinite' }} size={32} />
        <p>Carregando convênios e exames disponíveis...</p>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <AlertTriangle size={48} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
        <p>{error}</p>
      </div>
    );
  }

  // Step 1 Layout: Select Convenio
  if (step === 1) {
    return (
      <div className={styles.step1Container}>
        <div className={styles.step1Card}>
          <h3 className={styles.step1Title}>Selecione seu Convênio</h3>
          <p className={styles.step1Subtitle}>
            Para iniciarmos seu orçamento, selecione o seu plano ou convênio de atendimento abaixo.
          </p>
          <div className={styles.selectorGroup} style={{ marginBottom: '2rem' }}>
            <select 
              value={selectedConvenio} 
              onChange={(e) => setSelectedConvenio(e.target.value)}
              className={styles.selectInput}
              style={{ fontSize: '1.05rem' }}
            >
              <option value="" disabled>Escolha um convênio...</option>
              {convenios.map(c => (
                <option key={c.codigo} value={c.codigo}>
                  {c.convenio}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => setStep(2)}
            className="btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            disabled={!selectedConvenio}
          >
            Avançar
          </button>
        </div>
      </div>
    );
  }

  // Step 2 Layout: Search Exams & Cart
  const convenioName = convenios.find(c => c.codigo === Number(selectedConvenio))?.convenio || 'Particular';

  return (
    <div className={styles.container}>
      {/* Search & Selection Area */}
      <div className={styles.searchSection}>
        {/* Step Header showing current convenio & option to change */}
        <div className={styles.stepHeader}>
          <div className={styles.convenioBadge}>
            Convênio Selecionado: <strong>{convenioName}</strong>
          </div>
          <button 
            onClick={() => setStep(1)} 
            className={styles.changeConvenioBtn}
          >
            Alterar Convênio
          </button>
        </div>

        {/* Search Exams */}
        <div className={styles.selectorGroup}>
          <label className={styles.selectorLabel}>Busque os exames ou consultas</label>
          <div className={styles.searchBoxWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Digite o nome do exame ou código (Ex: Hemograma, Urina, Ultrassom...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Search Results List */}
        <div className={styles.selectorGroup}>
          <label className={styles.selectorLabel}>
            Exames Disponíveis ({filteredProcedures.length} de {procedures.length})
          </label>
          
          {loadingProcedures ? (
            <div className={styles.loadingText}>
              <RefreshCw className="animate-spin" style={{ margin: '0 auto 1rem', animation: 'spin 1.5s linear infinite' }} size={24} />
              <p>Atualizando tabela de preços...</p>
            </div>
          ) : errorProcedures ? (
            <div className={styles.emptyState}>
              <p>{errorProcedures}</p>
            </div>
          ) : filteredProcedures.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhum procedimento encontrado com o termo digitado.</p>
            </div>
          ) : (
            <div className={styles.resultsContainer}>
              {filteredProcedures.map(exam => {
                const isInCart = cart.some(item => item.codProcedimento === exam.codProcedimento);
                return (
                  <div 
                    key={exam.codProcedimento} 
                    className={`${styles.resultCard} ${isInCart ? styles.resultCardSelected : ''}`}
                    onClick={() => handleToggleCart(exam)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.examDetails}>
                      <span className={styles.examName}>{exam.procedimento}</span>
                      <span className={styles.examCategory}>{exam.centro}</span>
                    </div>
                    <div className={styles.examAction}>
                      <span className={styles.examPrice}>
                        R$ {exam.valor.toFixed(2).replace('.', ',')}
                      </span>
                      <div 
                        className={`${styles.addButton} ${isInCart ? styles.addButtonAdded : ''}`}
                        title={isInCart ? "Remover do Orçamento" : "Adicionar ao Orçamento"}
                      >
                        {isInCart ? <Check size={18} /> : <Plus size={18} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart (Carrinho) Area */}
      <div id="cart-section" className={styles.cartSection}>
        <div className={`${styles.cartCard} glass`}>
          <div className={styles.cartHeader}>
            <h3 className={styles.cartTitle}>
              <ShoppingCart size={20} />
              Seu Orçamento
            </h3>
            <span className={styles.cartCount}>{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</span>
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.emptyState} style={{ padding: '2rem 1rem' }}>
              <p>Nenhum exame selecionado ainda.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                Pesquise ao lado e clique em "+" para adicionar exames a este orçamento.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.cartItemsList}>
                {cartItems.map(item => (
                  <div key={item.codProcedimento} className={styles.cartItem}>
                    <div className={styles.cartItemInfo}>
                      <div className={styles.cartItemName}>{item.procedimento}</div>
                      <div className={styles.cartItemCategory}>{item.centro}</div>
                      {item.indisponivel && (
                        <div style={{ color: 'var(--error)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.1rem' }}>
                          <AlertTriangle size={10} /> Não coberto por este convênio
                        </div>
                      )}
                    </div>
                    <div className={styles.cartItemRight}>
                      <span className={styles.cartItemPrice} style={{ color: item.indisponivel ? 'var(--text-muted)' : 'inherit' }}>
                        {item.indisponivel ? '—' : `R$ ${item.valor.toFixed(2).replace('.', ',')}`}
                      </span>
                      <button 
                        onClick={() => handleRemoveFromCart(item.codProcedimento)}
                        className={styles.removeBtn}
                        title="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.cartTotal}>
                <span>Total:</span>
                <span className={styles.totalValue}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>

              {/* Personalization Fields */}
              <div className={styles.formGroup}>
                <div style={{ fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  Personalizar Orçamento (Opcional):
                </div>
                
                <div className={styles.formField}>
                  <label htmlFor="patient-name">Nome Completo</label>
                  <input 
                    id="patient-name"
                    type="text" 
                    placeholder="Nome do Paciente"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="patient-phone">WhatsApp / Telefone</label>
                  <input 
                    id="patient-phone"
                    type="text" 
                    placeholder="(00) 00000-0000"
                    value={clientPhone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>

              {/* PDF Button */}
              <button 
                onClick={handleGeneratePDF}
                disabled={pdfGenerating || cartItems.length === 0}
                className={styles.submitBtn}
              >
                {pdfGenerating ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Gerar PDF do Orçamento
                  </>
                )}
              </button>
              
              <div style={{ textAlign: 'center' }}>
                <button onClick={handleClearCart} className={styles.clearCartBtn}>
                  Limpar todos os itens
                </button>
              </div>

              <p className={styles.cartFooterNote}>
                * Orçamento gerado de acordo com a tabela selecionada. Valores sujeitos a alteração no momento do atendimento.
              </p>
            </>
          )}
        </div>
      </div>
      {cart.length > 0 && (
        <button 
          onClick={scrollToCart} 
          className={styles.floatingCartBtn}
          aria-label="Ver Orçamento"
        >
          <ShoppingCart size={18} />
          <span>Ver Orçamento ({cart.length})</span>
        </button>
      )}
    </div>
  );
}
