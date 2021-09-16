// Dependant on the 'phaser.js' library

// const PLAYER_STARTING_X = 260;
// const PLAYER_STARTING_Y = 610;
const PLAYER_STARTING_X = 80;
const PLAYER_STARTING_Y = 180;
const PLAYER_GRAVITY = 100;
const PLAYER_VERTICAL_BOUNCE = 0.2;
const PLAYER_HORIZONTAL_BOUNCE = 1;
const PLAYER_AIR_ACCELERATION = 5;
const PLAYER_GROUND_ACCELERATION = 20;
const PLAYER_HORIZONTAL_MAX_SPEED = 300;
const PLAYER_VERTICAL_IMPULSE_STRENGTH = 100;
const PLAYER_MAX_LIVES = 5;

const PLAYER_JUMP_STRENGTH = 300;


class playerLogic{
    constructor(){
        this.flapstate = 0;
        this.playerLives = PLAYER_MAX_LIVES;
		this.mount = -1;
    }


    // Player Update Function
    // Takes a 'player' object and a 'cursors' object
    playerMove(player, cursor){
        if(cursor.left.isDown){
            if(player.body.touching.down){
                player.setVelocityX(player.body.velocity.x - PLAYER_GROUND_ACCELERATION);
                player.anims.play('left', true);
            }
            else{
                player.setVelocityX(player.body.velocity.x - PLAYER_AIR_ACCELERATION);
                player.anims.play('left', true);
            }
        }
        else if(cursor.right.isDown){
            if(player.body.touching.down){
                player.setVelocityX(player.body.velocity.x + PLAYER_GROUND_ACCELERATION);
                player.anims.play('right', true);
            }
            else{
                player.setVelocityX(player.body.velocity.x + PLAYER_AIR_ACCELERATION);
                player.anims.play('right', true);
            }
        }
        else{
            //player.setVelocityX(0);
            player.anims.play('turn');
        }
		
		// Clamp player speed
		player.body.velocity.x = Phaser.Math.Clamp(player.body.velocity.x, -PLAYER_HORIZONTAL_MAX_SPEED, PLAYER_HORIZONTAL_MAX_SPEED);
   
        // simple state machine for 'flap'
        // when 'up' is pressed, it must be released and
        // pressed again before the next flap can happen
        if(this.flapstate == 0){
            if(cursor.up.isDown){
                this.flapstate = 1;
                player.setVelocityY(player.body.velocity.y - PLAYER_VERTICAL_IMPULSE_STRENGTH);
                //play flap animation here
            }
            else{
                this.flapstate = 0;
            }
        }
        else if(this.flapstate == 1){
            if(cursor.up.isUp){
                this.flapstate = 0;
            }
            else{
                this.flapstate = 1;
            }
        }
        else{
            console.log("ERROR: " + this.flapstate);
        }
		
		// Player jumping logic
		let spaceObj = mainScene.input.keyboard.addKey('SPACE');
		
		// If the space key is pressed and the player is on the ground or mounted: jump!
		if (spaceObj.isDown && (player.body.touching.down || this.mount != -1)) {
                player.setVelocityY(player.body.velocity.y - PLAYER_JUMP_STRENGTH);
				this.mount = -1;
		}
    }

    decrementPlayerLives(){
        this.playerLives--;
        livesText.setText('Lives Remaining: ' + this.playerLives);
        return this.playerLives;
    }




}