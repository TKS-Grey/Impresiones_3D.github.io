console.log("🔥 HISTORIAL.JS CARGADO CORRECTAMENTE");

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyC8hIsitvjMYaD9L1Gp_1FdVVrAV6jWP4A",
    authDomain: "impresiones-3d-aml.firebaseapp.com",
    projectId: "impresiones-3d-aml",
    storageBucket: "impresiones-3d-aml.firebasestorage.app",
    messagingSenderId: "61594822515",
    appId: "1:61594822515:web:1dc3e1b35ca02bce904706",
    measurementId: "G-E1L15BXDTG"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const usuarioNombre = document.getElementById("usuarioNombre");
const usuarioCorreo = document.getElementById("usuarioCorreo");
const mensajeHistorial = document.getElementById("mensajeHistorial");
const entregas = document.getElementById("entregas");


onAuthStateChanged(auth, async user => {

    console.log("🔥 Firebase Auth respondió");
    console.log("Usuario:", user);
    console.log("UID:", user?.uid);
    console.log("Email:", user?.email);
    console.log("Nombre:", user?.displayName);

    if (!user) {
        usuarioNombre.textContent = "❌ NO hay sesión iniciada";
        usuarioCorreo.textContent = "";
        mensajeHistorial.textContent = "Debes iniciar sesión para ver tu historial.";
        return;
    }

    usuarioNombre.textContent = "✅ Sesión iniciada";
    usuarioCorreo.textContent = "📧 " + user.email;

    cargarEntregas(user.uid);
});

async function cargarEntregas(uid) {

    try {

        const entregasRef = collection(
            db,
            "entregas"
        );


        const consulta = query(
            entregasRef,
            where(
                "uid",
                "==",
                uid
            ),
            orderBy(
                "fecha",
                "desc"
            )
        );


        const resultado = await getDocs(
            consulta
        );

        entregas.innerHTML = "";

        if (resultado.empty) {
            mensajeHistorial.textContent = "Todavía no tienes entregas registradas.";
            return;
        }


        mensajeHistorial.textContent = "Estas son las figuras que has recibido:";

        resultado.forEach(documento => {

            const datos = documento.data();
            const tarjeta = document.createElement(
                "article"
            );
            tarjeta.className = "entrega";


            const imagen = document.createElement(
                "img"
            );
            imagen.src = datos.foto;
            imagen.alt = datos.nombre || "Figura entregada";
            imagen.className = "foto-entrega";


            const contenido = document.createElement(
                "div"
            );

            contenido.className = "info-entrega";

            const titulo = document.createElement(
                "h3"
            );
            titulo.textContent = datos.nombre || "Figura 3D";

            const fecha = document.createElement(
                "p"
            );
            fecha.textContent = "📅 " + (
                datos.fechaTexto || "Fecha no disponible"
            );


            const descripcion = document.createElement(
                "p"
            );
            descripcion.textContent = datos.descripcion || "Sin descripción";

            contenido.appendChild(
                titulo
            );
            contenido.appendChild(
                fecha
            );
            contenido.appendChild(
                descripcion
            );
            tarjeta.appendChild(
                imagen
            );
            tarjeta.appendChild(
                contenido
            );
            entregas.appendChild(
                tarjeta
            );
        });

    } catch (error) {
        console.error(
            "Error obteniendo historial:",
            error
        );
        mensajeHistorial.textContent = "❌ No se pudo cargar el historial.";
    }
}
