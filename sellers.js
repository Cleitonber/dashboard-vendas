// sellers.js
export function addSeller(nome, email, telefone) {
    const novoVendedor = {
        id: dados.vendedores.length + 1,
        nome: nome,
        email: email,
        telefone: telefone
    };
    dados.vendedores.push(novoVendedor);
    return novoVendedor;
}

export function updateSeller(id, nome, email, telefone) {
    const vendedor = dados.vendedores.find(v => v.id === id);
    if (vendedor) {
        vendedor.nome = nome;
        vendedor.email = email;
        vendedor.telefone = telefone;
    }
    return vendedor;
}

export function deleteSeller(id) {
    dados.vendedores = dados.vendedores.filter(v => v.id !== id);
}
