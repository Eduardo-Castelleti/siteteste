/ main.js

document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // --- LOGIN ---
  // Pegando o link "Entrar | Cadastrar" (primeiro link com ícone fa-user dentro .acoes-usuario)
  const acoesUsuario = document.querySelector('.acoes-usuario');
  const linkEntrar = acoesUsuario?.querySelector('a[href="#"]:not(.logado)');
  
  // Criar modal simples de login dinamicamente (se não existir)
  function criarModalLogin() {
    if (document.getElementById('modal-login')) return; // já existe

    const modal = document.createElement('div');
    modal.id = 'modal-login';
    modal.style.cssText = `
      display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5);
      justify-content:center; align-items:center; z-index:9999;
    `;
    modal.innerHTML = `
      <div style="
        background:#fff; padding:20px; border-radius:10px; max-width:320px; width:90%;
        box-shadow:0 5px 15px rgba(0,0,0,0.3); position:relative;
      ">
        <span id="modal-fechar" style="
          position:absolute; top:8px; right:12px; font-size:24px; cursor:pointer; color:#666;
        ">&times;</span>
        <h2 style="margin-top:0; color:#4a148c; font-family: Arial, sans-serif;">Entrar</h2>
        <form id="form-login" style="display:flex; flex-direction:column; gap:12px;">
          <input type="email" id="login-email" placeholder="E-mail" required style="padding:10px; border:1px solid #ccc; border-radius:6px;" />
          <input type="password" id="login-senha" placeholder="Senha" required style="padding:10px; border:1px solid #ccc; border-radius:6px;" />
          <button type="submit" style="
            background:#6a1b9a; color:#fff; border:none; padding:10px; border-radius:6px; cursor:pointer;
            font-weight:bold;
          ">Entrar</button>
          <div id="login-erro" style="color:#d32f2f; font-size:14px; display:none;"></div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Fechar modal
    modal.querySelector('#modal-fechar').onclick = () => {
      modal.style.display = 'none';
      limparErroLogin();
    };

    // Fechar clicando fora da área
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        limparErroLogin();
      }
    };

    // Form submit login
    const formLogin = modal.querySelector('#form-login');
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      limparErroLogin();

      const email = formLogin['login-email'].value.trim();
      const senha = formLogin['login-senha'].value.trim();

      if (!email) {
        mostrarErroLogin('Informe o e-mail');
        return;
      }
      if (!senha) {
        mostrarErroLogin('Informe a senha');
        return;
      }

      try {
        await auth.signInWithEmailAndPassword(email, senha);
        modal.style.display = 'none';
      } catch (err) {
        mostrarErroLogin(err.message);
      }
    });

    function mostrarErroLogin(msg) {
      const erroDiv = modal.querySelector('#login-erro');
      erroDiv.textContent = msg;
      erroDiv.style.display = 'block';
    }
    function limparErroLogin() {
      const erroDiv = modal.querySelector('#login-erro');
      erroDiv.textContent = '';
      erroDiv.style.display = 'none';
    }
  }

  criarModalLogin();

  // Abrir modal no clique do link Entrar
  if (linkEntrar) {
    linkEntrar.addEventListener('click', e => {
      e.preventDefault();
      const modal = document.getElementById('modal-login');
      if (modal) modal.style.display = 'flex';
    });
  }

  // Atualizar texto do link de acordo com estado de login
  auth.onAuthStateChanged(user => {
    if (!acoesUsuario) return;
    if (user) {
      // Exibir "Olá, nome | Sair"
      const nome = user.displayName || user.email?.split('@')[0] || 'Cliente';
      acoesUsuario.innerHTML = `
        <span style="color:#4a148c; font-weight:700; margin-right:12px;">Olá, ${nome}</span>
        <a href="#" id="btn-logout" style="color:#d32f2f; font-weight:700;">Sair</a>
      `;
      const btnLogout = document.getElementById('btn-logout');
      btnLogout.addEventListener('click', async e => {
        e.preventDefault();
        await auth.signOut();
        location.reload();
      });
    } else {
      // Voltar ao link original "Entrar | Cadastrar"
      acoesUsuario.innerHTML = `
        <a href="#" id="link-entrar"><i class="fas fa-user"></i> Entrar | Cadastrar</a>
        <a href="#"><i class="fas fa-sync-alt"></i> Recorrência</a>
        <a href="#"><i class="fas fa-box"></i> Pedidos</a>
      `;
      // Reatribuir evento no novo link
      const novoLink = document.getElementById('link-entrar');
      if (novoLink) {
        novoLink.addEventListener('click', e => {
          e.preventDefault();
          const modal = document.getElementById('modal-login');
          if (modal) modal.style.display = 'flex';
        });
      }
    }
  });

  // --- ATUALIZAR MAIS VENDIDOS (substitui conteúdo estático) ---
  const containerMaisVendidos = document.querySelector('.mais-vendidos .produtos-destaque');
  async function carregarMaisVendidos() {
    if (!containerMaisVendidos) return;
    containerMaisVendidos.innerHTML = 'Carregando...';

    try {
      const snapshot = await db.collection('mais_vendidos')
        .orderBy('ordem', 'asc')
        .limit(10)
        .get();

      if (snapshot.empty) {
        containerMaisVendidos.innerHTML = '<p style="color:#666;">Nenhum item disponível.</p>';
        return;
      }

      containerMaisVendidos.innerHTML = ''; // limpa

      snapshot.forEach(doc => {
        const data = doc.data();
        const divProduto = document.createElement('div');
        divProduto.className = 'produto';
        divProduto.innerHTML = `
          <img src="${data.imagem || 'https://via.placeholder.com/150'}" alt="${data.nome || ''}" />
          <h3>${data.nome || ''}</h3>
          <p>${data.descricao || ''}</p>
          <span class="preco">${data.preco || ''}</span>
        `;
        containerMaisVendidos.appendChild(divProduto);
      });

    } catch (err) {
      containerMaisVendidos.innerHTML = `<p style="color:#d32f2f;">Erro ao carregar: ${err.message}</p>`;
    }
  }

  // --- ATUALIZAR MARCAS (substitui imagens estáticas) ---
  const containerMarcas = document.querySelector('.marcas-container');
  async function carregarMarcas() {
    if (!containerMarcas) return;
    containerMarcas.innerHTML = 'Carregando...';

    try {
      const snapshot = await db.collection('marcas')
        .orderBy('ordem', 'asc')
        .limit(20)
        .get();

      if (snapshot.empty) {
        containerMarcas.innerHTML = '<p style="color:#666;">Nenhuma marca cadastrada.</p>';
        return;
      }

      containerMarcas.innerHTML = ''; // limpa

      snapshot.forEach(doc => {
        const data = doc.data();
        const img = document.createElement('img');
        img.src = data.logoUrl || 'https://via.placeholder.com/120x50?text=Marca';
        img.alt = data.nome || 'Marca';
        containerMarcas.appendChild(img);
      });

    } catch (err) {
      containerMarcas.innerHTML = `<p style="color:#d32f2f;">Erro ao carregar: ${err.message}</p>`;
    }
  }

  // Inicializa dados
  carregarMaisVendidos();
  carregarMarcas();
});

// Mostrar modal de login
document.getElementById('btn-login').addEventListener('click', () => {
  abrirModal('modal-login');
});

// Fechar modal ao clicar fora
window.onclick = function(event) {
  document.querySelectorAll('.modal').forEach(modal => {
    if (event.target === modal) modal.style.display = 'none';
  });
};

// Login com Firebase
const formLogin = document.getElementById('form-login');
formLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;

  auth.signInWithEmailAndPassword(email, senha)
    .then((userCredential) => {
      const user = userCredential.user;
      fecharModal('modal-login');
      atualizarInterface(user);
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Atualizar interface após login
function atualizarInterface(user) {
  const btnLogin = document.getElementById('btn-login');
  btnLogin.style.display = 'none'; // esconde botão de login

  // mostra dropdown
  document.querySelector('.dropdown').style.display = 'inline-block';
}

// Monitorar estado de autenticação
auth.onAuthStateChanged((user) => {
  if (user) {
    atualizarInterface(user);
  } else {
    // usuário deslogado
    document.getElementById('btn-login').style.display = 'inline-block';
    document.querySelector('.dropdown').style.display = 'none';
  }
});
