function alternarAba(abaId) {
    const kanbanTab = document.getElementById("kanbanTab");
    const progressTab = document.getElementById("progressTab");
    const manageStudentsTab = document.getElementById("manageStudentsTab");
    
    if (kanbanTab) kanbanTab.style.display = "none";
    if (progressTab) progressTab.style.display = "none";
    if (manageStudentsTab) manageStudentsTab.style.display = "none";

    if (abaId === "kanban" && kanbanTab) kanbanTab.style.display = "block";
    else if (abaId === "progress" && progressTab) progressTab.style.display = "block";
    else if (abaId === "manageStudents" && manageStudentsTab) manageStudentsTab.style.display = "block";

    if (abaId === "progress" && currentUser && currentUser.tipo === "professor" && typeof renderProgresso === "function") {
        renderProgresso();
    }

    if (abaId === "manageStudents" && currentUser && currentUser.tipo === "professor" && typeof renderManageStudents === "function") {
        renderManageStudents();
    }

    document.querySelectorAll(".tab-btn").forEach(btn => {
        if (btn.dataset.tab === abaId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function initTabsEvents() {
    const botoesAbas = document.querySelectorAll(".tab-btn");
    botoesAbas.forEach(btn => {
        btn.addEventListener("click", () => {
            const abaId = btn.dataset.tab;
            if (abaId) {
                activeTab = abaId;
                alternarAba(abaId);
            }
        });
    });
}

function resetAppState() {
    const modalTarefa = document.getElementById("modalTarefa");
    const modalComentarios = document.getElementById("modalComentarios");
    if (modalTarefa) modalTarefa.style.display = "none";
    if (modalComentarios) modalComentarios.style.display = "none";

    activeTab = "kanban";
    alternarAba("kanban");
}

function initGlobalButtons() {
    const novaTarefaBtn = document.getElementById("novaTarefaBtn");
    if (novaTarefaBtn && typeof abrirModalNovaTarefa === "function") {
        const novoBtn = novaTarefaBtn.cloneNode(true);
        novaTarefaBtn.parentNode.replaceChild(novoBtn, novaTarefaBtn);
        novoBtn.addEventListener("click", abrirModalNovaTarefa);
    }
}

function iniciarVerificacaoPrazos() {
    if (typeof verificarPrazos === "function") {
        verificarPrazos();
        setInterval(() => {
            if (currentUser) verificarPrazos();
        }, 60000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        initTabsEvents();
        initGlobalButtons();
        iniciarVerificacaoPrazos();

        if (currentUser) {
            activeTab = "kanban";
            alternarAba("kanban");
            if (typeof refreshUI === "function") refreshUI();
        }
    }, 100);
});

let activeTab = "kanban";