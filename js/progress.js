const progressTableContainer = document.getElementById("progressTableContainer");

function renderProgresso() {
    if (!progressTableContainer) return;
    if (!currentUser || currentUser.tipo !== "professor") {
        progressTableContainer.innerHTML = "<p>Apenas professores podem acessar esta funcionalidade.</p>";
        return;
    }

    const alunos = usuarios.filter(u => u.tipo === "aluno");
    if (alunos.length === 0) {
        progressTableContainer.innerHTML = "<p>Nenhum aluno cadastrado ainda.</p>";
        return;
    }

    const todasTarefas = [...tarefas];
    if (todasTarefas.length === 0) {
        progressTableContainer.innerHTML = "<p>Nenhuma tarefa criada ainda.</p>";
        return;
    }

    let html = '<div style="overflow-x: auto;"><table class="progress-table">';

    html += '<thead><tr><th>Aluno</th>';
    todasTarefas.forEach(tarefa => {
        html += `<th title="${escapeHtml(tarefa.descricao.substring(0, 50))}">${escapeHtml(tarefa.titulo)}<br><small>${tarefa.data_entrega}</small></th>`;
    });
    html += '<th>% Concluído</th></tr></thead><tbody>';

    alunos.forEach(aluno => {
        html += '<tr>';
        html += `<td><strong>${escapeHtml(aluno.nome)}</strong></td>`;
        let tarefasConcluidas = 0;
        todasTarefas.forEach(tarefa => {
            let status = "—";
            let classe = "badge-status";
            if (tarefa.alunoId === aluno.id) {
                status = tarefa.status;
                if (status === "Concluido") {
                    classe += " badge-concluido";
                    tarefasConcluidas++;
                } else if (status === "Em Andamento") {
                    classe += " badge-andamento";
                } else {
                    classe += " badge-fazer";
                }
            } else {
                status = "N/A";
                classe += " badge-na";
            }
            html += `<td><span class="${classe}">${status}</span></td>`;
        });
        const percentual = todasTarefas.filter(t => t.alunoId === aluno.id).length;
        const concluidoPercent = percentual ? Math.round((tarefasConcluidas / percentual) * 100) : 0;
        html += `<td>${concluidoPercent}% (${tarefasConcluidas}/${percentual})</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';

    html += '<div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 20px;">';
    html += '<h4>Resumo Geral</h4>';
    const totalTarefasAtribuidas = todasTarefas.filter(t => t.alunoId).length;
    const totalConcluidas = todasTarefas.filter(t => t.status === "Concluido").length;
    const totalEmAndamento = todasTarefas.filter(t => t.status === "Em Andamento").length;
    const totalAFazer = todasTarefas.filter(t => t.status === "A Fazer").length;
    html += `<p><strong>Tarefas totais:</strong> ${todasTarefas.length} | Atribuídas: ${totalTarefasAtribuidas} | Concluídas: ${totalConcluidas} | Em andamento: ${totalEmAndamento} | A fazer: ${totalAFazer}</p>`;
    html += '</div>';
    
    progressTableContainer.innerHTML = html;
}

function initProgressTab() {
    const progressTabBtn = document.getElementById("progressTabBtn");
    if (progressTabBtn && currentUser && currentUser.tipo === "professor") {
        progressTabBtn.addEventListener("click", () => {
            renderProgresso();
        });
    }
}

function injectProgressStyles() {
    if (!document.getElementById("progressExtraStyles")) {
        const style = document.createElement("style");
        style.id = "progressExtraStyles";
        style.textContent = `
            .badge-concluido { background: #d1fae5; color: #065f46; }
            .badge-andamento { background: #fed7aa; color: #9c4221; }
            .badge-fazer { background: #fee2e2; color: #b91c1c; }
            .badge-na { background: #e2e8f0; color: #4b5563; }
            .progress-table th, .progress-table td { text-align: center; vertical-align: middle; }
            .progress-table td:first-child { text-align: left; }
        `;
        document.head.appendChild(style);
    }
}

injectProgressStyles();

document.addEventListener("DOMContentLoaded", () => {
    const progressTabBtn = document.getElementById("progressTabBtn");
    if (progressTabBtn) {
        progressTabBtn.addEventListener("click", () => {
            if (currentUser && currentUser.tipo === "professor") {
                renderProgresso();
            }
        });
    }
});