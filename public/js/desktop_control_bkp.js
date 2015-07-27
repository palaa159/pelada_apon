// Matter.js - http://brm.io/matter-js/

/*------------- SOCKET LISTENERS -------------*/
socket.on('new user desktop', function(user) {
    createNewUser(user);
});

socket.on('update user desktop', function(user) {
    updateUsers(user);
});

socket.on('remove user desktop', function(userId) {
    removeUser(userId);
});

/*------------- MATTER OBJECTS -------------*/
// Matter module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events;

var container = document.getElementById('canvas-container');
// create a Matter.js engine
var engine = Engine.create(container, {
    render: {
        options: {
            showAngleIndicator: true,
            wireframes: false,
            showShadows: true
        }
    }
});

// add some some walls to the world
var thickness = 50;
World.add(engine.world, [
    Bodies.rectangle(0, window.innerHeight/2, thickness, window.innerHeight, {
        isStatic: true
    }),
    Bodies.rectangle(window.innerWidth, window.innerHeight/2, thickness, window.innerHeight, {
        isStatic: true
    }),
    Bodies.rectangle(window.innerWidth/2, 0, window.innerWidth, thickness, {
        isStatic: true
    }),
    Bodies.rectangle(window.innerWidth/2, window.innerHeight, window.innerWidth, thickness, {
        isStatic: true
    })
]);

/*------------- BALLS -------------*/
var myBalls = {};
var nBalls = 2;
for(var i = 0; i < nBalls; i++){
    //Create balls
    // var newBall = Bodies.circle(25, 10, 10 + ~~(Math.random() * 5), {
    var newCircle = Bodies.circle(25, 10, 15, {        
        friction: 0.001,
        restitution: 0.5,
        density: 0.0001    
    });    
    //Add to stage
    World.add(engine.world, newCircle);

    var newBallObj = new Object();
    initBall(newBallObj, 1, newCircle);
    myBalls[newCircle.id] = newBallObj;
}

function initBall(obj, _direction, _ball){
    obj.direction = _direction;
    obj.ball = _ball;
}

// Composites.stack(10, 10, 1, 1, 10, 10, function(x, y, column, row) {
//     return Bodies.circle(x, y, 10 + ~~(Math.random() * 5), {
//         friction: 0.001,
//         restitution: 0.05,
//         density: 0.00001
//     });
// });

Events.on(engine, 'beforeUpdate', function(event) {
    for(var key in users){
        $('#' + key).css({
            left: users[key].bar.position.x + 'px',
            top: users[key].bar.position.y + 'px',
        });
    }

  for(var key in myBalls){
    // console.log(myBalls[key].direction);
    Body.applyForce(myBalls[key].ball,
                    {x:0, y:0},
                    {x:0.00001 * myBalls[key].direction, y:0});
  }
});

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs;

  // change object colours to show those starting a collision

  //OLD COLLISION STUFF
  for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      // console.log(pair);
      // console.log(pair.collision.tangent.x);
      if(pair.collision.tangent.x != 0){
        // console.log(pair.collision.tangent.x);
          var obj;
          if(typeof pair.bodyA.circleRadius !== 'undefined'){
            // console.log(pair.bodyA.circleRadius);
            obj = pair.bodyA;
          }else if(typeof pair.bodyB.circleRadius !== 'undefined'){
            obj = pair.bodyB;
          }

          //Change direction
          if(typeof obj !== 'undefined'){
            console.log(myBalls[obj.id].direction);
            myBalls[obj.id].direction *= -1;
          }        
      }
  }
});

// run the engine
Engine.run(engine);


/*------------- USERS -------------*/
//ASSOCIATIVE ARRAY!!!!
var users = {};

function initUser(obj, _id, _name, _color, _scale, _bar) {
    //Variables
    obj.id = _id;
    obj.name = _name;
    obj.color = _color;
    obj.scale = _scale;

    obj.bar = _bar;

    obj.update = function(_angle, _force) {
        var angle = _angle / 5000;
        var force = _force;
        console.log(angle);
        // console.log(force);

        Body.applyForce(obj.bar, {
            x: 0,
            y: 0
        }, {
            x: force.x / 100000,
            y: force.y / 100000
        });
        // Body.rotate(obj.bar, angle);
    };

    //Create div with name
    var myHtml = '<div class="flying-name" id=' + obj.id +'>' + obj.name + '</div>';
    $('body').append(myHtml);
}

// initUser.prototype.update = function(){}

// $('body').keypress(function(e) {
//   console.log(e.keyCode);
//   // if (e.keyCode == 13) {
//   //   createNewUser();
//   // }
//   // else if(e.keyCode == 32) {
//   //   removeUser();
//   // }
// });

function createNewUser(user) {

    //Grab the user properties
    var id = user.id;
    var name = user.name;
    var color = user.color;

    //Creates a new bar
    var x = 10 + ~~(Math.random() * 200);
    var y = 10 + ~~(Math.random() * 200);
    var bar = Bodies.rectangle(x, y, 120, 8, {
        friction: 0.001,
        restitution: 0.05,
        density: 0.001
    });
    bar.render.fillStyle = color;
    bar.render.strokeStyle = color;
    World.add(engine.world, bar);

    //Creates a new user object and add it to the array
    var newUser = new Object();
    initUser(newUser, id, name, color, 1, bar);
    users[id] = newUser;
    // console.log(users);

    //Creates a new lemming
    // var newLemming = Bodies.circle(10, 10, 15, { friction: 0.00001, restitution: 0.5, density: 0.001 });
}

function updateUsers(user) {
    users[user.id].update(user.angle, user.force);
}

function removeUser(userId) {
    //Remove object from the world
    Composite.remove(engine.world, users[userId].bar, true);
    //Remove user object
    delete users[userId];
}

/*------------- MY PROCESSING FUNCTIONS -------------*/
var normalize = function(obj) {
    var normalized = {
        x: obj.x / (Math.abs(obj.x) + Math.abs(obj.y)),
        y: obj.y / (Math.abs(obj.x) + Math.abs(obj.y))
    }
    return normalized;
}

var dist = function(x1, y1, x2, y2) {
    var angle = Math.atan2(y1 - y2, x1 - x2);
    var distance;
    if ((y1 - y2) == 0) {
        distance = (x1 - x2) / Math.cos(angle);
    } else {
        distance = (y1 - y2) / Math.sin(angle);
    }
    return distance;
}

// createStage(1);