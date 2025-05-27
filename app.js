const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const xss = require('xss');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos (index.html, chat.js, style.css)
app.use(express.static(path.join(__dirname, 'public')));

// Datos de usuarios registrados
const usuarios = {}; // { username: { color, socketId } }

// Generar un color claro aleatorio
function generarColorClaro() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 40) + 60;  // Saturación: 60%–100%
  const l = Math.floor(Math.random() * 35) + 60;  // Luminosidad: 60%–95%
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Historial de mensajes
const historial = [];

// Manejo de conexiones con Socket.IO
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Manejo de registro
  socket.on('registro', (username) => {
    if (!username) return;

    const usernameSanitizado = xss(username.trim());

    if (!usernameSanitizado) return;

    let color = usuarios[usernameSanitizado]?.color || generarColorClaro();
    usuarios[usernameSanitizado] = { color, socketId: socket.id };

    socket.username = usernameSanitizado;

    socket.emit('usuario_confirmado', { username: usernameSanitizado, color });
    socket.emit('historial', historial);

    console.log(`Usuario registrado: ${usernameSanitizado}`);
  });

  // Manejo de nuevos mensajes
  socket.on('mensaje', (contenido) => {
    const username = socket.username;
    if (!username || !usuarios[username]) return;
    const contenidoSanitizado = xss(contenido);

    const mensaje = {
      usuario: username,
      color: usuarios[username].color,
      contenido: contenidoSanitizado,
      hora: new Date().toLocaleTimeString(),
    };

    historial.push(mensaje); // Guardar en historial
    if (historial.length > 100) historial.shift(); // Limitar historial
    
    io.emit('mensaje', mensaje); // Enviar a todos
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

// Iniciar el servidor
const PORT = 8080;
const IP = 'localhost';
server.listen(PORT, IP, () => {
  console.log(`Servidor activo en http://${IP}:${PORT}`);
});
