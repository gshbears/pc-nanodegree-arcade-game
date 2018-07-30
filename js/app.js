// Enemies our player must avoid
var Enemy = function (x, road, speed, direction) {
	// Variables applied to each of our instances go here,
	// we've provided one for you to get started

	// The image/sprite for our enemies, this uses
	// a helper we've provided to easily load images
	this.x = x;
	this.y = road;
	this.slot = "00"; // quick collision detection
	this.speed = speed;
	this.direction = direction; // 0 left 1 right
	this.sprite = 'images/enemy-bug.png';
	this.activeBug = false; // turn bug off and on with delays
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
	// You should multiply any movement by the dt parameter
	// which will ensure the game runs at the same speed for
	// all computers
	if (gameRunning === true && this.activeBug === true) {
		// Every 1000 points the enemies speed will increase relative to the randomized speed
		level = Math.floor(score / 1000) + 1;
		var increment = dt * ((this.speed * 45) + (level * 20));
		if (this.direction == 0) {
			// Enmies moving left to right
			this.x = this.x + increment;
			if (this.x > 500 && this.activeBug === true) {
				this.activeBug = false;
			}
		} else {
			// Enmies moving right to left
			this.x = this.x - increment;
			if (this.x < -100 && this.activeBug === true) {
				this.activeBug = false;
			}
		}
		// creating a board slot to compare for collsions due to images at different placements
		var slotX = "0";
		var slotY = "0";

		if (this.x > -68 && this.x <= 500) {
			var intX = Math.floor(((this.x + 50) / 100) + 1);
			slotX = parseInt(intX);
			if (this.y == 62) {
				slotY = "1";
			} else if (this.y == 145) {
				slotY = "2";
			} else if (this.y == 230) {
				slotY = "3";
			}
		}
		this.slot = '' + slotX + slotY;
	}
};
// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
	if (this.activeBug === true) {
		if (this.direction == 0) {
			ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 101, 171);
		} else {
			ctx.scale(-1, 1);
			ctx.drawImage(Resources.get(this.sprite), (this.x + 100) * -1, this.y, 101, 171);
			ctx.scale(-1, 1);
		}
	}
};

function checkCollisions() {
	checkGemCollisions();
	checkKeyCollisions();
	checkEnemyCollisions();
}

function addNewEnemies() {
	var delay = 100;
	allEnemies.forEach(function (enemy) {
		if (enemy.activeBug === false && enemyRandomInProgress === false) {
			enemyRandomInProgress = true;
			setTimeout(function AddEnemyTime() {
				var enemyAttr = randomizeEnemyStart();
				//  start,road,speed,direction
				enemy.x = enemyAttr[0];
				enemy.y = enemyAttr[1];
				enemy.speed = enemyAttr[2];
				enemy.direction = enemyAttr[3];
				enemy.activeBug = true;
				enemyRandomInProgress = false;
			}, delay);
			delay += 1500
		}
	});
}

function addNewKeysAndGems() {
	if (gemCollsions == 5 && lives <= 3) {
		gemCollsions = 0;
		console.log("add Key");
		setTimeout(function keyAdded() {
			addKey();
		}, 550);
	} else {
		if (lives > 3) {
			gemCollsions = 0;
		}
		setTimeout(function gemAdded() {
			addGems();
		}, 550);
	}
}

function addNewGamePieces() {
	addNewEnemies();
	addNewKeysAndGems();
}

function resetPlayerXY() {
	bResetPlayerXY = true;

	setTimeout(function water() {
		player.x = 200;
		player.y = 400;
		player.slot = "00"
		bResetPlayerXY = false;
	}, 150);
}

function checkEnemyCollisions() {
	if (gameRunning === true) {

		allEnemies.forEach(function (slotXY) {
			if (slotXY.slot === player.slot && bResetPlayerXY === false && slotXY.slot != "00") {
				lives -= 1;
				// Temporary turn off keystroke to avoid extra player movement when resetting position
				resetPlayerXY();
				if (lives == 0) {
					//Game Over! gamestops running and displays game over message
					gameOver = true;
					gameRunning = false;
					gameStatusIndex = 2;
					gameStatus[2].StatusNote = "Gave Over - You Scored " + score + " Points!"
				}
			}
		});
	}
};

function checkGemCollisions() {
	// checking for gem collision
	activeGems.forEach(function (slotXY) {
		if (slotXY.slot === player.slot) {
			score += slotXY.points;
			gemCollsions += 1;
			removeGemSlot(slotXY.slot);
		}
	});
};

function checkKeyCollisions() {
	// checking for Key collision
	if (player.slot === activeKey.slot && player.slot != "00") {
		goldkeys += 1;
		activeKey.slot = "00"
		if (goldkeys == 3) {
			lives += 1;
			goldkeys = 0;
		}
	}
};

function checkWater() {
	if (player.y < 68) {
		// Temporary turn off keystroke to avoid extra player movement when reseting position
		resetPlayerXY();
	}
}

function removeGemSlot(slotXY) {
	// clean up removed gem / key gamebord places
	if (activeGems !== 'undefined') {
		var spliceIndex = 0;
		for (let i = 0; i < activeGems.length; i++) {
			if (activeGems[i].slot === slotXY) {
				activeGems.splice(spliceIndex, 1)
			}
			spliceIndex -= 1
		}
	};
}

class keyClass {
	constructor(selectKey, slot) {
		this.x = 0;
		this.y = 0;
		this.slot = slot;
		this.sprite = selectKey;
	}
	// This class requires an update(), render() and
	update() {
		// translates the boardspace to position relative to the goldkey image
		if (this.slot != undefined && this.slot != "00") {

			var slotX = Number.parseInt(this.slot.charAt(0));
			var slotY = Number.parseInt(this.slot.charAt(1));

			this.x = ((slotX * 100) - 100) + 15;

			switch (slotY) {
				case 1:
					this.y = 130;
					break;
				case 2:
					this.y = 213;
					break;
				case 3:
					this.y = 296;
					break;
			}
		}
	}
	// a handleInput() method.
	render() {
		// Only render if board space has been assigned and translated to xy
		if (this.x >= 0 && this.y >= 0 && this.slot != "00") {
			ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 70, 75);
		}
	}
}

class gemClass {
	constructor(selectedGem, gemValue, slot) {
		this.x = 0;
		this.y = 0;
		this.points = gemValue;
		this.slot = slot;
		this.sprite = selectedGem;
	}
	// This class requires an update(), render() and
	update(dt) {
		if (this.slot != undefined) {
			var slotX = Number.parseInt(this.slot.charAt(0));
			var slotY = Number.parseInt(this.slot.charAt(1));

			this.x = ((slotX * 100) - 100) + 27;

			switch (slotY) {
				case 1:
					this.y = 137;
					break;
				case 2:
					this.y = 220;
					break;
				case 3:
					this.y = 303;
					break;
			}
		}
	}
	// a handleInput() method.
	render() {
		if (this.x != 0 && this.y != 0) {
			ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 50, 60);
		}
	}
}

var addNewGemKey = function randomPosition() {
	// This function random selects board space and preventing laying gems and keys on same board space
	var boardX = [1, 2, 3, 4, 5];
	var boardY = [1, 2, 3];
	var newSlot = "";

	while (newSlot === "") {
		var resultX = boardX[Math.floor(Math.random() * boardX.length)];
		var resultY = boardY[Math.floor(Math.random() * boardY.length)];

		newSlot = '' + resultX + resultY;

		activeGems.forEach(function (slotXY) {
			if (slotXY.slot === newSlot) {
				newSlot = "";
			}
		});
		if (activeKey.slot === newSlot) {
			newSlot = "";
		}
	}
	return newSlot;
}

function addKey() {
	if (activeKey.slot === "00") {
		var addNewSlot = addNewGemKey();
		if (addNewSlot != "") { // Random position to ensure no overlaps with other items gems/keys
			activeKey.slot = addNewSlot;
		}
	}
}

function addGems() {

	for (var intAdd = 0; intAdd <= maxGems; intAdd = intAdd + 1) {
		if (activeGems.length < maxGems - 1) {
			var addNewSlot = addNewGemKey();
			if (addNewSlot != "") { // Random position to ensure no overlaps with other items gems/keys
				var intGem = Math.floor(Math.random() * 10); // Selecting a Gem Value randomly
				if (intGem == 9) {
					//Gold Highest value gem randomly selected
					gem = new gemClass(availGems[2].gemImage, availGems[2].points, addNewSlot);
				} else if (intGem > 5) {
					//Green Middle value gem randomly selected
					gem = new gemClass(availGems[1].gemImage, availGems[1].points, addNewSlot);
				} else {
					//Green lowest value gem randomly selected
					gem = new gemClass(availGems[0].gemImage, availGems[0].points, addNewSlot);
				}
				activeGems.push(gem);
				intAdd += 1;
			}
		}
	}
}

// Now write your own player class
//http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
class playerClass {
	constructor(x, y, selectedPlayer, slot) {
		this.x = x;
		this.y = y;
		this.slot = slot;
		this.sprite = selectedPlayer; //'images/char-boy.png';
	}
	// This class requires an update(), render() and
	update(dt) {

		// creating a board slot to compare for collsions due to images at different placements
		var slotX = 0;
		var slotY = 0;
		if (this.x > 0 && this.x <= 400) {
			slotX = ((this.x + 100) / 100);
		} else if (this.x === 0) {
			slotX = "1"
		}
		switch (this.y) {
			case 68:
				slotY = "1"
				break;
			case 151:
				slotY = "2";
				break;
			case 234:
				slotY = "3";
				break;
			default:
				slotY = "0";
				slotX = "0"; // No collsion in outside road
		}
		this.slot = '' + slotX + slotY
	}
	// a handleInput() method.
	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}
	handleInput(key) {

		if (gameRunning) {
			switch (key) {
				case "left":
					if (this.x > 0) {
						this.x -= 100;
					}
					break;
				case "right":
					if (this.x < 400) {
						this.x += 100;
					}
					break;
				case "up":
					if (this.y > 0) {
						this.y -= 83;
					}
					checkWater();
					break;
				case "down":
					if (this.y > 317) {
						this.y = 400;
					} else {
						this.y += 83;
					}
					break;
			}
		}
	}
}

class selPlayerClass {
	constructor(character, playerImg, x, y, labelx, labely, position, charColor, selected) {
		this.character = character;
		this.sprite = playerImg;
		this.x = x;
		this.y = y;
		this.labelx = labelx;
		this.labely = labely;
		this.position = position;
		this.charColor = charColor; //'images/char-boy.png';
		this.selected = selected;
	}
	// This class requires an update(), render() and
	update() {
		// creating a board slot to compare for collsions due to images at different placements
		if (selPlayer === this.position) {
			this.selected = true;
		} else {
			this.selected = false;
		}
	}
	// Update the game instructions for all the character selections
	render() {
		if (this.selected === true) {
			ctx.fillStyle = "white";
			ctx.font = "20px Arial";
			ctx.shadowBlur = 20;
			ctx.shadowColor = this.charColor;
			ctx.fillText(this.character, this.labelx, this.labely);
			ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
			ctx.shadowBlur = 0;
			ctx.fillStyle = "#202020";
			ctx.font = "15px Arial";

		} else {
			ctx.fillStyle = "black";
			ctx.font = "20px Arial";
			ctx.shadowBlur = 0;
			ctx.fillText(this.character, this.labelx, this.labely);
			ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
			ctx.fillStyle = "#202020";
			ctx.font = "15px Arial";
		}
	}
}

function fillAvailPlayers() {
	availPlayers.forEach(function (items) {
		var selChar = new selPlayerClass(items.character, items.charImage, items.x, items.y, items.labelx, items.labely, items.position, items.charColor, items.selected);
		availablePlayer.push(selChar)
	});
}
var randomizeEnemyStart = function randomPosition() {
	// This function random selects board space and preventing laying gems and keys on same board space
	var enemyAttr = [];
	var direction = Math.floor(Math.random() * 2); // Selecting enemy direction randomly
	var speed = Math.floor(Math.random() * 5) + 1; // Selecting enemy speed randomly
	var x = Math.floor(Math.random() * 3) + 1; // Selecting enemy road randomly
	var start = -100;

	switch (x) {
		case 1:
			road = "62";
			break;
		case 2:
			road = "145";
			break;
		case 3:
			road = "230";
			break;
	}
	if (direction == 1) {
		start = 505;
	}
	enemyAttr.push(start, road, speed, direction)
	return enemyAttr;
}


function fillEnemies() {
	var num = 1;
	while (num <= maxEnemies) {
		var enemyAttr = randomizeEnemyStart();
		var addEnemy = new Enemy(enemyAttr[0], enemyAttr[1], enemyAttr[2], enemyAttr[3]);
		allEnemies.push(addEnemy)
		num += 1;
	}
}

// Now instantiate your objects.
var gameRunning = false;
var gameOver = true;
var lives = 5;
var goldkeys = 0;
var score = 0;
var maxGems = 3;
var gemCollsions = 0;
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
var maxEnemies = 4;
var enemyRandomInProgress = false;
var level = 3;
var activeGems = [];
var activeKey = new keyClass('images/Key.png', "00");

// Place the player object in a variable called player
var player = new playerClass(200, 400, 'images/char-boy.png', "00");
var selPlayer = 1;
var availablePlayer = [];
//var playerSprite;
var availGems = [{
		gemColor: "blue",
		gemImage: "images/Gem Blue.png",
		points: 25
	},
	{
		gemColor: "green",
		gemImage: "images/Gem Green.png",
		points: 50
	},
	{
		gemColor: "orange",
		gemImage: "images/Gem Orange.png",
		points: 100
	},
];
var availPlayers = [{
		character: "Buggy",
		charImage: "images/char-boy.png",
		x: 0,
		y: 151,
		labelx: 22,
		labely: 320,
		position: 1,
		charColor: "#ffcc66",
		selected: true
	},
	{
		character: "Cat Girl",
		charImage: "images/char-cat-girl.png",
		x: 100,
		y: 68,
		labelx: 115,
		labely: 245,
		position: 2,
		charColor: "white",
		selected: false
	},
	{
		character: "Little Horn",
		charImage: "images/char-horn-girl.png",
		x: 200,
		y: 151,
		labelx: 205,
		labely: 320,
		position: 3,
		charColor: "#ccccff",
		selected: false
	},
	{
		character: "Pink Lady",
		charImage: "images/char-pink-girl.png",
		x: 300,
		y: 68,
		labelx: 308,
		labely: 245,
		position: 4,
		charColor: "#ffccff",
		selected: false
	},
	{
		character: "Princess",
		charImage: "images/char-princess-girl.png",
		x: 400,
		y: 151,
		labelx: 415,
		labely: 320,
		position: 5,
		charColor: "#ccffff",
		selected: false
	}
];
var gameStatus = [{
		StatusNote: "Welcome to Gem Raider!",
		x: 140,
		y: 68
	},
	{
		StatusNote: "Game Paused - Bio Break!",
		x: 135,
		y: 68
	},
	{
		StatusNote: "Gave Over - You Scored " + score + " Points!",
		x: 100,
		y: 68
	},
	{
		StatusNote: "Game Restarted!",
		x: 170,
		y: 68
	},
];
var gameStatusIndex = 0;
var bResetPlayerXY = false;

function arrowSelectKeys(key) {
	switch (key) {
		case "left":
			if (selPlayer == 1) {
				selPlayer = 5;
			} else {
				selPlayer -= 1;
			}
			break;
		case "right":
			if (selPlayer == 5) {
				selPlayer = 1;
			} else {
				selPlayer += 1;
			}
			break;
	}
}

function gameControl(key) {
	switch (key) {
		case "restart":
			InWater = false;
			gameStatusIndex = 3;
			gameRunning = false;
			resetValues();
			break;
		case "pause":
			gameStatusIndex = 1; // Selects the game position element
			gameRunning = false;
			break;
		case "enter":
			if (gameOver) {
				resetValues();
			}
			gameRunning = true;
			newCharacter(selPlayer);
			break;
	}
}

function newCharacter(characterPos) {
	availPlayers.forEach(function (items) {
		if (items.position === characterPos) {
			player.sprite = items.charImage;
			items.selected = true;
		} else {
			items.selected = false;
		}
	});
}

function resetValues() {
	gameOver = false;
	lives = 5;
	score = 0;
	goldkeys = 0;
	gemCollsions = 0;
	activeKey.slot = "00"
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
		13: 'enter',
		80: 'pause',
		82: 'restart'
	};

	gameControl(allowedKeys[e.keyCode]);
	if (gameRunning === true && bResetPlayerXY === false) {
		player.handleInput(allowedKeys[e.keyCode]);
	} else {
		arrowSelectKeys(allowedKeys[e.keyCode]);
	}
});
