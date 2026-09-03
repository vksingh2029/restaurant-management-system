const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(
    __dirname,
    "..",
    "database",
    "restaurant.db"
);

// ========================================
// ENSURE DATABASE DIRECTORY EXISTS
// ========================================

function ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Directory created: ${dir}`);
    }
}

async function createDatabase() {

    const SQL = await initSqlJs();

    let db;

    // Ensure database directory exists
    ensureDirectoryExists(dbPath);

    // Agar database already exist karta hai
    if (fs.existsSync(dbPath)) {

        const fileBuffer = fs.readFileSync(dbPath);

        db = new SQL.Database(fileBuffer);

        console.log("✅ Existing database loaded.");

    } else {

        db = new SQL.Database();

        console.log("✅ New database created.");

    }


    // =========================
    // USERS TABLE
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS users (

            user_id TEXT PRIMARY KEY,

            name TEXT NOT NULL,

            mobile TEXT NOT NULL UNIQUE,

            password TEXT NOT NULL,

            role TEXT NOT NULL,

            status TEXT DEFAULT 'Active'

        );
    `);


    // =========================
    // FOODS TABLE
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS foods (

            food_id TEXT PRIMARY KEY,

            name TEXT NOT NULL,

            category TEXT NOT NULL,

            food_price REAL NOT NULL,

            status TEXT DEFAULT 'Available'

        );
    `);


    // =========================
    // RESTAURANT TABLES
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS restaurant_tables (

            table_id TEXT PRIMARY KEY,

            customer_id TEXT,

            status TEXT DEFAULT 'Available'

        );
    `);


    // =========================
    // CUSTOMERS TABLE
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS customers (

            customer_id TEXT PRIMARY KEY,

            created_at TEXT DEFAULT CURRENT_TIMESTAMP

        );
    `);


    // =========================
    // ORDERS TABLE
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS orders (

            order_id TEXT PRIMARY KEY,

            customer_id TEXT NOT NULL,

            table_id TEXT NOT NULL,

            waiter_id TEXT NOT NULL,

            total_amount REAL NOT NULL,

            payment_status TEXT DEFAULT 'PENDING',

            created_at TEXT DEFAULT CURRENT_TIMESTAMP

        );
    `);


    // =========================
    // ORDER ITEMS TABLE
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (

            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,

            order_id TEXT NOT NULL,

            food_id TEXT NOT NULL,

            quantity INTEGER NOT NULL,

            price REAL NOT NULL

        );
    `);


    // =========================
    // PAYMENTS TABLE
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS payments (

            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,

            order_id TEXT NOT NULL,

            amount REAL NOT NULL,

            payment_status TEXT NOT NULL,

            paid_at TEXT DEFAULT CURRENT_TIMESTAMP

        );
    `);


    // =========================
    // COUNTERS TABLE
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS counters (

            name TEXT PRIMARY KEY,

            value INTEGER NOT NULL DEFAULT 0

        );
    `);


    // =========================
    // INSERT INITIAL COUNTERS
    // =========================

    db.run(`
        INSERT OR IGNORE INTO counters (name, value)
        VALUES
            ('order_counter', 0),
            ('customer_counter', 0);
    `);


    // =========================
    // INSERT 3 ADMIN (UPDATED NAMES)
    // =========================

    db.run(`
        INSERT OR IGNORE INTO users
        (user_id, name, mobile, password, role, status)
        VALUES
        ('A001', 'Vikram', '9000000001', '9000000001', 'ADMIN', 'Active'),
        ('A002', 'Rahul', '9000000002', '9000000002', 'ADMIN', 'Active'),
        ('A003', 'Yogayata', '9000000003', '9000000003', 'ADMIN', 'Active');
    `);


    // ========================================
    // INSERT 4 DEFAULT RESTAURANT TABLES
    // ========================================

    for (let i = 1; i <= 4; i++) {

        const tableId = "T" + String(i).padStart(2, "0");

        db.run(`
            INSERT OR IGNORE INTO restaurant_tables
            (
                table_id,
                customer_id,
                status
            )
            VALUES
            (
                ?,
                NULL,
                'Available'
            );
        `, [tableId]);

    }


    // ========================================
    // 🆕 ADD FOOD ITEMS
    // ========================================

    db.run(`
        INSERT OR IGNORE INTO foods (food_id, name, category, food_price, status)
        VALUES
            ('F01', 'Paneer Butter Masala', 'Main Course', 350, 'Available'),
            ('F02', 'Garlic Naan', 'Bread', 60, 'Available'),
            ('F03', 'Veg Biryani', 'Main Course', 280, 'Available'),
            ('F04', 'Chicken Tikka', 'Starter', 320, 'Available'),
            ('F05', 'Gulab Jamun', 'Dessert', 80, 'Available');
    `);
    console.log("✅ 5 Food items added.");


    // ========================================
    // 🆕 ADD WAITERS – VIKRAM & RAHUL
    // ========================================

    db.run(`
        INSERT OR IGNORE INTO users (user_id, name, mobile, password, role, status)
        VALUES
            ('W01', 'VIKRAM', '1234567890', '1234567890', 'Waiter', 'Active'),
            ('W02', 'RAHUL', '1234567891', '1234567891', 'Waiter', 'Active');
    `);
    console.log("✅ Waiters VIKRAM (W01) and RAHUL (W02) added.");


    // ========================================
    // 🆕 ADD 4 CUSTOMERS (C001, C002, C003, C004)
    // ========================================

    db.run(`
        INSERT OR IGNORE INTO customers (customer_id, created_at)
        VALUES
            ('C001', datetime('now')),
            ('C002', datetime('now')),
            ('C003', datetime('now')),
            ('C004', datetime('now'));
    `);
    console.log("✅ 4 Customers added.");


    // ========================================
    // 🆕 UPDATE TABLES – Assign customers to tables (Occupied)
    // ========================================

    db.run(`
        UPDATE restaurant_tables
        SET customer_id = CASE table_id
            WHEN 'T01' THEN 'C001'
            WHEN 'T02' THEN 'C002'
            WHEN 'T03' THEN 'C003'
            WHEN 'T04' THEN 'C004'
        END,
        status = 'Occupied'
        WHERE table_id IN ('T01', 'T02', 'T03', 'T04');
    `);
    console.log("✅ Tables assigned to customers (Occupied).");


    // ========================================
    // 🆕 ADD 4 ORDERS – All by RAHUL (W02)
    // ========================================

    // Order 1: C001, T01, Total = 350 + 60 = 410
    db.run(`
        INSERT INTO orders (order_id, customer_id, table_id, waiter_id, total_amount, payment_status, created_at)
        VALUES ('ORD001', 'C001', 'T01', 'W02', 410, 'PAID', datetime('now'));
    `);

    // Order 2: C002, T02, Total = 280 + 80 = 360
    db.run(`
        INSERT INTO orders (order_id, customer_id, table_id, waiter_id, total_amount, payment_status, created_at)
        VALUES ('ORD002', 'C002', 'T02', 'W02', 360, 'PAID', datetime('now'));
    `);

    // Order 3: C003, T03, Total = 320 + 60 = 380
    db.run(`
        INSERT INTO orders (order_id, customer_id, table_id, waiter_id, total_amount, payment_status, created_at)
        VALUES ('ORD003', 'C003', 'T03', 'W02', 380, 'PAID', datetime('now'));
    `);

    // Order 4: C004, T04, Total = 350 + 280 + 80 = 710
    db.run(`
        INSERT INTO orders (order_id, customer_id, table_id, waiter_id, total_amount, payment_status, created_at)
        VALUES ('ORD004', 'C004', 'T04', 'W02', 710, 'PAID', datetime('now'));
    `);
    console.log("✅ 4 Orders added (by RAHUL).");


    // ========================================
    // 🆕 ADD ORDER ITEMS (Foods in each order)
    // ========================================

    // Order 1: Paneer Butter Masala + Garlic Naan
    db.run(`
        INSERT INTO order_items (order_id, food_id, quantity, price)
        VALUES
            ('ORD001', 'F01', 1, 350),
            ('ORD001', 'F02', 1, 60);
    `);

    // Order 2: Veg Biryani + Gulab Jamun
    db.run(`
        INSERT INTO order_items (order_id, food_id, quantity, price)
        VALUES
            ('ORD002', 'F03', 1, 280),
            ('ORD002', 'F05', 1, 80);
    `);

    // Order 3: Chicken Tikka + Garlic Naan
    db.run(`
        INSERT INTO order_items (order_id, food_id, quantity, price)
        VALUES
            ('ORD003', 'F04', 1, 320),
            ('ORD003', 'F02', 1, 60);
    `);

    // Order 4: Paneer Butter Masala + Veg Biryani + Gulab Jamun
    db.run(`
        INSERT INTO order_items (order_id, food_id, quantity, price)
        VALUES
            ('ORD004', 'F01', 1, 350),
            ('ORD004', 'F03', 1, 280),
            ('ORD004', 'F05', 1, 80);
    `);
    console.log("✅ Order items added.");


    // ========================================
    // 🆕 ADD PAYMENTS for each order
    // ========================================

    db.run(`
        INSERT INTO payments (order_id, amount, payment_status, paid_at)
        VALUES
            ('ORD001', 410, 'PAID', datetime('now')),
            ('ORD002', 360, 'PAID', datetime('now')),
            ('ORD003', 380, 'PAID', datetime('now')),
            ('ORD004', 710, 'PAID', datetime('now'));
    `);
    console.log("✅ 4 Payments added.");


    // ========================================
    // 🆕 UPDATE COUNTERS – Set to 4 (so next IDs are ORD005, C005)
    // ========================================

    db.run(`
        UPDATE counters
        SET value = 4
        WHERE name IN ('order_counter', 'customer_counter');
    `);
    console.log("✅ Counters updated (order_counter = 4, customer_counter = 4).");


    // ========================================
    // SAVE DATABASE
    // ========================================

    saveDatabase(db);

    console.log("✅ All tables created.");
    console.log("✅ 3 Admin accounts inserted.");
    console.log("✅ 4 Restaurant tables inserted.");
    console.log("✅ 5 Food items added.");
    console.log("✅ Waiters VIKRAM (W01) & RAHUL (W02) added.");
    console.log("✅ 4 Orders added (by RAHUL).");
    console.log("✅ Counters initialized.");

    return db;
}


// ========================================
// SAVE DATABASE – WITH DIRECTORY CREATION
// ========================================

function saveDatabase(db) {

    const data = db.export();

    // 🔥 IMPORTANT: Ensure directory exists before writing file
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Directory created: ${dir}`);
    }

    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log("✅ Database saved successfully.");
}


module.exports = {
    createDatabase,
    saveDatabase
};