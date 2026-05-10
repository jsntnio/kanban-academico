const modalTarefa = document.getElementById("modalTarefa");
const modalComentarios = document.getElementById("modalComentarios");
const formTarefa = document.getElementById("formTarefa");
const tarefaId = document.getElementById("tarefaId");
const tarefaTitulo = document.getElementById("tarefaTitulo");
const tarefaDescricao = document.getElementById("tarefaDescricao");
const tarefaData = document.getElementById("tarefaData");
const tarefaAlunoId = document.getElementById("tarefaAlunoId");
const modalTarefaTitle = document.getElementById("modalTarefaTitle");
const fecharModalTarefa = document.getElementById("fecharModalTarefa");
const fecharModalComentarios = document.getElementById("fecharModalComentarios");
const adicionarComentarioBtn = document.getElementById("adicionarComentarioBtn");
const novoComentario = document.getElementById("novoComentario");
const comentariosList = document.getElementById("comentariosList");

let tarefaAtualComentarios = null;

function abrirModalNovaTarefa() {
    if (!currentUser || currentUser.tipo !== "professor") {
        showToast("Apenas professores podem criar tarefas.");
        return;
    }
    tarefaId.value = "";
    tarefaTitulo.value = "";
    tarefaDescricao.value = "";
    tarefaData.value = "";
    if (tarefaAlunoId) tarefaAlunoId.value = "";
    modalTarefaTitle.innerText = "Nova Tarefa";
    modalTarefa.style.display = "flex";
}

function abrirModalEditarTarefa(tarefa) {
    if (!currentUser || currentUser.tipo !== "professor") {
        showToast("Apenas professores podem editar tarefas.");
        return;
    }
    tarefaId.value = tarefa.id;
    tarefaTitulo.value = tarefa.titulo;
    tarefaDescricao.value = tarefa.descricao;
    tarefaData.value = tarefa.data_entrega;
    if (tarefaAlunoId) tarefaAlunoId.value = tarefa.alunoId;
    modalTarefaTitle.innerText = "Editar Tarefa";
    modalTarefa.style.display = "flex";
}

function salvarTarefa(event) {
    event.preventDefault();
    if (!currentUser || currentUser.tipo !== "professor") {
        showToast("Apenas professores podem salvar tarefas.");
        return;
    }
    
    const id = parseInt(tarefaId.value);
    const titulo = tarefaTitulo.value.trim();
    const descricao = tarefaDescricao.value.trim();
    const data_entrega = tarefaData.value;
    let alunoId = tarefaAlunoId ? parseInt(tarefaAlunoId.value) : null;
    
    if (!titulo || !data_entrega) {
        showToast("Preencha titulo e data de entrega.");
        return;
    }
    
    if (currentUser.tipo === "professor" && (!alunoId || isNaN(alunoId))) {
        showToast("Selecione um aluno para a tarefa.");
        return;
    }
    
    if (id) {
        const index = tarefas.findIndex(t => t.id === id);
        if (index !== -1) {
            tarefas[index] = {
                ...tarefas[index],
                titulo: titulo,
                descricao: descricao,
                data_entrega: data_entrega,
                alunoId: alunoId
            };
            saveTasks();
            showToast("Tarefa atualizada com sucesso.");
            fecharModalTarefaFunc();
            if (typeof renderKanban === "function") renderKanban();
            verificarPrazos();
        }
    } else {
        const novoId = tarefas.length > 0 ? Math.max(...tarefas.map(t => t.id)) + 1 : 100;
        const novaTarefa = {
            id: novoId,
            titulo: titulo,
            descricao: descricao,
            data_entrega: data_entrega,
            status: "A Fazer",
            alunoId: alunoId,
            comentarios: []
        };
        tarefas.push(novaTarefa);
        saveTasks();
        showToast("Tarefa criada com sucesso.");
        fecharModalTarefaFunc();
        if (typeof renderKanban === "function") renderKanban();
        verificarPrazos();
    }
}

function excluirTarefa(taskId) {
    if (!currentUser || currentUser.tipo !== "professor") {
        showToast("Apenas professores podem excluir tarefas.");
        return;
    }
    const index = tarefas.findIndex(t => t.id === taskId);
    if (index !== -1) {
        tarefas.splice(index, 1);
        saveTasks();
        showToast("Tarefa excluida com sucesso.");
        if (typeof renderKanban === "function") renderKanban();
    }
}

function fecharModalTarefaFunc() {
    modalTarefa.style.display = "none";
    formTarefa.reset();
}

function abrirModalComentarios(tarefa) {
    tarefaAtualComentarios = tarefa;
    atualizarListaComentarios();
    novoComentario.value = "";
    modalComentarios.style.display = "flex";
}

function atualizarListaComentarios() {
    if (!tarefaAtualComentarios) return;
    const comentarios = tarefaAtualComentarios.comentarios || [];
    comentariosList.innerHTML = "";
    if (comentarios.length === 0) {
        comentariosList.innerHTML = '<p style="color: #6c757d; text-align: center;">Nenhum comentario ainda. Seja o primeiro!</p>';
        return;
    }
    comentarios.forEach((comentario, idx) => {
        const div = document.createElement("div");
        div.className = "comment-item";
        const dataFormatada = comentario.data ? new Date(comentario.data).toLocaleString() : "Data desconhecida";
        div.innerHTML = `
            <strong>${escapeHtml(comentario.autorNome)} (${comentario.autorTipo === "professor" ? "Professor" : "Aluno"}):</strong><br>
            ${escapeHtml(comentario.mensagem)}<br>
            <small style="color: #9ca3af;">${dataFormatada}</small>
        `;
        comentariosList.appendChild(div);
    });
}

function adicionarComentario() {
    if (!tarefaAtualComentarios) return;
    const mensagem = novoComentario.value.trim();
    if (!mensagem) {
        showToast("Digite um comentario antes de enviar.");
        return;
    }
    
    const comentario = {
        id: Date.now(),
        mensagem: mensagem,
        data: new Date().toISOString(),
        autorId: currentUser.id,
        autorNome: currentUser.nome,
        autorTipo: currentUser.tipo
    };
    
    if (!tarefaAtualComentarios.comentarios) tarefaAtualComentarios.comentarios = [];
    tarefaAtualComentarios.comentarios.push(comentario);
    saveTasks();
    
    const index = tarefas.findIndex(t => t.id === tarefaAtualComentarios.id);
    if (index !== -1) {
        tarefas[index] = tarefaAtualComentarios;
    }
    
    novoComentario.value = "";
    atualizarListaComentarios();
    showToast("Comentario adicionado com sucesso.");
    
    if (typeof renderKanban === "function") renderKanban();
}

function fecharModalComentariosFunc() {
    modalComentarios.style.display = "none";
    tarefaAtualComentarios = null;
}

function verificarPrazos() {
    if (!currentUser) return;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const depoisAmanha = new Date(hoje);
    depoisAmanha.setDate(depoisAmanha.getDate() + 2);
    
    let tarefasParaNotificar = [];
    
    if (currentUser.tipo === "professor") {
        tarefasParaNotificar = tarefas;
    } else {
        tarefasParaNotificar = tarefas.filter(t => t.alunoId === currentUser.id);
    }
    
    tarefasParaNotificar.forEach(tarefa => {
        if (tarefa.status === "Concluido") return;
        
        const dataEntrega = new Date(tarefa.data_entrega);
        dataEntrega.setHours(0, 0, 0, 0);
        
        if (dataEntrega < hoje) {
            showToast(`Atrasada: Tarefa "${tarefa.titulo}" venceu em ${tarefa.data_entrega}.`);
        } else if (dataEntrega.getTime() === hoje.getTime()) {
            showToast(`Urgente: Tarefa "${tarefa.titulo}" vence HOJE!`);
        } else if (dataEntrega.getTime() === amanha.getTime()) {
            showToast(`Aviso: Tarefa "${tarefa.titulo}" vence amanha!`);
        } else if (dataEntrega.getTime() === depoisAmanha.getTime()) {
            showToast(`Lembrete: Tarefa "${tarefa.titulo}" vence em 2 dias.`);
        }
    });
}

function initTasksEvents() {
    if (formTarefa) {
        formTarefa.addEventListener("submit", salvarTarefa);
    }

    if (fecharModalTarefa) {
        fecharModalTarefa.addEventListener("click", fecharModalTarefaFunc);
    }
    if (fecharModalComentarios) {
        fecharModalComentarios.addEventListener("click", fecharModalComentariosFunc);
    }

    if (adicionarComentarioBtn) {
        adicionarComentarioBtn.addEventListener("click", adicionarComentario);
    }

    window.addEventListener("click", (e) => {
        if (e.target === modalTarefa) fecharModalTarefaFunc();
        if (e.target === modalComentarios) fecharModalComentariosFunc();
    });

    if (typeof preencherSelectAlunosModal === "function") {
        preencherSelectAlunosModal();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initTasksEvents();
    setInterval(() => {
        if (currentUser) verificarPrazos();
    }, 30000);
});