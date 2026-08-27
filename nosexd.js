import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    collection,
    addDoc,
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

const app =
    initializeApp(firebaseConfig);
const auth =
    getAuth(app);
const db =
    getFirestore(app);
const storage =
    getStorage(app);


setPersistence(
    auth,
    browserLocalPersistence
).catch(() => {});

const btnRegistro =
    document.getElementById("btnRegistro");
const btnLogin =
    document.getElementById("btnLogin");
const nombreInput =
    document.getElementById("nombre");
const apellidoInput =
    document.getElementById("apellido");
const emailInput =
    document.getElementById("email");
const passwordInput =
    document.getElementById("password");
const mensaje =
    document.getElementById("mensaje");
const historialItem =
    document.getElementById("historialItem");
const btnAbrirLogin =
    document.getElementById("btnAbrirLogin") ||
    document.querySelector(".btn-login");
const menuLogin =
    document.getElementById("menuLogin") ||
    document.querySelector(".login");
const loginContainer =
    document.querySelector(".login-container") ||
    (menuLogin && menuLogin.parentElement);

if(
    !btnAbrirLogin ||
    !menuLogin ||
    !loginContainer
){
    console.warn(
        "Elementos del menú no encontrados."
    );

}else{
    menuLogin.addEventListener(
        "pointerdown",
        e => e.stopPropagation()
    );
    btnAbrirLogin.addEventListener(
        "pointerdown",
        e => e.stopPropagation()
    );

    btnAbrirLogin.addEventListener(
        "click",
        e => {
            e.stopPropagation();
            menuLogin.classList.toggle(
                "mostrar"
            );
        }
    );

    loginContainer.addEventListener(
        "focusin",
        () => {
            menuLogin.classList.add(
                "mostrar"
            );
        }
    );
    document.addEventListener(
        "pointerdown",
        e => {
            if(
                loginContainer.contains(
                    e.target
                )
            ) return;

            setTimeout(() => {
                const active =
                    document.activeElement;
                if(
                    active &&
                    loginContainer.contains(
                        active
                    )
                ) return;

                menuLogin.classList.remove(
                    "mostrar"
                );
            },120);
        }
    );
}


if(btnRegistro){
    btnRegistro.addEventListener(
        "click",
        async () => {
            const nombre =
                nombreInput?.value.trim() || "";
            const apellido =
                apellidoInput?.value.trim() || "";
            const email =
                emailInput?.value.trim() || "";
            const password =
                passwordInput?.value || "";

            if(
                !nombre ||
                !apellido ||
                !email ||
                !password
            ){

                if(mensaje)
                    mensaje.textContent =
                        "❌ Completa todos los campos.";
                return;
            }

            try{
                const res =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const nombreCompleto =
                    nombre + " " + apellido;

                await updateProfile(
                    res.user,
                    {
                        displayName:
                            nombreCompleto
                    }
                );

                await setDoc(
                    doc(
                        db,
                        "usuarios",
                        res.user.uid
                    ),
                    {
                        nombre:
                            nombreCompleto,
                        email:
                            email,
                        uid:
                            res.user.uid,
                        creadoEn:
                            serverTimestamp()
                    }
                );

                if(mensaje){
                    mensaje.textContent =
                        "👋 Cuenta creada. Hola " +
                        nombreCompleto;
                }

            }catch(err){
                if(mensaje){
                    if(
                        err.code ===
                        "auth/email-already-in-use"
                    ){
                        mensaje.textContent =
                            "⚠️ Esta cuenta ya existe.";
                    }else if(
                        err.code ===
                        "auth/weak-password"
                    ){
                        mensaje.textContent =
                            "❌ La contraseña debe tener al menos 6 caracteres.";
                    }else{
                        mensaje.textContent =
                            "❌ " +
                            (
                                err.message ||
                                "Error"
                            );
                    }
                }
            }
        }
    );
}


if(btnLogin){
    btnLogin.addEventListener(
        "click",
        async () => {
            if(auth.currentUser){
                try{
                    await signOut(auth);
                    if(mensaje)
                        mensaje.textContent =
                            "👋 Sesión cerrada.";
                }catch{
                    if(mensaje)
                        mensaje.textContent =
                            "❌ Error cerrando sesión.";
                }
                return;
            }

            const email =
                emailInput?.value.trim() || "";
            const password =
                passwordInput?.value || "";

            if(!email || !password){
                if(mensaje)
                    mensaje.textContent =
                        "❌ Escribe tu correo y contraseña.";
                return;
            }

            try{
                const res =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                if(mensaje)
                    mensaje.textContent =
                        "👋 Hola " +
                        (
                            res.user.displayName ||
                            res.user.email
                        );

            }catch{
                if(mensaje)
                    mensaje.textContent =
                        "❌ Correo o contraseña incorrectos.";
            }
        }
    );

}


onAuthStateChanged(
    auth,
    async user => {
        if(!mensaje) return;
        if(user){
            try{
                await user.reload();
            }catch{}
            const nombre =
                user.displayName ||
                user.email;
            mensaje.textContent =
                "👋 Hola " + nombre;
            if(btnAbrirLogin)
                btnAbrirLogin.textContent =
                    "Hola " + nombre;
            if(btnLogin)
                btnLogin.textContent =
                    "Cerrar sesión";
            if(historialItem)
                historialItem.style.display =
                    "block";
            if(nombreInput)
                nombreInput.style.display =
                    "none";
            if(apellidoInput)
                apellidoInput.style.display =
                    "none";
            const h2 =
                document.querySelector(
                    ".login h2"
                );
            if(h2)
                h2.textContent =
                    "Sesión iniciada";
        }else{
            mensaje.textContent = "";
            if(btnLogin)
                btnLogin.textContent =
                    "Iniciar sesión";
            if(btnAbrirLogin)
                btnAbrirLogin.textContent =
                    "Crear cuenta o iniciar sesión";
            if(historialItem)
                historialItem.style.display =
                    "none";
            if(nombreInput)
                nombreInput.style.display =
                    "";
            if(apellidoInput)
                apellidoInput.style.display =
                    "";
            const h2 =
                document.querySelector(
                    ".login h2"
                );
            if(h2)
                h2.textContent =
                    "Iniciar sesión";
        }
    }
);

const formPedido =
    document.getElementById(
        "formPedido"
    );

if(formPedido){
    formPedido.addEventListener(
        "submit",
        async event => {
            event.preventDefault();
            const user =
                auth.currentUser;

            if(!user){
                alert(
                    "Debes iniciar sesión para hacer un pedido."
                );
                return;
            }

            const figura =
                document
                .getElementById("figura")
                ?.value.trim() || "";
            const medida =
                document
                .getElementById("medida")
                ?.value.trim() || "";
            const archivoInput =
                document.getElementById(
                    "archivoFigura"
                );
            const archivo =
                archivoInput?.files[0];
            const mensajePedido =
                document.getElementById(
                    "mensajePedido"
                );

            if(!figura || !medida){
                if(mensajePedido)
                    mensajePedido.textContent =
                        "❌ Completa la figura y la medida.";
                return;
            }

            if(!archivo){
                if(mensajePedido)
                    mensajePedido.textContent =
                        "❌ Selecciona el archivo de tu figura.";
                return;
            }

            const extensionesPermitidas = [
                ".stl",
                ".obj",
                ".3mf",
                ".glb",
                ".gltf",
                ".zip"
            ];
            const nombre =
                archivo.name.toLowerCase();
            const extension =
                nombre.substring(
                    nombre.lastIndexOf(".")
                );

            if(
                !extensionesPermitidas.includes(
                    extension
                )
            ){
                if(mensajePedido)
                    mensajePedido.textContent =
                        "❌ Formato de archivo no permitido.";
                return;
            }
            if(
                archivo.size >
                50 * 1024 * 1024
            ){
                if(mensajePedido)
                    mensajePedido.textContent =
                        "❌ El archivo no puede superar los 50 MB.";
                return;
            }

            try{
                if(mensajePedido)
                    mensajePedido.textContent =
                        "⏳ Subiendo archivo...";
                const nombreArchivo =
                    Date.now() +
                    "_" +
                    archivo.name;
                const ruta =
                    `modelos/${user.uid}/${nombreArchivo}`;
                const archivoRef =
                    ref(
                        storage,
                        ruta
                    );

                await uploadBytes(
                    archivoRef,
                    archivo
                );
                const archivoURL =
                    await getDownloadURL(
                        archivoRef
                    );
                await addDoc(
                    collection(
                        db,
                        "pedidos"
                    ),
                    {
                        usuarioId:
                            user.uid,
                        usuarioEmail:
                            user.email,
                        figura:
                            figura,
                        medida:
                            medida,
                        archivoURL:
                            archivoURL,
                        archivoNombre:
                            archivo.name,
                        archivoPath:
                            ruta,
                        estado:
                            "Pendiente",
                        creadoEn:
                            serverTimestamp()
                    }
                );
                if(mensajePedido)
                    mensajePedido.textContent =
                        "✅ Pedido enviado correctamente.";
                formPedido.reset();
            }catch(error){
                console.error(error);
                if(mensajePedido)
                    mensajePedido.textContent =
                        "❌ No se pudo enviar el pedido.";
            }
        }
    );
}

// =========================
// MODO OSCURO
// =========================

const btnModoOscuro = document.getElementById("btnModoOscuro");

if (btnModoOscuro) {

    // Comprobar si había un modo guardado
    const modoGuardado = localStorage.getItem("modoOscuro");

    if (modoGuardado === "true") {
        document.body.classList.add("modo-oscuro");
        btnModoOscuro.textContent = "Modo Claro";
    } else {
        document.body.classList.remove("modo-oscuro");
        btnModoOscuro.textContent = "Modo Oscuro";
    }

    // Cambiar entre claro y oscuro
    btnModoOscuro.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        document.body.classList.toggle("modo-oscuro");

        const modoOscuroActivo =
            document.body.classList.contains("modo-oscuro");

        localStorage.setItem(
            "modoOscuro",
            modoOscuroActivo ? "true" : "false"
        );

        btnModoOscuro.textContent =
            modoOscuroActivo
                ? "Modo Claro"
                : "Modo Oscuro";
    });
}
