"use client";

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

const styles = [
  {
    id: "classic",
    name: "Classic",
    description: "Líneas gruesas para estilos tradicionales",
  },
  {
    id: "darwin-enriquez",
    name: "Darwin Enriquez",
    description: "Líneas limpias y detalladas",
  },
  {
    id: "stiven-hernandez",
    name: "Stiven Hernandez",
    description: "Clásico detallado",
  },
  {
    id: "andres-makishi",
    name: "Andres Makishi",
    description: "Minimalista fine-line",
  },
  {
    id: "adrian-rod",
    name: "Adrian Rod",
    description: "Detallado y alto contraste",
  },
];

export default function StyleSelector({
  selectedStyle,
  onStyleChange,
}: StyleSelectorProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="font-sans text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gold-dark tracking-wide">
        ESTILO DE ESTÉNCIL
      </h3>
      <div className="space-y-2">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`
              w-full text-left p-3 sm:p-4 border-2 transition-all duration-300
              ${
                selectedStyle === style.id
                  ? "border-gold bg-gold/10 shadow-md shadow-gold/20"
                  : "border-dark-border bg-background hover:border-gold-dark hover:bg-gold/5"
              }
            `}
          >
            <div className="font-sans font-semibold text-gold mb-1 tracking-wide text-sm sm:text-base">{style.name}</div>
            <div className="text-xs sm:text-sm text-text-muted font-sans">{style.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

