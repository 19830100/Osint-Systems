const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active', search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, u.username, u.email
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.status = $1
    `;
    const params = [status];

    if (search) {
      query += ` AND (e.full_name ILIKE $${params.length + 1} OR e.employee_code ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY e.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM employees WHERE status = $1';
    const countParams = [status];
    
    if (search) {
      countQuery += ` AND (full_name ILIKE $2 OR employee_code ILIKE $2)`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      employees: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT e.*, u.username, u.email
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee: result.rows[0] });

  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new employee
router.post('/', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const {
      employee_code,
      full_name,
      cpf,
      position,
      department,
      hire_date,
      birth_date,
      phone,
      address
    } = req.body;

    // Validation
    if (!employee_code || !full_name) {
      return res.status(400).json({ error: 'Employee code and full name are required' });
    }

    // Check if employee code already exists
    const existingEmployee = await db.query(
      'SELECT id FROM employees WHERE employee_code = $1',
      [employee_code]
    );

    if (existingEmployee.rows.length > 0) {
      return res.status(409).json({ error: 'Employee code already exists' });
    }

    const result = await db.query(`
      INSERT INTO employees 
      (employee_code, full_name, cpf, position, department, hire_date, birth_date, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [employee_code, full_name, cpf, position, department, hire_date, birth_date, phone, address]);

    res.status(201).json({
      message: 'Employee created successfully',
      employee: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee
router.put('/:id', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      cpf,
      position,
      department,
      hire_date,
      birth_date,
      phone,
      address,
      status
    } = req.body;

    const result = await db.query(`
      UPDATE employees 
      SET full_name = COALESCE($1, full_name),
          cpf = COALESCE($2, cpf),
          position = COALESCE($3, position),
          department = COALESCE($4, department),
          hire_date = COALESCE($5, hire_date),
          birth_date = COALESCE($6, birth_date),
          phone = COALESCE($7, phone),
          address = COALESCE($8, address),
          status = COALESCE($9, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [full_name, cpf, position, department, hire_date, birth_date, phone, address, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete employee (soft delete)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE employees SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['terminated', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      message: 'Employee terminated successfully',
      employee: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;