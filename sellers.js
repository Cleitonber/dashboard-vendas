const { db, collection, addDoc, updateDoc, doc, deleteDoc } = window.firebase;

// Função para adicionar vendedor
export async function addSeller(nome, email, telefone) {
    const novoVendedor = {
        nome: nome,
        email: email,
        telefone: telefone
    };

    try {
        const docRef = await addDoc(collection(db, 'vendedores'), novoVendedor);
        return { id: docRef.id, ...novoVendedor };
    } catch (error) {
        console.error('Erro ao adicionar vendedor: ', error);
    }
}

// Função para atualizar vendedor
export async function updateSeller(id, nome, email, telefone) {
    try {
        await updateDoc(doc(db, 'vendedores', id), {
            nome: nome,
            email: email,
            telefone: telefone
        });
        return { id, nome, email, telefone };
    } catch (error) {
        console.error('Erro ao atualizar vendedor: ', error);
    }
}

// Função para excluir vendedor
export async function deleteSeller(id) {
    try {
        await deleteDoc(doc(db, 'vendedores', id));
    } catch (error) {
        console.error('Erro ao excluir vendedor: ', error);
    }
}
