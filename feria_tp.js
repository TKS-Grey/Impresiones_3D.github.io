const boton = document.getElementById('scrollBtn');
const destino = document.getElementById('destino');

boton.addEventListener('click', () => {
  destino.scrollIntoView({ 
    behavior: 'smooth'
  });
});
