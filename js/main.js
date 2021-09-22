var config = {
	type: Phaser.AUTO,
	width: 1820,
	height: 900,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 300},
			debug: false,
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
var prCollision;

var player;
var gameTime;
let pLogic = new playerLogic();
var platforms;
var lavaPlatforms;
var lava;
var score = 0;

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

	mainScene.load.spritesheet('hero_on_mount', './assets/Slay_hero_mount.png', {frameWidth: 337.5, frameHeight: 281});
	mainScene.load.spritesheet('hero_stand', './assets/Slay_hero_stand.png', {frameWidth: 256, frameHeight: 256});
	mainScene.load.spritesheet('rider_on_mount', './assets/Slay_rider_on_mount.png', {frameWidth: 256, frameHeight: 256});
	mainScene.load.spritesheet('mount', './assets/Slay_mount.png', {frameWidth: 256, frameHeight: 256});
	mainScene.load.spritesheet('hero_walk', './assets/Slay_hero_walk.png', {frameWidth: 1076/4, frameHeight: 256});
	mainScene.load.spritesheet('hero_jump', './assets/Slay_hero_jump.png', {frameWidth: 1079/4, frameHeight: 259});
	mainScene.load.spritesheet('queen', './assets/Slay_vampire_queen.png', {frameWidth: 1020/3, frameHeight: 256});

	// Load font images
	for (let i=0; i<10; i++) {
		mainScene.load.image('font_' + i, './assets/fonts/' + i + '.png');
	}
	mainScene.load.image('font_lives', './assets/fonts/lives.png');
	mainScene.load.image('font_score', './assets/fonts/score.png');
	mainScene.load.image('font_waves', './assets/fonts/wave.png');
	mainScene.load.image('font_start', './assets/fonts/Slay_spacebar_instructions.png');
	mainScene.load.image('font_restart', './assets/fonts/Slay_restart_instructions.png');
	mainScene.load.image('font_logo', './assets/fonts/Slay_logo.png');
	
	
	// Load SFX
	mainScene.load.audio('bg_music', './assets/sfx/SLAY_BG_Music.wav');
	mainScene.load.audio('enemy_kill', './assets/sfx/enemy_killed.wav');
	mainScene.load.audio('enemy_loss', './assets/sfx/enemy_loss.wav');
	mainScene.load.audio('player_death', './assets/sfx/player_death.wav');
	mainScene.load.audio('player_loss', './assets/sfx/player_loss.wav');
	mainScene.load.audio('wing_flap', './assets/sfx/wing_flap.wav');
	

}

function create ()
{
	gameTime = new Timer();
	
	var background = mainScene.add.image(0, 0, 'background').setOrigin(0, 0).setScale(0.48);
	// background.setTint('0xff0000');

	platforms = mainScene.physics.add.staticGroup();
	lavaPlatforms = mainScene.physics.add.staticGroup();

	
	// Invisible ceiling
	platforms.create(1820/2, -10, 'ceiling').setScale(5, 0.5).refreshBody();
	
	lava = mainScene.physics.add.staticGroup();
	lava.create(1820/2, 875, 'ceiling').setScale(5, 1.6).refreshBody();
	//lava.create(700, 675, 'ceiling').setScale(0.5, 1.6).refreshBody();
	lava.children.iterate(function(child){
		child.setTintFill(0xff0000);
	});

	// lava platforms
	lavaPlatforms.create(50, 840, 'ceiling').setScale(0.5, 0.25).setTint(0x000000).refreshBody();
	lavaPlatforms.create(625, 840, 'ceiling').setScale(0.5, 0.25).setTint(0x000000).refreshBody();
	lavaPlatforms.create(1200, 840, 'ceiling').setScale(0.5, 0.25).setTint(0x000000).refreshBody();
	lavaPlatforms.create(1775, 840, 'ceiling').setScale(0.5, 0.25).setTint(0x000000).refreshBody();
	
	// platforms
	platforms.create(300, 850, 'platform').setSize(450, 35).setOffset(60, 14);
	platforms.create(875, 850, 'platform').setSize(450, 35).setOffset(60, 14);
	platforms.create(1450, 850, 'platform').setSize(450, 35).setOffset(60, 14);

	platforms.create(300, 250, 'platform').setSize(450, 35).setOffset(60, 14);
	platforms.create(875, 500, 'platform').setSize(450, 35).setOffset(60, 14);
	platforms.create(1450, 250, 'platform').setSize(450, 35).setOffset(60, 14);

	var playerStartingSprite = (pLogic.mount == -1) ? 'hero_stand' : 'hero_on_mount';
	player = mainScene.physics.add.sprite(PLAYER_STARTING_X, PLAYER_STARTING_Y, playerStartingSprite).setScale(0.5);
	player.setBounce(PLAYER_HORIZONTAL_BOUNCE, PLAYER_VERTICAL_BOUNCE);
	player.setGravity(0, PLAYER_GRAVITY);
	// player.setTintFill(0x0000ff);
	
	mainScene.anims.create({
		key: 'flap',
		frames: mainScene.anims.generateFrameNumbers('rider_on_mount', {frames: [3, 2, 1, 0]}),
		frameRate: 30,
		repeat: 0
	});

	mainScene.anims.create({
		key: 'hero_walking', 
		frames: mainScene.anims.generateFrameNumbers('hero_walk', {frames: [0,1,2,3]}),
		frameRate: 10,
		repeat: -1
	});

	mainScene.anims.create({
		key: 'hero_jumping',
		frames: mainScene.anims.generateFrameNumbers('hero_jump', {frames: [0,1,2,3]}),
		frameRate: 20,
		repeat: 0
	});

	mainScene.anims.create({
		key: 'hero_standing',
		frames: mainScene.anims.generateFrameNumbers('hero_stand', {frames: [0]}),
		frameRate: 10,
		repeat: -1
	});

	mainScene.anims.create({
		key: 'hero_flap',
		frames: mainScene.anims.generateFrameNumbers('hero_on_mount', {frames: [3, 2, 1, 0]}),
		frameRate: 30,
		repeat: 0
	});

	mainScene.anims.create({
		key: 'queen_flap',
		frames: mainScene.anims.generateFrameNumbers('queen', {frames: [0,1,2]}),
		frameRate: 10,
		repeat: -1
	});

	eggs = mainScene.physics.add.group();
	
	enemies = mainScene.physics.add.group();
	pterodactyls = mainScene.physics.add.group();
	mounts = mainScene.physics.add.group();

	mainScene.physics.add.collider(enemies, platforms);
	mainScene.physics.add.collider(eggs, platforms);
	mainScene.physics.add.collider(player, platforms);
	mainScene.physics.add.collider(pterodactyls, platforms);
	mainScene.physics.add.collider(mounts, platforms);
	mainScene.physics.add.collider(enemies, lavaPlatforms);
	mainScene.physics.add.collider(eggs, lavaPlatforms);
	mainScene.physics.add.collider(player, lavaPlatforms);
	mainScene.physics.add.collider(pterodactyls, lavaPlatforms);
	mainScene.physics.add.collider(mounts, lavaPlatforms);
	mainScene.physics.add.collider(enemies, lava, destroy, null, this);
	mainScene.physics.add.collider(eggs, lava, destroy, null, this);
	mainScene.physics.add.collider(player, lava, hitLava, null, this);
	mainScene.physics.add.collider(player, pterodactyls, hitPterodactyl, null, this);
	mainScene.physics.add.collider(eggs, mounts, riderMount, null, this);
	mainScene.physics.add.overlap(player, mounts, hitMount, null, this);

	peCollision = mainScene.physics.add.overlap(player, enemies, hitEnemy, null, this);
	prCollision = mainScene.physics.add.overlap(player, eggs, killEgg, null, this);

	mainScene.physics.pause();

	// Put all font images on screen including text, lives, waves etc.
	initializeFontManager();
	
	// Initialize audio
	var music = this.sound.add('bg_music');
	music.setLoop(true);
	music.play();
	
}

function update ()
{
	gameTime.update();
	
	cursors = mainScene.input.keyboard.createCursorKeys();
	var rObj = mainScene.input.keyboard.addKey('R');
	spaceObj = mainScene.input.keyboard.addKey('SPACE');

	//Game State Machine
	if(gState === GAMESTATE.s_menu){
		if(spaceObj.isDown){
			menuText.setVisible(false);
			startInstructions.setVisible(false);
			gState = GAMESTATE.s_play;
			mainScene.physics.resume();
		}
	}
	else if(gState === GAMESTATE.s_play){
		if(gameOver){
			gState = GAMESTATE.s_gameOver;
			restartInstructions.setVisible(true);
		}
		else{
			gameUpdate();
		}
	}
	else if(gState === GAMESTATE.s_gameOver){
		if(rObj.isDown){
			mainScene.scene.restart();
			restartInstructions.setVisible(false);
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