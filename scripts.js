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

// Função para carregar dados iniciais (mock)
function carregarDadosIniciais() {
    dados.vendedores = [
        { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-9999' },
        { id: 2, nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 88888-8888' },
        { id: 3, nome: 'Pedro Oliveira', email: 'pedro@email.com', telefone: '(11) 77777-7777' }
    ];

    dados.servicos = [
        { id: 1, nome: 'Consultoria', categoria: 'Serviços Profissionais', tipoComissao: 'fixa' },
        { id: 2, nome: 'Treinamento', categoria: 'Educação', tipoComissao: 'porcentagem' },
        { id: 3, nome: 'Suporte Técnico', categoria: 'TI', tipoComissao: 'porcentagem' }
    ];

    dados.empresasParceiras = [
        { id: 1, nome: 'Empresa A' },
        { id: 2, nome: 'Empresa B' },
        { id: 3, nome: 'Empresa C' }
    ];
}

// Função para salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('dadosVendas', JSON.stringify(dados));
}

// Função para carregar dados do localStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem('dadosVendas');
    if (dadosSalvos) {
        dados = JSON.parse(dadosSalvos);
    }
}

// Função para preencher o seletor de anos
function preencherAnos() {
    const selectAno = document.getElementById('anoFiltro');
    if (!selectAno) {
        console.error('Elemento com id="anoFiltro" não encontrado!');
        return;
    }

    selectAno.innerHTML = ''; // Limpa as opções existentes

    // Obter o ano atual
    const anoAtual = new Date().getFullYear();

    // Extrair anos únicos das vendas
    let anosUnicos = [anoAtual]; // Inicializa com o ano atual
    
    if (dados.vendas.length > 0) {
        const anosVendas = dados.vendas.map(venda => {
            const [dia, mes, ano] = venda.data.split('/').map(Number);
            return ano;
        });
        // Adiciona anos das vendas sem duplicatas
        anosUnicos = [...new Set([...anosUnicos, ...anosVendas])];
    }

    // Ordenar os anos do mais recente para o mais antigo
    anosUnicos.sort((a, b) => b - a);

    // Adicionar opções ao seletor
    anosUnicos.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        selectAno.appendChild(option);
    });

    // Selecionar o ano atual por padrão
    selectAno.value = anoAtual;
}

// Função para atualizar o dashboard
function atualizarDashboard() {
    const mesSelecionado = parseInt(document.getElementById('mesFiltro').value);
    const anoSelecionado = parseInt(document.getElementById('anoFiltro').value);

    const vendasFiltradas = dados.vendas.filter(venda => {
        const [dia, mes, ano] = venda.data.split('/').map(Number);
        return mes === mesSelecionado + 1 && ano === anoSelecionado;
    });

    // Atualizar gráficos
    atualizarGraficos(vendasFiltradas);

    // Atualizar estatísticas
    const totalVendas = vendasFiltradas.reduce((total, venda) => total + venda.valorVenda, 0);
    const totalComissoes = vendasFiltradas.reduce((total, venda) => total + venda.comissao, 0);
    const totalClientes = [...new Set(vendasFiltradas.map(venda => venda.nomeCliente))].length;
    const ticketMedio = vendasFiltradas.length > 0 ? totalVendas / vendasFiltradas.length : 0;

    document.getElementById('totalVendasDash').textContent = totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('totalComissoesDash').textContent = totalComissoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('totalClientes').textContent = totalClientes;
    document.getElementById('ticketMedio').textContent = ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para atualizar os gráficos
function atualizarGraficos(vendasFiltradas) {
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

// Função para formatar a data no input
function formatarDataInput(input) {
    let valor = input.value;
    if (valor.includes('-')) { // Se estiver no formato YYYY-MM-DD
        const [ano, mes, dia] = valor.split('-');
        input.value = `${dia}/${mes}/${ano}`;
    } else {
        valor = valor.replace(/\D/g, ''); // Remove tudo que não for número
        if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d{0,2})/, '$1/$2'); // Adiciona barra após o dia
        }
        if (valor.length > 5) {
            valor = valor.replace(/^(\d{2})\/(\d{2})(\d{0,4})/, '$1/$2/$3'); // Adiciona barra após o mês
        }
        input.value = valor;
    }
}

// Função para formatar número de telefone
function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não for número
    
    // Limita o tamanho máximo para 11 dígitos (com DDD)
    valor = valor.slice(0, 11);
    
    // Aplica a máscara conforme a quantidade de dígitos
    if (valor.length > 2) {
        valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    }
    if (valor.length > 9) {
        valor = `${valor.slice(0, 9)}-${valor.slice(9)}`;
    }
    
    input.value = valor;
}

// Função para atualizar as opções de vendedores no formulário de vendas
function atualizarOpcoesVendedores() {
    const selectVendedor = document.getElementById('vendedorVenda');
    selectVendedor.innerHTML = '<option value="">Selecione um vendedor</option>';
    dados.vendedores.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor.id;
        option.textContent = vendedor.nome;
        selectVendedor.appendChild(option);
    });
}

// Função para atualizar as opções de serviços no formulário de vendas
function atualizarOpcoesServicos() {
    const selectServico = document.getElementById('servicoVenda');
    selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
    dados.servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id;
        option.textContent = servico.nome;
        selectServico.appendChild(option);
    });
}

// Função para atualizar as opções de empresas no formulário de vendas
function atualizarOpcoesEmpresas() {
    const selectEmpresa = document.getElementById('empresaParceira');
    selectEmpresa.innerHTML = '<option value="">Selecione uma empresa parceira</option>';
    dados.empresasParceiras.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa.id;
        option.textContent = empresa.nome;
        selectEmpresa.appendChild(option);
    });
}

// Função para atualizar o tipo de comissão ao selecionar um serviço
function atualizarTipoComissao() {
    const servicoId = document.getElementById('servicoVenda').value;
    const servico = dados.servicos.find(s => s.id == servicoId);
    const tipoComissaoInfo = document.getElementById('tipoComissaoInfo');
    const comissaoInput = document.getElementById('comissao');

    if (servico) {
        tipoComissaoInfo.textContent = `Tipo de Comissão: ${servico.tipoComissao}`;
        if (servico.tipoComissao === 'fixa') {
            comissaoInput.placeholder = 'R$ 0,00';
            comissaoInput.oninput = function() { formatarMoeda(this); };
        } else if (servico.tipoComissao === 'porcentagem') {
            comissaoInput.placeholder = '0,00%';
            comissaoInput.oninput = function() { formatarPorcentagem(this); };
        }
    } else {
        tipoComissaoInfo.textContent = '';
        comissaoInput.placeholder = '0,00';
        comissaoInput.oninput = null;
    }
}

// Função para formatar o valor da comissão como moeda
function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não for número
    valor = (Number(valor) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    input.value = valor;
}

// Função para formatar o valor da comissão como porcentagem
function formatarPorcentagem(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não for número
    valor = (Number(valor) / 100).toFixed(2) + '%';
    input.value = valor;
}

// Função para registrar venda
document.getElementById('vendaForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Converter a data de YYYY-MM-DD para DD/MM/YYYY
    let dataVenda = document.getElementById('dataVenda').value;
    if (dataVenda.includes('-')) {
        const [ano, mes, dia] = dataVenda.split('-');
        dataVenda = `${dia}/${mes}/${ano}`;
    }

    const vendedorId = document.getElementById('vendedorVenda').value;
    const servicoId = document.getElementById('servicoVenda').value;
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
    salvarDados(); // Salva os dados no localStorage
    alert('Venda registrada com sucesso!');
    limparCamposVenda();

    // Atualizar tudo que depende dos dados de vendas
    preencherAnos();
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

// Função para cadastrar vendedor
document.getElementById('vendedorForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const nomeVendedor = document.getElementById('nomeVendedor').value;
    const emailVendedor = document.getElementById('emailVendedor').value;
    const telefoneVendedor = document.getElementById('telefoneVendedor').value;

    const novoVendedor = {
        id: dados.vendedores.length + 1,
        nome: nomeVendedor,
        email: emailVendedor,
        telefone: telefoneVendedor
    };

    dados.vendedores.push(novoVendedor);
    salvarDados(); // Salva os dados no localStorage
    alert('Vendedor cadastrado com sucesso!');
    limparCamposVendedor();
    atualizarOpcoesVendedores();
    atualizarListaVendedores();
});

// Função para limpar campos do formulário de vendedor
function limparCamposVendedor() {
    document.getElementById('nomeVendedor').value = '';
    document.getElementById('emailVendedor').value = '';
    document.getElementById('telefoneVendedor').value = '';
}

// Função para atualizar a lista de vendedores
function atualizarListaVendedores() {
    const listaVendedores = document.getElementById('vendedoresList');
    const itensPorPagina = parseInt(document.getElementById('itensPorPaginaVendedores').value);
    const vendedoresPaginados = paginarItens(dados.vendedores, itensPorPagina, paginaAtualVendedores);

    listaVendedores.innerHTML = '';

    vendedoresPaginados.forEach(vendedor => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div class="vendedor-info" id="vendedor-view-${vendedor.id}">
                <input type="checkbox" class="form-check-input" value="${vendedor.id}">
                <span contenteditable="true" class="editable" data-field="nome">${vendedor.nome}</span> - 
                <span contenteditable="true" class="editable" data-field="email">${vendedor.email}</span> - 
                <span contenteditable="true" class="editable" data-field="telefone">${vendedor.telefone}</span>
                <button class="btn btn-sm btn-secondary" onclick="salvarEdicaoVendedor(${vendedor.id})">Salvar</button>
                <button class="btn btn-sm btn-danger" onclick="excluirVendedor(${vendedor.id})">Excluir</button>
            </div>
        `;
        listaVendedores.appendChild(item);
    });

    // Controles de paginação
    const totalPaginas = Math.ceil(dados.vendedores.length / itensPorPagina);
    const controlesPaginacao = document.getElementById('controlesPaginacaoVendedores');
    controlesPaginacao.innerHTML = `
        <button class="btn btn-secondary" onclick="mudarPaginaVendedores(-1)" ${paginaAtualVendedores === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${paginaAtualVendedores} de ${totalPaginas}</span>
        <button class="btn btn-secondary" onclick="mudarPaginaVendedores(1)" ${paginaAtualVendedores === totalPaginas ? 'disabled' : ''}>Próxima</button>
        <button class="btn btn-danger" onclick="excluirVendedoresSelecionados()">Excluir Selecionados</button>
    `;
}

function mudarPaginaVendedores(direcao) {
    const totalPaginas = Math.ceil(dados.vendedores.length / parseInt(document.getElementById('itensPorPaginaVendedores').value));
    const novaPagina = paginaAtualVendedores + direcao;

    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        paginaAtualVendedores = novaPagina;
        atualizarListaVendedores();
    }
}

function salvarEdicaoVendedor(id) {
    const vendedor = dados.vendedores.find(v => v.id === id);
    if (vendedor) {
        const nome = document.querySelector(`#vendedor-view-${id} [data-field="nome"]`).textContent;
        const email = document.querySelector(`#vendedor-view-${id} [data-field="email"]`).textContent;
        const telefone = document.querySelector(`#vendedor-view-${id} [data-field="telefone"]`).textContent;

        vendedor.nome = nome;
        vendedor.email = email;
        vendedor.telefone = telefone;
        salvarDados();
        alert('Vendedor atualizado com sucesso!');
    }
}

function excluirVendedor(id) {
    dados.vendedores = dados.vendedores.filter(v => v.id !== id);
    salvarDados();
    atualizarListaVendedores();
    atualizarOpcoesVendedores();
}

function excluirVendedoresSelecionados() {
    const checkboxes = document.querySelectorAll('#vendedoresList .form-check-input:checked');
    const ids = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
    
    dados.vendedores = dados.vendedores.filter(v => !ids.includes(v.id));
    salvarDados();
    atualizarListaVendedores();
}

// Função para cadastrar serviço
document.getElementById('servicoForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const nomeServico = document.getElementById('nomeServico').value;
    const categoriaServico = document.getElementById('categoriaServico').value;
    const tipoComissao = document.getElementById('tipoComissao').value;

    const novoServico = {
        id: dados.servicos.length + 1,
        nome: nomeServico,
        categoria: categoriaServico,
        tipoComissao: tipoComissao
    };

    dados.servicos.push(novoServico);
    salvarDados(); // Salva os dados no localStorage
    alert('Serviço cadastrado com sucesso!');
    limparCamposServico();
    atualizarOpcoesServicos();
    atualizarListaServicos();
});

// Função para limpar campos do formulário de serviço
function limparCamposServico() {
    document.getElementById('nomeServico').value = '';
    document.getElementById('categoriaServico').value = '';
    document.getElementById('tipoComissao').value = 'fixa';
}

// Função para atualizar a lista de serviços
function atualizarListaServicos() {
    const listaServicos = document.getElementById('servicosList');
    const itensPorPagina = parseInt(document.getElementById('itensPorPaginaServicos').value);
    const servicosPaginados = paginarItens(dados.servicos, itensPorPagina, paginaAtualServicos);

    listaServicos.innerHTML = '';

    servicosPaginados.forEach(servico => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div class="servico-info" id="servico-view-${servico.id}">
                <input type="checkbox" class="form-check-input" value="${servico.id}">
                <span contenteditable="true" class="editable" data-field="nome">${servico.nome}</span> - 
                <span contenteditable="true" class="editable" data-field="categoria">${servico.categoria}</span> - 
                <span contenteditable="true" class="editable" data-field="tipoComissao">${servico.tipoComissao}</span>
                <button class="btn btn-sm btn-secondary" onclick="salvarEdicaoServico(${servico.id})">Salvar</button>
                <button class="btn btn-sm btn-danger" onclick="excluirServico(${servico.id})">Excluir</button>
            </div>
        `;
        listaServicos.appendChild(item);
    });

    // Controles de paginação
    const totalPaginas = Math.ceil(dados.servicos.length / itensPorPagina);
    const controlesPaginacao = document.getElementById('controlesPaginacaoServicos');
    controlesPaginacao.innerHTML = `
        <button class="btn btn-secondary" onclick="mudarPaginaServicos(-1)" ${paginaAtualServicos === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${paginaAtualServicos} de ${totalPaginas}</span>
        <button class="btn btn-secondary" onclick="mudarPaginaServicos(1)" ${paginaAtualServicos === totalPaginas ? 'disabled' : ''}>Próxima</button>
        <button class="btn btn-danger" onclick="excluirServicosSelecionados()">Excluir Selecionados</button>
    `;
}

function mudarPaginaServicos(direcao) {
    const totalPaginas = Math.ceil(dados.servicos.length / parseInt(document.getElementById('itensPorPaginaServicos').value));
    const novaPagina = paginaAtualServicos + direcao;

    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        paginaAtualServicos = novaPagina;
        atualizarListaServicos();
    }
}

function salvarEdicaoServico(id) {
    const servico = dados.servicos.find(s => s.id === id);
    if (servico) {
        const nome = document.querySelector(`#servico-view-${id} [data-field="nome"]`).textContent;
        const categoria = document.querySelector(`#servico-view-${id} [data-field="categoria"]`).textContent;
        const tipoComissao = document.querySelector(`#servico-view-${id} [data-field="tipoComissao"]`).textContent;

        servico.nome = nome;
        servico.categoria = categoria;
        servico.tipoComissao = tipoComissao;
        salvarDados();
        alert('Serviço atualizado com sucesso!');
    }
}

function excluirServico(id) {
    dados.servicos = dados.servicos.filter(s => s.id !== id);
    salvarDados();
    atualizarListaServicos();
    atualizarOpcoesServicos();
}

function excluirServicosSelecionados() {
    const checkboxes = document.querySelectorAll('#servicosList .form-check-input:checked');
    const ids = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
    
    dados.servicos = dados.servicos.filter(s => !ids.includes(s.id));
    salvarDados();
    atualizarListaServicos();
}

// Função para cadastrar empresa parceira
document.getElementById('empresaForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const nomeEmpresa = document.getElementById('nomeEmpresa').value;

    const novaEmpresa = {
        id: dados.empresasParceiras.length + 1,
        nome: nomeEmpresa
    };

    dados.empresasParceiras.push(novaEmpresa);
    salvarDados(); // Salva os dados no localStorage
    alert('Empresa cadastrada com sucesso!');
    limparCamposEmpresa();
    atualizarOpcoesEmpresas();
    atualizarListaEmpresas();
});

// Função para limpar campos do formulário de empresa
function limparCamposEmpresa() {
    document.getElementById('nomeEmpresa').value = '';
}

// Função para atualizar a lista de empresas
function atualizarListaEmpresas() {
    const listaEmpresas = document.getElementById('empresasList');
    const itensPorPagina = parseInt(document.getElementById('itensPorPaginaEmpresas').value);
    const empresasPaginadas = paginarItens(dados.empresasParceiras, itensPorPagina, paginaAtualEmpresas);

    listaEmpresas.innerHTML = '';

    empresasPaginadas.forEach(empresa => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div class="empresa-info" id="empresa-view-${empresa.id}">
                <input type="checkbox" class="form-check-input" value="${empresa.id}">
                <span contenteditable="true" class="editable" data-field="nome">${empresa.nome}</span>
                <button class="btn btn-sm btn-secondary" onclick="salvarEdicaoEmpresa(${empresa.id})">Salvar</button>
                <button class="btn btn-sm btn-danger" onclick="excluirEmpresa(${empresa.id})">Excluir</button>
            </div>
        `;
        listaEmpresas.appendChild(item);
    });

    // Controles de paginação
    const totalPaginas = Math.ceil(dados.empresasParceiras.length / itensPorPagina);
    const controlesPaginacao = document.getElementById('controlesPaginacaoEmpresas');
    controlesPaginacao.innerHTML = `
        <button class="btn btn-secondary" onclick="mudarPaginaEmpresas(-1)" ${paginaAtualEmpresas === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${paginaAtualEmpresas} de ${totalPaginas}</span>
        <button class="btn btn-secondary" onclick="mudarPaginaEmpresas(1)" ${paginaAtualEmpresas === totalPaginas ? 'disabled' : ''}>Próxima</button>
        <button class="btn btn-danger" onclick="excluirEmpresasSelecionadas()">Excluir Selecionadas</button>
    `;
}

function mudarPaginaEmpresas(direcao) {
    const totalPaginas = Math.ceil(dados.empresasParceiras.length / parseInt(document.getElementById('itensPorPaginaEmpresas').value));
    const novaPagina = paginaAtualEmpresas + direcao;

    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        paginaAtualEmpresas = novaPagina;
        atualizarListaEmpresas();
    }
}

function salvarEdicaoEmpresa(id) {
    const empresa = dados.empresasParceiras.find(e => e.id === id);
    if (empresa) {
        const nome = document.querySelector(`#empresa-view-${id} [data-field="nome"]`).textContent;
        empresa.nome = nome;
        salvarDados();
        alert('Empresa atualizada com sucesso!');
    }
}

function excluirEmpresa(id) {
    dados.empresasParceiras = dados.empresasParceiras.filter(e => e.id !== id);
    salvarDados();
    atualizarListaEmpresas();
    atualizarOpcoesEmpresas();
}

function excluirEmpresasSelecionadas() {
    const checkboxes = document.querySelectorAll('#empresasList .form-check-input:checked');
    const ids = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
    
    dados.empresasParceiras = dados.empresasParceiras.filter(e => !ids.includes(e.id));
    salvarDados();
    atualizarListaEmpresas();
}

// Função para paginar itens
function paginarItens(lista, itensPorPagina, paginaAtual) {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return lista.slice(inicio, fim);
}

// Inicialização do aplicativo
function inicializarAplicativo() {
    carregarDadosIniciais();
    carregarDados();
    showTab('dashboard');
    preencherAnos();
    atualizarOpcoesVendedores();
    atualizarOpcoesServicos();
    atualizarOpcoesEmpresas();
    inicializarGraficos();
    atualizarListaVendedores();
    atualizarListaServicos();
    atualizarListaEmpresas();
}

// Event Listener para quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarAplicativo);
