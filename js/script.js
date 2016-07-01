//create players
var p1 = {
	name: 'Squirtle',
	// x: ['0px', '50px', '100px', '150px', '200px', '250px', '300px', '350px', '400px', '450px', '500px', '550px', '600px', '650px', '700px', '750px', '800px', '850px', '900px', '950px', '1000px', '1064px'],
	x: ['0px', '50px', '100px', '150px', '200px', '250px', '300px', '350px', '400px', '450px', '500px', '550px', '600px', '650px', '700px', '750px', '800px', '850px', '900px'],
	pNeutral: "url('img/squirtle.png')",
	pWalk: "url('img/squirtle_walk.png')",
	pAttack: "url('img/squirtle_attack.png')",
	pBlock: "url('img/squirtle_block.png')",
	position: 0,
	nPosition: 0,
	health: 100,
	nHealth: 100,
	damage: 10,
	nDamage: 10,
	attackSpeed: 10,
	nAttackSpeed: 10,
	attackCD: 0,
	stun: false,
	combo: 0,
	comboId: 0,
	timerid: 0,
	blockStrength: 2,
	nBlockStrength: 2,
	block: false,
	blockCD: 0,
	wins: 0,
	badge1: $('#p1badge1'),
	badge2: $('#p1badge2')
}

var p2 = {
	name: 'Bear',
	// x: ['0px', '50px', '100px', '150px', '200px', '250px', '300px', '350px', '400px', '450px', '500px', '550px', '600px', '650px', '700px', '750px', '800px', '850px', '900px', '950px', '1000px', '1064px'],
	x: ['0px', '50px', '100px', '150px', '200px', '250px', '300px', '350px', '400px', '450px', '500px', '550px', '600px', '650px', '700px', '750px', '800px', '850px', '900px'],
	//position: 21,
	position: 18,
	nPosition: 18,
	health: 100,
	nHealth: 100,
	damage: 10,
	nDamage: 10,
	attackSpeed: 10,
	nAttackSpeed: 10,
	attackCD: 0,
	stun:false,
	combo: 0,
	comboId: 0,
	timerid: 0,
	blockStrength: 2,
	nBlockStrength: 2,
	block: false,
	blockCD: 0
}

//pointers to html elements
var p1HTML = $('#p1');
var p2HTML = $('#p2');
var p1Shield = $('#p1shield');
var p2Shield = $('#p2shield');
var p1HP = $('#p1hp');
var p2HP = $('#p2hp');
var $p1Combo = $('#p1combo');
var $p2Combo = $('#p2combo');
var $document = $(document);
var $timer = $('#timer');

//show starting stats
updateStats();
neutralCSS(p1, p1HTML);
//start round timer
var timer = 180;
var timerID = startTimer();

$document.on('keydown', movement);
$document.on('keyup', collisionDetection);

// ------------------------------------------MOVEMENT------------------------------------------ //

function movement(e) {
	// d
	if (e.keyCode == 68) {
		testMove(p1, 'right');
	}
	// a
	else if (e.keyCode == 65) {
		testMove(p1, 'left');
	}
	// ->
	else if (e.keyCode == 39) {
		testMove(p2, 'right');
	}
	// <-
	else if (e.keyCode == 37) {
		testMove(p2, 'left');
	}
}

function testMove(player, direction) {
	//p1 moving right
	if (player == p1 && direction == 'right') {
		if (p1.x[p1.position+1] != undefined && p1.position+6 != p2.position) {
			move(p1, p1HTML, 1);
		}
	}

	//p1 moving left
	else if (player == p1 && direction == 'left') {
		if (p1.x[p1.position-1] != undefined && p1.position-6 != p2.position) {
			move(p1, p1HTML, -1);
		}
	}

	//p2 moving right
	else if (player == p2 && direction == 'right') {
		if (p2.x[p2.position+1] != undefined && p2.position+6 != p1.position) {
			move(p2, p2HTML, 1);
		} 
	}

	//p2 moving left
	else if (player == p2 && direction == 'left') {
		if (p2.x[p2.position-1] != undefined && p2.position-6 != p1.position) {
			move(p2, p2HTML, -1)
		} 
	}
}

function move(player, html, value) {
	player.position += value;
	html.animate({left: player.x[player.position]}, 100);
	neutralCSS(player,html);
}

// ------------------------------------------COLLISION AND COMBAT------------------------------------------ //

function collisionDetection(e) {
	//TODO change key layout for each player
	//attack
	// 1
	if (e.keyCode == 49) {
		//test collision
		if (p1.position+6 == p2.position) {
			//test hp of opponent and attack cooldown and stun status
			if (p2.health && checkStatus(p1)) {
				p2.timerid = collide(p2HTML);
				calcDamage(p1, p2, p1HTML, p2HTML);
			}
		}
	}
	// .
	else if (e.keyCode == 190) {
		if (p2.position-6 == p1.position) {
			if (p1.health && checkStatus(p2)) {
				p1.timerid = collide(p1HTML);
				calcDamage(p2, p1, p2HTML, p1HTML);
			}
		}
	}

	//block
	// 2
	else if (e.keyCode == 50) {
		block(p1, p1Shield, p1HTML);
	}
	// /
	else if (e.keyCode == 191) {
		block(p2, p2Shield, p2HTML);	
	}
}

function collide(playerHit) {
		var timer = 3;
		var timerId = window.setInterval(function(){
			playerHit.toggle(0,'standard');
			if (!timer) {
				window.clearInterval(timerId);
			}
			timer --;
		}, 250)
		return timerId;
};

function checkStatus(player) {
	return (player.attackCD <= 0 && !player.stun);
}

// ------------------------------------------ATTACKING------------------------------------------ //

//TODO add blocking damage reduction
function calcDamage(aggressor, defender, aggressorHTML, defenderHTML){
	//check block
	if (!defender.block) {
		//combo tracking -- only iterate combo if attack is not blocked
		defender.health -= aggressor.damage;
		aggressor.combo++;
		clearInterval(aggressor.comboId);
		aggressor.comboId = comboReset(aggressor);
		evolution(aggressor, aggressorHTML);
		//stun defender if attack isn't blocked
		stun(defender);
	}
	else { //damage halved when block
		defender.health -= aggressor.damage/defender.blockStrength;
	}
	//change css
	//TEMPORARY check for p1
	if (aggressor.name == 'Squirtle') {
		aggressorHTML.css('width', '350px');
		aggressorHTML.css('background-image', aggressor.pAttack);
		setTimeout(function() {
			neutralCSS(aggressor, aggressorHTML);
		},500);
	}
	setAttackCD(aggressor);
	updateStats();
	//KO
	knockOut(aggressor, defender);
}

function setAttackCD(aggressor, move) {
	aggressor.attackCD = 1;
	//reset attackCD to 0
	var id = setInterval(function() {
		aggressor.attackCD --;
		if (aggressor.attackCD <=0) {
			clearInterval(id);
		}
	}, 50*aggressor.attackSpeed);
}

// ------------------------------------------COMBO MANAGEMENT------------------------------------------ //

function comboReset(player) {
	//reset combo after 3 seconds
	var id = setTimeout(function(){
		player.combo = 0;
		updateStats();
	},3000);
	return id;
}

function evolution(player, html) {
	if (player.combo >=3) {
		html.removeClass('standard');
		html.addClass('evo1');
		//player.damage = 20;
		player.attackSpeed = 5;
		//reset evolution after 5 seconds
		setTimeout(function(){
			html.removeClass('evo1');
			html.addClass('standard');
			//player.damage = 10;
			player.attackSpeed = 10;
		}, 5000);
	}
}

// ------------------------------------------ATTACK EFFECTS------------------------------------------ //

function stun(defender) {
	defender.stun = true;
	setTimeout(function() {
		defender.stun = false;
	},250);
}

// ------------------------------------------BLOCKING------------------------------------------ //

function block(player, shieldhtml, playerhtml) {
	if (player.blockCD <= 0) {
		//3 second cd
		player.blockCD = 3;
		player.block = true;
		//change css
		//toggleBlock(shieldhtml);
		playerhtml.css('background-image', player.pBlock);
		//make block false after 1 second
		setTimeout(function() {
			player.block = false;
			//toggleBlock(shieldhtml);
			neutralCSS(player, playerhtml);
		}, 1000);
		//countdown block cool down
		var id = setInterval(function() {
			player.blockCD--;
			if (player.blockCD <= 0) {
				clearInterval(id);
			}
		}, 1000);
	}
}

function toggleBlock(player) {
	player.toggle(0,'hidden');
}

// ------------------------------------------ROUND END------------------------------------------ //

function startTimer() {
	$timer.text(timer);
	var id = setInterval(function() {
		timer--;
		$timer.text(timer);
		if (timer <=0) {
			clearInterval(id);
		}
	}, 1000);
	return id;
}

function updateStats() {
	//hp
	p1HP.text(p1.health);
	p2HP.text(p2.health);
	//combo
	$p1Combo.text(p1.combo);
	$p2Combo.text(p2.combo);
}

function resetGame(p1, p2, p1html, p2html) {
	//reset position
	p1.position = p1.nPosition;
	p2.position = p2.nPosition;
	//reset health
	p1.health = p1.nHealth;
	p2.health = p2.nHealth;
	//reset combat mechanisms
	p1.attackCD = p2.attackCD = 0;
	p1.stun = p2.stun = false;
	p1.combo = p2.combo = 0;
	p1.block = p2.block = false;
	p1.blockCD = p2.blockCD = 0;
	//reset stat changes due to evolution
	p1.attackSpeed = p1.nAttackSpeed;
	p2.attackSpeed = p2.nAttackSpeed;
	p1.damage = p1.nDamage;
	p2.damage = p2.nDamage;
	p1.blockStrength = p1.nBlockStrength;
	p2.blockStrength = p2.nBlockStrength;
	p1html.removeClass('evo1').addClass('standard');
	p2html.removeClass('evo1').addClass('standard');
	//reset timer
	clearInterval(timerID);
	//start timer and show stats
	timer = 180;
	timerID = startTimer();
	updateStats();
	//shift models back
	move(p1, p1HTML, 0)
	move(p2, p2HTML, 0)

	$document.on('keydown', movement);
	$document.on('keyup', collisionDetection);
}

function knockOut(aggressor, defender) {
	if (defender.health <= 0) {
		clearInterval(defender.timerid);
		//remove event listeners
		$document.off('keydown', movement);
		$document.off('keyup', collisionDetection);
		//ensure flashing interval is cleared
		setTimeout(function() {alert(aggressor.name + " KO'd " + defender.name);}, 500);
		//add badge
		addBadge(aggressor);
		aggressor.wins++;
		resetGame(p1, p2, p1HTML, p2HTML);
	}
}

function addBadge(winner) {
	winner.wins++;
	if (winner.wins == 1) {
		winner.badge1.css('background-color', 'rgba(150,150,0,0.75)');
	}
	else {
		winner.badge2.css('background-color', 'rgba(150,150,0,0.75)');
	}
}

// ------------------------------------------ANIMATION------------------------------------------ //

function neutralCSS(player,html) {
	//check if p1 -- will be removed when p2 also has images
	if (player == p1) {
		//check if even position
		if (player.position%2 == 0) {
			html.css('background-image',player.pNeutral);
		}
		else {
			html.css('background-image',player.pWalk);
		}
		html.css('width', '300px');
	}
}