// src/utils/socket.js or similar
import { io } from 'socket.io-client';

const socket = io('http://localhost:5050', {
  transports: ['websocket'],
  auth: {
    token: localStorage.getItem('serviceToken')
  }
});

export default socket;
