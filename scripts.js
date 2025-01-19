const { db, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } = window.firebase;

let dados = {
    vendas: [],
    vendedores: [],
    servicos: [],
    empresasParceiras: []
};

let paginaAtualVendedores = 1;
const itensPorPagina = 5;

// Função para carregar dados do Firestore
async function carregarDados() {
    try {
        const vendasRef = collection(db, 'vendas');
        const vendedoresRef = collection(db, 'vendedores');
        const servicosRef = collection(db, 'servicos');
        const empresasRef = collection(db, 'empresasParceiras');

        const [vendasSnapshot, vendedoresSnapshot, servicosSnapshot, empresasSnapshot] = await Promise.all([
            getDocs(vendasRef),
            getDocs(vendedoresRef),
            getDocs(servicosRef),
            getDocs(empresasRef)
        ]);

        dados.vendas = vendasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dados.vendedores = vendedoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dados.servicos = servicosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dados.empresasParceiras = empresasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        atualizarOpcoesVendedores();
        atualizarOpcoesServicos();
        atualizarOpcoesEmpresas();
        atualizarDashboard();
    } catch (error) {
        console.error('Erro ao carregar dados: ', error);
    }
}

// Função para alternar entre as abas
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    const buttons = document.querySelectorAll('.nav-button');
    buttons.forEach(button => button.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Função para cadastrar vendedor
document.getElementById('vendedorForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const nomeVendedor = document.getElementById('nomeVendedor').value;
    const emailVendedor = document.getElementById('emailVendedor').value;
    const telefoneVendedor = document.getElementById('telefoneVendedor').value;

    const novoVendedor = {
        nome: nomeVendedor,
        email: emailVendedor,
        telefone: telefoneVendedor
    };

    try {
        await addDoc(collection(db, 'vendedores'), novoVendedor);
        alert('Vendedor cadastrado com sucesso!');
        limparCamposVendedor();
        carregarDados();
    } catch (error) {
        console.error('Erro ao cadastrar vendedor: ', error);
    }
});

// Função para editar vendedor
async function salvarEdicaoVendedor(id) {
    const vendedor = dados.vendedores.find(v => v.id === id);
    if (vendedor) {
        vendedor.nome = document.getElementById('editNomeVendedor').value;
        vendedor.email = document.getElementById('editEmailVendedor').value;
        vendedor.telefone = document.getElementById('editTelefoneVendedor').value;

        try {
            await updateDoc(doc(db, 'vendedores', id), {
                nome: vendedor.nome,
                email: vendedor.email,
                telefone: vendedor.telefone
            });
            alert('Vendedor atualizado com sucesso!');
            carregarDados();
        } catch (error) {
            console.error('Erro ao atualizar vendedor: ', error);
        }
    }
}

// Função para excluir vendedor
async function excluirVendedor(id) {
    if (confirm('Tem certeza que deseja excluir este vendedor?')) {
        try {
            await deleteDoc(doc(db, 'vendedores', id));
            alert('Vendedor excluído com sucesso!');
            carregarDados();
        } catch (error) {
            console.error('Erro ao excluir vendedor: ', error);
        }
    }
}

// Função para registrar venda
document.getElementById('vendaForm').addEventListener('submit', async function (e) {
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

    try {
        await addDoc(collection(db, 'vendas'), novaVenda);
        alert('Venda registrada com sucesso!');
        limparCamposVenda();
        carregarDados();
    } catch (error) {
        console.error('Erro ao registrar venda: ', error);
    }
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

// Função para formatar a data (dd/mm/aaaa)
function formatarDataInput(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
    }
    if (valor.length > 5) {
        valor = valor.replace(/^(\d{2})\/(\d{2})(\d{0,4})/, '$1/$2/$3');
    }
    input.value = valor;
}

// Função para formatar o telefone (XX) XXXXX-XXXX
function formatarTelefone(input) {
    let telefone = input.value.replace(/\D/g, '');
    if (telefone.length > 0) {
        telefone = `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7, 11)}`;
    }
    input.value = telefone;
}

// Função para formatar valores monetários
function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, '');
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
            vendedor: 'Nome do Vendedor',
            servico: 'Serviço Vendido',
            tipoComissao: 'Tipo de Comissão',
            nomeCliente: 'Nome do Cliente',
            empresaParceira: 'Empresa Parceira',
            comissao: 'Valor da Comissão',
            percentualComissao: 'Variável da Comissão',
            valorBrutoReceber: 'Valor Bruto a Receber'
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
        esconderSpinner();
    }, 2000);
}

// Função para exportar relatório em PDF
function exportarRelatorioPDF() {
    const doc = new jspdf.jsPDF();
    const tabela = document.getElementById('tabelaRelatorio');
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

    doc.save('relatorio_vendas.pdf');
}

// Função para inicializar gráficos
function inicializarGraficos() {
    const ctxVendasServico = document.getElementById('vendasServicoChart').getContext('2d');
    const ctxDesempenhoVendedores = document.getElementById('desempenhoVendedoresChart').getContext('2d');
    const ctxVendasCategoria = document.getElementById('vendasCategoriaChart').getContext('2d');

    new Chart(ctxVendasServico, {
        type: 'bar',
        data: {
            labels: ['Serviço A', 'Serviço B', 'Serviço C'],
            datasets: [{
                label: 'Vendas',
                data: [1200, 1900, 800],
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

    new Chart(ctxDesempenhoVendedores, {
        type: 'line',
        data: {
            labels: ['Vendedor 1', 'Vendedor 2', 'Vendedor 3'],
            datasets: [{
                label: 'Vendas',
                data: [1500, 2200, 1800],
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

    new Chart(ctxVendasCategoria, {
        type: 'pie',
        data: {
            labels: ['Categoria A', 'Categoria B', 'Categoria C'],
            datasets: [{
                label: 'Vendas',
                data: [300, 500, 200],
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
}

// Carregar dados ao inicializar a página
document.addEventListener('DOMContentLoaded', function () {
    showTab('dashboard');
    preencherAnos();
    carregarDados();
    inicializarGraficos();
});
