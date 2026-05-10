const kanbanBoard = document.getElementById("kanbanBoard");
const filterStatus = document.getElementById("filterStatus");
const filterDeadline = document.getElementById("filterDeadline");
const filterAluno = document.getElementById("filterAluno");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

let dragSourceId = null;

function preencherFiltroAlunos() {
    if (!filterAluno) return;
    const alunos = usuarios.filter(u => u.tipo === "aluno");
    filterAluno.innerHTML = '<option value="">Todos</option>';
    alunos.forEach(aluno => {
        const option = document.createElement("option");
        option.value = aluno.id;
        option.textContent = aluno.nome;
        filterAluno.appendChild(option);
    });
}

function getTarefasFiltradas() {
    let lista = [...tarefas];

    if (currentUser && currentUser.tipo === "aluno") {
        lista = lista.filter(t => t.alunoId === currentUser.id);
    }

    const statusValue = filterStatus ? filterStatus.value : "";
    if (statusValue) {
        lista = lista.filter(t => t.status === statusValue);
    }

    const dataFiltro = filterDeadline ? filterDeadline.value : "";
    if (dataFiltro) {
        lista = lista.filter(t => t.data_entrega <= dataFiltro);
    }

    if (currentUser && currentUser.tipo === "professor" && filterAluno && filterAluno.value) {
        const alunoId = parseInt(filterAluno.value);
        if (alunoId) {
            lista = lista.filter(t => t.alunoId === alunoId);
        }
    }
    
    return lista;
}

function criarCardTarefa(task) {
    const div = document.createElement("div");
    div.className = "task-card";
    let borderColor = "#e76f51";
    if (task.status === "Em Andamento") borderColor = "#f4a261";
    else if (task.status === "Concluido") borderColor = "#2b9348";
    div.style.borderLeftColor = borderColor;
    
    const prazo = task.data_entrega;
    const hoje = new Date().toISOString().slice(0,10);
    const isUrgent = (prazo <= hoje && task.status !== "Concluido");
    
    const alunoNome = getAlunoNome(task.alunoId);
    
    div.innerHTML = `
        <div class="task-title">
            <strong>${escapeHtml(task.titulo)}</strong>
            <span style="font-size:0.7rem;">${escapeHtml(alunoNome)}</span>
        </div>
        <div class="task-desc">${escapeHtml(task.descricao.substring(0, 100))}${task.descricao.length > 100 ? "..." : ""}</div>
        <div class="task-meta">
            <span class="deadline ${isUrgent ? 'urgent' : ''}">📅 ${task.data_entrega}</span>
        </div>
        <div class="task-actions">
            <button class="move-btn" data-id="${task.id}" data-move="left">← Mover esquerda</button>
            <button class="move-btn" data-id="${task.id}" data-move="right">Mover direita →</button>
            <button class="btn-comment" data-id="${task.id}" data-comment="open">💬 Comentarios (${task.comentarios?.length || 0})</button>
    `;

    if (currentUser && currentUser.tipo === "professor") {
        div.innerHTML += `
            <button class="edit-task" data-id="${task.id}" data-edit="open">✏️ Editar</button>
            <button class="delete-task" data-id="${task.id}" data-delete="open">🗑️ Excluir</button>
        `;
    }
    div.innerHTML += `</div>`;
    div.querySelectorAll(".move-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const taskId = parseInt(btn.dataset.id);
            const direction = btn.dataset.move;
            moverTarefa(taskId, direction);
        });
    });
    
    const commentBtn = div.querySelector(".btn-comment");
    if (commentBtn) {
        commentBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const taskId = parseInt(commentBtn.dataset.id);
            const tarefa = tarefas.find(t => t.id === taskId);
            if (tarefa && typeof abrirModalComentarios === "function") {
                abrirModalComentarios(tarefa);
            }
        });
    }
    
    if (currentUser && currentUser.tipo === "professor") {
        const editBtn = div.querySelector(".edit-task");
        if (editBtn) {
            editBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const taskId = parseInt(editBtn.dataset.id);
                const tarefa = tarefas.find(t => t.id === taskId);
                if (tarefa && typeof abrirModalEditarTarefa === "function") {
                    abrirModalEditarTarefa(tarefa);
                }
            });
        }
        const delBtn = div.querySelector(".delete-task");
        if (delBtn) {
            delBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const taskId = parseInt(delBtn.dataset.id);
                if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
                    excluirTarefa(taskId);
                }
            });
        }
    }

    div.setAttribute("draggable", "true");
    div.setAttribute("data-task-id", task.id);
    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragend", handleDragEnd);
    
    return div;
}

function handleDragStart(e) {
    const taskElement = e.target.closest("[data-task-id]");
    if (taskElement) {
        dragSourceId = parseInt(taskElement.getAttribute("data-task-id"));
        e.dataTransfer.setData("text/plain", dragSourceId);
        e.dataTransfer.effectAllowed = "move";
    }
}

function handleDragEnd(e) {
    dragSourceId = null;
}

function handleDropOnColumn(e) {
    e.preventDefault();
    const column = e.target.closest(".column");
    if (!column) return;
    
    const newStatus = column.getAttribute("data-status");
    const taskId = dragSourceId || parseInt(e.dataTransfer.getData("text/plain"));
    if (!taskId) return;
    
    const tarefa = tarefas.find(t => t.id === taskId);
    if (tarefa && tarefa.status !== newStatus) {
        tarefa.status = newStatus;
        saveTasks();
        renderKanban();
        showToast(`Tarefa "${tarefa.titulo}" movida para ${newStatus}`);
        if (typeof verificarPrazos === "function") verificarPrazos();
    }
}

function renderKanban() {
    if (!kanbanBoard) return;
    
    const colunas = [
        { titulo: "A Fazer", status: "A Fazer" },
        { titulo: "Em Andamento", status: "Em Andamento" },
        { titulo: "Concluido", status: "Concluido" }
    ];
    
    const tarefasFiltradas = getTarefasFiltradas();
    
    kanbanBoard.innerHTML = "";
    
    colunas.forEach(col => {
        const tasksCol = tarefasFiltradas.filter(t => t.status === col.status);
        const columnDiv = document.createElement("div");
        columnDiv.className = "column";
        columnDiv.setAttribute("data-status", col.status);
        
        columnDiv.innerHTML = `
            <div class="column-header">
                <span>${col.titulo}</span>
                <span>${tasksCol.length}</span>
            </div>
            <div class="task-list" data-column="${col.status}"></div>
        `;
        
        const taskListDiv = columnDiv.querySelector(".task-list");
        
        tasksCol.forEach(task => {
            const card = criarCardTarefa(task);
            taskListDiv.appendChild(card);
        });

        taskListDiv.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });
        taskListDiv.addEventListener("drop", handleDropOnColumn);
        
        kanbanBoard.appendChild(columnDiv);
    });
}

function moverTarefa(taskId, direction) {
    const tarefa = tarefas.find(t => t.id === taskId);
    if (!tarefa) return;
    
    const colunasOrdem = ["A Fazer", "Em Andamento", "Concluido"];
    const indexAtual = colunasOrdem.indexOf(tarefa.status);
    let novoIndex = indexAtual;
    
    if (direction === "left" && indexAtual > 0) novoIndex = indexAtual - 1;
    if (direction === "right" && indexAtual < colunasOrdem.length - 1) novoIndex = indexAtual + 1;
    
    if (novoIndex !== indexAtual) {
        tarefa.status = colunasOrdem[novoIndex];
        saveTasks();
        renderKanban();
        showToast(`Tarefa "${tarefa.titulo}" movida para ${tarefa.status}`);
        if (typeof verificarPrazos === "function") verificarPrazos();
    }
}

function resetFilters() {
    if (filterStatus) filterStatus.value = "";
    if (filterDeadline) filterDeadline.value = "";
    if (filterAluno && currentUser && currentUser.tipo === "professor") filterAluno.value = "";
    renderKanban();
}

function initKanbanEvents() {
    if (filterStatus) filterStatus.addEventListener("change", renderKanban);
    if (filterDeadline) filterDeadline.addEventListener("change", renderKanban);
    if (filterAluno) filterAluno.addEventListener("change", renderKanban);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", resetFilters);

    const novaTarefaBtn = document.getElementById("novaTarefaBtn");
    if (novaTarefaBtn) {
        novaTarefaBtn.addEventListener("click", () => {
            if (typeof abrirModalNovaTarefa === "function") {
                abrirModalNovaTarefa();
            }
        });
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
    });
}

function getAlunoNome(alunoId) {
    const aluno = usuarios.find(u => u.id === alunoId && u.tipo === "aluno");
    return aluno ? aluno.nome : "Desconhecido";
}

function refreshUI() {
    if (currentUser) {
        preencherFiltroAlunos();
        renderKanban();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initKanbanEvents();
    if (currentUser) {
        refreshUI();
    }
});