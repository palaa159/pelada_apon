var socket = io.connect();

// if desktopId
if (window.innerWidth >= 700) {
    socket.emit('desktop');
}