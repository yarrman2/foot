var gui  = new dat.GUI();
var game = new Phaser.Game({
    width: 820, 
    height: 530, 
    renderer: Phaser.CANVAS, 
    parent:'parent', 
    transparent:true,
    state: {
        transparent: true,
        preload: preload,
        create: create,
        update,
        render
    }
}
);
var degToRad = Phaser.Math.degToRad;

var rotate = function (ang) {
    return degToRad(ang + 90)
}

function preload() {
    game.load.image('redPl', 'assets/red.png');
    game.load.image('bluePl', 'assets/blue.png');
    game.load.image('circle50', 'assets/circle50.png');

    game.load.image('select', 'assets/select.png');
    game.load.image('hit_arrow', 'assets/hit_arrow.png');
    game.load.image('hit_area', 'assets/player_hitarea.png');
    game.load.image('dot', 'assets/dot_hit.png');
    game.load.image('dots', 'assets/dots.png');
    game.load.image('pl', 'pangball.png');
    game.load.image('ball', 'assets/ball.png');
    game.load.image('gate', 'assets/gate.png');
    game.load.image('goal', 'assets/goal.png');
    game.load.image('win', 'assets/win.png');
    game.load.image('fall', 'assets/fall.png');

    game.load.image('p1', 'assets/particles/p1.png');
    game.load.image('p2', 'assets/particles/p2.png');
    game.load.image('p3', 'assets/particles/p3.png');
    game.load.image('p4', 'assets/particles/p4.png');
    game.load.image('p5', 'assets/particles/p5.png');
    game.load.image('p6', 'assets/particles/p6.png');
    game.load.image('p7', 'assets/particles/p7.png');
    game.load.image('p8', 'assets/particles/p8.png');
}

game.initGame = function () {
    game.scores = {
        red: 0,
        blue: 0
    }
    game.firstPanch = true;
    game.stepTimeLeft = game.stepTimeTotal;
    game._stepTimeLeft = game.time.time;
    game.updateDisplay = 500;
    game.timeId = game.time.time;
    game.isGameOver = false;
    game.incSpeed = 200 * Math.floor(Math.random() * 4);
    game.incSpeedP = 500 * Math.floor(Math.random() * 4);
    game.incPower = 200 * Math.floor(Math.random() * 4);
    game.incPowerP = 500 * Math.floor(Math.random() * 4);

}
game.angleSectors = [0, 45 ,90, 120, 150];
game.angleSectorsString = game.angleSectors.join(', ')//.map(function (a) {return toRad(a)});

game.stepTimeTotal = 300 * 1000;

game.check = function () {
    return (game.scores.red > 1 || game.scores.blue > 1);
}

game.freeze = function () {
    game.blueGroup.children.forEach(function (b) {
        b.body.setZeroVelocity();
    })
    game.redGroup.children.forEach(function (b) {
        b.body.setZeroVelocity();
    })
    game.ball.body.setZeroVelocity();
}

game.fallStrikeSignal = new Phaser.Signal();
game.fallStrikeSignal.add(function () {
    game.freeze();
    game.fall.visible = true;
    setTimeout(function () {
        game.fall.visible = false;
        game.nextTime(game.blueCommand);
    }, 2000);

});

game.nextTime = function (win) {
    game.stepTimeLeft = game.stepTimeTotal;
    game._stepTimeLeft = game.time.time;
    game.firstPanch = true;
    game.guiLevel.updateDisplay();
    game.redGroup.children.forEach(function (b) {
        b.body.x = game.redTeamCoords[b.id].x;
        b.body.y = game.redTeamCoords[b.id].y;
    })
    game.blueGroup.children.forEach(function (b) {
        b.body.x = game.blueTeamCoords[b.id].x;
        b.body.y = game.blueTeamCoords[b.id].y;
    });
    game.ball.body.x = game.ballCoord.x;
    game.ball.body.y = game.ballCoord.y;
    game.freeze();
    
    game.blueCommand = false;
    if (win) {
        game.blueCommand = true;
    } 
    game.nextStepSignal.dispatch();
}

function create() {

    //  Enable p2 physics
    game.initGame();
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.stage.backgroundColor = '#12418400';
    game.physics.p2.gravity.y = 0;
    game.physics.p2.restitution = 1;
    game.centerLine = new Phaser.Line(game.width/2, (game.height - 405) / 2, game.width/2, (game.height - 405) / 2 + 405);
    game.leftLine = new Phaser.Line(60, (game.height - 405) / 2, 60, (game.height - 405) / 2 + 405);
    game.rightLine = new Phaser.Line(game.width-60, (game.height - 405) / 2, game.width - 60, (game.height - 405) / 2 + 405);
    
    game.mass = 5;
    game.massP = 5;
    game.power = 1000 + game.incPower + game.incSpeed;
    game.powerP = 1000 + game.incPowerP + game.incSpeedP;
    game.ballMass = 1;
    game.damping = 0.9;
    game.dampingP = 0.9;
    game.ballDamping = 0.9;
    game.speedOut = 6;
    game.redTeamCoords = [
        {
            x: game.width - 340,
            y: 265 
        },
        {
            x: game.width - 285,
            y: 380
        },
        
        {
            x: game.width - 285,
            y: 150
        },
        {
            x: game.width - 200,
            y: 220
        },
        {
            x: game.width - 200,
            y: 310
        },
    ]
    game.blueTeamCoords = [
        {
            x: 340,
            y: 265 
        },
        {
            x: 285,
            y: 380
        },
        
        {
            x: 285,
            y: 150
        },
        {
            x: 200,
            y: 220
        },
        {
            x: 200,
            y: 310
        },
    ]
    game.ballCoord = {
        x: 410,
        y: 265
    };
    //var angle = 150;
    //var length = 2200

    game.blueCommand =   Math.random() < 0.5 ? true : false;

    game.redGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
   
    game.blueGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
    
    
    game.hitArea = game.add.group();
    var arrow = game.add.sprite(0,0, 'hit_arrow');
    arrow.anchor.set(0.5,1.3);
    var area = game.add.sprite(0,0, 'hit_area');
    area.anchor.set(0.5,0.5);
    var dot = game.add.sprite(0,0, 'dots');
    dot.anchor.set(0.5, -0.3);
    

    game.goalSignal = new Phaser.Signal();
    game.goalSignal.add(function (win) {
        game.blueGroup.children.forEach(function (b) {
            b.body.setZeroVelocity();
        })
        game.redGroup.children.forEach(function (b) {
            b.body.setZeroVelocity();
        })
        game.ball.body.setZeroVelocity();

        if (win) {
            game.scores.blue += 1;
        } else {
            game.scores.red += 1;
        }
        if (game.check()) {
            game.gameOverSignal.dispatch();
        } else {
            game.showWinTablo(win);
        }
    });

        

    game.gameOverSignal = new Phaser.Signal();
    game.gameOverSignal.add(function () {
        game.hitArea.visible = false;
        var emitter1 = game.add.emitter(-40, 50, 2000);
        emitter1.makeParticles(['p1','p2','p3','p4','p5','p6','p7','p8']);
        emitter1.minParticleScale = 0.5;
        emitter1.maxParticleScale = 1;
        emitter1.start(false, 5000, 20, 1000);    
        
        var emitter2 = game.add.emitter(420, -40, 2000);
        emitter2.makeParticles(['p1','p2','p3','p4','p5','p6','p7','p8']);
        emitter2.minParticleScale = 0.5;
        emitter2.maxParticleScale = 1;
        emitter2.start(false, 5000, 20, 1000);    

        var emitter3 = game.add.emitter(900, 50, 2000);
        emitter3.makeParticles(['p1','p2','p3','p4','p5','p6','p7','p8']);
        emitter3.minParticleScale = 0.5;
        emitter3.maxParticleScale = 1;
        emitter3.start(false, 5000, 20, 1000);    
        game.win.visible = true;
        setTimeout(function () {
            emitter1.destroy();
            emitter2.destroy();
            emitter3.destroy();
            game.win.visible = false;
        }, 10000)
    });

    game.showWinTablo = function (win) {
        game.goal.visible = true;
        var timeId = game.timeId;
        setTimeout(function () {
            if (timeId != game.timeId) {
                return;
            }
            game.goal.visible = false;
            game.nextTime(win);
        }, 3000);
    }

    

    game.nextStepSignal = new Phaser.Signal();
    game.nextStepSignal.add( function (bs) {
        //console.clear();
        console.log('nextStepSignal');
        game.stepTimeLeft = game.stepTimeTotal;
        game._stepTimeLeft = game.time.time;
        game.guiLevel.updateDisplay();
        game.isPause = true;
        if (game.firstPanch) game.firstPanch = false
        var lx = game.leftLine.start.x;       
        var rx = game.rightLine.start.x;     
        if (bs) {
            bs.bl.forEach(b => {
                //b.body.x = lx + b.width;
                var v =  (b.width + Math.abs(game.speedOut*(b.x - lx)));
                console.log(lx, b.x,  v)
                b.body.velocity.x = v;
                //var t1 = game.add.tween(b).to({x:lx + b.width}, 300, Phaser.Easing.Quadratic.Out, true);
                //t1.start();
            });
            bs.rl.forEach(b => {
                var v =  (b.width + Math.abs(game.speedOut*(b.x - lx)));
                console.log(lx, b.x,  v)
                b.body.velocity.x = v;
                
                //var t2 = game.add.tween(b).to({x:lx + b.width}, 300, Phaser.Easing.Quadratic.Out, true);
                //t2.start();
            });
            bs.br.forEach(b => {
                var v =  -(b.width + Math.abs(game.speedOut*(rx - b.x)));
                console.log(lx, b.x, rx, v)
                b.body.velocity.x = v;
                
                //var t3 = game.add.tween(b).to({x:rx - b.width}, 300, Phaser.Easing.Quadratic.Out, true);
                //t3.start();
            });
            bs.rr.forEach(b => {
                var v =  -(b.width + Math.abs(game.speedOut*(rx - b.x)));
                console.log(lx, b.x, rx, v)
                b.body.velocity.x = v;
                
                //var t4 = game.add.tween(b).to({x:rx - b.width}, 300, Phaser.Easing.Quadratic.Out, true);
                //t4.start();
            });
            
        }
        setTimeout(function () {
            game.isPause = false;
            console.log("nextStepSignal - timeout");
            game.blueGroup.children.forEach(function (b) {
                b.body.setZeroVelocity();
            })
            game.redGroup.children.forEach(function (b) {
                b.body.setZeroVelocity();
            })
            game.ball.body.setZeroVelocity();

            game.blueCommand = !game.blueCommand;
            if (game.blueCommand) {
                game.blueGroup.forEach(function (b) {
                    b.select.visible = true;
                    b.inputEnabled = true;
                    b.input.useHandCursor = true;
                })
            } else {
                game.redGroup.randomMove();
            }
        }, 1000);
    });
    game.redGroup.randomMove = function () {
        console.log("randomMove");
        var res = getAiAngle(game);        //toRad(Phaser.Math.random(0, 359));
        var b = game.redGroup.children[res.id];
        console.log(b);
        var angle = res.angle;
        var scale = (Math.random() + 1) / 2;
        var time = Math.random() * 4000;
        game.hitArea.x = b.x;
        game.hitArea.y = b.y;
        game.hitArea._scale = game.hitArea.scale.x;
        game.hitArea.visible = true;

        var timeId = game.timeId;
        game.tweent = game.add.tween(game.hitArea).to({rotation: angle, _scale: scale}, time, Phaser.Easing.Sinusoidal.InOut, false);
        var t1 = game.tweent;
        t1.onUpdateCallback(function (s) {
            //console.log(s.target);
            s.target.scale.set(s.target._scale);
        });
        t1.onComplete.add(function () {
            console.log("randomMove complete");
            if (game.timeId != timeId) {
                return;
            }
            console.log('complete')
            game.hitArea.scale.set(scale);
            b.body.rotation = angle;
            console.log('body', toGrad(b.body.rotation))
            setTimeout(function () {
                console.log("randomMove complete timeout");
                if (game.timeId != timeId) {
                    return;
                }
    
                game.hitArea.visible = false;
                console.log('start move');  
                setTimeout(function () {
                    console.log("randomMove complete timeout timeout");
                    if (game.timeId != timeId) {
                        return;
                    }
        
                    game.isMoving = 1;
                    game.stepTimeLeft = game.stepTimeTotal;
                    b.body.moveForward(game.power*scale);
                },0);
            },500)
            game.redGroup.children.forEach(function (b) {
                b.select.visible = false;
            });
        });
        
        
        game.redGroup.children.forEach(function (b) {
            b.select.visible = true;
        });
        t1.start();
        console.log('start')
       
    };
    game.boundRectLT = game.add.sprite(0,0, 'dot');
    game.physics.p2.enable(game.boundRectLT);
    game.boundRectLT.body.setRectangle(60, 194, 30, 97);
    game.boundRectLT.body.static = true;
    game.boundRectLT.rect = new Phaser.Rectangle(0, 0, 60, 194);
    
    game.boundRectRT = game.add.sprite(game.width - 60,0, 'dot');
    game.physics.p2.enable(game.boundRectRT);
    game.boundRectRT.body.setRectangle(60, 194, 30, 97);
    game.boundRectRT.body.static = true;
    game.boundRectRT.rect = new Phaser.Rectangle(game.width - 60, 0, 60, 194);

    game.boundRectT = game.add.sprite(0,0, 'dot');
    game.physics.p2.enable(game.boundRectT);
    game.boundRectT.body.setRectangle(game.width, 60, game.width / 2,  30);
    game.boundRectT.body.static = true;
    game.boundRectT.rect = new Phaser.Rectangle(0, game.height - 60, game.width, 60);
    
    game.boundRectB = game.add.sprite(0,game.height - 60, 'dot');
    game.physics.p2.enable(game.boundRectB);
    game.boundRectB.body.setRectangle(game.width, 60, game.width / 2, 30);
    game.boundRectB.body.static = true;
    game.boundRectB.rect = new Phaser.Rectangle(0, 0, game.width, 60);
    

    game.ty = 60;
    game.by = game.height - 60;
    game.lx = game.leftLine.start.x;
    game.rx = game.rightLine.start.x;

    game.boundRectLB = game.add.sprite(0,game.height - 194, 'dot');
    game.physics.p2.enable(game.boundRectLB);
    game.boundRectLB.body.setRectangle(60, 194, 30, 97);
    game.boundRectLB.body.static = true;
    game.boundRectLB.rect = new Phaser.Rectangle(0, game.height - 194, 60, 194);
   
    game.boundRectRB = game.add.sprite(game.width - 60,game.height - 194, 'dot');
    game.physics.p2.enable(game.boundRectRB);
    game.boundRectRB.body.setRectangle(60, 194, 30, 97);
    game.boundRectRB.body.static = true;
    game.boundRectRB.rect = new Phaser.Rectangle(game.width - 60, game.height - 194, 60, 194);

    
    game.boundRectLGate = new Phaser.Rectangle(0, game.height / 2 - 100, 146, 200);
    game.boundRectRGate = new Phaser.Rectangle(game.width - 146, game.height / 2 - 100, 146, 200);
    



    game.area = area;
    game.hitArea.add(area);
    game.hitArea.add(arrow);
    //game.hitArea.add(select);
    game.hitArea.add(dot);
    game.isMoving = 0;    
    
    game.currentPlayer = null;

    game.ball = game.add.sprite(game.ballCoord.x ,game.ballCoord.y , 'ball');
    game.bradius = game.ball.width / 2;
    game.physics.p2.enable(game.ball);
    game.ball.body.setCircle(game.ball.width / 2);
    game.ball.body.mass = game.ballMass;
    game.ball.body.fixedRotation = true;
    game.ball.body.damping = game.ballDamping;
    /*
    game.canvas.onmousemove = function (t) {
        console.log(t);
        if (!game.currentPlayer) {
            return;
        }
        console.log('move');
    }*/

    game.mouse = new Phaser.Mouse(game);
    //game.mouse.onMouseMove = function () {console.log('m')}
    var idx = 0;
    game.redTeamCoords.forEach((p, id) => {
        
        //    var ball = this.matter.add.image(p.x, p.y, 'pl');
        var ball = game.redGroup.create(p.x, p.y, 'circle50');
        
        ball.id = id;
        ball.idx = id;
        var scale = 1;
        var radius = scale * ball.width / 2;
        if (!game.radius) {
            game.radius = radius;
        }
        ball.scale.set(scale)
        ball.body.setCircle(radius);
        game.physics.p2.enable(ball);
        ball.body.mass = game.mass;
        ball.body.fixedRotation = true;
        ball.body.rotation = rotate(0);
        ball.body.damping = game.damping;
        ball.pwr = game.power;
        ball.anchor.set(0.5,0.5);
        ball.addChild(game.add.sprite(0,0, 'select') );
        ball.select = ball.children[0];
        ball.select.anchor.set(0.5,0.5);
        ball.addChild(game.add.sprite(0, 0, 'redPl'));
        ball.curTexture = ball.children[1];
        ball.curTexture.anchor.set(0.5,0.5);
        ball.select.visible = !game.blueCommand;
        /*ball.events.onInputDown.add(function (self) {

        });
        ball.events.onInputUp.add(function (self) {

        });*/
        return ball;
    });

    
    game.blueTeamCoords.forEach((p, id) => {
        //    var ball = this.matter.add.image(p.x, p.y, 'pl');
        var ball = game.blueGroup.create(p.x, p.y, 'circle50');
        ball.id = id;
        ball.idx = idx+5;
        var scale = 1; // width 50 height 55
        var radius = scale * ball.width / 2;
        if (game.scaleRatio == undefined) {
            game.scaleRatio = game.area.width / ball.width;
        }
        ball.selectTeam = false;
        ball.isSelect = game.blueCommand;
        
        ball.scale.set(scale)
        ball.body.setCircle(radius);
        ball.body.mass = game.mass;
        game.physics.p2.enable(ball);
        ball.body.fixedRotation = true;
        ball.body.rotation = rotate(0);
        
        ball.body.damping = game.dampingP;
        ball.pwr = game.powerP;
        ball.rd = 0;
        ball.anchor.set(0.5,0.5);
        ball.addChild( game.add.sprite(0,0, 'select') );
        ball.select = ball.children[0];
        ball.select.anchor.set(0.5,0.5);
        ball.select = ball.children[0];
        ball.select.anchor.set(0.5,0.5);
        ball.addChild(game.add.sprite(0, 0, 'bluePl'));
        ball.curTexture = ball.children[1];
        ball.curTexture.anchor.set(0.5,0.5);
        ball.select.visible = game.blueCommand;
    
        if (game.blueCommand) {
            ball.inputEnabled = true;
            ball.input.useHandCursor = true;
        }



        ball.events.onInputDown.add(function (self) {
            console.log('down')
            game.hitArea.x = ball.x;
            game.hitArea.y = ball.y;
            game.hitArea.visible = true;
            game.currentPlayer = self;
            
        });
        ball.events.onInputUp.add(function (self) {
            console.log('up')
            self.body.rotation = game.hitArea.rotation;
            setTimeout(function () {
                game.isMoving = 1;
                game.stepTimeLeft = game.stepTimeTotal;
                self.body.moveForward(game.powerP * game.hitArea.scale.x);
            }, 0)
            game.currentPlayer = null;
            game.hitArea.visible = false;
            game.blueGroup.forEach(function (b) {
                b.select.visible = false;
                b.inputEnabled = false;
                b.input.useHandCursor = false;
            })
        });
        
        return ball;
    });

    game.group = [];
    game.group = game.group.concat(game.redGroup.children); 
    game.group = game.group.concat(game.blueGroup.children);

    console.log(game.group);

    game.gateL = game.add.sprite(0,253,'gate');
    game.gateL.anchor.set(1,0.5);
    game.gateL.scale.set(-1,1);
    game.gateR = game.add.sprite(game.width-3,253,'gate');
    game.gateR.anchor.set(1,0.5);

    game.goal = game.add.sprite(game.centerLine.start.x, game.height / 2,'goal');
    game.goal.anchor.set(0.5,0.5);
    game.goal.visible = false;

    game.win = game.add.sprite(game.centerLine.start.x, game.height / 2,'win');
    game.win.anchor.set(0.5,0.5);
    game.win.visible = false;

    game.fall = game.add.sprite(game.centerLine.start.x, game.height / 2,'fall');
    game.fall.anchor.set(0.5,0.5);
    game.fall.visible = false;

    game.traectories = [];
    getAiAngle(game);
    
    game.setParam = function () {
        game.ball.body.mass = game.ballMass;
        game.ball.body.damping = game.damping;
        game.redGroup.children.forEach(function (b) {
            b.body.mass = game.mass;
            b.body.damping = game.ballDamping;
        });
        game.blueGroup.children.forEach(function (b) {
            b.body.mass = game.massP;
            b.body.damping = game.dampingP;
        });

        game.angleSectors = game.angleSectorsString.replace(/\s/g, '').split(',');
        console.log(game.angleSectors);
    }

    game.restart = function () {
        game.initGame();
        game.blueCommand = Math.random() < 0.5 ? true : false;
        game.isMoving = 0;
        game.isRestarted = true;
        game.hitArea.visible = false;
        game.win.visible = false;
        game.fall.visible = false;
        game.goal.visible = false;
        if (game.tweent) {
            game.tweent = null;
        }
        game.freeze();
        game.blueGroup.children.forEach(function (b) {
            b.select.visible = false;
        });
        game.redGroup.children.forEach(function (b) {
            b.select.visible = false;
        });
        game.nextTime(game.blueCommand);
    }

    game.guiLevel = gui.addFolder('Параметры');
    var guiLevel = game.guiLevel;
    guiLevel.add(game, 'power', 0, 4000).name('Сила');
    guiLevel.add(game, 'powerP', 0, 4000).name('СилаИгрока');
    guiLevel.add(game, 'mass', 1, 100).name('Масса');
    guiLevel.add(game, 'massP', 1, 100).name('МассаИгрока');
    guiLevel.add(game, 'ballMass', 1, 100).name('Масса мяча');
    guiLevel.add(game, 'damping', 0, 1).name('Сопротивление');
    guiLevel.add(game, 'ballDamping', 0, 1).name('Сопротивление мяча');
    guiLevel.add(game, 'speedOut', 1, 15).name('СкоростьВылета');
    guiLevel.add(game, 'angleSectorsString').name('УглыAI');
    guiLevel.add(game, 'setParam').name('Применить параметры');
    guiLevel.add(game, 'stepTimeLeft').name('Время');
    guiLevel.add(game, 'restart').name('Restart');
    
    guiLevel.open();

    if (!game.blueCommand) {
        setTimeout(function () {
            game.redGroup.randomMove();
        },500)
    }
}


function update() {
    //console.log(game.time.time);
    var dt = game.time.time - game._stepTimeLeft;
   
    if (game.updateDisplay <= 0) {
        game.updateDisplay = 500;
        game.guiLevel.updateDisplay();
    }
    //  only move when you click
    if (game.input.mousePointer.isDown)
    {
        if (!game.currentPlayer) {
            return;
        } else { // hit area - rotation and pwr
            var cp = game.currentPlayer;
            var distance = Math.abs(getLength(cp.x, cp.y, game.input.mousePointer.x, game.input.mousePointer.y));
            var rad = getAngle(cp.x, cp.y, game.input.mousePointer.x, game.input.mousePointer.y);
            //console.log(rad);
            //var r = Math.abs(game.hitArea.width / 2);
            //var scale = 1;
            cp.oldrd = cp.rd;
            //cp.rd = Math.abs(distance - cp.rd) < 5 ? cp.rd : distance;
            if (distance <= 1) {
                //cp.scale.set(0.01);
                game.hitArea.scale.set(0.01);
            } else if (distance <= game.area.width / 2) {
                /* if (cp.oldrd != cp.rd) {
                    scale = cp.rd / r;
                    game.hitArea.scale.set(scale); 
                } */
                scale = distance / (game.area.width / 2);
                //scale = scale > 1 ? 1: scale;
                //console.log(scale);
                game.hitArea.scale.set(scale);
            };
            game.hitArea.rotation = rad;
        }
    }

    if (game.isMoving > 0) {
        testMotion();
    } else {
        game.stepTimeLeft -= dt;
        game._stepTimeLeft = game.time.time;
        if (game.isPause == false || dt > game.stepTimeTotal) {
            game.updateDisplay -= dt;
        }

        if (game.stepTimeLeft <= 0 && !game.isGameOver) {
            game.timeId = game.time.time;
            game.isGameOver = true;
            //game.stepTimeLeft = game.stepTimeTotal;
            //game.fallStrikeSignal.dispatch();

            game.gameOverSignal.dispatch();
            game.guiLevel.updateDisplay();
            console.log('time');
        }
    }
    
}

function testMotion () {
    var ism = moveDetect();
    if (ism) {
        //console.log('isMoving', game.isMoving);
        if (game.isMoving == 1) {
            game.isMoving = 2;
        }
    } else {
        if (game.isMoving == 2) {
            game.isMoving = 0;
            console.log('endmove');
            console.log('isMoving', game.isMoving);
            
            var bl = game.blueGroup.children.filter(b => {
                return b.x < game.leftLine.start.x + b.width/2;
                //return Phaser.Rectangle.intersects(game.boundRectLGate, b);
            });
            var rl = game.redGroup.children.filter(b => {
                return b.x < game.leftLine.start.x + b.width/2;
                //return Phaser.Rectangle.intersects(game.boundRectLGate, b);
            });
            var br = game.blueGroup.children.filter(b => {
                return b.x > game.rightLine.start.x - b.width/2;
                //return Phaser.Rectangle.intersects(game.boundRectRGate, b);
            });
            var rr = game.redGroup.children.filter(b => {
                return b.x > game.rightLine.start.x - b.width/2;
            });
            game.nextStepSignal.dispatch({
                bl, br, rl, rr
            });
        }
    }
    
  


    /*if ( ) {
        console.log('moving');
        if (game.isMoving == 1) {
            game.isMoving = 2; 
        }
    } else {
        if ( game.isMoving == 1 ) {
            game.isMoving = 0;
            console.log('end move');
            game.nextStepSignal.dispatch();
        } 
    }*/
}

function moveDetect () {
    //game.ball;
//    game.redGroup.children;
  //  game.blueGroup.children;
    
    var ism = Math.abs(game.ball.body.velocity.x > 1) || Math.abs(game.ball.body.velocity.y) > 1
    ism  = ism || game.redGroup.children.some(b => Math.abs(b.body.velocity.x > 1) || Math.abs(b.body.velocity.y) > 1);
    ism  = ism || game.blueGroup.children.some(b => Math.abs(b.body.velocity.x > 1) || Math.abs(b.body.velocity.y) > 1);

    if (ism) {
        console.log('move');
    } /* else if (!ism && game.isMoving == 1) {
        console.log('move ismoving');
        ism = true;
    } */
    
    if (game.ball.body.x < game.leftLine.start.x && game.ball.y < game.height / 2 + 100 && game.ball.y > game.height / 2 - 100 ) {
        game.isMoving = 0;
        if (game.firstPanch) {
            game.fallStrikeSignal.dispatch();
        } else {
            game.isGoal = true;
            game.goalSignal.dispatch(false);
        }
    } else if (game.ball.body.x > game.rightLine.start.x && game.ball.y < game.height / 2 + 100 && game.ball.y > game.height / 2 - 100 ) {
        game.isMoving = 0;
        if (game.firstPanch) {
            game.fallStrikeSignal.dispatch();
        } else {
            game.isGoal = true;
            game.goalSignal.dispatch(true);
        }
    }

    return ism;
}


function render() {
    game.debug.geom(game.centerLine);
    game.debug.geom(game.leftLine);
    game.debug.geom(game.rightLine);

  /*   game.debug.geom(game.boundRectLT.rect);
    game.debug.geom(game.boundRectRT.rect);
    game.debug.geom(game.boundRectT.rect);
    game.debug.geom(game.boundRectB.rect);
    game.debug.geom(game.boundRectLB.rect);
    game.debug.geom(game.boundRectRB.rect);


    game.debug.geom(game.boundRectLGate)
    game.debug.geom(game.boundRectRGate) */
    //game.debug.text("Drag the handles", 100, 550);
    game.traectories.forEach(function (t) {
        game.debug.geom(t);
    })
}


function tg(deg) {
    var rad = Math.PI * deg / 180;
    return Math.tan(rad);
}

function inrange(x, x0, x1) {
    var b = Math.min(x0, x1);
    var f = Math.max(x0, x1);
    if (b <= x && x <= f) {
        return true;
    }
    return false;
}

function cos(deg) {
    var rad = Math.PI * deg / 180;
    return Math.cos(rad)
}

function sin(deg) {
    var rad = Math.PI * deg / 180;
    return Math.sin(rad)
}

function tan(deg) {
    var rad = Math.PI * deg / 180;
    return Math.tan(rad)
}

function tanc(x1, x, y1, y) {
    return (y1 - y) / (x1 - x);
}

function atan(t) {
    var rad = Math.atan(t);
    return 180 * rad / Math.PI;
}

function sign(x) {
    if (x > 0) {
        return 1;
    } else if (x < 0) {
        return -1;
    } else {
        return 0;
    }
}

function getLength(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function toRad (deg) {
    return   Math.PI * deg / 180;
}
function toGrad (rad) {
    return rad * 180 / Math.PI;
}

function getAngle (x1, y1, x2, y2) {
    var angle = 0;
    if (x1 == x2) {
        if (y2 < y1)  {
            angle = 0;
        } else {
            angle = Math.PI;
        }
    } else if (y1 == y2) {
        if (x1 < x2) {
            angle = Math.PI / 2;
        } else {
            angle = 3 * (Math.PI / 2);
        }
    } else {
        angle = Math.atan((y2 - y1) / (x2 - x1));
    }
    if (x1 > x2) {
        angle  = angle + (Math.PI / 2);
    } else {
        angle  = angle - (Math.PI / 2);
    }
    return angle;
}