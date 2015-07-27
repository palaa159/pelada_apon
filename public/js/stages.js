var centerX = window.innerWidth / 2,
    centerY = window.innerHeight / 2;

var spinningDeath = [],
    goalElements = [],
    goal;

function createStage() {
    World.add(engine.world, [
        // createRect(250, window.innerHeight / 2 + 200, 20, window.innerHeight + 200),
        // createRect(window.innerWidth, window.innerHeight, 300, 1000),
        // createRect(0, window.innerHeight / 2 - 50, 150, 20),
        createRect(window.innerWidth - 220, window.innerHeight, 420, 100),
        goalElements[0] = Bodies.polygon(0, window.innerHeight / 2 - 85, 3, 40, {
            isStatic: true
        }),
        goalElements[1] = Bodies.polygon(0, window.innerHeight / 2 + 85, 3, 40, {
            isStatic: true
        }),
        goalElements[2] = Bodies.polygon(window.innerWidth, window.innerHeight / 2 - 85, 3, 40, {
            isStatic: true
        }),
        goalElements[3] = Bodies.polygon(window.innerWidth, window.innerHeight / 2 + 85, 3, 40, {
            isStatic: true
        }),
        goalLeft = Bodies.rectangle(0, window.innerHeight / 2, 40, 131, {
            isStatic: true,
            friction: 10
        }),
        goalRight = Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 40, 131, {
            isStatic: true,
            friction: 10
        }),

        // spinning death
        spinningDeath[0] = createRect(window.innerWidth / 2, window.innerHeight / 4 - 50, 200 - 100, 20),
        spinningDeath[1] = createRect(window.innerWidth / 2, window.innerHeight / 4 * 3 + 50, 200 - 100, 20),
        spinningDeath[2] = createRect(window.innerWidth / 4, window.innerHeight / 2 - 20, 150 + 30, 20),
        spinningDeath[3] = createRect(window.innerWidth / 1.3, window.innerHeight / 2 - 20, 150 + 30, 20)
    ]);
    goalLeft.render.fillStyle = 'white';
    goalLeft.render.strokeStyle = 'white';
    goalRight.render.fillStyle = 'white';
    goalRight.render.strokeStyle = 'white';
}

function createRect(x, y, w, h) {
    return Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        friction: 0.01
    });
}

createStage();

for (var i = 0; i < 2; i++) {
    Body.rotate(goalElements[i], 45);
}
for (var i = 2; i < 4; i++) {
    Body.rotate(goalElements[i], 0);
}

for (var i = 0; i < spinningDeath.length; i++) {
    var color = getRandColor();
    spinningDeath[i].render.fillStyle = color;
    spinningDeath[i].render.strokeStyle = color;
}

setInterval(function() {
    for (var i = 0; i < 2; i++) {
        Body.rotate(spinningDeath[i], 0.01);
    }
    for (var i = 2; i < 4; i++) {
        Body.rotate(spinningDeath[i], 0.025);
    }
}, 1000 / 60);

function getRandColor() {
    var hsl;
    return 'hsl(' + ~~(Math.random() * 360) + ', 75%, 50%)';
}