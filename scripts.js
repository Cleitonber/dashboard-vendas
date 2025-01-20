const { jsPDF } = window.jspdf;

let dados = {
    vendas: [],
    vendedores: [],
    servicos: [],
    empresasParceiras: []
};

let paginaAtualVendedores = 1;
let paginaAtualServicos = 1;
let paginaAtualEmpresas = 1;
let paginaAtualVendas = 1;
const itensPorPagina = 5;

let vendasServicoChart, desempenhoVendedoresChart, vendasCategoriaChart;

// Função para alternar entre as abas
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');

    const buttons = document.querySelectorAll('.nav-button');
    buttons.forEach(button => button.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Inicializa a aba "Dashboard" como ativa ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    showTab('dashboard');
    preencherAnos();
    atualizarOpcoesVendedores();
    atualizarOpcoesServicos();
    atualizarOpcoesEmpresas();
    inicializarGraficos();
});

// Função para preencher o seletor de anos
function preencherAnos() {
    const selectAno = document.getElementById('anoFiltro');
    selectAno.innerHTML = '';

    // Extrair anos únicos das vendas
    const anosUnicos = [...new Set(dados.vendas.map(venda => new Date(venda.data.split('/').reverse().join('-')).getFullYear()))];
    anosUnicos.sort((a, b) => b - a); // Ordenar do ano mais recente para o mais antigo

    // Adicionar opções ao seletor
    anosUnicos.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        selectAno.appendChild(option);
    });

    // Selecionar o ano atual por padrão
    const anoAtual = new Date().getFullYear();
    selectAno.value = anoAtual;
}

// Função para atualizar o dashboard
function atualizarDashboard() {
    const mesSelecionado = parseInt(document.getElementById('mesFiltro').value); // Mês selecionado (1 a 12)
    const anoSelecionado = parseInt(document.getElementById('anoFiltro').value); // Ano selecionado

    const vendasFiltradas = dados.vendas.filter(venda => {
        const dataVenda = new Date(venda.data.split('/').reverse().join('-')); // Converte a data para o formato Date
        const mesVenda = dataVenda.getMonth() + 1; // getMonth() retorna 0-11, então somamos 1
        const anoVenda = dataVenda.getFullYear();

        return mesVenda === mesSelecionado && anoVenda === anoSelecionado;
    });

    // Atualizar gráficos
    atualizarGraficos(vendasFiltradas);

    // Atualizar estatísticas
    const totalVendas = vendasFiltradas.reduce((total, venda) => total + venda.valorVenda, 0);
    const totalComissoes = vendasFiltradas.reduce((total, venda) => total + venda.valorReceber, 0);
    const totalClientes = [...new Set(vendasFiltradas.map(venda => venda.nomeCliente))].length;
    const ticketMedio = totalClientes > 0 ? totalVendas / totalClientes : 0;

    document.getElementById('totalVendasDash').textContent = totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('totalComissoesDash').textContent = totalComissoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('totalClientes').textContent = totalClientes;
    document.getElementById('ticketMedio').textContent = ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para atualizar os gráficos
function atualizarGraficos(vendasFiltradas) {
    if (!vendasServicoChart || !desempenhoVendedoresChart || !vendasCategoriaChart) {
        console.error("Gráficos não inicializados. Verifique a função inicializarGraficos.");
        return;
    }

    // Atualizar gráfico de Vendas por Serviço
    const servicos = [...new Set(dados.servicos.map(servico => servico.nome))];
    const vendasPorServico = servicos.map(servico => {
        return vendasFiltradas.filter(venda => venda.servico === servico).reduce((total, venda) => total + venda.valorVenda, 0);
    });

    vendasServicoChart.data.labels = servicos;
    vendasServicoChart.data.datasets[0].data = vendasPorServico;
    vendasServicoChart.update();

    // Atualizar gráfico de Desempenho dos Vendedores
    const vendedores = [...new Set(dados.vendedores.map(vendedor => vendedor.nome))];
    const vendasPorVendedor = vendedores.map(vendedor => {
        return vendasFiltradas.filter(venda => venda.vendedor === vendedor).reduce((total, venda) => total + venda.valorVenda, 0);
    });

    desempenhoVendedoresChart.data.labels = vendedores;
    desempenhoVendedoresChart.data.datasets[0].data = vendasPorVendedor;
    desempenhoVendedoresChart.update();

    // Atualizar gráfico de Vendas por Categoria
    const categorias = [...new Set(dados.servicos.map(servico => servico.categoria))];
    const vendasPorCategoria = categorias.map(categoria => {
        return vendasFiltradas.filter(venda => dados.servicos.find(servico => servico.nome === venda.servico).categoria === categoria).reduce((total, venda) => total + venda.valorVenda, 0);
    });

    vendasCategoriaChart.data.labels = categorias;
    vendasCategoriaChart.data.datasets[0].data = vendasPorCategoria;
    vendasCategoriaChart.update();
}

// Função para inicializar os gráficos
function inicializarGraficos() {
    const ctxVendasServico = document.getElementById('vendasServicoChart').getContext('2d');
    const ctxDesempenhoVendedores = document.getElementById('desempenhoVendedoresChart').getContext('2d');
    const ctxVendasCategoria = document.getElementById('vendasCategoriaChart').getContext('2d');

    vendasServicoChart = new Chart(ctxVendasServico, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Vendas',
                data: [],
                backgroundColor: 'rgba(79, 70, 229, 0.6)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    display: true,
                    position: 'bottom',
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuad'
            }
        }
    });

    desempenhoVendedoresChart = new Chart(ctxDesempenhoVendedores, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Vendas',
                data: [],
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    display: true,
                    position: 'bottom',
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuad'
            }
        }
    });

    vendasCategoriaChart = new Chart(ctxVendasCategoria, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                label: 'Vendas',
                data: [],
                backgroundColor: [
                    'rgba(79, 70, 229, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(34, 197, 94, 0.6)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    display: true,
                    position: 'bottom',
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuad'
            }
        }
    });

    atualizarDashboard(); // Atualiza os gráficos com os dados iniciais
}

// Função para registrar venda
document.getElementById('vendaForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const vendedorId = document.getElementById('vendedorVenda').value;
    const servicoId = document.getElementById('servicoVenda').value;
    const dataVenda = document.getElementById('dataVenda').value;
    const nomeCliente = document.getElementById('nomeCliente').value;
    const empresaParceiraId = document.getElementById('empresaParceira').value;
    const valorVenda = parseFloat(document.getElementById('valorVenda').value.replace(/[^0-9,]/g, '').replace(',', '.'));
    const valorReceber = parseFloat(document.getElementById('valorReceber').value.replace(/[^0-9,]/g, '').replace(',', '.'));
    const comissao = parseFloat(document.getElementById('comissao').value.replace(/[^0-9,]/g, '').replace(',', '.'));

    const vendedor = dados.vendedores.find(v => v.id == vendedorId);
    const servico = dados.servicos.find(s => s.id == servicoId);
    const empresaParceira = dados.empresasParceiras.find(e => e.id == empresaParceiraId);

    if (!vendedor || !servico || !empresaParceira) {
        alert('Por favor, selecione um vendedor, serviço e empresa parceira válidos.');
        return;
    }

    const novaVenda = {
        id: dados.vendas.length + 1,
        vendedor: vendedor.nome,
        servico: servico.nome,
        data: dataVenda,
        nomeCliente: nomeCliente,
        empresaParceira: empresaParceira.nome,
        valorVenda: valorVenda,
        valorReceber: valorReceber,
        comissao: comissao,
        tipoComissao: servico.tipoComissao
    };

    dados.vendas.push(novaVenda);
    alert('Venda registrada com sucesso!');
    limparCamposVenda();

    // Atualizar o dashboard após registrar a venda
    atualizarDashboard();
    listarVendas();
});

// Função para limpar os campos do formulário de venda
function limparCamposVenda() {
    document.getElementById('vendedorVenda').value = '';
    document.getElementById('servicoVenda').value = '';
    document.getElementById('dataVenda').value = '';
    document.getElementById('nomeCliente').value = '';
    document.getElementById('empresaParceira').value = '';
    document.getElementById('valorVenda').value = '';
    document.getElementById('valorReceber').value = '';
    document.getElementById('comissao').value = '';
    document.getElementById('tipoComissaoInfo').textContent = '';
}

// Função para listar as vendas
function listarVendas(vendas = dados.vendas) {
    const tbody = document.querySelector('#tabelaVendas tbody');
    tbody.innerHTML = '';

    const itensPorPagina = parseInt(document.getElementById('itensPorPaginaVendas').value);
    const inicio = (paginaAtualVendas - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const vendasPaginadas = vendas.slice(inicio, fim);

    vendasPaginadas.forEach(venda => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${venda.data}</td>
            <td>${venda.vendedor}</td>
            <td>${venda.servico}</td>
            <td>${venda.nomeCliente}</td>
            <td>${venda.empresaParceira}</td>
            <td>${venda.valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${venda.valorReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${venda.comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editarVenda(${venda.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="excluirVenda(${venda.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Atualizar controles de paginação
    const totalPaginas = Math.ceil(vendas.length / itensPorPagina);
    document.getElementById('controlesPaginacaoVendas').innerHTML = `
        <button class="btn btn-secondary" onclick="mudarPaginaVendas(-1)" ${paginaAtualVendas === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${paginaAtualVendas} de ${totalPaginas}</span>
        <button class="btn btn-secondary" onclick="mudarPaginaVendas(1)" ${paginaAtualVendas === totalPaginas ? 'disabled' : ''}>Próxima</button>
    `;
}

// Função para mudar a página de vendas
function mudarPaginaVendas(direcao) {
    paginaAtualVendas += direcao;
    listarVendas();
}

// Função para filtrar as vendas por período
function filtrarVendas() {
    const dataInicial = document.getElementById('filtroDataInicial').value;
    const dataFinal = document.getElementById('filtroDataFinal').value;

    const dataInicialObj = dataInicial ? new Date(dataInicial.split('/').reverse().join('-')) : null;
    const dataFinalObj = dataFinal ? new Date(dataFinal.split('/').reverse().join('-')) : null;

    const vendasFiltradas = dados.vendas.filter(venda => {
        const dataVendaObj = new Date(venda.data.split('/').reverse().join('-'));

        const filtroData = (!dataInicialObj || dataVendaObj >= dataInicialObj) &&
                           (!dataFinalObj || dataVendaObj <= dataFinalObj);

        return filtroData;
    });

    listarVendas(vendasFiltradas);
}

// Função para editar uma venda
function editarVenda(id) {
    const venda = dados.vendas.find(v => v.id === id);
    if (venda) {
        const tbody = document.querySelector('#tabelaVendas tbody');
        tbody.innerHTML = '';

        dados.vendas.forEach(v => {
            const row = document.createElement('tr');
            if (v.id === id) {
                row.innerHTML = `
                    <td><input type="text" value="${v.data}" oninput="formatarDataInput(this)"></td>
                    <td><input type="text" value="${v.vendedor}"></td>
                    <td><input type="text" value="${v.servico}"></td>
                    <td><input type="text" value="${v.nomeCliente}"></td>
                    <td><input type="text" value="${v.empresaParceira}"></td>
                    <td><input type="text" value="${v.valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}" oninput="formatarMoeda(this)"></td>
                    <td><input type="text" value="${v.valorReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}" oninput="formatarMoeda(this)"></td>
                    <td><input type="text" value="${v.comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}" oninput="formatarComissao(this)"></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="salvarEdicaoVenda(${v.id})">Salvar</button>
                        <button class="btn btn-sm btn-danger" onclick="cancelarEdicaoVenda()">Cancelar</button>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>${v.data}</td>
                    <td>${v.vendedor}</td>
                    <td>${v.servico}</td>
                    <td>${v.nomeCliente}</td>
                    <td>${v.empresaParceira}</td>
                    <td>${v.valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>${v.valorReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>${v.comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="editarVenda(${v.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="excluirVenda(${v.id})">Excluir</button>
                    </td>
                `;
            }
            tbody.appendChild(row);
        });
    }
}

// Função para salvar a edição de uma venda
function salvarEdicaoVenda(id) {
    const venda = dados.vendas.find(v => v.id === id);
    if (venda) {
        const row = document.querySelector(`#tabelaVendas tbody tr:nth-child(${dados.vendas.indexOf(venda) + 1})`);
        venda.data = row.querySelector('td:nth-child(1) input').value;
        venda.vendedor = row.querySelector('td:nth-child(2) input').value;
        venda.servico = row.querySelector('td:nth-child(3) input').value;
        venda.nomeCliente = row.querySelector('td:nth-child(4) input').value;
        venda.empresaParceira = row.querySelector('td:nth-child(5) input').value;
        venda.valorVenda = parseFloat(row.querySelector('td:nth-child(6) input').value.replace(/[^0-9,]/g, '').replace(',', '.'));
        venda.valorReceber = parseFloat(row.querySelector('td:nth-child(7) input').value.replace(/[^0-9,]/g, '').replace(',', '.'));
        venda.comissao = parseFloat(row.querySelector('td:nth-child(8) input').value.replace(/[^0-9,]/g, '').replace(',', '.'));

        listarVendas();
        alert('Venda atualizada com sucesso!');
    }
}

// Função para cancelar a edição de uma venda
function cancelarEdicaoVenda() {
    listarVendas();
}

// Função para excluir uma venda
function excluirVenda(id) {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
        dados.vendas = dados.vendas.filter(v => v.id !== id);
        listarVendas();
        alert('Venda excluída com sucesso!');
    }
}
