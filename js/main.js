// Utilitários usados em todas as páginas
const LS = {
  ler(chave, padrao) {
    try { const v = JSON.parse(localStorage.getItem(chave)); return v === null ? padrao : v; }
    catch (e) { return padrao; }
  },
  gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem armazenamento */ }
  }
};
const $ = (seletor) => document.querySelector(seletor);
const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pagina = document.body.dataset.pagina;

// Cadastro (protótipo: os dados ficam só no navegador, sem servidor)
if (pagina === "cadastro") {
  $("#form-cadastro").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const nome = f.get("nome").trim();
    const email = f.get("email").trim().toLowerCase();
    const telefone = f.get("telefone").trim();
    const senha = f.get("senha");
    const erro = $("#erro");

    if (senha.length < 6) { erro.textContent = "A senha precisa ter pelo menos 6 caracteres."; return; }
    if (senha !== f.get("senha2")) { erro.textContent = "As senhas não são iguais."; return; }

    const usuarios = LS.ler("usuarios", []);
    if (usuarios.some((u) => u.email === email)) {
      erro.textContent = "Este e-mail já está cadastrado. Entre com sua senha.";
      return;
    }
    usuarios.push({ nome, email, telefone, senha });
    LS.gravar("usuarios", usuarios);
    LS.gravar("sessao", { nome, email });
    location.href = "principal.html";
  });
}

// Login
if (pagina === "login") {
  $("#form-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const email = f.get("email").trim().toLowerCase();
    const usuario = LS.ler("usuarios", []).find((u) => u.email === email && u.senha === f.get("senha"));
    if (!usuario) { $("#erro").textContent = "E-mail ou senha incorretos. Confira os dados e tente de novo."; return; }
    LS.gravar("sessao", { nome: usuario.nome, email: usuario.email });
    location.href = "principal.html";
  });
}

// Sair (botão com id="sair")
const botaoSair = $("#sair");
if (botaoSair) {
  botaoSair.addEventListener("click", () => {
    try { localStorage.removeItem("sessao"); } catch (e) { /* ignora */ }
    location.href = "login.html";
  });
}
