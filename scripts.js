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
    preencherAnos();
    atualizarOpcoesVendedores();
    atualizarOpcoesServicos();
    atualizarOpcoesEmpresas();
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
        const listaVendedores = document.getElementById('vendedoresList');
        listaVendedores.innerHTML = '';

        dados.vendedores.forEach(v => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            if (v.id === id) {
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <input type="text" id="editNomeVendedor" value="${v.nome}" class="form-input">
                            <input type="email" id="editEmailVendedor" value="${v.email}" class="form-input">
                            <input type="tel" id="editTelefoneVendedor" value="${v.telefone}" class="form-input">
                        </div>
                        <div>
                            <button class="btn btn-sm btn-success" onclick="salvarEdicaoVendedor(${v.id})">Salvar</button>
                            <button class="btn btn-sm btn-danger" onclick="cancelarEdicao()">Cancelar</button>
                        </div>
                    </div>
                `;
            } else {
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${v.nome}</strong><br>
                            <small>${v.email} - ${v.telefone}</small>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-secondary" onclick="editarVendedor(${v.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="excluirVendedor(${v.id})">Excluir</button>
                        </div>
                    </div>
                `;
            }
            listaVendedores.appendChild(li);
        });
    }
}

// Função para salvar a edição do vendedor
function salvarEdicaoVendedor(id) {
    const vendedor = dados.vendedores.find(v => v.id === id);
    if (vendedor) {
        vendedor.nome = document.getElementById('editNomeVendedor').value;
        vendedor.email = document.getElementById('editEmailVendedor').value;
        vendedor.telefone = document.getElementById('editTelefoneVendedor').value;
        atualizarListaVendedores();
        alert('Vendedor atualizado com sucesso!');
    }
}

// Função para cancelar a edição
function cancelarEdicao() {
    atualizarListaVendedores();
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
        const listaServicos = document.getElementById('servicosList');
        listaServicos.innerHTML = '';

        dados.servicos.forEach(s => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            if (s.id === id) {
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <input type="text" id="editNomeServico" value="${s.nome}" class="form-input">
                            <input type="text" id="editCategoriaServico" value="${s.categoria}" class="form-input">
                            <select id="editTipoComissao" class="form-select">
                                <option value="fixa" ${s.tipoComissao === 'fixa' ? 'selected' : ''}>Fixa</option>
                                <option value="porcentagem" ${s.tipoComissao === 'porcentagem' ? 'selected' : ''}>Porcentagem</option>
                            </select>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-success" onclick="salvarEdicaoServico(${s.id})">Salvar</button>
                            <button class="btn btn-sm btn-danger" onclick="cancelarEdicao()">Cancelar</button>
                        </div>
                    </div>
                `;
            } else {
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${s.nome}</strong><br>
                            <small>Categoria: ${s.categoria} - Tipo de Comissão: ${s.tipoComissao}</small>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-secondary" onclick="editarServico(${s.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="excluirServico(${s.id})">Excluir</button>
                        </div>
                    </div>
                `;
            }
            listaServicos.appendChild(li);
        });
    }
}

// Função para salvar a edição do serviço
function salvarEdicaoServico(id) {
    const servico = dados.servicos.find(s => s.id === id);
    if (servico) {
        servico.nome = document.getElementById('editNomeServico').value;
        servico.categoria = document.getElementById('editCategoriaServico').value;
        servico.tipoComissao = document.getElementById('editTipoComissao').value;
        atualizarListaServicos();
        alert('Serviço atualizado com sucesso!');
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
        const listaEmpresas = document.getElementById('empresasList');
        listaEmpresas.innerHTML = '';

        dados.empresasParceiras.forEach(e => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            if (e.id === id) {
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <input type="text" id="editNomeEmpresa" value="${e.nome}" class="form-input">
                            <input type="text" id="editCategoriaEmpresa" value="${e.categoria}" class="form-input">
                        </div>
                        <div>
                            <button class="btn btn-sm btn-success" onclick="salvarEdicaoEmpresa(${e.id})">Salvar</button>
                            <button class="btn btn-sm btn-danger" onclick="cancelarEdicao()">Cancelar</button>
                        </div>
                    </div>
                `;
            } else {
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${e.nome}</strong><br>
                            <small>Categoria: ${e.categoria}</small>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-secondary" onclick="editarEmpresa(${e.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="excluirEmpresa(${e.id})">Excluir</button>
                        </div>
                    </div>
                `;
            }
            listaEmpresas.appendChild(li);
        });
    }
}

// Função para salvar a edição da empresa
function salvarEdicaoEmpresa(id) {
    const empresa = dados.empresasParceiras.find(e => e.id === id);
    if (empresa) {
        empresa.nome = document.getElementById('editNomeEmpresa').value;
        empresa.categoria = document.getElementById('editCategoriaEmpresa').value;
        atualizarListaEmpresas();
        alert('Empresa atualizada com sucesso!');
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
    atualizarDashboard();
});

// Função para filtrar relatório
function filtrarRelatorio() {
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    const vendedorId = document.getElementById('filtroVendedor').value;
    const colunasSelecionadas = Array.from(document.getElementById('filtroColunas').selectedOptions).map(option => option.value);

    const vendasFiltradas = dados.vendas.filter(venda => {
        const dataVenda = new Date(venda.data.split('/').reverse().join('-')); // Converte para formato Date
        const dataInicialFiltro = new Date(dataInicial.split('/').reverse().join('-'));
        const dataFinalFiltro = new Date(dataFinal.split('/').reverse().join('-'));

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
        comissao: 'Valor da Comissão',
        percentualComissao: '% da Comissão'
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
            let valor = venda[coluna];

            if (coluna === 'comissao') {
                valor = formatarMoeda(valor);
            } else if (coluna === 'percentualComissao') {
                valor = `${venda.comissao}%`;
            }

            td.textContent = valor;
            row.appendChild(td);
        });
        tbody.appendChild(row);

        if (venda.tipoComissao === 'fixa') {
            totalComissao += venda.comissao;
        } else if (venda.tipoComissao === 'porcentagem') {
            totalComissao += venda.valorReceber * (venda.comissao / 100);
        }
    });

    document.getElementById('totalComissaoRelatorio').textContent = formatarMoeda(totalComissao);
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
        comissao: 'Valor da Comissão',
        percentualComissao: '% da Comissão'
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
        comissao: 'Valor da Comissão',
        percentualComissao: '% da Comissão'
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

// Função para formatar valores monetários
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

// Função para atualizar o dashboard
function atualizarDashboard() {
    const mesSelecionado = parseInt(document.getElementById('mesFiltro').value);
    const anoSelecionado = parseInt(document.getElementById('anoFiltro').value);

    const vendasFiltradas = dados.vendas.filter(venda => {
        const dataVenda = new Date(venda.data.split('/').reverse().join('-'));
        return dataVenda.getMonth() === mesSelecionado && dataVenda.getFullYear() === anoSelecionado;
    });

    atualizarTotalVendas(vendasFiltradas);
    atualizarComissoes(vendasFiltradas);
    atualizarGraficoVendasPorServico(vendasFiltradas);
    atualizarGraficoDesempenhoVendedores(vendasFiltradas);
    atualizarComparacaoMensal();
    atualizarRankingVendedores(vendasFiltradas);
}

// Função para atualizar o total de vendas
function atualizarTotalVendas(vendasFiltradas) {
    const totalVendas = vendasFiltradas.reduce((total, venda) => total + venda.valorVenda, 0);
    document.getElementById('totalVendasDash').textContent = formatarMoeda(totalVendas);
}

// Função para atualizar o total de comissões
function atualizarComissoes(vendasFiltradas) {
    const totalComissoes = vendasFiltradas.reduce((total, venda) => total + venda.valorReceber, 0);
    document.getElementById('totalComissoesDash').textContent = formatarMoeda(totalComissoes);
}

// Função para atualizar o gráfico de vendas por serviço
function atualizarGraficoVendasPorServico(vendasFiltradas) {
    const servicosCadastrados = dados.servicos.map(servico => servico.nome);
    const vendasPorServico = servicosCadastrados.map(servico => {
        return vendasFiltradas.filter(venda => venda.servico === servico).length;
    });

    vendasServicoChart.data.labels = servicosCadastrados;
    vendasServicoChart.data.datasets[0].data = vendasPorServico;
    vendasServicoChart.update();
}

// Função para atualizar o gráfico de desempenho dos vendedores
function atualizarGraficoDesempenhoVendedores(vendasFiltradas) {
    const vendedores = dados.vendedores.map(vendedor => vendedor.nome);
    const cores = ['#4f46e5', '#ef4444', '#22c55e', '#f59e0b', '#3b82f6']; // Cores para cada vendedor

    const datasets = vendedores.map((vendedor, index) => {
        const vendasVendedor = vendasFiltradas.filter(venda => venda.vendedor === vendedor);
        const totalVendas = vendasVendedor.reduce((total, venda) => total + venda.valorVenda, 0);

        return {
            label: vendedor,
            data: [totalVendas],
            borderColor: cores[index],
            fill: false
        };
    });

    desempenhoVendedoresChart.data.labels = ['Total de Vendas'];
    desempenhoVendedoresChart.data.datasets = datasets;
    desempenhoVendedoresChart.update();
}

// Função para atualizar a comparação mensal de vendas
function atualizarComparacaoMensal() {
    const meses = Array.from({ length: 12 }, (_, i) => i);
    const anoSelecionado = parseInt(document.getElementById('anoFiltro').value);

    const vendasPorMes = meses.map(mes => {
        return dados.vendas.filter(venda => {
            const dataVenda = new Date(venda.data.split('/').reverse().join('-'));
            return dataVenda.getMonth() === mes && dataVenda.getFullYear() === anoSelecionado;
        }).reduce((total, venda) => total + venda.valorVenda, 0);
    });

    comparacaoMensalChart.data.datasets[0].data = vendasPorMes;
    comparacaoMensalChart.update();
}

// Função para atualizar o ranking de vendedores
function atualizarRankingVendedores(vendasFiltradas) {
    const ranking = dados.vendedores.map(vendedor => {
        const vendasVendedor = vendasFiltradas.filter(venda => venda.vendedor === vendedor.nome);
        const totalVendas = vendasVendedor.reduce((total, venda) => total + venda.valorVenda, 0);
        return {
            nome: vendedor.nome,
            quantidade: vendasVendedor.length,
            total: totalVendas
        };
    }).sort((a, b) => b.total - a.total);

    const tbody = document.querySelector('#rankingVendedores tbody');
    tbody.innerHTML = '';

    ranking.forEach(vendedor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vendedor.nome}</td>
            <td>${vendedor.quantidade}</td>
            <td>${formatarMoeda(vendedor.total)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Inicialização dos gráficos
const vendasServicoChart = new Chart(document.getElementById('vendasServicoChart'), {
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

const desempenhoVendedoresChart = new Chart(document.getElementById('desempenhoVendedoresChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const comparacaoMensalChart = new Chart(document.getElementById('comparacaoMensalChart'), {
    type: 'bar',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
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
