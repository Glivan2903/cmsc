import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BudgetWizard from "../../components/BudgetWizard";

export const metadata = {
  title: "Orçamento de Exames - Centro Médico Siqueira Campos",
  description: "Gere seu orçamento de exames e consultas no Centro Médico Siqueira Campos de forma fácil, rápida e online.",
};

export default function Orcamento() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      
      <section className="pageSection container">
        <div className="glass contentCard" style={{ maxWidth: "1200px" }}>
          <h2 className="text-center responsiveTitle">
            Orçamento de Exames e Consultas
          </h2>
          <p className="text-center" style={{ color: "var(--text-muted)", marginBottom: "2rem", marginTop: "-1.5rem", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            Selecione seu convênio, busque os procedimentos desejados, adicione-os ao carrinho e gere um documento em PDF com seu orçamento.
          </p>
          <BudgetWizard />
        </div>
      </section>

      <Footer />
    </main>
  );
}
