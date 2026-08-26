import{initializeApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import{getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut,updateProfile,setPersistence,browserLocalPersistence}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import{getFirestore,collection,getDocs,query,orderBy}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig={
    apiKey:"AIzaSyC8hIsitvjMYaD9L1Gp_1FdVVrAV6jWP4A",
    authDomain:"impresiones-3d-aml.firebaseapp.com",
    projectId:"impresiones-3d-aml",
    storageBucket:"impresiones-3d-aml.firebasestorage.app",
    messagingSenderId:"61594822515",
    appId:"1:61594822515:web:1dc3e1b35ca02bce904706",
    measurementId:"G-E1L15BXDTG"
};

const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);

setPersistence(auth,browserLocalPersistence).catch(()=>{});

const btnRegistro=document.getElementById("btnRegistro");
const btnLogin=document.getElementById("btnLogin");
const nombreInput=document.getElementById("nombre");
const apellidoInput=document.getElementById("apellido");
const emailInput=document.getElementById("email");
const passwordInput=document.getElementById("password");
const mensaje=document.getElementById("mensaje");
const historialItem=document.getElementById("historialItem");

const btnAbrirLogin=document.getElementById("btnAbrirLogin")||document.querySelector(".btn-login");
const menuLogin=document.getElementById("menuLogin")||document.querySelector(".login");
const loginContainer=document.querySelector(".login-container")||(menuLogin&&menuLogin.parentElement);

if(!btnAbrirLogin||!menuLogin||!loginContainer){
    console.warn("Elementos del menú no encontrados.");
}else{
    menuLogin.addEventListener("pointerdown",e=>e.stopPropagation());
    btnAbrirLogin.addEventListener("pointerdown",e=>e.stopPropagation());

    btnAbrirLogin.addEventListener("click",e=>{
        e.stopPropagation();
        menuLogin.classList.toggle("mostrar");
    });

    loginContainer.addEventListener("focusin",()=>{
        menuLogin.classList.add("mostrar");
    });

    document.addEventListener("pointerdown",e=>{
        if(loginContainer.contains(e.target))return;

        setTimeout(()=>{
            const active=document.activeElement;
            if(active&&loginContainer.contains(active))return;
            menuLogin.classList.remove("mostrar");
        },120);
    });
}

if(btnRegistro){
    btnRegistro.addEventListener("click",async()=>{
        const nombre=nombreInput?.value.trim()||"";
        const apellido=apellidoInput?.value.trim()||"";
        const email=emailInput?.value.trim()||"";
        const password=passwordInput?.value||"";

        if(!nombre||!apellido||!email||!password){
            if(mensaje)mensaje.textContent="❌ Completa todos los campos.";
            return;
        }

        try{
            const res=await createUserWithEmailAndPassword(auth,email,password);

            await updateProfile(res.user,{
                displayName:nombre+" "+apellido
            });

            try{
                await res.user.reload();
            }catch{}

            if(mensaje){
                mensaje.textContent="👋 Cuenta creada. Hola "+(res.user.displayName||res.user.email);
            }
        }catch(err){
            if(mensaje){
                if(err.code==="auth/email-already-in-use"){
                    mensaje.textContent="⚠️ Esta cuenta ya existe.";
                }else if(err.code==="auth/weak-password"){
                    mensaje.textContent="❌ La contraseña debe tener al menos 6 caracteres.";
                }else{
                    mensaje.textContent="❌ "+(err.message||"Error");
                }
            }
        }
    });
}

if(btnLogin){
    btnLogin.addEventListener("click",async()=>{
        if(auth.currentUser){
            try{
                await signOut(auth);
                if(mensaje)mensaje.textContent="👋 Sesión cerrada.";
            }catch{
                if(mensaje)mensaje.textContent="❌ Error cerrando sesión.";
            }
            return;
        }

        const email=emailInput?.value.trim()||"";
        const password=passwordInput?.value||"";

        if(!email||!password){
            if(mensaje)mensaje.textContent="❌ Escribe tu correo y contraseña.";
            return;
        }

        try{
            const res=await signInWithEmailAndPassword(auth,email,password);

            try{
                await res.user.reload();
            }catch{}

            if(mensaje){
                mensaje.textContent="👋 Hola "+(res.user.displayName||res.user.email);
            }
        }catch{
            if(mensaje)mensaje.textContent="❌ Correo o contraseña incorrectos.";
        }
    });
}

onAuthStateChanged(auth,async user=>{
    if(!mensaje)return;

    if(user){
        try{
            await user.reload();
        }catch{}

        const nombre=user.displayName||user.email;

        mensaje.textContent="👋 Hola "+nombre;

        if(btnAbrirLogin)btnAbrirLogin.textContent="Hola "+nombre;
        if(btnLogin)btnLogin.textContent="Cerrar sesión";

        if(historialItem)historialItem.style.display="block";

        if(nombreInput)nombreInput.style.display="none";
        if(apellidoInput)apellidoInput.style.display="none";

        const h2=document.querySelector(".login h2");
        if(h2)h2.textContent="Sesión iniciada";
    }else{
        mensaje.textContent="";

        if(btnLogin)btnLogin.textContent="Iniciar sesión";
        if(btnAbrirLogin)btnAbrirLogin.textContent="Crear cuenta o iniciar sesión";

        if(historialItem)historialItem.style.display="none";

        if(nombreInput)nombreInput.style.display="";
        if(apellidoInput)apellidoInput.style.display="";

        const h2=document.querySelector(".login h2");
        if(h2)h2.textContent="Iniciar sesión";
    }
});
