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
    atualizarFiltrosVendas();
    inicializarSortable(); // Inicializa a funcionalidade de arrastar e soltar
    preencherFiltrosVendas(); // Preenche os filtros de vendedores, serviços e empresas
    inicializarSortableRelatorio(); // Inicializa a funcionalidade de arrastar e soltar na tabela de relatórios

    // Adicionar eventos de clique aos cabeçalhos da tabela para ordenação
    const ths = document.querySelectorAll('#tabelaVendas th');
    ths.forEach((th, index) => {
        th.addEventListener('click', () => ordenarTabelaVendas(index));
    });

    // Definir o valor padrão de 10 para os campos de paginação
    document.getElementById('itensPorPaginaServicos').value = 10;
    document.getElementById('itensPorPaginaEmpresas').value = 10;
    document.getElementById('itensPorPaginaVendas').value = 10;

    // Verificar se o elemento filtroVendedor existe antes de adicionar o evento
    const filtroVendedor = document.getElementById('filtroVendedor');
    const botaoFiltrar = document.getElementById('botaoFiltrar');

    if (filtroVendedor && botaoFiltrar) {
        botaoFiltrar.addEventListener('click', filtrarRelatorio);
    } else {
        console.error('Elementos necessários não encontrados no DOM.');
    }
});

// Função para filtrar e gerar o relatório
function filtrarRelatorio() {
    const filtroVendedor = document.getElementById('filtroVendedor');
    if (!filtroVendedor) {
        console.error('Elemento filtroVendedor não encontrado no DOM.');
        return;
    }

    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    const vendedorId = filtroVendedor.value;
    const colunasSelecionadas = Array.from(document.getElementById('filtroColunas').selectedOptions).map(option => option.value);

    // Converter datas para o formato Date
    const dataInicialObj = dataInicial ? new Date(dataInicial.split('/').reverse().join('-')) : null;
    const dataFinalObj = dataFinal ? new Date(dataFinal.split('/').reverse().join('-')) : null;

    // Filtrar vendas
    const vendasFiltradas = dados.vendas.filter(venda => {
        const dataVendaObj = new Date(venda.data.split('/').reverse().join('-'));

        // Filtro por data
        const filtroData = (!dataInicialObj || dataVendaObj >= dataInicialObj) &&
                           (!dataFinalObj || dataVendaObj <= dataFinalObj);

        // Filtro por vendedor
        const filtroVendedor = !vendedorId || venda.vendedor === dados.vendedores.find(v => v.id == vendedorId).nome;

        return filtroData && filtroVendedor;
    });

    // Gerar colunas da tabela
    const colunas = {
        data: 'Data da Venda',
        id: 'ID da Venda',
        vendedor: 'Nome do Vendedor',
        servico: 'Serviço Vendido',
        tipoComissao: 'Tipo de Comissão',
        nomeCliente: 'Nome do Cliente',
        empresaParceira: 'Empresa Parceira',
        valorVenda: 'Valor da Venda',
        valorBrutoReceber: 'Valor Bruto a Receber',
        comissao: 'Valor da Comissão',
        percentualComissao: 'Variável da Comissão'
    };

    const headers = colunasSelecionadas.map(coluna => colunas[coluna]);

    // Criar cabeçalho da tabela
    const thead = document.querySelector('#tabelaRelatorio thead');
    thead.innerHTML = '';

    const headerRow = document.createElement('tr');
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.onclick = () => ordenarTabela(index); // Adicionar função de ordenação
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Criar corpo da tabela
    const tbody = document.querySelector('#tabelaRelatorio tbody');
    tbody.innerHTML = '';

    let totalComissao = 0;
    let totalValorBruto = 0;
    let totalValorVenda = 0;

    vendasFiltradas.forEach(venda => {
        const row = document.createElement('tr');
        colunasSelecionadas.forEach(coluna => {
            const cell = document.createElement('td');
            let valor = '';

            switch (coluna) {
                case 'data':
                    valor = venda.data;
                    break;
                case 'id':
                    valor = venda.id;
                    break;
                case 'vendedor':
                    valor = venda.vendedor;
                    break;
                case 'servico':
                    valor = venda.servico;
                    break;
                case 'tipoComissao':
                    valor = venda.tipoComissao === 'fixa' ? 'Fixa' : 'Porcentagem';
                    break;
                case 'nomeCliente':
                    valor = venda.nomeCliente;
                    break;
                case 'empresaParceira':
                    valor = venda.empresaParceira;
                    break;
                case 'valorVenda':
                    valor = venda.valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    totalValorVenda += venda.valorVenda;
                    break;
                case 'valorBrutoReceber':
                    valor = venda.valorReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    totalValorBruto += venda.valorReceber;
                    break;
                case 'comissao':
                    if (venda.tipoComissao === 'fixa') {
                        valor = venda.comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        totalComissao += venda.comissao;
                    } else {
                        const comissao = (venda.valorReceber * venda.comissao) / 100;
                        valor = comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        totalComissao += comissao;
                    }
                    break;
                case 'percentualComissao':
                    if (venda.tipoComissao === 'fixa') {
                        valor = venda.comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    } else {
                        valor = `${venda.comissao}%`;
                    }
                    break;
                default:
                    valor = '-';
            }
            cell.textContent = valor;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    // Atualizar totais no rodapé
    const tfoot = document.querySelector('#tabelaRelatorio tfoot');
    tfoot.innerHTML = `
        <tr>
            <td colspan="${colunasSelecionadas.length - 3}" style="text-align: right;"><strong>Totais:</strong></td>
            <td><strong>${totalValorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
            <td><strong>${totalValorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
            <td><strong>${totalComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
        </tr>
    `;
}

// Restante do código (todas as outras funções permanecem inalteradas)
// ...

// Função para inicializar a funcionalidade de arrastar e soltar
function inicializarSortable() {
    // Verifica se a tabela existe
    const tabelaVendas = document.getElementById('tabelaVendas');
    if (!tabelaVendas) {
        console.error('A tabela com o ID "tabelaVendas" não foi encontrada no DOM.');
        return;
    }

    // Verifica se o <thead> existe
    const thead = tabelaVendas.querySelector('thead');
    if (!thead) {
        console.error('O elemento <thead> não foi encontrado na tabela.');
        return;
    }

    // Verifica se a <tr> dentro do <thead> existe
    const tr = thead.querySelector('tr');
    if (!tr) {
        console.error('O elemento <tr> dentro do <thead> não foi encontrado.');
        return;
    }

    // Se tudo estiver correto, inicialize o Sortable
    new Sortable(tr, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function (evt) {
            const ths = Array.from(tr.querySelectorAll('th'));
            const rows = Array.from(tabelaVendas.querySelectorAll('tbody tr'));

            // Reorganiza as células das linhas de acordo com a nova ordem das colunas
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                const newCells = ths.map(th => cells[ths.indexOf(th)]);
                newCells.forEach((cell, index) => {
                    row.appendChild(cell);
                });
            });
        }
    });
}

// Função para inicializar a funcionalidade de arrastar e soltar na tabela de relatórios
function inicializarSortableRelatorio() {
    const tabelaRelatorio = document.getElementById('tabelaRelatorio');
    if (!tabelaRelatorio) {
        console.error('A tabela com o ID "tabelaRelatorio" não foi encontrada no DOM.');
        return;
    }

    const thead = tabelaRelatorio.querySelector('thead tr');
    if (!thead) {
        console.error('O elemento <thead> ou <tr> dentro do <thead> não foi encontrado na tabela.');
        return;
    }

    const tbody = tabelaRelatorio.querySelector('tbody');
    if (!tbody) {
        console.error('O elemento <tbody> não foi encontrado na tabela.');
        return;
    }

    // Tornar as colunas do cabeçalho arrastáveis
    new Sortable(thead, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function (evt) {
            const ths = Array.from(thead.querySelectorAll('th'));
            const rows = Array.from(tbody.querySelectorAll('tr'));

            // Reorganizar as células das linhas de acordo com a nova ordem das colunas
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                const newCells = ths.map(th => cells[ths.indexOf(th)]);
                newCells.forEach((cell, index) => {
                    row.appendChild(cell);
                });
            });
        }
    });
}

// Função para ordenar a tabela de vendas
function ordenarTabelaVendas(coluna) {
    const tbody = document.querySelector('#tabelaVendas tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Determinar a direção da ordenação
    const direcao = tbody.getAttribute('data-ordenacao') === 'asc' ? 'desc' : 'asc';
    tbody.setAttribute('data-ordenacao', direcao);

    // Ordenar as linhas
    rows.sort((a, b) => {
        const valorA = a.querySelector(`td:nth-child(${coluna + 1})`).textContent;
        const valorB = b.querySelector(`td:nth-child(${coluna + 1})`).textContent;

        if (direcao === 'asc') {
            return valorA.localeCompare(valorB, undefined, { numeric: true });
        } else {
            return valorB.localeCompare(valorA, undefined, { numeric: true });
        }
    });

    // Reinserir as linhas ordenadas
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

// Função para exportar a tabela de vendas para Excel
function exportarVendasExcel() {
    const tabela = document.getElementById('tabelaVendas');
    const headers = Array.from(tabela.querySelectorAll('th')).map(th => th.textContent);
    const data = [];

    document.querySelectorAll('#tabelaVendas tbody tr').forEach(row => {
        const rowData = {};
        row.querySelectorAll('td').forEach((cell, index) => {
            rowData[headers[index]] = cell.textContent;
        });
        data.push(rowData);
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    XLSX.writeFile(wb, 'vendas.xlsx');
}

// Função para exportar a tabela de vendas para PDF
function exportarVendasPDF() {
    const doc = new jsPDF();
    const tabela = document.getElementById('tabelaVendas');
    const headers = Array.from(tabela.querySelectorAll('th')).map(th => th.textContent);
    const rows = Array.from(tabela.querySelectorAll('tbody tr')).map(tr =>
        Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
    );

    doc.autoTable({
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save('vendas.pdf');
}

// Função para preencher os filtros de vendedores, serviços e empresas
function preencherFiltrosVendas() {
    const selectVendedor = document.getElementById('filtroVendedorVendas');
    const selectServico = document.getElementById('filtroServicoVendas');
    const selectEmpresa = document.getElementById('filtroEmpresaVendas');

    selectVendedor.innerHTML = '<option value="">Todos</option>';
    selectServico.innerHTML = '<option value="">Todos</option>';
    selectEmpresa.innerHTML = '<option value="">Todas</option>';

    dados.vendedores.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor.id;
        option.textContent = vendedor.nome;
        selectVendedor.appendChild(option);
    });

    dados.servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id;
        option.textContent = servico.nome;
        selectServico.appendChild(option);
    });

    dados.empresasParceiras.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa.id;
        option.textContent = empresa.nome;
        selectEmpresa.appendChild(option);
    });
}

// Função para preencher o seletor de anos
function preencherAnos() {
    const selectAno = document.getElementById('anoFiltro');
    selectAno.innerHTML = '';

    // Obter o ano atual
    const anoAtual = new Date().getFullYear();

    // Extrair anos únicos das vendas
    let anosUnicos = [...new Set(dados.vendas.map(venda => new Date(venda.data.split('/').reverse().join('-')).getFullYear()))];

    // Adicionar o ano atual se não existir
    if (!anosUnicos.includes(anoAtual)) {
        anosUnicos.push(anoAtual);
    }

    anosUnicos.sort((a, b) => b - a); // Ordenar do ano mais recente para o mais antigo

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
        // Converter a data da venda para objeto Date
        const [dia, mes, ano] = venda.data.split('/').map(Number);
        return mes - 1 === mesSelecionado && ano === anoSelecionado;
    });

    // Atualizar gráficos
    atualizarGraficos(vendasFiltradas);

    // Atualizar estatísticas
    const totalVendas = vendasFiltradas.reduce((total, venda) => total + venda.valorVenda, 0);
    const totalValorReceber = vendasFiltradas.reduce((total, venda) => total + venda.valorReceber, 0); // Soma dos valores a receber
    const totalClientes = [...new Set(vendasFiltradas.map(venda => venda.nomeCliente))].length;
    const ticketMedio = vendasFiltradas.length > 0 ? totalVendas / vendasFiltradas.length : 0;

    document.getElementById('totalVendasDash').textContent = totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('totalComissoesDash').textContent = totalValorReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); // Exibe a soma dos valores a receber
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

    // Destruir gráficos existentes, se houver
    if (vendasServicoChart) {
        vendasServicoChart.destroy();
    }
    if (desempenhoVendedoresChart) {
        desempenhoVendedoresChart.destroy();
    }
    if (vendasCategoriaChart) {
        vendasCategoriaChart.destroy();
    }

    // Inicializar gráfico de Vendas por Serviço
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

    // Inicializar gráfico de Desempenho dos Vendedores
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

    // Inicializar gráfico de Vendas por Categoria
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

    // Verifica se já existe um vendedor com o mesmo nome
    const vendedorExistente = dados.vendedores.find(v => v.nome === nomeVendedor);
    if (vendedorExistente) {
        alert('Já existe um vendedor com esse nome!');
        return;
    }

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
    limparCamposVendedor();
});

// Função para limpar campos do formulário de vendedor
function limparCamposVendedor() {
    document.getElementById('nomeVendedor').value = '';
    document.getElementById('emailVendedor').value = '';
    document.getElementById('telefoneVendedor').value = '';
}

// Função para filtrar vendedores pelo nome
function filtrarVendedores() {
    const filtro = document.getElementById('filtroVendedores').value.toLowerCase();
    const vendedoresFiltrados = dados.vendedores.filter(v => v.nome.toLowerCase().includes(filtro));
    atualizarListaVendedores(vendedoresFiltrados);
}

// Função para atualizar a lista de vendedores
function atualizarListaVendedores(vendedores = dados.vendedores) {
    const listaVendedores = document.getElementById('vendedoresList');
    listaVendedores.innerHTML = '';

    const itensPorPagina = parseInt(document.getElementById('itensPorPaginaVendedores').value);
    const inicio = (paginaAtualVendedores - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const vendedoresPaginados = vendedores.slice(inicio, fim);

    vendedoresPaginados.forEach(vendedor => {
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

    // Atualizar controles de paginação
    const totalPaginas = Math.ceil(vendedores.length / itensPorPagina);
    document.getElementById('controlesPaginacaoVendedores').innerHTML = `
        <button class="btn btn-secondary" onclick="mudarPaginaVendedores(-1)" ${paginaAtualVendedores === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${paginaAtualVendedores} de ${totalPaginas}</span>
        <button class="btn btn-secondary" onclick="mudarPaginaVendedores(1)" ${paginaAtualVendedores === totalPaginas ? 'disabled' : ''}>Próxima</button>
    `;
}

// Função para mudar a página de vendedores
function mudarPaginaVendedores(direcao) {
    paginaAtualVendedores += direcao;
    atualizarListaVendedores();
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
    if (confirm('Tem certeza que deseja excluir este vendedor?')) {
        dados.vendedores = dados.vendedores.filter(v => v.id !== id);
        atualizarListaVendedores();
        atualizarOpcoesVendedores();
        alert('Vendedor excluído com sucesso!');
    }
}

// Função para cadastrar serviço
document.getElementById('servicoForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const nomeServico = document.getElementById('nomeServico').value;
    const categoriaServico = document.getElementById('categoriaServico').value;
    const tipoComissao = document.getElementById('tipoComissao').value;

    // Verifica se já existe um serviço com o mesmo nome
    const servicoExistente = dados.servicos.find(s => s.nome === nomeServico);
    if (servicoExistente) {
        alert('Já existe um serviço com esse nome!');
        return;
    }

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
    limparCamposServico();
});

// Função para limpar campos do formulário de serviço
function limparCamposServico() {
    document.getElementById('nomeServico').value = '';
    document.getElementById('categoriaServico').value = '';
    document.getElementById('tipoComissao').value = 'fixa';
}

// Função para filtrar serviços pelo nome
function filtrarServicos() {
    const filtro = document.getElementById('filtroServicos').value.toLowerCase();
    const servicosFiltrados = dados.servicos.filter(s => s.nome.toLowerCase().includes(filtro));
    atualizarListaServicos(servicosFiltrados);
}

// Função para atualizar a lista de serviços
function atualizarListaServicos(servicos = dados.servicos) {
    const listaServicos = document.getElementById('servicosList');
    listaServicos.innerHTML = '';

    const itensPorPagina = parseInt(document.getElementById('itensPorPaginaServicos').value);
    const inicio = (paginaAtualServicos - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const servicosPaginados = servicos.slice(inicio, fim);

    servicosPaginados.forEach(servico => {
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

    // Atualizar controles de paginação
    const totalPaginas = Math.ceil(servicos.length / itensPorPagina);
    document.getElementById('controlesPaginacaoServicos').innerHTML = `
        <button class="btn btn-secondary" onclick="mudarPaginaServicos(-1)" ${paginaAtualServicos === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${paginaAtualServicos} de ${totalPaginas}</span>
        <button class="btn btn-secondary" onclick="mudarPaginaServicos(1)" ${paginaAtualServicos === totalPaginas ? 'disabled' : ''}>Próxima</button>
    `;
}

// Função para mudar a página de serviços
function mudarPaginaServicos(direcao) {
    paginaAtualServicos += direcao;
    atualizarListaServicos();
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
        const novoNome = document.getElementById('editNomeServico').value;

        // Verifica se já existe um serviço com o mesmo nome
        const servicoExistente = dados.servicos.find(s => s.nome === novoNome && s.id !== id);
        if (servicoExistente) {
            alert('Já existe um serviço com esse nome!');
            return;
        }

        servico.nome = novoNome;
        servico.categoria = document.getElementById('editCategoriaServico').value;
        servico.tipoComissao = document.getElementById('editTipoComissao').value;
        atualizarListaServicos();
        alert('Serviço atualizado com sucesso!');
    }
}

// Função para excluir serviço
function excluirServico(id) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        dados.servicos = dados.servicos.filter(s => s.id !== id);
        atualizarListaServicos();
        atualizarOpcoesServicos();
        alert('Serviço excluído com sucesso!');
    }
}

// Função para cadastrar empresa parceira
document.getElementById('empresaForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const nomeEmpresa = document.getElementById('nomeEmpresa').value;

    // Verifica se já existe uma empresa com o mesmo nome
    const empresaExistente = dados.empresasParceiras.find(e => e.nome === nomeEmpresa);
    if (empresaExistente) {
        alert('Já existe uma empresa com esse nome!');
        return;
    }

    const novaEmpresa = {
        id: dados.empresasParceiras.length + 1,
        nome: nomeEmpresa
    };

    dados.empresasParceiras.push(novaEmpresa);
    atualizarListaEmpresas();
    atualizarOpcoesEmpresas();
    alert('Empresa cadastrada com sucesso!');
    limparCamposEmpresa();
});

// Função para limpar campos do formulário de empresa
function limparCamposEmpresa() {
    document.getElementById('nomeEmpresa').value = '';
}

// Função para filtrar empresas pelo nome
function filtrarEmpresas() {
    const filtro = document.getElementById('filtroEmpresas').value.toLowerCase();
    const empresasFiltradas = dados.empresasParceiras.filter(e => e.nome.toLowerCase().includes(filtro));
    atualizarListaEmpresas(empresasFiltradas);
}

// Função para atualizar a lista de empresas parceiras
function atualizarListaEmpresas(empresas = dados.empresasParceiras) {
    const listaEmpresas = document.getElementById('empresasList');
    listaEmpresas.innerHTML = '';

    const itensPorPagina = parseInt(document.getElementById('itensPorPaginaEmpresas').value);
    const inicio = (paginaAtualEmpresas - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const empresasPaginadas = empresas.slice(inicio, fim);

    empresasPaginadas.forEach(empresa => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${empresa.nome}</strong>
                </div>
                <div>
                    <button class="btn btn-sm btn-secondary" onclick="editarEmpresa(${empresa.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirEmpresa(${empresa.id})">Excluir</button>
                </div>
            </div>
        `;
        listaEmpresas.appendChild(li);
    });

    // Atualizar controles de paginação
    const totalPaginas = Math.ceil(empresas.length / itensPorPagina);
    document.getElementById('controlesPaginacaoEmpresas').innerHTML = `
        <button class="btn btn-secondary" onclick="mudarPaginaEmpresas(-1)" ${paginaAtualEmpresas === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${paginaAtualEmpresas} de ${totalPaginas}</span>
        <button class="btn btn-secondary" onclick="mudarPaginaEmpresas(1)" ${paginaAtualEmpresas === totalPaginas ? 'disabled' : ''}>Próxima</button>
    `;
}

// Função para mudar a página de empresas
function mudarPaginaEmpresas(direcao) {
    paginaAtualEmpresas += direcao;
    atualizarListaEmpresas();
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
                            <strong>${e.nome}</strong>
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
        const novoNome = document.getElementById('editNomeEmpresa').value;

        // Verifica se já existe uma empresa com o mesmo nome
        const empresaExistente = dados.empresasParceiras.find(e => e.nome === novoNome && e.id !== id);
        if (empresaExistente) {
            alert('Já existe uma empresa com esse nome!');
            return;
        }

        empresa.nome = novoNome;
        atualizarListaEmpresas();
        alert('Empresa atualizada com sucesso!');
    }
}

// Função para excluir empresa parceira
function excluirEmpresa(id) {
    if (confirm('Tem certeza que deseja excluir esta empresa?')) {
        dados.empresasParceiras = dados.empresasParceiras.filter(e => e.id !== id);
        atualizarListaEmpresas();
        atualizarOpcoesEmpresas();
        alert('Empresa excluída com sucesso!');
    }
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

    if (valorReceber > valorVenda) {
        alert('O valor a receber não pode ser maior que o valor da venda.');
        return;
    }

    if (servico.tipoComissao === 'fixa' && comissao > valorReceber) {
        alert('A comissão em reais não pode ser maior que o valor a receber.');
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
    preencherAnos(); // Atualizar os anos disponíveis
    atualizarDashboard(); // Atualizar o dashboard com a nova venda
    listarVendas(); // Atualizar a lista de vendas
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

// Função para formatar automaticamente a data (dd/mm/aaaa)
function formatarDataInput(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,2})/, '$1/$2'); // Adiciona barra após o dia
    }
    if (valor.length > 5) {
        valor = valor.replace(/^(\d{2})\/(\d{2})(\d{0,4})/, '$1/$2/$3'); // Adiciona barra após o mês
    }
    input.value = valor;
}

// Função para formatar o telefone no padrão (XX) XXXXX-XXXX
function formatarTelefone(input) {
    let telefone = input.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (telefone.length > 0) {
        telefone = `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7, 11)}`;
    }
    input.value = telefone;
}

// Função para formatar o campo de comissão
function formatarComissao(input) {
    const servicoId = document.getElementById('servicoVenda').value;
    const servico = dados.servicos.find(s => s.id == servicoId);

    if (servico) {
        if (servico.tipoComissao === 'fixa') {
            // Formata como moeda (R$)
            let valor = input.value.replace(/\D/g, '');
            valor = (Number(valor) / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            input.value = valor;
        } else if (servico.tipoComissao === 'porcentagem') {
            // Formata como porcentagem (%)
            let valor = input.value.replace(/\D/g, '');
            valor = (Number(valor) / 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            input.value = valor + '%';
        }
    }
}

// Função para formatar valores monetários
function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não for número
    valor = (Number(valor) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    input.value = valor;
}

// Função para exportar relatório em Excel
function exportarRelatorioExcel() {
    mostrarSpinner();
    setTimeout(() => {
        const colunasSelecionadas = Array.from(document.getElementById('filtroColunas').selectedOptions).map(option => option.value);
        const colunas = {
            data: 'Data da Venda',
            id: 'ID da Venda',
            vendedor: 'Nome do Vendedor',
            servico: 'Serviço Vendido',
            tipoComissao: 'Tipo de Comissão',
            nomeCliente: 'Nome do Cliente',
            empresaParceira: 'Empresa Parceira',
            valorVenda: 'Valor da Venda',
            valorBrutoReceber: 'Valor Bruto a Receber',
            comissao: 'Valor da Comissão',
            percentualComissao: 'Variável da Comissão'
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

        // Adicionar o total das comissões, valor bruto e valor da venda
        const totalComissao = dados.vendas.reduce((total, venda) => {
            if (venda.tipoComissao === 'fixa') {
                return total + venda.comissao;
            } else {
                return total + (venda.valorReceber * venda.comissao) / 100;
            }
        }, 0);

        const totalValorBruto = dados.vendas.reduce((total, venda) => total + venda.valorReceber, 0);
        const totalValorVenda = dados.vendas.reduce((total, venda) => total + venda.valorVenda, 0);

        data.push({
            'Valor da Venda': `Total: ${totalValorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
            'Valor Bruto a Receber': `Total: ${totalValorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
            'Valor da Comissão': `Total: ${totalComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Vendas');
        XLSX.writeFile(wb, 'relatorio_vendas.xlsx');
        esconderSpinner();
    }, 2000);
}

// Função para exportar relatório em PDF
function exportarRelatorioPDF() {
    const doc = new jsPDF();
    const tabela = document.getElementById('tabelaRelatorio');
    const headers = Array.from(tabela.querySelectorAll('th')).map(th => th.textContent);
    const rows = Array.from(tabela.querySelectorAll('tbody tr')).map(tr =>
        Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
    );

    // Adicionar o total das comissões, valor bruto e valor da venda
    const totalComissao = dados.vendas.reduce((total, venda) => {
        if (venda.tipoComissao === 'fixa') {
            return total + venda.comissao;
        } else {
            return total + (venda.valorReceber * venda.comissao) / 100;
        }
    }, 0);

    const totalValorBruto = dados.vendas.reduce((total, venda) => total + venda.valorReceber, 0);
    const totalValorVenda = dados.vendas.reduce((total, venda) => total + venda.valorVenda, 0);

    rows.push(['Totais:', '', '', '', '', '', '', totalValorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), totalValorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), totalComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })]);

    doc.autoTable({
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save('relatorio_vendas.pdf');
}

// Função para atualizar o tipo de comissão ao selecionar um serviço
function atualizarTipoComissao() {
    const servicoId = document.getElementById('servicoVenda').value;
    const servico = dados.servicos.find(s => s.id == servicoId);

    if (servico) {
        const tipoComissaoInfo = document.getElementById('tipoComissaoInfo');
        tipoComissaoInfo.textContent = `Tipo de Comissão: ${servico.tipoComissao === 'fixa' ? 'Fixa' : 'Porcentagem'}`;
    } else {
        document.getElementById('tipoComissaoInfo').textContent = '';
    }
}

// Função para salvar as cores no localStorage
function salvarCores() {
    const corPrimaria = document.getElementById('corPrimaria').value;
    const corSecundaria = document.getElementById('corSecundaria').value;

    localStorage.setItem('corPrimaria', corPrimaria);
    localStorage.setItem('corSecundaria', corSecundaria);

    alert('Cores salvas com sucesso!');
}

// Função para carregar as cores salvas ao iniciar o site
document.addEventListener('DOMContentLoaded', function () {
    // Carregar cores salvas do localStorage
    const corPrimariaSalva = localStorage.getItem('corPrimaria');
    const corSecundariaSalva = localStorage.getItem('corSecundaria');

    if (corPrimariaSalva && corSecundariaSalva) {
        document.getElementById('corPrimaria').value = corPrimariaSalva;
        document.getElementById('corSecundaria').value = corSecundariaSalva;
        atualizarTema(); // Aplicar as cores salvas
    }

    showTab('dashboard');
    preencherAnos();
    atualizarOpcoesVendedores();
    atualizarOpcoesServicos();
    atualizarOpcoesEmpresas();
    inicializarGraficos();
});

// Função para atualizar o tema com base na cor selecionada
function atualizarTema() {
    const corPrimaria = document.getElementById('corPrimaria').value;
    const corSecundaria = document.getElementById('corSecundaria').value;

    // Aplicar a cor primária
    document.documentElement.style.setProperty('--primary', corPrimaria);
    document.documentElement.style.setProperty('--primary-light', `${corPrimaria}99`);
    document.documentElement.style.setProperty('--primary-dark', `${corPrimaria}cc`);

    // Aplicar a cor secundária como background da página
    document.documentElement.style.setProperty('--secondary', corSecundaria);
    document.body.style.backgroundColor = corSecundaria;
}

// Restaurar tema padrão
function restaurarTemaPadrao() {
    document.getElementById('corPrimaria').value = '#4f46e5';
    document.getElementById('corSecundaria').value = '#ebebeb';
    atualizarTema(); // Aplicar as cores padrão
    localStorage.removeItem('corPrimaria'); // Remover cores salvas
    localStorage.removeItem('corSecundaria');
    alert('Cores padrão restauradas!');
}

// Função para mostrar o spinner de carregamento
function mostrarSpinner() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
}

// Função para esconder o spinner de carregamento
function esconderSpinner() {
    document.getElementById('loadingSpinner').classList.add('d-none');
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
            <td>${venda.id}</td>
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
    const vendedorId = document.getElementById('filtroVendedorVendas').value;
    const servicoId = document.getElementById('filtroServicoVendas').value;
    const empresaId = document.getElementById('filtroEmpresaVendas').value;

    const dataInicialObj = dataInicial ? new Date(dataInicial.split('/').reverse().join('-')) : null;
    const dataFinalObj = dataFinal ? new Date(dataFinal.split('/').reverse().join('-')) : null;

    const vendasFiltradas = dados.vendas.filter(venda => {
        const dataVendaObj = new Date(venda.data.split('/').reverse().join('-'));

        const filtroData = (!dataInicialObj || dataVendaObj >= dataInicialObj) &&
                           (!dataFinalObj || dataVendaObj <= dataFinalObj);

        const filtroVendedor = !vendedorId || venda.vendedor === dados.vendedores.find(v => v.id == vendedorId).nome;
        const filtroServico = !servicoId || venda.servico === dados.servicos.find(s => s.id == servicoId).nome;
        const filtroEmpresa = !empresaId || venda.empresaParceira === dados.empresasParceiras.find(e => e.id == empresaId).nome;

        return filtroData && filtroVendedor && filtroServico && filtroEmpresa;
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

// Função para alternar a exibição das listas
function toggleList(listId) {
    const container = document.getElementById(`${listId}Container`);
    const arrow = document.getElementById(`arrow${listId.replace('List', '')}`);
    if (container.style.display === "none") {
        container.style.display = "block";
        arrow.textContent = "▲";
    } else {
        container.style.display = "none";
        arrow.textContent = "▼";
    }
}

// Função para atualizar os filtros de vendedores, serviços e empresas
function atualizarFiltrosVendas() {
    const selectVendedor = document.getElementById('filtroVendedorVendas');
    const selectServico = document.getElementById('filtroServicoVendas');
    const selectEmpresa = document.getElementById('filtroEmpresaVendas');

    selectVendedor.innerHTML = '<option value="">Todos</option>';
    selectServico.innerHTML = '<option value="">Todos</option>';
    selectEmpresa.innerHTML = '<option value="">Todas</option>';

    dados.vendedores.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor.id;
        option.textContent = vendedor.nome;
        selectVendedor.appendChild(option);
    });

    dados.servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id;
        option.textContent = servico.nome;
        selectServico.appendChild(option);
    });

    dados.empresasParceiras.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa.id;
        option.textContent = empresa.nome;
        selectEmpresa.appendChild(option);
    });
}
