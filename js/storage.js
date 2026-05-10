let usuarios = [];
let tarefas = [];

function loadData() {
    const storedUsers = localStorage.getItem("usuarios_kanban");
    const storedTasks = localStorage.getItem("tarefas_kanban");
    
    if (storedUsers) {
        usuarios = JSON.parse(storedUsers);
    } else {
        usuarios = [
            { id: 1, nome: "Professor Adriano", email: "prof@escola.com", senha: "123", tipo: "professor" },
            { id: 2, nome: "Ana Aluna", email: "aluno@escola.com", senha: "123", tipo: "aluno" }
        ];
        saveUsers();
    }
    
    if (storedTasks) {
        tarefas = JSON.parse(storedTasks);
    } else {
        tarefas = [
            { 
                id: 101, 
                titulo: "Pesquisa sobre Kanban", 
                descricao: "Entregar um resumo sobre a metodologia Kanban e suas vantagens.", 
                data_entrega: "2025-04-10", 
                status: "A Fazer", 
                alunoId: 2, 
                comentarios: [] 
            },
            { 
                id: 102, 
                titulo: "Exercicio de Matematica", 
                descricao: "Resolver os exercicios da pagina 45 (1 a 10).", 
                data_entrega: "2025-04-08", 
                status: "Em Andamento", 
                alunoId: 2, 
                comentarios: [] 
            }
        ];
        saveTasks();
    }
}

function saveUsers() {
    localStorage.setItem("usuarios_kanban", JSON.stringify(usuarios));
}

function saveTasks() {
    localStorage.setItem("tarefas_kanban", JSON.stringify(tarefas));
}

function getUsuarios() {
    return usuarios;
}

function getTarefas() {
    return tarefas;
}

loadData();