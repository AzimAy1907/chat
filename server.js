const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  let nickname = '';

  socket.on('set nickname', (nick) => {
    nickname = nick;
    users[socket.id] = nickname;
    io.emit('user list', Object.values(users));
    io.emit('message', { user: 'Sistem', msg: `${nickname} sohbete katıldı.` });
  });

  socket.on('chat message', (msg) => {
    if (nickname) {
      io.emit('message', { user: nickname, msg });
    }
  });

  socket.on('disconnect', () => {
    if (nickname) {
      io.emit('message', { user: 'Sistem', msg: `${nickname} sohbetten ayrıldı.` });
      delete users[socket.id];
      io.emit('user list', Object.values(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});