const GAMESTATE = {
    s_menu: 's_menu',
    s_play: 's_play',
    s_gameOver: 's_gameOver'
};

const ENEMY_WAVE_NUMBERS = [1, 3, 5, 7, 9, 11];
// const ENEMY_WAVE_NUMBERS = [2, 2, 2, 2, 2, 2];


const WAVE_TEXT_DISPLAY_TIME = 2000; //ms
const PLAYER_SPAWN_TIME = 500; //ms
const PLAYER_DEATH_PAUSE_TIME = 1000; //ms
const ENEMY_SPAWN_TIME = 250; //ms
const ENEMY_SPAWN_PERIOD = 300; //ms
const SAFETY_DURATION = 5000; //ms
const SAFETY_FLASH_PERIOD = 100; //ms
const PTERODACTYL_SPAWN_TIME = 8000; //ms
const SPAWN_LOCATION_X = [350, 400, 1400, 1450];
const SPAWN_LOCATION_Y = [150, 700, 700, 150];

var waveNumber = 0;
var t_waveDisplay = 0;
var b_waveDisplayRunning = false;
var t_enemySpawn = 0;
var b_enemySpawnRunning = false;
var t_enemyPeriod = 0;
var b_enemyPeriodRunning = false;
var t_playerDeathPause = 0;
var b_playerDeathPauseRunning = false;
var t_playerSpawn = 0;
var b_playerSpawnRunning = false;
var t_playerSafety = 0;
var b_playerSafetyRunning = false;
var t_playerSafetyFlash = 0;
var b_FlashTintEnabled = false;
var t_pterodactylTimer = 0;
var b_pterodactylTimerRunning = false;

// last recorded score - required so that we don't load images EVERY Frame
var lastScore;

function gameUpdate(){
	// if the last score is different, update the score images
	if (lastScore != score) {
		lastScore = score;
		updateScoreText();
	}
	
    //wave display timer
    //  start timer if no enemies or eggs exist
    //  display text while timer is running
    //  once expired start enemy spawn timer
    //  player can move while timer runs

    if(!b_waveDisplayRunning && !b_enemySpawnRunning && !b_enemyPeriodRunning){
        if(eggs.countActive() === 0 && enemies.countActive() === 0 && pterodactyls.countActive() === 0){
            t_waveDisplay = WAVE_TEXT_DISPLAY_TIME;
            waveNumber++;
            b_waveDisplayRunning = true;
			
			// Burn bridges on wave 3
			if (waveNumber == 9) {
				lavaPlatforms.clear(true, true);
			}
        }
    }

    if(t_waveDisplay > 0){
		
        enableWaveText();
        t_waveDisplay -= gameTime.getDeltaTime();
        if(t_waveDisplay <= 0){
            t_waveDisplay = 0;
            b_waveDisplayRunning = false;
            disableWaveText();
            t_enemySpawn = ENEMY_SPAWN_TIME;
            b_enemySpawnRunning = true;
			t_pterodactylTimer = PTERODACTYL_SPAWN_TIME;
			b_pterodactylTimerRunning = true;
        }
    }

    //enemy spawn timer
    //  do nothing while timer runs
    //  spawn enemies when timer expires
    //  start enemy spawn period once expired
    //  player can move while timer runs

    if(b_enemySpawnRunning){
        t_enemySpawn -= gameTime.getDeltaTime();
        if(t_enemySpawn <= 0){
            b_enemySpawnRunning = false;
            t_enemyPeriod = ENEMY_SPAWN_PERIOD;
            b_enemyPeriodRunning = true;
        }
    }

    //enemy period timer
    //  do nothing while timer runs
    //  when timer expires spawn 1 enemy
    //  if more enemies need to be spawned restart timer
    //  player can move while timer runs

    if(b_enemyPeriodRunning){
        t_enemyPeriod -= gameTime.getDeltaTime();
        if(t_enemyPeriod <= 0){
            p = Phaser.Math.Between(0, 3);
            let _e = new Rider(SPAWN_LOCATION_X[p], SPAWN_LOCATION_Y[p], 0);
            enemies.add(_e, true);
			_e.setPhysics();
			
            if (enemies.countActive() < ENEMY_WAVE_NUMBERS[waveNumber]){
                t_enemyPeriod = ENEMY_SPAWN_PERIOD;
            }
            else{
                t_enemyPeriod = 0;
                b_enemyPeriodRunning = false;
            }
        }
    }

    //player death pause timer
    //  add death tint upon starting timer
    //  disable player-enemy collisions while timer runs
    //  when timer expires remove tint and disable player
    //  player CANNOT move while timer runs

    if(b_playerIsDamaged){
        b_playerIsDamaged = false;
        t_playerDeathPause = PLAYER_DEATH_PAUSE_TIME;
        b_playerDeathPauseRunning = true;
        player.disableBody(true, false);
        peCollision.active = false;
    }

    if(b_playerDeathPauseRunning){
        t_playerDeathPause -= gameTime.getDeltaTime();
        if(t_playerDeathPause <= 0){
            t_playerDeathPause = 0;
            b_playerDeathPauseRunning = false;
            player.disableBody(true, true);
            t_playerSpawn = PLAYER_SPAWN_TIME;
            b_playerSpawnRunning = true;
        }
    }

    //player spawn timer
    //  do nothing while timer runs
    //  when timer expires enable and spawn player at a random spawn point
    //  start player safety timer
    //  start player safety flash timer
    //  player CANNOT move while timer runs

    if(b_playerSpawnRunning){
        t_playerSpawn -= gameTime.getDeltaTime();
        if(t_playerSpawn <= 0){
            t_playerSpawn = 0;
            b_playerSpawnRunning = false;
            p = Phaser.Math.Between(0,3);
            player.enableBody(true, SPAWN_LOCATION_X[p], SPAWN_LOCATION_Y[p],true, true);
            player.clearTint();
            t_playerSafety = SAFETY_DURATION;
            b_playerSafetyRunning = true;
            t_playerSafetyFlash = SAFETY_FLASH_PERIOD;
        }
    }

    //player safety timer
    //  disable player-enemy collisions while timer runs
    //  timer expires early if player moves
    //  enable player-enemy collisions when expired

    //player safety flash timer
    //  do nothing while timer runs
    //  toggle tint when timer expires
    //  if player safety timer is > 0 restart flash timer
    //  if player moves timer expires and tint is removed if present

    if(b_playerSafetyRunning){
        t_playerSafety -= gameTime.getDeltaTime();
        t_playerSafetyFlash -= gameTime.getDeltaTime();
        if(t_playerSafetyFlash <= 0){
            b_FlashTintEnabled = !b_FlashTintEnabled;
            t_playerSafetyFlash = SAFETY_FLASH_PERIOD;
            if(b_FlashTintEnabled){
                player.setTintFill(0x00ff00)
            }
            else{
                player.clearTint();
            }
        }
        if(t_playerSafety <= 0 || cursors.left.isDown || cursors.right.isDown || spaceObj.isDown){
            t_playerSafety = 0;
            b_playerSafetyRunning = false;
            t_playerSafetyFlash = 0;
            player.clearTint();
            peCollision.active = true;
			
			// Reset pterodactyl spawning
			b_pterodactylTimerRunning = true;
			t_pterodactylTimer = PTERODACTYL_SPAWN_TIME;
        }
    }
	
	//pterodactyl spawn timer
	//  do nothing while timer runs
	//  when timer expires, spawn pterodactyl
	//  timer runs only once
	//  the timer enables itself if there are no current pterodactyls
	
	if (pterodactyls.countActive() === 0 && b_pterodactylTimerRunning) {
		b_pterodactylTimerRunning = true;
		b_pterodactylTimer = PTERODACTYL_SPAWN_TIME;
	}
	
	if (b_pterodactylTimerRunning) {
		t_pterodactylTimer -= gameTime.getDeltaTime();
		if (t_pterodactylTimer <= 0) {
			b_pterodactylTimerRunning = false;
			
			let rand = Phaser.Math.Between(0,3);
			if (rand % 2 == 0) {
				let pt = new Pterodactyl(0, 250);
				pterodactyls.add(pt, true);
				pt.setPhysics();
			}
			else {
				let pt = new Pterodactyl(800, 250);
				pterodactyls.add(pt, true);
				pt.body.setBounce(1, 0.25);
				pt.body.gravity.y = 150;
			}
		}
	}

    if(!b_playerDeathPauseRunning && !b_playerSpawnRunning){
        pLogic.playerMove(player, cursors);
    }
    enemies.children.iterate(enemy => enemy.update(player));
	pterodactyls.children.each(pt => pt.update(player));
    eggs.children.each(function(egg) {egg.update(player)});
    mounts.children.each(function(mount) {mount.update()});
    mainScene.physics.world.wrap(player, 0);
    mainScene.physics.world.wrap(enemies, 0);
	mainScene.physics.world.wrap(pterodactyls, 0);
    mainScene.physics.world.wrap(eggs, 0);
    mainScene.physics.world.wrap(mounts, 0);

    console.log('Player Mount: ' + pLogic.mount);
}