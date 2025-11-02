export default function TestColors() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="font-serif text-4xl font-bold text-gold mb-8">
          Test de Colores
        </h1>

        <div className="grid grid-cols-2 gap-4">
          {/* Fondos */}
          <div className="bg-background border-2 border-gold p-4">
            <p className="text-gold">background: #000000</p>
          </div>
          
          <div className="bg-dark-bg border-2 border-gold p-4">
            <p className="text-gold">dark-bg: #0A0A0A</p>
          </div>
          
          <div className="bg-dark-card border-2 border-gold p-4">
            <p className="text-gold">dark-card: #1A1A1A</p>
          </div>
          
          <div className="bg-background border-2 border-dark-border p-4">
            <p className="text-gold">dark-border: #333333</p>
          </div>

          {/* Dorados */}
          <div className="bg-gold p-4">
            <p className="text-background">gold: #C9B896</p>
          </div>
          
          <div className="bg-gold-light p-4">
            <p className="text-background">gold-light: #D4C4A8</p>
          </div>
          
          <div className="bg-gold-dark p-4">
            <p className="text-background">gold-dark: #B8A886</p>
          </div>
          
          <div className="bg-bronze p-4">
            <p className="text-background">bronze: #B8A886</p>
          </div>

          {/* Textos */}
          <div className="bg-dark-card border border-dark-border p-4">
            <p className="text-text-primary">text-primary: #E5E5E5</p>
            <p className="text-text-secondary">text-secondary: #C9B896</p>
            <p className="text-text-muted">text-muted: #8A8A8A</p>
            <p className="text-text-dark">text-dark: #666666</p>
          </div>

          {/* Gradientes */}
          <div className="bg-gradient-gold p-4">
            <p className="text-background font-bold">gradient-gold</p>
          </div>
          
          <div className="bg-gradient-dark p-4 border border-gold">
            <p className="text-gold font-bold">gradient-dark</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-gradient-gold text-background font-sans font-semibold hover:opacity-90"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
}
