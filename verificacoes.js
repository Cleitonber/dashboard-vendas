// verificacoes.js
const elementosEssenciais = {
    tabs: ['relatoriosTab', 'vendasTab', 'dashboardTab'],
    graficos: ['vendasServicoChart', 'desempenhoVendedoresChart', 'vendasCategoriaChart'],
    tabelas: ['tabelaRelatorio', 'tabelaVendas'],
    formularios: ['vendedorForm', 'servicoForm', 'empresaForm', 'vendaForm']
};

function verificarElementos() {
    const elementosFaltantes = [];
    
    // Verificar cada categoria de elementos
    for (const [categoria, elementos] of Object.entries(elementosEssenciais)) {
        elementos.forEach(id => {
            if (!document.getElementById(id)) {
                elementosFaltantes.push({categoria, id});
            }
        });
    }
    
    return elementosFaltantes;
}
