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
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";


const firebaseConfig = {
    apiKey:"AIzaSyC8hIsitvjMYaD9L1Gp_1FdVVrAV6jWP4A",
    authDomain:"impresiones-3d-aml.firebaseapp.com",
    projectId:"impresiones-3d-aml",
    storageBucket:"impresiones-3d-aml.firebasestorage.app",
    messagingSenderId:"61594822515",
    appId:"1:61594822515:web:1dc3e1b35ca02bce904706",
    measurementId:"G-E1L15BXDTG"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


const ADMIN_EMAILS = [
    "tomas.lillo.luna@alumnos.sip.cl",
    "baltazar.gonzalez.ugarte@alumnos.sip.cl"
];


const panelAdmin =
    document.getElementById("panelAdmin");

const usuarioNombre =
    document.getElementById("usuarioNombre");

const usuarioCorreo =
    document.getElementById("usuarioCorreo");

const entregas =
    document.getElementById("entregas");

const mensajeHistorial =
    document.getElementById("mensajeHistorial");

const formEntrega =
    document.getElementById("formEntrega");

const usuarioEntrega =
    document.getElementById("usuarioEntrega");

const pedidoEntrega =
    document.getElementById("pedidoEntrega");

const fotoEntrega =
    document.getElementById("fotoEntrega");

const fechaEntrega =
    document.getElementById("fechaEntrega");

const horaEntrega =
    document.getElementById("horaEntrega");

const mensajeAdmin =
    document.getElementById("mensajeAdmin");

const btnAgregar =
    document.querySelector(".btn-agregar");


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

        const snapshot =
            await getDocs(
                collection(db, "usuarios")
            );


        snapshot.forEach((doc) => {

            const data = doc.data();

            const option =
                document.createElement("option");


            option.value = doc.id;


            option.textContent =
                data.nombre ||
                data.email ||
                "Usuario";


            option.dataset.email =
                data.email || "";


            usuarioEntrega.appendChild(option);

        });


    } catch(error) {

        console.error(error);

        mensajeAdmin.textContent =
            "❌ No se pudieron cargar los usuarios.";

    }

}


usuarioEntrega.addEventListener(
    "change",
    async () => {

        const usuarioId =
            usuarioEntrega.value;


        pedidoEntrega.innerHTML = `
            <option value="">
                Selecciona un pedido
            </option>
        `;


        if (!usuarioId) return;


        try {

            const q = query(
                collection(db, "pedidos"),
                where("usuarioId", "==", usuarioId)
            );


            const snapshot =
                await getDocs(q);


            snapshot.forEach((doc) => {

                const data = doc.data();


                const option =
                    document.createElement("option");


                option.value = doc.id;


                option.textContent =
                    data.figura ||
                    "Pedido";


                option.dataset.pedido =
                    data.figura || "";


                pedidoEntrega.appendChild(option);

            });


        } catch(error) {

            console.error(error);

            mensajeAdmin.textContent =
                "❌ No se pudieron cargar los pedidos.";

        }

    }
);


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
                id:doc.id,
                ...doc.data()
            });

        });


        lista.sort((a,b) => {

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


    } catch(error) {

        console.error(error);

        mensajeHistorial.textContent =
            "❌ Ocurrió un error al cargar las entregas.";

    }

}


function mostrarEntrega(entrega){

    const tarjeta =
        document.createElement("article");


    tarjeta.className =
        "entrega";


    tarjeta.innerHTML = `

        <img
            class="foto-entrega"
            src="${entrega.fotoURL}"
            alt="Foto de entrega"
        >

        <div class="info-entrega">

            <h3>
                📦 ${escapeHTML(entrega.figura || entrega.pedido || "Pedido")}
            </h3>

            <p>
                📏 <strong>Medida:</strong>
                ${escapeHTML(entrega.medida || "No especificada")}
            </p>

            <p>
                📅 <strong>Fecha:</strong>
                ${escapeHTML(entrega.fecha)}
            </p>

            <p>
                🕐 <strong>Hora:</strong>
                ${escapeHTML(entrega.hora)}
            </p>

            ${
                entrega.archivoURL
                ?
                `
                <a
                    class="archivo-modelo"
                    href="${entrega.archivoURL}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    📎 Ver modelo
                </a>
                `
                :
                ""
            }

            <br>

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
                "❌ No hay una sesión iniciada.";

            return;

        }


        if (
            !ADMIN_EMAILS.includes(
                admin.email.toLowerCase()
            )
        ) {

            mensajeAdmin.textContent =
                "❌ No tienes permisos de administrador.";

            return;

        }


        const usuarioId =
            usuarioEntrega.value;


        const pedidoId =
            pedidoEntrega.value;


        const usuarioSeleccionado =
            usuarioEntrega.options[
                usuarioEntrega.selectedIndex
            ];


        const pedidoSeleccionado =
            pedidoEntrega.options[
                pedidoEntrega.selectedIndex
            ];


        const usuarioEmail =
            usuarioSeleccionado.dataset.email;


        const figura =
            pedidoSeleccionado.dataset.pedido;


        const archivo =
            fotoEntrega.files[0];


        if (!usuarioId || !pedidoId) {

            mensajeAdmin.textContent =
                "❌ Selecciona un usuario y un pedido.";

            return;

        }


        if (!archivo) {

            mensajeAdmin.textContent =
                "❌ Selecciona una foto.";

            return;

        }


        if (!archivo.type.startsWith("image/")) {

            mensajeAdmin.textContent =
                "❌ El archivo debe ser una imagen.";

            return;

        }


        if (archivo.size > 10 * 1024 * 1024) {

            mensajeAdmin.textContent =
                "❌ La imagen no puede superar los 10 MB.";

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


            const pedidoSnapshot =
                await getDocs(
                    query(
                        collection(db, "pedidos"),
                        where(
                            "__name__",
                            "==",
                            pedidoId
                        )
                    )
                );


            let medida = "";


            pedidoSnapshot.forEach((doc) => {

                medida =
                    doc.data().medida || "";

            });


            await addDoc(
                collection(db, "entregas"),
                {

                    usuarioId:
                        usuarioId,

                    usuarioEmail:
                        usuarioEmail,

                    pedidoId:
                        pedidoId,

                    figura:
                        figura,

                    medida:
                        medida,

                    fotoURL:
                        fotoURL,

                    fotoPath:
                        ruta,

                    fecha:
                        fechaEntrega.value,

                    hora:
                        horaEntrega.value,

                    creadoPor:
                        admin.email,

                    creadoEn:
                        serverTimestamp()

                }
            );


            mensajeAdmin.textContent =
                "✅ Entrega agregada correctamente.";


            formEntrega.reset();

            pedidoEntrega.innerHTML = `
                <option value="">
                    Selecciona un pedido
                </option>
            `;


        } catch(error) {

            console.error(error);

            mensajeAdmin.textContent =
                "❌ Error al agregar la entrega.";

        } finally {

            btnAgregar.disabled = false;

        }

    }
);


const btnModoOscuro =
    document.getElementById("btnModoOscuro");


if(btnModoOscuro){

    btnModoOscuro.addEventListener(
        "click",
        () => {

            const actual =
                document.body.classList.toggle(
                    "tema-claro"
                );


            btnModoOscuro.textContent =
                actual
                ?
                "Modo Oscuro"
                :
                "Modo Claro";

        }
    );

}


function escapeHTML(text){

    if(!text) return "";

    return String(text)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}
