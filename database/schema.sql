-- Osint System Payroll Database Schema

-- Create database (run this manually)
-- CREATE DATABASE osint_payroll;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'employee')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    position VARCHAR(100),
    department VARCHAR(50),
    hire_date DATE,
    birth_date DATE,
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payroll records table
CREATE TABLE IF NOT EXISTS payroll_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    reference_month INTEGER NOT NULL CHECK (reference_month BETWEEN 1 AND 12),
    reference_year INTEGER NOT NULL,
    base_salary DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    overtime_hours DECIMAL(5,2) DEFAULT 0.00,
    overtime_rate DECIMAL(8,2) DEFAULT 0.00,
    bonus DECIMAL(10,2) DEFAULT 0.00,
    allowances DECIMAL(10,2) DEFAULT 0.00,
    gross_salary DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    inss_deduction DECIMAL(10,2) DEFAULT 0.00,
    irrf_deduction DECIMAL(10,2) DEFAULT 0.00,
    other_deductions DECIMAL(10,2) DEFAULT 0.00,
    total_deductions DECIMAL(10,2) DEFAULT 0.00,
    net_salary DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, reference_month, reference_year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_reference ON payroll_records(reference_year, reference_month);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll_records(status);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@osintsystem.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Sample employee data
INSERT INTO employees (user_id, employee_code, full_name, cpf, position, department, hire_date, birth_date, phone, status)
VALUES 
    (1, 'EMP001', 'João Silva Santos', '123.456.789-00', 'Desenvolvedor Senior', 'TI', '2023-01-15', '1985-03-20', '(11) 99999-1111', 'active'),
    (1, 'EMP002', 'Maria Oliveira Costa', '987.654.321-00', 'Analista de RH', 'Recursos Humanos', '2023-02-01', '1990-07-15', '(11) 99999-2222', 'active'),
    (1, 'EMP003', 'Carlos Pereira Lima', '456.789.123-00', 'Gerente de Projetos', 'TI', '2023-03-10', '1982-11-30', '(11) 99999-3333', 'active')
ON CONFLICT (employee_code) DO NOTHING;

-- Sample payroll data for current month
INSERT INTO payroll_records (employee_id, reference_month, reference_year, base_salary, overtime_hours, overtime_rate, bonus, allowances, gross_salary, inss_deduction, irrf_deduction, other_deductions, total_deductions, net_salary, payment_date, status)
VALUES 
    (1, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 8000.00, 10.0, 50.00, 1000.00, 500.00, 10000.00, 800.00, 1200.00, 100.00, 2100.00, 7900.00, CURRENT_DATE, 'paid'),
    (2, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 6000.00, 5.0, 40.00, 500.00, 200.00, 6900.00, 552.00, 690.00, 50.00, 1292.00, 5608.00, CURRENT_DATE, 'paid'),
    (3, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 12000.00, 0.0, 0.00, 2000.00, 800.00, 14800.00, 1184.00, 2220.00, 200.00, 3604.00, 11196.00, CURRENT_DATE, 'paid')
ON CONFLICT (employee_id, reference_month, reference_year) DO NOTHING;