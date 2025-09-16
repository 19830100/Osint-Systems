// Osint System - Frontend Application
class OsintSystem {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('osint_token');
        this.currentUser = null;
        this.currentPage = {
            employees: 1,
            payroll: 1
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        
        if (this.token) {
            this.validateToken();
        } else {
            this.showLoginPage();
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Employee management
        document.getElementById('addEmployeeBtn').addEventListener('click', () => {
            this.openEmployeeModal();
        });

        document.getElementById('employeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEmployee();
        });

        document.getElementById('employeeSearch').addEventListener('input', 
            this.debounce(() => this.loadEmployees(), 300)
        );

        // Payroll management
        document.getElementById('addPayrollBtn').addEventListener('click', () => {
            this.openPayrollModal();
        });

        document.getElementById('payrollForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePayroll();
        });

        document.getElementById('payrollMonth').addEventListener('change', () => {
            this.loadPayroll();
        });

        document.getElementById('payrollYear').addEventListener('change', () => {
            this.loadPayroll();
        });

        // Dashboard year filter
        document.getElementById('dashboardYear').addEventListener('change', () => {
            this.loadDashboard();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    // Authentication methods
    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        this.showLoading(true);
        errorDiv.classList.remove('active');

        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('osint_token', this.token);
                this.showAppPage();
            } else {
                errorDiv.textContent = data.error || 'Erro no login';
                errorDiv.classList.add('active');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Erro de conexão';
            errorDiv.classList.add('active');
        } finally {
            this.showLoading(false);
        }
    }

    async validateToken() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.showAppPage();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Token validation error:', error);
            this.logout();
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('osint_token');
        this.showLoginPage();
    }

    // Page management
    showLoginPage() {
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('appPage').classList.remove('active');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginError').classList.remove('active');
    }

    showAppPage() {
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('appPage').classList.add('active');
        
        if (this.currentUser) {
            document.getElementById('userInfo').textContent = 
                `${this.currentUser.username} (${this.currentUser.role})`;
        }

        this.switchTab('dashboard');
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Load data based on tab
        switch (tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'employees':
                this.loadEmployees();
                break;
            case 'payroll':
                this.loadPayroll();
                this.loadEmployeesForDropdown();
                break;
        }
    }

    // API request helper
    async apiRequest(endpoint, options = {}) {
        const url = `${this.API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            ...options
        };

        const response = await fetch(url, config);
        
        if (response.status === 401) {
            this.logout();
            throw new Error('Unauthorized');
        }

        return response;
    }

    // Dashboard methods
    async loadDashboard() {
        const year = document.getElementById('dashboardYear').value;
        
        try {
            // Load statistics
            const [employeesRes, payrollRes, summaryRes] = await Promise.all([
                this.apiRequest('/employees?limit=1000'),
                this.apiRequest(`/payroll?year=${year}&month=${new Date().getMonth() + 1}&limit=1000`),
                this.apiRequest(`/payroll/stats/summary?year=${year}`)
            ]);

            const employeesData = await employeesRes.json();
            const payrollData = await payrollRes.json();
            const summaryData = await summaryRes.json();

            // Update stats cards
            document.getElementById('totalEmployees').textContent = 
                employeesData.pagination.total;

            const totalPayroll = payrollData.payroll.reduce((sum, record) => 
                sum + parseFloat(record.net_salary), 0);
            document.getElementById('totalPayroll').textContent = 
                this.formatCurrency(totalPayroll);

            const avgSalary = totalPayroll / Math.max(payrollData.payroll.length, 1);
            document.getElementById('avgSalary').textContent = 
                this.formatCurrency(avgSalary);

            document.getElementById('currentYearDisplay').textContent = year;

            // Display monthly summary
            this.displayMonthlySummary(summaryData.monthly_summary);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    displayMonthlySummary(data) {
        const container = document.getElementById('monthlyChart');
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="chart-placeholder">
                    <i class="fas fa-chart-bar"></i>
                    <p>Nenhum dado disponível</p>
                </div>
            `;
            return;
        }

        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                       'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        let html = '<div class="summary-table"><table class="data-table">';
        html += '<thead><tr><th>Mês</th><th>Funcionários</th><th>Total Bruto</th><th>Total Líquido</th></tr></thead>';
        html += '<tbody>';
        
        data.forEach(row => {
            html += `
                <tr>
                    <td>${months[row.reference_month - 1]}</td>
                    <td>${row.employee_count}</td>
                    <td>${this.formatCurrency(row.total_gross)}</td>
                    <td>${this.formatCurrency(row.total_net)}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    // Employee methods
    async loadEmployees(page = 1) {
        const search = document.getElementById('employeeSearch').value;
        this.currentPage.employees = page;

        try {
            const response = await this.apiRequest(
                `/employees?page=${page}&limit=10&search=${encodeURIComponent(search)}`
            );
            const data = await response.json();

            this.displayEmployees(data.employees);
            this.displayPagination('employees', data.pagination);

        } catch (error) {
            console.error('Error loading employees:', error);
        }
    }

    displayEmployees(employees) {
        const tbody = document.getElementById('employeesTableBody');
        
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum funcionário encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.employee_code}</td>
                <td>${emp.full_name}</td>
                <td>${emp.position || '-'}</td>
                <td>${emp.department || '-'}</td>
                <td>${this.formatDate(emp.hire_date)}</td>
                <td><span class="status-badge status-${emp.status}">${this.getStatusLabel(emp.status)}</span></td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="osintSystem.editEmployee(${emp.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${this.currentUser.role === 'admin' ? `
                        <button class="btn btn-sm btn-danger" onclick="osintSystem.deleteEmployee(${emp.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    async loadEmployeesForDropdown() {
        try {
            const response = await this.apiRequest('/employees?limit=1000');
            const data = await response.json();
            
            const select = document.getElementById('payEmployee');
            select.innerHTML = '<option value="">Selecione um funcionário</option>';
            
            data.employees.forEach(emp => {
                select.innerHTML += `<option value="${emp.id}">${emp.employee_code} - ${emp.full_name}</option>`;
            });

        } catch (error) {
            console.error('Error loading employees for dropdown:', error);
        }
    }

    openEmployeeModal(employeeId = null) {
        const modal = document.getElementById('employeeModal');
        const title = document.getElementById('employeeModalTitle');
        const form = document.getElementById('employeeForm');
        
        form.reset();
        
        if (employeeId) {
            title.textContent = 'Editar Funcionário';
            this.loadEmployeeForEdit(employeeId);
        } else {
            title.textContent = 'Adicionar Funcionário';
        }
        
        form.dataset.employeeId = employeeId || '';
        modal.classList.add('active');
    }

    async loadEmployeeForEdit(employeeId) {
        try {
            const response = await this.apiRequest(`/employees/${employeeId}`);
            const data = await response.json();
            const employee = data.employee;

            document.getElementById('empCode').value = employee.employee_code;
            document.getElementById('empName').value = employee.full_name;
            document.getElementById('empCpf').value = employee.cpf || '';
            document.getElementById('empPosition').value = employee.position || '';
            document.getElementById('empDepartment').value = employee.department || '';
            document.getElementById('empHireDate').value = employee.hire_date || '';
            document.getElementById('empBirthDate').value = employee.birth_date || '';
            document.getElementById('empPhone').value = employee.phone || '';
            document.getElementById('empAddress').value = employee.address || '';

        } catch (error) {
            console.error('Error loading employee for edit:', error);
        }
    }

    async saveEmployee() {
        const form = document.getElementById('employeeForm');
        const formData = new FormData(form);
        const employeeId = form.dataset.employeeId;
        
        const employeeData = {};
        formData.forEach((value, key) => {
            if (value.trim()) employeeData[key] = value.trim();
        });

        try {
            const method = employeeId ? 'PUT' : 'POST';
            const endpoint = employeeId ? `/employees/${employeeId}` : '/employees';
            
            const response = await this.apiRequest(endpoint, {
                method,
                body: JSON.stringify(employeeData)
            });

            if (response.ok) {
                this.closeModal(document.getElementById('employeeModal'));
                this.loadEmployees(this.currentPage.employees);
                this.showMessage('Funcionário salvo com sucesso!', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Erro ao salvar funcionário', 'error');
            }

        } catch (error) {
            console.error('Error saving employee:', error);
            this.showMessage('Erro de conexão', 'error');
        }
    }

    async editEmployee(employeeId) {
        this.openEmployeeModal(employeeId);
    }

    async deleteEmployee(employeeId) {
        if (!confirm('Tem certeza que deseja excluir este funcionário?')) {
            return;
        }

        try {
            const response = await this.apiRequest(`/employees/${employeeId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.loadEmployees(this.currentPage.employees);
                this.showMessage('Funcionário excluído com sucesso!', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Erro ao excluir funcionário', 'error');
            }

        } catch (error) {
            console.error('Error deleting employee:', error);
            this.showMessage('Erro de conexão', 'error');
        }
    }

    // Payroll methods
    async loadPayroll(page = 1) {
        const month = document.getElementById('payrollMonth').value;
        const year = document.getElementById('payrollYear').value;
        this.currentPage.payroll = page;

        let params = `page=${page}&limit=10`;
        if (month) params += `&month=${month}`;
        if (year) params += `&year=${year}`;

        try {
            const response = await this.apiRequest(`/payroll?${params}`);
            const data = await response.json();

            this.displayPayroll(data.payroll);
            this.displayPagination('payroll', data.pagination);

        } catch (error) {
            console.error('Error loading payroll:', error);
        }
    }

    displayPayroll(payroll) {
        const tbody = document.getElementById('payrollTableBody');
        
        if (payroll.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum registro encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = payroll.map(record => `
            <tr>
                <td>${record.full_name}<br><small>${record.employee_code}</small></td>
                <td>${this.formatMonthYear(record.reference_month, record.reference_year)}</td>
                <td>${this.formatCurrency(record.base_salary)}</td>
                <td>${this.formatCurrency(record.gross_salary)}</td>
                <td>${this.formatCurrency(record.total_deductions)}</td>
                <td><strong>${this.formatCurrency(record.net_salary)}</strong></td>
                <td><span class="status-badge status-${record.status}">${this.getStatusLabel(record.status)}</span></td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="osintSystem.editPayroll(${record.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="osintSystem.viewPayrollDetail(${record.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    openPayrollModal(payrollId = null) {
        const modal = document.getElementById('payrollModal');
        const title = document.getElementById('payrollModalTitle');
        const form = document.getElementById('payrollForm');
        
        form.reset();
        
        // Set current month/year as default
        const now = new Date();
        document.getElementById('payMonth').value = now.getMonth() + 1;
        document.getElementById('payYear').value = now.getFullYear();
        
        if (payrollId) {
            title.textContent = 'Editar Registro de Folha';
            this.loadPayrollForEdit(payrollId);
        } else {
            title.textContent = 'Novo Registro de Folha';
        }
        
        form.dataset.payrollId = payrollId || '';
        modal.classList.add('active');
    }

    async loadPayrollForEdit(payrollId) {
        try {
            const response = await this.apiRequest(`/payroll/${payrollId}`);
            const data = await response.json();
            const payroll = data.payroll;

            document.getElementById('payEmployee').value = payroll.employee_id;
            document.getElementById('payMonth').value = payroll.reference_month;
            document.getElementById('payYear').value = payroll.reference_year;
            document.getElementById('payBaseSalary').value = payroll.base_salary;
            document.getElementById('payOvertimeHours').value = payroll.overtime_hours;
            document.getElementById('payOvertimeRate').value = payroll.overtime_rate;
            document.getElementById('payBonus').value = payroll.bonus;
            document.getElementById('payAllowances').value = payroll.allowances;
            document.getElementById('payOtherDeductions').value = payroll.other_deductions;

        } catch (error) {
            console.error('Error loading payroll for edit:', error);
        }
    }

    async savePayroll() {
        const form = document.getElementById('payrollForm');
        const formData = new FormData(form);
        const payrollId = form.dataset.payrollId;
        
        const payrollData = {};
        formData.forEach((value, key) => {
            payrollData[key] = value;
        });

        try {
            const method = payrollId ? 'PUT' : 'POST';
            const endpoint = payrollId ? `/payroll/${payrollId}` : '/payroll';
            
            const response = await this.apiRequest(endpoint, {
                method,
                body: JSON.stringify(payrollData)
            });

            if (response.ok) {
                this.closeModal(document.getElementById('payrollModal'));
                this.loadPayroll(this.currentPage.payroll);
                this.showMessage('Registro de folha salvo com sucesso!', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Erro ao salvar registro', 'error');
            }

        } catch (error) {
            console.error('Error saving payroll:', error);
            this.showMessage('Erro de conexão', 'error');
        }
    }

    async editPayroll(payrollId) {
        this.openPayrollModal(payrollId);
    }

    async viewPayrollDetail(payrollId) {
        try {
            const response = await this.apiRequest(`/payroll/${payrollId}`);
            const data = await response.json();
            const payroll = data.payroll;

            const detail = `
                <h3>Detalhes da Folha de Pagamento</h3>
                <p><strong>Funcionário:</strong> ${payroll.full_name} (${payroll.employee_code})</p>
                <p><strong>Período:</strong> ${this.formatMonthYear(payroll.reference_month, payroll.reference_year)}</p>
                <p><strong>Cargo:</strong> ${payroll.position}</p>
                <p><strong>Departamento:</strong> ${payroll.department}</p>
                <hr>
                <p><strong>Salário Base:</strong> ${this.formatCurrency(payroll.base_salary)}</p>
                <p><strong>Horas Extras:</strong> ${payroll.overtime_hours}h × ${this.formatCurrency(payroll.overtime_rate)}</p>
                <p><strong>Bonificações:</strong> ${this.formatCurrency(payroll.bonus)}</p>
                <p><strong>Benefícios:</strong> ${this.formatCurrency(payroll.allowances)}</p>
                <p><strong>Salário Bruto:</strong> ${this.formatCurrency(payroll.gross_salary)}</p>
                <hr>
                <p><strong>INSS:</strong> ${this.formatCurrency(payroll.inss_deduction)}</p>
                <p><strong>IRRF:</strong> ${this.formatCurrency(payroll.irrf_deduction)}</p>
                <p><strong>Outros Descontos:</strong> ${this.formatCurrency(payroll.other_deductions)}</p>
                <p><strong>Total de Descontos:</strong> ${this.formatCurrency(payroll.total_deductions)}</p>
                <hr>
                <p><strong>Salário Líquido:</strong> ${this.formatCurrency(payroll.net_salary)}</p>
            `;

            alert(detail.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n'));

        } catch (error) {
            console.error('Error viewing payroll detail:', error);
        }
    }

    // Pagination
    displayPagination(type, pagination) {
        const container = document.getElementById(`${type}Pagination`);
        const { page, pages, total } = pagination;
        
        if (pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button ${page === 1 ? 'disabled' : ''} onclick="osintSystem.load${type.charAt(0).toUpperCase() + type.slice(1)}(${page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
            html += `
                <button ${i === page ? 'class="active"' : ''} onclick="osintSystem.load${type.charAt(0).toUpperCase() + type.slice(1)}(${i})">
                    ${i}
                </button>
            `;
        }

        html += `
            <button ${page === pages ? 'disabled' : ''} onclick="osintSystem.load${type.charAt(0).toUpperCase() + type.slice(1)}(${page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = html;
    }

    // Utility methods
    closeModal(modal) {
        modal.classList.remove('active');
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.add('active');
        } else {
            loading.classList.remove('active');
        }
    }

    showMessage(message, type = 'error') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `${type}-message active`;
        alertDiv.textContent = message;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '10001';
        alertDiv.style.maxWidth = '300px';
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    formatMonthYear(month, year) {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                       'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${months[month - 1]}/${year}`;
    }

    getStatusLabel(status) {
        const labels = {
            'active': 'Ativo',
            'inactive': 'Inativo', 
            'terminated': 'Desligado',
            'pending': 'Pendente',
            'processed': 'Processado',
            'paid': 'Pago'
        };
        return labels[status] || status;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application
const osintSystem = new OsintSystem();