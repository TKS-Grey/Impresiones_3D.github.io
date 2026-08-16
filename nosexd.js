document.addEventListener('DOMContentLoaded', () => {
    const btnModoOscuro = document.getElementById('btnModoOscuro');
    let linkModoOscuro = document.getElementById('css-modo-oscuro');

    // Ajustar el texto del botón según si está activo o no el modo oscuro
    if (localStorage.getItem('tema') === 'oscuro') {
        if (btnModoOscuro) btnModoOscuro.textContent = 'Modo Claro';
    } else {
        if (btnModoOscuro) btnModoOscuro.textContent = 'Modo Oscuro';
    }

    if (btnModoOscuro) {
        btnModoOscuro.addEventListener('click', () => {
            linkModoOscuro = document.getElementById('css-modo-oscuro');

            if (linkModoOscuro) {
                // Desactivar Modo Oscuro
                linkModoOscuro.remove();
                btnModoOscuro.textContent = 'Modo Oscuro';
                localStorage.setItem('tema', 'claro');
            } else {
                // Activar Modo Oscuro
                activarModoOscuro();
            }
        });
    }

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

    if (localStorage.getItem('tema') === 'oscuro') {
    if (!document.getElementById('css-modo-oscuro')) {
        const link = document.createElement('link');
        link.id = 'css-modo-oscuro';
        link.rel = 'stylesheet';
        link.href = 'modo_oscuro.css';
        document.head.appendChild(link);
    }
}
