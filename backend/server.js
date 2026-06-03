const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const authMiddleware = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend requests and credential sharing (session cookies)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session setup
app.use(session({
  name: 'hrms.sid',
  secret: process.env.SESSION_SECRET || 'dab_enterprise_secret_key_2026_kigali_rwanda',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // True in production when using HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Set user session properties
    req.session.user = {
      id: user.user_id,
      username: user.username,
      role: user.role
    };

    return res.status(200).json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, role, emp_id } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // Check if user already exists
    const [existing] = await db.query('SELECT user_id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password, role, emp_id) VALUES (?, ?, ?, ?)';
    await db.query(query, [username, hashedPassword, role || 'Staff', emp_id || null]);

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout session destroy error:', err);
      return res.status(500).json({ error: 'Could not log out. Please try again.' });
    }
    res.clearCookie('hrms.sid');
    return res.status(200).json({ message: 'Logout successful' });
  });
});

// Check session endpoint (GET /api/me)
app.get('/api/me', async (req, res) => {
  if (req.session && req.session.user) {
    try {
      const [rows] = await db.query(`
        SELECT u.user_id, u.username, u.role, u.emp_id,
               e.empfname, e.emplname, e.empgender, 
               DATE_FORMAT(e.empdob, "%Y-%m-%d") as empdob,
               e.empemail, e.emptelephone, e.empaddress,
               DATE_FORMAT(e.emphiredate, "%Y-%m-%d") as emphiredate,
               e.empstatus, d.d_name, p.posname
        FROM users u
        LEFT JOIN employee e ON u.emp_id = e.emp_id
        LEFT JOIN department d ON e.d_id = d.d_id
        LEFT JOIN \`position\` p ON e.pos_id = p.pos_id
        WHERE u.user_id = ?
      `, [req.session.user.id]);
      
      if (rows.length > 0) {
        return res.status(200).json({ user: rows[0] });
      } else {
        return res.status(200).json({ user: req.session.user });
      }
    } catch (err) {
      console.error('Session user DB lookup error:', err);
      return res.status(200).json({ user: req.session.user });
    }
  } else {
    return res.status(401).json({ error: 'No active session found.' });
  }
});


// ==========================================
// 2. EMPLOYEE CRUD ENDPOINTS (SECURED)
// ==========================================

// Fetch all employees (with joined department and position names)
app.get('/api/employees', authMiddleware, async (req, res) => {
  try {
    let query = `
      SELECT 
        e.emp_id, e.empfname, e.emplname, e.empgender, 
        DATE_FORMAT(e.empdob, "%Y-%m-%d") as empdob, 
        e.empemail, e.emptelephone, e.empaddress, 
        DATE_FORMAT(e.emphiredate, "%Y-%m-%d") as emphiredate, 
        e.empstatus, e.d_id, e.pos_id,
        d.d_name, p.posname, p.required_qualification,
        u.username AS account_username
      FROM employee e
      LEFT JOIN department d ON e.d_id = d.d_id
      LEFT JOIN \`position\` p ON e.pos_id = p.pos_id
      LEFT JOIN users u ON e.emp_id = u.emp_id
    `;
    
    if (req.session.user.role === 'Staff') {
      query += ` WHERE u.role IS NULL OR u.role != 'Admin' `;
    }
    
    query += ` ORDER BY e.emp_id DESC `;
    
    const [rows] = await db.query(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch employees error:', error);
    return res.status(500).json({ error: 'Failed to fetch employees.' });
  }
});

// Add new employee
app.post('/api/employees', authMiddleware, async (req, res) => {
  const {
    empfname, emplname, empgender, empdob,
    empemail, emptelephone, empaddress, emphiredate,
    empstatus, d_id, pos_id
  } = req.body;

  // Simple validation
  if (!empfname || !emplname || !empgender || !empdob || !empemail || !emptelephone || !empaddress || !emphiredate) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  try {
    // Validate if email already exists
    const [existing] = await db.query('SELECT emp_id FROM employee WHERE empemail = ?', [empemail]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Employee email already exists.' });
    }

    const query = `
      INSERT INTO employee 
        (empfname, emplname, empgender, empdob, empemail, emptelephone, empaddress, emphiredate, empstatus, d_id, pos_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      empfname, emplname, empgender, empdob,
      empemail, emptelephone, empaddress, emphiredate,
      empstatus || 'On Mission', 
      d_id ? parseInt(d_id) : null, 
      pos_id ? parseInt(pos_id) : null
    ]);

    return res.status(201).json({
      message: 'Employee added successfully',
      emp_id: result.insertId
    });
  } catch (error) {
    console.error('Add employee error:', error);
    return res.status(500).json({ error: 'Failed to add employee.' });
  }
});

// Update employee
app.put('/api/employees/:id', authMiddleware, async (req, res) => {
  const empId = req.params.id;
  const {
    empfname, emplname, empgender, empdob,
    empemail, emptelephone, empaddress, emphiredate,
    empstatus, d_id, pos_id
  } = req.body;

  if (!empfname || !emplname || !empgender || !empdob || !empemail || !emptelephone || !empaddress || !emphiredate) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  try {
    // Validate email uniqueness excluding current employee
    const [existing] = await db.query('SELECT emp_id FROM employee WHERE empemail = ? AND emp_id != ?', [empemail, empId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Employee email is already in use by another record.' });
    }

    const query = `
      UPDATE employee 
      SET 
        empfname = ?, emplname = ?, empgender = ?, empdob = ?, 
        empemail = ?, emptelephone = ?, empaddress = ?, emphiredate = ?, 
        empstatus = ?, d_id = ?, pos_id = ?
      WHERE emp_id = ?
    `;

    await db.query(query, [
      empfname, emplname, empgender, empdob,
      empemail, emptelephone, empaddress, emphiredate,
      empstatus,
      d_id ? parseInt(d_id) : null,
      pos_id ? parseInt(pos_id) : null,
      empId
    ]);

    return res.status(200).json({ message: 'Employee updated successfully.' });
  } catch (error) {
    console.error('Update employee error:', error);
    return res.status(500).json({ error: 'Failed to update employee.' });
  }
});

// Delete employee
app.delete('/api/employees/:id', authMiddleware, async (req, res) => {
  const empId = req.params.id;
  try {
    await db.query('DELETE FROM employee WHERE emp_id = ?', [empId]);
    return res.status(200).json({ message: 'Employee record deleted successfully.' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return res.status(500).json({ error: 'Failed to delete employee.' });
  }
});


// ==========================================
// 3. ADMIN REPORTS & LOOKUP ENDPOINTS
// ==========================================

// Get employee counts grouped by status (Active, Inactive, On Leave)
app.get('/api/reports/status', authMiddleware, async (req, res) => {
  try {
    const query = 'SELECT empstatus, COUNT(*) as count FROM employee GROUP BY empstatus';
    const [rows] = await db.query(query);
    
    // Initialize default status structure
    const statusCounts = {
      'On Leave': 0,
      'Left': 0,
      'Blacklisted': 0,
      'Deceased': 0,
      'On Mission': 0
    };

    rows.forEach(row => {
      if (statusCounts.hasOwnProperty(row.empstatus)) {
        statusCounts[row.empstatus] = row.count;
      }
    });

    return res.status(200).json(statusCounts);
  } catch (error) {
    console.error('Status report error:', error);
    return res.status(500).json({ error: 'Failed to fetch status reports.' });
  }
});

// Generate detailed employee report
app.get('/api/reports/employee/:empId', authMiddleware, async (req, res) => {
  if (req.session.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  const { empId } = req.params;

  try {
    const query = `
      SELECT 
        e.emp_id, e.empfname, e.emplname, e.empgender, 
        DATE_FORMAT(e.empdob, "%Y-%m-%d") as empdob, 
        e.empemail, e.emptelephone, e.empaddress, 
        DATE_FORMAT(e.emphiredate, "%Y-%m-%d") as emphiredate, 
        e.empstatus, e.d_id, e.pos_id,
        d.d_name, p.posname, p.required_qualification,
        u.username AS account_username
      FROM employee e
      LEFT JOIN department d ON e.d_id = d.d_id
      LEFT JOIN \`position\` p ON e.pos_id = p.pos_id
      LEFT JOIN users u ON e.emp_id = u.emp_id
      WHERE e.emp_id = ?
    `;

    const [rows] = await db.query(query, [empId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const employee = rows[0];
    const reportData = {
      reportGeneratedDate: new Date().toISOString().split('T')[0],
      employeeInfo: {
        id: employee.emp_id,
        fullName: `${employee.empfname} ${employee.emplname}`,
        firstName: employee.empfname,
        lastName: employee.emplname,
        email: employee.empemail,
        telephone: employee.emptelephone,
        address: employee.empaddress,
        gender: employee.empgender,
        dateOfBirth: employee.empdob
      },
      jobInfo: {
        hireDate: employee.emphiredate,
        status: employee.empstatus,
        department: employee.d_name || 'Unassigned',
        position: employee.posname || 'Unassigned Position',
        requiredQualification: employee.required_qualification || 'N/A'
      },
      systemInfo: {
        hasHRMSAccount: !!employee.account_username,
        username: employee.account_username || 'Not linked'
      }
    };

    return res.status(200).json(reportData);
  } catch (error) {
    console.error('Employee report error:', error);
    return res.status(500).json({ error: 'Failed to generate employee report.' });
  }
});

// Lookup endpoint for departments (to populate dropdowns dynamically)
app.get('/api/departments', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM department ORDER BY d_name ASC');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch departments error:', error);
    return res.status(500).json({ error: 'Failed to fetch departments.' });
  }
});

// Lookup endpoint for positions (to populate dropdowns dynamically)
app.get('/api/positions', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM `position` ORDER BY posname ASC');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch positions error:', error);
    return res.status(500).json({ error: 'Failed to fetch positions.' });
  }
});

// ==========================================
// 4. LINK & UNLINK USER ACCOUNT ENDPOINTS (SECURED)
// ==========================================

// Get all users (Staff role) who are not linked to any employee record
app.get('/api/users/unlinked', authMiddleware, async (req, res) => {
  if (req.session.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  try {
    const [rows] = await db.query(
      "SELECT user_id, username FROM users WHERE role = 'Staff' AND emp_id IS NULL ORDER BY username ASC"
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch unlinked users error:', error);
    return res.status(500).json({ error: 'Failed to retrieve unlinked user accounts.' });
  }
});

// Link an employee to a user account
app.post('/api/employees/:id/link', authMiddleware, async (req, res) => {
  if (req.session.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  const empId = req.params.id;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required to link an account.' });
  }

  try {
    // Check if employee exists
    const [empRows] = await db.query('SELECT emp_id FROM employee WHERE emp_id = ?', [empId]);
    if (empRows.length === 0) {
      return res.status(404).json({ error: 'Employee record not found.' });
    }

    // Check if user exists and is unlinked
    const [userRows] = await db.query('SELECT user_id, emp_id FROM users WHERE user_id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }
    if (userRows[0].emp_id !== null) {
      return res.status(400).json({ error: 'This user account is already linked to another employee.' });
    }

    // Perform update
    await db.query('UPDATE users SET emp_id = ? WHERE user_id = ?', [empId, userId]);

    return res.status(200).json({ message: 'User account linked to employee successfully.' });
  } catch (error) {
    console.error('Link account error:', error);
    return res.status(500).json({ error: 'Failed to link user account.' });
  }
});

// Unlink an employee from their user account
app.post('/api/employees/:id/unlink', authMiddleware, async (req, res) => {
  if (req.session.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  const empId = req.params.id;

  try {
    // Find the user currently linked to this employee
    const [userRows] = await db.query('SELECT user_id FROM users WHERE emp_id = ?', [empId]);
    if (userRows.length === 0) {
      return res.status(400).json({ error: 'No user account is currently linked to this employee.' });
    }

    // Unlink the user
    await db.query('UPDATE users SET emp_id = NULL WHERE emp_id = ?', [empId]);

    return res.status(200).json({ message: 'User account unlinked successfully.' });
  } catch (error) {
    console.error('Unlink account error:', error);
    return res.status(500).json({ error: 'Failed to unlink user account.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
