// Tela principal: precisa de js/main.js carregado antes
const CARDAPIO = [
  { id: 1, nome: "Margherita", desc: "Tomate, mussarela e manjericão", preco: 42 },
  { id: 2, nome: "Calabresa", desc: "Calabresa, cebola e azeitona", preco: 46 },
  { id: 3, nome: "Quatro queijos", desc: "Mussarela, provolone, gorgonzola e parmesão", preco: 54 },
  { id: 4, nome: "Portuguesa", desc: "Presunto, ovo, cebola, ervilha e azeitona", preco: 52 },
  { id: 5, nome: "Chocolate com morango", desc: "Pizza doce", preco: 48 },
  { id: 6, nome: "Refrigerante 2 L", desc: "Guaraná, cola ou limão", preco: 12 }
];
const PACOTES = {
  "Aniversário": 59,
  "Confraternização": 75,
  "Rodízio de festa": 69
};

const sessao = LS.ler("sessao", null);
if (!sessao) {
  location.href = "login.html"; // quem não entrou volta para o login
} else {
  $("#ola").textContent = "Olá, " + sessao.nome.split(" ")[0];
  const carrinho = {}; // id -> quantidade

  // Cardápio
  $("#lista-cardapio").innerHTML = CARDAPIO.map((p) =>
    `<li><span>${p.nome}<small>${p.desc}</small></span><span class="pt"></span>` +
    `<strong>${moeda(p.preco)}</strong> <button class="btn pequeno" data-id="${p.id}">Adicionar</button></li>`
  ).join("");
  $("#lista-cardapio").addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    carrinho[id] = (carrinho[id] || 0) + 1;
    desenharCarrinho();
  });

  function desenharCarrinho() {
    const itens = Object.keys(carrinho);
    let total = 0;
    $("#itens-carrinho").innerHTML = itens.length
      ? itens.map((id) => {
          const p = CARDAPIO.find((x) => x.id === Number(id));
          total += p.preco * carrinho[id];
          return `<li><span>${carrinho[id]}x ${p.nome}</span><span>${moeda(p.preco * carrinho[id])}</span></li>`;
        }).join("")
      : '<li class="vazio">Seu carrinho está vazio. Adicione itens do cardápio.</li>';
    $("#total").textContent = moeda(total);
    $("#finalizar").disabled = !itens.length;
  }

  $("#finalizar").addEventListener("click", () => {
    const itens = Object.keys(carrinho).map((id) => {
      const p = CARDAPIO.find((x) => x.id === Number(id));
      return { nome: p.nome, qtd: carrinho[id], subtotal: p.preco * carrinho[id] };
    });
    const pedidos = LS.ler("pedidos", []);
    pedidos.push({
      email: sessao.email,
      data: new Date().toLocaleString("pt-BR"),
      itens,
      total: itens.reduce((s, i) => s + i.subtotal, 0),
      status: "Recebido"
    });
    LS.gravar("pedidos", pedidos);
    Object.keys(carrinho).forEach((id) => delete carrinho[id]);
    desenharCarrinho();
    desenharHistorico();
  });

  // Reserva de evento
  const campoData = $("#data");
  campoData.min = new Date().toISOString().slice(0, 10);
  $("#form-reserva").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const msg = $("#msg-reserva");
    const reservas = LS.ler("reservas", []);
    if (reservas.some((r) => r.dataEvento === f.get("data"))) {
      msg.className = "erro";
      msg.textContent = "Esta data já está reservada. Escolha outro dia.";
      return;
    }
    const convidados = Number(f.get("convidados"));
    const pacote = f.get("pacote");
    reservas.push({
      email: sessao.email,
      dataEvento: f.get("data"),
      convidados,
      pacote,
      obs: f.get("obs").trim(),
      total: convidados * PACOTES[pacote]
    });
    LS.gravar("reservas", reservas);
    e.target.reset();
    msg.className = "ok";
    msg.textContent = "Reserva enviada! Nossa equipe confirma pelo telefone.";
    desenharHistorico();
  });

  // Meus pedidos e reservas
  function desenharHistorico() {
    const pedidos = LS.ler("pedidos", []).filter((p) => p.email === sessao.email);
    $("#meus-pedidos").innerHTML = pedidos.length
      ? pedidos.map((p) =>
          `<li><strong>${esc(p.data)}</strong> · ${p.itens.map((i) => esc(i.qtd + "x " + i.nome)).join(", ")}` +
          ` · ${moeda(p.total)} · ${esc(p.status)}</li>`).join("")
      : '<li class="vazio">Você ainda não fez pedidos.</li>';

    const reservas = LS.ler("reservas", []).filter((r) => r.email === sessao.email);
    $("#minhas-reservas").innerHTML = reservas.length
      ? reservas.map((r) =>
          `<li><strong>${esc(r.dataEvento.split("-").reverse().join("/"))}</strong> · ${esc(r.pacote)}` +
          ` · ${r.convidados} convidados · estimativa ${moeda(r.total)}${r.obs ? " · " + esc(r.obs) : ""}</li>`).join("")
      : '<li class="vazio">Você ainda não reservou eventos.</li>';
  }

  desenharCarrinho();
  desenharHistorico();
}
