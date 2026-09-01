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
    // INSERT 3 ADMIN
    // =========================

    db.run(`
        INSERT OR IGNORE INTO users
        (user_id, name, mobile, password, role, status)
        VALUES
        ('A001', 'Admin 1', '9000000001', '9000000001', 'ADMIN', 'Active'),
        ('A002', 'Admin 2', '9000000002', '9000000002', 'ADMIN', 'Active'),
        ('A003', 'Admin 3', '9000000003', '9000000003', 'ADMIN', 'Active');
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

    // Database save
    saveDatabase(db);

    console.log("✅ All tables created.");
    console.log("✅ 3 Admin accounts inserted.");
    console.log("✅ 4 Restaurant tables inserted.");
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




// const initSqlJs = require("sql.js");
// const fs = require("fs");
// const path = require("path");

// const dbPath = path.join(
//     __dirname,
//     "..",
//     "database",
//     "restaurant.db"
// );
// // ========================================
// // ENSURE DATABASE DIRECTORY EXISTS
// // ========================================

// function ensureDirectoryExists(filePath) {
//     const dir = path.dirname(filePath);
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//         console.log(`✅ Directory created: ${dir}`);
//     }
// }
// async function createDatabase() {

//     const SQL = await initSqlJs();

//     let db;

//     // Agar database already exist karta hai
//     if (fs.existsSync(dbPath)) {

//         const fileBuffer = fs.readFileSync(dbPath);

//         db = new SQL.Database(fileBuffer);

//         console.log("Existing database loaded.");

//     } else {

//         db = new SQL.Database();

//         console.log("New database created.");

//     }


//     // =========================
//     // USERS TABLE
//     // =========================

//     db.run(`
//         CREATE TABLE IF NOT EXISTS users (

//             user_id TEXT PRIMARY KEY,

//             name TEXT NOT NULL,

//             mobile TEXT NOT NULL UNIQUE,

//             password TEXT NOT NULL,

//             role TEXT NOT NULL,

//             status TEXT DEFAULT 'Active'

//         );
//     `);


//     // =========================
//     // FOODS TABLE
//     // =========================

//     db.run(`
//         CREATE TABLE IF NOT EXISTS foods (

//             food_id TEXT PRIMARY KEY,

//             name TEXT NOT NULL,

//             category TEXT NOT NULL,

//             food_price REAL NOT NULL,

//             status TEXT DEFAULT 'Available'

//         );
//     `);


//     // =========================
//     // RESTAURANT TABLES
//     // =========================

//     db.run(`
//         CREATE TABLE IF NOT EXISTS restaurant_tables (

//             table_id TEXT PRIMARY KEY,

//             customer_id TEXT,

//             status TEXT DEFAULT 'Available'

//         );
//     `);


//     // =========================
//     // CUSTOMERS TABLE
//     // =========================

//     db.run(`
//         CREATE TABLE IF NOT EXISTS customers (

//             customer_id TEXT PRIMARY KEY,

//             created_at TEXT DEFAULT CURRENT_TIMESTAMP

//         );
//     `);


//     // =========================
//     // ORDERS TABLE
//     // =========================

//     db.run(`
//         CREATE TABLE IF NOT EXISTS orders (

//             order_id TEXT PRIMARY KEY,

//             customer_id TEXT NOT NULL,

//             table_id TEXT NOT NULL,

//             waiter_id TEXT NOT NULL,

//             total_amount REAL NOT NULL,

//             payment_status TEXT DEFAULT 'PENDING',

//             created_at TEXT DEFAULT CURRENT_TIMESTAMP

//         );
//     `);


//     // =========================
//     // ORDER ITEMS TABLE
//     // =========================

//     db.run(`
//         CREATE TABLE IF NOT EXISTS order_items (

//             order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,

//             order_id TEXT NOT NULL,

//             food_id TEXT NOT NULL,

//             quantity INTEGER NOT NULL,

//             price REAL NOT NULL

//         );
//     `);


//     // =========================
//     // PAYMENTS TABLE
//     // =========================

//     db.run(`
//         CREATE TABLE IF NOT EXISTS payments (

//             payment_id INTEGER PRIMARY KEY AUTOINCREMENT,

//             order_id TEXT NOT NULL,

//             amount REAL NOT NULL,

//             payment_status TEXT NOT NULL,

//             paid_at TEXT DEFAULT CURRENT_TIMESTAMP

//         );
//     `);


//     // =========================
//     // COUNTERS TABLE (NEW)
//     // =========================

//     db.run(`
//         CREATE TABLE IF NOT EXISTS counters (

//             name TEXT PRIMARY KEY,

//             value INTEGER NOT NULL DEFAULT 0

//         );
//     `);


//     // =========================
//     // INSERT INITIAL COUNTERS
//     // =========================

//     db.run(`
//         INSERT OR IGNORE INTO counters (name, value)
//         VALUES
//             ('order_counter', 0),
//             ('customer_counter', 0);
//     `);


//     // =========================
//     // INSERT 3 ADMIN
//     // =========================

//     db.run(`
//         INSERT OR IGNORE INTO users
//         (user_id, name, mobile, password, role, status)
//         VALUES
//         ('A001', 'VIKRAM', '9000000001', '9000000001', 'ADMIN', 'Active'),
//         ('A002', 'RAHUL', '9000000002', '9000000002', 'ADMIN', 'Active'),
//         ('A003', 'YOGYATA', '9000000003', '9000000003', 'ADMIN', 'Active');
//     `);


//     // ========================================
//     // INSERT 4 DEFAULT RESTAURANT TABLES
//     // ========================================

//     for (let i = 1; i <= 4; i++) {

//         const tableId =
//             "T" + String(i).padStart(2, "0");

//         db.run(`
//             INSERT OR IGNORE INTO restaurant_tables
//             (
//                 table_id,
//                 customer_id,
//                 status
//             )
//             VALUES
//             (
//                 ?,
//                 NULL,
//                 'Available'
//             );
//         `, [tableId]);

//     }

//     // Database save
//     saveDatabase(db);

//     console.log("All tables created.");
//     console.log("3 Admin accounts inserted.");
//     console.log("4 Restaurant tables inserted.");
//     console.log("Counters initialized.");

//     return db;
// }


// // =========================
// // SAVE DATABASE
// // =========================

// function saveDatabase(db) {

//     const data = db.export();

//     fs.writeFileSync(
//         dbPath,
//         Buffer.from(data)
//     );

//     console.log("Database saved successfully.");

// }


// module.exports = {
//     createDatabase,
//     saveDatabase
// };
