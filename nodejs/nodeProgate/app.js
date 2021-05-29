// データベースは「progate」を使用

// expressの読み込み
const express = require('express');
// expressを使用するための準備
const app = express();

// localhost:3000でアクセス可能なサーバーを起動する
app.listen(3000);

// CSSや画像ファイルを置くフォルダを指定する
app.use(express.static('public'));

// データベースMySQLパッケージを読み込み
const mysql = require('mysql');
// データベースMySQLに接続（定数connectionを定義して接続情報の書かれたコードを代入）
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'progate'
});

// MySQLへの接続ができていないときにエラーを表示する
connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

// フォームの値を受け取るコード
app.use(express.urlencoded({extended: false}));

// トップ画面を表示（ルートURL）
app.get('/', (req, res) => {
  res.render('top.ejs');
});

// 一覧画面を表示
app.get('/index', (req, res) => {
  // 【クエリ】データベースから全データを取得する処理
  connection.query(
    'SELECT * FROM items',
    // 【クエリ実行後の処理】　下記resultsにはクエリの実行結果が入る
    (error,results) => {
      // 【処理①】ウェブコンソールにメッセージを出力
      console.log(results);
      // 【処理②】index.ejsへデータベースから取得した値（items:results）を渡す
      //  ※resultsは配列構造
      res.render('index.ejs',{items:results});
    }
    );
});

// 作成画面を表示
app.get('/new', (req, res) => {
  res.render('new.ejs');
});

// メモ作成のルーティングを用意
app.post('/create', (req, res) => {
  // データベースに追加する処理
  connection.query(
    // VALUES(?)に配列の要素[req.body.itemName]が入る
    'INSERT INTO items(name) VALUES(?)',
    [req.body.itemName],
    (error, results) => {
      // POSTメソッドでリクエストした時はリダイレクト（一覧画面を表示）
      res.redirect('/index');
    }
  );
});

// メモ削除のルーティングを用意
app.post('/delete/:id', (req, res) => {
  // データベースのデータを削除する処理
  connection.query(
    // WHERE id = ?にルートパラメータの値[req.params.id]が入る
    'DELETE FROM items WHERE id = ?',
    [req.params.id],  
    (error, results) => {
      // POSTメソッドでリクエストした時はリダイレクト（一覧画面を表示）
      res.redirect('/index');
    }
  );
});

// メモ編集のルーティングを用意
app.get('/edit/:id', (req, res) => {
  // データベースの更新するデータを表示する処理
    connection.query(
    // WHERE id = ?にルートパラメータの値[req.params.id]が入る
    'SELECT * FROM items WHERE id=?',
    [req.params.id],
    (error, results) => {
      res.render('edit.ejs', {item:results[0]});
    }
  );
});

// メモ更新のルーティングを用意
app.post('/update/:id', (req, res) => {
    // データベースのデータを更新する処理
    connection.query(
    // name=? WHERE id=?にフォームの値とメモのID[req.body.itemName, req.params.id]が入る
    'UPDATE items SET name=? WHERE id=?',
    [req.body.itemName, req.params.id],
    (error, results) => {
      // POSTメソッドでリクエストした時はリダイレクト（一覧画面を表示）
      res.redirect('/index');
    }
  );
});


