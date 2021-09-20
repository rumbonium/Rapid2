// The size of the deadzone. In actuality, it's twice as large as the number provided.
const ENEMY_COLLISION_DEAD_ZONE_SIZE = 10;

function hitLava(player, bomb){
	playerDamage();
}

function hitEnemy(player, enemy) {
	if(pLogic.mount == -1){ // player is not mounted - hijack or death
		if(player.body.y < enemy.body.y - enemy.body.halfHeight && player.body.velocity.y > 0){
			let egg = new Egg(enemy.getCenter().x+30, enemy.getCenter().y, enemy.difficulty);
			eggs.add(egg, true);
			egg.setPhysics();
			egg.body.setVelocity(enemy.body.velocity.x, enemy.body.velocity.y);

			pLogic.mount = enemy.difficulty;
			player.setTexture('rider_on_mount');

			enemy.kill();
		}
		else{
			playerDamage();
		}
	}
	else{ // player is on a mount - regular joust
		let diff = player.getCenter().y - enemy.getCenter().y;
		let direction = player.getCenter().x - enemy.getCenter().x;
		if (diff > ENEMY_COLLISION_DEAD_ZONE_SIZE) {
			//  replace this with player losing mount
			pLogic.mount = -1;
			player.setTexture('hero_stand');
		}
	
		else if (diff < -ENEMY_COLLISION_DEAD_ZONE_SIZE) {
			//Create an egg, give it velocity
			
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
			
			
			player.body.setVelocity(-player.body.velocity.x, player.body.velocity.y);
			
		}
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
		pLogic.mount = -1;
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
	player.setTintFill(0xff0000);
	player.anims.play('turn');
	gameOver = true;
	scoreText.setText('Score: ' + score + '\nHit R to restart');
}

function playerDamage(){
	if (pLogic.mount>0) {
		// TODO: Create a new mount
		
		// Knock the player off
		pLogic.mount = -1;
	}
	else if(pLogic.decrementPlayerLives() <= 0){
		setGameOver();
	}
	else{
		b_playerIsDamaged = true;
		player.setTintFill(0xff0000);
		
		// Kill all active pterodactyls
		pterodactyls.children.each(pterodactyl => pterodactyl.kill());
	}
}

function enemyEnemy(enemy1, enemy2){
	enemy1.body.setVelocity(-enemy1.body.velocity.x, enemy1.body.velocity.y);
	enemy2.body.setVelocity(-enemy2.body.velocity.x, enemy2.body.velocity.y);
}

function hitMount(player, mount){
	if(pLogic.mount == -1){
		if(player.body.y < mount.body.y - mount.body.halfHeight && player.body.velocity.y > 0){
			pLogic.mount = mount.level;
			mount.kill();
			player.setTexture('rider_on_mount');
			player.setSize(player.displayWidth*2, player.displayHeight*2);
		}
	}
}

function riderMount(rider, mount){
	let _e = new Rider(mount.body.x, mount.body.y, mount.level);
        enemies.add(_e, true);
		_e.setPhysics();
		rider.kill();
		mount.kill();
}