// ===============================
// FINTRACK EXPENSE TRACKER
// ===============================

let transactions =
  JSON.parse(localStorage.getItem("transactions")) || [];

let currentType = "expense";

// DOM elements
const form = document.getElementById("transactionForm");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("search");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const toast = document.getElementById("toast");
const themeBtn = document.getElementById("themeBtn");

// Set today's date
dateInput.valueAsDate = new Date();


// ===============================
// TRANSACTION TYPE
// ===============================

document.querySelectorAll(".type-btn").forEach(button => {

  button.addEventListener("click", () => {

    document.querySelectorAll(".type-btn")
      .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    currentType = button.dataset.type;
  });

});


// ===============================
// ADD TRANSACTION
// ===============================

form.addEventListener("submit", function(event) {

  event.preventDefault();

  const amount = Number(amountInput.value);
  const description = descriptionInput.value.trim();
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  const transaction = {
    id: Date.now(),
    amount,
    description,
    category,
    date,
    type: currentType
  };

  transactions.unshift(transaction);

  saveData();

  form.reset();

  dateInput.valueAsDate = new Date();

  document.querySelectorAll(".type-btn")
    .forEach(btn => btn.classList.remove("active"));

  document
    .querySelector('[data-type="expense"]')
    .classList.add("active");

  currentType = "expense";

  showToast();

  updateDashboard();

});


// ===============================
// SAVE DATA
// ===============================

function saveData() {

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

}


// ===============================
// UPDATE DASHBOARD
// ===============================

function updateDashboard() {

  let income = 0;
  let expense = 0;

  transactions.forEach(transaction => {

    if (transaction.type === "income") {
      income += transaction.amount;
    } else {
      expense += transaction.amount;
    }

  });

  const balance = income - expense;

  incomeElement.textContent = formatCurrency(income);
  expenseElement.textContent = formatCurrency(expense);
  balanceElement.textContent = formatCurrency(balance);

  displayTransactions();

  updateChart();

}


// ===============================
// DISPLAY TRANSACTIONS
// ===============================

function displayTransactions() {

  const searchTerm =
    searchInput.value.toLowerCase().trim();

  const filtered =
    transactions.filter(transaction =>
      transaction.description
        .toLowerCase()
        .includes(searchTerm) ||
      transaction.category
        .toLowerCase()
        .includes(searchTerm)
    );

  if (filtered.length === 0) {

    transactionList.innerHTML = `
      <div class="empty">
        <div>💸</div>
        <p>No transactions found</p>
        <small>Try adding a transaction.</small>
      </div>
    `;

    return;
  }

  transactionList.innerHTML = "";

  filtered.forEach(transaction => {

    const div = document.createElement("div");

    div.className = "transaction";

    const icon = getCategoryIcon(transaction.category);

    const sign =
      transaction.type === "income" ? "+" : "-";

    div.innerHTML = `

      <div class="transaction-left">

        <div class="transaction-icon">
          ${icon}
        </div>

        <div>
          <div class="transaction-name">
            ${escapeHTML(transaction.description)}
          </div>

          <div class="transaction-date">
            ${transaction.category} •
            ${formatDate(transaction.date)}
          </div>
        </div>

      </div>

      <div class="transaction-right">

        <div class="transaction-amount 
          ${transaction.type}">
          ${sign}${formatCurrency(transaction.amount)}
        </div>

        <button
          class="delete-btn"
          onclick="deleteTransaction(${transaction.id})">
          🗑
        </button>

      </div>
    `;

    transactionList.appendChild(div);

  });

}


// ===============================
// DELETE TRANSACTION
// ===============================

function deleteTransaction(id) {

  transactions =
    transactions.filter(transaction =>
      transaction.id !== id
    );

  saveData();

  updateDashboard();

  showToast("Transaction deleted");

}


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener("input", () => {
  displayTransactions();
});


// ===============================
// CATEGORY ICON
// ===============================

function getCategoryIcon(category) {

  const icons = {
    Food: "🍔",
    Travel: "🚌",
    Shopping: "🛍️",
    Bills: "💡",
    Education: "📚",
    Entertainment: "🎬",
    Other: "📦"
  };

  return icons[category] || "📦";
}


// ===============================
// FORMAT CURRENCY
// ===============================

function formatCurrency(number) {

  return "₹" + number.toLocaleString("en-IN");

}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(date) {

  const newDate = new Date(date);

  return newDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

}


// ===============================
// TOAST
// ===============================

function showToast(message = "Transaction added successfully ✓") {

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);

}


// ===============================
// DARK MODE
// ===============================

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  const darkMode =
    document.body.classList.contains("dark");

  localStorage.setItem(
    "darkMode",
    darkMode
  );

  updateChart();

});


// Load saved theme
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}


// ===============================
// CHART
// ===============================

let expenseChart;

function updateChart() {

  const categories = {};

  transactions
    .filter(transaction => transaction.type === "expense")
    .forEach(transaction => {

      if (!categories[transaction.category]) {
        categories[transaction.category] = 0;
      }

      categories[transaction.category] +=
        transaction.amount;

    });

  const labels = Object.keys(categories);
  const values = Object.values(categories);

  const ctx =
    document.getElementById("expenseChart");

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(ctx, {

    type: "doughnut",

    data: {

      labels: labels.length
        ? labels
        : ["No expenses yet"],

      datasets: [{

        data: values.length
          ? values
          : [1],

        backgroundColor: [
          "#6c5ce7",
          "#16a085",
          "#f39c12",
          "#e74c3c",
          "#3498db",
          "#9b59b6",
          "#95a5a6"
        ],

        borderWidth: 0,

        hoverOffset: 8

      }]

    },

    options: {

      responsive: true,

      cutout: "70%",

      plugins: {

        legend: {
          position: "bottom",
          labels: {
            padding: 18,
            usePointStyle: true
          }
        }

      }

    }

  });

}


// ===============================
// SECURITY HELPER
// ===============================

function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}


// INITIAL LOAD

updateDashboard();
