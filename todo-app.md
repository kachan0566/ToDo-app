#全体の流れ
・保存名の定義
・現在の状態を反映する変数の定義
・HTMLの情報をJSへ呼び出す変数の定義
・各イベントの定義
・イベント内に定義されている変数の定義
・init

#HTMLの情報をJSへ呼び出す変数の定義
`getelementid()`**役割/**()内のid要素を取得
`querySelectorAll()`**役割/**()内の要素を全て取得
今回はdocument.によってHTML内の()の要素を取得

`init()`**役割/**初期化用の独自関数。アプリ起動時に行う処理を()内に定義する
`loadTodos();  bindEvents();  renderTodos();`は後に定義

#bindevent()の中身
`〇〇.addEventListener(a,b)`**役割/**〇〇にaを行った時にbの処理を行うというイベント要素を追加
`preventDefault`**役割/**デフォルトの処理を実行しない　ex.enterキーを押す→ページをロード
`配列.foreach(要素,処理)`**役割/**配列内の各要素に処理内容を定義する
`〇〇.closest()`**役割/**〇〇に最も近い()要素を取得
`〇〇.contains()`**役割/**〇〇内の()要素を含む

#function addTodo()
`trim()`**役割/**空白を削除
`〇〇.focus()`**役割/**〇〇に操作対象を当てる
`toISOString()`**役割/**new Date()等の日付オブジェクトを世界標準時間に変換する。主に保存用
`Date.now()`**役割/**1970年からの経過時間の数値（ミリ秒）を取得
`toString()`**役割/**Date.now()で取得したようなミリ秒の数値を文字列に変換
`〇〇.push()`**役割/**〇〇に()の要素を追加して再配列する

#function renderTodos()
`〇〇.createElement()`**役割/**〇〇内に()の要素を作る
`〇〇.appendChild()`**役割/**〇〇に()の要素を小要素として追加する
`〇〇.createDocumentFragment()`**役割/**〇〇内に新たなフラクメント（要素を入れる箱）を作成。後でフラグメントを追加することで入れていた要素を一度にまとまりとして追加できる。

#function getProcessedTodos() 
`sort(a,b)`**役割/**()内の並び替え　基本的にsort(()=>{})で{}のルールで並び替える
`Date.(prototype).getTime()`**役割/**(prototype)の条件で取得した日付オブジェクトをgetTime()で数値に変換
`filter()`**役割/**()内の条件に合うものを取得

#function toggleTodo(id)
`〇〇.find()`**役割/**〇〇の中から()の条件に合うものを探す

#function saveEdit(id)
`querySelector(CSSセレクタ)`**役割/**HTMLの中から(CSSのルールで書かれた)要素を取得
`CSS.escape()`**役割/**()の文字列がCSS上で問題が発生しないように変換する
`classList.add()`**役割/**classListに()のクラスを加える

#function deleteTodo(id)
`window.confirm()`**役割/**()の内容で確認画面を表示する

#function setFilter(filterType) 
`classList.toggle(a,条件)`**役割/**条件がtrue→aを該当classに追加、false→aを削除

#function saveTodos()
`localStorage.setItem(a,b)`**役割/**aという名前でbをブラウザのローカルストレージへ保存
`JSON.stringify()`**役割/**()のオブジェクトを文字列に変換。ブラウザへ保存時、オブジェクトのまま保存できない

#function loadTodos()
`localStorage.getItem()`**役割/**ローカルストレージから()を呼び出す
`JSON.parse()`**役割/**保存された文字列をオブジェクトに変換
`Array.isArray()`**役割/**()内の内容が配列かどうかを確認。配列ならtrue,違うならfalse //is~ 〜かどうかを確認
`map()`**役割/**()の処理を実行して再配列

#function showError(message)
`classList.remove()`**役割/**クラスの中の()の処理を取り除く

#function formatDate(dateString) 
`Number.isNaN()`**役割/**()で取得したものが数値でないかどうかを確認
`toLocaleString()`**役割/**()の地域の表記へ変換

#function escapeHtml(value) 
`replaceAll(a,b)`**役割/**aを全てbに置き換える




