// 页面加载时检查用户名并设置评论表单的事件监听器
document.addEventListener('DOMContentLoaded', function () {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        document.getElementById('username').textContent = storedUsername;
    } else {
        document.getElementById('username').textContent = '访客';
    }

    // 当页面加载时，获取并显示评论
    fetchComments();

    // 处理评论提交
    var commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.onsubmit = function (event) {
        event.preventDefault(); // 阻止默认提交行为
        const username = storedUsername; // 从本地存储或其他地方获取用户名
        const content = document.getElementById('comment-content').value;
        postComment(username, content); // 异步发送评论到服务器
    };
    } else {
        console.error('The comment form was not found.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
      logoutButton.addEventListener('click', function() {
          localStorage.removeItem('username');  // 清除本地存储的用户名
          window.location.href = 'login.html';  // 重定向到登录页面
      });
  }
});

//搜索评论
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('search-form');
  searchForm.onsubmit = function(event) {
      event.preventDefault();
      const username = document.getElementById('search-username').value;
      fetchCommentsByUsername(username); // 一个新函数用来根据用户名获取评论
  };
});

function fetchCommentsByUsername(username) {
  fetch(`http://localhost:5500/search-comments?username=${encodeURIComponent(username)}`)
  .then(response => response.json())
  .then(comments => {
      const commentsSection = document.getElementById('comments-section');
      commentsSection.innerHTML = '';
      comments.forEach(comment => {
          const commentDiv = document.createElement('div');
          commentDiv.className = 'comment';
          commentDiv.textContent = `${comment.user}: ${comment.content} - ${new Date(comment.create_time).toLocaleString()}`;
          commentsSection.appendChild(commentDiv);
      });
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function fetchComments() {
  fetch('http://localhost:5500/get-comments') 
    .then(response => response.json())
    .then(comments => {
      const commentsSection = document.getElementById('comments-section');
      commentsSection.innerHTML = ''; // 清空现有评论
      comments.forEach(comment => {
        console.log(comment.username);
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';

        // 创建显示用户名的元素
        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'comment-username';
        usernameSpan.textContent = comment.user; // 假设返回的对象有一个username属性

        // 创建显示评论内容的元素
        const contentDiv = document.createElement('div');
        contentDiv.className = 'comment-content';
        contentDiv.textContent = comment.content; // 假设返回的对象有一个content属性

        // 创建显示评论时间的元素
        const timeSpan = document.createElement('span');
        timeSpan.className = 'comment-time';
        timeSpan.textContent = new Date(comment.create_time).toLocaleString(); // 格式化时间，假设返回的对象有一个create_time属性

        // 将用户名、评论内容和时间添加到评论的div中
        commentDiv.appendChild(usernameSpan);
        commentDiv.appendChild(contentDiv);
        commentDiv.appendChild(timeSpan);

        // 将完整的评论元素添加到评论区域
        commentsSection.appendChild(commentDiv);
        // 创建删除按钮
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.className = 'delete-comment';
        deleteButton.onclick = () => deleteComment(comment.id);

        // 添加评论内容和删除按钮到评论div
        commentDiv.appendChild(deleteButton);

        commentsSection.appendChild(commentDiv);
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

  
// 发布评论的函数
function postComment(username, content) {
  fetch('http://localhost:5500/post-comment', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, content: content }),
  })
  .then(response => {
      if (response.ok) {
          return response.json();
      }
      throw new Error('Network response was not ok.');
  })
  .then(data => {
      console.log('Success:', data);
      fetchComments(); // 重新加载评论
      document.getElementById('comment-content').value = ''; // 清空文本框
  })
  .catch(error => {
      console.error('Error:', error);
  });
}


function deleteComment(id) {
  fetch(`http://localhost:5500/delete-comment/${id}`, {
      method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
      fetchComments(); // 重新加载评论以更新显示
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

  