function collectStar(player, star){
	star.disableBody(true, true);

	score += 10;
	scoreText.setText('Score: ' + score);

	if(stars.countActive(true) === 0){
		stars.children.iterate(function(child){
			child.enableBody(true, child.x, 0, true, true);
		});
		var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
		var bomb = bombs.create(x, 16, 'bomb');
		bomb.setBounce(1);
		//bomb.setCollideWorldBounds(true);
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
	}
}

function hitBomb(player, bomb){
	this.physics.pause();
	player.setTint(0xff0000);
	player.anims.play('turn');
	gameOver = true;
	scoreText.setText('Score: ' + score + '\nHit R to restart');
}

function hitEnemy(player, enemy) {
	if (enemy.getCenter().y > player.getCenter().y) {
		this.physics.pause();
		player.setTint(0xff0000);
		player.anims.play('turn');
		gameOver = true;
		scoreText.setText('Score: ' + score + '\nHit R to restart');
	}
	else {
		enemy.destroy();
		
		// TODO: Create an egg, give it velocity
	}
	}
}