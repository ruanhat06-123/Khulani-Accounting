// main.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://xsunyupoliggstugqymd.supabase.co",
  "sb_publishable_Zp4Ofe8LyuyueKEQt0_RUQ_nOFG7v-l"
);

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
    .replace(/[%_]/g, "\\$&")
    .replace(/["'();]/g, "")
    .trim();
}

let currentUser = null;
let currentUsername = null;

document.addEventListener("DOMContentLoaded", () => {
  const pages = Array.from(document.querySelectorAll(".page"));
  const pageLinks = Array.from(document.querySelectorAll("[data-page]"));

  function hideAllPages() {
    pages.forEach(page => page.classList.remove("visible"));
  }

  function setActiveLink(pageId) {
    pageLinks.forEach(link => {
      link.classList.toggle("active-link", link.dataset.page === pageId);
    });
  }

  function showPage(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;

    hideAllPages();
    page.classList.add("visible");
    setActiveLink(pageId);
    history.replaceState(null, "", `#${pageId}`);
  }

  pageLinks.forEach(link => {
    const targetPage = link.dataset.page;
    if (!targetPage) return;

    link.addEventListener("click", event => {
      event.preventDefault();
      showPage(targetPage);
    });
  });

  const initialHash = window.location.hash.slice(1);
  const initialPage =
    (initialHash && document.getElementById(initialHash) && initialHash) ||
    pages.find(page => page.classList.contains("visible"))?.id ||
    pages[0]?.id;
  if (initialPage) showPage(initialPage);

  const loginBtn = document.getElementById("login-btn");
  const modal = document.getElementById("login-modal");
  const closeBtn = document.querySelector(".close");
  const showLoginBtn = document.getElementById("show-login");
  const showRegisterBtn = document.getElementById("show-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const faqList = document.getElementById("faq-list");
  const blogSection = document.getElementById("blog");
  const vacanciesSection = document.getElementById("vacancies");
  const membersSection = document.getElementById("members");
  const bookButtons = Array.from(document.querySelectorAll(".book-btn"));
  const pricingButtons = Array.from(document.querySelectorAll(".buy-btn"));
  const bookingPopup = document.getElementById("custom-popup");
  const pricingPopup = document.getElementById("pricing-popup");
  const bookingForm = document.getElementById("popup-form");
  const pricingForm = document.getElementById("pricing-form");
  const bookingPopupClose = bookingPopup?.querySelector(".popup-close");
  const pricingPopupClose = pricingPopup?.querySelector(".popup-close");

  function updateAuthUI() {
    if (currentUser && currentUsername && loginBtn) {
      loginBtn.innerHTML = `<i class="fas fa-user"></i> ${sanitizeText(currentUsername)}`;
      loginBtn.style.cursor = "default";
      loginBtn.style.pointerEvents = "none";
    } else if (loginBtn) {
      loginBtn.innerHTML = `<i class="fas fa-user"></i> Log In`;
      loginBtn.style.cursor = "pointer";
      loginBtn.style.pointerEvents = "auto";
    }
  }

  function sanitizeText(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,30}$/.test(username);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPassword(password) {
    return typeof password === "string" && password.length >= 8 && password.length <= 128 && !/\s/.test(password);
  }

  function isValidDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }

  function isValidTime(time) {
    return /^\d{2}:\d{2}$/.test(time);
  }

  function isAllowedOption(value, options) {
    return options.includes(String(value));
  }

  function isSafeUrl(url) {
    if (!url) return false;
    try {
      const parsed = new URL(url, window.location.origin);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  function openModal() {
    if (modal) modal.style.display = "block";
  }

  function closeModal() {
    if (modal) modal.style.display = "none";
  }

  function setModalTab(loginVisible = true) {
    if (!loginForm || !registerForm || !showLoginBtn || !showRegisterBtn) return;

    loginForm.classList.toggle("visible", loginVisible);
    registerForm.classList.toggle("visible", !loginVisible);
    showLoginBtn.classList.toggle("active", loginVisible);
    showRegisterBtn.classList.toggle("active", !loginVisible);
  }

  function installPasswordToggles() {
    document.querySelectorAll(".toggle-password").forEach(toggle => {
      const targetId = toggle.dataset.target;
      const field = targetId ? document.getElementById(targetId) : null;
      if (!field) return;

      toggle.addEventListener("click", () => {
        field.type = field.type === "password" ? "text" : "password";
        toggle.classList.toggle("active");
      });
    });
  }

  installPasswordToggles();

  function addInputRestrictions() {
    document.querySelectorAll("#login-username, #register-username").forEach(field => {
      field?.addEventListener("input", () => {
        field.value = field.value.replace(/[^a-zA-Z0-9_]/g, "");
      });
    });

    document.querySelectorAll("#login-password, #register-password, #register-confirm").forEach(field => {
      field?.addEventListener("input", () => {
        field.value = field.value.replace(/\s+/g, "");
      });
    });

    const emailField = document.getElementById("register-email");
    emailField?.addEventListener("input", () => {
      emailField.value = emailField.value.trim();
    });
  }

  addInputRestrictions();

  if (loginBtn) {
    loginBtn.addEventListener("click", event => {
      if (!currentUser) {
        event.preventDefault();
        openModal();
      }
    });
  }

  closeBtn?.addEventListener("click", closeModal);
  window.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  showLoginBtn?.addEventListener("click", event => {
    event.preventDefault();
    setModalTab(true);
  });

  showRegisterBtn?.addEventListener("click", event => {
    event.preventDefault();
    setModalTab(false);
  });

  setModalTab(true);

  function redirectAfterAuth(role) {
    const normalizedRole = (role || "").toString().trim().toLowerCase();
    
    // Add fade-out animation before redirect
    document.body.style.animation = "fadeOut 0.5s ease-out forwards";
    
    setTimeout(() => {
      window.location.href = normalizedRole === "admin" ? "admin.html" : "index.html";
    }, 500);
  }

  async function fetchProfileByUsername(username) {
    const { data, error } = await supabase
      .from("profiles")
      .select("email, role")
      .eq("username", username)
      .single();
    return error ? null : data;
  }

  async function fetchProfileByUserId(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role, username, email")
      .eq("id", userId)
      .maybeSingle();
    return error ? null : data;
  }

  loginForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const username = document.getElementById("login-username")?.value.trim();
    const password = document.getElementById("login-password")?.value || "";

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    if (!isValidUsername(username)) {
      alert("Username must be 3-30 characters and contain only letters, numbers, or underscores.");
      return;
    }

    if (!isValidPassword(password)) {
      alert("Password must be at least 8 characters and contain no spaces.");
      return;
    }

    const profile = await fetchProfileByUsername(username);
    if (!profile?.email) {
      alert("Username not found.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password
    });

    if (error || !data?.user) {
      alert("Invalid credentials. Please try again.");
      return;
    }

    currentUser = data.user;
    currentUsername = username;
    const role = profile.role || (await fetchProfileByUserId(data.user.id))?.role;
    
    updateAuthUI();
    closeModal();
    redirectAfterAuth(role);
  });

  registerForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const username = document.getElementById("register-username")?.value.trim();
    const email = document.getElementById("register-email")?.value.trim().toLowerCase();
    const password = document.getElementById("register-password")?.value || "";
    const confirm = document.getElementById("register-confirm")?.value || "";

    if (!username || !email || !password) {
      alert("Please fill all registration fields.");
      return;
    }

    if (!isValidUsername(username)) {
      alert("Username must be 3-30 characters and contain only letters, numbers, or underscores.");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      alert("Password must be at least 8 characters and contain no spaces.");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      alert("Username already taken.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error || !data?.user) {
      alert("Error registering: " + (error?.message || "Unknown error."));
      return;
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username,
      email
    });

    if (insertError) {
      alert("Error saving profile: " + insertError.message);
      return;
    }

    alert("Registration successful. Please log in.");
    setModalTab(true);
  });

  async function initAuthState() {
    const { data, error } = await supabase.auth.getSession();
    if (error) return;

    const user = data?.session?.user;
    if (!user) return;

    currentUser = user;
    const profile = await fetchProfileByUserId(user.id);
    currentUsername = profile?.username || profile?.email;
    const role = profile?.role?.toString().toLowerCase();

    updateAuthUI();

    if (window.location.pathname.endsWith("admin.html")) {
      if (role !== "admin") window.location.href = "index.html";
      return;
    }

    if (role === "admin") {
      window.location.href = "admin.html";
    }
  }

  initAuthState();

  async function loadBlogs() {
  if (!blogSection) return;

  const { data, error } = await supabase
    .from("blogs")
    .select("id, title, content, image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    blogSection.innerHTML = "<h2>Blog</h2><p>Unable to load blogs.</p>";
    return;
  }

  if (!data?.length) {
    blogSection.innerHTML = "<h2>Blog</h2><p>No blog posts available yet.</p>";
    return;
  }

  let blogsHtml = "<h2>Blog</h2><div class='blog-grid'>";

  data.forEach(blog => {
    const title = sanitizeText(blog.title);
    const imageUrl = isSafeUrl(blog.image_url) ? sanitizeText(blog.image_url) : "";
    blogsHtml += `
      <article class="blog-card">
        ${imageUrl ? `<img src="${imageUrl}" alt="${title}">` : ""}
        <button class="btn view-blog-btn" data-blog-id="${blog.id}">
          View ${title}
        </button>
      </article>
    `;
  });

  blogsHtml += "</div>";
  blogSection.innerHTML = blogsHtml;

  // Attach popup logic
  document.querySelectorAll(".view-blog-btn").forEach(button => {
    button.addEventListener("click", event => {
      const blogId = event.target.dataset.blogId;
      const blog = data.find(b => b.id == blogId);
      if (blog) {
        openBlogPopup(blog);
      }
    });
  });
}

function openBlogPopup(blog) {
  const popup = document.getElementById("blog-popup");
  const closeBtn = popup.querySelector(".popup-close");

  // Title
  document.getElementById("popup-blog-title").textContent = sanitizeText(blog.title);

  // Content: allow headings and paragraphs
  const contentEl = document.getElementById("popup-blog-content");
  contentEl.innerHTML = formatBlogContent(blog.content || "");

  // Image
  const img = document.getElementById("popup-blog-image");
  if (isSafeUrl(blog.image_url)) {
    img.src = sanitizeText(blog.image_url);
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  popup.style.display = "flex";

  // Close interactions
 closeBtn.onclick = () => popup.style.display = "none";
window.onclick = (event) => {
  if (event.target === popup) popup.style.display = "none";
};
document.onkeydown = (event) => {
  if (event.key === "Escape") popup.style.display = "none";
  };
}

function formatBlogContent(rawContent) {
  if (!rawContent) return "<p>No content available.</p>";

  const lines = rawContent.split(/\n+/).map(line => line.trim()).filter(Boolean);

  return lines.map(line => {
    // Convert markdown-style headings (#, ##, ###) into proper HTML headings
    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#{1,3}\s*/, "");
      return `<h${level}>${sanitizeText(text)}</h${level}>`;
    }

    // Normal paragraph (no bold heading injected)
    return `<p>${sanitizeText(line)}</p>`;
  }).join("");
}




  
  async function loadVacancies() {
    if (!vacanciesSection) return;

    const { data, error } = await supabase
      .from("vacancies")
      .select("id, title, description, image_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      vacanciesSection.innerHTML = "<h2>Vacancies</h2><p>Unable to load vacancies.</p>";
      return;
    }

    if (!data?.length) {
      vacanciesSection.innerHTML = "<h2>Vacancies</h2><p>No vacancies available at the moment.</p>";
      return;
    }

    let vacanciesHtml = "<h2>Vacancies</h2><p>Join our growing team. Explore current opportunities and build your career with RKH Accounting.</p><div class='vacancies-grid'>";
    
    data.forEach(vacancy => {
      const title = sanitizeText(vacancy.title);
      const description = sanitizeText(vacancy.description);
      const imageUrl = isSafeUrl(vacancy.image_url) ? sanitizeText(vacancy.image_url) : "";
      vacanciesHtml += `
        <article class="vacancy-card">
          ${imageUrl ? `<img src="${imageUrl}" alt="${title}">` : ""}
          <h3>${title}</h3>
          <p>${description}</p>
          <button class="btn apply-btn" data-vacancy-id="${vacancy.id}">Apply Now</button>
        </article>
      `;
    });
    
    vacanciesHtml += "</div>";
    vacanciesSection.innerHTML = vacanciesHtml;
  }

  async function loadMembersArea() {
    if (!membersSection || !currentUser) return;

    let membersHtml = `
      <h2>Members Area</h2>
      <div class="members-welcome">
        <h3>Welcome, ${escapeHTML(currentUsername)}!</h3>
        <p>Exclusive resources and information for registered members.</p>
        <button id="logout-btn" class="btn logout-btn">Log Out</button>
      </div>
    `;

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, service, date, time, payment_method, session_type")
      .eq("user_id", currentUser.id)
      .order("date", { ascending: true });

    if (error) {
      membersHtml += "<p>Unable to load bookings.</p>";
    } else if (!bookings?.length) {
      membersHtml += "<div class='bookings-section'><h3>Your Bookings</h3><p>You haven't made any bookings yet. <a href='#' data-page='book'>Book a service now!</a></p></div>";
    } else {
      membersHtml += "<div class='bookings-section'><h3>Your Bookings</h3><div class='bookings-table'>";
      
      bookings.forEach(booking => {
        const bookingDate = new Date(booking.date).toLocaleDateString();
        membersHtml += `
          <div class="booking-item">
            <h4>${sanitizeText(booking.service)}</h4>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${sanitizeText(booking.time) || "N/A"}</p>
            <p><strong>Session Type:</strong> ${sanitizeText(booking.session_type) || "N/A"}</p>
            <p><strong>Payment Method:</strong> ${sanitizeText(booking.payment_method) || "N/A"}</p>
          </div>
        `;
      });
      
      membersHtml += "</div></div>";
    }

    membersSection.innerHTML = membersHtml;
    
    const bookNowLinks = membersSection.querySelectorAll("a[data-page='book']");
    bookNowLinks.forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        showPage("book");
      });
    });

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut();
        currentUser = null;
        currentUsername = null;
        updateAuthUI();
        alert("You have been logged out successfully.");
        showPage("home");
      });
    }
  }

  async function loadFaqs() {
    if (!faqList) return;

    const { data, error } = await supabase
      .from("faqs")
      .select("question, answer")
      .order("id", { ascending: true });

    if (error) {
      faqList.innerHTML = "<p>Unable to load FAQs.</p>";
      return;
    }

    if (!data?.length) {
      faqList.innerHTML = "<p>No FAQs are available yet.</p>";
      return;
    }

    faqList.innerHTML = data
      .map(item => `
        <article class="faq-item">
          <h3>${sanitizeText(item.question)}</h3>
          <p>${sanitizeText(item.answer)}</p>
        </article>
      `)
      .join("");
  }

  loadBlogs();
  loadVacancies();
  loadFaqs();

  document.addEventListener("click", async event => {
    if (event.target.classList.contains("apply-btn")) {
      alert("Thank you for your interest! Please submit your application through our contact form.");
    }
  });

  let currentService = "";

  bookButtons.forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      
      if (!currentUser) {
        alert("Please log in to book a service.");
        openModal();
        return;
      }

      if (!bookingPopup) return;

      currentService = button.dataset.service || "Service";
      document.getElementById("popup-title").textContent = `Book: ${currentService}`;
      bookingPopup.style.display = "block";
    });
  });

  pricingButtons.forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      
      if (!currentUser) {
        alert("Please log in to purchase a plan.");
        openModal();
        return;
      }

      if (!pricingPopup) return;

      currentService = button.dataset.plan || "Plan";
      document.getElementById("pricing-title").textContent = `Purchase ${currentService} Plan`;
      pricingPopup.style.display = "block";
    });
  });

  bookingPopupClose?.addEventListener("click", () => {
    if (bookingPopup) bookingPopup.style.display = "none";
  });

  pricingPopupClose?.addEventListener("click", () => {
    if (pricingPopup) pricingPopup.style.display = "none";
  });

  window.addEventListener("click", event => {
    if (event.target === bookingPopup) bookingPopup.style.display = "none";
    if (event.target === pricingPopup) pricingPopup.style.display = "none";
  });

  bookingForm?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
      alert("Please log in to complete your booking.");
      return;
    }

    const date = document.getElementById("popup-date")?.value;
    const time = document.getElementById("popup-time")?.value;
    const payment = document.querySelector('input[name="payment"]:checked')?.value;
    const session = document.querySelector('input[name="session"]:checked')?.value;
    const paymentOptions = Array.from(document.querySelectorAll('input[name="payment"]')).map(input => input.value);
    const sessionOptions = Array.from(document.querySelectorAll('input[name="session"]')).map(input => input.value);
    const safeService = String(currentService || "").trim().slice(0, 100);

    if (!isValidDate(date) || !isValidTime(time) || !isAllowedOption(payment, paymentOptions) || !isAllowedOption(session, sessionOptions) || !safeService) {
      alert("Please select valid booking details before submitting.");
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      user_id: currentUser.id,
      service: safeService,
      date,
      time,
      payment_method: payment,
      session_type: session
    });

    if (error) {
      alert("Error booking service: " + error.message);
      return;
    }

    alert(`Booking confirmed for ${currentService} on ${date} at ${time}!`);
    bookingForm.reset();
    if (bookingPopup) bookingPopup.style.display = "none";
    
    if (currentUser) loadMembersArea();
  });

  pricingForm?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
      alert("Please log in to purchase a plan.");
      return;
    }

    const payment = document.querySelector('input[name="payment"]:checked')?.value;
    const paymentOptions = Array.from(document.querySelectorAll('input[name="payment"]')).map(input => input.value);
    const safePlan = String(currentService || "").trim().slice(0, 100);

    if (!safePlan || !isAllowedOption(payment, paymentOptions)) {
      alert("Please select a valid plan and payment option before submitting.");
      return;
    }

    const { error } = await supabase.from("purchases").insert({
      user_id: currentUser.id,
      plan: safePlan,
      payment_method: payment
    });

    if (error) {
      alert("Error processing purchase: " + error.message);
      return;
    }

    alert(`${currentService} plan purchased successfully!`);
    pricingForm.reset();
    if (pricingPopup) pricingPopup.style.display = "none";
  });

  const membersLink = document.querySelector('[data-page="members"]');
  if (membersLink) {
    membersLink.addEventListener("click", event => {
      if (!currentUser) {
        alert("Please log in to access the members area.");
        event.preventDefault();
        openModal();
        return;
      }
      loadMembersArea();
    });
  }

  const homeBtn = document.querySelector('a[data-page="book"]');
  if (homeBtn) {
    homeBtn.addEventListener("click", event => {
      event.preventDefault();
      showPage("book");
    });
  }

  updateAuthUI();

  // mobile nav toggle
  const navToggle = document.getElementById("nav-toggle");
  const navLinksEl = document.querySelector(".nav-links");
  const dropdownToggle = document.querySelector(".dropdown > a");

  navToggle?.addEventListener("click", () => {
    navLinksEl?.classList.toggle("open");
  });

  navLinksEl?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        navLinksEl?.classList.remove("open");
      }
    });
  });

  dropdownToggle?.addEventListener("click", event => {
    if (window.innerWidth <= 900) {
      event.preventDefault();
      const parent = event.target.closest(".dropdown");
      parent?.classList.toggle("open");
    }
  });
});
