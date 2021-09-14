var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
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
let pLogic = new playerLogic();
var platforms;
var lava;
var stars;
var score = 0;
var scoreText;
var bombs;
var enemies;
var eggs;
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
	
	this.add.image(0, 0, 'sky').setOrigin(0, 0);

	platforms = this.physics.add.staticGroup();

	platforms.create(400, 568, 'ground').setScale(1, 2).refreshBody();
	platforms.create(600, 400, 'ground');
	platforms.create(20, 400, 'ground');
	platforms.create(50, 220, 'ground');
	platforms.create(750, 220, 'ground');
	platforms.create(400, -8, 'ground').setScale(2, 0.5).refreshBody();

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
	let e1 = new Rider(0, 100, 1);
	let e2 = new Rider(100, 100, 1);
	enemies.add(e1, true);
	enemies.add(e2, true);
	
	enemies.children.iterate(function(child){
		child.setTintFill(0xff0000);
	})

	lava = this.physics.add.staticGroup();
	lava.create(100, 575, 'ground').setScale(0.5, 1.6).refreshBody();
	lava.create(700, 575, 'ground').setScale(0.5, 1.6).refreshBody();
	lava.children.iterate(function(child){
		child.setTintFill(0xff0000);
	})

	this.physics.add.collider(enemies, platforms);
	this.physics.add.collider(eggs, platforms);
	this.physics.add.collider(player, platforms);
	this.physics.add.collider(enemies, lava, destroy, null, this);
	this.physics.add.collider(eggs, lava, destroy, null, this);
	this.physics.add.collider(player, lava, hitBomb, null, this);
	
	this.physics.add.overlap(player, enemies, hitEnemy, null, this);
	//this.physics.add.overlap(eggs, player, destroy, null, this);

	scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#000'});

}

function update ()
{
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