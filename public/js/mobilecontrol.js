//
console.log('mobilecontrol loaded');

var user = {
    angle: 0,
    scale: 1
};

// user hit join game
$('#js-join').on('click', function() {
    // check val from input form
    var val = $('.FormJoin').val();
    if (val.length > 2 && val.length <= 10) { // 3 - 10 characters
        user.name = val;
        control_init();
        // alert('good to go');
    } else {
        alert('please type 3-10 characters');
    }
});

$('#js-whatever').on('click', function() {
    alert('you are not supposed to click this');
});

function control_init() {
    user.color = getRandColor();
    // submit to server
    socket.emit('new user', user);
    // clear
    $('.registration').remove();
    $('.control').removeClass('hidden');
    $('.control-name').html(user.name);
    $('.bar')
        .css({
            background: user.color
        });
    setTimeout(function() {
        window.scrollTo(0, 0);
        centerObj('.bar');
    }, 0);
    document.ontouchstart = function(e) {
        e.preventDefault();
    };
}

// listeners
// hammer.js
var isRotating = false;
Hammer($('.control')[0]).on('rotate', function(d) {
    isRotating = true;
    user.angle = ~~ (d.gesture.rotation);
    $('.bar').css({
        '-webkit-transform': 'rotate(' + user.angle + 'deg)'
    });
    // emit user
    socket.emit('user update', user);
});
var touchStart;
Hammer($('.control')[0]).on('touch', function(d) {
    // remove object from the physics world, maybe?
});
var forceTemp = [];
Hammer($('.control')[0]).on('drag', function(d) {
    if (!isRotating) {
        user.angle = 0;
        user.force = {
            x: ~~d.gesture.deltaX,
            y: ~~d.gesture.deltaY
        };
        console.log(user.force.x, user.force.y);
        // move
        $('.bar').css({
            top: 225 + user.force.y + 'px',
            left: 100 + user.force.x + 'px'
        });
    }
});

Hammer($('.control')[0]).on('release', function(d) {
    console.log('release');
    touchPos = null;
    // re-apply physics to the object
    isRotating = false;
    $('.bar').css({
        '-webkit-transform': 'rotate(0deg)'
    });
    centerObj('.bar');
    socket.emit('user update', user);
});

// SOCKET.IO LISTENERS

socket.on('hard reset', function() {
    location.reload();
});

socket.on('user id', function(id) {
    user.id = id;
});

socket.on('announce new user', function(d) {
    $('.debug-message').css('top', '-20px');
    setTimeout(function() {
        $('.debug-message').css('top', '0px').html('<strong>> ' + d.thatguy + ' connected. Total players: ' + d.users + '</strong>');
    }, 500);
});
socket.on('announce disconnected user', function(d) {
    $('.debug-message').css('top', '-20px');
    setTimeout(function() {
        $('.debug-message').css('top', '0px').html('<strong>> ' + d.thatguy + ' is gone. Total players: ' + d.users + '</strong>');
    }, 500);
});

// helper
function getRandColor() {
    var h = ~~ (Math.random() * 360);
    return 'hsl(' + h + ', 75%, 50%)';
}

function centerObj(obj) {
    $(obj).css({
        top: window.innerHeight / 2 - $(obj).height() / 2,
        left: window.innerWidth / 2 - $(obj).width() / 2
    });
}

// hypnos
var hypnos = new Hypnos({
    delay: 2000,
    error: 1000
});
setInterval(function() {
    hypnos.isSleeping(function(isSleeping) {
        if (isSleeping) {
            // disconnect
            location.reload();
        }
    });
}, 1000);