<!--
以下はユーザー原文を一字一句そのまま保存したアーカイブです（プレビューでは表示されません）。

アプリ起動
↓
HTML読み込み
↓
JS読み込み

#HTMLの要素をJSで使用するためのHTML要素の読み込みと紐付け
const taskTitleInput = document.getElementById("task-title”);→`document`（HTML文書全体）`.getElementById("task-title”)`（〜の中からid属性がtask-titleの要素を返す）
const filterButtons = document.querySelectorAll(".filter-btn");　.etc

使用メソッド
|getElementById(“id”);|HTMLから()を含むid要素を返す。|
上記であれば、<input id="task-title" type="text" placeholder="例: 買い物に行く" maxlength="100">
|querySelectorAll(“セレクタ”);|HTMLからセレクタと一致する要素を全て返す。（）内が.始まり→class要素。|
上記であれば、 <button class="filter-btn is-active" type="button" data-filter="all">すべて</button>
         　　　  　<button class="filter-btn" type="button" data-filter="active">未完了</button>
                        <button class="filter-btn" type="button" data-filter="completed">完了</button>

↓
#初期処理
・init()
function init() {
  loadTodos();−1
  bindEvents();
  renderTodos();

1.loadTodos()
・タスク一覧を保存データから取得する
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);　　　　　　　　　　ローカルストレージからキー名（STORAGE_KEY）のデータを文字列で取得→savedと定義
    if (!saved) {　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　 savedがない（保存データがない）場合、タスク一覧を空欄で返す
      todos = [];
      return;
    }

    const parsed = JSON.parse(saved);　　　　　　　　　　　　　　　　　　　　savedで定義された保存データをJSON形式の配列、オブジェクトに変換
    if (!Array.isArray(parsed)) {　　　　　　　　　　　　　　　　　　　　　　 上記で取得したデータが配列でない場合、タスク一覧を空欄で返す
      todos = [];
      return;
    }

    todos = parsed.filter(isValidTodo).map((todo) => ({　　　　　　　　（isValidTodo)の条件下でtrueを返したもののtitle（タイトル）、description（詳細部分）を文字列にtodo.completedをtrue/falseに変換し新配列を作成
      ...todo,
      title: String(todo.title),
      description: String(todo.description || ""),
      completed: Boolean(todo.completed),
    }));
  } catch (error) {　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　上記でエラーが発生した場合、タスク一覧を空欄で返す
    todos = [];
  }
}
・使用メソッド
|try{}catch(error){}|エラー発生の可能性が高い処理において、安全に処理を行うための構文。
　　　　　　　　　  try{}にエラー発生の可能性がある処理、catch(error){}にエラー時の処理を記入。今回で言えば、localStorage.getItem(STORAGE_KEY)において、文字列としてローカルストレージから取り出してきたデータに問題があり、
　　　　　　　　　  JSON.parse(saved)でJSONの配列やオブジェクトに変換する際にエラーが発生する可能性がある。|
|.getItem(キー名)|キー名の保存データを文字列のまま取得|　
|JSON.parse()|文字列データをJSON形式の配列やオブジェクトに変換|
|!Array.isArray()|()の要素が配列かどうかを確認し（.isArray)、配列でなかった場合(!Array)、trueを返す|
|filter()|（）の条件がtrueのものだけを返す|
|map(（要素)=>({処理}|各(要素)に{処理}を行い新たに配列を作成する|

・流れ
if(saved){…　保存データの有無を確認
↓
if (!Array.isArray(parsed)) {　呼び出したデータが壊れていないか確認（JSON.parseによって配列に変換できているか）
↓
todos = parsed.filter(isValidTodo).map((todo) => ({　有効なタスクを表示用に変換し、新たに配列
↓
} catch (error) {　エラーがあった場合、タスク一覧を空欄で返す

1-1.isValidTodo
function isValidTodo(todo) {
  return (
    todo &&　　　　　　　　　　　　　　　　　　　　　　　　　　　todoが存在し、todo.idやtodo.title、todo.createdAt、todo.updatedAtの全てが文字列である場合、trueを返す
    typeof todo.id === "string" &&
    typeof todo.title === "string" &&
    typeof todo.createdAt === "string" &&
    typeof todo.updatedAt === "string"
  );
}
・演算子
|条件a && 条件b|条件aと条件bの両方がtrueの場合のみtrueを返す|

・意義
取得した保存データのtodoオブジェクトが存在し、各プロパティが文字列であることを確認するため（JS Lines.101などから文字列である必要あり）



2.bindEvents();
・各ユーザー操作のイベントを登録
function bindEvents() {


2-1.addBtn.addEventListener("click", addTodo);
・ユーザーがタスク追加ボタンをクリックした時の処理
addBtn.addEventListener("click", addTodo);
・使用メソッド
|〇〇.addEventListener(操作,処理）|〇〇に”操作”をした場合、”処理”を実行するイベントを登録|

・実行内容
ユーザーが`id = add-btn`を持つ”追加”ボタンを”クリック”したらaddTodoを実行する

HTML
<button id="add-btn" type="button">追加</button>
JS
const addBtn = document.getElementById("add-btn");

addBtn.addEventListener("click", addTodo);

2-1-1.addTodo
・ユーザーがタスク追加ボタンをクリックし、addTodoが実行された時の処理
function addTodo() {
  clearError();
  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();

  if (!title) {
    showError("タスク名を入力してください");
    taskTitleInput.focus();
    return;
  }

  const now = new Date().toISOString();
  const todo = {
    id: Date.now().toString(),
    title,
    description,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  todos.push(todo);
  saveTodos();
  renderTodos();

  taskTitleInput.value = "";
  taskDescInput.value = "";
  taskTitleInput.focus();
}

・taskTitleInput / taskDescInput
JS
const taskTitleInput = document.getElementById("task-title");
const taskDescInput = document.getElementById("task-desc");
HTML
<input id="task-title" type="text" placeholder="例: 買い物に行く" maxlength="100">
<textarea id="task-desc" rows="3" placeholder="例: 牛乳とパンを買う"></textarea>
・解釈
id="task-title”、"task-desc”を含むHTML上（タイトル入力欄とタスク詳細入力欄）の空白を削除(trim)
空白のみの入力でもタスクが追加されるのを防ぐ

・流れ
clearError：前回作業時にエラーメッセージが表示されていた場合に消去するため
↓
const title/description：空白のみで構成されない（trim)タイトルと詳細
if(!title)　showError("タスク名を入力してください”);：タイトルが空欄ならエラー表示
↓
const now/todo　タスク１件の情報（idなど）を定義
todos.push(todo);　タスク一覧にタスクを新しく追加
↓
saveTodos();　タスク一覧を保存
↓
renderTodos();　タスク一覧を再描画
↓
taskTitleInput.value = “”;…　各入力欄を空白に戻し、再度操作対象を入力欄へ

・使用メソッド
| `trim()` | 文字列の前後の空白を削除する |
| `〇〇.focus()` | 〇〇をキーボード操作の対象にする |
| `toISOString()` | `Date` などを ISO 8601 形式の文字列にする（保存向き） |
| `Date.now()` | 1970-01-01 からの経過ミリ秒（数値）を返す |
| `toString()` | 値を文字列に変換する（例: `Date.now()` の数値を文字列化） |
| `〇〇.push()` | 配列の末尾に要素を追加する |

2-1-1-1.clearError()
・前回作業時にエラーメッセージが表示されていた場合に消去する
function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("is-hidden");
・errorMessage 
JS
const errorMessage = document.getElementById("error-message");
HTML
<p id="error-message" class="error-message is-hidden" role="alert" aria-live="polite"></p>
CSS
.is-hidden {
  display: none;
}
・解釈
id = error-messageを持つHTMLのテキスト内容を空白にする。classListに”is-hidden”を加えることでCSSでの定義により、画面に非表示となる。


2-1-1-2.showError
・エラーメッセージの表示方法を定義
　classListのis-hiddenを取り除き、表示
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("is-hidden");
}

2-1-1-3.saveTodos
・タスク一覧を保存する
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
・使用メソッド
|localStorage.setItem(キー名,値）|ローカルストレージにキー名で定義された値を保存する|
|JSON.stringify()|（）をJSON文字列に変換|

・解釈
タスク一覧(todos)をJSON文字列に変化し、ローカルストレージにSTORAGE_KEYとして保存

2-1-1-4.renderTodos
・タスク一覧を再描画する
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
JS
const todoList = document.getElementById("todo-list");
HTML
<section id="todo-list" class="todo-list" aria-label="タスク一覧"></section>

・流れ
getProcessedTodos()で加工されたタスク一覧を取得
↓
現在のHTML上のタスク一覧をinnerHTMLで空白として再描画
↓
取得したタスクが一つもない時、id = todo-listに"表示するタスクがありません。”を表示
const empty = document.createElement(“p”);でHTML要素を作成→   todoList.appendChild(empty);でtodo-listに追加
↓
タスクをまとめてtodo-listに追加
createDocumentFragment();で作成したfragmentにcreateTodoElement(todo)で作成したタスクを追加→フラグメントをタスク一覧に追加

・使用メソッド
| `document.createElement()` | 新しく要素を作る |
| `〇〇.appendChild()` | 親要素の子として（）ノードを追加する |
| `document.createDocumentFragment()` | 複数要素を一時的に入れる「箱」を作る |

・プロパティ
|〇〇.innerHTML=a|〇〇の子要素をaに書き換える|

2-1-1-4-1.getProcessedTodos()
・フィルターやソートをした時の処理を定義
function getProcessedTodos() {
  let filtered = [...todos];

  if (currentFilter === "active") {
    filtered = filtered.filter((todo) => !todo.completed);
  } else if (currentFilter === "completed") {
    filtered = filtered.filter((todo) => todo.completed);
  }

  //
  filtered.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return currentSort === "newest" ? bTime - aTime : aTime - bTime;
  });

  return filtered;

・使用メソッド
| `sort(比較関数)` | 配列を（）のルールに従って並べ替える（通常は `a`, `b` を比較） |
| `Date.（prototype）.getTime()` | 日付をミリ秒の数値にし、比較しやすくする |
| `filter(条件)` | 条件に合う要素だけを集めた新しい配列を返す |

・流れ
loadTodosで取得したtodosをコピー
↓
フィルターごとの処理を定義
currentFilter === "active”（フィルターが未完了）の時→コピーしたtodosの内、todo.completed（function addTodo/ const todoで定義)がfalseのtodoを取得しfilteredに再定義
currentFilter === "completed”（フィルターが完了）の時→コピーしたtodosの内、todo.completedがtrueのtodoを取得しfilteredに再定義
↓
ソートの処理を定義
new Date(a.createdAt).getTime();→aのcreatedAt（作成日時：function addTodo/ const todoで定義)のオブジェクトを数値で返す（getTime()）
currentSort === "newest" ? bTime - aTime : aTime - bTime;→現在のソートが新しい順であればcurrentSortはnewestであり、trueが選ばれbTime - aTime（1970年からのミリ秒が大きい方が新しい）
↓
実行したfilteredを返す

2-1-1-4-2.createTodoElement()
・フラグメントに入れる要素を作成
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

・流れ
新たにHTML要素を作成（div class = task-card ~、完了・編集中次第で〜に追加）
↓
editingTodoId === todo.id（編集中のタスク）
Cardの子要素を作成（チェックボックスの定義、タイトルはユーザー入力のtodo.title（escapehtmlでHTML上での危険なコード入力を防ぐ）、作成日は(todo.createdAt）
↓
編集中でないタスクも同様の構成でHTMLを作成

2-1-1-4-2-1.formatDate
・(todo.createdAt)のISO文字列を日本表示形式に
function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
・流れ
New Dateで引数（今回はtodo.createdAt）を日付けオブジェクトに変換
↓
getTime()でミリ秒の数値に変換し、Number.isNaNで数値として無効か判断（new Date()で変換したオブジェクトが日付としては有効か不明な為）
↓
new Dateで変換した日付けオブジェクトをtoLocaleString("ja-JP", {})で日本表示形式に変換
year: "numeric”→年は”数字”で表示
その他は"2-digit”（2桁）で表示
例）
const now(function addTodo) = new Date().ISOstring()→2026-04-17T08:30:45.123Z
const date(function formatDate) = new Date()→上記の日付オブジェクトに
return date.toLocaleString("ja-JP", { ・・・→2026/04/17 17:30

・使用メソッド
| `Number.isNaN()` | 値が `NaN` かどうかを判定する |
| `toLocaleString()` | 地域に合った日時などの表記文字列にする |


2-1-1-4-2-2.escapehtml
・HTML上でユーザーが入力した文字が処理されないように
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
・解釈
因数を文字列に変換し、更に.replaceAll(a,b)によってaをbに置き換えることで、ユーザーが”&”や”<“”>”を入力してもHTML上で処理が実行されないようにする

・使用メソッド
| `replaceAll(a, b)` | 文字列内の `a` をすべて `b` に置き換える |



2-2.taskTitleInput.addEventListener("keydown", 
・タスクタイトルの入力欄でのイベントを登録
taskTitleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTodo();
    }
});
・解釈
Tasktitleinput(document.getElementById("task-title”);)にキーを押した時、
「Enterキーを押したらデフォルト処理を防ぎ、addTodoを実行する」というイベントを登録

・使用メソッド
| `preventDefault()` | ブラウザの既定の動作を防ぐ（例: Enter でフォーム送信されるのを止める） |

2-3.filterButtons.forEach((button) => {
・フィルターボタンに機能を設定
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });
・filterbuttons
JS
const filterButtons = document.querySelectorAll(".filter-btn");
HTML
<button class="filter-btn is-active" type="button" data-filter="all">すべて</button>
<button class="filter-btn" type="button" data-filter="active">未完了</button>
<button class="filter-btn" type="button" data-filter="completed">完了</button>
・解釈
filterButtonsのbuttonそれぞれにclickしたらsetFilter(button.dataset.filter);→（HTMLのbutton data-filter）を実行する

・使用メソッド
（再）|querySelectorAll(“セレクタ”);|HTMLからセレクタと一致する要素を全て返す|
　　 | `配列.forEach(要素) | 配列の各要素に対して処理を行う |



2-3-1.setfilter
function setFilter(filterType) {
  currentFilter = filterType;
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filterType);
  });
  renderTodos();
}
・使用メソッド
|〇〇.toggle(クラス名,条件）|条件がtrueの時にクラス名を〇〇につける、falseの時に外す|

・解釈
filterbuttonsのそれぞれのbuttonに対して、 今クリックされたbutton.dataset.filterのbutton.classにis-activeをつける
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });

2-4. sortSelect.addEventListener("change", (event) => {
・並び替えボタンに機能を設定
 sortSelect.addEventListener("change", (event) => {
    setSort(event.target.value);
  });
・解釈
sortSelect（HTMLのid = sortSelect)を変更したら、setSort()を実行する

・sortSelect
JS
const sortSelect = document.getElementById("sort-select");
HTML
<select id="sort-select">
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
</select>

2-4-2.setSort
function setSort(sortType) {
  currentSort = sortType;
  renderTodos();
}
・解釈
setSort(event.target.value)の場合、event（変更）が操作された値をcurrentSort = に設定し、renderTodosで再描画する
function renderTodos() {
  const list = getProcessedTodos();//
  todoList.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "表示するタスクがありません。";
    todoList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();//タスク一覧を表示するためのフラグメントを作成
  list.forEach((todo) => {
    fragment.appendChild(createTodoElement(todo));
  });
  todoList.appendChild(fragment);
}

function getProcessedTodos() {
  let filtered = [...todos];

  if (currentFilter === "active") {//アクティブなタスクを表示する時の処理
    filtered = filtered.filter((todo) => !todo.completed);
  } else if (currentFilter === "completed") {//完了したタスクを表示する時の処理
    filtered = filtered.filter((todo) => todo.completed);
  }

  //
  filtered.sort((a, b) => {//作成日時で並び替える時の処理
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return currentSort === "newest" ? bTime - aTime : aTime - bTime;
  });

  return filtered;
}

2-5.todoList.addEventListener("click", (event) => {
・タスク一覧での機能を設定
todoList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button");
    const card = actionButton.closest(".task-card");
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

・todoList
JS
const todoList = document.getElementById("todo-list");
HTML
<section id="todo-list" class="todo-list" aria-label="タスク一覧"></section>

・const actionButton = event.target.closest("button");
クリックした要素に最も近い”button”

・const card = actionButton.closest(".task-card");
    const { id } = card.dataset;
クリックした要素に最も近い”button”に最も近い".task-card"

function createTodoElement(todo) {
const card = document.createElement("div");
card.className = `task-card${todo.completed ? " is-completed" : ""}${editingTodoId === todo.id ? " is-editing" : ""}`;
card.dataset.id = todo.id;
〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜
if (editingTodoId === todo.id) {
    card.innerHTML = `

<div class="task-actions">
        <button class="save-btn" type="button">保存</button>
        <button class="cancel-btn" type="button">キャンセル</button>
</div>

card.innerHTML = `
<div class="task-actions">
      <button class="edit-btn" type="button">編集</button>
      <button class="delete-btn" type="button">削除</button>
    </div>

・解釈
HTML
<section id="todo-list" class="todo-list" aria-label="タスク一覧"></section>
に編集ボタン（actionButton.classList.contains("edit-btn”)）を押したらstartEdit(id)、保存ボタン（actionButton.classList.contains(“save-btn”)）を押したらsaveEdit(id)、キャンセルボタン（actionButton.classList.contains(“cansel-btn”)）を押したらcanselEdit(id)、削除ボタン（actionButton.classList.contains(“delete-btn”)）を押したらdeleteTodo(id)を実行するイベントを登録


2-5-1.startEdit
・タスクを編集状態にする
function startEdit(id) {
  editingTodoId = id;
  clearError();
  renderTodos();
}
・流れ
clearError(2-1-1-1)
renderTodos(2-1-1-4)

2-5-2.saveEdit
・タスクカードに入力した内容を保存する
function saveEdit(id) {
  clearError();
  const card = todoList.querySelector(`.task-card[data-id="${CSS.escape(id)}"]`);
  if (!card) {
    return;
  }

  const titleInput = card.querySelector(".edit-title-input");
  const descInput = card.querySelector(".edit-desc-input");
  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title) {
    showError("タスク名を入力してください");
    titleInput.classList.add("error");
    titleInput.focus();
    return;
  }

  const target = todos.find((todo) => todo.id === id);
  if (!target) {
    return;
  }

  target.title = title;
  target.description = description;
  target.updatedAt = new Date().toISOString();

  editingTodoId = null;
  saveTodos();
  renderTodos();
}
・流れ
clearError(2-1-1-1)
↓
function createTodoElement(todo) のif (editingTodoId === todo.id) {の条件下で
Input class = .edit-title-inputが空欄の場合、showError(2-1-1-2)→input class = .edit-title-input error（add("error")）→ユーザーの操作対象を入力欄へ（focus()）
↓
find()でタスク一覧に編集中のタスクのidと同じものがあるかを確認し、無ければ空欄で返す
↓
一致したものがあれば、タイトルなどの内容を新たに再定義
↓
編集中の状態を終了
↓
saveTodos(2-1-1-3)
↓
renderTodos(2-1-1-4)

・使用メソッド
| `CSS.escape()` | 文字列をセレクタに埋め込んでも安全になるようエスケープする |
| `classList.add()` | 要素にクラスを追加する |

2-5-3.canselEdit
・編集をキャンセル
function cancelEdit() {
  editingTodoId = null;
  clearError();
  renderTodos();
}
・流れ
編集中の状態を終了
↓
saveTodos(2-1-1-3)
↓
renderTodos(2-1-1-4)

2-5-4.deleteTodo
・タスクを削除
function deleteTodo(id) {
  const ok = window.confirm("このタスクを削除しますか？");
  if (!ok) {
    return;
  }

  todos = todos.filter((todo) => todo.id !== id);
  if (editingTodoId === id) {
    editingTodoId = null;
  }
  saveTodos();
  renderTodos();
}

・流れ
確認画面を表示（window.confirm("このタスクを削除しますか？");）
↓
キャンセルをユーザーが選んだ場合、処理を中止(if(!ok))
↓
選択中のidと異なるidだけを残し、タスク一覧を再配列する→選択したタスクを削除
編集中のタスクを削除した場合、nullへ変更
↓
saveTodos(2-1-1-3)
↓
renderTodos(2-1-1-4)

2-6. todoList.addEventListener("change", (event) => {
・タスク一覧にチェックボックスの設定を行う
  todoList.addEventListener("change", (event) => {
    if (event.target.classList.contains("task-checkbox")) {
      const card = event.target.closest(".task-card");
      const { id } = card.dataset;
      toggleTodo(id);
    }
  });
・"task-checkbox"
 <input class="task-checkbox" type="checkbox" ${todo.completed ? "checked" : ""}>
・流れ
HTML上の"task-checkbox”を含むclassで操作を行った場合、最も近い".task-card”classのidを取得
↓
そのidにおいてtoggletodoを実行

2-6-1.toggletodo
function toggleTodo(id) {
  const target = todos.find((todo) => todo.id === id);
  if (!target) {
  }
  target.completed = !target.completed;
  target.updatedAt = new Date().toISOString();
  saveTodos();//タスク一覧を保存する
  renderTodos();
・流れ
引数のidと一致するtodo.idをタスク一覧から探す
見つからなければ、空欄で返す
↓
上記で見つけたtodo.completedの真偽値を反転（true←→false)
↓
app.todoと同様にtodo.updateAtを取得
↓
renderTodos(2-1-1-4)
-->

## プレビュー用（表・見出しを効かせる版）

<p>アプリ起動<br>↓<br>HTML読み込み<br>↓<br>JS読み込み</p>
<h1>#HTMLの要素をJSで使用するためのHTML要素の読み込みと紐付け</h1>
<pre><code>const taskTitleInput = document.getElementById("task-title”);→`document`（HTML文書全体）`.getElementById("task-title”)`（〜の中からid属性がtask-titleの要素を返す）
const filterButtons = document.querySelectorAll(".filter-btn");　.etc</code></pre>
<p><br></p>
<p>使用メソッド<br>|getElementById(“id”);|HTMLから()を含むid要素を返す。|<br>上記であれば、&lt;input id="task-title" type="text" placeholder="例: 買い物に行く" maxlength="100"&gt;<br>|querySelectorAll(“セレクタ”);|HTMLからセレクタと一致する要素を全て返す。（）内が.始まり→class要素。|<br>上記であれば、 &lt;button class="filter-btn is-active" type="button" data-filter="all"&gt;すべて&lt;/button&gt;<br>         　　　  　&lt;button class="filter-btn" type="button" data-filter="active"&gt;未完了&lt;/button&gt;<br>                        &lt;button class="filter-btn" type="button" data-filter="completed"&gt;完了&lt;/button&gt;</p>
<p>↓<br>#初期処理<br>・init()<br>function init() {<br>  loadTodos();−1<br>  bindEvents();<br>  renderTodos();</p>
<p>1.loadTodos()<br>・タスク一覧を保存データから取得する<br>function loadTodos() {<br>  try {<br>    const saved = localStorage.getItem(STORAGE_KEY);　　　　　　　　　　ローカルストレージからキー名（STORAGE_KEY）のデータを文字列で取得→savedと定義<br>    if (!saved) {　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　 savedがない（保存データがない）場合、タスク一覧を空欄で返す<br>      todos = [];<br>      return;<br>    }</p>
<pre><code>    const parsed = JSON.parse(saved);　　　　　　　　　　　　　　　　　　　　savedで定義された保存データをJSON形式の配列、オブジェクトに変換
    if (!Array.isArray(parsed)) {　　　　　　　　　　　　　　　　　　　　　　 上記で取得したデータが配列でない場合、タスク一覧を空欄で返す
      todos = [];
      return;
    }</code></pre>
<p><br></p>
<pre><code>    todos = parsed.filter(isValidTodo).map((todo) =&gt; ({　　　　　　　　（isValidTodo)の条件下でtrueを返したもののtitle（タイトル）、description（詳細部分）を文字列にtodo.completedをtrue/falseに変換し新配列を作成
      ...todo,
      title: String(todo.title),
      description: String(todo.description || ""),
      completed: Boolean(todo.completed),
    }));
  } catch (error) {　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　上記でエラーが発生した場合、タスク一覧を空欄で返す
    todos = [];
  }
}</code></pre>
<p>・使用メソッド<br>|try{}catch(error){}|エラー発生の可能性が高い処理において、安全に処理を行うための構文。<br>　　　　　　　　　  try{}にエラー発生の可能性がある処理、catch(error){}にエラー時の処理を記入。今回で言えば、localStorage.getItem(STORAGE_KEY)において、文字列としてローカルストレージから取り出してきたデータに問題があり、<br>　　　　　　　　　  JSON.parse(saved)でJSONの配列やオブジェクトに変換する際にエラーが発生する可能性がある。|<br>|.getItem(キー名)|キー名の保存データを文字列のまま取得|　<br>|JSON.parse()|文字列データをJSON形式の配列やオブジェクトに変換|<br>|!Array.isArray()|()の要素が配列かどうかを確認し（.isArray)、配列でなかった場合(!Array)、trueを返す|<br>|filter()|（）の条件がtrueのものだけを返す|<br>|map(（要素)=&gt;({処理}|各(要素)に{処理}を行い新たに配列を作成する|</p>
<p>・流れ<br>if(saved){…　保存データの有無を確認<br>↓<br>if (!Array.isArray(parsed)) {　呼び出したデータが壊れていないか確認（JSON.parseによって配列に変換できているか）<br>↓<br>todos = parsed.filter(isValidTodo).map((todo) =&gt; ({　有効なタスクを表示用に変換し、新たに配列<br>↓<br>} catch (error) {　エラーがあった場合、タスク一覧を空欄で返す</p>
<p>1-1.isValidTodo<br>function isValidTodo(todo) {<br>  return (<br>    todo &amp;&amp;　　　　　　　　　　　　　　　　　　　　　　　　　　　todoが存在し、todo.idやtodo.title、todo.createdAt、todo.updatedAtの全てが文字列である場合、trueを返す<br>    typeof todo.id === "string" &amp;&amp;<br>    typeof todo.title === "string" &amp;&amp;<br>    typeof todo.createdAt === "string" &amp;&amp;<br>    typeof todo.updatedAt === "string"<br>  );<br>}<br>・演算子<br>|条件a &amp;&amp; 条件b|条件aと条件bの両方がtrueの場合のみtrueを返す|</p>
<p>・意義<br>取得した保存データのtodoオブジェクトが存在し、各プロパティが文字列であることを確認するため（JS Lines.101などから文字列である必要あり）</p>
<p>2.bindEvents();<br>・各ユーザー操作のイベントを登録<br>function bindEvents() {</p>
<p>2-1.addBtn.addEventListener("click", addTodo);<br>・ユーザーがタスク追加ボタンをクリックした時の処理<br>addBtn.addEventListener("click", addTodo);<br>・使用メソッド<br>|〇〇.addEventListener(操作,処理）|〇〇に”操作”をした場合、”処理”を実行するイベントを登録|</p>
<p>・実行内容<br>ユーザーが`id = add-btn`を持つ”追加”ボタンを”クリック”したらaddTodoを実行する</p>
<p>HTML<br>&lt;button id="add-btn" type="button"&gt;追加&lt;/button&gt;<br>JS<br>const addBtn = document.getElementById("add-btn");</p>
<pre><code>addBtn.addEventListener("click", addTodo);</code></pre>
<p><br></p>
<p>2-1-1.addTodo<br>・ユーザーがタスク追加ボタンをクリックし、addTodoが実行された時の処理<br>function addTodo() {<br>  clearError();<br>  const title = taskTitleInput.value.trim();<br>  const description = taskDescInput.value.trim();</p>
<pre><code>  if (!title) {
    showError("タスク名を入力してください");
    taskTitleInput.focus();
    return;
  }</code></pre>
<p><br></p>
<pre><code>  const now = new Date().toISOString();
  const todo = {
    id: Date.now().toString(),
    title,
    description,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };</code></pre>
<p><br></p>
<pre><code>  todos.push(todo);
  saveTodos();
  renderTodos();</code></pre>
<p><br></p>
<pre><code>  taskTitleInput.value = "";
  taskDescInput.value = "";
  taskTitleInput.focus();
}</code></pre>
<p><br></p>
<p>・taskTitleInput / taskDescInput<br>JS<br>const taskTitleInput = document.getElementById("task-title");<br>const taskDescInput = document.getElementById("task-desc");<br>HTML<br>&lt;input id="task-title" type="text" placeholder="例: 買い物に行く" maxlength="100"&gt;<br>&lt;textarea id="task-desc" rows="3" placeholder="例: 牛乳とパンを買う"&gt;&lt;/textarea&gt;<br>・解釈<br>id="task-title”、"task-desc”を含むHTML上（タイトル入力欄とタスク詳細入力欄）の空白を削除(trim)<br>空白のみの入力でもタスクが追加されるのを防ぐ</p>
<p>・流れ<br>clearError：前回作業時にエラーメッセージが表示されていた場合に消去するため<br>↓<br>const title/description：空白のみで構成されない（trim)タイトルと詳細<br>if(!title)　showError("タスク名を入力してください”);：タイトルが空欄ならエラー表示<br>↓<br>const now/todo　タスク１件の情報（idなど）を定義<br>todos.push(todo);　タスク一覧にタスクを新しく追加<br>↓<br>saveTodos();　タスク一覧を保存<br>↓<br>renderTodos();　タスク一覧を再描画<br>↓<br>taskTitleInput.value = “”;…　各入力欄を空白に戻し、再度操作対象を入力欄へ</p>
<p>・使用メソッド<br>| `trim()` | 文字列の前後の空白を削除する |<br>| `〇〇.focus()` | 〇〇をキーボード操作の対象にする |<br>| `toISOString()` | `Date` などを ISO 8601 形式の文字列にする（保存向き） |<br>| `Date.now()` | 1970-01-01 からの経過ミリ秒（数値）を返す |<br>| `toString()` | 値を文字列に変換する（例: `Date.now()` の数値を文字列化） |<br>| `〇〇.push()` | 配列の末尾に要素を追加する |</p>
<p>2-1-1-1.clearError()<br>・前回作業時にエラーメッセージが表示されていた場合に消去する<br>function clearError() {<br>  errorMessage.textContent = "";<br>  errorMessage.classList.add("is-hidden");<br>・errorMessage <br>JS<br>const errorMessage = document.getElementById("error-message");<br>HTML<br>&lt;p id="error-message" class="error-message is-hidden" role="alert" aria-live="polite"&gt;&lt;/p&gt;<br>CSS<br>.is-hidden {<br>  display: none;<br>}<br>・解釈<br>id = error-messageを持つHTMLのテキスト内容を空白にする。classListに”is-hidden”を加えることでCSSでの定義により、画面に非表示となる。</p>
<p>2-1-1-2.showError<br>・エラーメッセージの表示方法を定義<br>　classListのis-hiddenを取り除き、表示<br>function showError(message) {<br>  errorMessage.textContent = message;<br>  errorMessage.classList.remove("is-hidden");<br>}</p>
<p>2-1-1-3.saveTodos<br>・タスク一覧を保存する<br>function saveTodos() {<br>  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));<br>}<br>・使用メソッド<br>|localStorage.setItem(キー名,値）|ローカルストレージにキー名で定義された値を保存する|<br>|JSON.stringify()|（）をJSON文字列に変換|</p>
<p>・解釈<br>タスク一覧(todos)をJSON文字列に変化し、ローカルストレージにSTORAGE_KEYとして保存</p>
<p>2-1-1-4.renderTodos<br>・タスク一覧を再描画する<br>function renderTodos() {<br>  const list = getProcessedTodos();<br>  todoList.innerHTML = "";</p>
<pre><code>  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "表示するタスクがありません。";
    todoList.appendChild(empty);
    return;
  }</code></pre>
<p><br></p>
<pre><code>  const fragment = document.createDocumentFragment();
  list.forEach((todo) =&gt; {
    fragment.appendChild(createTodoElement(todo));
  });
  todoList.appendChild(fragment);
}</code></pre>
<p>JS<br>const todoList = document.getElementById("todo-list");<br>HTML<br>&lt;section id="todo-list" class="todo-list" aria-label="タスク一覧"&gt;&lt;/section&gt;</p>
<p>・流れ<br>getProcessedTodos()で加工されたタスク一覧を取得<br>↓<br>現在のHTML上のタスク一覧をinnerHTMLで空白として再描画<br>↓<br>取得したタスクが一つもない時、id = todo-listに"表示するタスクがありません。”を表示<br>const empty = document.createElement(“p”);でHTML要素を作成→   todoList.appendChild(empty);でtodo-listに追加<br>↓<br>タスクをまとめてtodo-listに追加<br>createDocumentFragment();で作成したfragmentにcreateTodoElement(todo)で作成したタスクを追加→フラグメントをタスク一覧に追加</p>
<p>・使用メソッド<br>| `document.createElement()` | 新しく要素を作る |<br>| `〇〇.appendChild()` | 親要素の子として（）ノードを追加する |<br>| `document.createDocumentFragment()` | 複数要素を一時的に入れる「箱」を作る |</p>
<p>・プロパティ<br>|〇〇.innerHTML=a|〇〇の子要素をaに書き換える|</p>
<p>2-1-1-4-1.getProcessedTodos()<br>・フィルターやソートをした時の処理を定義<br>function getProcessedTodos() {<br>  let filtered = [...todos];</p>
<pre><code>  if (currentFilter === "active") {
    filtered = filtered.filter((todo) =&gt; !todo.completed);
  } else if (currentFilter === "completed") {
    filtered = filtered.filter((todo) =&gt; todo.completed);
  }</code></pre>
<p><br></p>
<pre><code>  //
  filtered.sort((a, b) =&gt; {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return currentSort === "newest" ? bTime - aTime : aTime - bTime;
  });</code></pre>
<p><br></p>
<pre><code>  return filtered;</code></pre>
<p><br></p>
<p>・使用メソッド<br>| `sort(比較関数)` | 配列を（）のルールに従って並べ替える（通常は `a`, `b` を比較） |<br>| `Date.（prototype）.getTime()` | 日付をミリ秒の数値にし、比較しやすくする |<br>| `filter(条件)` | 条件に合う要素だけを集めた新しい配列を返す |</p>
<p>・流れ<br>loadTodosで取得したtodosをコピー<br>↓<br>フィルターごとの処理を定義<br>currentFilter === "active”（フィルターが未完了）の時→コピーしたtodosの内、todo.completed（function addTodo/ const todoで定義)がfalseのtodoを取得しfilteredに再定義<br>currentFilter === "completed”（フィルターが完了）の時→コピーしたtodosの内、todo.completedがtrueのtodoを取得しfilteredに再定義<br>↓<br>ソートの処理を定義<br>new Date(a.createdAt).getTime();→aのcreatedAt（作成日時：function addTodo/ const todoで定義)のオブジェクトを数値で返す（getTime()）<br>currentSort === "newest" ? bTime - aTime : aTime - bTime;→現在のソートが新しい順であればcurrentSortはnewestであり、trueが選ばれbTime - aTime（1970年からのミリ秒が大きい方が新しい）<br>↓<br>実行したfilteredを返す</p>
<p>2-1-1-4-2.createTodoElement()<br>・フラグメントに入れる要素を作成<br>function createTodoElement(todo) {<br>  const card = document.createElement("div");<br>  card.className = `task-card${todo.completed ? " is-completed" : ""}${editingTodoId === todo.id ? " is-editing" : ""}`;<br>  card.dataset.id = todo.id;</p>
<pre><code>  if (editingTodoId === todo.id) {
    card.innerHTML = `
      &lt;input class="task-checkbox" type="checkbox" ${todo.completed ? "checked" : ""}&gt;
      &lt;div class="task-content"&gt;
        &lt;input class="edit-title-input" type="text" value="${escapeHtml(todo.title)}" maxlength="100"&gt;
        &lt;textarea class="edit-desc-input" rows="3"&gt;${escapeHtml(todo.description || "")}&lt;/textarea&gt;
        &lt;p class="task-date"&gt;作成日: ${formatDate(todo.createdAt)}&lt;/p&gt;
      &lt;/div&gt;
      &lt;div class="task-actions"&gt;
        &lt;button class="save-btn" type="button"&gt;保存&lt;/button&gt;
        &lt;button class="cancel-btn" type="button"&gt;キャンセル&lt;/button&gt;
      &lt;/div&gt;
    `;
    return card;
  }
  card.innerHTML = `
    &lt;input class="task-checkbox" type="checkbox" ${todo.completed ? "checked" : ""}&gt;
    &lt;div class="task-content"&gt;
      &lt;p class="task-title"&gt;${escapeHtml(todo.title)}&lt;/p&gt;
      &lt;p class="task-desc"&gt;${escapeHtml(todo.description || "")}&lt;/p&gt;
      &lt;p class="task-date"&gt;作成日: ${formatDate(todo.createdAt)}&lt;/p&gt;
    &lt;/div&gt;
    &lt;div class="task-actions"&gt;
      &lt;button class="edit-btn" type="button"&gt;編集&lt;/button&gt;
      &lt;button class="delete-btn" type="button"&gt;削除&lt;/button&gt;
    &lt;/div&gt;
  `;</code></pre>
<p><br></p>
<pre><code>  return card;
}</code></pre>
<p><br></p>
<p>・流れ<br>新たにHTML要素を作成（div class = task-card ~、完了・編集中次第で〜に追加）<br>↓<br>editingTodoId === todo.id（編集中のタスク）<br>Cardの子要素を作成（チェックボックスの定義、タイトルはユーザー入力のtodo.title（escapehtmlでHTML上での危険なコード入力を防ぐ）、作成日は(todo.createdAt）<br>↓<br>編集中でないタスクも同様の構成でHTMLを作成</p>
<p>2-1-1-4-2-1.formatDate<br>・(todo.createdAt)のISO文字列を日本表示形式に<br>function formatDate(dateString) {<br>  const date = new Date(dateString);<br>  if (Number.isNaN(date.getTime())) {<br>    return "-";<br>  }<br>  return date.toLocaleString("ja-JP", {<br>    year: "numeric",<br>    month: "2-digit",<br>    day: "2-digit",<br>    hour: "2-digit",<br>    minute: "2-digit",<br>  });<br>}<br>・流れ<br>New Dateで引数（今回はtodo.createdAt）を日付けオブジェクトに変換<br>↓<br>getTime()でミリ秒の数値に変換し、Number.isNaNで数値として無効か判断（new Date()で変換したオブジェクトが日付としては有効か不明な為）<br>↓<br>new Dateで変換した日付けオブジェクトをtoLocaleString("ja-JP", {})で日本表示形式に変換<br>year: "numeric”→年は”数字”で表示<br>その他は"2-digit”（2桁）で表示<br>例）<br>const now(function addTodo) = new Date().ISOstring()→2026-04-17T08:30:45.123Z<br>const date(function formatDate) = new Date()→上記の日付オブジェクトに<br>return date.toLocaleString("ja-JP", { ・・・→2026/04/17 17:30</p>
<p>・使用メソッド<br>| `Number.isNaN()` | 値が `NaN` かどうかを判定する |<br>| `toLocaleString()` | 地域に合った日時などの表記文字列にする |</p>
<p>2-1-1-4-2-2.escapehtml<br>・HTML上でユーザーが入力した文字が処理されないように<br>function escapeHtml(value) {<br>  return String(value)<br>    .replaceAll("&amp;", "&amp;amp;")<br>    .replaceAll("&lt;", "&amp;lt;")<br>    .replaceAll("&gt;", "&amp;gt;")<br>    .replaceAll('"', "&amp;quot;")<br>    .replaceAll("'", "&amp;#39;");<br>}<br>・解釈<br>因数を文字列に変換し、更に.replaceAll(a,b)によってaをbに置き換えることで、ユーザーが”&amp;”や”&lt;“”&gt;”を入力してもHTML上で処理が実行されないようにする</p>
<p>・使用メソッド<br>| `replaceAll(a, b)` | 文字列内の `a` をすべて `b` に置き換える |</p>
<p>2-2.taskTitleInput.addEventListener("keydown", <br>・タスクタイトルの入力欄でのイベントを登録<br>taskTitleInput.addEventListener("keydown", (event) =&gt; {<br>    if (event.key === "Enter") {<br>      event.preventDefault();<br>      addTodo();<br>    }<br>});<br>・解釈<br>Tasktitleinput(document.getElementById("task-title”);)にキーを押した時、<br>「Enterキーを押したらデフォルト処理を防ぎ、addTodoを実行する」というイベントを登録</p>
<p>・使用メソッド<br>| `preventDefault()` | ブラウザの既定の動作を防ぐ（例: Enter でフォーム送信されるのを止める） |</p>
<p>2-3.filterButtons.forEach((button) =&gt; {<br>・フィルターボタンに機能を設定<br>  filterButtons.forEach((button) =&gt; {<br>    button.addEventListener("click", () =&gt; {<br>      setFilter(button.dataset.filter);<br>    });<br>  });<br>・filterbuttons<br>JS<br>const filterButtons = document.querySelectorAll(".filter-btn");<br>HTML<br>&lt;button class="filter-btn is-active" type="button" data-filter="all"&gt;すべて&lt;/button&gt;<br>&lt;button class="filter-btn" type="button" data-filter="active"&gt;未完了&lt;/button&gt;<br>&lt;button class="filter-btn" type="button" data-filter="completed"&gt;完了&lt;/button&gt;<br>・解釈<br>filterButtonsのbuttonそれぞれにclickしたらsetFilter(button.dataset.filter);→（HTMLのbutton data-filter）を実行する</p>
<p>・使用メソッド<br>（再）|querySelectorAll(“セレクタ”);|HTMLからセレクタと一致する要素を全て返す|<br>　　 | `配列.forEach(要素) | 配列の各要素に対して処理を行う |</p>
<p>2-3-1.setfilter<br>function setFilter(filterType) {<br>  currentFilter = filterType;<br>  filterButtons.forEach((button) =&gt; {<br>    button.classList.toggle("is-active", button.dataset.filter === filterType);<br>  });<br>  renderTodos();<br>}<br>・使用メソッド<br>|〇〇.toggle(クラス名,条件）|条件がtrueの時にクラス名を〇〇につける、falseの時に外す|</p>
<p>・解釈<br>filterbuttonsのそれぞれのbuttonに対して、 今クリックされたbutton.dataset.filterのbutton.classにis-activeをつける<br>filterButtons.forEach((button) =&gt; {<br>    button.addEventListener("click", () =&gt; {<br>      setFilter(button.dataset.filter);<br>    });<br>  });</p>
<p>2-4. sortSelect.addEventListener("change", (event) =&gt; {<br>・並び替えボタンに機能を設定<br> sortSelect.addEventListener("change", (event) =&gt; {<br>    setSort(event.target.value);<br>  });<br>・解釈<br>sortSelect（HTMLのid = sortSelect)を変更したら、setSort()を実行する</p>
<p>・sortSelect<br>JS<br>const sortSelect = document.getElementById("sort-select");<br>HTML<br>&lt;select id="sort-select"&gt;<br>            &lt;option value="newest"&gt;新しい順&lt;/option&gt;<br>            &lt;option value="oldest"&gt;古い順&lt;/option&gt;<br>&lt;/select&gt;</p>
<p>2-4-2.setSort<br>function setSort(sortType) {<br>  currentSort = sortType;<br>  renderTodos();<br>}<br>・解釈<br>setSort(event.target.value)の場合、event（変更）が操作された値をcurrentSort = に設定し、renderTodosで再描画する<br>function renderTodos() {<br>  const list = getProcessedTodos();//<br>  todoList.innerHTML = "";</p>
<pre><code>  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "表示するタスクがありません。";
    todoList.appendChild(empty);
    return;
  }</code></pre>
<p><br></p>
<pre><code>  const fragment = document.createDocumentFragment();//タスク一覧を表示するためのフラグメントを作成
  list.forEach((todo) =&gt; {
    fragment.appendChild(createTodoElement(todo));
  });
  todoList.appendChild(fragment);
}</code></pre>
<p><br></p>
<pre><code>function getProcessedTodos() {
  let filtered = [...todos];</code></pre>
<p><br></p>
<pre><code>  if (currentFilter === "active") {//アクティブなタスクを表示する時の処理
    filtered = filtered.filter((todo) =&gt; !todo.completed);
  } else if (currentFilter === "completed") {//完了したタスクを表示する時の処理
    filtered = filtered.filter((todo) =&gt; todo.completed);
  }</code></pre>
<p><br></p>
<pre><code>  //
  filtered.sort((a, b) =&gt; {//作成日時で並び替える時の処理
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return currentSort === "newest" ? bTime - aTime : aTime - bTime;
  });</code></pre>
<p><br></p>
<pre><code>  return filtered;
}</code></pre>
<p><br></p>
<p>2-5.todoList.addEventListener("click", (event) =&gt; {<br>・タスク一覧での機能を設定<br>todoList.addEventListener("click", (event) =&gt; {<br>    const actionButton = event.target.closest("button");<br>    const card = actionButton.closest(".task-card");<br>    const { id } = card.dataset;</p>
<pre><code>    if (actionButton.classList.contains("edit-btn")) {
      startEdit(id);
      return;
    }</code></pre>
<p><br></p>
<pre><code>    if (actionButton.classList.contains("save-btn")) {
      saveEdit(id);
      return;
    }</code></pre>
<p><br></p>
<pre><code>    if (actionButton.classList.contains("cancel-btn")) {
      cancelEdit();
      return;
    }</code></pre>
<p><br></p>
<pre><code>    if (actionButton.classList.contains("delete-btn")) {
      deleteTodo(id);
    }
  });</code></pre>
<p><br></p>
<p>・todoList<br>JS<br>const todoList = document.getElementById("todo-list");<br>HTML<br>&lt;section id="todo-list" class="todo-list" aria-label="タスク一覧"&gt;&lt;/section&gt;</p>
<p>・const actionButton = event.target.closest("button");<br>クリックした要素に最も近い”button”</p>
<p>・const card = actionButton.closest(".task-card");<br>    const { id } = card.dataset;<br>クリックした要素に最も近い”button”に最も近い".task-card"</p>
<pre><code>function createTodoElement(todo) {
const card = document.createElement("div");
card.className = `task-card${todo.completed ? " is-completed" : ""}${editingTodoId === todo.id ? " is-editing" : ""}`;
card.dataset.id = todo.id;</code></pre>
<p>〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜<br>if (editingTodoId === todo.id) {<br>    card.innerHTML = `</p>
<p>&lt;div class="task-actions"&gt;<br>        &lt;button class="save-btn" type="button"&gt;保存&lt;/button&gt;<br>        &lt;button class="cancel-btn" type="button"&gt;キャンセル&lt;/button&gt;<br>&lt;/div&gt;</p>
<pre><code>card.innerHTML = `</code></pre>
<p>&lt;div class="task-actions"&gt;<br>      &lt;button class="edit-btn" type="button"&gt;編集&lt;/button&gt;<br>      &lt;button class="delete-btn" type="button"&gt;削除&lt;/button&gt;<br>    &lt;/div&gt;</p>
<p>・解釈<br>HTML<br>&lt;section id="todo-list" class="todo-list" aria-label="タスク一覧"&gt;&lt;/section&gt;<br>に編集ボタン（actionButton.classList.contains("edit-btn”)）を押したらstartEdit(id)、保存ボタン（actionButton.classList.contains(“save-btn”)）を押したらsaveEdit(id)、キャンセルボタン（actionButton.classList.contains(“cansel-btn”)）を押したらcanselEdit(id)、削除ボタン（actionButton.classList.contains(“delete-btn”)）を押したらdeleteTodo(id)を実行するイベントを登録</p>
<p>2-5-1.startEdit<br>・タスクを編集状態にする<br>function startEdit(id) {<br>  editingTodoId = id;<br>  clearError();<br>  renderTodos();<br>}<br>・流れ<br>clearError(2-1-1-1)<br>renderTodos(2-1-1-4)</p>
<p>2-5-2.saveEdit<br>・タスクカードに入力した内容を保存する<br>function saveEdit(id) {<br>  clearError();<br>  const card = todoList.querySelector(`.task-card[data-id="${CSS.escape(id)}"]`);<br>  if (!card) {<br>    return;<br>  }</p>
<pre><code>  const titleInput = card.querySelector(".edit-title-input");
  const descInput = card.querySelector(".edit-desc-input");
  const title = titleInput.value.trim();
  const description = descInput.value.trim();</code></pre>
<p><br></p>
<pre><code>  if (!title) {
    showError("タスク名を入力してください");
    titleInput.classList.add("error");
    titleInput.focus();
    return;
  }</code></pre>
<p><br></p>
<pre><code>  const target = todos.find((todo) =&gt; todo.id === id);
  if (!target) {
    return;
  }</code></pre>
<p><br></p>
<pre><code>  target.title = title;
  target.description = description;
  target.updatedAt = new Date().toISOString();</code></pre>
<p><br></p>
<pre><code>  editingTodoId = null;
  saveTodos();
  renderTodos();
}</code></pre>
<p>・流れ<br>clearError(2-1-1-1)<br>↓<br>function createTodoElement(todo) のif (editingTodoId === todo.id) {の条件下で<br>Input class = .edit-title-inputが空欄の場合、showError(2-1-1-2)→input class = .edit-title-input error（add("error")）→ユーザーの操作対象を入力欄へ（focus()）<br>↓<br>find()でタスク一覧に編集中のタスクのidと同じものがあるかを確認し、無ければ空欄で返す<br>↓<br>一致したものがあれば、タイトルなどの内容を新たに再定義<br>↓<br>編集中の状態を終了<br>↓<br>saveTodos(2-1-1-3)<br>↓<br>renderTodos(2-1-1-4)</p>
<p>・使用メソッド<br>| `CSS.escape()` | 文字列をセレクタに埋め込んでも安全になるようエスケープする |<br>| `classList.add()` | 要素にクラスを追加する |</p>
<p>2-5-3.canselEdit<br>・編集をキャンセル<br>function cancelEdit() {<br>  editingTodoId = null;<br>  clearError();<br>  renderTodos();<br>}<br>・流れ<br>編集中の状態を終了<br>↓<br>saveTodos(2-1-1-3)<br>↓<br>renderTodos(2-1-1-4)</p>
<p>2-5-4.deleteTodo<br>・タスクを削除<br>function deleteTodo(id) {<br>  const ok = window.confirm("このタスクを削除しますか？");<br>  if (!ok) {<br>    return;<br>  }</p>
<pre><code>  todos = todos.filter((todo) =&gt; todo.id !== id);
  if (editingTodoId === id) {
    editingTodoId = null;
  }
  saveTodos();
  renderTodos();
}</code></pre>
<p><br></p>
<p>・流れ<br>確認画面を表示（window.confirm("このタスクを削除しますか？");）<br>↓<br>キャンセルをユーザーが選んだ場合、処理を中止(if(!ok))<br>↓<br>選択中のidと異なるidだけを残し、タスク一覧を再配列する→選択したタスクを削除<br>編集中のタスクを削除した場合、nullへ変更<br>↓<br>saveTodos(2-1-1-3)<br>↓<br>renderTodos(2-1-1-4)</p>
<p>2-6. todoList.addEventListener("change", (event) =&gt; {<br>・タスク一覧にチェックボックスの設定を行う<br>  todoList.addEventListener("change", (event) =&gt; {<br>    if (event.target.classList.contains("task-checkbox")) {<br>      const card = event.target.closest(".task-card");<br>      const { id } = card.dataset;<br>      toggleTodo(id);<br>    }<br>  });<br>・"task-checkbox"<br> &lt;input class="task-checkbox" type="checkbox" ${todo.completed ? "checked" : ""}&gt;<br>・流れ<br>HTML上の"task-checkbox”を含むclassで操作を行った場合、最も近い".task-card”classのidを取得<br>↓<br>そのidにおいてtoggletodoを実行</p>
<p>2-6-1.toggletodo<br>function toggleTodo(id) {<br>  const target = todos.find((todo) =&gt; todo.id === id);<br>  if (!target) {<br>  }<br>  target.completed = !target.completed;<br>  target.updatedAt = new Date().toISOString();<br>  saveTodos();//タスク一覧を保存する<br>  renderTodos();<br>・流れ<br>引数のidと一致するtodo.idをタスク一覧から探す<br>見つからなければ、空欄で返す<br>↓<br>上記で見つけたtodo.completedの真偽値を反転（true←→false)<br>↓<br>app.todoと同様にtodo.updateAtを取得<br>↓<br>renderTodos(2-1-1-4)</p>
