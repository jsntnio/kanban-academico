function showToast(mensagem, duracao = 3000) {
    // Remove toast existente para evitar acumulo
    const toastExistente = document.querySelector(".toast-notify");
    if (toastExistente) toastExistente.remove();
    
    const toast = document.createElement("div");
    toast.className = "toast-notify";
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, duracao);
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatDate(dateString) {
    if (!dateString) return "";
    const partes = dateString.split("-");
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dateString;
}

function validarEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(String(email).toLowerCase());
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
            showToast(`Atrasada: Tarefa "${tarefa.titulo}" venceu em ${formatDate(tarefa.data_entrega)}.`);
        } else if (dataEntrega.getTime() === hoje.getTime()) {
            showToast(`Urgente: Tarefa "${tarefa.titulo}" vence HOJE!`);
        } else if (dataEntrega.getTime() === amanha.getTime()) {
            showToast(`Aviso: Tarefa "${tarefa.titulo}" vence amanha!`);
        } else if (dataEntrega.getTime() === depoisAmanha.getTime()) {
            showToast(`Lembrete: Tarefa "${tarefa.titulo}" vence em 2 dias.`);
        }
    });
}

function getAlunoNome(alunoId) {
    if (!usuarios) return "Desconhecido";
    const aluno = usuarios.find(u => u.id === alunoId && u.tipo === "aluno");
    return aluno ? aluno.nome : "Desconhecido";
}