const DIFFICULTY_TOP_SPEEDS = [100, 125, 175];
const ENEMY_SCORES = [500, 750, 1000];
const ENEMY_COLORS = [0xff0000, 0xffffff, 0x000000];
// The rate that the AI will do inputs measured in frames between. Lower is faster.
const DIFFICULTY_ADJUST_RATE = [15, 14, 13];
const DIFFICULTY_RANGE = [200, 250, 350];
const EGG_HATCH_TIME = [10, 8, 6];

// How much they can move in a single update - probably the same 
// as the player's upwards rate
const ADJUST_UP_SPEED = 65;


class Rider extends Phaser.GameObjects.Sprite {
	constructor(x, y, difficulty) {
		super(mainScene, x, y, 'rider_on_mount');
		difficulty = difficulty > 2 ? 2 : difficulty;
		
		this.setScale(0.25);
		this.setTintFill(ENEMY_COLORS[difficulty]);
		this.difficulty = difficulty;
		this.totalUpdates = 0;
		this.lastMovementUpdate = 0;
	}
	
	update(player) {
		this.totalUpdates++;
		
		// Limit the rate at which the AI does inputs.
		if (this.totalUpdates - this.lastMovementUpdate >= DIFFICULTY_ADJUST_RATE[this.difficulty]) {
			this.lastMovementUpdate = this.totalUpdates;
			
			
			// Get distance
			let xDif = player.getCenter().x - this.getCenter().x;
			let yDif = player.getCenter().y - this.getCenter().y;
			let distance = Math.sqrt(xDif*xDif + yDif*yDif);
				
			// If the player is within a certain range, try to kill them
			if (distance < DIFFICULTY_RANGE[this.difficulty]) {
				
				// If we are lower, go up as fast as this difficulty allows
				if (player.getCenter().y-ENEMY_COLLISION_DEAD_ZONE_SIZE <= this.getCenter().y) {
					this.body.setVelocityY(this.body.velocity.y - ADJUST_UP_SPEED);
					this.anims.play('flap');
				}
			}
			
			// If the player is further away, move up and down a bit randomly
			else {
				// Randomly move up sometimes
				let odds1 = Phaser.Math.Between(0, 100);
				if (odds1 > 30) {
					this.body.setVelocity(this.body.velocity.x, this.body.velocity.y - ADJUST_UP_SPEED);
					this.anims.play('flap');
				}
				
				
				// 60% chance to keep moving as we already are, 40% to pick a new location
				let odds2 = Phaser.Math.Between(0,100);
				let sign = Math.sign(this.body.velocity.x); // Sign of the current moving direction
				
				// Randomly move up sometimes
				let odds = Phaser.Math.Between(0, 100);
				if (odds > 45) {
					this.body.setVelocityY(this.body.velocity.y - ADJUST_UP_SPEED);
					this.anims.play('flap');
				}
				
				// If they aren't moving, give them a nudge in a random direction
				if (sign == 0) {
					let randDir = odds > 50 ? 1 : -1;
					this.body.setVelocity(randDir*DIFFICULTY_TOP_SPEEDS[this.difficulty]);
				}
				
			}
		}
	}
	
	kill() {
		this.destroy();
	}
}

const PTERODACTYL_SCORE = 1000;
const PTERODACTYL_SPEED = 150;
const PTERODACTYL_UPDATE_RATE = 15; //ms
class Pterodactyl extends Phaser.GameObjects.Sprite {
	constructor(x, y) {
		super(mainScene, x, y, 'mount');
		this.setScale(0.75, 0.125);
		this.timeSinceUpdate = 0;
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
		
		// Randomly move up sometimes
		let odds1 = Phaser.Math.Between(0, 100);
		if (odds1 > 45 && this.timeSinceUpdate >= PTERODACTYL_UPDATE_RATE && this.y > 100) {
			this.body.setVelocity(this.body.velocity.x, this.body.velocity.y - 15);
			this.timeSinceUpdate = 0;
		}
		
		// If Y is near the lava, move up always.
		if (this.y > 550)
			this.body.setVelocity(this.body.velocity.x, this.body.velocity.y - 10);
		
		
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
	
	kill() {
		this.destroy();
	}
}

const EGG_SCORES = [250, 500, 750, 1000];
const EGG_DECELERATION = 0.95;

class Egg extends Phaser.GameObjects.Sprite {
	constructor(x, y, difficulty) {
		super(mainScene, x, y, 'rider');
		this.setScale(0.25);
		this.setTintFill(0xff0000)
		this.difficulty = difficulty;
		this.hatchTime = EGG_HATCH_TIME[difficulty];
	}
	
	update(player) {
		// Friction
		if (this.body.touching.down) {
			this.body.setVelocity(this.body.velocity.x*EGG_DECELERATION, this.body.velocity.y);
		}
		
		// If the egg is not moving, count down on its timer to hatch
		if (Math.abs(this.body.velocity.x) < 1)
			this.hatchTime -= gameTime.getDeltaTimeSeconds();
		
		if (this.hatchTime <= 0)
			this.hatch();
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