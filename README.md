# 🎨 InkFamily - Generador de Esténciles de Tatuajes con IA

Aplicación web moderna para convertir imágenes en esténciles de tatuajes profesionales, potenciada por **Pollinations Kontext IA** (100% GRATIS).

## ✨ Características

- 🤖 **IA Real**: Usa Pollinations Kontext para conversión image-to-image
- 🎨 **5 Estilos Profesionales**: Classic, Darwin Enriquez, Stiven Hernandez, Andres Makishi, Adrian Rod
- ⚡ **Preserva tu imagen**: No genera contenido random, respeta tu diseño original
- 🌸 **Tier Gratis Disponible**: Acceso gratuito con tier "seed" de Pollinations
- 🔓 **Open Source**: Código abierto y API de Pollinations

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/InkFamily.git
cd InkFamily

# 2. Instalar dependencias
npm install

# 3. Configurar Pollinations API
cp .env.local.example .env.local
# Edita .env.local y agrega tu POLLINATIONS_API_KEY
```

## 🔑 Configuración de Pollinations API

**Sigue las instrucciones en: [`SETUP_POLLINATIONS.md`](./SETUP_POLLINATIONS.md)**

Resumen rápido:
1. Crea cuenta en https://auth.pollinations.ai
2. Copia tu API key
3. Agrégala a `.env.local`:
   ```env
   POLLINATIONS_API_KEY=EgVSmf7rauvACtdD
   ```

## 🌸 ¿Por qué Pollinations?

- **Tier Gratis**: Acceso al modelo Kontext con tier "seed"
- **Image-to-Image Real**: Modelo Kontext respeta tu imagen original
- **Alta Calidad**: IA generativa profesional
- **Open Source**: https://pollinations.ai

## 🎯 Uso

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
http://localhost:3000
```

1. Sube tu imagen
2. Selecciona un estilo
3. Presiona "Generar Esténcil con IA"
4. Espera 15-30 segundos (calidad profesional 2048x2048)
5. Descarga tu esténcil de alta calidad para tatuajes

## 🎨 Estilos Disponibles

- **Classic**: Líneas gruesas para estilos tradicionales
- **Darwin Enriquez**: Líneas limpias y detalladas
- **Stiven Hernandez**: Clásico detallado con líneas conectadas
- **Andres Makishi**: Minimalista fine-line
- **Adrian Rod**: Detallado con alto contraste

## 🛠️ Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Pollinations Kontext** - IA gratuita para image-to-image
- **freeimage.host** - Hosting temporal de imágenes

## 📝 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor abre un issue o PR.
