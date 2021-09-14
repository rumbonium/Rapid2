const DIFFICULTY_TOP_SPEEDS = [100, 125, 175, 200];
const ENEMY_SCORES = [500, 750, 1000, 1000];
const ENEMY_COLORS = [0xff0000, 0xffffff, 0x000000, null];
// The rate that the AI will do inputs measured in frames between. Lower is faster.
const DIFFICULTY_ADJUST_RATE = [15, 14, 13, 12];
const DIFFICULTY_RANGE = [200, 250, 350, 400];
const EGG_HATCH_TIME = [10, 8, 6, 3];

// How much they can move in a single update - probably the same 
// as the player's upwards rate
const ADJUST_UP_SPEED = 65;


class Rider extends Phaser.GameObjects.Sprite {
	constructor(x, y, difficulty) {
		super(mainScene, x, y, 'dude');
		
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
				if (player.getCenter().y <= this.getCenter().y) {
					
					this.body.setVelocity(this.body.velocity.x, this.body.velocity.y - ADJUST_UP_SPEED);
				}
				
				// If we're higher, charge the player
				else {
					if (xDif > 0) {
						this.body.setVelocity(this.body.velocity.x + ADJUST_UP_SPEED, this.body.velocity.y);
					}
					else {
						this.body.setVelocity(this.body.velocity.x - ADJUST_UP_SPEED, this.body.velocity.y);
					}
				}
			}
			
			// If the player is further away, move a bit randomly but generally conserve direction
			else {
				// Randomly move up sometimes
				let odds1 = Phaser.Math.Between(0, 100);
				if (odds1 > 30) {
					this.body.setVelocity(this.body.velocity.x, this.body.velocity.y + ADJUST_UP_SPEED);
				}
				
				
				// 60% chance to keep moving as we already are, 40% to pick a new location
				let odds2 = Phaser.Math.Between(0,100);
				let sign = Math.sign(this.body.velocity.x); // Sign of the current moving direction
				
				if (odds2 >= 60)
					this.body.setVelocity(this.body.velocity.x + sign*ADJUST_UP_SPEED);
				else
					this.body.setVelocity(this.body.velocity.x - sign*ADJUST_UP_SPEED);
				
				
				// If they aren't moving, give them a nudge
				if (sign == 0)
					this.body.setVelocity(ADJUST_UP_SPEED);
				
				// Clamp speed
				this.body.setVelocity(Phaser.Math.Clamp(this.body.velocity.x, -DIFFICULTY_TOP_SPEEDS[this.difficulty], DIFFICULTY_TOP_SPEEDS[this.difficulty]));
			}
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
		super(mainScene, x, y, 'star');
		
		this.difficulty = difficulty;
	}
	
	update(player) {
		if (this.body.touching.down) {
			this.body.setVelocity(this.body.velocity.x*EGG_DECELERATION, this.body.velocity.y);
		}
	}
	
	kill() {
		score += EGG_SCORES[eggCounter];
		eggCounter = (eggCounter >= 3) ? 3 : eggCounter + 1;
		this.destroy();
	}
}