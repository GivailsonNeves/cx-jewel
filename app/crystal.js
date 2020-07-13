var CrystalDirection ={
	
	UP : "UP",
	DOWN : "DOWN",
	RIGHT : "RIGHT",
	LEFT : "LEFT"
};

var Crystal = function () {
    var _ctx = this;
    var _divContext = null;
    var _borderSpacer = 10;
    var _spanJewel;
    var _enabled = true;
    var _animationIndex = 0;///ghghjgjhg


    var _hitPosition = null; //{x : 0, y : 0};

    _ctx.x = 0;
    _ctx.y = 0;
    _ctx.xTo = 0
    _ctx.yTo = 0;
    _ctx.width = 46;
    _ctx.height = 46;
    _ctx.jewelIndex = Math.floor(Math.random() * Config.CrystalLength);
    _ctx.selected = false;
    _ctx.willExplode = false;
    _ctx.isEspecial = false;
    _ctx.isEspecialUsed = false;
    _ctx.mapPosition = { x: 0, y: 0 };
    _ctx.busy = false;

    _ctx.onSelect = null;
    _ctx.onMoveChange = null;
    _ctx.onEndAnimation = null;

    _ctx.init = function (_cvContext) {
        _divContext = _cvContext;
        drawCrystal();
        return _ctx;
    }
    _ctx.hideCrystal = function () {
        _enabled = false;
        _spanJewel.style.background = "none";
    }
    _ctx.invalidate = function () {
        _enabled = true;
        _spanJewel.style.background = "url('" + GameResouces.getJewelImage(_ctx.jewelIndex, _ctx.selected) + "') center center no-repeat";
        // _spanJewel.style.background = "url('" + GameResouces.getJewelImage(_ctx.jewelIndex, false) + "') top center no-repeat";
    }
    var drawCrystal = function () {
        _spanJewel = document.createElement("span");
        _divContext.appendChild(_spanJewel);
		
        with (_spanJewel.style) {
            width = _ctx.width + "px";
            height = _ctx.height + "px";
            top = "-50px";
            left = _ctx.x + "px";
            background = "url('" + GameResouces.getJewelImage(_ctx.jewelIndex, _ctx.selected) + "') center center no-repeat";
            //background = "url('" + GameResouces.getJewelImage(_ctx.jewelIndex, false) + "') center center no-repeat";
            opacity = 0;
        }
		
        _spanJewel.onmousedown = _ctx.hitme;
        TweenLite.to(_spanJewel, 1.2, { top: _ctx.y + "px", opacity: "1" });

        /*
        console.log("_ctx.jewelIndex" + _ctx.jewelIndex)
        if (_ctx.jewelIndex == 5) {
        animeCristal();
        }*/
    }
	//deprecate
    var animeCristal = function () {

        _animationIndex = ((_animationIndex + 1) < 3) ? (_animationIndex + 1) : 0;

        var path = window.baseURL + "Content/Imagens/game/cristais/01_" + _animationIndex + ".png"
        var position = ("-" + (_animationIndex * Config.CrystalSize) + "px 0");
        _spanJewel.style.backgroundPosition = position;

        TweenLite.delayedCall(0.2, animeCristal);
    }
	
    _ctx.transformToFire = function () {
        _ctx.isEspecial = true;
        _ctx.jewelIndex = Config.FireIndex;
        _ctx.invalidate();
    }
    _ctx.transformToCube = function () {
        _ctx.isEspecial = true;
        _ctx.jewelIndex = Config.CubeIndex;
        _ctx.invalidate();
    }
    _ctx.transformToLightning = function () {
        _ctx.isEspecial = true;
        _ctx.jewelIndex = Config.LightningIndex;
        _ctx.invalidate();
    }
    _ctx.setZIndex = function (index) {
        _spanJewel.style.zIndex = index;
    }
    _ctx.destroy = function () {

        if (_spanJewel != null) {
            _divContext.removeChild(_spanJewel);
            _spanJewel = null;
        }

    }
    _ctx.animeTo = function (animate) {

        _ctx.busy = true;

        _ctx.x = animate.x;
        _ctx.y = animate.y;
        _ctx.xTo = animate.x;
        _ctx.yTo = animate.y;

        try{
            TweenLite.to(_spanJewel, .3, { top: animate.y + "px", left: animate.x + "px", opacity: "1", onComplete: dispatchEndAnimation });
        } catch (e) {
            console.log('animeTo')
        }
    }
    _ctx.moveTo = function (animate) {

        _ctx.busy = true;
        _ctx.x = animate.x;
        _ctx.y = animate.y;
        _ctx.xTo = animate.x;
        _ctx.yTo = animate.y;

        try{
            TweenLite.to(_spanJewel, .3, { top: animate.y + "px", left: animate.x + "px", opacity: "1", onComplete: function () { } });
        } catch (e) {
            console.log('moveTo')
        }
    }
    _ctx.moveToEndBusy = function (animate) {

        _ctx.busy = true;
        _ctx.x = animate.x;
        _ctx.y = animate.y;
        _ctx.xTo = animate.x;
        _ctx.yTo = animate.y;

        try{
            TweenLite.to(_spanJewel, .3, { top: animate.y + "px", left: animate.x + "px", opacity: "1", onComplete: function () { _ctx.busy = false; } });
        } catch (e) {
            console.log('moveToEndBusy')
        }
        
    }    
    var dispatchEndAnimation = function () {
        if (_ctx.onEndAnimation != null) {
            _ctx.onEndAnimation(_ctx);
        }
        _ctx.busy = false;
      
    }
    _ctx.hitme = function (event) {
        if (_enabled) {
            window.event.preventDefault;
            _hitPosition = { x: window.event.clientX, y: window.event.clientY };

            document.onmouseup = hitRelease;
            document.onmousemove = checkMouseMove;

            if (_ctx.onSelect != null) {
                _ctx.onSelect(_ctx);
            }
        }
        return false;
    }
	//deprecate
    _ctx.hitted = function (pnt) {
        return pnt.x > _ctx.x && pnt.x < (_ctx.x + _ctx.width) && pnt.y > _ctx.y && pnt.y < (_ctx.y + _ctx.height);
    }
	//deprecate
    var checkMouseMove = function (event) {
        window.event.preventDefault;

        if (_ctx.onMoveChange != null && _ctx.selected) {
            var xMove = window.event.clientX - _hitPosition.x;
            var yMove = window.event.clientY - _hitPosition.y;

            if (Math.abs(xMove) > 5) {
                if (xMove > 0)
                    _ctx.onMoveChange(CrystalDirection.RIGHT)
                else
                    _ctx.onMoveChange(CrystalDirection.LEFT)

                hitRelease();
            } else {
                if (Math.abs(yMove) > 5) {
                    if (yMove > 0)
                        _ctx.onMoveChange(CrystalDirection.DOWN)
                    else
                        _ctx.onMoveChange(CrystalDirection.UP)

                    hitRelease();
                }
            }
        }
        return false;
    }
	//deprecate
    var hitRelease = function () {
        _hitPosition = null;
        document.onmouseup = null;
        document.onmousemove = null;
    }


}