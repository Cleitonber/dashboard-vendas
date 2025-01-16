const { jsPDF } = window.jspdf;

let dados = {
    vendas: [],
    vendedores: [],
    servicos: [],
    empresasParceiras: []
};

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
    atualizarOpcoesVendedores();
    atualizarOpcoesServicos();
    atualizarOpcoesEmpresas();
});

// Função para atualizar as opções de vendedores
function atualizarOpcoesVendedores() {
    const selectVendedor = document.getElementById('vendedorVenda');
    selectVendedor.innerHTML = '<option value="">Selecione um vendedor</option>';
    dados.vendedores.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor.id;
        option.textContent = vendedor.nome;
        selectVendedor.appendChild(option);
    });

    const filtroVendedor = document.getElementById('filtroVendedor');
    filtroVendedor.innerHTML = '<option value="">Todos</option>';
    dados.vendedores.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor.id;
        option.textContent = vendedor.nome;
        filtroVendedor.appendChild(option);
    });
}

// Função para atualizar as opções de serviços
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

// Função para atualizar as opções de empresas parceiras
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
    atualizarListaVendedores();
    atualizarOpcoesVendedores();
    alert('Vendedor cadastrado com sucesso!');
});

// Função para atualizar a lista de vendedores
function atualizarListaVendedores() {
    const listaVendedores = document.getElementById('vendedoresList');
    listaVendedores.innerHTML = '';

    dados.vendedores.forEach(vendedor => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${vendedor.nome}</strong><br>
                    <small>${vendedor.email} - ${vendedor.telefone}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-secondary" onclick="editarVendedor(${vendedor.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirVendedor(${vendedor.id})">Excluir</button>
                </div>
            </div>
        `;
        listaVendedores.appendChild(li);
    });
}

// Função para editar vendedor
function editarVendedor(id) {
    const vendedor = dados.vendedores.find(v => v.id === id);
    if (vendedor) {
        document.getElementById('nomeVendedor').value = vendedor.nome;
        document.getElementById('emailVendedor').value = vendedor.email;
        document.getElementById('telefoneVendedor').value = vendedor.telefone;

        const form = document.getElementById('vendedorForm');
        form.onsubmit = function (e) {
            e.preventDefault();
            vendedor.nome = document.getElementById('nomeVendedor').value;
            vendedor.email = document.getElementById('emailVendedor').value;
            vendedor.telefone = document.getElementById('telefoneVendedor').value;
            atualizarListaVendedores();
            atualizarOpcoesVendedores();
            alert('Vendedor atualizado com sucesso!');
        };
    }
}

// Função para excluir vendedor
function excluirVendedor(id) {
    dados.vendedores = dados.vendedores.filter(v => v.id !== id);
    atualizarListaVendedores();
    atualizarOpcoesVendedores();
    alert('Vendedor excluído com sucesso!');
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
    atualizarListaServicos();
    atualizarOpcoesServicos();
    alert('Serviço cadastrado com sucesso!');
});

// Função para atualizar a lista de serviços
function atualizarListaServicos() {
    const listaServicos = document.getElementById('servicosList');
    listaServicos.innerHTML = '';

    dados.servicos.forEach(servico => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${servico.nome}</strong><br>
                    <small>Categoria: ${servico.categoria} - Tipo de Comissão: ${servico.tipoComissao}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-secondary" onclick="editarServico(${servico.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirServico(${servico.id})">Excluir</button>
                </div>
            </div>
        `;
        listaServicos.appendChild(li);
    });
}

// Função para editar serviço
function editarServico(id) {
    const servico = dados.servicos.find(s => s.id === id);
    if (servico) {
        document.getElementById('nomeServico').value = servico.nome;
        document.getElementById('categoriaServico').value = servico.categoria;
        document.getElementById('tipoComissao').value = servico.tipoComissao;

        const form = document.getElementById('servicoForm');
        form.onsubmit = function (e) {
            e.preventDefault();
            servico.nome = document.getElementById('nomeServico').value;
            servico.categoria = document.getElementById('categoriaServico').value;
            servico.tipoComissao = document.getElementById('tipoComissao').value;
            atualizarListaServicos();
            atualizarOpcoesServicos();
            alert('Serviço atualizado com sucesso!');
        };
    }
}

// Função para excluir serviço
function excluirServico(id) {
    dados.servicos = dados.servicos.filter(s => s.id !== id);
    atualizarListaServicos();
    atualizarOpcoesServicos();
    alert('Serviço excluído com sucesso!');
}

// Função para cadastrar empresa parceira
document.getElementById('empresaForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const nomeEmpresa = document.getElementById('nomeEmpresa').value;
    const categoriaEmpresa = document.getElementById('categoriaEmpresa').value;

    const novaEmpresa = {
        id: dados.empresasParceiras.length + 1,
        nome: nomeEmpresa,
        categoria: categoriaEmpresa
    };

    dados.empresasParceiras.push(novaEmpresa);
    atualizarListaEmpresas();
    atualizarOpcoesEmpresas();
    alert('Empresa cadastrada com sucesso!');
});

// Função para atualizar a lista de empresas parceiras
function atualizarListaEmpresas() {
    const listaEmpresas = document.getElementById('empresasList');
    listaEmpresas.innerHTML = '';

    dados.empresasParceiras.forEach(empresa => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${empresa.nome}</strong><br>
                    <small>Categoria: ${empresa.categoria}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-secondary" onclick="editarEmpresa(${empresa.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirEmpresa(${empresa.id})">Excluir</button>
                </div>
            </div>
        `;
        listaEmpresas.appendChild(li);
    });
}

// Função para editar empresa parceira
function editarEmpresa(id) {
    const empresa = dados.empresasParceiras.find(e => e.id === id);
    if (empresa) {
        document.getElementById('nomeEmpresa').value = empresa.nome;
        document.getElementById('categoriaEmpresa').value = empresa.categoria;

        const form = document.getElementById('empresaForm');
        form.onsubmit = function (e) {
            e.preventDefault();
            empresa.nome = document.getElementById('nomeEmpresa').value;
            empresa.categoria = document.getElementById('categoriaEmpresa').value;
            atualizarListaEmpresas();
            atualizarOpcoesEmpresas();
            alert('Empresa atualizada com sucesso!');
        };
    }
}

// Função para excluir empresa parceira
function excluirEmpresa(id) {
    dados.empresasParceiras = dados.empresasParceiras.filter(e => e.id !== id);
    atualizarListaEmpresas();
    atualizarOpcoesEmpresas();
    alert('Empresa excluída com sucesso!');
}

// Função para registrar venda
document.getElementById('vendaForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const vendedorId = document.getElementById('vendedorVenda').value;
    const servicoId = document.getElementById('servicoVenda').value;
    const dataVenda = document.getElementById('dataVenda').value;
    const nomeCliente = document.getElementById('nomeCliente').value;
    const empresaParceiraId = document.getElementById('empresaParceira').value;
    const valorVenda = parseFloat(document.getElementById('valorVenda').value.replace(',', '.'));
    const valorReceber = parseFloat(document.getElementById('valorReceber').value.replace(',', '.'));
    const comissao = parseFloat(document.getElementById('comissao').value.replace(',', '.'));

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
    atualizarDashboard();
});

// Função para filtrar relatório
function filtrarRelatorio() {
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    const vendedorId = document.getElementById('filtroVendedor').value;
    const colunasSelecionadas = Array.from(document.getElementById('filtroColunas').selectedOptions).map(option => option.value);

    const vendasFiltradas = dados.vendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        const dataInicialFiltro = new Date(dataInicial);
        const dataFinalFiltro = new Date(dataFinal);

        const filtroData = (!dataInicial || dataVenda >= dataInicialFiltro) && (!dataFinal || dataVenda <= dataFinalFiltro);
        const filtroVendedor = !vendedorId || venda.vendedor === dados.vendedores.find(v => v.id == vendedorId).nome;

        return filtroData && filtroVendedor;
    });

    const colunas = {
        data: 'Data da Venda',
        vendedor: 'Nome do Vendedor',
        servico: 'Serviço Vendido',
        tipoComissao: 'Tipo de Comissão',
        nomeCliente: 'Nome do Cliente',
        empresaParceira: 'Empresa Parceira',
        comissao: 'Valor da Comissão'
    };

    const thead = document.querySelector('#tabelaRelatorio thead');
    const tbody = document.querySelector('#tabelaRelatorio tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const headerRow = document.createElement('tr');
    colunasSelecionadas.forEach(coluna => {
        const th = document.createElement('th');
        th.textContent = colunas[coluna];
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    let totalComissao = 0;

    vendasFiltradas.forEach(venda => {
        const row = document.createElement('tr');
        colunasSelecionadas.forEach(coluna => {
            const td = document.createElement('td');
            td.textContent = venda[coluna];
            row.appendChild(td);
        });
        tbody.appendChild(row);

        if (venda.tipoComissao === 'fixa') {
            totalComissao += venda.comissao;
        } else if (venda.tipoComissao === 'porcentagem') {
            totalComissao += venda.valorReceber * (venda.comissao / 100);
        }
    });

    document.getElementById('totalComissaoRelatorio').textContent = `R$ ${totalComissao.toFixed(2)}`;
}

// Função para exportar relatório em PDF
function exportarRelatorioPDF() {
    const colunasSelecionadas = Array.from(document.getElementById('filtroColunas').selectedOptions).map(option => option.value);
    const colunas = {
        data: 'Data da Venda',
        vendedor: 'Nome do Vendedor',
        servico: 'Serviço Vendido',
        tipoComissao: 'Tipo de Comissão',
        nomeCliente: 'Nome do Cliente',
        empresaParceira: 'Empresa Parceira',
        comissao: 'Valor da Comissão'
    };

    const headers = colunasSelecionadas.map(coluna => colunas[coluna]);
    const data = [];

    document.querySelectorAll('#tabelaRelatorio tbody tr').forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent);
        });
        data.push(rowData);
    });

    const doc = new jsPDF();
    doc.autoTable({
        head: [headers],
        body: data,
    });

    doc.save('relatorio_vendas.pdf');
}

// Função para exportar relatório em Excel
function exportarRelatorioExcel() {
    const colunasSelecionadas = Array.from(document.getElementById('filtroColunas').selectedOptions).map(option => option.value);
    const colunas = {
        data: 'Data da Venda',
        vendedor: 'Nome do Vendedor',
        servico: 'Serviço Vendido',
        tipoComissao: 'Tipo de Comissão',
        nomeCliente: 'Nome do Cliente',
        empresaParceira: 'Empresa Parceira',
        comissao: 'Valor da Comissão'
    };

    const headers = colunasSelecionadas.map(coluna => colunas[coluna]);
    const data = [];

    document.querySelectorAll('#tabelaRelatorio tbody tr').forEach(row => {
        const rowData = {};
        row.querySelectorAll('td').forEach((cell, index) => {
            rowData[headers[index]] = cell.textContent;
        });
        data.push(rowData);
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Vendas');
    XLSX.writeFile(wb, 'relatorio_vendas.xlsx');
}

// Função para atualizar o dashboard
function atualizarDashboard() {
    atualizarTotalVendas();
    atualizarComissoes();
    atualizarVendedoresAtivos();
    atualizarServicosAtivos();
    atualizarGraficoVendasPorServico();
    atualizarGraficoDesempenhoVendedores();
    atualizarGraficoVendasPorCategoria();
    atualizarGraficoDesempenhoPorVendedor();
    atualizarOutrosPainéis();
}

// Função para atualizar o total de vendas
function atualizarTotalVendas() {
    const totalVendas = dados.vendas.reduce((total, venda) => total + venda.valorVenda, 0);
    document.getElementById('totalVendasDash').textContent = `R$ ${totalVendas.toFixed(2)}`;
}

// Função para atualizar o total de comissões
function atualizarComissoes() {
    const totalComissoes = dados.vendas.reduce((total, venda) => {
        if (venda.tipoComissao === 'fixa') {
            return total + venda.comissao;
        } else if (venda.tipoComissao === 'porcentagem') {
            return total + (venda.valorReceber * (venda.comissao / 100));
        }
        return total;
    }, 0);
    document.getElementById('totalComissoesDash').textContent = `R$ ${totalComissoes.toFixed(2)}`;
}

// Função para atualizar o total de vendedores ativos
function atualizarVendedoresAtivos() {
    const totalVendedores = dados.vendedores.length;
    document.getElementById('totalVendedores').textContent = totalVendedores;
}

// Função para atualizar o total de serviços ativos
function atualizarServicosAtivos() {
    const totalServicos = dados.servicos.length;
    document.getElementById('totalServicos').textContent = totalServicos;
}

// Função para atualizar o gráfico de vendas por serviço
function atualizarGraficoVendasPorServico() {
    const vendasPorServico = dados.servicos.map(servico => {
        return dados.vendas.filter(venda => venda.servico === servico.nome).length;
    });

    vendasServicoChart.data.datasets[0].data = vendasPorServico;
    vendasServicoChart.update();
}

// Função para atualizar o gráfico de desempenho dos vendedores
function atualizarGraficoDesempenhoVendedores() {
    const desempenhoVendedores = dados.vendedores.map(vendedor => {
        return dados.vendas.filter(venda => venda.vendedor === vendedor.nome).length;
    });

    desempenhoVendedoresChart.data.datasets[0].data = desempenhoVendedores;
    desempenhoVendedoresChart.update();
}

// Função para atualizar o gráfico de vendas por categoria
function atualizarGraficoVendasPorCategoria() {
    const vendasPorCategoria = dados.servicos.map(servico => {
        return dados.vendas.filter(venda => venda.servico === servico.nome).length;
    });

    vendasCategoriaChart.data.datasets[0].data = vendasPorCategoria;
    vendasCategoriaChart.update();
}

// Função para atualizar o gráfico de desempenho por vendedor
function atualizarGraficoDesempenhoPorVendedor() {
    const desempenhoPorVendedor = dados.vendedores.map(vendedor => {
        return dados.vendas.filter(venda => venda.vendedor === vendedor.nome).length;
    });

    desempenhoPorVendedorChart.data.labels = dados.vendedores.map(vendedor => vendedor.nome);
    desempenhoPorVendedorChart.data.datasets[0].data = desempenhoPorVendedor;
    desempenhoPorVendedorChart.update();
}

// Função para atualizar outros painéis
function atualizarOutrosPainéis() {
    // Adicione aqui a lógica para atualizar outros painéis
}

// Inicialização dos gráficos
const vendasServicoChart = new Chart(document.getElementById('vendasServicoChart'), {
    type: 'bar',
    data: {
        labels: ['Consultoria', 'Treinamento', 'Suporte Técnico'],
        datasets: [{
            label: 'Vendas',
            data: [0, 0, 0],
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const desempenhoVendedoresChart = new Chart(document.getElementById('desempenhoVendedoresChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Desempenho',
            data: [],
            fill: false,
            borderColor: 'rgba(79, 70, 229, 1)',
            tension: 0.1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const vendasCategoriaChart = new Chart(document.getElementById('vendasCategoriaChart'), {
    type: 'pie',
    data: {
        labels: ['Consultoria', 'Treinamento', 'Suporte Técnico'],
        datasets: [{
            label: 'Vendas por Categoria',
            data: [0, 0, 0],
            backgroundColor: [
                'rgba(79, 70, 229, 0.2)',
                'rgba(34, 197, 94, 0.2)',
                'rgba(239, 68, 68, 0.2)'
            ],
            borderColor: [
                'rgba(79, 70, 229, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Vendas por Categoria'
            }
        }
    }
});

const desempenhoPorVendedorChart = new Chart(document.getElementById('desempenhoPorVendedorChart'), {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Vendas',
            data: [],
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
