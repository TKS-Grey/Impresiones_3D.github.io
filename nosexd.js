document.addEventListener('DOMContentLoaded', () => {
        const btnModoOscuro = document.getElementById('btnModoOscuro');
        let linkModoOscuro = document.getElementById('css-modo-oscuro');

        // Verificar si el usuario ya tenía el modo oscuro guardado previamente
        if (localStorage.getItem('tema') === 'oscuro') {
            activarModoOscuro();
        }

        btnModoOscuro.addEventListener('click', () => {
            linkModoOscuro = document.getElementById('css-modo-oscuro');
            
            if (linkModoOscuro) {
                // Si la hoja de estilo existe, la eliminamos (vuelve al modo claro)
                linkModoOscuro.remove();
                btnModoOscuro.textContent = 'Modo Oscuro';
                localStorage.setItem('tema', 'claro');
            } else {
                // Si no existe, la creamos para activar los colores oscuros pastel
                activarModoOscuro();
            }
        });

        function activarModoOscuro() {
            const link = document.createElement('link');
            link.id = 'css-modo-oscuro';
            link.rel = 'stylesheet';
            link.href = 'modo_oscuro.css';
            document.head.appendChild(link);
            
            if (btnModoOscuro) {
                btnModoOscuro.textContent = 'Modo Claro';
            }
            localStorage.setItem('tema', 'oscuro');
        }
    });
