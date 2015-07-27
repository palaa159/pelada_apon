var express = require('express'),
    fs = require('fs'),
    app = express(),
    port = 5002,
    util = require('util'),
    MobileDetect = require('mobile-detect'),
    server = app.listen(port);

app.configure(function() {
    app.use('/public', express.static(__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.logger());
    app.use(express.compress());
    app.use(express.methodOverride());
});
// ROUTING TO THE RIGHT PAGE
app.get('*', function(req, res, next) {
    var md = new MobileDetect(req.headers['user-agent']);
    var ua = JSON.stringify(md.ua);
    if (ua.indexOf('iPhone') !== -1 || ua.indexOf('Android') !== -1) { // if mobile
        res.redirect('public/mobile.html');
    } else { // if desktop
        res.redirect('public/desktop.html');
    }
});

console.log('app is listening at localhost:' + port);

// USER STORAGE
var user = [];
var desktopId = null;

// SOCKET.IO
var io = require('socket.io').listen(server);
// io.set('log level', 1);
io.sockets.on('connection', function(socket) {
    // When desktop join
    socket.on('desktop', function() {
        util.log('desktop has joined');
        desktopId = socket.id;
    });
    if (desktopId !== null) { // only desktop is already joined
        // when new user join
        socket.on('new user', function(d) {
            user.push({
                id: socket.id,
                name: d.name,
                color: d.color
            });
            socket.emit('user id', socket.id);
            io.sockets.emit('announce new user', {
                thatguy: d.name,
                users: user.length
            });
            util.log('broadcast new user');
            // send new user to desktop
            io.sockets.emit(desktopId).emit('new user desktop', user[findIndexByValue(socket.id, user)]);
        });
        // update user info
        socket.on('user update', function(d) {
            // find the right user
            if (user[findIndexByValue(socket.id, user)] !== undefined) {
                user[findIndexByValue(socket.id, user)] = d;
                var thatguy = user[findIndexByValue(socket.id, user)];
                if (thatguy !== undefined) {
                    io.sockets.emit(desktopId).emit('update user desktop', {
                        id: thatguy.id,
                        force: thatguy.force
                    });
                }
            }
        });
        // when disconnect
        socket.on('disconnect', function() {
            // if desktop is gone
            if (socket.id === desktopId) {
                // reset everyone
                io.sockets.emit('hard reset');
            }
            // if not undefined
            if (user[findIndexByValue(socket.id, user)] !== undefined) {
                var thatguy = user[findIndexByValue(socket.id, user)].name;
                // find id and remove
                user.splice(findIndexByValue(socket.id, user), 1);
                io.sockets.emit('announce disconnected user', {
                    thatguy: thatguy,
                    users: user.length
                });
                // remove from desktop
                io.sockets.emit(desktopId).emit('remove user desktop', socket.id);
                util.log('remove player ' + socket.id);
            }
        });
    }
});

// helpers
// find index by value
function findIndexByValue(id, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].id === id) {
            return i;
        }
    }
}

// make callback to push function
Array.prototype.push = (function() {
    var original = Array.prototype.push;
    return function() {
        //Do what you want here.
        return original.apply(this, arguments);
    };
})();
Array.prototype.splice = (function() {
    var original = Array.prototype.splice;
    return function() {
        //Do what you want here.
        return original.apply(this, arguments);
    };
})();