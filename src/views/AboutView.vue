<template>
  <div class="p-6 pb-24 min-h-screen text-white">
    <div class="max-w-3xl mx-auto">
      <header class="mb-10 text-center">
        <h1 class="text-4xl font-bold mb-4 bg-clip-text text-white ">
          Acerca de RadioApp
        </h1>
        <p class="text-gray-400 text-lg">Tu portal para descubrir radio de todo el mundo.</p>
      </header>

      <div class="space-y-8">
        <section class="bg-[#181818] p-8 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-green-500">¿Qué es RadioApp?</h2>
          <p class="text-gray-300 leading-relaxed">
            RadioApp es como tener una radio mundial en tu dispositivo. Te conectamos con miles de estaciones de radio de todos los países, 
            permitiéndote descubrir música, noticias y culturas que nunca imaginaste que existían.
          </p>
          <p class="text-gray-300 leading-relaxed mt-4">
            No necesitas registrarte ni pagar. Solo abre la app, explora y disfruta de la radio sin fronteras.
          </p>
        </section>

        <section class="bg-[#181818] p-8 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-green-500">¿Cómo funciona?</h2>
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-black font-bold text-sm">1</span>
              </div>
              <div>
                <h3 class="font-bold text-white mb-1">Explora estaciones</h3>
                <p class="text-gray-400">Navega por países, géneros o usa el buscador para encontrar exactly lo que te gusta.</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-black font-bold text-sm">2</span>
              </div>
              <div>
                <h3 class="font-bold text-white mb-1">Guarda tus favoritas</h3>
                <p class="text-gray-400">Crea listas personales y marca tus estaciones preferidas para volver a ellas fácilmente.</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-black font-bold text-sm">3</span>
              </div>
              <div>
                <h3 class="font-bold text-white mb-1">Descubre música nueva</h3>
                <p class="text-gray-400">Usa la función aleatoria para encontrar estaciones que nunca escucharías por casualidad.</p>
              </div>
            </div>
          </div>
        </section>

        <section class="bg-[#181818] p-8 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-green-500">¿Por qué algunas estaciones no cargan?</h2>
          <div class="space-y-4">
            <div class="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
              <h3 class="font-bold text-yellow-400 mb-2">📡 Problemas técnicos de las estaciones</h3>
              <p class="text-gray-300 text-sm">
                Algunas estaciones tienen servidores que a veces fallan o están en mantenimiento. 
                No es culpa de la app, sino de la propia estación de radio.
              </p>
            </div>
            
            <div class="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
              <h3 class="font-bold text-blue-400 mb-2">🖼️ Imágenes que no aparecen</h3>
              <p class="text-gray-300 text-sm">
                Los logos de las estaciones dependen de sus servidores. Si una radio no mantiene su imagen actualizada, 
                no podemos mostrarla. Usamos imágenes genéricas cuando esto pasa.
              </p>
            </div>
            
            <div class="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
              <h3 class="font-bold text-green-400 mb-2">🌍 Conexiones internacionales</h3>
              <p class="text-gray-300 text-sm">
                Las estaciones de otros países pueden tener conexiones lentas o bloqueos geográficos. 
                Si una no funciona, prueba con otra del mismo país o género.
              </p>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-gray-700/30 rounded-lg">
            <p class="text-gray-400 text-sm">
              <strong>💡 Tip:</strong> Si una estación no funciona, intenta votarla negativamente para ayudar a otros usuarios 
              y prueba con las siguientes recomendaciones.
            </p>
          </div>
        </section>

        <section class="grid md:grid-cols-2 gap-6">
          <div class="bg-[#181818] p-6 rounded-xl">
            <h3 class="text-xl font-bold mb-3 text-white">🎵 Más de 30,000 estaciones</h3>
            <p class="text-gray-400">Acceso a radio de más de 200 países. Música, noticias, deportes y cultura de todo el mundo.</p>
          </div>
          <div class="bg-[#181818] p-6 rounded-xl">
            <h3 class="text-xl font-bold mb-3 text-white">📱 Diseño para ti</h3>
            <p class="text-gray-400">Interfaz simple y rápida. Funciona en cualquier dispositivo, sin complicaciones.</p>
          </div>
          <div class="bg-[#181818] p-6 rounded-xl">
            <h3 class="text-xl font-bold mb-3 text-white">⚡ Gratuito y sin registro</h3>
            <p class="text-gray-400">Disfruta de toda la radio mundial sin crear cuentas ni pagar suscripciones.</p>
          </div>
          <div class="bg-[#181818] p-6 rounded-xl">
            <h3 class="text-xl font-bold mb-3 text-white">🔄 Siempre actualizado</h3>
            <p class="text-gray-400">Nuestra base de datos se actualiza constantemente con nuevas estaciones y mejoras.</p>
          </div>
        </section>

        <section class="bg-[#181818] p-8 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-green-500">Tus datos están seguros</h2>
          <p class="text-gray-300 leading-relaxed">
            Tus favoritos, historial y preferencias se guardan en tu dispositivo. No almacenamos información personal 
            en servidores externos y no te rastreamos. Tu privacidad es importante.
          </p>
          <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div class="bg-gray-700/30 p-3 rounded">
              <div class="text-2xl mb-1">❤️</div>
              <p class="text-xs text-gray-400">Favoritos locales</p>
            </div>
            <div class="bg-gray-700/30 p-3 rounded">
              <div class="text-2xl mb-1">📝</div>
              <p class="text-xs text-gray-400">Historial privado</p>
            </div>
            <div class="bg-gray-700/30 p-3 rounded">
              <div class="text-2xl mb-1">🎯</div>
              <p class="text-xs text-gray-400">Sin tracking</p>
            </div>
            <div class="bg-gray-700/30 p-3 rounded">
              <div class="text-2xl mb-1">🔒</div>
              <p class="text-xs text-gray-400">100% privado</p>
            </div>
          </div>
        </section>

        <section class="text-center pt-8 border-t border-gray-800">
          <p class="text-gray-500 mb-2">Hecho con ❤️ para los amantes de la radio</p>
          <p class="text-gray-400 text-sm mb-4">
            Utilizamos la base de datos de <a href="https://www.radio-browser.info/" target="_blank" class="text-green-500 hover:text-green-400 underline">Radio Browser</a> 
            para traerte las mejores estaciones del mundo.
          </p>
          <a href="https://mtzlabs.net/" target="_blank" class="text-green-500 hover:text-green-400 font-bold transition-colors">
            Desarrollado por MTZ Labs
          </a>
        </section>
      </div>
    </div>
  </div>
</template>
