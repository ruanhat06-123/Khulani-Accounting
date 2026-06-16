import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase client
const supabase = createClient(
    "https://xsunyupoliggstugqymd.supabase.co",
    "sb_publishable_Zp4Ofe8LyuyueKEQt0_RUQ_nOFG7v-l"
);

// Utility functions
function escapeHTML(value) {
    return value == null
        ? ""
        : String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
}

function sanitizeSearchTerm(term) {
    return String(term || "")
        .replace(/[%_]/g, "")
        .replace(/["'();]/g, "")
        .trim();
}

// ==================== PAGE SWITCHING ====================

const pageSections = [];
const hashPageMap = {
    "#dashboard-overview": "dashboard-overview",
    "#content-management": "content-management",
    "#bookings-page": "bookings-page",
    "#user-management": "user-management",
    "#blogs-card": "content-management",
    "#vacancies-card": "content-management",
    "#faqs-card": "content-management",
    "#login-page": "login-page"
};

function setActivePage(pageId) {
    pageSections.forEach(section => {
        section.classList.toggle("visible", section.id === pageId);
    });
}

function setActiveLink(hash) {
    document.querySelectorAll(".nav-links a").forEach(item => {
        const itemHref = item.getAttribute("href");
        item.classList.toggle("active-link", itemHref === hash);
    });
}

function normalizeHash(hash) {
    if (!hash) return "#dashboard-overview";
    return hash.startsWith("#") ? hash : `#${hash}`;
}

function navigateToHash(hash) {
    hash = normalizeHash(hash);
    const pageId = hashPageMap[hash] || hash.slice(1) || "dashboard-overview";
    const pageExists = document.getElementById(pageId);
    const activePageId = pageExists ? pageId : "dashboard-overview";

    setActivePage(activePageId);
    setActiveLink(hash);

    const target = document.getElementById(hash.slice(1));
    if (target && target.id !== activePageId) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// ==================== DOM READY ====================

document.addEventListener("DOMContentLoaded", async () => {
    const navLinks = document.querySelectorAll(".nav-links a");
    pageSections.push(...document.querySelectorAll("main.container section.panel, #login-page"));

    // Handle hash changes
    window.addEventListener("hashchange", () => {
        navigateToHash(window.location.hash);
    });

    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            if (link.id !== "logout-btn") {
                event.preventDefault();
                let hash = link.getAttribute("href");
                hash = normalizeHash(hash);
                window.location.hash = hash;
            }
        });
    });

    document.querySelectorAll(".quick-links a, .view-all").forEach(link => {
        link.addEventListener("click", (event) => {
            let hash = link.getAttribute("href");
            if (hash) {
                event.preventDefault();
                hash = normalizeHash(hash);
                window.location.hash = hash;
            }
        });
    });

    // Initial navigation
    const initialHash = window.location.hash || "#dashboard-overview";
    navigateToHash(initialHash);
});

// ==================== DATABASE OPERATIONS ====================

// Fetch all users
async function fetchUsers(searchTerm = "") {
    try {
        const safeTerm = sanitizeSearchTerm(searchTerm);
        let query = supabase.from("profiles").select("id, username, email, role");
        if (safeTerm) {
            query = query.or(`username.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error fetching users:", err);
        return [];
    }
}

// Fetch all blogs
async function fetchBlogs() {
    try {
        const { data, error } = await supabase
            .from("blogs")
            .select("id, title, content, image_url, created_at")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error fetching blogs:", err);
        return [];
    }
}

// Fetch bookings (with profile relation)
async function fetchBookings() {
    try {
        const { data, error } = await supabase
            .from("bookings")
            .select(`
                id,
                service,
                date,
                time,
                payment_method,
                session_type,
                profiles (username, email)
            `)
            .order("id", { ascending: false });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error fetching bookings:", err);
        return [];
    }
}




// Add new blog
async function addBlog(title, content, imageUrl) {
    try {
        const { data, error } = await supabase
            .from("blogs")
            .insert([{ title, content, image_url: imageUrl || null, created_at: new Date() }])
            .select();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error adding blog:", err);
        alert("Failed to add blog: " + err.message);
        return null;
    }
}

// Delete blog
async function deleteBlog(id) {
    try {
        const { error } = await supabase.from("blogs").delete().eq("id", id);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Error deleting blog:", err);
        alert("Failed to delete blog: " + err.message);
        return false;
    }
}

// Vacancies
async function fetchVacancies() {
    try {
        const { data, error } = await supabase
            .from("vacancies")
            .select("id, title, description, image_url, created_at")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error fetching vacancies:", err);
        return [];
    }
}

async function addVacancy(title, description, imageUrl) {
    try {
        const { data, error } = await supabase
            .from("vacancies")
            .insert([{ title, description, image_url: imageUrl || null, created_at: new Date() }])
            .select();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error adding vacancy:", err);
        alert("Failed to add vacancy: " + err.message);
        return null;
    }
}

async function deleteVacancy(id) {
    try {
        const { error } = await supabase.from("vacancies").delete().eq("id", id);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Error deleting vacancy:", err);
        alert("Failed to delete vacancy: " + err.message);
        return false;
    }
}

// FAQs
async function fetchFAQs() {
    try {
        const { data, error } = await supabase
            .from("faqs")
            .select("id, question, answer, asked_by, answer_by")
            .order("id", { ascending: false });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error fetching FAQs:", err);
        return [];
    }
}

async function addFAQ(question, answer) {
    try {
        const { data, error } = await supabase
            .from("faqs")
            .insert([{ question, answer, created_at: new Date() }])
            .select();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error adding FAQ:", err);
        alert("Failed to add FAQ: " + err.message);
        return null;
    }
}

async function deleteFAQ(id) {
    try {
        const { error } = await supabase.from("faqs").delete().eq("id", id);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Error deleting FAQ:", err);
        alert("Failed to delete FAQ: " + err.message);
        return false;
    }
}

// Purchases
async function fetchPurchases() {
    try {
        const { data, error } = await supabase
            .from("purchases")
            .select("id, user_id, plan, payment_method, created_at")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error fetching purchases:", err);
        return [];
    }
}

// User role & deletion
async function updateUserRole(userId, newRole) {
    try {
        const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Error updating user role:", err);
        alert("Failed to update user role: " + err.message);
        return false;
    }
}

async function deleteUser(userId) {
    try {
        const { error } = await supabase.from("profiles").delete().eq("id", userId);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user: " + err.message);
        return false;
    }
}
// ==================== UI UPDATE FUNCTIONS ====================

function renderUsersTable(users) {
    const tbody = document.querySelector("#users-table tbody");
    tbody.innerHTML = "";
    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(user.username)}</td>
            <td>${escapeHTML(user.email)}</td>
            <td>${escapeHTML(user.role)}</td>
            <td>
                <button class="edit-user-btn" data-id="${escapeHTML(user.id)}">Edit</button>
                <button class="delete-user-btn" data-id="${escapeHTML(user.id)}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderBlogsTable(blogs) {
    const tbody = document.querySelector("#blogs-table tbody");
    tbody.innerHTML = "";
    blogs.slice(0, 5).forEach(blog => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(blog.title)}</td>
            <td>${escapeHTML(new Date(blog.created_at).toLocaleDateString())}</td>
            <td>
                <button class="delete-blog-btn" data-id="${escapeHTML(blog.id)}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderVacanciesTable(vacancies) {
    const tbody = document.querySelector("#vacancies-table tbody");
    tbody.innerHTML = "";
    vacancies.slice(0, 5).forEach(vacancy => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(vacancy.title)}</td>
            <td>${escapeHTML(new Date(vacancy.created_at).toLocaleDateString())}</td>
            <td>
                <button class="delete-vacancy-btn" data-id="${escapeHTML(vacancy.id)}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderFAQsTable(faqs) {
    const tbody = document.querySelector("#faqs-table tbody");
    tbody.innerHTML = "";
    faqs.slice(0, 5).forEach(faq => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(faq.question)}</td>
            <td>${escapeHTML(faq.answer.substring(0, 50))}...</td>
            <td>
                <button class="delete-faq-btn" data-id="${escapeHTML(faq.id)}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderBookingsTable(bookings) {
    const tbody = document.querySelector("#bookings-table tbody");
    tbody.innerHTML = "";
    bookings.forEach(booking => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(booking.id)}</td>
            <td>${escapeHTML(booking.profiles?.username || "Unknown")}</td>
            <td>${escapeHTML(booking.service)}</td>
            <td>${escapeHTML(booking.date)}</td>
            <td>${escapeHTML(booking.time)}</td>
            <td>${escapeHTML(booking.payment_method)}</td>
            <td>${escapeHTML(booking.session_type)}</td>
        `;
        tbody.appendChild(row);
    });
}


function renderPurchasesTable(purchases) {
    const tbody = document.querySelector("#purchases-table tbody");
    tbody.innerHTML = "";
    purchases.forEach(purchase => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(purchase.user_id)}</td>
            <td>${escapeHTML(purchase.plan)}</td>
            <td>${escapeHTML(purchase.payment_method)}</td>
            <td>${escapeHTML(new Date(purchase.created_at).toLocaleDateString())}</td>
        `;
        tbody.appendChild(row);
    });
}

// ==================== AUTH HELPERS ====================

async function getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data?.session?.user ?? null;
}

async function signInUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data?.user ?? data?.session?.user ?? null;
}

async function signOutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = "index.html";
}

async function ensureAdminRole(user) {
    const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (error || !data || String(data.role).toLowerCase() !== "admin") {
        await supabase.auth.signOut();
        window.location.href = "index.html";
        return false;
    }
    return true;
}

async function updateAuthUI(user) {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const loginPage = document.getElementById("login-page");
    const welcomeMessage = document.getElementById("welcome-message");

    if (user) {
        header.style.display = "";
        footer.style.display = "";
        loginPage.classList.remove("visible");
        let displayName = null;
        try {
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();
            if (!profileError && profileData?.username) displayName = profileData.username;
        } catch (err) {
            console.error("Failed to fetch profile for display name", err);
        }
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back, ${displayName || user.email}`;
        }
    } else {
        header.style.display = "none";
        footer.style.display = "none";
        loginPage.classList.add("visible");
        if (welcomeMessage) {
            welcomeMessage.textContent = "Welcome to your admin dashboard.";
        }
        document.querySelectorAll("main.container section.panel").forEach(section => {
            if (section.id !== "login-page") section.classList.remove("visible");
        });
    }
}

// ==================== DASHBOARD LOADING ====================

async function loadDashboardData() {
    const users = await fetchUsers();
    const blogs = await fetchBlogs();
    const vacancies = await fetchVacancies();
    const faqs = await fetchFAQs();
    const bookings = await fetchBookings();
    const purchases = await fetchPurchases();

    renderUsersTable(users);
    renderBlogsTable(blogs);
    renderVacanciesTable(vacancies);
    renderFAQsTable(faqs);
    renderBookingsTable(bookings);
    renderPurchasesTable(purchases);

    const currentUser = await getCurrentUser();
    if (currentUser) {
        const isAdmin = await ensureAdminRole(currentUser);
        if (!isAdmin) return;
    }
    const userProfile = currentUser
        ? await supabase.from("profiles").select("username").eq("id", currentUser.id).single()
        : null;
    document.getElementById("current-user-status").textContent =
        userProfile?.data?.username || currentUser?.email || "No active session";
}

// ==================== EVENT LISTENERS ====================

document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById("login-form");

    try {
        const currentUser = await getCurrentUser();
        updateAuthUI(currentUser);

        if (currentUser) {
            const isAdmin = await ensureAdminRole(currentUser);
            if (!isAdmin) return;
            await loadDashboardData();
            const initialHash = window.location.hash || "#dashboard-overview";
            window.location.hash = initialHash !== "#dashboard-overview" ? initialHash : "";
            navigateToHash(initialHash);
        } else {
            setActivePage("login-page");
        }
    } catch (err) {
        console.error("Auth check failed:", err);
        setActivePage("login-page");
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const user = await signInUser(email, password);
            updateAuthUI(user);
            await loadDashboardData();
            window.location.hash = "#dashboard-overview";
            navigateToHash("#dashboard-overview");
        } catch (err) {
            alert("Login failed: " + err.message);
            console.error(err);
        }
    });

    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                await signOutUser();
            } catch (err) {
                alert("Logout failed: " + err.message);
                console.error(err);
            }
        });
    }

    // Blog form
    document.getElementById("blog-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("blog-title").value;
        const content = document.getElementById("blog-content").value;
        const imageUrl = document.getElementById("blog-image").value;

        const result = await addBlog(title, content, imageUrl);
        if (result) {
            document.getElementById("blog-form").reset();
            const updatedBlogs = await fetchBlogs();
            renderBlogsTable(updatedBlogs);
            alert("Blog added successfully!");
        }
    });

    // Vacancy form
    document.getElementById("vacancy-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("vacancy-title").value;
        const desc = document.getElementById("vacancy-desc").value;
        const imageUrl = document.getElementById("vacancy-image").value;

        const result = await addVacancy(title, desc, imageUrl);
        if (result) {
            document.getElementById("vacancy-form").reset();
            const updatedVacancies = await fetchVacancies();
            renderVacanciesTable(updatedVacancies);
            alert("Vacancy added successfully!");
        }
    });

    // FAQ form
    document.getElementById("faq-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const question = document.getElementById("faq-question").value;
        const answer = document.getElementById("faq-answer").value;

        const result = await addFAQ(question, answer);
        if (result) {
            document.getElementById("faq-form").reset();
            const updatedFAQs = await fetchFAQs();
            renderFAQsTable(updatedFAQs);
            alert("FAQ added successfully!");
        }
    });

    // User search
    document.getElementById("user-search").addEventListener("keyup", async (e) => {
        const searchTerm = e.target.value;
        const searchedUsers = await fetchUsers(searchTerm);
        renderUsersTable(searchedUsers);
    });

    // Refresh users
    document.getElementById("refresh-users").addEventListener("click", async () => {
        const updatedUsers = await fetchUsers();
        renderUsersTable(updatedUsers);
        alert("Users refreshed!");
    });

    // Delete / edit buttons
    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-blog-btn")) {
            const id = e.target.dataset.id;
            if (confirm("Delete this blog?")) {
                const success = await deleteBlog(id);
                if (success) {
                    const updatedBlogs = await fetchBlogs();
                    renderBlogsTable(updatedBlogs);
                }
            }
        }
        if (e.target.classList.contains("delete-vacancy-btn")) {
            const id = e.target.dataset.id;
            if (confirm("Delete this vacancy?")) {
                const success = await deleteVacancy(id);
                if (success) {
                    const updatedVacancies = await fetchVacancies();
                    renderVacanciesTable(updatedVacancies);
                }
            }
        }
        if (e.target.classList.contains("delete-faq-btn")) {
            const id = e.target.dataset.id;
            if (confirm("Delete this FAQ?")) {
                const success = await deleteFAQ(id);
                if (success) {
                    const updatedFAQs = await fetchFAQs();
                    renderFAQsTable(updatedFAQs);
                }
            }
        }
        if (e.target.classList.contains("delete-user-btn")) {
            const id = e.target.dataset.id;
            if (confirm("Delete this user?")) {
                const success = await deleteUser(id);
                if (success) {
                    const updatedUsers = await fetchUsers();
                    renderUsersTable(updatedUsers);
                    alert("User deleted successfully!");
                }
            }
        }
        if (e.target.classList.contains("edit-user-btn")) {
            const id = e.target.dataset.id;
            const newRole = prompt("Enter new role (admin, user, accountant):");
            if (newRole && newRole.trim()) {
                const success = await updateUserRole(id, newRole);
                                if (success) {
                    const updatedUsers = await fetchUsers();
                    renderUsersTable(updatedUsers);
                    alert("User role updated successfully!");
                }
            }
        }
    });

    // Navigation toggle for mobile
    const navToggle = document.getElementById("nav-toggle");
    const navLinksEl = document.querySelector(".nav-links");

    if (navToggle) {
        navToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            navLinksEl?.classList.toggle("open");
        });
    }

    if (navLinksEl) {
        navLinksEl.querySelectorAll("a").forEach(a => {
            a.addEventListener("click", () => {
                if (window.innerWidth <= 900) navLinksEl.classList.remove("open");
            });
        });
    }

    // Dropdown menus for mobile
    document.querySelectorAll(".dropdown > a").forEach(link => {
        link.addEventListener("click", (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                const parent = link.parentElement;
                parent.classList.toggle("open");
                parent.querySelector(".dropdown-menu")?.classList.toggle("open");
            }
        });
    });

    // Close nav when clicking outside
    document.addEventListener("click", (e) => {
        if (navLinksEl && !navLinksEl.contains(e.target) && navToggle && !navToggle.contains(e.target)) {
            navLinksEl.classList.remove("open");
        }
    });
});


// Expose supabase and key functions to window for other scripts / console access
window.supabase = supabase;
window.adminAPI = {
    fetchUsers,
    fetchBlogs,
    fetchVacancies,
    fetchFAQs,
    fetchBookings,
    fetchPurchases,
    addBlog,
    addVacancy,
    addFAQ,
    deleteBlog,
    deleteVacancy,
    deleteFAQ,
    updateUserRole,
    deleteUser,
    loadDashboardData,
    getCurrentUser,
    signInUser,
    signOutUser
};