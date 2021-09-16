var config = {
	type: Phaser.AUTO,
	width: 1820,
	height: 900,
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
var lavaPlatforms;
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
	mainScene.load.image('background', './assets/Slay_background.jpg');
	mainScene.load.image('platform', './assets/platform_var_2.png');
	mainScene.load.image('ceiling', './assets/platform.png')
	mainScene.load.image('rider', './assets/rider.png');
	mainScene.load.spritesheet('rider_on_mount', './assets/Slay_rider_on_mount.png', {frameWidth: 256, frameHeight: 256});
	mainScene.load.spritesheet('mount', './assets/Slay_mount.png', {frameWidth: 256, frameHeight: 256});
}

function create ()
{
	gameTime = new Timer();
	
	mainScene.add.image(0, 0, 'background').setOrigin(0, 0).setScale(0.48);
	//mainScene.add.image(0, 100, 'sky').setOrigin(0, 0);

	platforms = mainScene.physics.add.staticGroup();
	lavaPlatforms = mainScene.physics.add.staticGroup();

	
	// Invisible ceiling
	platforms.create(400, -8, 'ceiling').setScale(2, 0.5).refreshBody();
	
	// Top left platform
	platforms.create(0, 220, 'platform').setScale(0.65, 0.85).refreshBody();
	// Top right platform
	platforms.create(800, 220, 'platform').setSize(340, 35).setOffset(5, 14);
	// Top center platform
	platforms.create(400, 300, 'platform').setScale(0.65, 0.85).refreshBody();
	
	// Bottom left platform
	platforms.create(0, 425, 'platform').setScale(0.75, 0.85).refreshBody();
	// Bottom right platform
	platforms.create(845, 425, 'platform').setScale(0.65, 0.85).refreshBody();
	// Bottom right offset platform
	platforms.create(675, 400, 'platform').setScale(0.30, 0.85).refreshBody();
	
	// Bottom center platform
	platforms.create(400, 450, 'platform').setScale(0.45, 0.85).refreshBody();
	
	// Very Bottom, Center platform
	platforms.create(400, 668, 'platform').setScale(1, 2).refreshBody();
	
	// lava platforms
	lavaPlatforms.create(100, 640, 'ceiling').setScale(0.5, 0.25).setTint(0x000000).refreshBody(); // Left
	lavaPlatforms.create(700, 640, 'ceiling').setScale(0.5, 0.25).setTint(0x000000).refreshBody(); // Right
	

	player = mainScene.physics.add.sprite(PLAYER_STARTING_X, PLAYER_STARTING_Y, 'rider_on_mount').setScale(0.25);
	player.setBounce(PLAYER_HORIZONTAL_BOUNCE, PLAYER_VERTICAL_BOUNCE);
	player.setGravity(0, PLAYER_GRAVITY);
	
	mainScene.anims.create({
		key: 'flap',
		frames: mainScene.anims.generateFrameNumbers('rider_on_mount', {frames: [3, 2, 1, 0]}),
		frameRate: 30,
		repeat: 0
	});

	// mainScene.anims.create({
	// 	key: 'turn',
	// 	frames: [{key: 'dude', frame:4}],
	// 	frameRate: 20
	// });

	// mainScene.anims.create({
	// 	key: 'right',
	// 	frames: mainScene.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
	// 	frameRate: 10,
	// 	repeat: -1
	// });

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
	mainScene.physics.add.collider(enemies, lavaPlatforms);
	mainScene.physics.add.collider(eggs, lavaPlatforms);
	mainScene.physics.add.collider(player, lavaPlatforms);
	mainScene.physics.add.collider(pterodactyls, lavaPlatforms);
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