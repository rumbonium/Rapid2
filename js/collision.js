function hitBomb(player, bomb){
	this.physics.pause();
	player.setTint(0xff0000);
	player.anims.play('turn');
	gameOver = true;
	scoreText.setText('Score: ' + score + '\nHit R to restart');
}

function hitEnemy(player, enemy) {
	if (enemy.getCenter().y < player.getCenter().y) {
		this.physics.pause();
		player.setTint(0xff0000);
		player.anims.play('turn');
		gameOver = true;
		scoreText.setText('Score: ' + score + '\nHit R to restart');
	}
	else {
		//Create an egg, give it velocity
		let egg = new Egg(enemy.getBottomCenter().x, enemy.getBottomCenter().y, 0);
		eggs.add(egg, true);
		egg.body.setVelocity(enemy.body.velocity.x, enemy.body.velocity.y);
		egg.body.setBounce(1, 0.35);
		
		enemy.kill();
	}
}

function destroy(toDestroy, other) {
	toDestroy.kill();
}