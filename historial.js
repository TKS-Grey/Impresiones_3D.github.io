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
    getDoc,
    doc,
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


// =========================================================
// CONFIGURACIÓN DE FIREBASE
// =========================================================

const firebaseConfig = {

    apiKey: "AIzaSyC8hIsitvjMYaD9L1Gp_1FdVVrAV6jWP4A",

    authDomain: "impresiones-3d-aml.firebaseapp.com",

    projectId: "impresiones-3d-aml",

    storageBucket: "impresiones-3d-aml.firebasestorage.app",

    messagingSenderId: "61594822515",

    appId: "1:61594822515:web:1dc3e1b35ca02bce904706",

    measurementId: "G-E1L15BXDTG"
};


// =========================================================
// INICIALIZAR FIREBASE
// =========================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// =========================================================
// ADMINISTRADORES
// =========================================================

const ADMIN_EMAILS = [
    "tomas.lillo.luna@alumnos.sip.cl",
    "baltazar.gonzalez.ugarte@alumnos.sip.cl"
];


// =========================================================
// ELEMENTOS HTML
// =========================================================

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

const btnModoOscuro =
    document.getElementById("btnModoOscuro");


// =========================================================
// COMPROBAR ELEMENTOS IMPORTANTES
// =========================================================

if (!formEntrega) {
    console.error(
        "❌ No se encontró #formEntrega"
    );
}

if (!usuarioEntrega) {
    console.error(
        "❌ No se encontró #usuarioEntrega"
    );
}

if (!pedidoEntrega) {
    console.error(
        "❌ No se encontró #pedidoEntrega"
    );
}


// =========================================================
// OCULTAR PANEL ADMIN AL INICIO
// =========================================================

if (panelAdmin) {
    panelAdmin.style.display = "none";
}


// =========================================================
// AUTENTICACIÓN
// =========================================================

onAuthStateChanged(
    auth,
    async (user) => {

        // -----------------------------------------
        // NO HAY USUARIO
        // -----------------------------------------

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        // -----------------------------------------
        // MOSTRAR DATOS DEL USUARIO
        // -----------------------------------------

        if (usuarioNombre) {

            usuarioNombre.textContent =
                "👤 " +
                (
                    user.displayName ||
                    "Usuario"
                );
        }


        if (usuarioCorreo) {

            usuarioCorreo.textContent =
                "📧 " +
                (
                    user.email ||
                    ""
                );
        }


        // -----------------------------------------
        // COMPROBAR ADMIN
        // -----------------------------------------

        const emailUsuario =
            (
                user.email ||
                ""
            ).toLowerCase();

        const esAdmin =
            ADMIN_EMAILS.includes(
                emailUsuario
            );


        // -----------------------------------------
        // MOSTRAR PANEL ADMIN
        // -----------------------------------------

        if (esAdmin) {

            if (panelAdmin) {

                panelAdmin.style.display =
                    "block";
            }

            await cargarUsuarios();

        } else {

            if (panelAdmin) {

                panelAdmin.style.display =
                    "none";
            }
        }


        // -----------------------------------------
        // CARGAR ENTREGAS
        // -----------------------------------------

        await cargarEntregas(user);
    }
);


// =========================================================
// CARGAR USUARIOS
// =========================================================

async function cargarUsuarios() {

    if (!usuarioEntrega) {
        return;
    }


    // Limpiar selector

    usuarioEntrega.innerHTML = `
        <option value="">
            Selecciona un usuario
        </option>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "usuarios"
                )
            );


        // No hay usuarios

        if (snapshot.empty) {

            if (mensajeAdmin) {

                mensajeAdmin.textContent =
                    "⚠️ No hay usuarios registrados.";
            }

            return;
        }


        // Agregar usuarios al selector

        snapshot.forEach(
            (usuarioDoc) => {

                const data =
                    usuarioDoc.data();


                const option =
                    document.createElement(
                        "option"
                    );


                // ID del documento

                option.value =
                    usuarioDoc.id;


                // Nombre visible

                option.textContent =
                    data.nombre ||
                    data.email ||
                    "Usuario";


                // Guardar email

                option.dataset.email =
                    data.email ||
                    "";


                usuarioEntrega.appendChild(
                    option
                );
            }
        );


    } catch (error) {

        console.error(
            "Error cargando usuarios:",
            error
        );


        if (mensajeAdmin) {

            mensajeAdmin.textContent =
                "❌ No se pudieron cargar los usuarios: " +
                error.message;
        }
    }
}


// =========================================================
// CUANDO SE SELECCIONA UN USUARIO
// =========================================================

if (usuarioEntrega) {

    usuarioEntrega.addEventListener(
        "change",
        async () => {

            const usuarioId =
                usuarioEntrega.value;


            // Limpiar pedidos

            if (pedidoEntrega) {

                pedidoEntrega.innerHTML = `
                    <option value="">
                        Selecciona un pedido
                    </option>
                `;
            }


            // Si no hay usuario seleccionado

            if (!usuarioId) {
                return;
            }


            try {

                if (mensajeAdmin) {

                    mensajeAdmin.textContent =
                        "⏳ Cargando pedidos...";
                }


                // Buscar pedidos del usuario

                const q =
                    query(
                        collection(
                            db,
                            "pedidos"
                        ),
                        where(
                            "usuarioId",
                            "==",
                            usuarioId
                        )
                    );


                const snapshot =
                    await getDocs(q);


                // No tiene pedidos

                if (snapshot.empty) {

                    if (mensajeAdmin) {

                        mensajeAdmin.textContent =
                            "⚠️ Este usuario no tiene pedidos.";
                    }

                    return;
                }


                // Agregar pedidos

                snapshot.forEach(
                    (pedidoDoc) => {

                        const data =
                            pedidoDoc.data();


                        const option =
                            document.createElement(
                                "option"
                            );


                        // ID real del pedido

                        option.value =
                            pedidoDoc.id;


                        // Nombre visible

                        option.textContent =
                            data.figura ||
                            data.archivoNombre ||
                            "Pedido";


                        // Guardar figura

                        option.dataset.pedido =
                            data.figura ||
                            "Pedido";


                        pedidoEntrega.appendChild(
                            option
                        );
                    }
                );


                if (mensajeAdmin) {

                    mensajeAdmin.textContent =
                        "";
                }


            } catch (error) {

                console.error(
                    "Error cargando pedidos:",
                    error
                );


                if (mensajeAdmin) {

                    mensajeAdmin.textContent =
                        "❌ No se pudieron cargar los pedidos: " +
                        error.message;
                }
            }
        }
    );
}


// =========================================================
// CARGAR HISTORIAL DE ENTREGAS
// =========================================================

async function cargarEntregas(user) {

    if (!entregas) {
        return;
    }


    entregas.innerHTML = "";


    if (mensajeHistorial) {

        mensajeHistorial.textContent =
            "⏳ Cargando entregas...";
    }


    try {

        // Buscar entregas del usuario actual

        const q =
            query(
                collection(
                    db,
                    "entregas"
                ),
                where(
                    "usuarioId",
                    "==",
                    user.uid
                )
            );


        const snapshot =
            await getDocs(q);


        // No existen entregas

        if (snapshot.empty) {

            if (mensajeHistorial) {

                mensajeHistorial.textContent =
                    "No tienes entregas registradas.";
            }

            return;
        }


        if (mensajeHistorial) {

            mensajeHistorial.textContent =
                "";
        }


        // Crear lista

        const lista = [];


        snapshot.forEach(
            (entregaDoc) => {

                lista.push({

                    id: entregaDoc.id,

                    ...entregaDoc.data()
                });
            }
        );


        // Ordenar de más reciente a más antigua

        lista.sort(
            (a, b) => {

                const fechaA =
                    new Date(
                        `${a.fecha || "1970-01-01"}T${a.hora || "00:00"}`
                    );

                const fechaB =
                    new Date(
                        `${b.fecha || "1970-01-01"}T${b.hora || "00:00"}`
                    );


                return fechaB - fechaA;
            }
        );


        // Mostrar entregas

        lista.forEach(
            (entrega) => {

                mostrarEntrega(
                    entrega
                );
            }
        );


    } catch (error) {

        console.error(
            "Error cargando entregas:",
            error
        );


        if (mensajeHistorial) {

            mensajeHistorial.textContent =
                "❌ Ocurrió un error al cargar las entregas: " +
                error.message;
        }
    }
}


// =========================================================
// MOSTRAR UNA ENTREGA
// =========================================================

function mostrarEntrega(entrega) {
    if (!entregas) {
        return;
    }

    const tarjeta = document.createElement("article");
    tarjeta.className = "entrega";

    tarjeta.innerHTML = `
        <img
            class="foto-entrega"
            src="${escapeHTML(entrega.fotoURL || "https://via.placeholder.com/150")}"
            alt="Foto de entrega"
        >
        <div class="info-entrega">
            <h3>📦 ${escapeHTML(entrega.figura || "Pedido")}</h3>
            <p><strong>📅 Fecha:</strong> ${escapeHTML(entrega.fecha || "No especificada")}</p>
            <p><strong>⏰ Hora:</strong> ${escapeHTML(entrega.hora || "No especificada")}</p>
        </div>
    `;

    entregas.appendChild(tarjeta);
}

// =========================================================
// REGISTRAR NUEVA ENTREGA (FORMULARIO ADMIN)
// =========================================================
if (formEntrega) {
    formEntrega.addEventListener("submit", async (e) => {
        e.preventDefault();

        const usuarioOption = usuarioEntrega.options[usuarioEntrega.selectedIndex];
        const pedidoOption = pedidoEntrega.options[pedidoEntrega.selectedIndex];

        const usuarioId = usuarioEntrega.value;
        const pedidoId = pedidoEntrega.value;
        const figura = pedidoOption ? pedidoOption.dataset.pedido : "Pedido";
        const fecha = fechaEntrega ? fechaEntrega.value : "";
        const hora = horaEntrega ? horaEntrega.value : "";
        const archivoFoto = fotoEntrega && fotoEntrega.files[0] ? fotoEntrega.files[0] : null;

        if (!usuarioId || !pedidoId) {
            if (mensajeAdmin) mensajeAdmin.textContent = "⚠️ Debes seleccionar un usuario y un pedido.";
            return;
        }

        if (!archivoFoto) {
            if (mensajeAdmin) mensajeAdmin.textContent = "⚠️ Debes subir una fotografía de la entrega.";
            return;
        }

        try {
            if (btnAgregar) btnAgregar.disabled = true;
            if (mensajeAdmin) mensajeAdmin.textContent = "⏳ Subiendo imagen y guardando entrega...";

            // 1. Subir imagen a Firebase Storage
            const rutaStorage = `entregas/${Date.now()}_${archivoFoto.name}`;
            const storageRef = ref(storage, rutaStorage);
            
            await uploadBytes(storageRef, archivoFoto);
            const fotoURL = await getDownloadURL(storageRef);

            // 2. Guardar entrega en Firestore
            await addDoc(collection(db, "entregas"), {
                usuarioId: usuarioId,
                pedidoId: pedidoId,
                figura: figura,
                fotoURL: fotoURL,
                fecha: fecha,
                hora: hora,
                creadoEn: serverTimestamp()
            });

            if (mensajeAdmin) {
                mensajeAdmin.textContent = "✅ ¡Entrega registrada con éxito!";
            }

            formEntrega.reset();

            // Recargar el historial si la entrega fue enviada al usuario actualmente logueado
            if (auth.currentUser) {
                await cargarEntregas(auth.currentUser);
            }

        } catch (error) {
            console.error("Error al registrar la entrega:", error);
            if (mensajeAdmin) {
                mensajeAdmin.textContent = "❌ Error al registrar: " + error.message;
            }
        } finally {
            if (btnAgregar) btnAgregar.disabled = false;
        }
    });
}

// =========================================================
// FUNCIONES DE UTILIDAD
// =========================================================
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
