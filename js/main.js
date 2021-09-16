var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 700,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 300},
			debug: true,
			debugShowBody: true,
			debugShowVelocity: true,
			debugVelocityColor: 0xffff00,
			debugBodyColor: 0x0000ff
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

var mainScene;
var gState = GAMESTATE.s_menu;
var b_playerIsDamaged = false;
var peCollision;

var player;
var gameTime;
let pLogic = new playerLogic();
var platforms;
var lava;
var score = 0;
var scoreText;
var livesText;
var menuText;
var waveText;

var enemies;
var pterodactyls;
var eggs;
var eggCounter = 0;
var gameOver = false;
var game = new Phaser.Game(config);

function preload ()
{
	mainScene = this;
	mainScene.load.image('sky', './assets/sky.png');
	mainScene.load.image('ground', './assets/platform.png');
	mainScene.load.image('star', './assets/star.png');
	mainScene.load.image('bomb', './assets/bomb.png');
	mainScene.load.spritesheet('dude', './assets/dude.png', {frameWidth: 32, frameHeight: 48});
}

function create ()
{
	gameTime = new Timer();
	
	mainScene.add.image(0, 0, 'sky').setOrigin(0, 0);
	mainScene.add.image(0, 100, 'sky').setOrigin(0, 0);

	platforms = mainScene.physics.add.staticGroup();

	// Bottom, Center platform
	platforms.create(400, 668, 'ground').setScale(1, 2).refreshBody();
	
	// Invisible ceiling
	platforms.create(400, -8, 'ground').setScale(2, 0.5).refreshBody();
	
	// Top left platform
	platforms.create(0, 220, 'ground').setScale(0.65, 0.85).refreshBody();
	// Top right platform
	platforms.create(800, 220, 'ground').setScale(0.65, 0.85).refreshBody();
	// Top center platform
	platforms.create(400, 300, 'ground').setScale(0.65, 0.85).refreshBody();
	
	// Bottom left platform
	platforms.create(0, 425, 'ground').setScale(0.75, 0.85).refreshBody();
	// Bottom right platform
	platforms.create(845, 425, 'ground').setScale(0.65, 0.85).refreshBody();
	// Bottom right offset platform
	platforms.create(675, 400, 'ground').setScale(0.30, 0.85).refreshBody();
	
	// Bottom center platform
	platforms.create(400, 450, 'ground').setScale(0.45, 0.85).refreshBody();
	

	player = mainScene.physics.add.sprite(PLAYER_STARTING_X, PLAYER_STARTING_Y, 'dude');
	player.setBounce(PLAYER_HORIZONTAL_BOUNCE, PLAYER_VERTICAL_BOUNCE);
	player.setGravity(0, PLAYER_GRAVITY);
	
	mainScene.anims.create({
		key: 'left',
		frames: mainScene.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
		frameRate: 10,
		repeat: -1
	});

	mainScene.anims.create({
		key: 'turn',
		frames: [{key: 'dude', frame:4}],
		frameRate: 20
	});

	mainScene.anims.create({
		key: 'right',
		frames: mainScene.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
		frameRate: 10,
		repeat: -1
	});

	eggs = mainScene.physics.add.group();
	
	enemies = mainScene.physics.add.group();
	pterodactyls = mainScene.physics.add.group();

	lava = mainScene.physics.add.staticGroup();
	lava.create(100, 675, 'ground').setScale(0.5, 1.6).refreshBody();
	lava.create(700, 675, 'ground').setScale(0.5, 1.6).refreshBody();
	lava.children.iterate(function(child){
		child.setTintFill(0xff0000);
	})

	mainScene.physics.add.collider(enemies, platforms);
	mainScene.physics.add.collider(eggs, platforms);
	mainScene.physics.add.collider(player, platforms);
	mainScene.physics.add.collider(pterodactyls, platforms);
	mainScene.physics.add.collider(enemies, lava, destroy, null, this);
	mainScene.physics.add.collider(eggs, lava, destroy, null, this);
	mainScene.physics.add.collider(player, lava, hitLava, null, this);
	mainScene.physics.add.collider(player, pterodactyls, hitPterodactyl, null, this);
	
	peCollision = mainScene.physics.add.overlap(player, enemies, hitEnemy, null, this);
	mainScene.physics.add.overlap(player, eggs, killEgg, null, this);

	mainScene.physics.pause();

	scoreText = mainScene.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#000'});
	livesText = mainScene.add.text(800 - 400, 16, 'Lives Remaining: ' + PLAYER_MAX_LIVES, {fontSize: '32px', fill: '#000'});
	menuText = mainScene.add.text(400, 400, 'SLAY\nHit Spacebar to Start', {fontSize: '32px', fill: '#000'});
	waveText = mainScene.add.text(300, 300, '', {fontSize: '32px', fill: '#000'});
}

function update ()
{
	gameTime.update();
	//console.log(gameTime.getDeltaTime());
	cursors = mainScene.input.keyboard.createCursorKeys();
	var rObj = mainScene.input.keyboard.addKey('R');
	var spaceObj = mainScene.input.keyboard.addKey('SPACE');

	//Game State Machine
	if(gState === GAMESTATE.s_menu){
		if(spaceObj.isDown){
			menuText.setText('');
			gState = GAMESTATE.s_play;
			mainScene.physics.resume();
		}
	}
	else if(gState === GAMESTATE.s_play){
		if(gameOver){
			gState = GAMESTATE.s_gameOver;
		}
		else{
			gameUpdate();
		}
	}
	else if(gState === GAMESTATE.s_gameOver){
		if(rObj.isDown){
			mainScene.scene.restart();
			score = 0;
			pLogic.playerLives = PLAYER_MAX_LIVES;
			gState = GAMESTATE.s_menu;
			gameOver = false;
			waveNumber = 0;
		}
	}
	else{
		console.log("ERROR!!!");
	}
}