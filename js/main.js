var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 700,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 300},
			debug: false
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

var mainScene;

var player;
var gameTime;
let pLogic = new playerLogic();
var platforms;
var lava;
var stars;
var score = 0;
var scoreText;
var bombs;
var enemies;
var eggs;
var eggCounter = 0;
var gameOver = false;
var game = new Phaser.Game(config);

function preload ()
{
	this.load.image('sky', './assets/sky.png');
	this.load.image('ground', './assets/platform.png');
	this.load.image('star', './assets/star.png');
	this.load.image('bomb', './assets/bomb.png');
	this.load.spritesheet('dude', './assets/dude.png', {frameWidth: 32, frameHeight: 48});
}

function create ()
{
	mainScene = this;
	gameTime = new Timer();
	
	this.add.image(0, 0, 'sky').setOrigin(0, 0);
	this.add.image(0, 100, 'sky').setOrigin(0, 0);

	platforms = this.physics.add.staticGroup();

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
	

	player = this.physics.add.sprite(PLAYER_STARTING_X, PLAYER_STARTING_Y, 'dude');
	player.setBounce(PLAYER_HORIZONTAL_BOUNCE, PLAYER_VERTICAL_BOUNCE);
	player.setGravity(0, PLAYER_GRAVITY);
	
	this.anims.create({
		key: 'left',
		frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key: 'turn',
		frames: [{key: 'dude', frame:4}],
		frameRate: 20
	});

	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
		frameRate: 10,
		repeat: -1
	});

	eggs = this.physics.add.group();
	
	enemies = this.physics.add.group();

	for(let i = 0; i < 5; i++){
		let e1 = new Rider(250+(i*50), 500, 0 );
		enemies.add(e1, true);
	}
	// let e1 = new Rider(0, 100, 0);
	// let e2 = new Rider(100, 100, 2);
	// enemies.add(e1, true);
	// enemies.add(e2, true);


	lava = this.physics.add.staticGroup();
	lava.create(100, 675, 'ground').setScale(0.5, 1.6).refreshBody();
	lava.create(700, 675, 'ground').setScale(0.5, 1.6).refreshBody();
	lava.children.iterate(function(child){
		child.setTintFill(0xff0000);
	})

	this.physics.add.collider(enemies, platforms);
	this.physics.add.collider(eggs, platforms);
	this.physics.add.collider(player, platforms);
	this.physics.add.collider(enemies, lava, destroy, null, this);
	this.physics.add.collider(eggs, lava, destroy, null, this);
	this.physics.add.collider(player, lava, hitLava, null, this);
	
	this.physics.add.overlap(player, enemies, hitEnemy, null, this);
	this.physics.add.overlap(player, eggs, killEgg, null, this);

	scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#000'});

}

function update ()
{
	gameTime.update();
	
	cursors = this.input.keyboard.createCursorKeys();
	var rObj = this.input.keyboard.addKey('R');

	if(gameOver && rObj.isDown){
		this.scene.restart();
		score = 0;
	}
	else{
		pLogic.playerUpdate(player, cursors);
	}
	
	enemies.children.iterate(enemy => enemy.update(player));
	eggs.children.iterate(egg => egg.update(player));

	this.physics.world.wrap(player, 0);
	this.physics.world.wrap(enemies, 0);
	this.physics.world.wrap(eggs, 0);

}