const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDb() {
  console.log('Initializing database HRMS...');
  
  // Connection config without database name first, to create it if it doesn't exist
  const connectionConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('Successfully connected to MySQL server.');

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing database schema script...');
    await connection.query(sqlScript);
    console.log('Database and table schemas created successfully.');

    // Now select the database to insert seed data
    await connection.query('USE HRMS;');

    // Seed departments if empty
    const [deptCount] = await connection.query('SELECT COUNT(*) as count FROM department');
    if (deptCount[0].count === 0) {
      console.log('Seeding departments...');
      const departments = ['IT', 'HR', 'Sales', 'Finance', 'Logistics'];
      for (const dept of departments) {
        await connection.query('INSERT INTO department (d_name) VALUES (?)', [dept]);
      }
    }

    // Seed positions if empty
    const [posCount] = await connection.query('SELECT COUNT(*) as count FROM `position`');
    if (posCount[0].count === 0) {
      console.log('Seeding positions...');
      const positions = [
        ['Software Engineer', "Bachelor's degree in Computer Science, 2+ years of experience"],
        ['HR Manager', "Bachelor's degree in Human Resources or Business Administration"],
        ['Sales Associate', 'High School Diploma, strong communication skills'],
        ['Accountant', "Bachelor's degree in Finance or CPA Rwanda certification"],
        ['Logistics Officer', 'Diploma in Procurement and Supply Chain Management']
      ];
      for (const pos of positions) {
        await connection.query('INSERT INTO `position` (posname, required_qualification) VALUES (?, ?)', pos);
      }
    }

    // Seed employees if empty
    const [empCount] = await connection.query('SELECT COUNT(*) as count FROM employee');
    if (empCount[0].count === 0) {
      console.log('Seeding employees...');
      const employees = [
        ['Alain Darcy', 'Muhirwa', 'Male', '1995-05-12', 'alain.darcy@dabenterprise.com', '+250788123456', 'Kigali, Rwanda', '2023-01-15', 'On Mission', 1, 1],
        ['Divine', 'Keza', 'Female', '1998-09-20', 'divine.keza@dabenterprise.com', '+250788223456', 'Musanze, Rwanda', '2024-03-01', 'On Leave', 2, 2],
        ['Jean', 'Nshuti', 'Male', '1990-11-05', 'jean.nshuti@dabenterprise.com', '+250788323456', 'Rubavu, Rwanda', '2022-06-10', 'Left', 3, 3],
        ['Alice', 'Umutesi', 'Female', '1993-02-28', 'alice.umutesi@dabenterprise.com', '+250788423456', 'Huye, Rwanda', '2021-08-20', 'Blacklisted', 4, 4],
        ['Eric', 'Manzi', 'Male', '1988-04-14', 'eric.manzi@dabenterprise.com', '+250788523456', 'Kigali, Rwanda', '2020-05-10', 'Deceased', 5, 5]
      ];
      for (const emp of employees) {
        await connection.query(
          `INSERT INTO employee (empfname, emplname, empgender, empdob, empemail, emptelephone, empaddress, emphiredate, empstatus, d_id, pos_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          emp
        );
      }
      console.log('Sample employees seeded.');
    }

    // Seed users if empty
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count === 0) {
      console.log('Seeding users...');
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const staffPasswordHash = await bcrypt.hash('staff123', 10);
      
      await connection.query('INSERT INTO users (username, password, role, emp_id) VALUES (?, ?, ?, ?)', ['admin', adminPasswordHash, 'Admin', 1]);
      await connection.query('INSERT INTO users (username, password, role, emp_id) VALUES (?, ?, ?, ?)', ['staff', staffPasswordHash, 'Staff', 2]);
      console.log('Users seeded: admin/admin123 (Admin, Linked to Alain Darcy), staff/staff123 (Staff, Linked to Divine Keza)');
    }

    await connection.end();
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
}

initDb();
