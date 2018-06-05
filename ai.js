// ver. 4
/**
 * От мяча прямой до центра ворот.
 * Точка пересечения игроков и мяча
 * Вибирает минимальный угол до мяча
 * Убирает траектории между мячом и игроком, которые пересекают других игроков
 * */

// проверить пересечение траектории мяча до ворот и игроков
// TODO разработать альтернативные маршруты
// отскок от вернего и нижнего борта
// TODO отскок от игроков
// TODO отскок от правого борта
// проверка на вылет точки пересечения траекторий

function getAiAngle(game) {
    var gys = [];
    var gy0 = Math.floor(194 + game.bradius);
    var gy1 = Math.floor(game.height - (194 + game.bradius));
    for (var i = gy0; i <= gy1; i++) {
        gys[i - gy0] = i;
    }
    //console.log(gys);
    var result = [];
    game.traectories = [];
    for (var i = 0; i<gys.length; i++) {
        //if (i != 10) continue;
        result.push( (function (gy) {
            var gx = game.leftLine.start.x;
            //var gy = game.height / 2;
            var bx = game.ball.x;
            var by = game.ball.y;
       
            var bradius = game.bradius;
            var pradius = game.radius;
            var r = bradius + pradius;

            console.log('ai');

            // по прямой
            var btrs = [];

            var coord = continueLine(gx, gy, bx, by, 2);
            btrs.push([{
                x: gx,
                y: gy,
                x1: bx,
                y1: by,
                x2: coord.x,
                y2: coord.y
            }]);

            var ty = game.ty;
            var bty = game.by;

            // от верхнего борта 
            var res = (function () {
                var l = bx - gx;
                var g = gy - ty;
                var b = by - ty;
                var bx1 = gx + ((g * l) / (g + b));

                var angb = Phaser.Math.angleBetween(bx, by, bx1, ty);
                var t = tanc(bx1, bx, ty, by);

                var dy = (r) * Math.sin(angb);
                var dx = (r) * Math.cos(angb);
                var bx2 = bx - dx;
                var by2 = by - dy;

                return {
                    x: gx,
                    y: gy,
                    x1: bx1,
                    y1: ty,
                    x2: bx,
                    y2: by
                }
            })();

            coord = continueLine(res.x1, res.y1, res.x2, res.y2,2);
            //console.log(coord);
            btrs.push(
                [{
                        x: res.x,
                        y: res.y,
                        x1: res.x1,
                        y1: res.y1,
                    },
                    {
                        x: res.x1,
                        y: res.y1,
                        x1: bx,
                        y1: by,
                        x2: coord.x,
                        y2: coord.y,
                    }
                ]
            );



            // от нижнего борта

            var res = (function () {

                var l = bx - gx;
                var g = bty - gy;
                var b = bty - by;
                var bx1 = gx + ((g * l) / (g + b));
                var angb = Phaser.Math.angleBetween(bx, by, bx1, ty);
                var t = tanc(bx1, bx, ty, by);

                var dy = (r) * Math.sin(angb);
                var dx = (r) * Math.cos(angb);
                var bx2 = bx - dx;
                var by2 = by - dy;

                return {
                    x: gx,
                    y: gy,
                    x1: bx1,
                    y1: bty,
                    x2: bx,
                    y2: by
                }
            })();

            coord = continueLine(res.x1, res.y1, res.x2, res.y2,2);
            //console.log(coord);
            btrs.push(
                [{
                        x: res.x,
                        y: res.y,
                        x1: res.x1,
                        y1: res.y1,
                    },
                    {
                        x: res.x1,
                        y: res.y1,
                        x1: bx,
                        y1: by,
                        x2: coord.x,
                        y2: coord.y,
                    }
                ]
            );

            var angles = [];
            btrs.forEach(function (btr, _count) {
                //if(_count != 0) return;
                var isCanTr = true;
                btr.forEach(function (t) {
                    //traectory test
                    //game.traectories.push(new Phaser.Line(t.x, t.y, t.x1, t.y1));
                    var t = findNormal({
                        x: t.x,
                        y: t.y,
                        x1: t.x1,
                        y1: t.y1,
                        curang: toGrad(Phaser.Math.angleBetween(t.x, t.y, t.x1, t.y1))
                    }, -1, bradius);
                    if (t.newtracks.length > 0) {
                        isCanTr = false;
                    }
                });
                btr.forEach(function (t) {
                    if (isCanTr) {
                        game.traectories.push(new Phaser.Line(t.x, t.y, t.x1, t.y1));
                    }
                });
                var tlast = btr[btr.length - 1];
                // var t = findNormal({x:b.x, y:b.y, x1:bx1, y1:by1, curang: toGrad(ang)}, b.idx, pradius);
                var x1 = tlast.x2;
                var y1 = tlast.y2;
                var angs = game.redGroup.children.map(function (b, idx) {
                    var ang = 180;
                    var p1 = new Phaser.Point(x1, y1);
                    var p2 = new Phaser.Point(b.x, b.y);
                    ang = Phaser.Math.angleBetweenPoints(p1, p2);
                    var t = findNormal({
                        x: b.x,
                        y: b.y,
                        x1: x1,
                        y1: y1,
                        curang: toGrad(ang)
                    }, b.idx, pradius);
                    var isCan = false;
                    if (t.newtracks.length == 0 && infield(x1, y1)) {
                        console.log(p1, p2)
                        if (true || isCanTr) {
                            game.traectories.push(new Phaser.Line(b.x, b.y, x1, y1));
                        }
                        isCan = true;
                    }
                    return {
                        ang,
                        x: b.x,
                        y: b.y,
                        nearest: Math.abs(bx - b.x),
                        id: b.id,
                        isCan,
                        isCanTr
                    };
                });
                angles = angles.concat(angs);

            });
            angles = angles.filter(function (a) {
                return a.ang != 0;
            });
            //var idx = Math.floor(Math.random() * angles.length) ;
            //var a = angles[idx];


            /* 
            var aCan = angles.reduce(function (acc, a) {
                if  ( (Math.abs(a.ang) < toRad(90) || a.nearest < acc.nearest) && Math.abs(a.ang) < Math.abs(acc.ang) && a.isCan && a.isCanTr) {
                    return a;
                }
                    return acc;
                }
            , {
                ang: 10,
                nearest: 3000,
                id: -1
            });

            var a = angles.reduce(function (acc, a) {
                if (Math.abs(a.ang) < Math.abs(acc.ang)) {
                    return a;
                }
                return acc;
            }, {
                ang: 10,
                nearest: 3000
            });
            a.isCan = false;
            if (aCan.id !== -1) {
                a = aCan;
                a.isCan = true;
            }
            var angle = a.ang; */
            var isCan = false;
            if (angles.some(function (a) {
                return a.isCan && a.isCanTr;
            })){
                isCan = true;
                angles = angles.filter(function (a) {
                    return a.isCan && a.isCanTr;
                }); 
            }

            anglse = angles.map(function (a) {
                a.isCan = isCan;
            })

            return angles;

            /* return {
                angle: angle,// - Math.PI / 2,
                id: a.id,
                isCan: a.isCan
            } */
        })(gys[i]));
    }
    
    var ress = [];
    result.forEach(function (r) {
        r.forEach(function (it) {
            ress = ress.concat(it);
        })
    });

    result = ress;
    var isCan = result.some(function (a) {
        return a.isCan;
    })
    if (isCan) {
        result = result.filter(function (a) {
            return a.isCan;
        });
    }

    
    var angleSectors = game.angleSectors.map(function (a) {return toRad(a)});
    console.log(result);
    result = splitArray(result, angleSectors , 'ang');
    console.log(result);
    if (game.firstPanch) {
        //var id = Math.floor(Math.random() * 4) + 1;
        result = result.filter(function (r) {
            return r.id == 1 || r.id == 2;
        })    
    }
   /*  if (game.firstPanch) {
        var idx = Math.floor(Math.random() * result.length);
        var res = result[idx];
    } else {
        var res = result.reduce(function (acc, a) {
            if (Math.abs(a.angle) < Math.abs(acc.angle)) {
                return a;
            }
            return acc;
        }, {angle:Math.PI});
    } */
    
    var res = result[0];
    
    res.angle = res.ang - Math.PI/2;
    return res;
}


function splitArray(arr,argsarr, parname) {
    function sortFunc (a, b) {
       return a.nearest - b.nearest;     
    }
    var splits = new Array(argsarr.length);
    arr.forEach((item) => {
       var count = -1;
       argsarr.forEach(arg => {
           if(Math.abs(item[parname]) > arg){ 
             count = count + 1 ; 
           }
       })
       if (!splits[count] ) {
           splits[count] = [];
       }
       splits[count].push(item);

    });
    console.log(splits);
    splits = splits.map(s => s.sort(sortFunc));
    var splitsresult = [];
    splits.forEach(s => {
        splitsresult = splitsresult.concat(s)
    });
    
    return splitsresult;
}


function findNormal(l, idx, radius2) {
    if (!game.ids) {
        game.ids = [];
    }

    var radius = game.radius + radius2;
    var balls = game.group.filter(i => {
        return idx === -1 || i.idx != idx && game.ids.indexOf(i.idx) == -1;
    });

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

        var len = getLength(b.x, b.y, x0, y0);
        if (inrange(x0, l.x, l.x1) && len < radius) {
            normals.push(new Phaser.Line(b.x, b.y, x0, y0));
            var l1 = Math.sqrt((radius) ** 2 - len ** 2);
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
            var ang = atan(tn);
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
                x: b.x,
                y: b.y,
                x1: x1,
                y1: y1,
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


    //new Phaser.Line(b.x, b.y, x1, y1)
    return {
        newtracks
    };
}

function continueLine(x, y, x1, y1, epsilon) {
    if (epsilon == undefined) {epsilon = 0;}
    var angb = Phaser.Math.angleBetween(x, y, x1, y1);
    //var t = tanc(x, x1, y, y1);
    var r = game.bradius + game.radius;
    r = r - Phaser.Math.linear(0, epsilon, Math.random());
    var dy = r * Math.sin(angb);
    var dx = r * Math.cos(angb);
    var x0 = x1 + dx;
    var y0 = y1 + dy;
    return {
        x: x0,
        y: y0
    };
}

function infield(x, y) {
    var radius = game.radius;
    return game.lx + radius <= x && x <= game.rx - radius && game.tx + radius <= y && y <= game.by - radius;
}