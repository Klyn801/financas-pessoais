const API_URL = "http://127.0.0.1:8000";


// ==============================
// CARREGAR RESUMO FINANCEIRO
// ==============================

async function carregarResumo() {

    const resposta = await fetch(`${API_URL}/resumo`);

    const dados = await resposta.json();

    document.getElementById("totalReceitas").textContent =
        `R$ ${dados.total_receitas.toFixed(2).replace(".", ",")}`;

    document.getElementById("totalDespesas").textContent =
        `R$ ${dados.total_despesas.toFixed(2).replace(".", ",")}`;

    const elementoSaldo = document.getElementById("saldo");

    elementoSaldo.textContent =
        `R$ ${dados.saldo.toFixed(2).replace(".", ",")}`;

    elementoSaldo.classList.remove(
        "saldo-positivo",
        "saldo-negativo",
        "saldo-zero"
    );

    if (dados.saldo > 0) {

        elementoSaldo.classList.add("saldo-positivo");

    } else if (dados.saldo < 0) {

        elementoSaldo.classList.add("saldo-negativo");

    } else {

        elementoSaldo.classList.add("saldo-zero");

    }
}


// ==============================
// CARREGAR MOVIMENTAÇÕES
// ==============================

async function carregarMovimentacoes() {

    const resposta = await fetch(`${API_URL}/movimentacoes`);

    const movimentacoes = await resposta.json();

    const lista = document.getElementById("listaMovimentacoes");

    lista.innerHTML = "";
   
const filtro = document.getElementById("filtroTipo").value;

const filtroCategoria =
    document.getElementById("filtroCategoria").value;

const dataInicial =
    document.getElementById("dataInicial").value;

const dataFinal =
    document.getElementById("dataFinal").value;

const movimentacoesFiltradas = movimentacoes.filter(
    movimentacao => {

        const correspondeTipo =
            filtro === "Todos" ||
            movimentacao.tipo === filtro;

        const correspondeCategoria =
            filtroCategoria === "Todas" ||
            movimentacao.categoria === filtroCategoria;

        const correspondeDataInicial =
            dataInicial === "" ||
            movimentacao.data >= dataInicial;

        const correspondeDataFinal =
            dataFinal === "" ||
            movimentacao.data <= dataFinal;

        return (
            correspondeTipo &&
            correspondeCategoria &&
            correspondeDataInicial &&
            correspondeDataFinal
        );
    }
);

atualizarResumoFiltrado(movimentacoesFiltradas);

    movimentacoesFiltradas.forEach(movimentacao => {

        const div = document.createElement("div");

        div.classList.add("movimentacao");

        div.innerHTML = `
    <h3>${movimentacao.descricao}</h3>

    <p><strong>Tipo:</strong> ${movimentacao.tipo}</p>

    <p><strong>Categoria:</strong> ${movimentacao.categoria}</p>

    <p class="${movimentacao.tipo === "Receita" ? "valor-receita" : "valor-despesa"}">
    <strong>Valor:</strong>
    ${movimentacao.tipo === "Receita" ? "+" : "-"}
    R$ ${movimentacao.valor.toFixed(2).replace(".", ",")}
</p>
    <p><strong>Data:</strong> ${movimentacao.data}</p>

    <button onclick="editarMovimentacao(${movimentacao.id})">
        Editar
    </button>

    <button onclick="excluirMovimentacao(${movimentacao.id})">
        Excluir
    </button>
`;


        lista.appendChild(div);
    });
}


// ==============================
// CADASTRAR MOVIMENTAÇÃO
// ==============================

document.getElementById("formMovimentacao").addEventListener("submit", async function(event) {

    event.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const descricao = document.getElementById("descricao").value;
    const categoria = document.getElementById("categoria").value;
    const valor = Number(document.getElementById("valor").value);
    const data = document.getElementById("data").value;

    const novaMovimentacao = {
        tipo: tipo,
        descricao: descricao,
        categoria: categoria,
        valor: valor,
        data: data
    };

    const resposta = await fetch(`${API_URL}/movimentacoes`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(novaMovimentacao)
    });

    if (resposta.ok) {

        alert("Movimentação cadastrada com sucesso!");

        document.getElementById("formMovimentacao").reset();

        carregarMovimentacoes();
        carregarResumo();
        carregarGraficoDespesas();

    } else {

        alert("Erro ao cadastrar movimentação.");
    }
});


// ==============================
// INICIAR SISTEMA
// ==============================

carregarMovimentacoes();
// ==============================
// EXCLUIR MOVIMENTAÇÃO
// ==============================

async function excluirMovimentacao(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir esta movimentação?"
    );

    if (!confirmar) {
        return;
    }

    const resposta = await fetch(
        `${API_URL}/movimentacoes/${id}`,
        {
            method: "DELETE"
        }
    );

    if (resposta.ok) {

        alert("Movimentação excluída com sucesso!");

        carregarMovimentacoes();
        carregarResumo();
         carregarGraficoDespesas();

    } else {

        alert("Erro ao excluir movimentação.");
    }
}
// ==============================
// EDITAR MOVIMENTAÇÃO
// ==============================

async function editarMovimentacao(id) {

    const resposta = await fetch(
        `${API_URL}/movimentacoes/${id}`
    );

    if (!resposta.ok) {
        alert("Erro ao buscar movimentação.");
        return;
    }

    const movimentacao = await resposta.json();

    const novoTipo = prompt(
        "Tipo (Receita ou Despesa):",
        movimentacao.tipo
    );

    if (novoTipo === null) {
        return;
    }

    const novaDescricao = prompt(
        "Descrição:",
        movimentacao.descricao
    );

    if (novaDescricao === null) {
        return;
    }

    const novaCategoria = prompt(
        "Categoria:",
        movimentacao.categoria
    );

    if (novaCategoria === null) {
        return;
    }

    const novoValor = prompt(
        "Valor:",
        movimentacao.valor
    );

    if (novoValor === null) {
        return;
    }

    const novaData = prompt(
        "Data (AAAA-MM-DD):",
        movimentacao.data
    );

    if (novaData === null) {
        return;
    }

    const dadosAtualizados = {
        tipo: novoTipo,
        descricao: novaDescricao,
        categoria: novaCategoria,
        valor: Number(novoValor),
        data: novaData
    };

    const atualizacao = await fetch(
        `${API_URL}/movimentacoes/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(dadosAtualizados)
        }
    );

    if (atualizacao.ok) {

        alert("Movimentação atualizada com sucesso!");

        carregarMovimentacoes();
        carregarResumo();
        carregarGraficoDespesas();

    } else {

        alert("Erro ao atualizar movimentação.");
    }
}
// ==============================
// GRÁFICO DE DESPESAS
// ==============================

async function carregarGraficoDespesas() {

    const resposta = await fetch(
        `${API_URL}/despesas-por-categoria`
    );

    const dados = await resposta.json();

    const categorias = Object.keys(dados);
    const valores = Object.values(dados);

    const canvas = document.getElementById("graficoDespesas");

    new Chart(canvas, {
    type: "pie",

    data: {
        labels: categorias,

        datasets: [
            {
                data: valores
            }
        ]
    },

    options: {
        responsive: true,

        plugins: {
            legend: {
                position: "bottom"
            }
        }
    }
});
}
carregarGraficoDespesas();

document.getElementById("filtroTipo").addEventListener(
    "change",
    carregarMovimentacoes
);
document.getElementById("filtroCategoria").addEventListener(
    "change",
    carregarMovimentacoes
);

document.getElementById("dataInicial").addEventListener(
    "change",
    carregarMovimentacoes
);

document.getElementById("dataFinal").addEventListener(
    "change",
    carregarMovimentacoes
);

document.getElementById("limparFiltros").addEventListener(
    "click",
    function() {

        document.getElementById("filtroTipo").value = "Todos";

        document.getElementById("filtroCategoria").value = "Todas";

        document.getElementById("dataInicial").value = "";

        document.getElementById("dataFinal").value = "";

        carregarMovimentacoes();
    }
);

// ==============================
// RESUMO DOS FILTROS
// ==============================

function atualizarResumoFiltrado(movimentacoes) {

    let totalReceitas = 0;
    let totalDespesas = 0;

    movimentacoes.forEach(movimentacao => {

        if (movimentacao.tipo === "Receita") {

            totalReceitas += movimentacao.valor;

        } else if (movimentacao.tipo === "Despesa") {

            totalDespesas += movimentacao.valor;
        }
    });

    const saldo = totalReceitas - totalDespesas;

    document.getElementById("totalReceitas").textContent =
        `R$ ${totalReceitas.toFixed(2).replace(".", ",")}`;

    document.getElementById("totalDespesas").textContent =
        `R$ ${totalDespesas.toFixed(2).replace(".", ",")}`;

    const elementoSaldo = document.getElementById("saldo");

    elementoSaldo.textContent =
        `R$ ${saldo.toFixed(2).replace(".", ",")}`;

    elementoSaldo.classList.remove(
        "saldo-positivo",
        "saldo-negativo",
        "saldo-zero"
    );

    if (saldo > 0) {

        elementoSaldo.classList.add("saldo-positivo");

    } else if (saldo < 0) {

        elementoSaldo.classList.add("saldo-negativo");

    } else {

        elementoSaldo.classList.add("saldo-zero");
    }
}