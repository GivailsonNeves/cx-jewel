var mainContextGame = null;

var MainGame = function () {

    var _context = this; //váriavel de contexto de instância. Permite que váriaveis e métodos sejam acessiveis fora da classe

    //---variáveis de controle do relógio--//
    var currentDate = null; //Data intervalar para contar os millesegundos entre uma interação e outra.
    var currentTimeMilles = 0; //Total de millessegundos decorridos desde o inicio do jogo.
    var ctrlTimerGame = 0; //controlador do setinterval de refresh do tempo.
    var maxWidthProgress = 343; //tamanho em pixels da altura da barra de progresso de tempo

    //----variáveis do especial-----//
    var powerGauge = 1; //barra de especial. valores entre 0 e 1. (%)

    var SPECIAL_LIGHTNING = "relampago"; //Constante do tipo relampago == ao title do bottão que dispara o especial
    var SPECIAL_FIRE = "fogo"; //Constante do tipo fogo == ao title do bottão que dispara o especial
    var SPECIAL_CUBE = "cubo"; //Constante do tipo cubo == ao title do bottão que dispara o especial

    var _ctrlFoginhoInterval = 0; //controla a animação do fogo
    var _ctrlRaioInterval = 0; //controla a animação do raio
    var _ctrlHideEfect = 0; //controla a ocultação da area de efeitos.

    //-- variáveis de controle do palco--//    
    var _stageDiv = null; //armazena a div onde os cristais são posicionados
    var _childs = new Array(); //vetor contendo os objetos adicionados a div-palco


    //----Varíaveis e controladores do jogo----//
    var _currentCristal = null; //cristal selecionado no momento atual
    var _score = 0; //pontuação inicial do jogo
    var _lastScore = 0; //guarda o ultimo score
    var _cascataCounter = 0; //gerencia as eplosões em cascata
    var _arrCascataObjects = null;
    var _ctrlVeryfiMap = 0; //variável de controle utilizada no setinterval de verificação do mapa.
    var isPaused = false; //variável que controla a pausa do jogo
    var _endGame = false; //váriavel que indica o fim do jogo
    var _gameInited = false; //váriavel que controla o inicio unico do jogo.

    var _countDica = 0; //dicas visualizadas durante o jogo.

    /**
    * controladores de post e request
    */
    var GET_JOGO_INFO = { url: window.baseURL + "Ajax/CarregarInformacoesJogo", type: "GET_JOGO_INFO" };
    var POST_SALVAR_PONTO_JOGADA = { url: window.baseURL + "Ajax/SalvarLogJogo", type: "POST_SALVAR_PONTO_JOGADA" };
    var POST_SALVAR_DICA = { url: window.baseURL + "Ajax/SalvarDica", type: "POST_SALVAR_DICA" };
    var POST_SALVAR_FIM_JOGO = { url: window.baseURL + "Ajax/SalvarJogo", type: "POST_SALVAR_FIM_JOGO" };

    /*
    * guarda os objetos dica fornecidos pelo servidor
    */
    var arrDicas = [[], [], [], [], [], [], []];
    /**
    * ganhou premio supresa, controlador
    */
    var ganhoPremioSurpresa = false;

    /**
    * vetor de parceiros como veem do servidor
    */
    var parceiros = [];
    parceiros["Mundo Caixa"] = 0;
    parceiros["Caixa"] = 1;
    parceiros["Caixa Seguros"] = 2;
    parceiros["Par"] = 5;
    parceiros["Fenae"] = 3;
    parceiros["Funcef"] = 4;
    parceiros["Vantagens"] = 6;


    /**
    * Pontuações
    */
    var Pontuacao = {

        MultiplicadorPeca3: 500,
        MultiplicadorPeca4: 1000,
        MultiplicadorPeca5: 2000,
        MultiplicadorPeca6: 3000,
        MultiplicadorPeca7Mais: 4000,
        MultiplicadorFogo: 300,
        MultiplicadorRaio: 500,
        MultiplicadorCubo: 1000,
        MultiplicadorCascata: 250


    };

    var _ctrlEndGameInterval = 0;


	_context.load = function()
	{
		
		GameResouces = new Resource();
    	GameResouces.onComplete = function () {        	
			
			if( _context.gameLoaded != null)
			{
				_context.gameLoaded();
			}
			//console.log("jogo carregado")
			mainContextGame = new MainGame().init();
    	}
	    GameResouces.load();

	}
    /**
    * Função inicializadora.
    */
    _context.init = function () {

	//console.log("jogo iniciado!")
        startGame();
        innerPauseGame();		
   //     requestGameInfo();
      // verifyRefresh();
	  return _context;

    }
    /*
    * prepara o jogo para ser iniciado
    */
    var startGame = function () {
        if (!_gameInited) {
            if (initGame()) {               
                
                prepareJewelMap();
                clearInterval(_ctrlVeryfiMap);
				//console.log("preparando jogo")
                iniControladoresExternos();
                initPowerButtons();
                updatePowerGauge();
                updateScore();
                startTimer();
                progressTime(0);
                _gameInited = true;


            }
        }
    }
	_context.destroyGame = function()
	{
		$("#GameArea .painelTempo table tr td a").unbind("click");
		$("#GameArea .boxControle .controladorPoderes .caugeIcons a").unbind("click");
		$("#GameArea h2").show();		 		 
		$(_stageDiv).empty();
		_gameInited = false;
		
		
		clearInterval(ctrlTimerGame);		
		clearInterval(_ctrlFoginhoInterval);
        clearInterval(_ctrlRaioInterval);
        clearInterval(_ctrlHideEfect);
        clearInterval(_ctrlRaioInterval);
        clearTimeout(_ctrlEndGameInterval);
        clearInterval(_ctrlVeryfiMap);
			
		// mainContext.showBorderAndTop();
			
		 mainContextGame = null;
	}
    /*====================================== Controladores e componentes externos =====================================*/  
    /**
    * efetua a pausa interna do jogo
    */
    var innerPauseGame = function () {

        if (!_endGame) {
            enableMapVerification(false)
            pauseTimer();
            $("#labelPausePlay").html("play")
            $("#GameArea .painelTempo table tr td a.play").show();
            $("#GameArea .painelTempo table tr td a.pause").hide();
            clearPowerCauge();
            pauseGame();

        } else {
            // alert("jogo finalizado!")
        }
    }
    /**
    * efetua o play interna do jogo
    */
    var innerPlayGame = function () {

        if (!_endGame) {
            enableMapVerification(true);
            updatePowerGauge();
            startTimer();
            $("#labelPausePlay").html("pause");
            $("#GameArea .painelTempo table tr td a.play").hide();
            $("#GameArea .painelTempo table tr td a.pause").show();
            pauseGame();
        } else {
            // alert("jogo finalizado!")
        }
    }
    /**
    * inicia o contador de tempo
    */
    var startTimer = function () {

        clearInterval(ctrlTimerGame)
        currentDate = new Date();
        ctrlTimerGame = setInterval(checkTimer, 100);
    }
    /**
    * verifica e incrementa o tempo decorrido de jogo
    */
    var checkTimer = function () {

        var auxDate = new Date();
        currentTimeMilles += auxDate.getTime() - currentDate.getTime();
        currentDate = auxDate;
        if (currentTimeMilles >= Config.TotalTime) {
            progressTime(1);
            pauseTimer();
            endGame();
        } else {
            progressTime(currentTimeMilles / Config.TotalTime);
        }
    }
    /**
    * pausa o tempo
    */
    var pauseTimer = function () {
        clearInterval(ctrlTimerGame)
    }
    /**
    * Inicializador dos controladores externos. (botões de pause e play)
    */
    var iniControladoresExternos = function () {

        $("#GameArea .painelTempo table tr td a.play").hide();

        $("#GameArea .painelTempo table tr td a.play").click(function (ev) {
            ev.preventDefault();

            if (!$(this).hasClass("disabled")) {
                
                $(this).addClass("disabled")
            }
			$("#GameArea h2").hide();
			// mainContext.hideBorderAndTop();
			innerPlayGame();

            return false;
        });
        $("#GameArea .painelTempo table tr td a.pause").click(function (ev) {
            ev.preventDefault();

            if (!_endGame) {

              //  salvarLogJogo(0, _score, _score, 0, "Pause", "", currentTimeMilles);
            }

            var index = Math.floor(Math.random() * Config.CrystalLength);
          //  showDica(arrDicas[index]);
			innerPauseGame();
            return false;
        });
    }
    /* Exibe o progresso do jogo baseado no percentual decorrido do jogo
    * permite visualizar a barra de progresso e o tempo decorrido
    */
    var progressTime = function (progress) {

        if (progress <= 1) {
            //  console.log(progress)
            var pxProgress = (1 - progress) * maxWidthProgress;
            $("#GameArea .painelTempo table tr td.countTime .timeProgress").width(pxProgress);

            var milleSeconds = Config.TotalTime - parseInt(progress * Config.TotalTime);
            var timeDate = new Date(milleSeconds);
			var minutos = timeDate.getMinutes();
            var timeString = fillZero(minutos) + ":" + fillZero(timeDate.getSeconds());

			if(minutos > 0)
			{
				$("#GameArea .painelTempo table tr td.countTime .timeCounter").html(timeString + " minuto");
			}else{
	            $("#GameArea .painelTempo table tr td.countTime .timeCounter").html(timeString + " segundos");
			}

        }
		
    }
    /**
    * incrementa o score do jogo
    */
    var incrementScore = function (_increment) {

        _lastScore = _score;
        _score += _increment;
    }
    /**
    * atualiza o score do jogo
    */
    var updateScore = function () {

        var txtScore = "" + _score;
        while (txtScore.length < 9)
            txtScore = "0" + txtScore;

        //txtScore = formatPoints(txtScore);//pontos formatados
        txtScore = txtScore;

        $("#GameArea .painelControle .pontuacaoCorrent").html(txtScore);
    }
    var clearPowerCauge = function () {

        $("#GameArea .boxControle .controladorPoderes ul li span.powerCage").css("width", "0px");

        $("#GameArea .boxControle .controladorPoderes .caugeIcons a").addClass("disabled");

    }
    /**
    * atualiza barra de especial
    */
    var updatePowerGauge = function () {

        var powerNivel1 = 0;
        var powerNivel2 = 0;
        var powerNivel3 = 0;

        clearPowerCauge();

        if (powerGauge >= Config.EspecialLevels[0]) {

            powerNivel1 = Config.EspecialBarrSize[0];
            $("#GameArea .boxControle .controladorPoderes .caugeIcons a.iconNivel1").removeClass("disabled");

            if (powerGauge >= Config.EspecialLevels[1]) {

                $("#GameArea .boxControle .controladorPoderes .caugeIcons a.iconNivel2").removeClass("disabled");
                powerNivel2 = Config.EspecialBarrSize[1];

                if (powerGauge == Config.EspecialLevels[2]) {

                    $("#GameArea .boxControle .controladorPoderes .caugeIcons a.iconNivel3").removeClass("disabled");
                    powerNivel3 = Config.EspecialBarrSize[2];
                } else {


                    var percent = (powerGauge - Config.EspecialLevels[1]) / (Config.EspecialLevels[2] - Config.EspecialLevels[1]);
                    powerNivel3 = Config.EspecialBarrSize[2] * percent;
                }

            } else {


                var percent = (powerGauge - Config.EspecialLevels[0]) / (Config.EspecialLevels[1] - Config.EspecialLevels[0]);

                powerNivel2 = Config.EspecialBarrSize[1] * percent;
            }

        } else {

            powerNivel1 = Config.EspecialBarrSize[0] * powerGauge;
        }



        $("#GameArea .boxControle .controladorPoderes ul li.powerNivel1 span.powerCage").css("width", (powerNivel1 + "px"));
        $("#GameArea .boxControle .controladorPoderes ul li.powerNivel2 span.powerCage").css("width", (powerNivel2 + "px"));
        $("#GameArea .boxControle .controladorPoderes ul li.powerNivel3 span.powerCage").css("width", (powerNivel3 + "px"));

    }
    /*====================================== Controladores de especial =====================================*/
    /**
    * Inicializa os botões de especiais (foto, relampago, e cubo)
    */
    var initPowerButtons = function () {

        if ($("#GameArea .boxControle .controladorPoderes .caugeIcons a").length) {

            $("#GameArea .boxControle .controladorPoderes .caugeIcons a").click(usePower);
        }
    }
    /**
    * controla o increment da barra de poder
    */
    var incrementPowerGauge = function (v) {

        powerGauge = Math.min(powerGauge + v, 1);
    }
    /**
    * Método que aciona os epeciais, conforme o botão pressionado.
    */
    var usePower = function (ev) {
        ev.preventDefault();

        if (!isPaused && !_endGame) {

            var powerUsed = false;
            switch ($(this).attr("title")) {

                case SPECIAL_FIRE:
                    if (powerGauge >= Config.EspecialLevels[0]) {
                        createFire();
                        powerGauge -= Config.EspecialLevels[0];
                        powerUsed = true;
                    }
                    break;
                case SPECIAL_LIGHTNING:
                    if (powerGauge >= Config.EspecialLevels[1]) {
                        createLightning();
                        powerGauge -= Config.EspecialLevels[1];
                        powerUsed = true;
                    }
                    break;
                case SPECIAL_CUBE:
                    if (powerGauge >= Config.EspecialLevels[2]) {
                        createCube();
                        powerGauge -= Config.EspecialLevels[2];
                        powerUsed = true;
                    }
                    break;

            }

            if (powerUsed) {
                var index = Math.floor(Math.random() * Config.CrystalLength);
                updatePowerGauge();
            }
        }

        return false;
    }
    /**
    * Cria a peça de fogo
    * randomicamente
    */
    var createFire = function () {

        var yIndex = Math.floor(Math.random() * 8);
        var xIndex = Math.floor(Math.random() * 8);

        Config.GameMap[yIndex][xIndex].transformToFire();
    }
    /**
    * Cria a peça de cubo
    * randomicamente
    */
    var createCube = function () {
        var yIndex = Math.floor(Math.random() * 8);
        var xIndex = Math.floor(Math.random() * 8);

        Config.GameMap[yIndex][xIndex].transformToCube();
    }
    /**
    * Cria a peça de relampago
    * randomicamente
    */
    var createLightning = function () {

        var yIndex = Math.floor(Math.random() * 8);
        var xIndex = Math.floor(Math.random() * 8);

        Config.GameMap[yIndex][xIndex].transformToLightning();
    }
    /**
    * Objetos afetados com o especial de cubo.
    * Retorna os objetos a serem explodidos com o especial de cubo (os de maior abundância no palco)
    */
    var getCrystalMoreElements = function (crystal) {
        var arrElements = Array();

        for (var t = 0; t < Config.GameMap.length; t++) {
            for (var k = 0; k < Config.GameMap[t].length; k++) {
                if (!arrElements[Config.GameMap[t][k].jewelIndex])
                    arrElements[Config.GameMap[t][k].jewelIndex] = Array();


                arrElements[Config.GameMap[t][k].jewelIndex].push(Config.GameMap[t][k]);
            }
        }

        var index = 0;
        var mostElements = 0;

        for (var i = 0; i < arrElements.length; i++) {

            if (arrElements[i]) {
                if (mostElements < arrElements[i].length) {
                    mostElements = arrElements[i].length
                    index = i;
                }
            }
        }

        arrElements[index].push(crystal);

        return arrElements[index];

    }
    /**
    * Objetos afetados com o especial de raio
    * retorna os objetos que cruzam o objeto.
    */
    var getCrossLineObject = function (crystal) {
        var arrCrossLine = Array();
        var i = 0;
        var cols = Config.GameMap[0].length;
        var lin = Config.GameMap.length;

        for (i = 0; i < lin; i++) {
            arrCrossLine.push(Config.GameMap[i][crystal.mapPosition.y]);
        }
        for (i = 0; i < cols; i++) {
            arrCrossLine.push(Config.GameMap[crystal.mapPosition.x][i]);

        }

        return arrCrossLine;
    }
    /**
    *  Objetos afetados com o especial do fogo.
    * retorna todos os objetos que rodeiam a peça que irá explodir
    */
    var getCrossObject = function (crystal) {
        var arr = new Array();

        arr.push(crystal);

        var _right = Config.GameMap[crystal.mapPosition.x][crystal.mapPosition.y + 1];
        var _left = Config.GameMap[crystal.mapPosition.x][crystal.mapPosition.y - 1];

        var _down = null;
        var _downLef = null;
        var _downRigh = null;

        var _topLef = null;
        var _topRigh = null;
        var _top = null;


        if ((crystal.mapPosition.x + 1) < Config.GameMap.length) {
            _topLef = Config.GameMap[crystal.mapPosition.x + 1][crystal.mapPosition.y - 1];
            _topRigh = Config.GameMap[crystal.mapPosition.x + 1][crystal.mapPosition.y + 1];
            _top = Config.GameMap[crystal.mapPosition.x + 1][crystal.mapPosition.y];
        }

        if ((crystal.mapPosition.x - 1) >= 0) {
            _down = Config.GameMap[crystal.mapPosition.x - 1][crystal.mapPosition.y];
            _downLef = Config.GameMap[crystal.mapPosition.x - 1][crystal.mapPosition.y - 1];
            _downRigh = Config.GameMap[crystal.mapPosition.x - 1][crystal.mapPosition.y + 1];
        }


        if (_right && _right != 0)
            arr.push(_right)

        if (_left && _left != 0)
            arr.push(_left)

        if (_top && _top != 0)
            arr.push(_top)

        if (_down && _down != 0)
            arr.push(_down)

        if (_topLef && _topLef != 0)
            arr.push(_topLef)

        if (_topRigh && _topRigh != 0)
            arr.push(_topRigh)

        if (_downLef && _downLef != 0)
            arr.push(_downLef)

        if (_downRigh && _downRigh != 0)
            arr.push(_downRigh)

        return arr;
    }
    /**
    * exibe a animação do fogo no palco e depois de um tempo oculta a area de efeito especial
    */
    var showFoginho = function (crystal) {

		resetEfetcts();
        var foginho = $('#efect .efExplosao');
        $('#efect').show();
        foginho.show();

        var topPos = (crystal.y + (Config.CrystalSize / 2) - (foginho.height() / 2)) + "px";
        var leftPOs = (crystal.x + (Config.CrystalSize / 2) - (foginho.width() / 2)) + "px";

        foginho.css("left", leftPOs);
        foginho.css("top", topPos);

        clearInterval(_ctrlFoginhoInterval);

        _ctrlFoginhoInterval = setInterval(function () {

            var backgroundPos = foginho.css('backgroundPosition').split(" ");
            var x = backgroundPos[0].split("px")[0];
            foginho.css('background-position', (x - foginho.width()) + "px 0");

        }, 50);

        clearInterval(_ctrlHideEfect);
        _ctrlHideEfect = setTimeout(hideEfectArea, 700)
    }	 
    /**
    * mostra a animação do raio
    */
    var showRaio = function (crystal) { 

		resetEfetcts();
        var raio = $('#efect .efRaio');
        $('#efect').show();
        raio.show();        

        var topPos = (crystal.y + (Config.CrystalSize / 2) - (raio.height() / 2)) + "px";
        var leftPOs = (crystal.x + (Config.CrystalSize / 2) - (raio.width() / 2)) + "px";

        raio.css("left", leftPOs);
        raio.css("top", topPos);

        clearInterval(_ctrlRaioInterval);

        _ctrlRaioInterval = setInterval(function () {

            var backgroundPos = raio.css('backgroundPosition').split(" ");
            var x = backgroundPos[0].split("px")[0];
            raio.css('background-position', (x - raio.width()) + "px 0");

        }, 60);

        clearInterval(_ctrlHideEfect);
        _ctrlHideEfect = setTimeout(hideEfectArea, 700)
    }
    /**
    * esconde a area do jogo após um especial
    */
    var hideEfectArea = function () {


        clearInterval(_ctrlFoginhoInterval);
        clearInterval(_ctrlRaioInterval);
        $('#efect').hide();
        $('#efect .efExplosao').hide();

        enableMapVerification(true)
    }
	/**
	* reseta a posição das animações dos efeitos especiais
	*/
	var resetEfetcts = function()
	{		
		$('#efect .efRaio').hide();
		$('#efect .efExplosao').hide();
		
		$('#efect .efRaio').css('background-position', "0 0");
		$('#efect .efExplosao').css('background-position', "0 0");
	}
    /**================================================ engine do jogo =====================================================*/
    /**
    *finaliza a partida
    */
    var endGame = function () {

        pauseTimer();
        _endGame = true;

        auxEndGame();
    }
    /**
    *auxilia o finalizar da partida
    */
    var auxEndGame = function () {

        if (_cascataCounter == 0) {
//            salvarJogo(_score, _countDica);			
			// mainContext.savePontuacao(_score);
            setTimeout(function () {
                //$(window).unbind('beforeunload', fnVerifyRefresh);
				_context.destroyGame();
				// mainContext.showCampanhaScreen();               
            }, 1000);
        } else {

            clearTimeout(_ctrlEndGameInterval);
            _ctrlEndGameInterval = setTimeout(auxEndGame, 1000);
        }
    }
    /**
    * Verificador de encadeamento
    * inicia a verficação sequencial das exploções
    */
    var enableMapVerification = function (_e) {
        if (_e) {

            _ctrlVeryfiMap = setInterval(
				function () {
				    reorderJewels();

				    if (createObjectsToEmptyBlocks() == 0) {

				        if (_endGame) {
				            enableMapVerification(false);
				        }
				   
				        if (_cascataCounter != 0 && _arrCascataObjects && _arrCascataObjects.length > 0) {
				            var objPontuacao = {
				                pontos: 0,
				                pontosAcumulados: _arrCascataObjects[0].pontosAnterior,
				                pontosAnterior: _arrCascataObjects[0].pontosAnterior,
				                estouros: 0,
				                tipo: "Cascata",
				                sequencia: "" + _arrCascataObjects[0].sequencia,
				                tempo: currentTimeMilles
				            };

				            for (var t = 0; t < _arrCascataObjects.length; t++) {

				                objPontuacao.estouros += _arrCascataObjects[t].estouros;
				                objPontuacao.pontos += _arrCascataObjects[t].pontos;
				                if (t > 0)
				                    objPontuacao.sequencia += "," + _arrCascataObjects[t].sequencia;

				            }
				            objPontuacao.pontosAcumulados += objPontuacao.pontos;

				            //salvarLogJogoWithObj(objPontuacao);

				            _arrCascataObjects = null;
				            objCascata = [];

				        }
				        _cascataCounter = 0;

				    }

				}, Config.RefreshMapTime);
        } else {
			
            clearInterval(_ctrlVeryfiMap);
        }
    }
    /**
    * pausa o jogo e esconde as peças
    */
    var pauseGame = function () {
        isPaused = !isPaused;
		_currentCristal = null;
        for (var t = 0; t < _childs.length; t++) {
            if (isPaused) {				
                _childs[t].hideCrystal();
            } else {
				_childs[t].selected = false;
                _childs[t].invalidate();
            }
        }
    }
    /**
    * cria a primeira versão do mapa em coordenadas disntintas.
    */
    var prepareJewelMap = function () {
		
		var index = Math.round(Math.random() * (Config.GameMapTemplate.length - 1));
        _currentTemplate = Config.GameMapTemplate[index];
		
        for (var t = 0; t < Config.GameMap.length; t++) {
            for (var k = 0; k < Config.GameMap[t].length; k++) {
                var c = new Crystal();

                c.x = Config.CrystalSize * k + Config.ContentX;
                c.y = Config.CrystalSize * t + Config.ContentY;

                //se essa linha for comentada, os objetos serão colocados em posição randomica. Do contrário usarão um template prototipado.
                c.jewelIndex = _currentTemplate[t][k];

                c.onSelect = childHitted;
                //c.onMoveChange = selectByMove;
                c.onEndAnimation = checkColigion;
                c.mapPosition = { x: t, y: k };
                add(c);
                Config.GameMap[t][k] = c;
            }
        }
        // window.onmousedown = childHitted;
    }
    /**
    * permite que a clicar em uma peça e arrastar a mesma sobre a outra, faça com que a peça tome o lugar da peça alvo.
    */
    var selectByMove = function (direction) {

        if (!_endGame && !isPaused) {
            switch (direction) {
                case CrystalDirection.UP:
                    if (_currentCristal.mapPosition.x > 0)
                        swapCrystal(Config.GameMap[_currentCristal.mapPosition.x - 1][_currentCristal.mapPosition.y]);
                    break;
                case CrystalDirection.DOWN:
                    if (_currentCristal.mapPosition.x < (Config.GameMap.length - 1))
                        swapCrystal(Config.GameMap[_currentCristal.mapPosition.x + 1][_currentCristal.mapPosition.y]);
                    break;
                case CrystalDirection.RIGHT:
                    if (_currentCristal.mapPosition.y < (Config.GameMap[0].length - 1))
                        swapCrystal(Config.GameMap[_currentCristal.mapPosition.x][_currentCristal.mapPosition.y + 1]);
                    break;
                case CrystalDirection.LEFT:
                    if (_currentCristal.mapPosition.y > 0)
                        swapCrystal(Config.GameMap[_currentCristal.mapPosition.x][_currentCristal.mapPosition.y - 1]);
                    break;
            }
        } else {
            //alert("jogo finalizado!")
        }
    }
    /**
    * controal quando o objeto foi clicado, na primeira vez (sem objeto selecionado), marca o obejto original. Na segunda
    * procede com o swap dos mesmos. Caso um adverso ou não possivel seja selecionado o primeiro é desmarcado e este novo torna-se o origem
    */
    var childHitted = function (crystal) {
        if (!_endGame && !isPaused && !crystal.busy) {
            if (!crystal.isEspecial) {
                var selectedCrystal = crystal;
                selectedCrystal.selected = true;
                selectedCrystal.invalidate();
                if (selectedCrystal) {
                    if (!_currentCristal) {
                        _currentCristal = selectedCrystal;
                        _currentCristal.selected = true;

                    } else {
                        if (_currentCristal !== selectedCrystal) {
                            swapCrystal(selectedCrystal);
                        } else {
                            _currentCristal.selected = false;
                            _currentCristal.invalidate();
                            _currentCristal = null;
                        }
                    }
                }
            } else {

                crystal.isEspecialUsed = true;
                enableMapVerification(false)
                switch (crystal.jewelIndex) {
                    case Config.FireIndex:
                        showFoginho(crystal);

                        var arrToExplode = getCrossObject(crystal);
                        var pontosN = arrToExplode.length * Pontuacao.MultiplicadorFogo;
                        //salvarLogJogo(pontosN, pontosN + _score, _score, arrToExplode.length, "Especial Fogo", "" + arrToExplode.length, currentTimeMilles);

                        incrementScore(pontosN);
                        explodeObjects(arrToExplode);

                        break;
                    case Config.LightningIndex:
                        showRaio(crystal);

                        var arrToExplode = getCrossLineObject(crystal);

                        var pontosN = arrToExplode.length * Pontuacao.MultiplicadorRaio;
                        //salvarLogJogo(pontosN, pontosN + _score, _score, arrToExplode.length, "Especial Raio", "" + arrToExplode.length, currentTimeMilles);

                        incrementScore(pontosN);
                        explodeObjects(arrToExplode);

                        break;
                    case Config.CubeIndex:

                        var arrToExplode = getCrystalMoreElements(crystal)
                        var pontosN = arrToExplode.length * Pontuacao.MultiplicadorCubo;
                        //salvarLogJogo(pontosN, pontosN + _score, _score, arrToExplode.length, "Especial Cubo", "" + arrToExplode.length, currentTimeMilles);

                        incrementScore(pontosN);
                        explodeObjects(arrToExplode);

                        enableMapVerification(true)
                        break;
                }
            }
        } else {
            // alert("jogo finalizado!")
        }
    }
    /**
    * Faz a troca das peças, tanto no mappa lógico como no visual.
    */
    var swapCrystal = function (_c) {

        if (!_c.busy) {
            if (_c != 0) {
                _c.selected = false;
                _currentCristal.selected = false;

                _c.invalidate();
                _currentCristal.invalidate();

                if ((_c.x == _currentCristal.x && distance(_c.y, _currentCristal.y) == Config.CrystalSize) || (_c.y == _currentCristal.y && distance(_c.x, _currentCristal.x) == Config.CrystalSize)) {


                    _currentCristal.selected = false;
                    _c.selected = false;

                    _c.xTo = _currentCristal.x;
                    _c.yTo = _currentCristal.y;

                    _currentCristal.xTo = _c.x;
                    _currentCristal.yTo = _c.y;

                    var auxMapP = _c.mapPosition;
                    _c.mapPosition = _currentCristal.mapPosition;
                    _currentCristal.mapPosition = auxMapP;

                    Config.GameMap[_c.mapPosition.x][_c.mapPosition.y] = _c;
                    Config.GameMap[_currentCristal.mapPosition.x][_currentCristal.mapPosition.y] = _currentCristal;

                    var index = getChildIndex(_currentCristal);

                    _childs[index] = _childs[_childs.length - 1];
                    _childs[_childs.length - 1] = _currentCristal;

                    _c.moveTo({ x: _c.xTo, y: _c.yTo });
                    _currentCristal.moveTo({ x: _currentCristal.xTo, y: _currentCristal.yTo });

                    TweenLite.delayedCall(0.3, checkSwapColigion, [_c, _currentCristal]);


                    setHigherDepth(_currentCristal);
                    _currentCristal.selected = true;
                    _currentCristal = null;

                } else {

                    _currentCristal = _c
                    _currentCristal.selected = true;
                    _currentCristal.invalidate();
                }
            } else {
                _currentCristal.selected = false;
                _currentCristal.invalidate();
                _currentCristal = null;
            }
        }

    }
    /**
    * verifica se o swap das peças finalizou em colisão, do contrário procede o retorno a posição original.
    */
    var checkSwapColigion = function (crystal1, crystal2) {
        var objExplosao1 = checkObjectColigion(crystal1);
        var objExplosao2 = checkObjectColigion(crystal2);

        if (objExplosao1 != null || objExplosao2 != null) {

            var arrToExplode = [];

            if (objExplosao1 != null) {

                var pontosN = cristalToScore(objExplosao1.elementos.length, objExplosao1.elementos[0].jewelIndex) + Pontuacao.MultiplicadorCascata * _cascataCounter;
                if (_cascataCounter == 0) {

                    //salvarLogJogo(pontosN, _score + pontosN, _score, objExplosao1.elementos.length, "Jogada Normal", objExplosao1.elementos.length + "", currentTimeMilles);
                } else {
                    if (_arrCascataObjects == null)
                        _arrCascataObjects = [];


                    var objCascata =
                    {

                        pontos: pontosN,
                        pontosAcumulados: _score + pontosN,
                        pontosAnterior: _score,
                        estouros: objExplosao1.elementos.length,
                        sequencia: objExplosao1.elementos.length + ""
                    };
                    _arrCascataObjects.push(objCascata);
                }
                arrToExplode = arrToExplode.concat(objExplosao1.elementos);
                incrementScore(pontosN);

                _cascataCounter++;
            } else {
                crystal1.busy = false;
            }

            if (objExplosao2 != null) {

                var pontosN = cristalToScore(objExplosao2.elementos.length, objExplosao2.elementos[0].jewelIndex) + Pontuacao.MultiplicadorCascata * _cascataCounter;
                if (_cascataCounter == 0) {

                    //salvarLogJogo(pontosN, _score + pontosN, _score, objExplosao2.elementos.length, "Jogada Normal", objExplosao2.elementos.length + "", currentTimeMilles);
                } else {
                    if (_arrCascataObjects == null)
                        _arrCascataObjects = [];

                    var objCascata =
                        {

                            pontos: pontosN,
                            pontosAcumulados: _score + pontosN,
                            pontosAnterior: _score,
                            estouros: objExplosao2.elementos.length,
                            sequencia: objExplosao2.elementos.length + ""
                        };
                    _arrCascataObjects.push(objCascata);
                }

                arrToExplode = arrToExplode.concat(objExplosao2.elementos);
                incrementScore(pontosN);
                _cascataCounter++;
            } else {
                crystal2.busy = false;
            }
            explodeObjects(arrToExplode)
        } else {
            backTransition(crystal1, crystal2);
        }
    }
    /**
    * verifica a colisão do objeto após uma movimentação de peças.
    */
    var checkColigion = function (_crystal) {
        var objExplosao = checkObjectColigion(_crystal);
        if (objExplosao != null) {


            if (_arrCascataObjects == null)
                _arrCascataObjects = [];

            var pontosN = cristalToScore(objExplosao.elementos.length, objExplosao.elementos[0].jewelIndex) + Pontuacao.MultiplicadorCascata * _cascataCounter;

            var objCascata = {

                pontos: pontosN,
                pontosAcumulados: _score + pontosN,
                pontosAnterior: _score,
                estouros: objExplosao.elementos.length,
                sequencia: objExplosao.elementos.length + ""
            };
            _arrCascataObjects.push(objCascata);
            _cascataCounter++;

            incrementScore(pontosN);
            explodeObjects(objExplosao.elementos);

        }
    }
    /**
    * faz com que a tranziação inválida retorne ao estado de origem
    * ex: jogador move objetos que não fazem combinação.
    */
    var backTransition = function (obj1, obj2) {
        /*
        var _nscore = parseInt( (_score -2), 0 );
        _score = Math.max(0,_nscore);	
        */
        obj1.xTo = obj2.x;
        obj1.yTo = obj2.y;

        obj2.xTo = obj1.x;
        obj2.yTo = obj1.y;

        obj2.moveToEndBusy({ x: obj2.xTo, y: obj2.yTo });
        obj1.moveToEndBusy({ x: obj1.xTo, y: obj1.yTo });

        var auxMapP = obj1.mapPosition;
        obj1.mapPosition = obj2.mapPosition;
        obj2.mapPosition = auxMapP;

        Config.GameMap[obj1.mapPosition.x][obj1.mapPosition.y] = obj1;
        Config.GameMap[obj2.mapPosition.x][obj2.mapPosition.y] = obj2;
    }
    /**
    * Explode os objetos fonecidos no vetor
    */
    var explodeObjects = function (arr) {
        if (arr.length) {

            updateScore();
            updatePowerGauge();
            for (var t = 0; t < arr.length; t++) {

                if (arr[t].isEspecial && !arr[t].isEspecialUsed) {
                    childHitted(arr[t]);
                } else {
                    if (arr[t].mapPosition) {
                        var auxMap = arr[t].mapPosition;
                        Config.GameMap[auxMap.x][auxMap.y] = 0;
                        remove(arr[t]);
                    }
                }

            }
        }
    }
    /**
    * Cria os objetos a serem encaminhados aos espaços vagos.
    */
    var createObjectsToEmptyBlocks = function () {
        /*	console.log("mapa antes completar")
        debugMap();*/
        var totalCreated = 0;
        for (var t = 0; t < Config.GameMap.length; t++) {
            for (var k = 0; k < Config.GameMap[t].length; k++) {
                if (Config.GameMap[t][k] == 0) {
                    var c = new Crystal();
                    Config.GameMap[t][k] = c;
                    c.x = Config.CrystalSize * k + Config.ContentX;
                    c.y = -40;
                    c.onSelect = childHitted;
                    //c.onMoveChange = selectByMove;
                    c.onEndAnimation = checkColigion;
                    c.mapPosition = { x: t, y: k };
                    add(c);
                    if (isPaused)
                        c.hideCrystal();

                    c.animeTo({ x: c.x, y: (Config.CrystalSize * t + Config.ContentY) });
                    totalCreated++;

                }
            }
        }
        /*console.log("mapa depois completar")*/
        //	debugMap();
        return totalCreated;
    }
    /**
    * Verficia os objetos que colidem com o objeto fornecido.
    * na vertical e na horizontal
    * retorna { juncao : true|false, elementos : [] }
    */
    var checkObjectColigion = function (_crystal) {
        var arrVertical = Array();
        var arrHorizontal = Array();

        var objReturn = null;

        var i = 0;
        var cols = Config.GameMap[0].length;
        var lin = Config.GameMap.length;


        //Varre a linhas (cord y)--	
        for (i = _crystal.mapPosition.x - 1; i >= 0; i--) {
            var c = Config.GameMap[i][_crystal.mapPosition.y];

            if (c != 0 && _crystal.jewelIndex == c.jewelIndex)
                arrVertical.push(c)
            else
                break;
        }
        // Varre a linhas (cord y) ++
        for (i = _crystal.mapPosition.x + 1; i < lin; i++) {
            var c = Config.GameMap[i][_crystal.mapPosition.y];
            if (c != 0 && _crystal.jewelIndex == c.jewelIndex)
                arrVertical.push(c)
            else
                break;
        }

        //Varre a coluna (cord x)--	
        for (i = _crystal.mapPosition.y - 1; i >= 0; i--) {
            var c = Config.GameMap[_crystal.mapPosition.x][i];
            if (c != 0 && _crystal.jewelIndex == c.jewelIndex)
                arrHorizontal.push(c)
            else
                break;
        }
        // Varre a coluna (cord x) ++
        for (i = _crystal.mapPosition.y + 1; i < cols; i++) {
            var c = Config.GameMap[_crystal.mapPosition.x][i];
            if (c != 0 && _crystal.jewelIndex == c.jewelIndex)
                arrHorizontal.push(c)
            else
                break;
        }

        if (arrHorizontal.length >= 2 || arrVertical.length >= 2) {
            objReturn = { juncao: (arrHorizontal.length >= 2 && arrVertical.length >= 2), elementos: [] };

            if (arrHorizontal.length >= 2)
                objReturn.elementos = objReturn.elementos.concat(arrHorizontal);

            if (arrVertical.length >= 2)
                objReturn.elementos = objReturn.elementos.concat(arrVertical);

            objReturn.elementos = objReturn.elementos.concat([_crystal]);
        }

        return objReturn;
    }
    /**
    * reordena os objetos após alguma explosão ou especial
    * "desce os objetos para as lacunas abertas"
    */
    var reorderJewels = function () {
        var totalCols = Config.GameMap[0].length;
        var totalLines = Config.GameMap.length;
        var arrJewelsToAnime = new Array();

        for (var t = 0; t < totalCols; t++) {
            for (var k = (totalLines - 1); k >= 0; k--) {

                if (Config.GameMap[k][t] == 0) {
                    for (var j = k; j >= 0; j--) {
                        if (Config.GameMap[j][t] != 0) {
                            Config.GameMap[k][t] = Config.GameMap[j][t];
                            var xTo = Config.CrystalSize * t + Config.ContentX;
                            var yTo = Config.CrystalSize * k + Config.ContentY;
                            Config.GameMap[k][t].mapPosition = { x: k, y: t };
                            Config.GameMap[j][t] = 0;

                            Config.GameMap[k][t].animeTo({ x: xTo, y: yTo });

                            //	new AnimeTo().init(Config.GameMap[k][t], Config.TimeTrasition,null).start();					

                            break;
                        }
                    }
                }
            }
        }
    }
    /**
    * verifica se os elementos primários ao jogo estão disponivies (revisar e incrementar)
    */
    var initGame = function () {
        _stageDiv = document.getElementById("stageHtml");
        return true;
    }
    /*
    * converte a quantidade de cristais explodidos em pontuação
    */
    var cristalToScore = function (_l, indexJew) {

        var _sc = 0;

        switch (_l) {
            case 3:
                _sc = Pontuacao.MultiplicadorPeca3;
                incrementPowerGauge(.01);
                break;
            case 4:
                _sc = Pontuacao.MultiplicadorPeca4;
                incrementPowerGauge(.1);
                break;
            case 5:
                _sc = Pontuacao.MultiplicadorPeca5;
                incrementPowerGauge(.2);
                break;
            case 6:
                _sc = Pontuacao.MultiplicadorPeca6;
                incrementPowerGauge(.3);
                break;
            case 7:
            default:
                incrementPowerGauge(.4);
                _sc = Pontuacao.MultiplicadorPeca7;
                break;
        }
        return _sc;
    }
    /**================================================ Gerenciadores de layout =====================================================*/

    /**
    * controla a inseração de uma nova peça no palco do jogo
    */
    var add = function (crystal) {
        crystal.init(_stageDiv);
        _childs.push(crystal);
    }
    /**
    * controla a remoção de uma nova peça no palco do jogo
    */
    var remove = function (crystal) {
        var index = getChildIndex(crystal);
        TweenLite.killTweensOf(crystal);
        if (index != -1) {
            _childs.splice(index, 1);
        }
        crystal.destroy();
    }
    /*
    * swap de objeto
    * permite que o objeto movido passe por cima do objeto alvo.
    */
    var setHigherDepth = function (_cristal) {
        for (var t = 0; t < _childs.length; t++) {
            _childs[t].setZIndex("" + (t + 1));

        }

        _cristal.setZIndex("" + (_childs.length + 3));
    }
    /*
    * Permite capturar o index do objeto desejado, dentro do vetor principal que oculpa o palco do jogo.
    * retorna -1 se o objeto não for encontrado.
    */
    var getChildIndex = function (_child) {
        for (var t = 0; t < _childs.length; t++) {
            if (_childs[t] === _child)
                return t;
        }

        return -1;
    }
    /*
    * retorna a distância em pixes dos objetos
    */
    var distance = function (v1, v2) {
        return Math.max(v1, v2) - Math.min(v1, v2);
    }
    /** ================================================ auxFunctions ============================================*/
    /**
    * Fução de debug, permite ver o mapa em console nas suas formas originais, representado por número (um para cada peça)
    */
    var debugMap = function () {
        console.log("######map######");
        for (var t = 0; t < Config.GameMap.length; t++) {
            var line = "";
            for (var k = 0; k < Config.GameMap[t].length; k++) {
                line += (Config.GameMap[t][k] != 0 ? Config.GameMap[t][k].jewelIndex : "x") + " "
            }
            console.log(line);
        }
        console.log("######end######");
        console.log("#leg:##########");
        console.log("#x = vazio    #");
        console.log("#!x = index   #");
        console.log("###############");
    }
    /**
    * prenche o zero das unidades caso necessário
    */
    var fillZero = function (val) {
        return val < 10 ? "0" + val : val;
    }
    /**formata os pontos em numeros separados por pontos*/
    var formatPoints = function (val) {

        var strPoints = "";
        for (var t = 0; t < val.length; t++) {

            if (t % 3 == 0 && t != 0) {
                strPoints += ".";
            }
            strPoints += val.charAt(t);
        }

        return strPoints;
    }
    /**
    * Captura os objetos json do servidor
    */
    var getJson = function (urlRequest, vars) {//Gerenciado geral das chamadas json.
	/*
        var json = $.toJSON(vars);

        $.ajax({
            url: urlRequest.url,
            type: "POST",
            dataType: "json",
            data: json,
            contentType: "application/json; charset=utf-8",
            timeout: 6000000,
            error: function (jqXHR, textStatus, errorThrown) {
                //alert("Ocorreu um problema em sua solicitação. Por favor, tente novamente.");
            },
            success: function (response) {
                switch (urlRequest.type) {

                    case GET_JOGO_INFO.type:
                        initAfterGetInfo(response);
                        break;
                    case POST_SALVAR_DICA.type:
                        refreshDicas(response);
                        break;
                    case POST_SALVAR_PONTO_JOGADA.type:
                        //do something!
                        break;
                    case POST_SALVAR_FIM_JOGO.type:
                        //do something!
                        break;

                }
            }
        });
		*/
    }
    /*
    *
    * busca as informações iniciais do jogo
    **/
    var requestGameInfo = function () {

        $("#GameArea .painelTempo .pausePlayControle a.play").hide();
        $("#dica a.backToGame").hide();
        getJson(GET_JOGO_INFO, {});
    }
    /**
    * libera o inicio do jogo após o carregamento das informações primárias
    */
    var initAfterGetInfo = function (res) {


        ganhoPremioSurpresa = res.premioExtra;
        for (var t = 0; t < res.dicas.length; t++) {

            var d = res.dicas[t];
            arrDicas[parceiros[d.Parceiro]].push({ id: d.Id, title: d.Titulo, text: d.Descricao, idParceiro: d.IdParceiro, parceiro: d.Parceiro });
        }
        $("#GameArea .painelTempo .pausePlayControle a.play").show();
        $("#dica a.backToGame").show();

        if (ganhoPremioSurpresa) {
            showPremioInstantaneo();
        }

    }
    /*
    * insere a nova dica recebida após uma dica ter sido exibida
    **/
    var refreshDicas = function (res) {

        var d = res.Dica;
        var index = parceiros[d.Parceiro];
        arrDicas[index].push({ id: d.Id, title: d.Titulo, text: d.Descricao, idParceiro: d.IdParceiro, parceiro: d.Parceiro });
        //console.log(arrDicas[index].length);

    }
    /**
    * Salvar log da pontuação
    */
    var salvarLogJogo = function (_pontos, _pontosAcumulados, _pontosAnterior, _estouros, _tipo, _sequencia, _tempo) {

        var objPontuacao = {
            pontos: _pontos,
            pontosAcumulados: _pontosAcumulados,
            pontosAnterior: _pontosAnterior,
            estouros: _estouros,
            tipo: _tipo,
            sequencia: _sequencia,
            tempo: _tempo
        };
        getJson(POST_SALVAR_PONTO_JOGADA, objPontuacao);

    }
    /**
    * Salvar log da pontuação com o objeto montado
    */
    var salvarLogJogoWithObj = function (obj) {

        getJson(POST_SALVAR_PONTO_JOGADA, obj);

    }
    /**
    * Salvar o fim do jogo
    */
	/*
    var salvarJogo = function (_pontos, _dicas) {

        var objFimJogo = {
            pontos: _pontos,
            dicas: _dicas
        }
        getJson(POST_SALVAR_FIM_JOGO, objFimJogo);
    }*/
    var verifyRefresh = function () {

        $(window).bind('beforeunload', fnVerifyRefresh);
    }
    var fnVerifyRefresh = function () {

        salvarLogJogo(0, _score, _score, 0, "Refresh", "", currentTimeMilles);
        return 'Cuidado! Sair ou atualizar está pagina finaliza a sessão do jogo!';

    }

}

/**
* =========================================== inicializador da classe =================================
*/
/*
$(function () {

    GameResouces = new Resource();
    GameResouces.onComplete = function () {
        mainContextGame = new MainGame().init();
    }
    GameResouces.load();
});
*/