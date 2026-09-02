import API_BASE from '../config.js';

// ========================================
// GET LOGGED-IN USER
// ========================================

const loggedInUser = JSON.parse(localStorage.getItem("user"));

if (!loggedInUser) {
    alert("Please login first.");
    window.location.href = "../index.html";
    throw new Error("User not logged in");
}

const waiterName = loggedInUser.name;
const waiterUserId = loggedInUser.user_id;

document.getElementById("waiterName").textContent = waiterName;
document.getElementById("waiterUserId").textContent = waiterUserId;

// ========================================
// FOOD CONTAINER
// ========================================

const foodContainer = document.getElementById("foodContainer");

// ========================================
// LOAD FOODS FROM DATABASE
// ========================================

async function loadFoods() {
    try {
        const response = await fetch(`${API_BASE}/foods`);
        if (!response.ok) throw new Error("Failed to load foods");
        const foods = await response.json();
        renderFoods(foods);
    } catch (error) {
        console.error("Load foods error:", error);
        alert("Foods load nahi ho paaye.");
    }
}

function renderFoods(foods) {
    foodContainer.innerHTML = "";
    foods.forEach(food => {
        const card = document.createElement("div");
        card.className = "food_card";
        card.innerHTML = `
            <div class="fname">Dish: ${food.name}</div>
            <div class="fcatogry">${food.category}</div>
            <div class="fprice">Price: ₹${food.food_price}</div>
            <div class="fID">Food ID: ${food.food_id}</div>
            <div class="f_add">
                <button type="button" class="food-action">Add</button>
            </div>
        `;
        card.querySelector(".food-action").addEventListener("click", () => {
            addFood(food);
        });
        foodContainer.appendChild(card);
    });
}

loadFoods();

// ========================================
// SELECTED FOODS & ORDER
// ========================================

let selectedFoods = [];
let order = {
    orderId: null,
    customerId: null,
    tableId: null,
    foodItems: []
};

// ========================================
// FETCH NEXT IDs FROM SERVER
// ========================================

// async function fetchNextIds() {
//     try {
//         const [orderRes, customerRes] = await Promise.all([
//             fetch(`${API_BASE}/next-order-id`),
//             fetch(`${API_BASE}/next-customer-id`)
//         ]);
//         if (!orderRes.ok || !customerRes.ok) {
//             throw new Error("Failed to get IDs from server");
//         }
//         const orderData = await orderRes.json();
//         const customerData = await customerRes.json();
//         return {
//             orderId: orderData.orderId,
//             customerId: customerData.customerId
//         };
//     } catch (error) {
//         console.error("Fetch IDs error:", error);
//         alert("IDs generate nahi ho paaye. Please try again.");
//         return null;
//     }
// }

// ========================================
// PAGE LOAD – NO ID GENERATION + ENABLE BUTTONS
// ========================================

document.addEventListener("DOMContentLoaded", function () {
    order.orderId = null;
    order.customerId = null;
    order.tableId = null;
    order.foodItems = [];
    selectedFoods = [];

    renderSelectedFoods();
    document.getElementById("totalAmount").textContent = "0";
    document.getElementById("totalAmountGst").textContent = "0";
    document.getElementById("Gst").textContent = "0";
    document.getElementById("table-id").textContent = "NaN";
    document.getElementById("receipt").innerHTML = "";

    loadTables();
    console.log("🔄 Page loaded – No IDs generated. Click 'New Customer' to start.");

    // Enable New Customer buttons
    enableNewCustomerButtons(true);

    // ✅ ATTACH CLICK LISTENER FOR PERMANENT BUTTON (YEH LINE ADD HAI)
    const newCustomerBtn = document.getElementById("newCustomerBtnAlways");
    if (newCustomerBtn) {
        newCustomerBtn.addEventListener("click", startNewOrder);
    }
});

// ========================================
// HELPER: Enable/Disable New Customer Buttons
// ========================================

function enableNewCustomerButtons(enabled) {
    const buttons = [
        document.getElementById("newCustomerBtnAlways"),
        document.getElementById("newCustomerBtn") // receipt wala
    ];
    buttons.forEach(btn => {
        if (btn) {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? "1" : "0.5";
            btn.style.cursor = enabled ? "pointer" : "not-allowed";
        }
    });
}

// ========================================
// ADD FOOD
// ========================================

function addFood(food) {
    const existingFood = selectedFoods.find(item => item.food_id === food.food_id);
    if (existingFood) {
        existingFood.quantity++;
    } else {
        selectedFoods.push({
            food_id: food.food_id,
            name: food.name,
            price: food.food_price,
            quantity: 1
        });
    }
    order.foodItems = [...selectedFoods];
    renderSelectedFoods();
    console.log("SELECTED FOODS:", selectedFoods);
    console.log("ORDER:", order);
}

// ========================================
// RENDER SELECTED FOOD
// ========================================

function renderSelectedFoods() {
    const foodTableBody = document.getElementById("foodTableBody");
    foodTableBody.innerHTML = "";
    selectedFoods.forEach(food => {
        const itemTotal = food.price * food.quantity;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${food.name}</td>
            <td>₹${food.price}</td>
            <td>
                <div class="quantity-control">
                    <button type="button" onclick="decreaseQuantity('${food.food_id}')">−</button>
                    <span>${food.quantity}</span>
                    <button type="button" onclick="increaseQuantity('${food.food_id}')">+</button>
                </div>
            </td>
            <td>₹${itemTotal}</td>
        `;
        foodTableBody.appendChild(row);
    });
    calculateTotal();
}

function increaseQuantity(foodId) {
    const food = selectedFoods.find(item => item.food_id === foodId);
    if (food) {
        food.quantity++;
        order.foodItems = [...selectedFoods];
        renderSelectedFoods();
    }
}

function decreaseQuantity(foodId) {
    const food = selectedFoods.find(item => item.food_id === foodId);
    if (!food) return;
    if (food.quantity > 1) {
        food.quantity--;
    } else {
        selectedFoods = selectedFoods.filter(item => item.food_id !== foodId);
    }
    order.foodItems = [...selectedFoods];
    renderSelectedFoods();
}

function calculateTotal() {
    let total = 0;
    selectedFoods.forEach(food => {
        total += food.price * food.quantity;
    });
    const gst = total * 0.18;
    const toPay = total + gst;
    document.getElementById("totalAmount").textContent = total;
    document.getElementById("totalAmountGst").textContent = toPay;
    document.getElementById("Gst").textContent = gst;
}

// ========================================
// TABLE MANAGEMENT
// ========================================

let tables = [];

async function loadTables() {
    try {
        const response = await fetch(`${API_BASE}/tables`);
        if (!response.ok) throw new Error("Failed to load tables");
        const data = await response.json();
        tables = data.map(table => ({
            tableId: table.table_id,
            customerId: table.customer_id,
            status: table.status
        }));
        renderTableStatus();
    } catch (error) {
        console.error("Table loading error:", error);
        alert("Tables load nahi ho paaye.");
    }
}

function renderTableStatus() {
    const tableContainer = document.getElementById("tableStatusContainer");
    tableContainer.innerHTML = "";
    tables.forEach(table => {
        const card = document.createElement("div");
        card.className = "table-status-card";
        if (table.status === "Occupied") {
            card.classList.add("occupied-table");
        } else {
            card.classList.add("available-table");
        }
        card.innerHTML = `
            <div class="table-id">Table: ${table.tableId}</div>
            <div class="table-status">${table.status}</div>
            ${table.customerId ? `<div class="customer-id">Customer: ${table.customerId}</div>` : ""}
        `;
        card.addEventListener("click", async function () {
            // Occupied → Free
            if (table.status === "Occupied") {
                const confirmFree = confirm(`Table ${table.tableId} is occupied by ${table.customerId}.\n\nDo you want to make this table available?`);
                if (!confirmFree) return;
                try {
                    const response = await fetch(`${API_BASE}/tables/${table.tableId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ customerId: null, status: "Available" })
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message || "Failed to make table available");
                    table.status = "Available";
                    table.customerId = null;
                    if (order.tableId === table.tableId) {
                        order.tableId = null;
                        document.getElementById("table-id").textContent = "NaN";
                    }
                    renderTableStatus();
                    console.log("TABLE AVAILABLE:", result);
                } catch (error) {
                    console.error("Free table error:", error);
                    alert("Table available nahi ho paayi.");
                }
                return;
            }

            // Already selected different table
            if (order.tableId !== null && order.tableId !== table.tableId) {
                alert(`You already selected Table ${order.tableId}.\n\nFirst complete this order or select the same table.`);
                return;
            }

            // Available → Occupy
            try {
                const response = await fetch(`${API_BASE}/tables/${table.tableId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ customerId: order.customerId, status: "Occupied" })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Failed to occupy table");
                order.tableId = table.tableId;
                table.customerId = order.customerId;
                table.status = "Occupied";
                document.getElementById("table-id").textContent = table.tableId;
                renderTableStatus();
                console.log("TABLE OCCUPIED:", result);
            } catch (error) {
                console.error("Occupy table error:", error);
                alert("Table occupied nahi ho paayi.");
            }
        });
        tableContainer.appendChild(card);
    });
}

loadTables();

// ========================================
// COMPLETE ORDER BUTTON
// ========================================

document.getElementById("completeOrderBtn").addEventListener("click", completeOrder);

// ========================================
// CREATE FINAL ORDER OBJECT
// ========================================

function createFinalOrderObject() {
    let total = 0;
    order.foodItems.forEach(food => {
        total += food.price * food.quantity;
    });
    const gst = total * 0.18;
    const toPay = total + gst;
    return {
        orderId: order.orderId,
        customerId: order.customerId,
        tableId: order.tableId,
        waiterId: waiterUserId,
        waiterName: waiterName,
        foodItems: order.foodItems,
        totalAmount: toPay,
        paymentStatus: "PAID",
        date: new Date().toISOString()
    };
}

// ========================================
// COMPLETE ORDER
// ========================================

// async function completeOrder() {
//     if (order.foodItems.length === 0) {
//         alert("Please add food first.");
//         return;
//     }
//     if (order.tableId === null) {
//         alert("Please select a table first.");
//         return;
//     }
//     if (!order.orderId || !order.customerId) {
//         alert("Please start a new order first by clicking 'New Customer'.");
//         return;
//     }
//     const finalOrder = createFinalOrderObject();
//     try {
//         const response = await fetch(`${API_BASE}/orders`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(finalOrder)
//         });
//         const result = await response.json();
//         if (!response.ok) {
//             throw new Error(result.message || "Order save failed");
//         }
//         alert("Payment successful!");
//         generateReceipt(finalOrder);
//         // ✅ Payment ke baad New Customer button enable karein
//         enableNewCustomerButtons(true);
//         await loadTables();
//     } catch (error) {
//         console.error("Order save error:", error);
//         alert("Order database me save nahi hua.");
//     }
// }
// ========================================
// COMPLETE ORDER (FIXED)
// ========================================

async function completeOrder() {
    if (order.foodItems.length === 0) {
        alert("Please add food first.");
        return;
    }
    if (order.tableId === null) {
        alert("Please select a table first.");
        return;
    }

    // Calculate total with GST
    const totalAmount = calculateTotalAmount();

    // Prepare order data (without orderId/customerId)
    const orderData = {
        tableId: order.tableId,
        waiterId: waiterUserId,
        foodItems: order.foodItems,
        totalAmount: totalAmount,
        paymentStatus: "PAID"
    };

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Order save failed");
        }

        // ✅ Server se generated IDs
        const newOrderId = result.order.order_id;
        const newCustomerId = result.order.customer_id;

        // Update local order with real IDs
        order.orderId = newOrderId;
        order.customerId = newCustomerId;

        // ✅ Complete order object for receipt
        const finalOrder = {
            orderId: newOrderId,
            customerId: newCustomerId,
            tableId: order.tableId,
            waiterId: waiterUserId,
            waiterName: waiterName,
            foodItems: order.foodItems,
            totalAmount: totalAmount,
            paymentStatus: "PAID",
            date: new Date().toISOString()
        };

        alert("Payment successful!");
        generateReceipt(finalOrder); // ✅ Full object bhejo

        // Refresh tables and enable button
        await loadTables();
        enableNewCustomerButtons(true);

    } catch (error) {
        console.error("Order save error:", error);
        alert("Order database me save nahi hua.");
    }
}

// ========================================
// HELPER: Calculate Total with GST
// ========================================

// function calculateTotalAmount() {
//     let total = 0;
//     order.foodItems.forEach(food => {
//         total += food.price * food.quantity;
//     });
//     return total + (total * 0.18); // with GST
// }

// Helper: calculate total with GST (same as before)
function calculateTotalAmount() {
    let total = 0;
    order.foodItems.forEach(food => {
        total += food.price * food.quantity;
    });
    return total + (total * 0.18); // with GST
}
// ========================================
// GENERATE RECEIPT
// ========================================

function generateReceipt(finalOrder) {
    const receipt = document.getElementById("receipt");
    let total = 0;
    finalOrder.foodItems.forEach(food => {
        total += food.price * food.quantity;
    });
    const gst = total * 0.18;
    const toPay = total + gst;
    receipt.innerHTML = `
        <div class="receipt-content">
            <h2>RESTAURANT</h2>
            <p><strong>Order ID:</strong> ${finalOrder.orderId}</p>
            <p><strong>Customer ID:</strong> ${finalOrder.customerId}</p>
            <p><strong>Table ID:</strong> ${finalOrder.tableId}</p>
            <p><strong>Waiter ID:</strong> ${finalOrder.waiterId}</p>
            <p><strong>Waiter Name:</strong> ${finalOrder.waiterName}</p>
            <p><strong>Date:</strong> ${new Date(finalOrder.date).toLocaleString()}</p>
            <hr>
            <table>
                <thead><tr><th>Food</th><th>Qty</th><th>Amount</th></tr></thead>
                <tbody>
                    ${finalOrder.foodItems.map(food => {
                        const amount = food.price * food.quantity;
                        return `<tr><td>${food.name}</td><td>${food.quantity}</td><td>₹${amount.toFixed(2)}</td></tr>`;
                    }).join("")}
                </tbody>
            </table>
            <hr>
            <p><strong>Total:</strong> ₹${total.toFixed(2)}</p>
            <p><strong>GST 18%:</strong> ₹${gst.toFixed(2)}</p>
            <h3>Total Payable: ₹${toPay.toFixed(2)}</h3>
            <p><strong>Payment:</strong> PAID</p>
            <div class="receipt-buttons">
                <button type="button" id="printReceiptBtn">Print Receipt</button>
                <button type="button" id="downloadReceiptBtn">Download Receipt</button>
                <button type="button" id="newCustomerBtn">New Customer</button>
            </div>
        </div>
    `;
    document.getElementById("printReceiptBtn").addEventListener("click", printReceipt);
    document.getElementById("downloadReceiptBtn").addEventListener("click", downloadReceipt);
    document.getElementById("newCustomerBtn").addEventListener("click", startNewOrder);
}

function printReceipt() {
    const receiptContent = document.getElementById("receipt").innerHTML;
    const printWindow = window.open("", "", "width=500,height=700");
    if (!printWindow) {
        alert("Please allow pop-ups to print the receipt.");
        return;
    }
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Restaurant Receipt</title>
        <style>
            body { font-family: Arial, sans-serif; width: 350px; margin: auto; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { padding: 7px; border-bottom: 1px solid #ccc; text-align: left; }
            .receipt-buttons { display: none; }
        </style>
        </head>
        <body>${receiptContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function downloadReceipt() {
    const receiptContent = document.getElementById("receipt").querySelector(".receipt-content").innerHTML;
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Restaurant Receipt</title>
        <style>
            body { font-family: Arial, sans-serif; width: 350px; margin: auto; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border-bottom: 1px solid #ccc; text-align: left; }
            .receipt-buttons { display: none; }
        </style>
        </head>
        <body>${receiptContent}</body>
        </html>
    `;
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${order.orderId}_receipt.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ========================================
// START NEW ORDER
// ========================================

// async function startNewOrder() {
//     // ✅ Disable New Customer buttons – ab click nahi kar sakte
//     enableNewCustomerButtons(false);

//     // Reset local state
//     selectedFoods = [];
//     order.foodItems = [];
//     order.tableId = null;
//     // const ids = await fetchNextIds();
//     if (!ids) {
//         // Agar fail ho toh enable kar dein
//         enableNewCustomerButtons(true);
//         return;
//     }
//     order.orderId = ids.orderId;
//     order.customerId = ids.customerId;

//     renderSelectedFoods();
//     document.getElementById("totalAmount").textContent = "0";
//     document.getElementById("totalAmountGst").textContent = "0";
//     document.getElementById("Gst").textContent = "0";
//     document.getElementById("table-id").textContent = "NaN";
//     document.getElementById("receipt").innerHTML = "";

//     await loadTables();
//     console.log("🆕 New Customer – Order ID:", order.orderId, "Customer ID:", order.customerId);
// }

let cus=1; // for just short time show C_ID in table card 
async function startNewOrder() {
    // Reset local state only – no ID generation
    selectedFoods = [];
    order.foodItems = [];
    order.tableId = null;
    order.orderId = null;
    order.customerId = null;
    
     // ✅ Temporary Customer ID – Table card par turant dikhegi
    // order.customerId = "C-TEMP-" + Date.now();//Date.now() generate numbers
    order.customerId = "C-TEMP-" + cus;
    cus=cus+1;
    renderSelectedFoods();
    document.getElementById("totalAmount").textContent = "0";
    document.getElementById("totalAmountGst").textContent = "0";
    document.getElementById("Gst").textContent = "0";
    document.getElementById("table-id").textContent = "NaN";
    document.getElementById("receipt").innerHTML = "";

    await loadTables();
    console.log("🆕 New order started – IDs will be generated on payment.");
}