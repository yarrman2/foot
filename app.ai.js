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
    game.load.image('pl', 'pangball.png');
    game.load.image('ball', 'ball.png');


}

function create() {

    //  Enable p2 physics
    game.physics.startSystem(Phaser.Physics.P2JS);

    game.stage.backgroundColor = '#12418400';

    game.physics.p2.gravity.y = 0;
    game.physics.p2.restitution = 1;

    game.centerLine = new Phaser.Line(game.width/2, (game.height - 405) / 2, game.width/2, (game.height - 405) / 2 + 405);

    var pointsCoord = [
        {
            x: 400,
            y: 300
        },
        /*{
            x: 600,
            y: 450
        },*/
        
        {
            x: 600,
            y: 150
        },
        /*{
            x: 200,
            y: 150
        },*/
        /*{
            x: 200,
            y: 500
        },*/
    ]
    var ballCoord = {
        x: 600,
        y: 300
    };
    var angle = 150;
    var length = 2200

    window.group = game.add.physicsGroup(Phaser.Physics.P2JS);
    game.traectory = [];
    pointsCoord.forEach((p, id) => {
        //    var ball = this.matter.add.image(p.x, p.y, 'pl');
        var ball = group.create(p.x, p.y, 'pl');
        ball.id = id;
        var scale = 3;
        var radius = scale * ball.width / 2
        ball.scale.set(scale)
        ball.body.setCircle(radius);
        game.physics.p2.enable(ball);
        ball.body.fixedRotation = true;
        ball.body.rotation = rotate(angle);
        ball.body.damping = 0.7;
        ball.pwr = 2500;
        ball.inputEnabled = true;
        ball.input.useHandCursor = true;

        ball.events.onInputUp.add(function (self) {

            if (self.init === undefined) {
                self.init = 0;
            };

            var ids = [];

            var findNormal = (l, id) => {
                var balls = group.filter(i => {
                   return i.id != id && ids.indexOf(i.id) == -1;
                }).list;

                var normals = [];
                var norms = [];
                balls.forEach(b => {
                    var k = tan(l.curang);
                    var a1;
                    if (k == 0) {
                        var x0 = b.x;
                        var y0 = l.y;
                        var k1 = 0;
                        var c1 = l.y;
                    } else {
                        a1 = atan(k) - 90;
                        var k1 = tan(a1);
                        var c = l.y - k * l.x;
                        var c1 = b.y - k1 * b.x;
                        var x0 = (c1 - c) / (k - k1);
                        var y0 = k1 * x0 + c1;
                    }

                    console.log(b.id, b.x, b.y, x0, y0, a1);
                    var len = getLength(b.x, b.y, x0, y0);
                    if (inrange(x0, l.x, l.x1) && len < 2 * radius) {
                        console.log(b.id, true);
                        normals.push(new Phaser.Line(b.x, b.y, x0, y0));
                        var l1 = Math.sqrt((2 * radius) ** 2 - len ** 2);
                        var dy = sin(atan(k)) * l1;
                        var dx = cos(atan(k)) * l1;
                        if (x0 < b.x) {
                            var x1 = x0 + dx;
                        } else {
                            var x1 = x0 - dx;
                        }

                        if (y0 < b.y) {
                            var y1 = y0 + dy;
                        } else {
                            var y1 = y0 - dy;
                        }
                        var vec = new Phaser.Line(b.x, b.y, x1, y1);
                        var tn = tanc(b.x, x1, b.y, y1);
                        var ang =  atan(tn);
                        if (l.curang > 90) {
                            ang = 180 + ang;
                        } else if (l.curang < -90) {
                            ang = -180 - ang;
                        }
                        if (l.curang > ang) {
                            var ang2 = ang + 90;
                        } else {
                            var ang2 = ang - 90;
                        }
                        norms.push({
                            x:b.x, 
                            y:b.y, 
                            x1:x1, 
                            y1:y1,
                            len: getLength(b.x, b.y, x1, y1),
                            tn,
                            ang,
                            vec,
                            ang2,
                        });
                    }
                });

                var normmin = norms.reduce((acc, n) => {
                    if (acc == -1) {
                        return n.len;
                    } else {
                        if (n.len < acc) {
                            return n.len
                        }
                    }
                    return acc;
                }, -1);



                var newtracks = norms.filter(n => n.len == normmin);
                //TODO add angle

                //new Phaser.Line(b.x, b.y, x1, y1)
                return {
                    newtracks
                };
            }

            var nextLine = (angle, x, y, iter) => {
                var x1, y1;
                var w2 = self.width / 2;
                var h2 = self.height / 2;
                //w2 *= 3;
                //h2 *= 3;

                var W = game.width - w2;
                var H = game.height - h2;

                dir = [sign(sin(angle)), sign(cos(angle))];
                nextdir = [dir[0], dir[1]];

                var isUp = dir[0] > 0;
                var isRight = dir[1] > 0;
                var tanDiagon = (x0, y0, x2, y2) => x2 != 0 ? (y2 - y0) / (x2 - x0) : Number.max;
                var tn = tan(angle);
                var ang = angle;
                var block;
                if (isUp && isRight) {
                    var td = tanDiagon(x, y, W, H);
                    if (tn > td) {
                        x1 = ((H - y) / tn) + x;
                        y1 = H;
                        ang = -ang;
                        block = '1_1'
                    } else {
                        y1 = (W - x) * tn + y;
                        x1 = W;
                        ang = 180 - ang;
                        block = '1_2'
                    }
                }
                if (!isUp && isRight) {
                    var td = tanDiagon(x, y, W, h2);
                    if (tn < td) {
                        x1 = (h2 - y + (x * tn)) / tn;
                        y1 = h2;
                        ang = -ang;
                        block = '2_1'
                    } else {
                        y1 = y + tn * (W - x);
                        x1 = W;
                        ang = -(180 + ang);
                        block = '2_2'
                    }
                }
                if (isUp && !isRight) {
                    var td = tanDiagon(x, y, w2, H);
                    if (tn < td) {
                        x1 = (H - y + tn * x) / tn;
                        y1 = H;
                        ang = -ang;
                        block = '3_1'
                    } else {
                        y1 = y + tn * (w2 - x);
                        x1 = w2;
                        ang = 180 - ang;
                        block = '3_2'
                    }
                }
                if (!isUp && !isRight) {
                    var td = tanDiagon(x, y, w2, h2);
                    var tn180 = tan(180 - Math.abs(ang));
                    if (tn > td) {
                        x1 = (tn * x - y + h2) / tn;
                        y1 = h2;
                        ang = -ang;
                        block = '4_1'
                    } else {
                        y1 = y + tn * (w2 - x);
                        x1 = w2;
                        ang = -(180 + ang);
                        block = '4_2'
                    }
                }
                return {
                    x,
                    y,
                    x1,
                    y1,
                    ang,
                    curang: angle,
                    block
                };
            }

            console.log(self.init)
            if (self.init === 0) {
                self.init = 1;
                game.traectory = [];
                var len = 400; //length;
                var i = 0;
                function  createTraectory (b, layer) {
                    var ltmp = null;
                    var {
                        ang,
                        x,
                        y,
                        len
                    } = { ...b};
                    let l;
                    if (ltmp) {
                        l = nextLine(ltmp[i - 1].ang, ltmp[i - 1].x1, ltmp[i - 1].y1, i);
                    } else {
                        ltmp = [];
                        l = nextLine(ang, x, y, i);
                    }
                    ltmp[i] = l;
                    l.tg = (l.y1 - l.y) / (l.x1 - l.x);
                    l.tgreal = ltmp[i - 1] ? tan(ltmp[i - 1].ang) : 0;
                    l.length = getLength(l.x, l.x1, l.y, l.y1);
                    console.log(i, l);
                    
                    var res;
                    if (layer < 3 && len > 0) {
                        res = findNormal(l, id);
                        if (res.newtracks.length == 0) {
                            len -= l.length;
                            game.traectory.push(new Phaser.Line(l.x, l.y, l.x1, l.y1));
                        }
                        if (res && res.newtracks.length > 0) {
                            res.newtracks.forEach(b => {
                                game.traectory.push(new Phaser.Line(l.x, l.y, b.x1, b.y1));
                                var len1 = (len - getLength(l.x,l.y, b.x1,b.y1)) * Math.abs(cos(b.ang)); 
                                createTraectory({
                                    ang:b.ang,
                                    x:b.x,
                                    y:b.y,
                                    len:  len1
                                }, layer+1);
                                var len2 = (len - getLength(l.x,l.y, b.x1,b.y1)) * Math.abs(cos(b.ang2)); 
                                createTraectory({
                                    ang:b.ang2,
                                    x:b.x1,
                                    y:b.y1,
                                    len:  len2
                                }, layer+1);
                            });
                        } else {
                            createTraectory({
                                ang:l.ang,
                                x:l.x1,
                                y:l.y1,
                                len
                            }, layer+1)
                        }
                    } else {
                        game.traectory.push(new Phaser.Line(l.x, l.y, l.x1, l.y1));
                    }
                }

                createTraectory({
                    ang: angle,
                    x: self.x,
                    y: self.y,
                    len: len
                }, 0);

                /*while (len > 0) {
                    (function (i) {
                        let l;
                        if (ltmp) {
                            l = nextLine(ltmp[i - 1].ang, ltmp[i - 1].x1, ltmp[i - 1].y1, i);
                        } else {
                            ltmp = [];
                            l = nextLine(angle, self.x, self.y, i);
                        }
                        ltmp[i] = l;
                        l.tg = (l.y1 - l.y) / (l.x1 - l.x);
                        l.tgreal = ltmp[i - 1] ? tan(ltmp[i - 1].ang) : 0;
                        l.length = getLength(l.x, l.x1, l.y, l.y1);
                        len -= l.length;
                        set.add(l.block);
                        console.log(i, l);
                        game.traectory.push(new Phaser.Line(l.x, l.y, l.x1, l.y1));
                        var res = findNormal(l, id);
                        res.newtracks.forEach(b => {
                            nextLine(b.angle, b.x, b.y, i)
                        });
                    })(i);
                    i++;
                }*/
                self.vel = [cos(angle), sin(angle)];
                console.log(self.vel);
                /*self.traectory = [
                    [new Phaser.Geom.Line(self.x, self.y, l1.x1, l1.y1)],
                    [new Phaser.Geom.Line(l1.x1, l1.y1, l2.x1, l2.y1)],
                    [new Phaser.Geom.Line(l2.x1, l2.y1, l3.x1, l3.y1)],
                    [new Phaser.Geom.Line(l3.x1, l3.y1, l4.x1, l4.y1)],
                ];*/
                /*self.traectory.forEach(l => {
                    line = new Phaser.Line(l.x, l.y, l.x1, l.y1);
                });*/

            } else if (self.init === 1) {
                self.init = 2;
                self.body.rotation = rotate(angle);
                self.body.moveForward(self.pwr);
                //this.setVelocity(this.pwr * this.vel[0],  this.pwr * this.vel[1])   
            }
        });

        return ball;
    });



    /*window.group = game.add.physicsGroup(Phaser.Physics.P2JS);

    for (var i = 0; i < 1; i++)
    {
        var ball = group.create(400, 300, 'ball');
        ball.body.setCircle(60);
        game.physics.p2.enable(ball);
        ball.body.fixedRotation = true;
        ball.body.rotation = rotate(-45);
        ball.body.damping = 0.2;
        ball.body.moveForward(1500);
        console.log(ball)
    }

    line = new Phaser.Line(300, 100, 500, 500);
    */

}

function update() {

    // line.rotate(1, true);


}

function render() {
    game.traectory.forEach(l => {
        game.debug.geom(l);
    })
    game.debug.geom(game.centerLine);

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