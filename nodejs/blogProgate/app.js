// データベースは「progate_blog」を使用

const express = require('express');

// データベースMySQLを使うためのコード
const mysql = require('mysql');

// セッションを使うためのコード
const session = require('express-session');

// パスワードハッシュ化を使うためのコード
const bcrypt = require('bcrypt');

const app = express();

// 静的ファイルを受け取るコード
app.use(express.static('public'));

// フォームの値を受け取るコード
app.use(express.urlencoded({extended: false}));

// データベースMySQLに接続（定数connectionを定義して接続情報の書かれたコードを代入）
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'progate_blog'
});

// MySQLへの接続ができていないときにエラーを表示する
connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

// express-sessionを使うために必要な情報
app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
)

// app.use関数は全てのリクエストに対応
app.use((req, res, next) => {
  if (req.session.userId === undefined) {
    // localsオブジェクトをEJSファイルへ渡す
    res.locals.username = 'ゲスト';
    res.locals.isLoggedIn = false;
  } else {
    // localsオブジェクトをEJSファイルへ渡す
    res.locals.username = req.session.username;
    res.locals.isLoggedIn = true;
  }
  // リクエストに一致する次の処理を実行
  next();
});

// トップ画面を表示（ルートURL）
app.get('/', (req, res) => {
  res.render('top.ejs');
});

// 一覧画面を表示
app.get('/list', (req, res) => {
  // 【クエリ】データベースから全データを取得する処理
  connection.query(
    'SELECT * FROM articles',
    // 【クエリ実行後の処理】　下記resultsにはクエリの実行結果が入る
    (error, results) => {
      // list.ejsへデータベースから取得した値（articles: results）を渡す
      // ※resultsは配列構造
      res.render('list.ejs', { articles: results });
    }
  );
});

// 閲覧画面を表示
app.get('/article/:id', (req, res) => {
  const id = req.params.id;
  // 【クエリ】データベースから全データを取得する処理
  connection.query(
    'SELECT * FROM articles WHERE id = ?',
    [id],
    // 【クエリ実行後の処理】　下記resultsにはクエリの実行結果が入る
    (error, results) => {
      // article.ejsへデータベースから取得した値（articles: results）を渡す
      // ※resultsは配列構造
      res.render('article.ejs', { article: results[0] });
    }
  );
});

// アカウント作成画面を表示
app.get('/signup', (req, res) => {
  res.render('signup.ejs', { errors:[] });
});

// アカウント登録処理するルーティング
app.post('/signup', 
  (req, res, next) => {
    console.log('入力値の空チェック');
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const errors = [];

    if (username === '') {
      errors.push('ユーザー名が空です');
    }

    if (email === '') {
      errors.push('メールアドレスが空です');
    }

    if (password === '') {
      errors.push('パスワードが空です');
    }

    if (errors.length > 0) {
      res.render('signup.ejs', { errors: errors });
    } else {
      next();
    }
  },
  (req, res, next) => {
    console.log('メールアドレスの重複チェック');
    const email = req.body.email;
    const errors = [];
    connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (error, results) => {
        if (results.length > 0) {
          errors.push('ユーザー登録に失敗しました');
          res.render('signup.ejs', { errors: errors });
        } else {
          next();
        }
      }
    );
  },
  (req, res) => {
    console.log('ユーザー登録');
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(password, 10, (error, hash) => {
      connection.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hash],
        (error, results) => {
          req.session.userId = results.insertId;
          req.session.username = username;
          res.redirect('/list');
        }
      );
    });
  }
);

// ログイン画面を表示
app.get('/login', (req, res) => {
  res.render('login.ejs');
});

// ログインするルーティング
app.post('/login', (req, res) => {
  // フォームから送信されたメールアドレスを定数emailに代入
  const email = req.body.email;
  //送信されたメールアドレスからユーザーを検索する
  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (error, results) => {
      // 配列resultsの要素数が0より大きい場合はユーザー情報が見つかった ▶︎ 認証処理へ進む
      if(results.length > 0){
        // 受け取ったパスワードを定数plainとして定義
        const plain = req.body.password;

        // ハッシュ化されたパスワードを定数hashとして定義
        const hash = results[0].password;
        
        // 受け取ったパスワードとハッシュ化されたパスワードをcompareメソッドで比較
        // isEqualには真偽値が入る（true or false）
        bcrypt.compare(plain, hash, (error, isEqual) => {
          if(isEqual) {
            req.session.userId = results[0].id;
            req.session.username = results[0].username;
            res.redirect('/list');
          } else{
            res.redirect('/login');
          }
        });
      } else{
        res.redirect('/login');
      }
    }
  )
});

// ログアウトするルーティング
app.get('/logout', (req, res) => {
  // 保存したセッション情報を削除
  req.session.destroy((error) => {
    res.redirect('/list');
  });
});

app.listen(3000);
