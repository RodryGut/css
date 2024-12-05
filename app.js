document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('direccionForm');
    const resultadoDiv = document.getElementById('resultado');

    function hablar(mensaje) {
        const message = new SpeechSynthesisUtterance(mensaje);
        message.lang = 'es-ES'; // Establece el idioma en español
        speechSynthesis.speak(message);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const direccionInput = document.getElementById('direccionInput');
        const direccion = direccionInput.value.trim();

        if (!direccion) {
            mostrarMensajeError('Por favor, ingrese una dirección válida.');
            return;
        }

        try {
            const response = await axios.get('https://servicios.usig.buenosaires.gob.ar/normalizar/', {
                params: {
                    direccion: direccion,
                    maxOptions: 10,
                    geocodificar: false,
                    srid: 4326
                }
            });

            console.log(response.data);

            let html = '<h3>Resultados de normalización:</h3>';

            if (Array.isArray(response.data.direccionesNormalizadas)) {
                response.data.direccionesNormalizadas.forEach(resultado => {
                    html += `<p>${resultado.direccion}</p>`;
                });
            } else if (response.data && typeof response.data === 'object') {
                Object.entries(response.data).forEach(([key, value]) => {
                    html += `<p><strong>${key}</strong>: ${value}</p>`;
                });
            } else {
                console.error('No se encontraron resultados');
                mostrarMensajeError('No se obtuvieron resultados de normalización.');
            }

            resultadoDiv.innerHTML = html;

            // Extraer el texto relevante y formatearlo para la habla
            const textoParaHablar = html.replace(/<[^>]*>/g, '').trim();
            const palabras = textoParaHablar.split(/[\s.,!?]+/);
            const palabrasFormateadas = palabras.map(palabra => {
                return palabra.replace(/\d{3}/g, match => `${match},`);
            }).join(' ');

            // Hablar los resultados formateados
            hablar(palabrasFormateadas);
        } catch (error) {
            console.error('Error:', error);
            mostrarMensajeError('Ha ocurrido un error al procesar la solicitud.');
        }
    });

    function mostrarMensajeError(mensaje) {
        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.innerHTML = `<p class="text-danger">${mensaje}</p>`;
    }
});