var scoreTextImage;
var scoreNumberImages = [];

var livesTextImage;
var livesNumberImage;

var menuText;

var waveTextImage;
var waveNumberImage;


function initializeFontManager() {
	scoreTextImage = mainScene.add.image(16, 16, 'font_score').setOrigin(0,0);
	for (let i = 0; i<6; i++)
		scoreNumberImages.push(mainScene.add.image(100+i*16, 16, 'font_0').setOrigin(0,0));
	
	livesTextImage = mainScene.add.image(14, 60, 'font_lives').setOrigin(0,0);
	livesNumberImage = mainScene.add.image(100, 60, 'font_' + pLogic.playerLives).setOrigin(0,0);


	menuText = mainScene.add.text(400, 400, 'SLAY\nHit Up Arrow to Start', {fontSize: '32px', fill: '#000'});
	waveTextImage = mainScene.add.image(820, 400, 'font_waves').setOrigin(0,0).setScale(1.5, 1.5);
	waveNumberImage = mainScene.add.image(940, 400, 'font_0').setOrigin(0,0).setScale(1.5, 1.5);

	disableWaveText();
}

function updateLivesText() {
	livesNumberImage.setTexture('font_' + pLogic.playerLives);
}

function updateScoreText() {
	let text = score.toString();
	
	// Pad with zeroes on front
	for (let i=0; i<6-text.length; i++) {
		scoreNumberImages[i].setTexture('font_0');
	}
	// Update image scores where there is change
	for (let j=0; j<text.length; j++) {
		scoreNumberImages[6-text.length+j].setTexture('font_' + text[j]);
	}
	
}

function enableWaveText() {
	waveNumberImage.setTexture('font_' + waveNumber);
	waveNumberImage.setVisible(true);
	waveTextImage.setVisible(true);
}

function disableWaveText() {
	waveNumberImage.setVisible(false);
	waveTextImage.setVisible(false);
}
