
var w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    ctx = c.getContext('2d'),

    hw = w / 2,
    hh = h / 2,

    opts = {
        strings: ['FELIZ', 'CUMPLEAÑOS', 'PRECIOSA!!!!!'],
        charSize: 30,
        charSpacing: 35,
        lineHeight: 40,

        cx: w / 2,
        cy: h / 2,

        fireworkPrevPoints: 10,
        fireworkBaseLineWidth: 5,
        fireworkAddedLineWidth: 8,
        fireworkSpawnTime: 200,
        fireworkBaseReachTime: 30,
        fireworkAddedReachTime: 30,
        fireworkCircleBaseSize: 20,
        fireworkCircleAddedSize: 10,
        fireworkCircleBaseTime: 30,
        fireworkCircleAddedTime: 30,
        fireworkCircleFadeBaseTime: 10,
        fireworkCircleFadeAddedTime: 5,
        fireworkBaseShards: 5,
        fireworkAddedShards: 5,
        fireworkShardPrevPoints: 3,
        fireworkShardBaseVel: 4,
        fireworkShardAddedVel: 2,
        fireworkShardBaseSize: 3,
        fireworkShardAddedSize: 3,
        gravity: .1,
        upFlow: -.1,
        letterContemplatingWaitTime: 360,
        balloonSpawnTime: 20,
        balloonBaseInflateTime: 10,
        balloonAddedInflateTime: 10,
        balloonBaseSize: 20,
        balloonAddedSize: 20,
        balloonBaseVel: .4,
        balloonAddedVel: .4,
        balloonBaseRadian: -(Math.PI / 2 - .5),
        balloonAddedRadian: -1,
    },
    calc = {
        totalWidth: opts.charSpacing * Math.max(opts.strings[0].length, opts.strings[1].length)
    },

    Tau = Math.PI * 2,
    TauQuarter = Tau / 4,

    letters = [];

ctx.font = opts.charSize + 'px Verdana';

function Letter(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;

    this.dx = -ctx.measureText(char).width / 2;
    this.dy = +opts.charSize / 2;

    this.fireworkDy = this.y - hh;

    var hue = x / calc.totalWidth * 360;

    this.color = 'hsl(hue,80%,50%)'.replace('hue', hue);
    this.lightAlphaColor = 'hsla(hue,80%,light%,alp)'.replace('hue', hue);
    this.lightColor = 'hsl(hue,80%,light%)'.replace('hue', hue);
    this.alphaColor = 'hsla(hue,80%,50%,alp)'.replace('hue', hue);

    this.reset();
}

Letter.prototype.reset = function () {

    this.phase = 'firework';
    this.tick = 0;
    this.spawned = false;
    this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;
    this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() | 0;
    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[0, hh, 0]];
};

Letter.prototype.step = function () {

    if (this.phase === 'firework') {

        if (!this.spawned) {

            ++this.tick;
            if (this.tick >= this.spawningTime) {

                this.tick = 0;
                this.spawned = true;
            }

        } else {

            ++this.tick;

            var linearProportion = this.tick / this.reachTime,
                armonicProportion = Math.sin(linearProportion * TauQuarter),

                x = linearProportion * this.x,
                y = hh + armonicProportion * this.fireworkDy;

            if (this.prevPoints.length > opts.fireworkPrevPoints)
                this.prevPoints.shift();

            this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

            var lineWidthProportion = 1 / (this.prevPoints.length - 1);

            for (var i = 1; i < this.prevPoints.length; ++i) {

                var point = this.prevPoints[i],
                    point2 = this.prevPoints[i - 1];

                ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);
                ctx.lineWidth = point[2] * lineWidthProportion * i;
                ctx.beginPath();
                ctx.moveTo(point[0], point[1]);
                ctx.lineTo(point2[0], point2[1]);
                ctx.stroke();

            }

            if (this.tick >= this.reachTime) {

                this.phase = 'contemplate';

                this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
                this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() | 0;
                this.circleCreating = true;
                this.circleFading = false;

                this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() | 0;
                this.tick = 0;
                this.tick2 = 0;

                this.shards = [];

                var shardCount = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0,
                    angle = Tau / shardCount,
                    cos = Math.cos(angle),
                    sin = Math.sin(angle),

                    x = 1,
                    y = 0;

                for (var i = 0; i < shardCount; ++i) {
                    var x1 = x;
                    x = x * cos - y * sin;
                    y = y * cos + x1 * sin;

                    this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
                }
            }

        }
    } else if (this.phase === 'contemplate') {

        ++this.tick;

        if (this.circleCreating) {

            ++this.tick2;
            var proportion = this.tick2 / this.circleCompleteTime,
                armonic = -Math.cos(proportion * Math.PI) / 2 + .5;

            ctx.beginPath();
            ctx.fillStyle = this.lightAlphaColor.replace('light', 50 + 50 * proportion).replace('alp', proportion);
            ctx.beginPath();
            ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
            ctx.fill();

            if (this.tick2 > this.circleCompleteTime) {
                this.tick2 = 0;
                this.circleCreating = false;
                this.circleFading = true;
            }
        } else if (this.circleFading) {

            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

            ++this.tick2;
            var proportion = this.tick2 / this.circleFadeTime,
                armonic = -Math.cos(proportion * Math.PI) / 2 + .5;

            ctx.beginPath();
            ctx.fillStyle = this.lightAlphaColor.replace('light', 100).replace('alp', 1 - armonic);
            ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
            ctx.fill();

            if (this.tick2 >= this.circleFadeTime)
                this.circleFading = false;

        } else {

            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
        }

        for (var i = 0; i < this.shards.length; ++i) {

            this.shards[i].step();

            if (!this.shards[i].alive) {
                this.shards.splice(i, 1);
                --i;
            }
        }

        if (this.tick > opts.letterContemplatingWaitTime) {

            this.phase = 'balloon';

            this.tick = 0;
            this.spawning = true;
            this.spawnTime = opts.balloonSpawnTime * Math.random() | 0;
            this.inflating = false;
            this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() | 0;
            this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random() | 0;

            var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
                vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

            this.vx = Math.cos(rad) * vel;
            this.vy = Math.sin(rad) * vel;
        }
    } else if (this.phase === 'balloon') {

        ctx.strokeStyle = this.lightColor.replace('light', 80);

        if (this.spawning) {

            ++this.tick;
            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

            if (this.tick >= this.spawnTime) {
                this.tick = 0;
                this.spawning = false;
                this.inflating = true;
            }
        } else if (this.inflating) {

            ++this.tick;

            var proportion = this.tick / this.inflateTime,
                x = this.cx = this.x,
                y = this.cy = this.y - this.size * proportion;

            ctx.fillStyle = this.alphaColor.replace('alp', proportion);
            ctx.beginPath();
            generateBalloonPath(x, y, this.size * proportion);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, this.y);
            ctx.stroke();

            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

            if (this.tick >= this.inflateTime) {
                this.tick = 0;
                this.inflating = false;
            }

        } else {

            this.cx += this.vx;
            this.cy += this.vy += opts.upFlow;

            ctx.fillStyle = this.color;
            ctx.beginPath();
            generateBalloonPath(this.cx, this.cy, this.size);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(this.cx, this.cy);
            ctx.lineTo(this.cx, this.cy + this.size);
            ctx.stroke();

            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

            if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw)
                this.phase = 'done';

        }
    }
};

function Shard(x, y, vx, vy, color) {

    var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

    this.vx = vx * vel;
    this.vy = vy * vel;

    this.x = x;
    this.y = y;

    this.prevPoints = [[x, y]];
    this.color = color;

    this.alive = true;

    this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}

Shard.prototype.step = function () {

    this.x += this.vx;
    this.y += this.vy += opts.gravity;

    if (this.prevPoints.length > opts.fireworkShardPrevPoints)
        this.prevPoints.shift();

    this.prevPoints.push([this.x, this.y]);

    var lineWidthProportion = this.size / this.prevPoints.length;

    for (var k = 0; k < this.prevPoints.length - 1; ++k) {

        var point = this.prevPoints[k],
            point2 = this.prevPoints[k + 1];

        ctx.strokeStyle = this.color.replace('alp', k / this.prevPoints.length);
        ctx.lineWidth = k * lineWidthProportion;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();

    }

    if (this.prevPoints[0][1] > hh)
        this.alive = false;
};

function generateBalloonPath(x, y, size) {

    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - size / 2, y - size / 2,
        x - size / 4, y - size,
        x, y - size);
    ctx.bezierCurveTo(x + size / 4, y - size,
        x + size / 2, y - size / 2,
        x, y);
}

function anim() {

    window.requestAnimationFrame(anim);

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);

    ctx.translate(hw, hh);

    var done = true;
    for (var l = 0; l < letters.length; ++l) {

        letters[l].step();
        if (letters[l].phase !== 'done')
            done = false;
    }

    ctx.translate(-hw, -hh);

    if (done)
        for (var l = 0; l < letters.length; ++l)
            letters[l].reset();
}

for (var i = 0; i < opts.strings.length; ++i) {
    for (var j = 0; j < opts.strings[i].length; ++j) {
        letters.push(new Letter(opts.strings[i][j],
            j * opts.charSpacing + opts.charSpacing / 2 - opts.strings[i].length * opts.charSize / 2,
            i * opts.lineHeight + opts.lineHeight / 2 - opts.strings.length * opts.lineHeight / 2));
    }
}

anim();

window.addEventListener('resize', function () {

    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;

    hw = w / 2;
    hh = h / 2;

    ctx.font = opts.charSize + 'px Verdana';
});
const lyrics = [
    { time: 0.00, text: "(Baby)" },
    { time: 2.83, text: "(Todo lo que tengo)" },
    { time: 6.85, text: "(Lo volvería a hacer)" },
    { time: 10.64, text: "(Aunque fuera la última vez)" },
    { time: 14.95, text: "Háblame de vos, que escucharte es oro" },
    { time: 18.32, text: "Y si pierdo control, lo es todo" },
    { time: 20.46, text: "No preguntes cómo, pero ahora soy adicto a vos" },
    { time: 24.00, text: "No preguntes cómo, pero ahora soy adicto a vos, vos, yeah" },
    { time: 31.08, text: "Baby" },
    { time: 33.77, text: "Todo lo que tengo" },
    { time: 37.86, text: "Ahora, lo puedo perder" },
    { time: 41.52, text: "Porque nada vale sin ti" },
    { time: 46.59, text: "Besos" },
    { time: 49.26, text: "Del pecho a la pelvis" },
    { time: 53, text: "Que entibian el cuerpo" },
    { time: 56.99, text: "Y eso me hizo adicto a vos, vos" },
    { time: 62.13, text: "No sé si es el amor" },
    { time: 63.5, text: "Río mirando el phone" },
    { time: 64.89, text: "Nеna, te envidia el Sol" },
    { time: 66.39, text: "Porquе brillas como él, planetas a tu alrededor, oh-oh-oh" },
    { time: 71.19, text: "El viento sopla a tu merced, la sábana se hizo mantel" },
    { time: 73.91, text: "Fue que arriba quiero comerte" },
    { time: 75.96, text: "Tus piernas penetran mi mente" },
    { time: 77.97, text: "Y siento ese medio caliente" },
    { time: 79.46, text: "Háblame, que quiero entenderte" },
    { time: 80.94, text: "Estás susurrándome un par de pecado'" },
    { time: 82.77, text: "Hagámoslo lento, que yo soy paciente" },
    { time: 85.26, text: "Creo que sufro parálisi' estando dormido" },
    { time: 87.47, text: "Porque estar con vos es un sueño" },
    { time: 89.15, text: "Ya no me importa extrañar tu calor por las noche'" },
    { time: 91.34, text: "Porque el amor es más fuerte" },
    { time: 93.21, text: "Cuando estés mal, quiero estar" },
    { time: 95.14, text: "Hay vacíos que no puedo reemplazar" },
    { time: 97.09, text: "Pero, sí, darle fin a tu soledad" },
    { time: 98.98, text: "Ser vos misma no es una incomodidad" },
    { time: 100.71, text: "Cúrame de todos mis males mentales" },
    { time: 102.53, text: "Gritémosle al tiempo que pare" },
    { time: 104.3, text: "Soltate, enojate, retame" },
    { time: 106.12, text: "Y si un día te hago mal, si debes, soltame" },
    { time: 108.47, text: "Baby" },
    { time: 111.17, text: "Todo lo que tengo" },
    { time: 115.29, text: "Ahora lo puedo perder" },
    { time: 118.86, text: "Porque nada vale sin ti" },
    { time: 124.04, text: "Besos" },
    { time: 126.71, text: "Del pecho a la pelvis" },
    { time: 130.44, text: "Que entibian el cuerpo" },
    { time: 134.2, text: "Y eso me hizo adicto a vos, vos" },
    { time: 138.93, text: "Háblame de vos, que escucharte es oro" },
    { time: 142, text: "Y si pierdo control, lo es todo" },
    { time: 144.24, text: "No preguntes cómo, pero ahora soy adicto a vos" },
];
function updateLyrics(currentTime) {
    // Solo empezar a mostrar letras después del segundo 12
    if (currentTime < 0.5) {
        return;
    }

    // Encontrar la letra correspondiente al tiempo actual
    const lyric = lyrics.find(lyric => currentTime >= lyric.time && currentTime < (lyrics[lyrics.indexOf(lyric) + 1]?.time || Infinity));

    // Si encontramos una letra y ha cambiado, la actualizamos
    if (lyric) {
        // Mostrar la letra con un fondo y resaltado de estilo
        document.getElementById("lyrics").innerHTML = `<p class="active">${lyric.text}</p>`;
    }
}

const audio = document.getElementById("audio");

audio.addEventListener("play", function () {
    const interval = setInterval(function () {
        updateLyrics(audio.currentTime);

        // Si el audio ha terminado, detener el intervalo
        if (audio.currentTime >= audio.duration) {
            clearInterval(interval);
        }
    }, 100); // Actualiza cada 100 ms
});