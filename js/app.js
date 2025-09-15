// Sample employee data (in a real application, this would come from the backend)
let employees = [
    {
        id: 1,
        name: "João Silva Santos",
        registration: "001",
        position: "Analista de Sistemas",
        salary: 8500.00,
        department: "Tecnologia da Informação",
        admissionDate: "2020-03-15"
    },
    {
        id: 2,
        name: "Maria Oliveira Costa",
        registration: "002",
        position: "Gerente de Recursos Humanos",
        salary: 12000.00,
        department: "Recursos Humanos",
        admissionDate: "2018-08-22"
    },
    {
        id: 3,
        name: "Carlos Eduardo Ferreira",
        registration: "003",
        position: "Contador Sênior",
        salary: 9500.00,
        department: "Financeiro",
        admissionDate: "2019-01-10"
    }
];

let currentUser = null;

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation
    setupNavigation();
    
    // Show home section by default
    showSection('home');
    
    // Set current month and year for reports
    const now = new Date();
    document.getElementById('reportMonth').value = String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('reportYear').value = now.getFullYear().toString();
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Load section-specific data
    if (sectionId === 'employees') {
        loadEmployeesList();
    }
}

// Search functionality
function searchEmployee() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchTerm) {
        resultsContainer.innerHTML = '<p>Por favor, digite um termo de busca.</p>';
        return;
    }
    
    const filteredEmployees = employees.filter(employee => 
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.registration.includes(searchTerm) ||
        employee.position.toLowerCase().includes(searchTerm) ||
        employee.department.toLowerCase().includes(searchTerm)
    );
    
    if (filteredEmployees.length === 0) {
        resultsContainer.innerHTML = '<p>Nenhum funcionário encontrado.</p>';
        return;
    }
    
    let html = '<h3>Resultados da Busca:</h3>';
    filteredEmployees.forEach(employee => {
        html += createEmployeeCard(employee);
    });
    
    resultsContainer.innerHTML = html;
}

function createEmployeeCard(employee) {
    return `
        <div class="employee-card">
            <div class="employee-name">${employee.name}</div>
            <div class="employee-info">
                <div class="info-item">
                    <span class="info-label">Matrícula:</span>
                    <span class="info-value">${employee.registration}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cargo:</span>
                    <span class="info-value">${employee.position}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Departamento:</span>
                    <span class="info-value">${employee.department}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Salário:</span>
                    <span class="info-value">R$ ${employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data de Admissão:</span>
                    <span class="info-value">${formatDate(employee.admissionDate)}</span>
                </div>
            </div>
        </div>
    `;
}

// Employee management
function showAddEmployeeForm() {
    document.getElementById('addEmployeeForm').classList.remove('hidden');
}

function hideAddEmployeeForm() {
    document.getElementById('addEmployeeForm').classList.add('hidden');
    document.getElementById('addEmployeeForm').querySelector('form').reset();
}

function addEmployee(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newEmployee = {
        id: employees.length + 1,
        name: document.getElementById('name').value,
        registration: document.getElementById('registration').value,
        position: document.getElementById('position').value,
        salary: parseFloat(document.getElementById('salary').value),
        department: document.getElementById('department').value,
        admissionDate: new Date().toISOString().split('T')[0]
    };
    
    // Check if registration already exists
    if (employees.some(emp => emp.registration === newEmployee.registration)) {
        alert('Matrícula já existe! Por favor, use uma matrícula diferente.');
        return;
    }
    
    employees.push(newEmployee);
    hideAddEmployeeForm();
    loadEmployeesList();
    
    showMessage('Funcionário adicionado com sucesso!', 'success');
}

function loadEmployeesList() {
    const container = document.getElementById('employeesList');
    
    if (employees.length === 0) {
        container.innerHTML = '<p>Nenhum funcionário cadastrado.</p>';
        return;
    }
    
    let html = '<h3>Lista de Funcionários:</h3>';
    employees.forEach(employee => {
        html += createEmployeeCard(employee);
    });
    
    container.innerHTML = html;
}

// Reports functionality
function generateReport() {
    const month = document.getElementById('reportMonth').value;
    const year = document.getElementById('reportYear').value;
    const resultsContainer = document.getElementById('reportResults');
    
    const monthNames = {
        '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
        '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
        '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };
    
    let html = `
        <h3>Relatório de Folha de Pagamento - ${monthNames[month]} de ${year}</h3>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Matrícula</th>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Departamento</th>
                    <th>Salário Bruto</th>
                    <th>Descontos</th>
                    <th>Salário Líquido</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let totalBruto = 0;
    let totalLiquido = 0;
    
    employees.forEach(employee => {
        const salarioBruto = employee.salary;
        const descontos = salarioBruto * 0.15; // 15% de desconto simulado
        const salarioLiquido = salarioBruto - descontos;
        
        totalBruto += salarioBruto;
        totalLiquido += salarioLiquido;
        
        html += `
            <tr>
                <td>${employee.registration}</td>
                <td>${employee.name}</td>
                <td>${employee.position}</td>
                <td>${employee.department}</td>
                <td>R$ ${salarioBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>R$ ${descontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>R$ ${salarioLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
            <tfoot>
                <tr style="font-weight: bold; background: #f8f9fa;">
                    <td colspan="4">TOTAL</td>
                    <td>R$ ${totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>R$ ${(totalBruto * 0.15).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>R$ ${totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
            </tfoot>
        </table>
    `;
    
    resultsContainer.innerHTML = html;
}

// Authentication
function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageContainer = document.getElementById('loginMessage');
    
    // Simple authentication (in a real app, this would be done securely on the backend)
    if (username === 'admin' && password === 'admin123') {
        currentUser = { username: 'admin', role: 'administrator' };
        showMessage('Login realizado com sucesso!', 'success');
        
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        // Redirect to employees section
        setTimeout(() => {
            showSection('employees');
        }, 1500);
    } else {
        showMessage('Usuário ou senha incorretos!', 'error');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('loginMessage');
    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
    
    // Auto-hide message after 3 seconds
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

// Search on Enter key
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchEmployee();
            }
        });
    }
});