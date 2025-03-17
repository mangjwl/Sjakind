const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


// 连接数据库配置
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'lnuyasha'
});

connection.connect();

// 注册端点
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = `INSERT INTO users (username, password) VALUES (?, ?)`;

        connection.query(query, [username, hashedPassword], (err, results) => {
            if (err) {
                // 处理错误，例如用户名已存在
                return res.status(500).json({ message: 'User registration failed' });
            }
            return res.status(200).json({ message: 'User registered successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// 登录端点
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const query = `SELECT * FROM users WHERE username = ?`;

        connection.query(query, [username], async (err, results) => {
            if (err || results.length === 0) {
                return res.status(401).json({ message: 'Authentication failed' });
            }
            const user = results[0];
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                return res.status(200).json({ message: 'Authentication successful' });
            } else {
                return res.status(401).json({ message: 'Authentication failed' });
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/get-comments', (req, res) => {

    console.log('get-comments route was called'); 

    const query = 'SELECT * FROM comments ORDER BY create_time DESC';

    connection.query(query, (err, results) => {
        if (err) {
            // 处理可能发生的错误
            return res.status(500).json({ message: 'Error retrieving comments' });
        }
        res.status(200).json(results);
    });
});


// 发布评论端点
app.post('/post-comment', (req, res) => {
    const { username, content } = req.body;
    const query = 'INSERT INTO comments (user, content, create_time) VALUES (?, ?, NOW())';

    connection.query(query, [username, content], (err, results) => {
        if (err) {
            console.error(err); // 打印错误
            return res.status(500).json({ message: 'Error posting comment', error: err.message });
        }
        res.status(200).json({ message: 'Comment posted successfully' });
    });
});

// 删除评论端点
app.delete('/delete-comment/:id', (req, res) => {
    const commentId = req.params.id;
    const query = 'DELETE FROM comments WHERE id = ?';

    connection.query(query, [commentId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: '删除评论时出错', error: err.message });
        }
        res.status(200).json({ message: '评论已删除' });
    });
});

app.get('/search-comments', (req, res) => {
    const { username } = req.query;
    const query = 'SELECT * FROM comments WHERE user = ? ORDER BY create_time DESC';

    connection.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving comments' });
        }
        res.status(200).json(results);
    });
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

