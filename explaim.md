アプリ起動
↓
HTML読み込み
↓
JS読み込み

#HTMLの要素をJSで使用するためのHTML要素の読み込みと紐付け
```
const taskTitleInput = document.getElementById("task-title”);→`document`（HTML文書全体）`.getElementById("task-title”)`（〜の中からid属性がtask-titleの要素を返す）
const filterButtons = document.querySelectorAll(".filter-btn");　.etc
```

・使用メソッド
|getElementById(“id”);|HTMLから()を含むid要素を返す。|
| --- | --- |

上記であれば、
```
<input id="task-title" type="text" placeholder="例: 買い物に行く" maxlength="100">
```
|querySelectorAll(“セレクタ”);|HTMLからセレクタと一致する要素を全て返す。（）内が.始まり→class要素。|
| --- | --- |

上記であれば、 
```
<button class="filter-btn is-active" type="button" data-filter="all">すべて</button>
<button class="filter-btn" type="button" data-filter="active">未完了</button>
<button class="filter-btn" type="button" data-filter="completed">完了</button>
```

↓
#初期処理
- init()
```
function init() {
  loadTodos();−1
  bindEvents();
  renderTodos();
```

## 1.loadTodos()
- タスク一覧を保存データから取得する
```
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);　　　　　　　　　　ローカルストレージからキー名（STORAGE_KEY）のデータを文字列で取得→savedと定義
    if (!saved) {　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　 savedがない（保存データがない）場合、タスク一覧を空欄で返す
      todos = [];
      return;
    }
```

```
    const parsed = JSON.parse(saved);　　　　　　　　　　　　　　　　　　　　savedで定義された保存データをJSON形式の配列、オブジェクトに変換
    if (!Array.isArray(parsed)) {　　　　　　　　　　　　　　　　　　　　　　 上記で取得したデータが配列でない場合、タスク一覧を空欄で返す
      todos = [];
      return;
    }
```

```
    todos = parsed.filter(isValidTodo).map((todo) => ({　　　　　　　　（isValidTodo)の条件下でtrueを返したもののtitle（タイトル）、description（詳細部分）を文字列にtodo.completedをtrue/falseに変換し新配列を作成
      ...todo,
      title: String(todo.title),
      description: String(todo.description || ""),
      completed: Boolean(todo.completed),
    }));
  } catch (error) {　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　上記でエラーが発生した場合、タスク一覧を空欄で返す
    todos = [];
  }
```
}
- 使用メソッド
|try{}catch(error){}|エラー発生の可能性が高い処理において、安全に処理を行うための構文。try{}にエラー発生の可能性がある処理、catch(error){}にエラー時の処理を記入。|
| --- | --- |

|`getItem(キー名)`|キー名の保存データを文字列のまま取得する|
| --- | --- |

|`JSON.parse()`|文字列データを JSON 形式の配列やオブジェクトに変換する|
| --- | --- |

|`!Array.isArray()`|値が配列かどうかを確認し、配列でない場合に `true` を返す|
| --- | --- |

|`filter()`|条件が `true` の要素だけを返す|
| --- | --- |

|`map((要素) => ({ 処理 }))`|各要素に処理を行い、新しい配列を作成する|
| --- | --- |

- 流れ
if(saved){…　保存データの有無を確認
↓
```
if (!Array.isArray(parsed)) {　呼び出したデータが壊れていないか確認（JSON.parseによって配列に変換できているか）
↓
todos = parsed.filter(isValidTodo).map((todo) => ({　有効なタスクを表示用に変換し、新たに配列
↓
} catch (error) {　エラーがあった場合、タスク一覧を空欄で返す
```

## 1-1.isValidTodo
```
function isValidTodo(todo) {
  return (
    todo &&　　　　　　　　　　　　　　　　　　　　　　　　　　　todoが存在し、todo.idやtodo.title、todo.createdAt、todo.updatedAtの全てが文字列である場合、trueを返す
    typeof todo.id === "string" &&
    typeof todo.title === "string" &&
    typeof todo.createdAt === "string" &&
    typeof todo.updatedAt === "string"
  );
```
}
- 演算子
|条件a && 条件b|条件aと条件bの両方がtrueの場合のみtrueを返す|
| --- | --- |

- 意義
取得した保存データのtodoオブジェクトが存在し、各プロパティが文字列であることを確認するため（JS Lines.101などから文字列である必要あり）



## 2.bindEvents();
- 各ユーザー操作のイベントを登録
```
function bindEvents() {
```


## 2-1.addBtn.addEventListener("click", addTodo);
- ユーザーがタスク追加ボタンをクリックした時の処理
```
addBtn.addEventListener("click", addTodo);
- 使用メソッド
|〇〇.addEventListener(操作,処理）|〇〇に”操作”をした場合、”処理”を実行するイベントを登録|
| --- | --- |
```

- 実行内容
ユーザーが`id = add-btn`を持つ”追加”ボタンを”クリック”したらaddTodoを実行する

### HTML
```
<button id="add-btn" type="button">追加</button>
### JS
const addBtn = document.getElementById("add-btn");
```

```
addBtn.addEventListener("click", addTodo);
```

## 2-1-1.addTodo
- ユーザーがタスク追加ボタンをクリックし、addTodoが実行された時の処理
```
function addTodo() {
  clearError();
  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
```

```
  if (!title) {
    showError("タスク名を入力してください");
    taskTitleInput.focus();
    return;
  }
```

```
  const now = new Date().toISOString();
  const todo = {
    id: Date.now().toString(),
    title,
    description,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
```

```
  todos.push(todo);
  saveTodos();
  renderTodos();
```

```
  taskTitleInput.value = "";
  taskDescInput.value = "";
  taskTitleInput.focus();
```
}

- taskTitleInput / taskDescInput
### JS
```
const taskTitleInput = document.getElementById("task-title");
const taskDescInput = document.getElementById("task-desc");
### HTML
<input id="task-title" type="text" placeholder="例: 買い物に行く" maxlength="100">
<textarea id="task-desc" rows="3" placeholder="例: 牛乳とパンを買う"></textarea>
- 解釈
```
id="task-title”、"task-desc”を含むHTML上（タイトル入力欄とタスク詳細入力欄）の空白を削除(trim)
空白のみの入力でもタスクが追加されるのを防ぐ

- 流れ
clearError：前回作業時にエラーメッセージが表示されていた場合に消去するため
↓
```
const title/description：空白のみで構成されない（trim)タイトルと詳細
if(!title)　showError("タスク名を入力してください”);：タイトルが空欄ならエラー表示
↓
const now/todo　タスク１件の情報（idなど）を定義
todos.push(todo);　タスク一覧にタスクを新しく追加
↓
```
saveTodos();　タスク一覧を保存
↓
renderTodos();　タスク一覧を再描画
↓
```
taskTitleInput.value = “”;…　各入力欄を空白に戻し、再度操作対象を入力欄へ
```

- 使用メソッド
| `trim()` | 文字列の前後の空白を削除する |
| --- | --- |
| `〇〇.focus()` | 〇〇をキーボード操作の対象にする |
| `toISOString()` | `Date` などを ISO 8601 形式の文字列にする（保存向き） |
| `Date.now()` | 1970-01-01 からの経過ミリ秒（数値）を返す |
| `toString()` | 値を文字列に変換する（例: `Date.now()` の数値を文字列化） |
| `〇〇.push()` | 配列の末尾に要素を追加する |

## 2-1-1-1.clearError()
- 前回作業時にエラーメッセージが表示されていた場合に消去する
```
function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("is-hidden");
- errorMessage 
### JS
const errorMessage = document.getElementById("error-message");
### HTML
<p id="error-message" class="error-message is-hidden" role="alert" aria-live="polite"></p>
### CSS
.is-hidden {
  display: none;
```
}
- 解釈
id = error-messageを持つHTMLのテキスト内容を空白にする。classListに”is-hidden”を加えることでCSSでの定義により、画面に非表示となる。


## 2-1-1-2.showError
- エラーメッセージの表示方法を定義
　classListのis-hiddenを取り除き、表示
```
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("is-hidden");
```
}

## 2-1-1-3.saveTodos
- タスク一覧を保存する
```
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
```
}
- 使用メソッド
|localStorage.setItem(キー名,値）|ローカルストレージにキー名で定義された値を保存する|
| --- | --- |
|JSON.stringify()|（）をJSON文字列に変換|

- 解釈
タスク一覧(todos)をJSON文字列に変化し、ローカルストレージにSTORAGE_KEYとして保存

## 2-1-1-4.renderTodos
- タスク一覧を再描画する
```
function renderTodos() {
  const list = getProcessedTodos();
  todoList.innerHTML = "";
```

```
  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "表示するタスクがありません。";
    todoList.appendChild(empty);
    return;
  }
```

```
  const fragment = document.createDocumentFragment();
  list.forEach((todo) => {
    fragment.appendChild(createTodoElement(todo));
  });
  todoList.appendChild(fragment);
```
}
### JS
```
const todoList = document.getElementById("todo-list");
### HTML
<section id="todo-list" class="todo-list" aria-label="タスク一覧"></section>
```

- 流れ
getProcessedTodos()で加工されたタスク一覧を取得
↓
現在のHTML上のタスク一覧をinnerHTMLで空白として再描画
↓
取得したタスクが一つもない時、id = todo-listに"表示するタスクがありません。”を表示
```
const empty = document.createElement(“p”);でHTML要素を作成→   todoList.appendChild(empty);でtodo-listに追加
↓
```
タスクをまとめてtodo-listに追加
createDocumentFragment();で作成したfragmentにcreateTodoElement(todo)で作成したタスクを追加→フラグメントをタスク一覧に追加

- 使用メソッド
| `document.createElement()` | 新しく要素を作る |
| --- | --- |
| `〇〇.appendChild()` | 親要素の子として（）ノードを追加する |
| `document.createDocumentFragment()` | 複数要素を一時的に入れる「箱」を作る |

- プロパティ
|〇〇.innerHTML=a|〇〇の子要素をaに書き換える|
| --- | --- |

## 2-1-1-4-1.getProcessedTodos()
- フィルターやソートをした時の処理を定義
```
function getProcessedTodos() {
  let filtered = [...todos];
```

```
  if (currentFilter === "active") {
    filtered = filtered.filter((todo) => !todo.completed);
  } else if (currentFilter === "completed") {
    filtered = filtered.filter((todo) => todo.completed);
  }
```

```
  //
  filtered.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return currentSort === "newest" ? bTime - aTime : aTime - bTime;
  });
```

```
  return filtered;
```

- 使用メソッド
| `sort(比較関数)` | 配列を（）のルールに従って並べ替える（通常は `a`, `b` を比較） |
| --- | --- |
| `Date.（prototype）.getTime()` | 日付をミリ秒の数値にし、比較しやすくする |
| `filter(条件)` | 条件に合う要素だけを集めた新しい配列を返す |

- 流れ
loadTodosで取得したtodosをコピー
↓
フィルターごとの処理を定義
currentFilter === "active”（フィルターが未完了）の時→コピーしたtodosの内、todo.completed（function addTodo/ const todoで定義)がfalseのtodoを取得しfilteredに再定義
currentFilter === "completed”（フィルターが完了）の時→コピーしたtodosの内、todo.completedがtrueのtodoを取得しfilteredに再定義
↓
ソートの処理を定義
```
new Date(a.createdAt).getTime();→aのcreatedAt（作成日時：function addTodo/ const todoで定義)のオブジェクトを数値で返す（getTime()）
```
currentSort === "newest" ? bTime - aTime : aTime - bTime;→現在のソートが新しい順であればcurrentSortはnewestであり、trueが選ばれbTime - aTime（1970年からのミリ秒が大きい方が新しい）
↓
実行したfilteredを返す

## 2-1-1-4-2.createTodoElement()
- フラグメントに入れる要素を作成
```
function createTodoElement(todo) {
  const card = document.createElement("div");
  card.className = `task-card${todo.completed ? " is-completed" : ""}${editingTodoId === todo.id ? " is-editing" : ""}`;
  card.dataset.id = todo.id;
```

```
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
```

```
  return card;
```
}

- 流れ
新たにHTML要素を作成（div class = task-card ~、完了・編集中次第で〜に追加）
↓
editingTodoId === todo.id（編集中のタスク）
Cardの子要素を作成（チェックボックスの定義、タイトルはユーザー入力のtodo.title（escapehtmlでHTML上での危険なコード入力を防ぐ）、作成日は(todo.createdAt）
↓
編集中でないタスクも同様の構成でHTMLを作成

## 2-1-1-4-2-1.formatDate
- (todo.createdAt)のISO文字列を日本表示形式に
```
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
```
}
- 流れ
New Dateで引数（今回はtodo.createdAt）を日付けオブジェクトに変換
↓
getTime()でミリ秒の数値に変換し、Number.isNaNで数値として無効か判断（new Date()で変換したオブジェクトが日付としては有効か不明な為）
↓
```
new Dateで変換した日付けオブジェクトをtoLocaleString("ja-JP", {})で日本表示形式に変換
```
year: "numeric”→年は”数字”で表示
その他は"2-digit”（2桁）で表示
例）
```
const now(function addTodo) = new Date().ISOstring()→2026-04-17T08:30:45.123Z
const date(function formatDate) = new Date()→上記の日付オブジェクトに
return date.toLocaleString("ja-JP", { ・・・→2026/04/17 17:30
```

- 使用メソッド
| `Number.isNaN()` | 値が `NaN` かどうかを判定する |
| --- | --- |
| `toLocaleString()` | 地域に合った日時などの表記文字列にする |


## 2-1-1-4-2-2.escapehtml
- HTML上でユーザーが入力した文字が処理されないように
```
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
```
}
- 解釈
因数を文字列に変換し、更に.replaceAll(a,b)によってaをbに置き換えることで、ユーザーが”&”や”<“”>”を入力してもHTML上で処理が実行されないようにする

- 使用メソッド
| `replaceAll(a, b)` | 文字列内の `a` をすべて `b` に置き換える |
| --- | --- |



## 2-2.taskTitleInput.addEventListener("keydown", 
- タスクタイトルの入力欄でのイベントを登録
```
taskTitleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTodo();
    }
```
});
- 解釈
Tasktitleinput(document.getElementById("task-title”);)にキーを押した時、
「Enterキーを押したらデフォルト処理を防ぎ、addTodoを実行する」というイベントを登録

- 使用メソッド
| `preventDefault()` | ブラウザの既定の動作を防ぐ（例: Enter でフォーム送信されるのを止める） |
| --- | --- |

## 2-3.filterButtons.forEach((button) => {
- フィルターボタンに機能を設定
```
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });
- filterbuttons
### JS
const filterButtons = document.querySelectorAll(".filter-btn");
### HTML
<button class="filter-btn is-active" type="button" data-filter="all">すべて</button>
<button class="filter-btn" type="button" data-filter="active">未完了</button>
<button class="filter-btn" type="button" data-filter="completed">完了</button>
- 解釈
filterButtonsのbuttonそれぞれにclickしたらsetFilter(button.dataset.filter);→（HTMLのbutton data-filter）を実行する
```

- 使用メソッド
（再）|querySelectorAll(“セレクタ”);|HTMLからセレクタと一致する要素を全て返す|
　　 | `配列.forEach(要素) | 配列の各要素に対して処理を行う |
| --- | --- |



## 2-3-1.setfilter
```
function setFilter(filterType) {
  currentFilter = filterType;
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filterType);
  });
  renderTodos();
```
}
- 使用メソッド
|〇〇.toggle(クラス名,条件）|条件がtrueの時にクラス名を〇〇につける、falseの時に外す|
| --- | --- |

- 解釈
filterbuttonsのそれぞれのbuttonに対して、 今クリックされたbutton.dataset.filterのbutton.classにis-activeをつける
```
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });
```

## 2-4. sortSelect.addEventListener("change", (event) => {
- 並び替えボタンに機能を設定
```
 sortSelect.addEventListener("change", (event) => {
    setSort(event.target.value);
  });
- 解釈
sortSelect（HTMLのid = sortSelect)を変更したら、setSort()を実行する
```

- sortSelect
### JS
```
const sortSelect = document.getElementById("sort-select");
### HTML
<select id="sort-select">
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
</select>
```

## 2-4-2.setSort
```
function setSort(sortType) {
  currentSort = sortType;
  renderTodos();
```
}
- 解釈
setSort(event.target.value)の場合、event（変更）が操作された値をcurrentSort = に設定し、renderTodosで再描画する
```
function renderTodos() {
  const list = getProcessedTodos();//
  todoList.innerHTML = "";
```

```
  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "表示するタスクがありません。";
    todoList.appendChild(empty);
    return;
  }
```

```
  const fragment = document.createDocumentFragment();//タスク一覧を表示するためのフラグメントを作成
  list.forEach((todo) => {
    fragment.appendChild(createTodoElement(todo));
  });
  todoList.appendChild(fragment);
```
}

```
function getProcessedTodos() {
  let filtered = [...todos];
```

```
  if (currentFilter === "active") {//アクティブなタスクを表示する時の処理
    filtered = filtered.filter((todo) => !todo.completed);
  } else if (currentFilter === "completed") {//完了したタスクを表示する時の処理
    filtered = filtered.filter((todo) => todo.completed);
  }
```

```
  //
  filtered.sort((a, b) => {//作成日時で並び替える時の処理
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return currentSort === "newest" ? bTime - aTime : aTime - bTime;
  });
```

```
  return filtered;
```
}

## 2-5.todoList.addEventListener("click", (event) => {
- タスク一覧での機能を設定
```
todoList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button");
    const card = actionButton.closest(".task-card");
    const { id } = card.dataset;
```

```
    if (actionButton.classList.contains("edit-btn")) {
      startEdit(id);
      return;
    }
```

```
    if (actionButton.classList.contains("save-btn")) {
      saveEdit(id);
      return;
    }
```

```
    if (actionButton.classList.contains("cancel-btn")) {
      cancelEdit();
      return;
    }
```

```
    if (actionButton.classList.contains("delete-btn")) {
      deleteTodo(id);
    }
  });
```

- todoList
### JS
```
const todoList = document.getElementById("todo-list");
### HTML
<section id="todo-list" class="todo-list" aria-label="タスク一覧"></section>
```

- const actionButton = event.target.closest("button");
クリックした要素に最も近い”button”

- const card = actionButton.closest(".task-card");
```
    const { id } = card.dataset;
```
クリックした要素に最も近い”button”に最も近い".task-card"

```
function createTodoElement(todo) {
const card = document.createElement("div");
```
card.className = `task-card${todo.completed ? " is-completed" : ""}${editingTodoId === todo.id ? " is-editing" : ""}`;
card.dataset.id = todo.id;
〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜
```
if (editingTodoId === todo.id) {
    card.innerHTML = `
```

<div class="task-actions">
```
        <button class="save-btn" type="button">保存</button>
        <button class="cancel-btn" type="button">キャンセル</button>
```
</div>

card.innerHTML = `
<div class="task-actions">
```
      <button class="edit-btn" type="button">編集</button>
      <button class="delete-btn" type="button">削除</button>
    </div>
```

- 解釈
### HTML
```
<section id="todo-list" class="todo-list" aria-label="タスク一覧"></section>
```
に編集ボタン（actionButton.classList.contains("edit-btn”)）を押したらstartEdit(id)、保存ボタン（actionButton.classList.contains(“save-btn”)）を押したらsaveEdit(id)、キャンセルボタン（actionButton.classList.contains(“cansel-btn”)）を押したらcanselEdit(id)、削除ボタン（actionButton.classList.contains(“delete-btn”)）を押したらdeleteTodo(id)を実行するイベントを登録


## 2-5-1.startEdit
- タスクを編集状態にする
```
function startEdit(id) {
  editingTodoId = id;
  clearError();
  renderTodos();
```
}
- 流れ
clearError(2-1-1-1)
renderTodos(2-1-1-4)

## 2-5-2.saveEdit
- タスクカードに入力した内容を保存する
```
function saveEdit(id) {
  clearError();
  const card = todoList.querySelector(`.task-card[data-id="${CSS.escape(id)}"]`);
  if (!card) {
    return;
  }
```

```
  const titleInput = card.querySelector(".edit-title-input");
  const descInput = card.querySelector(".edit-desc-input");
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
```

```
  if (!title) {
    showError("タスク名を入力してください");
    titleInput.classList.add("error");
    titleInput.focus();
    return;
  }
```

```
  const target = todos.find((todo) => todo.id === id);
  if (!target) {
    return;
  }
```

```
  target.title = title;
  target.description = description;
  target.updatedAt = new Date().toISOString();
```

```
  editingTodoId = null;
  saveTodos();
  renderTodos();
```
}
- 流れ
clearError(2-1-1-1)
↓
```
function createTodoElement(todo) のif (editingTodoId === todo.id) {の条件下で
```
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

- 使用メソッド
| `CSS.escape()` | 文字列をセレクタに埋め込んでも安全になるようエスケープする |
| --- | --- |
| `classList.add()` | 要素にクラスを追加する |

## 2-5-3.canselEdit
- 編集をキャンセル
```
function cancelEdit() {
  editingTodoId = null;
  clearError();
  renderTodos();
```
}
- 流れ
編集中の状態を終了
↓
saveTodos(2-1-1-3)
↓
renderTodos(2-1-1-4)

## 2-5-4.deleteTodo
- タスクを削除
```
function deleteTodo(id) {
  const ok = window.confirm("このタスクを削除しますか？");
  if (!ok) {
    return;
  }
```

```
  todos = todos.filter((todo) => todo.id !== id);
  if (editingTodoId === id) {
    editingTodoId = null;
  }
  saveTodos();
  renderTodos();
```
}

- 流れ
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

## 2-6. todoList.addEventListener("change", (event) => {
- タスク一覧にチェックボックスの設定を行う
```
  todoList.addEventListener("change", (event) => {
    if (event.target.classList.contains("task-checkbox")) {
      const card = event.target.closest(".task-card");
      const { id } = card.dataset;
      toggleTodo(id);
    }
  });
- "task-checkbox"
 <input class="task-checkbox" type="checkbox" ${todo.completed ? "checked" : ""}>
- 流れ
```
HTML上の"task-checkbox”を含むclassで操作を行った場合、最も近い".task-card”classのidを取得
↓
そのidにおいてtoggletodoを実行

## 2-6-1.toggletodo
```
function toggleTodo(id) {
  const target = todos.find((todo) => todo.id === id);
  if (!target) {
  }
  target.completed = !target.completed;
  target.updatedAt = new Date().toISOString();
  saveTodos();//タスク一覧を保存する
  renderTodos();
- 流れ
```
引数のidと一致するtodo.idをタスク一覧から探す
見つからなければ、空欄で返す
↓
上記で見つけたtodo.completedの真偽値を反転（true←→false)
↓
app.todoと同様にtodo.updateAtを取得
↓
renderTodos(2-1-1-4)
