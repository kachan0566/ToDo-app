const API_URL = "api/todos.php";

let todos = [];
let currentFilter = "all";
let currentSort = "newest";
let editingTodoId = null;

const taskTitleInput = document.getElementById("task-title");
const taskDescInput  = document.getElementById("task-desc");
const addBtn         = document.getElementById("add-btn");
const todoList       = document.getElementById("todo-list");
const filterButtons  = document.querySelectorAll(".filter-btn");
const sortSelect     = document.getElementById("sort-select");
const errorMessage   = document.getElementById("error-message");

async function init() {
  bindEvents();
  await loadTodos();
}

function bindEvents() {
  addBtn.addEventListener("click", addTodo);

  taskTitleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTodo();
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });

  sortSelect.addEventListener("change", (event) => {
    setSort(event.target.value);
  });

  todoList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button");
    if (!actionButton) return;

    const card = actionButton.closest(".task-card");
    if (!card) return;

    const { id } = card.dataset;

    if (actionButton.classList.contains("edit-btn")) {
      startEdit(id);
      return;
    }
    if (actionButton.classList.contains("save-btn")) {
      saveEdit(id);
      return;
    }
    if (actionButton.classList.contains("cancel-btn")) {
      cancelEdit();
      return;
    }
    if (actionButton.classList.contains("delete-btn")) {
      deleteTodo(id);
    }
  });

  todoList.addEventListener("change", (event) => {
    if (event.target.classList.contains("task-checkbox")) {
      const card = event.target.closest(".task-card");
      if (card) toggleTodo(card.dataset.id);
    }
  });
}

// ── API: 一覧取得 ─────────────────────────────────────────────
async function loadTodos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error();
    const data = await res.json();
    todos = data.map(normalizeTodo);
    renderTodos();
  } catch {
    showError("データの取得に失敗しました");
  }
}

// ── API: タスク追加 ───────────────────────────────────────────
async function addTodo() {
  clearError();
  const title       = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();

  if (!title) {
    showError("タスク名を入力してください");
    taskTitleInput.focus();
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error();
    taskTitleInput.value = "";
    taskDescInput.value  = "";
    taskTitleInput.focus();
    await loadTodos();
  } catch {
    showError("タスクの追加に失敗しました");
  }
}

// ── API: 完了/未完了を切り替え ────────────────────────────────
async function toggleTodo(id) {
  const target = todos.find((todo) => todo.id === id);
  if (!target) return;

  try {
    const res = await fetch(`${API_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:       target.title,
        description: target.description,
        completed:   target.completed ? 0 : 1,
      }),
    });
    if (!res.ok) throw new Error();
    await loadTodos();
  } catch {
    showError("タスクの更新に失敗しました");
  }
}

function startEdit(id) {
  editingTodoId = id;
  clearError();
  renderTodos();
}

// ── API: 編集内容を保存 ───────────────────────────────────────
async function saveEdit(id) {
  clearError();
  const card = todoList.querySelector(`.task-card[data-id="${CSS.escape(id)}"]`);
  if (!card) return;

  const titleInput = card.querySelector(".edit-title-input");
  const descInput  = card.querySelector(".edit-desc-input");
  const title       = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title) {
    showError("タスク名を入力してください");
    titleInput.classList.add("error");
    titleInput.focus();
    return;
  }

  const target = todos.find((todo) => todo.id === id);
  if (!target) return;

  try {
    const res = await fetch(`${API_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        completed: target.completed ? 1 : 0,
      }),
    });
    if (!res.ok) throw new Error();
    editingTodoId = null;
    await loadTodos();
  } catch {
    showError("タスクの保存に失敗しました");
  }
}

function cancelEdit() {
  editingTodoId = null;
  clearError();
  renderTodos();
}

// ── API: タスク削除 ───────────────────────────────────────────
async function deleteTodo(id) {
  const ok = window.confirm("このタスクを削除しますか？");
  if (!ok) return;

  try {
    const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();
    if (editingTodoId === id) editingTodoId = null;
    await loadTodos();
  } catch {
    showError("タスクの削除に失敗しました");
  }
}

// ── 描画 ──────────────────────────────────────────────────────
function renderTodos() {
  const list = getProcessedTodos();
  todoList.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "表示するタスクがありません。";
    todoList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach((todo) => {
    fragment.appendChild(createTodoElement(todo));
  });
  todoList.appendChild(fragment);
}

function getProcessedTodos() {
  let filtered = [...todos];

  if (currentFilter === "active") {
    filtered = filtered.filter((todo) => !todo.completed);
  } else if (currentFilter === "completed") {
    filtered = filtered.filter((todo) => todo.completed);
  }

  filtered.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return currentSort === "newest" ? bTime - aTime : aTime - bTime;
  });

  return filtered;
}

function createTodoElement(todo) {
  const card = document.createElement("div");
  card.className = `task-card${todo.completed ? " is-completed" : ""}${editingTodoId === todo.id ? " is-editing" : ""}`;
  card.dataset.id = todo.id;

  if (editingTodoId === todo.id) {
    card.innerHTML = `
      <input class="task-checkbox" type="checkbox" ${todo.completed ? "checked" : ""}>
      <div class="task-content">
        <input class="edit-title-input" type="text" value="${escapeHtml(todo.title)}" maxlength="100">
        <textarea class="edit-desc-input" rows="3">${escapeHtml(todo.description || "")}</textarea>
        <p class="task-date">作成日: ${formatDate(todo.createdAt)}</p>
      </div>
      <div class="task-actions">
        <button class="save-btn" type="button">保存</button>
        <button class="cancel-btn" type="button">キャンセル</button>
      </div>
    `;
    return card;
  }

  card.innerHTML = `
    <input class="task-checkbox" type="checkbox" ${todo.completed ? "checked" : ""}>
    <div class="task-content">
      <p class="task-title">${escapeHtml(todo.title)}</p>
      <p class="task-desc">${escapeHtml(todo.description || "")}</p>
      <p class="task-date">作成日: ${formatDate(todo.createdAt)}</p>
    </div>
    <div class="task-actions">
      <button class="edit-btn" type="button">編集</button>
      <button class="delete-btn" type="button">削除</button>
    </div>
  `;

  return card;
}

// ── フィルタ・ソート ──────────────────────────────────────────
function setFilter(filterType) {
  currentFilter = filterType;
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filterType);
  });
  renderTodos();
}

function setSort(sortType) {
  currentSort = sortType;
  renderTodos();
}

// ── ユーティリティ ────────────────────────────────────────────

// MySQLのレスポンス（snake_case）をJS側の形式に変換する
function normalizeTodo(todo) {
  return {
    id:          String(todo.id),
    title:       todo.title,
    description: todo.description || "",
    completed:   Boolean(Number(todo.completed)),
    createdAt:   todo.created_at,
    updatedAt:   todo.updated_at,
  };
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("is-hidden");
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("is-hidden");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ja-JP", {
    year:   "numeric",
    month:  "2-digit",
    day:    "2-digit",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&",  "&amp;")
    .replaceAll("<",  "&lt;")
    .replaceAll(">",  "&gt;")
    .replaceAll('"',  "&quot;")
    .replaceAll("'",  "&#39;");
}

init();
