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
    serverTimestamp,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";

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
const storage = getStorage(app);

const ADMIN_EMAILS = [
    "tomas.lillo.luna@alumnos.sip.cl",
    "baltazar.gonzalez.ugarte@alumnos.sip.cl"
];

const panelAdmin = document.getElementById("panelAdmin");
const usuarioNombre = document.getElementById("usuarioNombre");
const usuarioCorreo = document.getElementById("usuarioCorreo");
const entregas = document.getElementById("entregas");
const mensajeHistorial = document.getElementById("mensajeHistorial");
const formEntrega = document.getElementById("formEntrega");
const usuarioEntrega = document.getElementById("usuarioEntrega");
const pedidoEntrega = document.getElementById("pedidoEntrega");
const fotoEntrega = document.getElementById("fotoEntrega");
const fechaEntrega = document.getElementById("fechaEntrega");
const horaEntrega = document.getElementById("horaEntrega");
const mensajeAdmin = document.getElementById("mensajeAdmin");
const btnAgregar = document.querySelector(".btn-agregar");
const btnModoOscuro = document.getElementById("btnModoOscuro");
const solicitudesAdmin = document.getElementById("solicitudesAdmin");
const listaSolicitudes = document.getElementById("listaSolicitudes");

if (panelAdmin) {
    panelAdmin.style.display = "none";
}

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    if (usuarioNombre) {
        usuarioNombre.textContent =
            "👤 " + (user.displayName || "Usuario");
    }

    if (usuarioCorreo) {
        usuarioCorreo.textContent =
            "📧 " + (user.email || "");
    }

    const emailUsuario =
        (user.email || "").toLowerCase();

    const esAdmin =
        ADMIN_EMAILS.includes(emailUsuario);

    if (esAdmin) {

        if (panelAdmin) {
            panelAdmin.style.display = "block";
        }

        await cargarUsuarios();

    } else {

        if (panelAdmin) {
            panelAdmin.style.display = "none";
        }
    }

    await cargarEntregas(user);
});

async function cargarUsuarios() {

    if (!usuarioEntrega) {
        return;
    }

    usuarioEntrega.innerHTML = `
        <option value="">
            Selecciona un usuario
        </option>
    `;

    try {

        const snapshot = await getDocs(
            collection(db, "usuarios")
        );

        if (snapshot.empty) {

            if (mensajeAdmin) {
                mensajeAdmin.textContent =
                    "⚠️ No hay usuarios registrados.";
            }

            return;
        }

        snapshot.forEach((usuarioDoc) => {

            const data = usuarioDoc.data();

            const option =
                document.createElement("option");

            option.value = usuarioDoc.id;

            option.textContent =
                data.nombre ||
                data.email ||
                "Usuario";

            option.dataset.email =
                data.email || "";

            usuarioEntrega.appendChild(option);
        });

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

if (usuarioEntrega) {

    usuarioEntrega.addEventListener(
        "change",
        async () => {

            const usuarioId =
                usuarioEntrega.value;

            if (pedidoEntrega) {

                pedidoEntrega.innerHTML = `
                    <option value="">
                        Selecciona un pedido
                    </option>
                `;
            }

            if (listaSolicitudes) {
                listaSolicitudes.innerHTML = "";
            }

            if (!usuarioId) {
                return;
            }

            try {

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "⏳ Cargando solicitudes...";
                }

                const q = query(
                    collection(db, "pedidos"),
                    where(
                        "usuarioId",
                        "==",
                        usuarioId
                    )
                );

                const snapshot =
                    await getDocs(q);

                if (snapshot.empty) {

                    if (mensajeAdmin) {
                        mensajeAdmin.textContent =
                            "⚠️ Este usuario no tiene solicitudes.";
                    }

                    if (listaSolicitudes) {

                        listaSolicitudes.innerHTML = `
                            <p>
                                ⚠️ Este usuario todavía no ha realizado solicitudes.
                            </p>
                        `;
                    }

                    return;
                }

                snapshot.forEach((pedidoDoc) => {

                    const data =
                        pedidoDoc.data();

                    const option =
                        document.createElement("option");

                    option.value =
                        pedidoDoc.id;

                    option.textContent =
                        data.figura ||
                        data.archivoNombre ||
                        "Pedido";

                    option.dataset.pedido =
                        data.figura ||
                        "Pedido";

                    option.dataset.archivo =
                        data.archivoNombre ||
                        "";

                    option.dataset.estado =
                        data.estado ||
                        "Pendiente";

                    if (pedidoEntrega) {
                        pedidoEntrega.appendChild(option);
                    }

                    if (listaSolicitudes) {

                        const solicitud =
                            document.createElement("div");

                        solicitud.className =
                            "solicitud-admin";

                        solicitud.innerHTML = `
                            <h4>
                                📦 ${escapeHTML(
                                    data.figura ||
                                    "Solicitud"
                                )}
                            </h4>

                            <p>
                                <strong>📏 Medida:</strong>
                                ${escapeHTML(
                                    data.medida ||
                                    "No especificada"
                                )}
                            </p>

                            <p>
                                <strong>📄 Archivo:</strong>
                                ${escapeHTML(
                                    data.archivoNombre ||
                                    "Sin archivo"
                                )}
                            </p>

                            <p>
                                <strong>📌 Estado:</strong>
                                ${escapeHTML(
                                    data.estado ||
                                    "Pendiente"
                                )}
                            </p>

                            <p>
                                <strong>📅 Solicitud:</strong>
                                ${formatearFecha(
                                    data.creadoEn
                                )}
                            </p>
                        `;

                        listaSolicitudes.appendChild(
                            solicitud
                        );
                    }
                });

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "✅ Solicitudes cargadas correctamente.";
                }

            } catch (error) {

                console.error(
                    "Error cargando solicitudes:",
                    error
                );

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "❌ No se pudieron cargar las solicitudes: " +
                        error.message;
                }
            }
        }
    );
}

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

        const q = query(
            collection(db, "entregas"),
            where(
                "usuarioId",
                "==",
                user.uid
            )
        );

        const snapshot =
            await getDocs(q);

        if (snapshot.empty) {

            if (mensajeHistorial) {
                mensajeHistorial.textContent =
                    "No tienes entregas registradas.";
            }

            return;
        }

        if (mensajeHistorial) {
            mensajeHistorial.textContent = "";
        }

        const lista = [];

        snapshot.forEach((entregaDoc) => {

            lista.push({
                id: entregaDoc.id,
                ...entregaDoc.data()
            });
        });

        lista.sort((a, b) => {

            const fechaA = new Date(
                `${a.fecha || "1970-01-01"}T${a.hora || "00:00"}`
            );

            const fechaB = new Date(
                `${b.fecha || "1970-01-01"}T${b.hora || "00:00"}`
            );

            return fechaB - fechaA;
        });

        lista.forEach((entrega) => {
            mostrarEntrega(entrega);
        });

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

function mostrarEntrega(entrega) {

    if (!entregas) {
        return;
    }

    const tarjeta =
        document.createElement("article");

    tarjeta.className = "entrega";

    tarjeta.innerHTML = `
        <img
            class="foto-entrega"
            src="${escapeHTML(
                entrega.fotoURL ||
                "https://via.placeholder.com/150"
            )}"
            alt="Foto de entrega"
        >

        <div class="info-entrega">

            <h3>
                📦 ${escapeHTML(
                    entrega.figura ||
                    "Pedido"
                )}
            </h3>

            <p>
                <strong>📅 Fecha:</strong>
                ${escapeHTML(
                    entrega.fecha ||
                    "No especificada"
                )}
            </p>

            <p>
                <strong>⏰ Hora:</strong>
                ${escapeHTML(
                    entrega.hora ||
                    "No especificada"
                )}
            </p>

        </div>
    `;

    entregas.appendChild(tarjeta);
}

if (formEntrega) {

    formEntrega.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const usuarioId =
                usuarioEntrega.value;

            const pedidoId =
                pedidoEntrega.value;

            const pedidoOption =
                pedidoEntrega.options[
                    pedidoEntrega.selectedIndex
                ];

            const figura =
                pedidoOption
                    ? pedidoOption.dataset.pedido
                    : "Pedido";

            const fecha =
                fechaEntrega.value;

            const hora =
                horaEntrega.value;

            const archivoFoto =
                fotoEntrega.files[0];

            if (!usuarioId) {

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "⚠️ Debes seleccionar un usuario.";
                }

                return;
            }

            if (!pedidoId) {

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "⚠️ Debes seleccionar una solicitud.";
                }

                return;
            }

            if (!archivoFoto) {

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "⚠️ Debes subir una fotografía de la entrega.";
                }

                return;
            }

            if (!fecha) {

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "⚠️ Debes seleccionar una fecha.";
                }

                return;
            }

            if (!hora) {

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "⚠️ Debes seleccionar una hora.";
                }

                return;
            }

            try {

                if (btnAgregar) {
                    btnAgregar.disabled = true;
                    btnAgregar.textContent =
                        "Guardando...";
                }

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "⏳ Subiendo foto...";
                }

                const nombreArchivo =
                    `${Date.now()}_${archivoFoto.name}`;

                const rutaStorage =
                    `entregas/${usuarioId}/${nombreArchivo}`;

                const storageRef =
                    ref(
                        storage,
                        rutaStorage
                    );

                await uploadBytes(
                    storageRef,
                    archivoFoto
                );

                const fotoURL =
                    await getDownloadURL(
                        storageRef
                    );

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "⏳ Guardando entrega...";
                }

                await addDoc(
                    collection(db, "entregas"),
                    {
                        usuarioId: usuarioId,
                        pedidoId: pedidoId,
                        figura: figura,
                        fotoURL: fotoURL,
                        fecha: fecha,
                        hora: hora,
                        creadoEn: serverTimestamp()
                    }
                );

                await updateDoc(
                    doc(
                        db,
                        "pedidos",
                        pedidoId
                    ),
                    {
                        estado: "Entregado"
                    }
                );

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "✅ ¡Entrega registrada con éxito!";
                }

                formEntrega.reset();

                if (pedidoEntrega) {

                    pedidoEntrega.innerHTML = `
                        <option value="">
                            Selecciona un pedido
                        </option>
                    `;
                }

                if (listaSolicitudes) {
                    listaSolicitudes.innerHTML = "";
                }

                if (auth.currentUser) {
                    await cargarEntregas(
                        auth.currentUser
                    );
                }

            } catch (error) {

                console.error(
                    "Error al registrar la entrega:",
                    error
                );

                if (mensajeAdmin) {
                    mensajeAdmin.textContent =
                        "❌ Error al registrar: " +
                        error.message;
                }

            } finally {

                if (btnAgregar) {
                    btnAgregar.disabled = false;
                    btnAgregar.textContent =
                        "Agregar entrega";
                }
            }
        }
    );
}

function formatearFecha(timestamp) {

    if (!timestamp) {
        return "No especificada";
    }

    try {

        const fecha =
            timestamp.toDate();

        return fecha.toLocaleString(
            "es-CL"
        );

    } catch (error) {

        return "No especificada";
    }
}

if (btnModoOscuro) {

    btnModoOscuro.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "modo-oscuro"
            );

            if (
                document.body.classList.contains(
                    "modo-oscuro"
                )
            ) {

                btnModoOscuro.textContent =
                    "Modo Claro";

            } else {

                btnModoOscuro.textContent =
                    "Modo Oscuro";
            }
        }
    );
}

function escapeHTML(str) {

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
