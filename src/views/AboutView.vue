<template>
  <div class="p-6 pb-24 min-h-screen text-white">
    <div class="max-w-3xl mx-auto">
      <header class="mb-10 text-center">
        <h1 class="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Acerca de RadioApp
        </h1>
        <p class="text-gray-400 text-lg">Tu destino para descubrir música global.</p>
      </header>

      <div class="space-y-8">
        <section class="bg-[#181818] p-8 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-green-500">¿Qué es RadioApp?</h2>
          <p class="text-gray-300 leading-relaxed">
            RadioApp es una plataforma moderna diseñada para conectar a los amantes de la música con miles de estaciones de radio de todo el mundo. 
            Nuestra misión es eliminar las fronteras musicales, permitiéndote explorar ritmos, noticias y culturas desde la comodidad de tu dispositivo.
          </p>
          <p class="text-gray-300 leading-relaxed mt-4">
            Utilizamos tecnología de vanguardia para ofrecerte una experiencia de escucha fluida, rápida y personalizada. 
            Ya sea que busques el último éxito pop, clásicos del rock o noticias locales, lo encontrarás aquí.
          </p>
        </section>

        <section class="grid md:grid-cols-2 gap-6">
          <div class="bg-[#181818] p-6 rounded-xl">
            <h3 class="text-xl font-bold mb-3 text-white">Explora sin límites</h3>
            <p class="text-gray-400">Acceso a más de 30,000 estaciones en más de 200 países. Filtra por género, idioma o ubicación.</p>
          </div>
          <div class="bg-[#181818] p-6 rounded-xl">
            <h3 class="text-xl font-bold mb-3 text-white">Comunidad</h3>
            <p class="text-gray-400">Vota por tus estaciones favoritas y ayuda a otros a descubrir las joyas ocultas de la radio mundial.</p>
          </div>
        </section>

        <section class="text-center pt-8 border-t border-gray-800">
          <p class="text-gray-500 mb-2">Desarrollado con ❤️ y Vue.js</p>
          <a href="https://mtzlabs.net/" target="_blank" class="text-green-500 hover:text-green-400 font-bold transition-colors">
            Desarrollado por MTZ Labs
          </a>
        </section>
      </div>
    </div>
  </div>
</template>
