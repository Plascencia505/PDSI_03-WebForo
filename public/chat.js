const socket = io();
// DOM
const usernameInput = document.getElementById('username');
const btnRegistrar = document.getElementById('btnRegistrar');
const registroDiv = document.getElementById('registro');
const chatDiv = document.getElementById('chat');
const mensajeInput = document.getElementById('mensaje');
const mensajesDiv = document.getElementById('mensajes');
const formulario = document.getElementById('formulario');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

let username = '';
let color = '';

// Verificar localStorage al cargar
const usuarioGuardado = localStorage.getItem('username');
if (usuarioGuardado) {
  socket.emit('registro', usuarioGuardado);
}

// Registro manual
btnRegistrar.addEventListener('click', () => {
  const valor = usernameInput.value.trim();
  if (valor !== '') {
    socket.emit('registro', valor);
  }
});

socket.on('usuario_confirmado', (data) => {
  username = data.username;
  color = data.color;

  // Guardar en localStorage
  localStorage.setItem('username', username);

  usernameInput.disabled = true;
  btnRegistrar.disabled = true;
  registroDiv.classList.add('oculto');
  chatDiv.classList.remove('oculto');
  mensajeInput.focus();
});

socket.on('historial', (mensajes) => {
  mensajes.forEach(agregarMensaje);
});

socket.on('mensaje', agregarMensaje);

formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  const contenido = mensajeInput.value.trim();
  if (contenido !== '') {
    socket.emit('mensaje', contenido);
    mensajeInput.value = '';
  }
});

btnCerrarSesion.addEventListener('click', () => {
  localStorage.removeItem('username');
  location.reload();
});

function agregarMensaje(data) {
  const div = document.createElement('div');
  div.classList.add('mensaje');

  const usuarioSpan = document.createElement('span');
  usuarioSpan.style.color = data.color;
  usuarioSpan.textContent = data.usuario;

  const horaTexto = ` [${data.hora}]: `;
  const mensajeTexto = document.createTextNode(data.contenido);

  div.appendChild(usuarioSpan);
  div.append(horaTexto, mensajeTexto);
  mensajesDiv.appendChild(div);
  mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
}
