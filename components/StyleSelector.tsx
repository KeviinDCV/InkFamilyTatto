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
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        Estilo de Esténcil
      </h3>
      <div className="space-y-2">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all
              ${
                selectedStyle === style.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }
            `}
          >
            <div className="font-semibold text-primary mb-1">{style.name}</div>
            <div className="text-sm text-gray-600">{style.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

