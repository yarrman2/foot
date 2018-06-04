
var game;


window.onload = function () {

};
var width = 800;
var height = 600;
var balls = [];
var config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    //canvas: 'canvas',
    backgroundColor: '#1d1d1d',
    parent: 'parent',
    physics: {
        default: 'matter',
        matter: {
            //debug:true,
            //enableSleeping: true,
            gravity: {
                y: 0
            }
        }
    },
    scene: {
        preload: preload,
        create: create,

    }
};

game = new Phaser.Game(config);
var pin;

game.gen = function () {
    console.log(this);
    var ball = this.matter.add.image(Phaser.Math.Between(100, 700), Phaser.Math.Between(0, 600), 'ball');
}

function preload() {
    this.load.image('pl', 'pangball.png');
    this.load.image('ball', 'ball.png');
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

var DegToRad = Phaser.Math.DegToRad;
function cos (deg) {
    var rad = Math.PI * deg / 180; 
    return Math.cos(rad)
}
function sin (deg) {
    var rad = Math.PI * deg / 180; 
    return Math.sin(rad)
}

function tan (deg) {
    var rad = Math.PI * deg / 180; 
    return Math.tan(rad)
}

function atan (t) {
    var rad = Math.atan(t);
    return 180 * rad / Math.PI;
}

function sign (x) {
    if (x > 0) {
        return 1;
    } else if (x < 0) {
        return -1;
    } else {
        return 0;
    }
}

function getLength (x1,y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}


function create() {
    this.matter.world.setBounds(0, 0, 800, 600, 1, true, true, true, true);
    var btw = Phaser.Math.Between;
    //  Add in a stack of balls

    var self = this;    

    

    var pointsCoord = [
        {x: 400, y: 300},
    ]
    var ballCoord = {x: 600,  y:300};
    var angle = -45;

    pin = this.add.sprite(50, 50, 'pl');
    pin.setTint(0xff00ff);
    
    var graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00aa00 } });
    

    balls = pointsCoord.map(p => {
        var ball = this.matter.add.image(p.x, p.y, 'pl');
        ball.setCircle();
        ball.setScale(3);
        ball.setFriction(0.005);
        ball.setBounce(1);
        ball.setInteractive();
        ball.on('pointerup', function () {
            if (this.init === undefined ) {
                this.init = 0;
            };

            var nextLine = (angle, x, y) => {
                var length = 2600;
                var x1 = x+(length*cos(angle));
                var y1 = y+(length*sin(angle));
                var w2 = this.width / 2 ;
                var h2 = this.height / 2;
                w2 *= 3;
                h2 *= 3;

                var W = width - w2;
                var H = height - h2;
                
                dir = [sign(sin(angle)), sign(cos(angle))];
                nextdir = [dir[0], dir[1]];

                var isUp  = dir[0] > 0;
                var isRight = dir[1] > 0;
                var tanDiagon = (x0,y0,x2,y2) => x2 != 0 ? (y2 - y0) / (x2 - x0) : Number.max;
                var tn = tan(angle);
                var ang = angle;
                if (isUp && isRight) {
                    var td = tanDiagon(x,y,W, H);
                    if (tn > td) {
                        x1 = ((H - y) / tn) + x;
                        y1 = H;
                        ang = -angle;    
                    } else {
                        y1 = (W - x) * tn + y;
                        x1 = W; 
                        ang = 90 + ang;
                    }
                }
                if (!isUp && isRight) {
                    var td =  tanDiagon(x, y, W, h2);
                    if (tn < td) {
                        x1 = (h2 - y + (x * tn)) / tn;
                        y1 = h2;
                        ang = -ang;
                    } else {
                        y1 = tn * W + y
                        x1 = W; 
                        ang = -1 * (90 + ang);
                    }
                }
                if (isUp && !isRight) {
                    var td = tanDiagon(x, y, w2, H);
                    if (tn < td) {
                        x1 = (H - y + tn * x) / tn;
                        y1 = H;
                        ang = -ang;
                    } else {
                        y1 = y - tn * x;
                        x1 = w2;
                        ang = -ang;
                    }
                }
                if (!isUp && !isRight) {
                    var td = tanDiagon(x, y, w2, h2);
                    var tn180 = tan (180 - Math.abs(ang));
                    if (tn > td) {
                        x1 = (tn180 * x - y) / tn180;
                        y1 = h2;
                        ang = -1 * (180 + ang);
                    } else {
                        y1 = (w2 - x + tn * y) / tn;
                        x1 = w2;
                        ang = -(180+ang);
                    }
                }
                return {x, y, x1, y1, ang, dir:dir, nextdir:nextdir};    
            }

            console.log(this.init)
            if (this.init === 0) {
                this.init = 1;


                this.traectory = [];    
                var self = this;
                var ltmp = null;
                for (let i = 0; i < 4; i ++){
                    (function(i) {
                        let l;
                        if (ltmp) {
                            l = nextLine(ltmp[i-1].ang, ltmp[i-1].x1, ltmp[i -1].y1);    
                        } else {
                            ltmp = [];
                            l = nextLine(angle, self.x, self.y);
                        }
                        ltmp[i] = l;
                        l.tg = (l.y1 - l.y)/(l.x1 - l.x);
                        console.log(l);
                        self.traectory.push(new Phaser.Geom.Line(l.x, l.y, l.x1, l.y1));
                    })(i);
                }


                /* var l1 = nextLine(angle, this.x, this.y);
                console.log(l1);
                var ang = l1.ang;        
                var l2 = nextLine(ang, l1.x1, l1.y1);
                console.log(l2);
                ang = l2.ang;
                var l3 = nextLine(ang, l2.x1, l2.y1);    
                ang = l3.ang;
                console.log(l3);
                var l4 = nextLine(ang, l3.x1, l3.y1);    
                ang = l4.ang;
                console.log(l4); */

                this.vel = [cos(angle), sin(angle)];
                console.log(this.vel);
                /*this.traectory = [
                    [new Phaser.Geom.Line(this.x, this.y, l1.x1, l1.y1)],
                    [new Phaser.Geom.Line(l1.x1, l1.y1, l2.x1, l2.y1)],
                    [new Phaser.Geom.Line(l2.x1, l2.y1, l3.x1, l3.y1)],
                    [new Phaser.Geom.Line(l3.x1, l3.y1, l4.x1, l4.y1)],
                ];*/
                this.traectory.forEach(l => {
                    graphics.strokeLineShape(l);
                });
                
            } else if (this.init === 1) {
                this.init = 2;
                this.pwr = 30;
                this.setVelocity(this.pwr * this.vel[0],  this.pwr * this.vel[1])   
            }
        });
        
        return ball;
    })

   /*  var ball = this.matter.add.image(ballCoord.x, ballCoord.y, 'ball')
    ball.setCircle();
    ball.setScale(0.8);
    ball.setFriction(0.005);
    ball.setBounce(1); */



   /* function createBall() {
        var ball = self.matter.add.image(Phaser.Math.Between(100, 700), Phaser.Math.Between(0, 600), 'ball');
        ball.setCircle();
        ball.setScale(3);
        ball.setFriction(0.005);
        ball.setBounce(1);
        ball.setInteractive();
        ball.on('pointerdown', function (p, go) {
            console.log(self);
            //self.setVelocity(btw(-25,25), btw(-25, 25));
            pin.x = self.x;
            pin.y = self.y;
        })
        
        ball.on('pointermove', function () {

        }) 

        self.input.setDraggable(ball);
        balls[i] = ball;
    }   */


    /*for (var i = 0; i < 10; i++) {
        createBall();
        //ball.setVelocity(btw(-25,25), btw(-25, 25));
    }*/
    /*
    
    */
}
