// Inicialização Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCLBni8BY6zjHGMuoybZ06SBK4U9c1BhyE",
  authDomain: "petdudis-db2b2.firebaseapp.com",
  projectId: "petdudis-db2b2",
  storageBucket: "petdudis-db2b2.firebasestorage.app",
  messagingSenderId: "410321083813",
  appId: "1:410321083813:web:eaf0082878a8281eab5c4c"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Obter role e uid do usuário logado
const role = sessionStorage.getItem('role');
const uid = sessionStorage.getItem('uid');

// Redirecionamento se não logado
if(!role || !uid){
  alert('Faça login primeiro!');
  window.location.href = '/login.html';
}

// Função para verificar se o usuário tem acesso à página
function verificarAcesso(pasta){
  if(!window.location.pathname.includes(pasta)) return;
  if(pasta.includes('administrador') && role !== 'admin'){
    alert('Acesso negado!');
    window.location.href = '/login.html';
  }
  if(pasta.includes('colaborador') && role !== 'colaborador'){
    alert('Acesso negado!');
    window.location.href = '/login.html';
  }
  if(pasta.includes('parceiros') && role !== 'parceiro'){
    alert('Acesso negado!');
    window.location.href = '/login.html';
  }
}

// --- CLIENTES ---

// Listar clientes
function listarClientes(callback){
  let query = db.collection('clientes').orderBy('createdAt','desc');
  
  // Parceiro só vê seus clientes
  if(role === 'parceiro'){
    query = query.where('parceiroId','==',uid);
  }

  query.onSnapshot(snapshot=>{
    const clientes = [];
    snapshot.forEach(doc => clientes.push({id: doc.id, ...doc.data()}));
    callback(clientes);
  });
}

// Cadastrar cliente
async function cadastrarCliente(nome, email, telefone){
  // Validação básica
  if(!nome || !email || !telefone){
    alert('Preencha todos os campos!');
    return;
  }
  // Verificar email válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){
    alert('Email inválido!');
    return;
  }

  // Verificar duplicados
  const snapTel = await db.collection('clientes').where('telefone','==',telefone).get();
  const snapEmail = await db.collection('clientes').where('email','==',email).get();

  if(!snapTel.empty || !snapEmail.empty){
    alert('Telefone ou email já cadastrado!');
    return;
  }

  await db.collection('clientes').add({
    nome,
    email,
    telefone,
    parceiroId: role === 'parceiro' ? uid : null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  alert('Cliente cadastrado com sucesso!');
}

// Editar cliente (apenas admin)
async function editarCliente(id, dados){
  if(role !== 'admin'){
    alert('Acesso negado!');
    return;
  }
  await db.collection('clientes').doc(id).update(dados);
  alert('Cliente atualizado!');
}

// Excluir cliente (apenas admin)
async function excluirCliente(id){
  if(role !== 'admin'){
    alert('Acesso negado!');
    return;
  }
  const confirm = window.confirm('Deseja realmente excluir este cliente?');
  if(confirm){
    await db.collection('clientes').doc(id).delete();
    alert('Cliente excluído!');
  }
}

// --- PEDIDOS (base) ---

function listarPedidos(clienteId, callback){
  let query = db.collection('pedidos').where('clienteId','==',clienteId);

  // Parceiro só vê pedidos de clientes que ele cadastrou
  if(role === 'parceiro'){
    query = query.where('parceiroId','==',uid);
  }

  query.onSnapshot(snapshot=>{
    const pedidos = [];
    snapshot.forEach(doc => pedidos.push({id: doc.id, ...doc.data()}));
    callback(pedidos);
  });
}

// --- UTILIDADES ---

// Logout
function logout(){
  auth.signOut().then(()=>{
    sessionStorage.clear();
    window.location.href = '/login.html';
  });
}

// Highlight de duplicados na tabela (exemplo)
function highlightDuplicados(tabelaId){
  const linhas = document.querySelectorAll(`#${tabelaId} tbody tr`);
  const emails = {};
  const telefones = {};
  
  linhas.forEach(tr=>{
    const email = tr.cells[1].innerText;
    const tel = tr.cells[2].innerText;

    if(emails[email] || telefones[tel]){
      tr.style.backgroundColor = '#f8d7da'; // vermelho claro
    } else {
      emails[email] = true;
      telefones[tel] = true;
    }
  });
}
