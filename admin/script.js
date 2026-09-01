// ========================================
// BASIC ELEMENTS
// ========================================

const menu = document.getElementById("menu");
const rightContent = document.getElementById("rightContent");

// ========================================
// LOGGED-IN ADMIN INFORMATION
// ========================================

const savedUser = localStorage.getItem("user");

if (!savedUser) {
  alert("Please login first.");

  window.location.href = "../login.html";

  throw new Error("Admin not logged in");
}

const user = JSON.parse(savedUser);

// Admin name
const adminNameElement = document.getElementById("adminName");

if (adminNameElement) {
  adminNameElement.textContent = user.name;
}

// Admin ID
const adminUserIdElement = document.getElementById("adminUserId");

if (adminUserIdElement) {
  adminUserIdElement.textContent = user.user_id;
}

// ========================================
// MENU ACTIVE EFFECT
// ========================================

const menuItems = document.querySelectorAll(".menu-item, .dashboard-menu");

menuItems.forEach(function (item) {
  item.addEventListener("click", function () {
    menuItems.forEach(function (item) {
      item.classList.remove("active");
    });

    this.classList.add("active");
  });
});

// ========================================
// TOAST
// ========================================

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    return;
  }

  toast.textContent = "✓ " + message;

  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 1500);
}

// // ========================================
// // FOOD MANAGEMENT
// // ========================================

// const food =
//     document.getElementById("food");

// // let foodList = [];

// // let totalfoods = 0;

// if (food) {

//     food.addEventListener("click",function () {

//         rightContent.innerHTML = `

//             <div class="page-header">

//                 <div>
//                     <h1>Food Management</h1>
//                     <p>Manage your restaurant food</p>
//                 </div>

//                 <button class="add-btn" id="addfood">
//                     <i class="fa-solid fa-plus"></i>
//                     Add Food
//                 </button>

//             </div>

//             <div class="table-container">

//                 <table class="menu-table">

//                     <thead>

//                         <tr>

//                             <th>Item</th>

//                             <th>Category</th>

//                             <th>Price</th>

//                             <th>Food ID</th>

//                             <th>Action</th>

//                         </tr>

//                     </thead>

//                     <tbody id="foodTableBody"></tbody>

//                 </table>

//             </div>

//             <div id="toastf"></div>
//         `;

//         const addfood =
//             document.getElementById("addfood");

//         addfood.addEventListener(
//             "click",
//             async function () {

//                 let foodName =
//                     prompt("Enter Food Name:");

//                 if (foodName === null) {
//                     return;
//                 }

//                 foodName =
//                     foodName.trim();

//                 if (foodName === "") {

//                     alert(
//                         "Food name cannot be empty"
//                     );

//                     return;
//                 }

//                 let category =
//                     prompt("Enter Food Category:");

//                 if (category === null) {
//                     return;
//                 }

//                 category =
//                     category.trim();

//                 if (category === "") {

//                     alert(
//                         "Food category cannot be empty"
//                     );

//                     return;
//                 }

//                 let price =
//                     prompt("Enter Price:");

//                 if (price === null) {
//                     return;
//                 }

//                 price =
//                     price.trim();

//                 if (!/^[0-9]+$/.test(price)) {

//                     alert(
//                         "Enter valid price"
//                     );

//                     return;
//                 }

//                 // add food
//                 try {

//     const response = await fetch("/api/foods", {

//         method: "POST",

//         headers: {
//             "Content-Type": "application/json"
//         },

//         body: JSON.stringify({

//             name: foodName,

//             category: category,

//             food_price: price

//         })

//     });

//     const data = await response.json();

//     if (!response.ok) {

//         alert(
//             data.message ||
//             "Food could not be added"
//         );

//         return;
//     }

//     showToast(
//         `Food ${data.food.food_id} added successfully`
//     );

//     // Database se fresh data lao
//     await loadFoods();

// }
// catch (error) {

//     console.error(
//         "Add food error:",
//         error
//     );

//     alert(
//         "Backend server se connection nahi ho pa raha."
//     );

// }

// //                 const toast =
// //                     document.getElementById("toastf");

// //                 if (toast) {

// //                     toast.textContent =
// //                         "✓ Food " +
// //                         foodId +
// //                         " added successfully";

// //                     toast.classList.add("showf");

// //                     setTimeout(function () {

// //                         toast.classList.remove(
// //                             "showf"
// //                         );

// //                     }, 1500);

// //                 }

// //             }
// //         );

// //     });

// // }
// // loadFoods() function

// ========================================
// FOOD MANAGEMENT
// ========================================

const food = document.getElementById("food");

if (food) {
  food.addEventListener("click", function () {
    rightContent.innerHTML = `

                <div class="page-header">

                    <div>

                        <h1>Food Management</h1>

                        <p>
                            Manage your restaurant food
                        </p>

                    </div>


                    <button
                        class="add-btn"
                        id="addfood">

                        <i class="fa-solid fa-plus"></i>

                        Add Food

                    </button>

                </div>


                <div class="table-container">

                    <table class="menu-table">

                        <thead>

                            <tr>

                                <th>Item</th>

                                <th>Category</th>

                                <th>Price</th>

                                <th>Food ID</th>

                                <th>Action</th>

                            </tr>

                        </thead>


                        <tbody
                            id="foodTableBody">
                        </tbody>

                    </table>

                </div>


                <div id="toastf"></div>

            `;

    const addfood = document.getElementById("addfood");

    // add food
    addfood.addEventListener("click", async function () {
      // --------------------------------
      // FOOD NAME
      // --------------------------------

      let foodName = prompt("Enter Food Name:");

      if (foodName === null) {
        return;
      }

      foodName = foodName.trim();

      if (foodName === "") {
        alert("Food name cannot be empty");

        return;
      }

      // --------------------------------
      // CATEGORY
      // --------------------------------

      let category = prompt("Enter Food Category:");

      if (category === null) {
        return;
      }

      category = category.trim();

      if (category === "") {
        alert("Food category cannot be empty");

        return;
      }

      // --------------------------------
      // PRICE
      // --------------------------------

      let price = prompt("Enter Price:");

      if (price === null) {
        return;
      }

      price = price.trim();

      if (!/^[0-9]+$/.test(price)) {
        alert("Enter valid price");

        return;
      }

      // ========================================
      // ADD FOOD TO DATABASE
      // ========================================

      try {
        const response = await fetch("/api/foods", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: foodName,

            category: category,

            food_price: price,
          }),
        });

        const data = await response.json();

        // --------------------------------
        // ERROR
        // --------------------------------

        if (!response.ok) {
          alert(data.message || "Food could not be added");

          return;
        }

        // --------------------------------
        // SUCCESS
        // --------------------------------

        const toast = document.getElementById("toastf");

        if (toast) {
          toast.textContent =
            "✓ Food " + data.food.food_id + " added successfully";

          toast.classList.add("showf");

          setTimeout(function () {
            toast.classList.remove("showf");
          }, 1500);
        }

        // ========================================
        // DATABASE SE FRESH DATA LOAD
        // ========================================

        await loadFoods();
      } catch (error) {
        console.error("Add food error:", error);

        alert("Backend server se connection nahi ho pa raha.");
      }
    });

    // ========================================
    // FOOD PAGE OPEN
    // DATABASE SE FOOD LOAD
    // ========================================

    loadFoods();
  });
}

// ========================================
// LOAD FOODS FROM DATABASE
// ========================================

async function loadFoods() {
  try {
    const response = await fetch("/api/foods");

    if (!response.ok) {
      throw new Error("Failed to load foods");
    }

    const foods = await response.json();

    console.log("FOODS FROM DATABASE:", foods);

    renderfoods(foods);
  } catch (error) {
    console.error("Load foods error:", error);

    alert("Foods database se load nahi ho paaye.");
  }
}

// ========================================
// RENDER FOOD
// ========================================

function renderfoods(foodList) {
  const foodTableBody = document.getElementById("foodTableBody");

  if (!foodTableBody) {
    return;
  }

  foodTableBody.innerHTML = "";

  foodList.forEach(function (food) {
    const row = document.createElement("tr");

    row.innerHTML = `

            <td>${food.name}</td>

            <td>${food.category}</td>

            <td>₹${food.food_price}</td>

            <td>${food.food_id}</td>

            <td>

                <button
                    type="button"
                    data-id="${food.food_id}">
                    <i class="fa-solid fa-trash"></i>
                </button>

            </td>

        `;

    foodTableBody.appendChild(row);
  });
}

// ========================================
// ORDERS
// ========================================

// ========================================
// TABLE MANAGEMENT
// ========================================

const seatTabel = document.getElementById("seatTable");

if (seatTabel) {
  seatTabel.addEventListener("click", function () {
    rightContent.innerHTML = `

                <div class="page-header">

                    <div>

                        <h1>Table Management</h1>

                        <p>
                            Manage your restaurant tables
                        </p>

                    </div>

                    <button
                        class="add-btn"
                        id="addTable">

                        <i class="fa-solid fa-plus"></i>

                        Add Table

                    </button>

                </div>

                <div
                    class="cantainer-table"
                    id="tableContainer">
                </div>

                <div id="toast"></div>

            `;

    const container = document.getElementById("tableContainer");

    const addTable = document.getElementById("addTable");

    // ========================================
    // LOAD TABLES FROM DATABASE
    // ========================================

    async function loadTables() {
      try {
        const response = await fetch("/api/tables");

        if (!response.ok) {
          throw new Error("Failed to load tables");
        }

        const tables = await response.json();

        container.innerHTML = "";

        tables.forEach(function (table) {
          const box = document.createElement("div");

          box.innerHTML = `

                                <div class="table-id">

                                    Table ID:
                                    ${table.table_id}

                                </div>

                            `;

          if (table.status === "Occupied") {
            box.innerHTML += `

                                    <div class="customer-id">

                                        Customer ID:
                                        ${table.customer_id}

                                    </div>

                                    <div
                                        class="
                                        status-of-table
                                        occupied-table
                                        ">

                                        Occupied

                                    </div>

                                `;
          } else {
            box.innerHTML += `

                                    <div
                                        class="
                                        status-of-table
                                        available-table
                                        ">

                                        Available

                                    </div>

                                `;
          }

          container.appendChild(box);
        });
      } catch (error) {
        console.error("Tables load error:", error);

        alert("Tables load nahi ho paaye.");
      }
    }

    // ========================================
    // ADD TABLE
    // ========================================

    addTable.addEventListener("click", async function () {
      const confirmAdd = confirm("Do you want to add a new table?");

      if (!confirmAdd) {
        return;
      }

      try {
        const response = await fetch("/api/tables", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Table could not be added");

          return;
        }

        await loadTables();

        showToast(`Table ${data.table.table_id} added successfully`);
      } catch (error) {
        console.error("Add table error:", error);

        alert("Backend server se connection nahi ho pa raha.");
      }
    });

    loadTables();
  });
}

// ========================================
// WAITER MANAGEMENT
// ========================================

const waiter = document.getElementById("waiter");

if (waiter) {
  waiter.addEventListener("click", function () {
    rightContent.innerHTML = `

                <div class="page-header">

                    <div>

                        <h1>Waiter Management</h1>

                        <p>
                            Manage your restaurant waiters
                        </p>

                    </div>

                    <button
                        class="add-btn"
                        id="addWaiter">

                        <i class="fa-solid fa-plus"></i>

                        Add Waiter

                    </button>

                </div>


                <div class="table-container">

                    <table class="menu-table">

                        <thead>

                            <tr>

                                <th>Waiter ID</th>

                                <th>Name</th>

                                <th>Mobile Number</th>

                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody
                            id="waiterTableBody">
                        </tbody>

                    </table>

                </div>

                <div id="toast"></div>

            `;

    // ========================================
    // ADD WAITER
    // ========================================

    addWaiter.addEventListener("click", async function () {
      // --------------------------------
      // NAME
      // --------------------------------

      let waiterName = prompt("Enter Waiter Name:");

      if (waiterName === null) {
        return;
      }

      waiterName = waiterName.trim();

      if (waiterName === "") {
        alert("Waiter name cannot be empty");

        return;
      }

      // --------------------------------
      // MOBILE
      // --------------------------------

      let mobile = prompt("Enter Mobile Number:");

      if (mobile === null) {
        return;
      }

      mobile = mobile.trim();

      if (!/^[0-9]{10}$/.test(mobile)) {
        alert("Enter valid 10 digit mobile number");

        return;
      }

      // --------------------------------
      // PASSWORD
      // --------------------------------

      let password = prompt("Enter Waiter Password:");

      if (password === null) {
        return;
      }

      password = password.trim();

      if (password === "") {
        alert("Password cannot be empty");

        return;
      }

      // --------------------------------
      // GENERATE WAITER ID
      // --------------------------------

      const waiterRows = document.querySelectorAll("#waiterTableBody tr");

      const nextNumber = waiterRows.length + 1;

      const userId = "W" + String(nextNumber).padStart(2, "0");

      // --------------------------------
      // DATA TO BACKEND
      // --------------------------------

      const waiterData = {
        userId: userId,

        name: waiterName,

        mobile: mobile,

        password: password,
      };

      console.log("WAITER DATA:", waiterData);

      try {
        // =================================
        // DATABASE INSERT
        // =================================

        const response = await fetch("/api/waiters", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(waiterData),
        });

        const data = await response.json();

        console.log("BACKEND RESPONSE:", data);

        // --------------------------------
        // ERROR
        // --------------------------------

        if (!response.ok) {
          alert(data.message || "Waiter could not be added");

          return;
        }

        // --------------------------------
        // DATABASE SE SUCCESS
        // --------------------------------

        showToast(`Waiter ${data.waiter.user_id} added successfully`);

        // --------------------------------
        // DATABASE SE REFRESH
        // --------------------------------

        await loadWaiters();
      } catch (error) {
        console.error("Add waiter error:", error);

        alert("Backend server se connection nahi ho pa raha.");
      }
    });

    // ========================================
    // PAGE OPEN HOTE HI DATABASE SE WAITERS
    // ========================================

    loadWaiters();
  });
}
//  //
//load waiter from db
//  //
// ========================================
// LOAD WAITERS FROM DATABASE
// ========================================

async function loadWaiters() {
  try {
    const response = await fetch("/api/waiters");

    if (!response.ok) {
      throw new Error("Failed to load waiters");
    }

    const waiters = await response.json();

    console.log("WAITERS FROM DATABASE:", waiters);

    renderWaiters(waiters);
  } catch (error) {
    console.error("Load waiters error:", error);

    alert("Waiters database se load nahi ho paaye.");
  }
}

// ========================================
// RENDER WAITERS
// ========================================

function renderWaiters(waiters) {
  const waiterTableBody = document.getElementById("waiterTableBody");

  if (!waiterTableBody) {
    return;
  }

  waiterTableBody.innerHTML = "";

  waiters.forEach(function (waiter) {
    const row = document.createElement("tr");

    row.innerHTML = `

                <td>
                    ${waiter.user_id}
                </td>

                <td>
                    ${waiter.name}
                </td>

                <td>
                    ${waiter.mobile}
                </td>

                <td>

                    <span class="status active-status">

                        ${waiter.status}

                    </span>

                </td>

            `;

    waiterTableBody.appendChild(row);
  });
}

// ========================================
// DASHBOARD
// ========================================

function showDashboard() {
  rightContent.innerHTML = `

        <div class="cantainer-table">

            <img
                src="dashboard_img.png"
                alt="not load"
                id="img1">

        </div>

    `;
}

// ========================================
// PAGE LOAD
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  showDashboard();
});

// ========================================
// DASHBOARD CLICK
// ========================================

const dashboard = document.getElementById("dashboard");

if (dashboard) {
  dashboard.addEventListener("click", function () {
    showDashboard();
  });
}

// ========================================
// REPORTS
// ========================================

// ========================================
// RESET RIGHT CONTENT BACKGROUND
// ========================================

function resetRightContentBackground() {
  rightContent.style.backgroundColor = "";
  rightContent.style.color = "";
}

// ========================================
// ⭐ REPORTS (With Full Stats)
// ========================================

const reports = document.getElementById("reports");

if (reports) {
  reports.addEventListener("click", function () {
    // Background black karo
    // rightContent.style.backgroundColor = "#000000";
    // rightContent.style.color = "#ffffff";

    // Loading show karo
    rightContent.innerHTML = `
            <div style="padding: 40px; text-align: center; min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 48px; color: #f6c343;"></i>
                <p style="color: #aaa; margin-top: 20px; font-size: 18px;">Loading reports...</p>
            </div>
        `;

    // Stats fetch karo
    fetchStats();
  });
}
// ========================================
// FETCH STATS FROM DATABASE
// ========================================

async function fetchStats() {
  try {
    const response = await fetch("/api/stats");
    if (!response.ok) throw new Error("Failed to load stats");
    const data = await response.json();

    if (data.success) {
      renderReports(data.stats);
    } else {
      throw new Error(data.message || "Failed to load stats");
    }
  } catch (error) {
    console.error("Stats error:", error);
    rightContent.innerHTML = `
            <div style="padding: 40px; color: white; min-height: 80vh;">
                <h1 style="color: #ff6b6b; font-size: 28px; margin-bottom: 20px;">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    Error Loading Reports
                </h1>
                <p style="color: #aaa; font-size: 16px;">${error.message}</p>
                <button onclick="fetchStats()" style="margin-top: 20px; padding: 12px 24px; background: #f6c343; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
  }
}
// ========================================
// RENDER REPORTS
// ========================================

function renderReports(stats) {
  // Format currency
  const formatCurrency = (amount) => {
    return "₹" + Number(amount).toLocaleString("en-IN");
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasOrders = stats.recentOrders && stats.recentOrders.length > 0;

  rightContent.innerHTML = `
        <div style="padding: 30px; min-height: 80vh; background: #ffffff;">

            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #2a2a2a; padding-bottom: 20px;">
                <div>
                    <h1 style="color: #ffffff; font-size: 32px; margin: 0;">
                        <i class="fa-solid fa-chart-simple" style="color: #f6c343;"></i>
                        Reports
                    </h1>
                    <p style="color: #888; margin: 6px 0 0 0; font-size: 14px;">
                        Restaurant analytics and statistics
                    </p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="fetchStats()" style="padding: 10px 18px; background: #2a2a2a; border: 1px solid #444; border-radius: 8px; color: white; cursor: pointer;">
                        <i class="fa-solid fa-rotate"></i> Refresh
                    </button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 35px;">

                <!-- Revenue -->
                <div style="background: #1a1a1a; padding: 25px; border-radius: 12px; border-left: 4px solid #f6c343;">
                    <div style="color: #f6c343; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                        <i class="fa-solid fa-indian-rupee-sign"></i> Total Sell
                    </div>
                    <div style="color: #ffffff; font-size: 28px; font-weight: bold;">
                        ${formatCurrency(stats.totalRevenue || 0)}
                    </div>
                </div>

                <!-- Orders -->
                <div style="background: #1a1a1a; padding: 25px; border-radius: 12px; border-left: 4px solid #4ecdc4;">
                    <div style="color: #4ecdc4; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                        <i class="fa-solid fa-clipboard-list"></i> Total Orders
                    </div>
                    <div style="color: #ffffff; font-size: 28px; font-weight: bold;">
                        ${stats.totalOrders || 0}
                    </div>
                </div>

                <!-- Customers -->
                <div style="background: #1a1a1a; padding: 25px; border-radius: 12px; border-left: 4px solid #45b7d1;">
                    <div style="color: #45b7d1; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                        <i class="fa-solid fa-users"></i> Total Customers
                    </div>
                    <div style="color: #ffffff; font-size: 28px; font-weight: bold;">
                        ${stats.totalCustomers || 0}
                    </div>
                </div>

                <!-- Tables -->
                <div style="background: #1a1a1a; padding: 25px; border-radius: 12px; border-left: 4px solid #ffa94d;">
                    <div style="color: #ffa94d; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                        <i class="fa-solid fa-chair"></i> Total Tables
                    </div>
                    <div style="color: #ffffff; font-size: 28px; font-weight: bold;">
                        ${stats.totalTables || 0}
                    </div>
                </div>

                <!-- Waiters -->
                <div style="background: #1a1a1a; padding: 25px; border-radius: 12px; border-left: 4px solid #a29bfe;">
                    <div style="color: #a29bfe; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                        <i class="fa-solid fa-user-tie"></i> Total Waiters
                    </div>
                    <div style="color: #ffffff; font-size: 28px; font-weight: bold;">
                        ${stats.totalWaiters || 0}
                    </div>
                </div>

                <!-- Foods -->
                <div style="background: #1a1a1a; padding: 25px; border-radius: 12px; border-left: 4px solid #fd79a8;">
                    <div style="color: #fd79a8; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                        <i class="fa-solid fa-utensils"></i> Total Food Items
                    </div>
                    <div style="color: #ffffff; font-size: 28px; font-weight: bold;">
                        ${stats.totalFoods || 0}
                    </div>
                </div>

            </div>

            <!-- Recent Orders -->
            <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-top: 10px;">
                <h3 style="color: #fff; margin: 0 0 15px 0; font-size: 18px;">
                    <i class="fa-solid fa-clock-rotate-left" style="color: #f6c343;"></i>
                    Recent Orders
                </h3>

                ${
                  hasOrders
                    ? `
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="border-bottom: 1px solid #333;">
                                    <th style="text-align: left; padding: 12px 8px; color: #888; font-weight: 600;">Order ID</th>
                                    <th style="text-align: left; padding: 12px 8px; color: #888; font-weight: 600;">Customer</th>
                                    <th style="text-align: left; padding: 12px 8px; color: #888; font-weight: 600;">Table</th>
                                    <th style="text-align: left; padding: 12px 8px; color: #888; font-weight: 600;">Amount</th>
                                    <th style="text-align: left; padding: 12px 8px; color: #888; font-weight: 600;">Status</th>
                                    <th style="text-align: left; padding: 12px 8px; color: #888; font-weight: 600;">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.recentOrders
                                  .map(
                                    (order) => `
                                    <tr style="border-bottom: 1px solid #2a2a2a;">
                                        <td style="padding: 12px 8px; color: #f6c343;">${order.order_id}</td>
                                        <td style="padding: 12px 8px; color: #ccc;">${order.customer_id}</td>
                                        <td style="padding: 12px 8px; color: #ccc;">${order.table_id}</td>
                                        <td style="padding: 12px 8px; color: #4ecdc4; font-weight: 600;">${formatCurrency(order.total_amount)}</td>
                                        <td style="padding: 12px 8px;">
                                            <span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${order.payment_status === "PAID" ? "#1a3a2a" : "#3a2a1a"}; color: ${order.payment_status === "PAID" ? "#4ecdc4" : "#ffa94d"};">
                                                ${order.payment_status || "PENDING"}
                                            </span>
                                        </td>
                                        <td style="padding: 12px 8px; color: #888; font-size: 12px;">${formatDate(order.created_at)}</td>
                                    </tr>
                                `,
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                `
                    : `
                    <p style="color: #666; text-align: center; padding: 30px 0; margin: 0;">
                        <i class="fa-solid fa-inbox" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                        No orders found yet.
                    </p>
                `
                }
            </div>

        </div>
    `;
}
/// ========================================
// ORDERS (Fetch from Database)
// ========================================

const order = document.getElementById("order");

if (order) {
    order.addEventListener("click", function () {
        // Background reset (normal wala)
        resetRightContentBackground();

        // Loading message
        rightContent.innerHTML = `
            <div style="padding: 40px; text-align: center; min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 48px; color: #f6c343;"></i>
                <p style="color: #7c8795; margin-top: 20px; font-size: 18px;">Loading orders...</p>
            </div>
        `;

        fetchOrders();
    });
}

// ========================================
// FETCH ORDERS FROM DATABASE
// ========================================

async function fetchOrders() {
    try {
        const response = await fetch("/api/orders");
        if (!response.ok) throw new Error("Failed to load orders");
        const data = await response.json();

        if (data.success) {
            renderOrders(data.orders);
        } else {
            throw new Error(data.message || "Failed to load orders");
        }
    } catch (error) {
        console.error("Orders error:", error);
        rightContent.innerHTML = `
            <div style="padding: 40px; color: #172334; min-height: 80vh;">
                <h1 style="color: #e74c3c; font-size: 28px; margin-bottom: 20px;">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    Error Loading Orders
                </h1>
                <p style="color: #7c8795; font-size: 16px;">${error.message}</p>
                <button onclick="fetchOrders()" style="margin-top: 20px; padding: 12px 24px; background: #f6c343; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

// ========================================
// RENDER ORDERS TABLE
// ========================================

function renderOrders(orders) {
    const hasOrders = orders && orders.length > 0;

    // Format currency
    const formatCurrency = (amount) => {
        return "₹" + Number(amount).toLocaleString("en-IN");
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    rightContent.innerHTML = `
        <div style="padding: 30px;">

            <div class="page-header">
                <div>
                    <h1>Orders</h1>
                    <p>Manage all restaurant orders</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="fetchOrders()" style="padding: 10px 18px; background: #f5a900; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">
                        <i class="fa-solid fa-rotate"></i> Refresh
                    </button>
                </div>
            </div>

            <div class="table-container">
                <table class="menu-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer ID</th>
                            <th>Table ID</th>
                            <th>Waiter</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hasOrders ? orders.map(order => `
                            <tr>
                                <td><strong>${order.order_id}</strong></td>
                                <td>${order.customer_id}</td>
                                <td>${order.table_id}</td>
                                <td>${order.waiter_name} (${order.waiter_id})</td>
                                <td><strong>${formatCurrency(order.total_amount)}</strong></td>
                                <td>
                                    <span class="status ${order.payment_status === 'PAID' ? 'active-status' : 'status'}">
                                        ${order.payment_status || 'PENDING'}
                                    </span>
                                </td>
                                <td style="font-size: 12px;">${formatDate(order.created_at)}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 40px; color: #7c8795;">
                                    <i class="fa-solid fa-inbox" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                                    No orders found.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
