const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Calculate salary deductions (Brazilian tax system simplified)
const calculateDeductions = (grossSalary) => {
  let inssDeduction = 0;
  let irrfDeduction = 0;

  // INSS calculation (2024 simplified rates)
  if (grossSalary <= 1320.00) {
    inssDeduction = grossSalary * 0.075;
  } else if (grossSalary <= 2571.29) {
    inssDeduction = grossSalary * 0.09;
  } else if (grossSalary <= 3856.94) {
    inssDeduction = grossSalary * 0.12;
  } else if (grossSalary <= 7507.49) {
    inssDeduction = grossSalary * 0.14;
  } else {
    inssDeduction = 7507.49 * 0.14; // Maximum INSS
  }

  // IRRF calculation (simplified)
  const taxableIncome = grossSalary - inssDeduction;
  if (taxableIncome <= 2259.20) {
    irrfDeduction = 0;
  } else if (taxableIncome <= 2826.65) {
    irrfDeduction = (taxableIncome * 0.075) - 169.44;
  } else if (taxableIncome <= 3751.05) {
    irrfDeduction = (taxableIncome * 0.15) - 381.44;
  } else if (taxableIncome <= 4664.68) {
    irrfDeduction = (taxableIncome * 0.225) - 662.77;
  } else {
    irrfDeduction = (taxableIncome * 0.275) - 896.00;
  }

  return {
    inssDeduction: Math.max(0, inssDeduction),
    irrfDeduction: Math.max(0, irrfDeduction)
  };
};

// Get payroll records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      month, 
      year, 
      employee_id, 
      status 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, e.full_name, e.employee_code, e.position, e.department
      FROM payroll_records p
      JOIN employees e ON p.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (month) {
      query += ` AND p.reference_month = $${params.length + 1}`;
      params.push(month);
    }

    if (year) {
      query += ` AND p.reference_year = $${params.length + 1}`;
      params.push(year);
    }

    if (employee_id) {
      query += ` AND p.employee_id = $${params.length + 1}`;
      params.push(employee_id);
    }

    if (status) {
      query += ` AND p.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY p.reference_year DESC, p.reference_month DESC, e.full_name ASC`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*)
      FROM payroll_records p
      JOIN employees e ON p.employee_id = e.id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (month) {
      countQuery += ` AND p.reference_month = $${countParams.length + 1}`;
      countParams.push(month);
    }
    if (year) {
      countQuery += ` AND p.reference_year = $${countParams.length + 1}`;
      countParams.push(year);
    }
    if (employee_id) {
      countQuery += ` AND p.employee_id = $${countParams.length + 1}`;
      countParams.push(employee_id);
    }
    if (status) {
      countQuery += ` AND p.status = $${countParams.length + 1}`;
      countParams.push(status);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      payroll: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching payroll records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payroll record by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT p.*, e.full_name, e.employee_code, e.position, e.department, e.cpf
      FROM payroll_records p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    res.json({ payroll: result.rows[0] });

  } catch (error) {
    console.error('Error fetching payroll record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create payroll record
router.post('/', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const {
      employee_id,
      reference_month,
      reference_year,
      base_salary,
      overtime_hours = 0,
      overtime_rate = 0,
      bonus = 0,
      allowances = 0,
      other_deductions = 0
    } = req.body;

    // Validation
    if (!employee_id || !reference_month || !reference_year || !base_salary) {
      return res.status(400).json({ 
        error: 'Employee ID, reference month, reference year, and base salary are required' 
      });
    }

    // Check if record already exists
    const existingRecord = await db.query(
      'SELECT id FROM payroll_records WHERE employee_id = $1 AND reference_month = $2 AND reference_year = $3',
      [employee_id, reference_month, reference_year]
    );

    if (existingRecord.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Payroll record for this employee and period already exists' 
      });
    }

    // Calculate gross salary
    const overtimePay = overtime_hours * overtime_rate;
    const grossSalary = parseFloat(base_salary) + overtimePay + parseFloat(bonus) + parseFloat(allowances);

    // Calculate deductions
    const { inssDeduction, irrfDeduction } = calculateDeductions(grossSalary);
    const totalDeductions = inssDeduction + irrfDeduction + parseFloat(other_deductions);
    const netSalary = grossSalary - totalDeductions;

    const result = await db.query(`
      INSERT INTO payroll_records 
      (employee_id, reference_month, reference_year, base_salary, overtime_hours, 
       overtime_rate, bonus, allowances, gross_salary, inss_deduction, 
       irrf_deduction, other_deductions, total_deductions, net_salary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      employee_id, reference_month, reference_year, base_salary, overtime_hours,
      overtime_rate, bonus, allowances, grossSalary, inssDeduction,
      irrfDeduction, other_deductions, totalDeductions, netSalary
    ]);

    res.status(201).json({
      message: 'Payroll record created successfully',
      payroll: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating payroll record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payroll record
router.put('/:id', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      base_salary,
      overtime_hours,
      overtime_rate,
      bonus,
      allowances,
      other_deductions,
      payment_date,
      status
    } = req.body;

    // Get current record
    const currentRecord = await db.query(
      'SELECT * FROM payroll_records WHERE id = $1',
      [id]
    );

    if (currentRecord.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    const current = currentRecord.rows[0];

    // Recalculate if salary components changed
    const newBaseSalary = base_salary !== undefined ? parseFloat(base_salary) : current.base_salary;
    const newOvertimeHours = overtime_hours !== undefined ? parseFloat(overtime_hours) : current.overtime_hours;
    const newOvertimeRate = overtime_rate !== undefined ? parseFloat(overtime_rate) : current.overtime_rate;
    const newBonus = bonus !== undefined ? parseFloat(bonus) : current.bonus;
    const newAllowances = allowances !== undefined ? parseFloat(allowances) : current.allowances;
    const newOtherDeductions = other_deductions !== undefined ? parseFloat(other_deductions) : current.other_deductions;

    const overtimePay = newOvertimeHours * newOvertimeRate;
    const grossSalary = newBaseSalary + overtimePay + newBonus + newAllowances;

    const { inssDeduction, irrfDeduction } = calculateDeductions(grossSalary);
    const totalDeductions = inssDeduction + irrfDeduction + newOtherDeductions;
    const netSalary = grossSalary - totalDeductions;

    const result = await db.query(`
      UPDATE payroll_records 
      SET base_salary = $1,
          overtime_hours = $2,
          overtime_rate = $3,
          bonus = $4,
          allowances = $5,
          gross_salary = $6,
          inss_deduction = $7,
          irrf_deduction = $8,
          other_deductions = $9,
          total_deductions = $10,
          net_salary = $11,
          payment_date = COALESCE($12, payment_date),
          status = COALESCE($13, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [
      newBaseSalary, newOvertimeHours, newOvertimeRate, newBonus, newAllowances,
      grossSalary, inssDeduction, irrfDeduction, newOtherDeductions,
      totalDeductions, netSalary, payment_date, status, id
    ]);

    res.json({
      message: 'Payroll record updated successfully',
      payroll: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating payroll record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payroll summary/statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const result = await db.query(`
      SELECT 
        reference_month,
        COUNT(*) as employee_count,
        SUM(gross_salary) as total_gross,
        SUM(total_deductions) as total_deductions,
        SUM(net_salary) as total_net,
        AVG(net_salary) as avg_net_salary
      FROM payroll_records 
      WHERE reference_year = $1
      GROUP BY reference_month
      ORDER BY reference_month
    `, [year]);

    res.json({
      year: parseInt(year),
      monthly_summary: result.rows
    });

  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;