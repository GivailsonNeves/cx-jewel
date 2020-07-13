window.baseURL = "";
var Resource = function () {
    var _ctx = this;
    var _totalResources = 10;
    var _resourceLoades = 0;

    _ctx.onComplete = null;

/*dprecate*/
    _ctx.Jewel0 = new Image();
    _ctx.Jewel1 = new Image();
    _ctx.Jewel2 = new Image();
    _ctx.Jewel3 = new Image();
    _ctx.Jewel4 = new Image();

    _ctx.Jewel0_b = new Image();
    _ctx.Jewel1_b = new Image();
    _ctx.Jewel2_b = new Image();
    _ctx.Jewel3_b = new Image();
    _ctx.Jewel4_b = new Image();

    _ctx.audioClick = null;
    _ctx.audioMiss = null;
    _ctx.audioExplode = null;
    _ctx.audioLoop = null;

    _ctx.load = function () {

        _ctx.audioLoop = "/android_asset/www/sound/loop.mp3";
        _ctx.audioClick = "/android_asset/www/sound/click.wav";
        _ctx.audioMiss = "/android_asset/www/sound/miss.wav";
        _ctx.audioExplode = "/android_asset/www/sound/powerup.wav";

        _ctx.Jewel0 = window.baseURL + "img/game/cristais/01.png";
        _ctx.Jewel1 = window.baseURL + "img/game/cristais/02.png";
        _ctx.Jewel2 = window.baseURL + "img/game/cristais/03.png";
        _ctx.Jewel3 = window.baseURL + "img/game/cristais/04.png";
        _ctx.Jewel4 = window.baseURL + "img/game/cristais/05.png";
        _ctx.Jewel5 = window.baseURL + "img/game/cristais/06.png";
        _ctx.Jewel6 = window.baseURL + "img/game/cristais/07.png";
        _ctx.fire = window.baseURL + "img/game/cristais/fire.png";
        _ctx.lightning = window.baseURL + "img/game/cristais/lightning.png";
        _ctx.cube = window.baseURL + "img/game/cristais/cube.png";

        _ctx.Jewel0_b = window.baseURL + "img/game/cristais/01_b.png";
        _ctx.Jewel1_b = window.baseURL + "img/game/cristais/02_b.png";
        _ctx.Jewel2_b = window.baseURL + "img/game/cristais/03_b.png";
        _ctx.Jewel3_b = window.baseURL + "img/game/cristais/04_b.png";
        _ctx.Jewel4_b = window.baseURL + "img/game/cristais/05_b.png";
        _ctx.Jewel5_b = window.baseURL + "img/game/cristais/06_b.png";
        _ctx.Jewel6_b = window.baseURL + "img/game/cristais/07_b.png";

        if (_ctx.onComplete)
            _ctx.onComplete();

        return _ctx;
    }
	///deprecate
    _ctx.playLoop = function () {/*
		_ctx.audioLoop.play();
		loop();
		*/
    }
	//explode é igual a selected
    _ctx.getJewelImage = function (index, explode) {
        switch (index) {
            case 0:
                return (!explode) ? _ctx.Jewel0 : _ctx.Jewel0_b;
                break;
            case 1:
                return (!explode) ? _ctx.Jewel1 : _ctx.Jewel1_b;
                break;
            case 2:
                return (!explode) ? _ctx.Jewel2 : _ctx.Jewel2_b;
                break;
            case 3:
                return (!explode) ? _ctx.Jewel3 : _ctx.Jewel3_b;
                break;
            case 4:
                return (!explode) ? _ctx.Jewel4 : _ctx.Jewel4_b;
                break;
            case 5:
                return (!explode) ? _ctx.Jewel5 : _ctx.Jewel5_b;
                break;
            case 6:
                return (!explode) ? _ctx.Jewel6 : _ctx.Jewel6_b;
                break;
            case 7:
                return (!explode) ? _ctx.fire : _ctx.fire;
                break;
            case 8:
                return (!explode) ? _ctx.lightning : _ctx.lightning;
                break;
            case 9:
                return (!explode) ? _ctx.cube : _ctx.cube;
                break;
        }
    }
    var resourceLoaded = function () {
        _resourceLoades++;
        if (_resourceLoades == _totalResources) {
            //	console.log("Recursos Carregados!");
            if (_ctx.onComplete)
                _ctx.onComplete();
        }
    }
    var loop = function () {
        /*		_ctx.audioLoop.seekTo(0);
        setTimeout(loop, 28000);*/
    }

}