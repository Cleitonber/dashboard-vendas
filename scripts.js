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
    const form = document.getElementById('vendedorForm');
    form.querySelector('button[type="submit"]').textContent = 'Cadastrar Vendedor';
    form.onsubmit = function(e) {
        e.preventDefault();
        cadastrarVendedor();
    };
}

// Função para atualizar a lista de vendedores
function atualizarListaVendedores() {
    const listaVendedores = document.getElementById('vendedoresList');
    listaVendedores.innerHTML = '';

    dados.vendedores.forEach(vendedor => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${vendedor.nome} - ${vendedor.email} - ${vendedor.telefone}</span>
            <button class="btn btn-sm btn-secondary" onclick="editarVendedor(${vendedor.id})">Editar</button>
        `;
        listaVendedores.appendChild(item);
    });
}

// Função para editar vendedor
function editarVendedor(id) {
    const vendedor = dados.vendedores.find(v => v.id === id);
    if (vendedor) {
        document.getElementById('nomeVendedor').value = vendedor.nome;
        document.getElementById('emailVendedor').value = vendedor.email;
        document.getElementById('telefoneVendedor').value = vendedor.telefone;

        // Alterar o botão de cadastrar para "Atualizar"
        const form = document.getElementById('vendedorForm');
        form.querySelector('button[type="submit"]').textContent = 'Atualizar Vendedor';
        form.onsubmit = function(e) {
            e.preventDefault();
            atualizarVendedor(id);
        };
    }
}

// Função para atualizar vendedor
function atualizarVendedor(id) {
    const nome = document.getElementById('nomeVendedor').value;
    const email = document.getElementById('emailVendedor').value;
    const telefone = document.getElementById('telefoneVendedor').value;

    const vendedor = dados.vendedores.find(v => v.id === id);
    if (vendedor) {
        vendedor.nome = nome;
        vendedor.email = email;
        vendedor.telefone = telefone;
        salvarDados();
        alert('Vendedor atualizado com sucesso!');
        limparCamposVendedor();
        atualizarListaVendedores();
    }
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
    const form = document.getElementById('servicoForm');
    form.querySelector('button[type="submit"]').textContent = 'Cadastrar Serviço';
    form.onsubmit = function(e) {
        e.preventDefault();
        cadastrarServico();
    };
}

// Função para atualizar a lista de serviços
function atualizarListaServicos() {
    const listaServicos = document.getElementById('servicosList');
    listaServicos.innerHTML = '';

    dados.servicos.forEach(servico => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${servico.nome} - ${servico.categoria} - ${servico.tipoComissao}</span>
            <button class="btn btn-sm btn-secondary" onclick="editarServico(${servico.id})">Editar</button>
        `;
        listaServicos.appendChild(item);
    });
}

// Função para editar serviço
function editarServico(id) {
    const servico = dados.servicos.find(s => s.id === id);
    if (servico) {
        document.getElementById('nomeServico').value = servico.nome;
        document.getElementById('categoriaServico').value = servico.categoria;
        document.getElementById('tipoComissao').value = servico.tipoComissao;

        // Alterar o botão de cadastrar para "Atualizar"
        const form = document.getElementById('servicoForm');
        form.querySelector('button[type="submit"]').textContent = 'Atualizar Serviço';
        form.onsubmit = function(e) {
            e.preventDefault();
            atualizarServico(id);
        };
    }
}

// Função para atualizar serviço
function atualizarServico(id) {
    const nome = document.getElementById('nomeServico').value;
    const categoria = document.getElementById('categoriaServico').value;
    const tipoComissao = document.getElementById('tipoComissao').value;

    const servico = dados.servicos.find(s => s.id === id);
    if (servico) {
        servico.nome = nome;
        servico.categoria = categoria;
        servico.tipoComissao = tipoComissao;
        salvarDados();
        alert('Serviço atualizado com sucesso!');
        limparCamposServico();
        atualizarListaServicos();
    }
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
    const form = document.getElementById('empresaForm');
    form.querySelector('button[type="submit"]').textContent = 'Cadastrar Empresa';
    form.onsubmit = function(e) {
        e.preventDefault();
        cadastrarEmpresa();
    };
}

// Função para atualizar a lista de empresas
function atualizarListaEmpresas() {
    const listaEmpresas = document.getElementById('empresasList');
    listaEmpresas.innerHTML = '';

    dados.empresasParceiras.forEach(empresa => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${empresa.nome}</span>
            <button class="btn btn-sm btn-secondary" onclick="editarEmpresa(${empresa.id})">Editar</button>
        `;
        listaEmpresas.appendChild(item);
    });
}

// Função para editar empresa
function editarEmpresa(id) {
    const empresa = dados.empresasParceiras.find(e => e.id === id);
    if (empresa) {
        document.getElementById('nomeEmpresa').value = empresa.nome;

        // Alterar o botão de cadastrar para "Atualizar"
        const form = document.getElementById('empresaForm');
        form.querySelector('button[type="submit"]').textContent = 'Atualizar Empresa';
        form.onsubmit = function(e) {
            e.preventDefault();
            atualizarEmpresa(id);
        };
    }
}

// Função para atualizar empresa
function atualizarEmpresa(id) {
    const nome = document.getElementById('nomeEmpresa').value;

    const empresa = dados.empresasParceiras.find(e => e.id === id);
    if (empresa) {
        empresa.nome = nome;
        salvarDados();
        alert('Empresa atualizada com sucesso!');
        limparCamposEmpresa();
        atualizarListaEmpresas();
    }
}

// Função para atualizar o filtro de vendedores na aba de relatórios
function atualizarFiltroVendedores() {
    const filtroVendedor = document.getElementById('filtroVendedor');
    filtroVendedor.innerHTML = '<option value="">Todos</option>'; // Opção padrão

    dados.vendedores.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor.id;
        option.textContent = vendedor.nome;
        filtroVendedor.appendChild(option);
    });
}

// Função para filtrar o relatório
function filtrarRelatorio() {
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    const vendedorId = document.getElementById('filtroVendedor').value;
    const colunasSelecionadas = Array.from(document.getElementById('filtroColunas').selectedOptions).map(option => option.value);

    // Converter datas para o formato DD/MM/AAAA
    const dataInicialFormatada = dataInicial ? formatarDataParaComparacao(dataInicial) : null;
    const dataFinalFormatada = dataFinal ? formatarDataParaComparacao(dataFinal) : null;

    // Filtrar vendas
    const vendasFiltradas = dados.vendas.filter(venda => {
        const dataVenda = formatarDataParaComparacao(venda.data);

        // Filtro por data
        const dentroDoPeriodo = (!dataInicialFormatada || dataVenda >= dataInicialFormatada) &&
                                (!dataFinalFormatada || dataVenda <= dataFinalFormatada);

        // Filtro por vendedor
        const vendedorSelecionado = !vendedorId || venda.vendedor === dados.vendedores.find(v => v.id == vendedorId).nome;

        return dentroDoPeriodo && vendedorSelecionado;
    });

    // Gerar relatório com as colunas selecionadas
    gerarTabelaRelatorio(vendasFiltradas, colunasSelecionadas);
}

// Função para formatar data para comparação
function formatarDataParaComparacao(data) {
    const [dia, mes, ano] = data.split('/');
    return new Date(`${ano}-${mes}-${dia}`);
}

// Função para gerar a tabela de relatório
function gerarTabelaRelatorio(vendas, colunas) {
    const tabelaRelatorio = document.getElementById('tabelaRelatorio');
    const thead = tabelaRelatorio.querySelector('thead');
    const tbody = tabelaRelatorio.querySelector('tbody');
    const tfoot = tabelaRelatorio.querySelector('tfoot');

    // Limpar tabela
    thead.innerHTML = '';
    tbody.innerHTML = '';
    tfoot.innerHTML = '';

    // Criar cabeçalho da tabela
    const headerRow = document.createElement('tr');
    colunas.forEach(coluna => {
        const th = document.createElement('th');
        th.textContent = coluna
            .replace('data', 'Data da Venda')
            .replace('vendedor', 'Vendedor')
            .replace('servico', 'Serviço')
            .replace('tipoComissao', 'Tipo de Comissão')
            .replace('nomeCliente', 'Cliente')
            .replace('empresaParceira', 'Empresa Parceira')
            .replace('comissao', 'Comissão')
            .replace('percentualComissao', 'Percentual da Comissão')
            .replace('valorBrutoReceber', 'Valor Bruto a Receber');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Preencher corpo da tabela
    vendas.forEach(venda => {
        const row = document.createElement('tr');
        colunas.forEach(coluna => {
            const td = document.createElement('td');
            switch (coluna) {
                case 'data':
                    td.textContent = venda.data;
                    break;
                case 'vendedor':
                    td.textContent = venda.vendedor;
                    break;
                case 'servico':
                    td.textContent = venda.servico;
                    break;
                case 'tipoComissao':
                    td.textContent = venda.tipoComissao;
                    break;
                case 'nomeCliente':
                    td.textContent = venda.nomeCliente;
                    break;
                case 'empresaParceira':
                    td.textContent = venda.empresaParceira;
                    break;
                case 'comissao':
                    td.textContent = venda.comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    break;
                case 'percentualComissao':
                    const percentual = (venda.comissao / venda.valorVenda * 100).toFixed(2);
                    td.textContent = `${percentual}%`;
                    break;
                case 'valorBrutoReceber':
                    td.textContent = venda.valorReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    break;
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    // Adicionar rodapé com totais
    const totalVendas = vendas.reduce((total, venda) => total + venda.valorVenda, 0);
    const totalComissoes = vendas.reduce((total, venda) => total + venda.comissao, 0);
    const totalReceber = vendas.reduce((total, venda) => total + venda.valorReceber, 0);

    const footerRow = document.createElement('tr');
    colunas.forEach(coluna => {
        const td = document.createElement('td');
        switch (coluna) {
            case 'data':
                td.textContent = 'Total';
                break;
            case 'comissao':
                td.textContent = totalComissoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                break;
            case 'valorBrutoReceber':
                td.textContent = totalReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                break;
            default:
                td.textContent = '';
        }
        footerRow.appendChild(td);
    });
    tfoot.appendChild(footerRow);
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
    atualizarFiltroVendedores(); // Atualiza o filtro de vendedores na aba de relatórios
}

// Event Listener para quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarAplicativo);
