# 📻 Aplicación de Radio Vue 3

Una aplicación web moderna y responsiva para streaming de estaciones de radio de todo el mundo. Construida con Vue 3, Vite, Pinia y TailwindCSS.

## 🚀 Características

- **Reproductor Global**: Reproductor de audio persistente que continúa reproduciendo mientras navegas.
- **Búsqueda**: Encuentra estaciones por nombre, país, idioma o género.
- **Favoritos**: Guarda tus estaciones favoritas (persistidas localmente).
- **Categorías Personalizadas**: Organiza estaciones en tus propias listas de reproducción/categorías.
- **Diseño Responsivo**: Enfoque mobile-first, se ve genial en todos los dispositivos.
- **Modo Oscuro**: Elegante tema oscuro inspirado en Spotify.

## 🛠 Stack Tecnológico

- **Framework**: Vue 3 (Composition API)
- **Herramienta de Build**: Vite
- **Gestión de Estado**: Pinia
- **Routing**: Vue Router
- **Estilos**: TailwindCSS
- **Iconos**: Heroicons
- **Cliente HTTP**: Axios
- **API**: [Radio Browser API](https://www.radio-browser.info/)

## 📦 Instalación y Configuración

1.  **Instalar dependencias**

    ```bash
    npm install
    ```

2.  **Ejecutar Servidor de Desarrollo**

    ```bash
    npm run dev
    ```

3.  **Construir para Producción**

    ```bash
    npm run build
    ```

## 📱 Arquitectura

- **`src/services/api.js`**: Maneja la comunicación con la Radio Browser API, incluyendo fallback de servidor y caché.
- **`src/stores/player.js`**: Gestiona el estado global de audio (reproducción, volumen, estación actual).
- **`src/stores/stations.js`**: Gestiona la obtención de datos, favoritos y categorías de usuario.
- **`src/components/Player.vue`**: El reproductor persistente en el pie de página.
- **`src/views/`**: Componentes de página para routing.

## 📝 Notas

- La aplicación usa `localStorage` para persistir configuración de volumen, favoritos y categorías personalizadas.
- La Radio Browser API es gratuita y abierta, impulsada por la comunidad.
