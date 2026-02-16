# 📻 Vue 3 Radio App

A modern, responsive web application for streaming radio stations from around the world. Built with Vue 3, Vite, Pinia, and TailwindCSS.

## 🚀 Features

- **Global Player**: Persistent audio player that continues playing while you navigate.
- **Search**: Find stations by name, country, language, or genre.
- **Favorites**: Save your favorite stations (persisted locally).
- **Custom Categories**: Organize stations into your own playlists/categories.
- **Responsive Design**: Mobile-first approach, looks great on all devices.
- **Dark Mode**: Sleek dark theme inspired by Spotify.

## 🛠 Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: TailwindCSS
- **Icons**: Heroicons
- **HTTP Client**: Axios
- **API**: [Radio Browser API](https://www.radio-browser.info/)

## 📦 Installation & Setup

1.  **Install dependencies**

    ```bash
    npm install
    ```

2.  **Run Development Server**

    ```bash
    npm run dev
    ```

3.  **Build for Production**

    ```bash
    npm run build
    ```

## 📱 Architecture

- **`src/services/api.js`**: Handles communication with the Radio Browser API, including server fallback and caching.
- **`src/stores/player.js`**: Manages global audio state (playing, volume, current station).
- **`src/stores/stations.js`**: Manages data fetching, favorites, and user categories.
- **`src/components/Player.vue`**: The persistent footer player.
- **`src/views/`**: Page components for routing.

## 📝 Notes

- The app uses `localStorage` to persist volume settings, favorites, and custom categories.
- The Radio Browser API is free and open community-driven.
