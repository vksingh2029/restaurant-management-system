import API_BASE from './config.js';
// ========================================
// LOGIN FORM
// ========================================

// Login form ko select kar rahe hain
const form = document.getElementById("loginForm");

// Password input
const passwordInput =
    document.getElementById("password");

// Password show/hide button
const toggle =
    document.getElementById("passwordToggle");

// Message show karne wala element
const message =
    document.getElementById("formMessage");


// ========================================
// PASSWORD SHOW / HIDE
// ========================================

toggle.addEventListener("click", () => {

    // Check kar rahe hain password visible hai ya nahi
    const isVisible =
        passwordInput.type === "text";


    // Type change kar rahe hain
    passwordInput.type =
        isVisible ? "password" : "text";

});


// ========================================
// LOGIN
// ========================================

form.addEventListener("submit", async (event) => {

    // Page reload hone se rok rahe hain
    event.preventDefault();


    // Role ki value
    const role =
        document.getElementById("role").value;


    // Phone number
    const mobile =
        document.getElementById("phone").value.trim();


    // Password
    const password =
        passwordInput.value;


    // ========================================
    // BASIC VALIDATION
    // ========================================

    if (!role) {

        message.textContent =
            "Please select your role.";

        return;
    }


    if (!/^\d{10}$/.test(mobile)) {

        message.textContent =
            "Enter a valid 10 digit mobile number.";

        return;
    }


    if (!password) {

        message.textContent =
            "Enter password.";

        return;
    }


    // ========================================
    // PHONE = PASSWORD
    // ========================================

    // if (mobile !== password) {

    //     message.textContent =
    //         "Password must be the same as mobile number.";

    //     return;
    // }


    message.textContent =
        "Checking login...";


    try {

        // Backend ko request bhej rahe hain
        const response = await fetch(
            "http://localhost:3000/api/login",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                // Ye data backend ko jayega
                body: JSON.stringify({

                    role: role,

                    mobile: mobile,

                    password: password

                })

            }
        );


        // Backend ka response JSON me convert
        const data =
            await response.json();


        // Agar login fail
        if (!response.ok) {

            message.textContent =
                data.message;

            return;
        }


        // ========================================
        // LOGIN SUCCESS
        // ========================================

        message.textContent =
            "Login successful!";


        // User information temporarily save
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );


        // Role ke according panel open
        if (data.user.role === "ADMIN") {

            window.location.href =
                "/Admin/adminPanel.html";

        }


        else if (data.user.role === "Waiter") {

            window.location.href =
                "/Waiter/waiter.html";

        }

    }


    catch (error) {

        console.error(error);

        message.textContent =
            "Server Connection Fail...";

    }

});