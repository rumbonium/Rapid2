const DIFFICULTY_SPEEDS = [100, 125, 175, 200]


class enemy {
	
	constructor(difficulty) {
		this.difficulty = difficulty;
	}
	
	update(player, enemy) {
		enemy.setVelocity(100, 10);
	}
	
	
}