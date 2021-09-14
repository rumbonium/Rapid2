// The size of the deadzone. In actuality, it's twice as large as the number provided.
const ENEMY_COLLISION_DEAD_ZONE_SIZE = 10;

function hitBomb(player, bomb){
	this.physics.pause();
	player.setTint(0xff0000);
	player.anims.play('turn');
	gameOver = true;
	scoreText.setText('Score: ' + score + '\nHit R to restart');
}

function hitEnemy(player, enemy) {
	let diff = player.getCenter().y - enemy.getCenter().y;
	let direction = player.getCenter().x - enemy.getCenter().x;
	if (diff > ENEMY_COLLISION_DEAD_ZONE_SIZE) {
		this.physics.pause();
		player.setTint(0xff0000);
		player.anims.play('turn');
		gameOver = true;
		scoreText.setText('Score: ' + score + '\nHit R to restart');
	}
	else if (diff < -ENEMY_COLLISION_DEAD_ZONE_SIZE) {
		//Create an egg, give it velocity
		let egg = new Egg(enemy.getBottomCenter().x, enemy.getBottomCenter().y, 0);
		eggs.add(egg, true);
		egg.body.setVelocity(enemy.body.velocity.x, enemy.body.velocity.y);
		egg.body.setBounce(1, 0.35);
		
		enemy.kill();
	}
	else {
		// Player on right
		if (direction > 0) {
			player.setPosition(player.x + 5, player.y);
			// TODO: Set the enemy's movement
		}
		// Player on left
		else {
			player.setPosition(player.x - 5, player.y);
			// TODO: Set the enemy's movement
		}
		
		
		player.body.setVelocity(-player.body.velocity.x);
		
	}
}

function destroy(toDestroy, other) {
	toDestroy.kill();
}