// /assets/js/firebase.js
// Importa módulos do Firebase (usando import dinâmico via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDVr6OOQRt2rB0kByInjqjdyoQCpnMAt7I",
  authDomain: "site-f6495.firebaseapp.com",
  projectId: "site-f6495",
  storageBucket: "site-f6495.firebasestorage.app",
  messagingSenderId: "230161402024",
  appId: "1:230161402024:web:462a911919ebf8a0809a9d",
  measurementId: "G-51G8XF6JH0"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Realtime Database e Auth
const db = getDatabase(app);
const auth = getAuth(app);

// Exporta para uso em outros scripts
export { db, auth };

const data = {
  nome: document.getElementById('nome').value,
  cnpjcpf: document.getElementById('cnpjcpf').value,
  tipo: tipos,
  responsavel: document.getElementById('responsavel').value,
  telefone: document.getElementById('telefone').value,
  email: document.getElementById('email').value,
  endereco: document.getElementById('endereco').value,
  cidade: document.getElementById('cidade').value,
  status: document.getElementById('status').value,
  observacoes: document.getElementById('observacoes').value
};

const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});
