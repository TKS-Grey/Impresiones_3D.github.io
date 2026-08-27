import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


const firebaseConfig = {

    apiKey: "TU_API_KEY",

    authDomain: "TU_PROYECTO.firebaseapp.com",

    projectId: "TU_PROJECT_ID",

    storageBucket: "TU_PROYECTO.firebasestorage.app",

    messagingSenderId: "TU_MESSAGING_SENDER_ID",

    appId: "TU_APP_ID"

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


/*
    CORREOS QUE PUEDEN ADMINISTRAR ENTREGAS
*/

const ADMIN_EMAILS = [
    "TU_CORREO_DE_ADMIN@ejemplo.com"
];


const panelAdmin = document.getElementById("panelAdmin");

const usuarioNombre = document.getElementById("usuarioNombre");

const usuarioCorreo = document.getElementById("usuarioCorreo");

const entregas = document.getElementById("entregas");

const mensajeHistorial = document.getElementById("mensajeHistorial");

const formEntrega = document.getElementById("formEntrega");

const usuarioEntrega = document.getElementById("usuarioEntrega");

const pedido = document.getElementById("pedido");

const fotoEntrega = document.getElementById("fotoEntrega");

const fechaEntrega = document.getElementById("fechaEntrega");

const horaEntrega = document.getElementById("horaEntrega");

const mensajeAdmin = document.getElementById("mensajeAdmin");

const btnAgregar = document.querySelector(".btn-agregar");


panelAdmin.style.display = "none";


onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";

        return;
    }


    usuarioNombre.textContent =
        "👤 " + (user.displayName || "Usuario");


    usuarioCorreo.textContent =
        "📧 " + user.email;


    const esAdmin =
        ADMIN_EMAILS.includes(
            user.email.toLowerCase()
        );


    if (esAdmin) {

        panelAdmin.style.display = "block";

        await cargarUsuarios();

    }


    await cargarEntregas(user);

});


async function cargarUsuarios(){

    usuarioEntrega.innerHTML = `
        <option value="">
            Selecciona un usuario
        </option>
    `;


    try {

        const usuariosSnapshot =
            await getDocs(
                collection(db, "usuarios")
            );


        usuariosSnapshot.forEach((doc) => {

            const data = doc.data();


            const option =
                document.createElement("option");


            option.value = doc.id;


            option.textContent =
                data.nombre ||
                data.email ||
                doc.id;


            option.dataset.email =
                data.email || "";


            usuarioEntrega.appendChild(option);

        });


    } catch (error) {

        console.error(error);

        mensajeAdmin.textContent =
            "No se pudieron cargar los usuarios.";

    }

}


async function cargarEntregas(user){

    entregas.innerHTML = "";

    mensajeHistorial.textContent =
        "Cargando entregas...";


    try {

        const q = query(
            collection(db, "entregas"),
            where("usuarioId", "==", user.uid)
        );


        const snapshot =
            await getDocs(q);


        if (snapshot.empty) {

            mensajeHistorial.textContent =
                "No tienes entregas registradas.";

            return;

        }


        mensajeHistorial.textContent = "";


        const lista = [];


        snapshot.forEach((doc) => {

            lista.push({
                id: doc.id,
                ...doc.data()
            });

        });


        lista.sort((a, b) => {

            const fechaA =
                new Date(
                    `${a.fecha}T${a.hora}`
                );

            const fechaB =
                new Date(
                    `${b.fecha}T${b.hora}`
                );

            return fechaB - fechaA;

        });


        lista.forEach((entrega) => {

            mostrarEntrega(entrega);

        });


    } catch (error) {

        console.error(error);

        mensajeHistorial.textContent =
            "Ocurrió un error al cargar las entregas.";

    }

}


function mostrarEntrega(entrega){

    const tarjeta =
        document.createElement("article");


    tarjeta.className = "entrega";


    tarjeta.innerHTML = `

        <img
            class="foto-entrega"
            src="${entrega.fotoURL}"
            alt="Foto de entrega"
        >

        <div class="info-entrega">

            <h3>
                📦 ${escapeHTML(entrega.pedido)}
            </h3>

            <p>
                📅 <strong>Fecha:</strong>
                ${escapeHTML(entrega.fecha)}
            </p>

            <p>
                🕐 <strong>Hora:</strong>
                ${escapeHTML(entrega.hora)}
            </p>

            <span class="estado">
                Entregado
            </span>

        </div>

    `;


    entregas.appendChild(tarjeta);

}


formEntrega.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const admin =
            auth.currentUser;


        if (!admin) {

            mensajeAdmin.textContent =
                "No hay una sesión iniciada.";

            return;

        }


        if (
            !ADMIN_EMAILS.includes(
                admin.email.toLowerCase()
            )
        ) {

            mensajeAdmin.textContent =
                "No tienes permisos de administrador.";

            return;

        }


        const usuarioSeleccionado =
            usuarioEntrega.options[
                usuarioEntrega.selectedIndex
            ];


        const usuarioId =
            usuarioEntrega.value;


        const usuarioEmail =
            usuarioSeleccionado.dataset.email;


        const archivo =
            fotoEntrega.files[0];


        if (!archivo) {

            mensajeAdmin.textContent =
                "Selecciona una foto.";

            return;

        }


        if (!archivo.type.startsWith("image/")) {

            mensajeAdmin.textContent =
                "El archivo debe ser una imagen.";

            return;

        }


        if (archivo.size > 10 * 1024 * 1024) {

            mensajeAdmin.textContent =
                "La imagen no puede superar los 10 MB.";

            return;

        }


        try {

            btnAgregar.disabled = true;

            mensajeAdmin.textContent =
                "Subiendo entrega...";


            const nombreArchivo =
                Date.now() +
                "_" +
                archivo.name;


            const ruta =
                `entregas/${usuarioId}/${nombreArchivo}`;


            const imagenRef =
                ref(storage, ruta);


            await uploadBytes(
                imagenRef,
                archivo
            );


            const fotoURL =
                await getDownloadURL(
                    imagenRef
                );


            await addDoc(
                collection(db, "entregas"),
                {

                    usuarioId: usuarioId,

                    usuarioEmail: usuarioEmail,

                    pedido: pedido.value,

                    fotoURL: fotoURL,

                    fotoPath: ruta,

                    fecha: fechaEntrega.value,

                    hora: horaEntrega.value,

                    creadoPor: admin.email,

                    creadoEn: serverTimestamp()

                }
            );


            mensajeAdmin.textContent =
                "✅ Entrega agregada correctamente.";


            formEntrega.reset();


        } catch (error) {

            console.error(error);

            mensajeAdmin.textContent =
                "❌ Error al agregar la entrega.";

        } finally {

            btnAgregar.disabled = false;

        }

    }
);


function escapeHTML(text){

    if (!text) return "";

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
