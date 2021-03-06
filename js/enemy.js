const ENEMY_SCORES = [500, 750, 1000];
const ENEMY_COLORS = [0x000000, 0x000000, 0x000000];
const ENEMY_FLAP_AMOUNT = 100; // How much they can move in a single update - probably the same as the player's upwards rate
const ENEMY_UPDATE_DELAY = [11, 13, 13]; // The delay (ms) between AI actions
const ENEMY_TOP_SPEEDS = [100, 125, 175];
const ENEMY_RANGE = [200, 250, 350];
class Rider extends Phaser.GameObjects.Sprite {
	constructor(x, y, difficulty) {
		super(mainScene, x, y, 'rider_on_mount');
		difficulty = difficulty > 2 ? 2 : difficulty;
		
		this.setScale(0.5);
		this.setTintFill(ENEMY_COLORS[difficulty]);
		this.difficulty = difficulty;
		this.totalUpdates = 0;
		this.lastMovementUpdate = 0;
	}
	
	update(player) {
		this.totalUpdates++;
		
		// Limit the rate at which the AI does inputs.
		if (this.totalUpdates - this.lastMovementUpdate >= ENEMY_UPDATE_DELAY[this.difficulty]) {
			this.lastMovementUpdate = this.totalUpdates;
			
			
			// Get distance
			let xDif = player.getCenter().x - this.getCenter().x;
			let yDif = player.getCenter().y - this.getCenter().y;
			let distance = Math.sqrt(xDif*xDif + yDif*yDif);
			
			let sign = Math.sign(this.body.velocity.x); // Sign of the current moving direction
			let odds = Phaser.Math.Between(0, 100);
			
			this.flipX = sign > 0;
			
			// If they aren't moving, give them a nudge in a random direction
			if (sign == 0) {
				let randDir = odds > 50 ? 1 : -1;
				this.body.setVelocity(randDir*ENEMY_TOP_SPEEDS[this.difficulty]);
			}
				
			// If the player is within a certain range, try to kill them
			if (distance < ENEMY_RANGE[this.difficulty]) {
				
				// If we are lower, go up as fast as this difficulty allows
				if (player.getCenter().y-ENEMY_COLLISION_DEAD_ZONE_SIZE <= this.getCenter().y) {
					this.body.setVelocityY(this.body.velocity.y - ENEMY_FLAP_AMOUNT);
					this.anims.play('flap');
				}
			}
			
			// If the player is further away, move up and down a bit randomly
			else {
				// Randomly move up sometimes
				if (odds > 60) {
					this.body.setVelocityY(this.body.velocity.y - ENEMY_FLAP_AMOUNT);
					this.anims.play('flap');
				}
			}
		}
	}
	
	setPhysics() {
		this.body.setBounce(1, 0.25);
	}
	
	kill() {
		mainScene.sound.play('enemy_kill');
		this.destroy();
	}
}

const PTERODACTYL_SCORE = 1000;
const PTERODACTYL_SPEED = 150;
const PTERODACTYL_UPDATE_DELAY = 15; //ms
const PTERODACTYL_UP_CHANCE = 45; // The chance for the pterodactly to move up in a given tick
class Pterodactyl extends Phaser.GameObjects.Sprite {
	constructor(x, y) {
		super(mainScene, x, y, 'queen');
		this.setScale(0.5);
		this.timeSinceUpdate = 0;
		this.anims.play('queen_flap');
	}
	
	update(player) {
		this.timeSinceUpdate += gameTime.getDeltaTime();
		
		// If we're not moving, move towards the far side of the screen
		if (this.body.velocity.x == 0) {
			let maxX = mainScene.sys.game.scale.gameSize.x;
			
			if (this.x < maxX/2)
				this.body.setVelocity(PTERODACTYL_SPEED, 0);
			else
				this.body.setVelocity(-PTERODACTYL_SPEED, 0);
		}
		
		if  (this.timeSinceUpdate >= PTERODACTYL_UPDATE_DELAY) {
			// Randomly move up sometimes
			let odds1 = Phaser.Math.Between(0, 100);
			
			// If Y is near the top, move down always. At a faster rate than usual.
			if (this.y < 100) 
				this.body.setVelocity(this.body.velocity.x, this.body.velocity.y + 10);
			
			// If Y is near the lava, move up always.
			else if (this.y > 550)
				this.body.setVelocity(this.body.velocity.x, this.body.velocity.y - 10);
			
			// Randomly move up sometimes
			else if (odds1 > PTERODACTYL_UP_CHANCE) 
				this.body.setVelocity(this.body.velocity.x, this.body.velocity.y - 15);
			
			
			this.timeSinceUpdate = 0;
		}
		
		
		
		// If all enemies are gone, move off screen
		if (eggs.countActive() === 0 && enemies.countActive() === 0) {
			let maxX = mainScene.sys.game.canvas.width;
			
			// If we're going right and we're closer to left, go left instead
			if (this.body.velocity.x > 0 && this.x < maxX/2) {
				this.body.setVelocity(-this.body.velocity.x, this.body.velocity.y);
			}
			// If we're going left and we're closer to right, go right instead
			if (this.body.velocity.x < 0 && this.x > maxX/2) {
				this.body.setVelocity(-this.body.velocity.x, this.body.velocity.y);
			}
			
			
			if (this.x < 0 || this.x > maxX-1)
				this.kill();
		}
	}
	
	setPhysics() {
		this.body.setBounce(1, 0.25);
		this.body.gravity.y = 150;
	}
	
	kill() {
		this.destroy();
	}
}

const EGG_SCORES = [250, 500, 750, 1000];
const EGG_DECELERATION = 0.95;

class Egg extends Phaser.GameObjects.Sprite {
	constructor(x, y, difficulty) {
		super(mainScene, x, y, 'rider');
		this.setScale(0.5);
		// this.setTintFill(0xff0000)
		this.difficulty = difficulty;
	}
	
	update(player) {
		// Friction
		// if (this.body.touching.down) {
		// 	this.body.setVelocity(this.body.velocity.x*EGG_DECELERATION, this.body.velocity.y);
			
		// }
		
		// If the egg is not moving, count down on its timer to hatch
		// if (Math.abs(this.body.velocity.x) < 1)
		// 	this.hatchTime -= gameTime.getDeltaTimeSeconds();
		
		// if (this.hatchTime <= 0)
		// 	this.hatch();
	}
	
	setPhysics() {
		this.body.setBounce(0);
	}
	
	hatch() {
		let enemy = new Rider(this.x, this.y-10, this.difficulty+1);
		enemies.add(enemy, true);
		
		this.destroy();
	}
	
	kill() {
		this.destroy();
	}
}

const FREE_MOUNT_SPEED = 200;
class Mount extends Phaser.GameObjects.Sprite{
	constructor(x, y, level){
		super(mainScene, x, y, 'mount');
		this.setScale(0.5);
		// Changing the size of the hitbox is not working
		// this.body.setSize(10, 10, true);
		this.setTintFill(ENEMY_COLORS[level]);
		this.level = level;
	}

	setPhysics(){
		this.body.setBounce(1, 0);
        var x = Phaser.Math.Between(0, 1);
        this.body.setVelocityX((x == 0 ? -FREE_MOUNT_SPEED : FREE_MOUNT_SPEED));
	}

	update(){
		this.flipX = (this.body.velocity.x > 0) ? true : false;
	}

	kill(){
		this.destroy();
	}
}