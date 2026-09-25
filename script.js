const addIncomeButton = document.getElementById("add_income");
const addExpenseButton = document.getElementById("add_expense");

const formContainer = document.getElementById("form_container");
const form = document.getElementById("form");
const formTitle = document.getElementById("form_title");

const desc = document.getElementById("desc");
const category = document.getElementById("category");
const date = document.getElementById("date");
const amount = document.getElementById("amount");

const cancelButton = document.getElementById("cancel_button");

const displayData = document.getElementById("display_data");
const noTransactions = document.getElementById("no_transactions");

const totalIncome = document.getElementById("total_income");
const totalExpense = document.getElementById("total_expense");
const balance = document.getElementById("balance");

const search = document.getElementById("search");
const typeFilter = document.getElementById("type_filter");
const categoryFilter = document.getElementById("category_filter");

const incomeCategories = ["Salary", "Freelance", "Business", "Investment", "Bonus", "Gift", "Other"];
const expenseCategories = ["Food", "Groceries", "Transportation", "Rent", "Shopping",
    "Healthcare", "Education", "Entertainment", "Travel", "Subscription", "Other"];

let transactions = JSON.parse(localStorage.getItem("transaction_data")) || [];
let currentType = "";
let editingId = null;

addIncomeButton.addEventListener("click", () => openForm("income"));
addExpenseButton.addEventListener("click", () => openForm("expense"));

function openForm(type) {
    currentType = type;
    editingId = null;
    form.reset();
    formTitle.textContent = `Add ${capitalize(type)}`;
    document.getElementById("add_transaction").textContent = `Add ${capitalize(type)}`;
    loadCategories(type === "income" ? incomeCategories : expenseCategories);
    formContainer.classList.remove("hidden");
}
function loadCategories(categories) {
    category.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        category.appendChild(option);
    });
}

// Add or Edit transaction
form.addEventListener("submit", event => {
    event.preventDefault();
    if (!desc.value.trim()) {
        alert("Please enter a description.");
        return;
    }
    if (!category.value) {
        alert("Please select a category.");
        return;
    }
    if (!date.value) {
        alert("Please select a date.");
        return;
    }
    if (!amount.value || Number(amount.value) <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const transaction = {
        id: editingId || crypto.randomUUID(),
        type: currentType,
        desc: desc.value.trim(),
        category: category.value,
        date: date.value,
        amount: Number(amount.value)
    };
    if (editingId) {
        transactions = transactions.map(item =>
            item.id === editingId ? transaction : item
        );
    } else {
        transactions.push(transaction);
    }
    saveTransactions();
    form.reset();
    formContainer.classList.add("hidden");
    editingId = null;
});
   
function saveTransactions() {
    localStorage.setItem("transaction_data", JSON.stringify(transactions));
    displayTransactions();
    updateSummary();
    updateCategoryFilter();
}

//Display Transactions
function displayTransactions() {
    const searchValue = search.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;
    const filteredTransactions = transactions.filter(item => {
        const matchesSearch = item.desc.toLowerCase().includes(searchValue) ||
            item.category.toLowerCase().includes(searchValue);
        const matchesType = selectedType === "all" ||
            item.type === selectedType;
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        return matchesSearch && matchesType && matchesCategory;
    });
    displayData.innerHTML = "";
    if (filteredTransactions.length === 0) {
        noTransactions.style.display = "block";
        return;
    } else {
        noTransactions.style.display = "none";
    }

    filteredTransactions.forEach(item => {
        const row = document.createElement("tr");
        const amountClass = item.type === "income" ? "income-text" : "expense-text";
        row.innerHTML = `
            <td>${item.desc}</td>
            <td>${capitalize(item.type)}</td>
            <td>${item.category}</td>
            <td>${item.date}</td>
            <td class="${amountClass}"> &#x20B9;${item.amount.toFixed(2)}</td>
            <td>
                <button class="edit-btn" data-id="${item.id}">Edit</button>
                <button class="delete-btn" data-id="${item.id}">Delete</button>
            </td>`;
        displayData.appendChild(row);
    });
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

// Update summary
function updateSummary() {
    const income = transactions
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);
    const expense = transactions
        .filter(item => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = income - expense;
    totalIncome.textContent = `\u20B9${income.toFixed(2)}`;
    totalExpense.textContent =
        `\u20B9${expense.toFixed(2)}`;
    balance.textContent =
        `\u20B9${currentBalance.toFixed(2)}`;
}


// Update category filter
function updateCategoryFilter() {
    const currentValue = categoryFilter.value;
    const categories = [
        ...new Set(
            transactions.map(item => item.category)
        )
    ];
    categoryFilter.innerHTML =
        '<option value="all">All Categories</option>';

    categories.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        categoryFilter.appendChild(option);
    });
    if (categories.includes(currentValue)) {
        categoryFilter.value = currentValue;
    } else {
        categoryFilter.value = "all";
    }
}


// Edit / Delete buttons
displayData.addEventListener("click", (event) => {
    const id = event.target.dataset.id;
    if (!id) {
        return;
    }
    if (event.target.classList.contains("delete-btn")) {
        deleteTransaction(id);
    }
    if (event.target.classList.contains("edit-btn")) {
        editTransaction(id);
    }
});


// Edit transaction
function editTransaction(id) {
    const transaction =
        transactions.find(item => item.id === id);
    if (!transaction) {
        return;
    }
    editingId = id;
    currentType = transaction.type;
    if (currentType === "income") {
        loadCategories(incomeCategories);
    } else {
        loadCategories(expenseCategories);
    }
    desc.value = transaction.desc;
    category.value = transaction.category;
    date.value = transaction.date;
    amount.value = transaction.amount;
    formTitle.textContent = currentType === "income" ? "Edit Income" : "Edit Expense";
    document.getElementById("add_transaction").textContent = "Update Transaction";
    formContainer.classList.remove("hidden");
    window.scrollTo({
        top: formContainer.offsetTop,
        behavior: "smooth"
    });
}


// Delete transaction
function deleteTransaction(id) {
    const confirmed = confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) {
        return;
    }
    transactions = transactions.filter(item => item.id !== id);
    saveTransactions();
}

// Cancel form
cancelButton.addEventListener("click", () => {
    form.reset();
    editingId = null;
    formContainer.classList.add("hidden");
});

// Filters
search.addEventListener("input", displayTransactions);
typeFilter.addEventListener("change", displayTransactions);
categoryFilter.addEventListener("change", displayTransactions);

 
displayTransactions();
updateSummary();
updateCategoryFilter();