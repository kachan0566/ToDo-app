# サーバ接続の説明
## データの流れ
```
DB（todos.sql で定義）
    ↕ SQL クエリ
db.php（バックエンド寄り API）
    ↕ 関数呼び出し
todos.php（フロント寄り API）
    ↕ fetch API
script.js（フロントエンド）
```

# todos.sql
## 役割
ToDoアプリ用データベース・テーブル作成

## コードの理解
### データベースの作成と定義
| コード | 意味 |
|---|---|
| `CREATE DATABASE IF NOT EXISTS ~` | `~` という名前のDBを作る（既にあれば何もしない） |
| `CHARACTER SET ~` | 文字コードを定義する |
| `COLLATE ~_unicode_ci` | `~` の文字コードのルールを定義する（大文字と小文字を区別しないなど） |

### テーブルの作成
| コード | 意味 |
|---|---|
| USE~ | ~のデータを操作する | 
| CREATE TABLE | テーブルを作成 |

### テーブル内の定義
#### データ型
| 型 | 内容 |
|---|---|
| `INT` | 整数（自動連番のID） |
| `VARCHAR(255)` | 最大255文字の文字列（タイトル） |
| `TEXT` | 長い文章（説明文） |
| `TINYINT()` | 小さい整数、()を最低桁数とする |
| `DATETIME` | 日時 |
#### 制約
| 制約・属性 | 説明 |
|---|---|
| `PRIMARY KEY` | 主キーにする。一意かつNOT NULLを保証 |
| `AUTO_INCREMENT` | 挿入のたびに自動で1ずつ増加 |
| `NOT NULL` | NULLを禁止。必ず値が必要（実際の空欄エラーはアプリ側が制御 |
| `DEFAULT 0` | 操作がなければ初期値を `0` とする |
| `DEFAULT CURRENT_TIMESTAMP` | 入力がなければに現日時が自動で入る |
| `ON UPDATE CURRENT_TIMESTAMP` | 更新時に自動で現日時に書き換わる |
#### オプション
| オプション・属性 | 説明 |
|---|---|
| ENGINE=~ | ストレージエンジンを~にする |
| InnoDB | データをディスクに保存するときの方式。<br>特徴<br>・トランザクションがACIDを準拠<br>・外部キーの参照を確実にする<br>・ロックが行レベル<br>・データの高速記録ができるRedo Logを使用<br>・読みと書きが同時に作業できるMVCC |


# db.php
## 役割
データベース接続とtodos.phpへの連携設定

## コードの理解
### 関数
| コード | 意味 |
|---|---|
| `define(a,b)` | aをbと定義する |
| `http_response_code(500)` | エラーコード500（サーバ側のバグを示す）を返す |
| `header` | サーバからのHTTPレスポンスヘッダー |
| `Content-Type: application/json` | データがJSON形式である |
| `echo` | 文字列を出力 |
| `json_encode` | JSON文字列に変換 |

### 用語
| 用語 | 意味 |
|---|---|
| DSN | DBへの接続情報をまとめるときに使う |
| PDO | DBへの接続方法や内容を定義 |

### オプション
| オプション | 説明 |
|---|---|
| `ERRMODE_EXCEPTION` | エラー検知時に例外(catch)を返す |
| `FETCH_MODE` | データの取得形式を定義 |
| `FETCH_ASSOC` | カラム名をキーとして取得 |
| `EMULATE_PREPARES` | プリペアドステートメント(sqlインジェクションを防ぐ為に直接値をsqlに入力せず、?などで代入する)をPHP上かsql上で使用するか定義<br>・true→PHPが模倣して処理<br>・false→MySQLがそのまま処理 |

# todos.php
## 役割
db.phpを介したデータ取得設定、JS(fetch APIとの連携)

## 流れ
1. ブラウザへのHTTPレスポンスヘッダーを定義
2. ブラウザへリクエストやレスポンスのルールを定義
3. db.phpの読み込み
4. 各メソッドの機能を定義
5. 未対応の指示にエラーを設定

---

### 1. ブラウザへのHTTPレスポンスヘッダーを定義
```php
header('Content-Type: application/json; charset=utf-8');
```

#### 用語
| コード | 意味 |
|---|---|
| `Content-Type:~` | データの形式を定義 |
| `application/json` | JSON形式に変換 |

#### 解釈
ブラウザへレスポンスするデータはJSON形式であるとレスポンスヘッダーに明示

---

### 2. ブラウザへリクエストやレスポンスのルールを定義
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
```

#### 用語
| コード | 意味 |
|---|---|
| `Access-Control-Allow` | リクエストのルールを定義 |
| `http_response_code()` | レスポンスヘッダーのステータスコードを定義 |

#### 解釈
`['REQUEST_METHOD'] === 'OPTIONS'`だった場合、ヘッダーにステータスコード204でレスポンス。その際に上３行をヘッダーに加え、リクエストアクセス元の無制限、使用可能メソッドの定義、Content-Typeの使用許可を回答。

---

### 3. db.phpの読み込み
```php
require __DIR__ . '/db.php';
```

#### 用語
| コード | 意味 |
|---|---|
| `require~` | ファイルの読み込み |
| `__DIR__` | 今このファイルのあるフォルダのパスを表す |

#### 解釈
このフォルダ(/Users/kimurakatsuya/Cursor/ToDo-app-1/api)に`/db.php`を繋げ、`/Users/kimurakatsuya/Cursor/ToDo-app-1/api/db.php` を読み込む

### 4. 各メソッドの機能を定義

---

#### 共通定義

```php
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
```

##### 関数・用語

| 関数・記法 | 意味 |
|---|---|
| `isset()` | `()` の変数が存在し、null でない場合に `true` を返す |
| `(int)` | 値を整数に変換して返す |
| `条件 ? a : b` | 条件が `true` なら `a`、`false` なら `b` を返す |
| `json_decode()` | `()` の JSON をPHPで使える形に変換する |
| `php://input` | JSから送られてきたデータを受け取る場所 |

---

#### GET：タスク一覧を取得

```php
if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM todos ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll());
    exit;
}
```
##### JS
```
async function loadTodos() {
  try {
    const res = await fetch(API_URL);//指定がない為、自動でGETリクエスト
    if (!res.ok) throw new Error();
    const data = await res.json();
```

##### 解釈

サーバーへのリクエストが `GET` だった場合、`db.php` から取得した `$pdo`（データベースへの接続）を使って以下のSQL を実行します。

```sql
SELECT * FROM todos ORDER BY created_at DESC
-- todosテーブルの全レコードを、作成日時の新しい順に取得する
```

取得したデータを `echo json_encode(...)` でJS用のJSON形式に変換して出力します。

##### 用語

| 関数・記法 | 意味 |
|---|---|
| `echo json_encode(...)` | PHPのデータをJS用のJSON形式に変換して出力する |
| `$stmt->fetchAll()` | SQLの実行結果を全件まとめて配列として取得する |

#### POST:タスクを新規作成

**PHPコード**

```php
if ($method === 'POST') {
    $title       = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');

    if ($title === '') {
        http_response_code(422);
        echo json_encode(['error' => 'タイトルは必須です']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    $stmt->execute([$title, $description]);

    $newId = (int)$pdo->lastInsertId();
    $row   = $pdo->query("SELECT * FROM todos WHERE id = $newId")->fetch();

    http_response_code(201);
    echo json_encode($row);
    exit;
}
```

**JSコード**

```js
try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
```

##### 解釈

1. `$method === 'POST'` のとき処理を開始する
2. `json_decode(file_get_contents('php://input'), true)` でJSから送られてきたJSON形式のデータをPHP配列に変換する
3. タイトルが空欄の場合、ステータスコード `422` を返してエラーメッセージを表示する
4. `prepare` + `execute` でデータベースに新しいタスクを登録する（`?` の部分に順番に値が入る）
5. `lastInsertId()` で今追加した行のIDを取得し、その行を `SELECT` で読み込む
6. ステータスコード `201` を返し、追加した行のデータをJSON形式に変換して出力する

##### 用語

| 関数・記法 | 意味 |
|---|---|
| `prepare(SQL)` | `?` を使ったSQL文の雛形を作る。SQLインジェクション対策になる |
| `execute([...])` | `?` の部分に配列の値を左から順番に代入して、SQLを実行する |
| `query(SQL)` | SQLをそのまま実行する |
| `lastInsertId()` | 直前に `INSERT` した行のIDを取得する |

#### PUT:タスクを更新

**PHPコード**

```php
if ($method === 'PUT') {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'idが指定されていません']);
        exit;
    }

    $title       = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $completed   = isset($input['completed']) ? (int)(bool)$input['completed'] : 0;

    if ($title === '') {
        http_response_code(422);
        echo json_encode(['error' => 'タイトルは必須です']);
        exit;
    }

    $stmt = $pdo->prepare(
        'UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?'
    );
    $stmt->execute([$title, $description, $completed, $id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'タスクが見つかりません']);
        exit;
    }

    $row = $pdo->query("SELECT * FROM todos WHERE id = $id")->fetch();
    echo json_encode($row);
    exit;
}
```

**JSコード**

```js
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
```

##### 解釈

1. メソッドがPUTの場合
2. idが存在しなければ、コード400とエラーメッセージを返す
3. $title,$descriptionはinput//phpで受け取ったデータを取得し空白を受け付けない
4. input:phpのcompletedの存在を確認、存在すれば1、無ければ0を返す
5. titleが存在しなければ、コード422とエラーメッセージを返す
6. excute()の内容でtodosをUPDATE
7. 列が0、つまりタスクが無ければ、コード404とエラーメッセージを返す
8. 指定のid行をtodosから取り出し、読み込みJSON形式で出力

##### 用語

| 記法・関数 | 意味 |
|---|---|
| `(bool)～` | ～が真であればtrueを返す。尚ここでは(int)でtrueを整数１に変換している |
| `UPDATE～SET` | ～を新たに入力し、～を更新する |
| `rowCount()` | 列の数 |
| `SELECT～` | ～を取り出す |



#### DELETE:タスクを削除

**PHPコード**

```php
if ($method === 'DELETE') {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'idが指定されていません']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM todos WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'タスクが見つかりません']);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}
```

**JSコード**

```js
async function deleteTodo(id) {
  const ok = window.confirm("このタスクを削除しますか？");
  if (!ok) return;

  try {
    const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();
    await loadTodos();
  } catch {
    showError("タスクの削除に失敗しました");
  }
}
```

##### 解釈

1. メソッドが `DELETE` の場合
2. `id` が存在しなければ、コード `400` とエラーメッセージを返す
3. `prepare` + `execute` で指定した `id` のタスクをデータベースから削除する
4. `rowCount()` が `0`、つまり削除できた行が存在しなければ、コード `404` とエラーメッセージを返す
5. 削除に成功した場合、`{'success': true}` をJSON形式で返す

##### 用語

| 記法・関数 | 意味 |
|---|---|
| `DELETE FROM ～ WHERE id = ?` | 指定した `id` の行をテーブルから削除する |
| `rowCount()` | 直前のSQL操作で影響を受けた行の数を返す |
| `'success' => true` | 処理が正常に完了したことをJSに伝えるための返却値 |

---

### 5. 未対応の指示にエラーを設定

```php
http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
```

#### 用語

| コード | 意味 |
|---|---|
| `http_response_code(405)` | ステータスコード `405`（そのメソッドは許可されていない）を返す |
| `'error' => 'Method Not Allowed'` | エラー内容をJSON形式でJSに伝える |

#### 解釈

`GET` / `POST` / `PUT` / `DELETE` のいずれにも一致しなかった場合、コード `405` とエラーメッセージを返して処理を終了する。想定外のリクエストを弾くため

---

# script.js 

## ― todos.php との連携部分

### 共通：送信先 URL の定義

```js
const API_URL = "api/todos.php";
```

#### 用語

| 記法 | 意味 |
|---|---|
| `"api/todos.php"` | このJSファイルから見た `todos.php` の場所（相対パス） |

---

### 1. 一覧取得（GET）

```js
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
```

#### 用語

| 記法・関数 | 意味 |
|---|---|
| `async function` | 中に「待つ処理」が含まれる関数につける |
| `await fetch(API_URL)` | `todos.php` にGETリクエストを送り、返事が来るまで待つ |
| `res.ok` | サーバーが「成功（200番台）」を返したかどうか |
| `res.json()` | 返ってきたデータをJSで扱えるオブジェクトに変換する |
| `data.map(normalizeTodo)` | サーバーから受け取った各タスクのキー名をJS側の形式に揃える |
| `try { } catch { }` | エラーが起きたときにアプリが止まらないよう受け止める仕組み |

#### 解釈

メソッドを指定しない `fetch` はデフォルトで `GET` になる。`todos.php` が全件返してくれルのをくれるのを待ってJSONを受け取り、`todos` 配列に保存して画面を再描画する。

---

### 2. タスク追加（POST）

```js
const res = await fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title, description }),
});
```

#### 用語

| 記法・関数 | 意味 |
|---|---|
| `method: "POST"` | 「新しいデータを送る」操作を表すHTTPメソッド |
| `headers: { "Content-Type": "application/json" }` | 「送るデータはJSON形式ですよ」とサーバーに伝えるヘッダー |
| `body: JSON.stringify(...)` | JSのオブジェクト `{ title, description }` を文字列（JSON）に変換して送る |

#### 解釈

入力欄のタイトルと説明文をJSON文字列にまとめて HTTPリクエストで`todos.php` へ送る。成功したら入力欄を空にして `loadTodos` で一覧を再取得する。

---

### 3. 完了/未完了の切り替え・編集保存（PUT）

```js
const res = await fetch(`${API_URL}?id=${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title,
    description,
    completed: target.completed ? 0 : 1,
  }),
});
```

#### 用語

| 記法・関数 | 意味 |
|---|---|
| `` `${API_URL}?id=${id}` `` | ファイルを指定。const API_URL = "api/todos.php";に?以下のパラメーターを追加。`?id=3` のようにURLへ対象タスクのIDを付け足す |
| `method: "PUT"` | 「既存データを上書き更新する」操作を表すHTTPメソッド |
| `target.completed ? 0 : 1` | 現在が完了なら `0`（未完了）、未完了なら `1`（完了）に反転する |

#### 解釈

URLのクエリパラメータで更新するタスクを読み込み、JSON文字列にしたtitle,discription,completedのtrue,faleseをまとめて送る。編集保存（`saveEdit`）も同じ仕組みで、`completed` の値だけ現在と同じ値を維持する点が異なる。

---

### 4. タスク削除（DELETE）

```js
const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
```

#### 用語

| 記法・関数 | 意味 |
|---|---|
| `method: "DELETE"` | 「データを削除する」操作を表すHTTPメソッド |
| `?id=${id}` | 削除したいタスクのIDをURLに付けて指定する |

#### 解釈

URLに `?id=3` のようなIDを付けるだけで `todos.php` 側が対象行を特定して削除してくれる。

---

### まとめ：メソッドと関数の対応表

| HTTPメソッド | JS の関数 | todos.php への指示 |
|---|---|---|
| GET | `loadTodos` | 全タスクを取得する |
| POST | `addTodo` | 新しいタスクを追加する |
| PUT | `toggleTodo` / `saveEdit` | タスクの内容や完了状態を更新する |
| DELETE | `deleteTodo` | 指定したタスクを削除する |