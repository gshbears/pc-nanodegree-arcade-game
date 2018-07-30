/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

var Engine = (function (global) {

	/* Added ScoreBoard to Engine */
	var doc = global.document,
		win = global.window,
		scoreCanvas = doc.createElement('canvas'),
		scoreCTX = scoreCanvas.getContext('2d'),
		canvas = doc.createElement('canvas'),
		ctx = canvas.getContext('2d'),
		lastTime;
	/* Added ScoreBoard to Engine */
	scoreCanvas.width = 505;
	scoreCanvas.height = 100;

	doc.body.appendChild(scoreCanvas);
	/* Predefine the variables we'll be using within this scope,
	 * create the canvas element, grab the 2D context for that canvas
	 * set the canvas elements height/width and add it to the DOM.
	 */

	canvas.width = 505;
	canvas.height = 606;

	doc.body.appendChild(canvas);

	/* This function serves as the kickoff point for the game loop itself
	 * and handles properly calling the update and render methods.
	 */
	function main() {
		/* Get our time delta information which is required if your game
		 * requires smooth animation. Because everyone's computer processes
		 * instructions at different speeds we need a constant value that
		 * would be the same for everyone (regardless of how fast their
		 * computer is) - hurray time!
		 */
		var now = Date.now(),
			dt = (now - lastTime) / 1000.0;

		/* Call our update/render functions, pass along the time delta to
		 * our update function since it may be used for smooth animation.
		 */

		update(dt);
		render();


		/* Set our lastTime variable which is used to determine the time delta
		 * for the next time this function is called.
		 */
		lastTime = now;

		/* Use the browser's requestAnimationFrame function to call this
		 * function again as soon as the browser is able to draw another frame.
		 */
		win.requestAnimationFrame(main);
	}

	/* This function does some initial setup that should only occur once,
	 * particularly setting the lastTime variable that is required for the
	 * game loop.
	 */
	function init() {

		fillAvailPlayers();
		fillEnemies();
		reset();
		lastTime = Date.now();
		main();
	}

	/* This function is called by main (our game loop) and itself calls all
	 * of the functions which may need to update entity's data. Based on how
	 * you implement your collision detection (when two entities occupy the
	 * same space, for instance when your character should die), you may find
	 * the need to add an additional function call here. For now, we've left
	 * it commented out - you may or may not want to implement this
	 * functionality this way (you could just implement collision detection
	 * on the entities themselves within your app.js file).
	 */
	function update(dt) {
		if (gameRunning === true) {
			updateEntities(dt);
			checkCollisions();
			addNewGamePieces(); //Gems Keys and Enemies to board
		} else {
			updateAvilPlayers();
		}
	}

	/* This is called by the update function and loops through all of the
	 * objects within your allEnemies array as defined in app.js and calls
	 * their update() methods. It will then call the update function for your
	 * player object. These update methods should focus purely on updating
	 * the data/properties related to the object. Do your drawing in your
	 * render methods.
	 */
	function updateEntities(dt) {
		activeGems.forEach(function (gem) {
			gem.update(dt);
		});
		activeKey.update();
		allEnemies.forEach(function (enemy) {
			enemy.update(dt);
		});
		player.update();
	}

	function updateAvilPlayers() {
		availablePlayer.forEach(function (selP) {
			selP.update();
		});
	}
	/* This function initially draws the "game level", it will then call
	 * the renderEntities function. Remember, this function is called every
	 * game tick (or loop of the game engine) because that's how games work -
	 * they are flipbooks creating the illusion of animation but in reality
	 * they are just drawing the entire screen over and over.
	 */
	function render() {
		/* Added ScoreBoard to Engine render   */
		renderScoreBoard();
		if (gameRunning === true) {
			renderGameBoard();
			renderEntities();
		} else {
			renderGameSetup();
			renderAvilPlayers();
		}
	}

	function renderGameBoard() {
		/* This array holds the relative URL to the image used
		 * for that particular row of the game level.
		 */
		var rowImages = [
				'images/water-block.png', // Top row is water
				'images/stone-block.png', // Row 1 of 3 of stone
				'images/stone-block.png', // Row 2 of 3 of stone
				'images/stone-block.png', // Row 3 of 3 of stone
				'images/grass-block.png', // Row 1 of 2 of grass
				'images/grass-block.png' // Row 2 of 2 of grass
			],
			numRows = 6,
			numCols = 5,
			row, col;

		// Before drawing, clear existing canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		/* Loop through the number of rows and columns we've defined above
		 * and, using the rowImages array, draw the correct image for that
		 * portion of the "grid"
		 */

		for (row = 0; row < numRows; row++) {
			for (col = 0; col < numCols; col++) {
				/* The drawImage function of the canvas' context element
				 * requires 3 parameters: the image to draw, the x coordinate
				 * to start drawing and the y coordinate to start drawing.
				 * We're using our Resources helpers to refer to our images
				 * so that we get the benefits of caching these images, since
				 * we're using them over and over.
				 */
				ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
			}
		}
	}
	/* Function to handle the scorebaord
	 *https://www.w3schools.com/tags/ref_canvas.asp
	 */
	function renderScoreBoard() {
		// Before drawing, clear existing canvas
		var row = 10,
			col = 50,
			gemRow = 30,
			labelRow = 85;

		scoreCTX.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height)
		scoreCTX.fillRect(0, 0, 505, 100);

		scoreCTX.font = "30px Arial";
		scoreCTX.fillStyle = "white";
		scoreCTX.fillText("Gem Raider", 170, 30);
		scoreCTX.font = "25px Arial";
		scoreCTX.fillText("Score", 215, 60);
		scoreCTX.font = "20px Arial";
		scoreCTX.fillText(score, setLabelPosx(253), labelRow);
		scoreCTX.font = "15px Arial";
		scoreCTX.drawImage(Resources.get('images/Key.png'), 5, 12, 40, 50);
		scoreCTX.fillText("x  " + goldkeys, 43, 52);
		scoreCTX.drawImage(Resources.get('images/Gem Blue.png'), 330, gemRow, 30, 40);
		scoreCTX.fillText("25 pts", 325, labelRow);
		scoreCTX.drawImage(Resources.get('images/Gem Green.png'), 385, gemRow, 30, 40);
		scoreCTX.fillText("50 pts", 383, labelRow);
		scoreCTX.drawImage(Resources.get('images/Gem Orange.png'), 445, gemRow, 30, 40);
		scoreCTX.fillText("100 pts", 440, labelRow);
		scoreCTX.fillStyle = "#202020";

		for (life = 0; life < 5; life++) {
			if (life < lives) {
				scoreCTX.drawImage(Resources.get('images/Heart.png'), row, col, 30, 40);
				row += 30;
			} else {
				//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
				scoreCTX.globalCompositeOperation = "luminosity" //"destination-out";
				scoreCTX.drawImage(Resources.get('images/Heart.png'), row, col, 30, 40);
				scoreCTX.globalCompositeOperation = "source-over";
				row += 30;
			}
		}
	}
	/* Function to handle the scorebaord
	 *https://www.w3schools.com/tags/ref_canvas.asp
	 */

	function setLabelPosx(number) {
		// this function is to center the score for canvas placement due to length changing
		var strScore = score.toString()
		var newX = number - (strScore.length * 7);
		return newX;
	}

	function renderGameSetup() {
		// Before drawing, clear existing canvas
		var row = 380,
			col = 151,
			charRow = 151,
			labelRow = 200;

		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.fillRect(0, 0, 505, 605);
		ctx.font = "20px Arial";
		ctx.fillStyle = "white";
		ctx.fillText(gameStatus[gameStatusIndex].StatusNote, gameStatus[gameStatusIndex].x, gameStatus[gameStatusIndex].y);

		ctx.font = "15px Arial";
		ctx.fillText("Character: Press arrow keys to highlight desired charcter.", 15, row);
		row += 30;
		ctx.fillText("Start Game: Press the 'Enter' key", 15, row);
		row += 30;
		ctx.fillText("Pause Game: Press the 'p' key", 15, row);
		row += 30;
		ctx.fillText("Restart Game: Press the 'r' key", 15, row);
		row += 30;
		ctx.fillText("Score: Collect various gems at various values to gain points.", 15, row);
		row += 30;
		ctx.fillText("Hearts: Lose a life when running into an Enemy on the road.", 15, row);
		row += 30;
		ctx.fillText("Keys: Collect 3 keys to gain lives back.", 15, row);
		row += 30;
		ctx.fillText("In Trouble?: Jumping into water, moves your player to starting position.", 15, row);
		ctx.fillStyle = "#202020";
	}

	/* This function is called by the render function and is called on each game
	 * tick. Its purpose is to then call the render functions you have defined
	 * on your enemy and player entities within app.js
	 */
	function renderEntities() {
		/* Loop through all of the objects within the allEnemies array and call
		 * the render function you have defined.
		 */
		activeGems.forEach(function (gem) {
			gem.render();
		});
		activeKey.render();
		allEnemies.forEach(function (enemy) {
			enemy.render();
		});
		player.render();
	}

	function renderAvilPlayers() {
		availablePlayer.forEach(function (selP) {
			selP.render();
		});
	}
	/* This function does nothing but it could have been a good place to
	 * handle game reset states - maybe a new game menu or a game over screen
	 * those sorts of things. It's only called once by the init() method.
	 */
	function reset() {
		resetValues();
	}

	/* Go ahead and load all of the images we know we're going to need to
	 * draw our game level. Then set init as the callback method, so that when
	 * all of these images are properly loaded our game will start.
	 */
	Resources.load([
		'images/stone-block.png',
		'images/water-block.png',
		'images/grass-block.png',
		'images/enemy-bug.png',
		'images/char-boy.png',
		'images/char-cat-girl.png',
		'images/char-horn-girl.png',
		'images/char-pink-girl.png',
		'images/char-princess-girl.png',
		'images/Gem Blue.png',
		'images/Gem Green.png',
		'images/Gem Orange.png',
		'images/Heart.png',
		'images/Key.png',
		'images/Rock.png', // Future Add for grass obstacle
		'images/Selector.png'
	]);
	Resources.onReady(init);

	/* Assign the canvas' context object to the global variable (the window
	 * object when run in a browser) so that developers can use it more easily
	 * from within their app.js files.
	 */
	global.ctx = ctx;
})(this);
