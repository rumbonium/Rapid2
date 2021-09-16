// The size of the deadzone. In actuality, it's twice as large as the number provided.
const ENEMY_COLLISION_DEAD_ZONE_SIZE = 10;

function hitLava(player, bomb){
	playerDamage();
}

function hitEnemy(player, enemy) {

	let diff = player.getCenter().y - enemy.getCenter().y;
	let direction = player.getCenter().x - enemy.getCenter().x;
	if (diff > ENEMY_COLLISION_DEAD_ZONE_SIZE) {
		playerDamage();
	}

	else if (diff < -ENEMY_COLLISION_DEAD_ZONE_SIZE) {
		//Create an egg, give it velocity
		let egg = new Egg(enemy.getCenter().x, enemy.getCenter().y, 0);
		eggs.add(egg, true);
		egg.body.setVelocity(enemy.body.velocity.x, enemy.body.velocity.y);
		egg.body.setBounce(1, 0.35);
		
		enemy.kill();

		score += ENEMY_SCORES[enemy.difficulty];
		scoreText.setText('Score: ' + score);
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

function hitPterodactyl(player, pterodactyl) {
	let diff = player.getCenter().y - pterodactyl.getCenter().y;
	
	if (Math.abs(diff) < ENEMY_COLLISION_DEAD_ZONE_SIZE) {
		score += PTERODACTYL_SCORE;
		scoreText.setText('Score: ' + score);
		
		pterodactyl.kill();
	}
	else {
		playerDamage();
	}
}

function destroy(toDestroy, other) {
	toDestroy.kill();
}


function killEgg(player, egg) {
	score += EGG_SCORES[eggCounter];
	eggCounter = (eggCounter >= 3) ? 3 : eggCounter + 1;
	scoreText.setText('Score: ' + score);
	egg.kill();
}

function setGameOver(){
	mainScene.physics.pause();
	player.setTint(0xff0000);
	player.anims.play('turn');
	gameOver = true;
	scoreText.setText('Score: ' + score + '\nHit R to restart');
}

function playerDamage(){
	if(pLogic.decrementPlayerLives() <= 0){
		setGameOver();
	}
	else{
		b_playerIsDamaged = true;
		player.setTint(0xff0000);
		
		// Kill all active pterodactyls
		pterodactyls.children.iterate(pterodactyl => pterodactyl.kill());
	}
}