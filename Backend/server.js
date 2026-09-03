// ========================================
// EXPRESS FRAMEWORK
// ========================================

const express = require("express");
const cors = require("cors");
const path = require("path");

const {
    createDatabase,
    saveDatabase
} = require("./db");

const app = express();

const PORT = 3000;


app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..")));

async function startServer() {

    const db = await createDatabase();


    // ========================================
    // LOGIN PAGE
    // ========================================

    app.get("/", (req, res) => {
        res.sendFile(
            path.join(__dirname, "..", "index.html")
        );
    });


    // ========================================
    // TEST USERS
    // ========================================

    app.get("/api/users", (req, res) => {
        const result = db.exec(`SELECT * FROM users;`);
        res.json(result);
    });


    // ========================================
    // LOGIN API
    // ========================================

    app.post("/api/login", (req, res) => {

        const { mobile, password, role } = req.body;

        if (!mobile || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Mobile, password and role are required"
            });
        }

        const result = db.exec(`
            SELECT user_id, name, mobile, role, status
            FROM users
            WHERE mobile = '${mobile}'
            AND password = '${password}'
            AND role = '${role}'
            AND status = 'Active';
        `);

        if (result.length === 0 || result[0].values.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password"
            });
        }

        const user = result[0].values[0];
        res.json({
            success: true,
            message: "Login successful",
            user: {
                user_id: user[0],
                name: user[1],
                mobile: user[2],
                role: user[3],
                status: user[4]
            }
        });
    });


    // ========================================
    // TABLES APIs
    // ========================================

    app.get("/api/tables", (req, res) => {
        const result = db.exec(`
            SELECT table_id, customer_id, status
            FROM restaurant_tables
            ORDER BY CAST(SUBSTR(table_id, 2) AS INTEGER);
        `);
        if (result.length === 0 || result[0].values.length === 0) {
            return res.json([]);
        }
        const rows = result[0].values;
        const tables = rows.map(row => ({
            table_id: row[0],
            customer_id: row[1],
            status: row[2]
        }));
        res.json(tables);
    });

    app.post("/api/tables", (req, res) => {
        const result = db.exec(`
            SELECT table_id
            FROM restaurant_tables
            ORDER BY CAST(SUBSTR(table_id, 2) AS INTEGER) DESC
            LIMIT 1;
        `);
        let nextNumber = 1;
        if (result.length > 0 && result[0].values.length > 0) {
            const lastTableId = result[0].values[0][0];
            const lastNumber = parseInt(lastTableId.substring(1));
            nextNumber = lastNumber + 1;
        }
        const tableId = "T" + String(nextNumber).padStart(2, "0");
        db.run(`
            INSERT INTO restaurant_tables (table_id, customer_id, status)
            VALUES (?, NULL, 'Available');
        `, [tableId]);
        saveDatabase(db);
        res.status(201).json({
            success: true,
            message: "Table added successfully",
            table: { table_id: tableId, customer_id: null, status: "Available" }
        });
    });

    app.put("/api/tables/:tableId", (req, res) => {
        const tableId = req.params.tableId;
        const { customerId, status } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Table status is required"
            });
        }
        try {
            db.run(`
                UPDATE restaurant_tables
                SET customer_id = ?, status = ?
                WHERE table_id = ?;
            `, [customerId || null, status, tableId]);
            saveDatabase(db);
            res.json({
                success: true,
                message: "Table updated successfully",
                table: { table_id: tableId, customer_id: customerId || null, status: status }
            });
        } catch (error) {
            console.error("Table update error:", error);
            res.status(500).json({ success: false, message: "Failed to update table" });
        }
    });


    // ========================================
    // WAITERS APIs
    // ========================================

    app.post("/api/waiters", (req, res) => {
        const { userId, name, mobile, password } = req.body;
        if (!userId || !name || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        try {
            const existingUser = db.exec(`SELECT user_id FROM users WHERE user_id = ?`, [userId]);
            if (existingUser.length > 0 && existingUser[0].values.length > 0) {
                return res.status(409).json({ success: false, message: "User ID already exists" });
            }
            const existingMobile = db.exec(`SELECT mobile FROM users WHERE mobile = ?`, [mobile]);
            if (existingMobile.length > 0 && existingMobile[0].values.length > 0) {
                return res.status(409).json({ success: false, message: "Mobile number already exists" });
            }
            db.run(`
                INSERT INTO users (user_id, name, mobile, password, role, status)
                VALUES (?, ?, ?, ?, 'Waiter', 'Active')
            `, [userId, name, mobile, password]);
            saveDatabase(db);
            res.status(201).json({
                success: true,
                message: "Waiter added successfully",
                waiter: { user_id: userId, name: name, mobile: mobile, role: "Waiter", status: "Active" }
            });
        } catch (error) {
            console.error("Add waiter error:", error);
            res.status(500).json({ success: false, message: "Failed to add waiter" });
        }
    });

    app.get("/api/waiters", (req, res) => {
        try {
            const result = db.exec(`
                SELECT user_id, name, mobile, role, status
                FROM users
                WHERE role = 'Waiter'
                ORDER BY user_id;
            `);
            if (result.length === 0 || result[0].values.length === 0) {
                return res.json([]);
            }
            const rows = result[0].values;
            const waiters = rows.map(row => ({
                user_id: row[0],
                name: row[1],
                mobile: row[2],
                role: row[3],
                status: row[4]
            }));
            res.json(waiters);
        } catch (error) {
            console.error("Get waiters error:", error);
            res.status(500).json({ success: false, message: "Failed to load waiters" });
        }
    });


    // ========================================
    // FOOD APIs
    // ========================================

    app.get("/api/foods", (req, res) => {
        try {
            const result = db.exec(`
                SELECT food_id, name, category, food_price
                FROM foods
                ORDER BY food_id;
            `);
            if (result.length === 0 || result[0].values.length === 0) {
                return res.json([]);
            }
            const rows = result[0].values;
            const foods = rows.map(row => ({
                food_id: row[0],
                name: row[1],
                category: row[2],
                food_price: row[3]
            }));
            res.json(foods);
        } catch (error) {
            console.error("Get foods error:", error);
            res.status(500).json({ success: false, message: "Failed to load foods" });
        }
    });

    app.post("/api/foods", (req, res) => {
        const { name, category, food_price } = req.body;
        if (!name || !category || food_price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Food name, category and price are required"
            });
        }
        try {
            const result = db.exec(`
                SELECT food_id
                FROM foods
                ORDER BY CAST(SUBSTR(food_id, 2) AS INTEGER) DESC
                LIMIT 1;
            `);
            let nextNumber = 1;
            if (result.length > 0 && result[0].values.length > 0) {
                const lastFoodId = result[0].values[0][0];
                const lastNumber = parseInt(lastFoodId.substring(1));
                nextNumber = lastNumber + 1;
            }
            const foodId = "F" + String(nextNumber).padStart(2, "0");
            db.run(`
                INSERT INTO foods (food_id, name, category, food_price)
                VALUES (?, ?, ?, ?);
            `, [foodId, name, category, food_price]);
            saveDatabase(db);
            res.status(201).json({
                success: true,
                message: "Food added successfully",
                food: { food_id: foodId, name, category, food_price }
            });
        } catch (error) {
            console.error("Add food error:", error);
            res.status(500).json({ success: false, message: "Failed to add food" });
        }
    });


    // ========================================
    // 🆕 NEXT ORDER ID API
    // ========================================

    app.get("/api/next-order-id", (req, res) => {
        try {
            // Atomically increment counter and return new ID
            db.run(`
                UPDATE counters
                SET value = value + 1
                WHERE name = 'order_counter';
            `);
            const result = db.exec(`
                SELECT value FROM counters WHERE name = 'order_counter';
            `);
            const counter = result[0].values[0][0];
            const orderId = "ORD" + String(counter).padStart(3, "0");
            saveDatabase(db);
            res.json({ success: true, orderId });
        } catch (error) {
            console.error("Next order ID error:", error);
            res.status(500).json({ success: false, message: "Failed to generate order ID" });
        }
    });


    // ========================================
    // 🆕 NEXT CUSTOMER ID API
    // ========================================

    app.get("/api/next-customer-id", (req, res) => {
        try {
            db.run(`
                UPDATE counters
                SET value = value + 1
                WHERE name = 'customer_counter';
            `);
            const result = db.exec(`
                SELECT value FROM counters WHERE name = 'customer_counter';
            `);
            const counter = result[0].values[0][0];
            const customerId = "C" + String(counter).padStart(3, "0");
            saveDatabase(db);
            res.json({ success: true, customerId });
        } catch (error) {
            console.error("Next customer ID error:", error);
            res.status(500).json({ success: false, message: "Failed to generate customer ID" });
        }
    });


    // ========================================
    // CREATE ORDER API
    // ========================================

    // app.post("/api/orders", (req, res) => {
    //     const {
    //         orderId,
    //         customerId,
    //         tableId,
    //         waiterId,
    //         foodItems,
    //         totalAmount,
    //         paymentStatus
    //     } = req.body;

    //     if (!orderId || !customerId || !tableId || !waiterId || !foodItems || foodItems.length === 0 || totalAmount === undefined) {
    //         return res.status(400).json({
    //             success: false,
    //             message: "Incomplete order data"
    //         });
    //     }

    //     try {
    //         // Check duplicate order ID (just in case)
    //         const existingOrder = db.exec(`SELECT order_id FROM orders WHERE order_id = ?`, [orderId]);
    //         if (existingOrder.length > 0 && existingOrder[0].values.length > 0) {
    //             return res.status(409).json({ success: false, message: "Order ID already exists" });
    //         }

    //         // Insert customer
    //         db.run(`INSERT OR IGNORE INTO customers (customer_id) VALUES (?)`, [customerId]);

    //         // Insert order
    //         db.run(`
    //             INSERT INTO orders (order_id, customer_id, table_id, waiter_id, total_amount, payment_status)
    //             VALUES (?, ?, ?, ?, ?, ?);
    //         `, [orderId, customerId, tableId, waiterId, totalAmount, paymentStatus || "PAID"]);

    //         // Insert order items
    //         foodItems.forEach(food => {
    //             db.run(`
    //                 INSERT INTO order_items (order_id, food_id, quantity, price)
    //                 VALUES (?, ?, ?, ?);
    //             `, [orderId, food.food_id, food.quantity, food.price]);
    //         });

    //         // Insert payment
    //         db.run(`
    //             INSERT INTO payments (order_id, amount, payment_status)
    //             VALUES (?, ?, ?);
    //         `, [orderId, totalAmount, "PAID"]);

    //         saveDatabase(db);

    //         res.status(201).json({
    //             success: true,
    //             message: "Order saved successfully",
    //             order: {
    //                 order_id: orderId,
    //                 customer_id: customerId,
    //                 table_id: tableId,
    //                 waiter_id: waiterId,
    //                 total_amount: totalAmount,
    //                 payment_status: paymentStatus || "PAID"
    //             }
    //         });

    //     } catch (error) {
    //         console.error("Create order error:", error);
    //         res.status(500).json({ success: false, message: "Failed to save order", error: error.message });
    //     }
    // });
    app.post("/api/orders", (req, res) => {
    const { tableId, waiterId, foodItems, totalAmount, paymentStatus } = req.body;

    // Validate required fields (no orderId/customerId needed)
    if (!tableId || !waiterId || !foodItems || foodItems.length === 0 || totalAmount === undefined) {
        return res.status(400).json({ success: false, message: "Incomplete order data" });
    }

    try {
        // 🔥 Generate new order ID
        db.run(`UPDATE counters SET value = value + 1 WHERE name = 'order_counter';`);
        const orderResult = db.exec(`SELECT value FROM counters WHERE name = 'order_counter';`);
        const orderCounter = orderResult[0].values[0][0];
        const orderId = "ORD" + String(orderCounter).padStart(3, "0");

        // 🔥 Generate new customer ID
        db.run(`UPDATE counters SET value = value + 1 WHERE name = 'customer_counter';`);
        const customerResult = db.exec(`SELECT value FROM counters WHERE name = 'customer_counter';`);
        const customerCounter = customerResult[0].values[0][0];
        const customerId = "C" + String(customerCounter).padStart(3, "0");

        // Insert customer
        db.run(`INSERT OR IGNORE INTO customers (customer_id) VALUES (?)`, [customerId]);

        // Insert order
        db.run(`
            INSERT INTO orders (order_id, customer_id, table_id, waiter_id, total_amount, payment_status)
            VALUES (?, ?, ?, ?, ?, ?);
        `, [orderId, customerId, tableId, waiterId, totalAmount, paymentStatus || "PAID"]);

        // Insert order items
        foodItems.forEach(food => {
            db.run(`
                INSERT INTO order_items (order_id, food_id, quantity, price)
                VALUES (?, ?, ?, ?);
            `, [orderId, food.food_id, food.quantity, food.price]);
        });

        // Insert payment
        db.run(`
            INSERT INTO payments (order_id, amount, payment_status)
            VALUES (?, ?, ?);
        `, [orderId, totalAmount, "PAID"]);

        // ⭐ Update table with real customer ID (optional but recommended)
        db.run(`
            UPDATE restaurant_tables
            SET customer_id = ?
            WHERE table_id = ?;
        `, [customerId, tableId]);

        saveDatabase(db);

        res.status(201).json({
            success: true,
            message: "Order saved successfully",
            order: { order_id: orderId, customer_id: customerId, table_id: tableId, waiter_id: waiterId, total_amount: totalAmount, payment_status: paymentStatus || "PAID" }
        });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ success: false, message: "Failed to save order", error: error.message });
    }
});



 // ========================================
// ⭐ STATS API (For Reports) – FIXED
// ========================================

app.get("/api/stats", (req, res) => {
    try {
        // Helper function to safely get first value
        function getFirstValue(result, index = 0) {
            if (result.length > 0 && result[0].values.length > 0) {
                return result[0].values[0][index];
            }
            return 0;
        }

        // Total Revenue
        const revenueResult = db.exec(`
            SELECT COALESCE(SUM(total_amount), 0) as total_revenue
            FROM orders
            WHERE payment_status = 'PAID';
        `);
        const totalRevenue = getFirstValue(revenueResult);

        // Total Orders
        const ordersResult = db.exec(`SELECT COUNT(*) FROM orders;`);
        const totalOrders = getFirstValue(ordersResult);

        // Total Customers
        const customersResult = db.exec(`SELECT COUNT(*) FROM customers;`);
        const totalCustomers = getFirstValue(customersResult);

        // Total Tables
        const tablesResult = db.exec(`SELECT COUNT(*) FROM restaurant_tables;`);
        const totalTables = getFirstValue(tablesResult);

        // Total Waiters (Active)
        const waitersResult = db.exec(`
            SELECT COUNT(*) FROM users
            WHERE role = 'Waiter' AND status = 'Active';
        `);
        const totalWaiters = getFirstValue(waitersResult);

        // Total Foods
        const foodsResult = db.exec(`SELECT COUNT(*) FROM foods;`);
        const totalFoods = getFirstValue(foodsResult);

        // Recent Orders (last 5)
        const recentOrdersResult = db.exec(`
            SELECT order_id, customer_id, table_id, waiter_id,
                   total_amount, payment_status, created_at
            FROM orders
            ORDER BY created_at DESC
            LIMIT 5;
        `);

        let recentOrders = [];
        if (recentOrdersResult.length > 0 && recentOrdersResult[0].values.length > 0) {
            recentOrders = recentOrdersResult[0].values.map(row => ({
                order_id: row[0],
                customer_id: row[1],
                table_id: row[2],
                waiter_id: row[3],
                total_amount: row[4],
                payment_status: row[5],
                created_at: row[6]
            }));
        }

        res.json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalTables,
                totalWaiters,
                totalFoods,
                recentOrders
            }
        });

    } catch (error) {
        console.error("Stats API error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load stats: " + error.message
        });
    }
});

// ========================================
// GET ALL ORDERS (For Admin)
// ========================================

app.get("/api/orders", (req, res) => {
    try {
        // Orders table se saare orders, order items ke saath join karke
        // But simple approach: orders table + customer, waiter, table info
        const result = db.exec(`
            SELECT 
                o.order_id,
                o.customer_id,
                o.table_id,
                o.waiter_id,
                o.total_amount,
                o.payment_status,
                o.created_at,
                u.name AS waiter_name
            FROM orders o
            LEFT JOIN users u ON o.waiter_id = u.user_id
            ORDER BY o.created_at DESC;
        `);

        let orders = [];
        if (result.length > 0 && result[0].values.length > 0) {
            orders = result[0].values.map(row => ({
                order_id: row[0],
                customer_id: row[1],
                table_id: row[2],
                waiter_id: row[3],
                total_amount: row[4],
                payment_status: row[5],
                created_at: row[6],
                waiter_name: row[7] || 'N/A'
            }));
        }

        res.json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load orders"
        });
    }
});

    // ========================================
    // SERVER START
    // ========================================

    app.listen(PORT, () => {
        console.log("================================");
        console.log("Restaurant Backend Started");
        console.log("================================");
        console.log(`http://localhost:${PORT}`);
    });

}

startServer();

// ========================================
// GET ALL ORDERS (For Admin)
// ========================================

app.get("/api/orders", (req, res) => {
    // ... existing code ...
});

// ✅ Add reset route HERE (before app.listen)
// ========================================
// TEMPORARY: RESET DATABASE (Remove after use)
// ========================================

app.post("/api/reset-db", async (req, res) => {
    try {
        const fs = require("fs");
        const dbPath = path.join(__dirname, "..", "database", "restaurant.db");
        
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
            console.log("✅ Old database deleted.");
        }
        
        await createDatabase();
        
        res.json({ 
            success: true, 
            message: "Database reset successfully! New data inserted." 
        });
    } catch (error) {
        console.error("Reset error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ========================================
// SERVER START
// ========================================

app.listen(PORT, () => {
    console.log("================================");
    console.log("Restaurant Backend Started");
    console.log("================================");
    console.log(`http://localhost:${PORT}`);
});