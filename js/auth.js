let currentUser = null;

const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const displayUserName = document.getElementById("displayUserName");
const displayUserRole = document.getElementById("displayUserRole");
const logoutBtn = document.getElementById("logoutBtn");

function fazerLogin(email, senha) {
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (usuario) {
        currentUser = usuario;
        salvarSessao();
        atualizarInterfaceAposLogin();
        return true;
    }
    return false;
}

function salvarSessao() {
    if (currentUser) {
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
}

function carregarSessao() {
    const saved = sessionStorage.getItem("currentUser");
    if (saved) {
        currentUser = JSON.parse(saved);
        const existe = usuarios.some(u => u.id === currentUser.id);
        if (existe) {
            atualizarInterfaceAposLogin();
        } else {
            fazerLogout();
        }
    } else {
        loginScreen.style.display = "flex";
        dashboardScreen.style.display = "none";
    }
}

function atualizarInterfaceAposLogin() {
    if (currentUser) {
        displayUserName.innerText = currentUser.nome;
        displayUserRole.innerText = currentUser.tipo === "professor" ? "Professor" : "Aluno";
        
        loginScreen.style.display = "none";
        dashboardScreen.style.display = "block";

        const progressTabBtn = document.getElementById("progressTabBtn");
        const manageStudentsTabBtn = document.getElementById("manageStudentsTabBtn");
        const filterAlunoGroup = document.getElementById("filterAlunoGroup");
        const selectAlunoGroupModal = document.getElementById("selectAlunoGroup");
        
        if (currentUser.tipo === "professor") {
            if (progressTabBtn) progressTabBtn.style.display = "inline-block";
            if (manageStudentsTabBtn) manageStudentsTabBtn.style.display = "inline-block";
            if (filterAlunoGroup) filterAlunoGroup.style.display = "flex";
            if (selectAlunoGroupModal) selectAlunoGroupModal.style.display = "block";
        } else {
            if (progressTabBtn) progressTabBtn.style.display = "none";
            if (manageStudentsTabBtn) manageStudentsTabBtn.style.display = "none";
            if (filterAlunoGroup) filterAlunoGroup.style.display = "none";
            if (selectAlunoGroupModal) selectAlunoGroupModal.style.display = "none";
        }

        if (typeof refreshUI === "function") refreshUI();
        if (typeof preencherFiltroAlunos === "function") preencherFiltroAlunos();
        if (typeof preencherSelectAlunosModal === "function") preencherSelectAlunosModal();
    }
}

function fazerLogout() {
    currentUser = null;
    sessionStorage.removeItem("currentUser");
    loginScreen.style.display = "flex";
    dashboardScreen.style.display = "none";
    // Reseta possiveis estados de abas
    if (typeof resetAppState === "function") resetAppState();
}

function cadastrarAluno(nome, email, senha) {
    if (!currentUser || currentUser.tipo !== "professor") {
        showToast("Apenas professores podem cadastrar alunos.");
        return false;
    }
    if (!nome || !email || !senha) {
        showToast("Preencha todos os campos.");
        return false;
    }
    if (usuarios.some(u => u.email === email)) {
        showToast("E-mail ja cadastrado.");
        return false;
    }
    const novoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 3;
    const novoAluno = {
        id: novoId,
        nome: nome.trim(),
        email: email.trim(),
        senha: senha,
        tipo: "aluno"
    };
    usuarios.push(novoAluno);
    saveUsers();
    showToast(`Aluno ${nome} cadastrado com sucesso.`);
    if (typeof preencherFiltroAlunos === "function") preencherFiltroAlunos();
    if (typeof preencherSelectAlunosModal === "function") preencherSelectAlunosModal();
    if (typeof renderManageStudents === "function") renderManageStudents();
    return true;
}

function preencherSelectAlunosModal() {
    const selectAluno = document.getElementById("tarefaAlunoId");
    if (!selectAluno) return;
    const alunos = usuarios.filter(u => u.tipo === "aluno");
    selectAluno.innerHTML = '<option value="">Selecione um aluno</option>';
    alunos.forEach(aluno => {
        const option = document.createElement("option");
        option.value = aluno.id;
        option.textContent = `${aluno.nome} (${aluno.email})`;
        selectAluno.appendChild(option);
    });
}

function initAuthEvents() {
    const btnLogin = document.getElementById("btnLogin");
    const loginEmail = document.getElementById("loginEmail");
    const loginSenha = document.getElementById("loginSenha");
    
    if (btnLogin) {
        btnLogin.addEventListener("click", () => {
            const email = loginEmail.value.trim();
            const senha = loginSenha.value;
            if (fazerLogin(email, senha)) {
                showToast("Login realizado com sucesso.");
            } else {
                showToast("Email ou senha invalidos.");
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", fazerLogout);
    }

    const inputs = [loginEmail, loginSenha];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnLogin.click();
                }
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarSessao();
    initAuthEvents();
});