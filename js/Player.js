// Dependant on the 'phaser.js' library

const PLAYER_STARTING_X = 450;
const PLAYER_STARTING_Y = 350;
const PLAYER_GRAVITY = 100;
const PLAYER_VERTICAL_BOUNCE = 0.2;
const PLAYER_HORIZONTAL_BOUNCE = 1;
const PLAYER_AIR_ACCELERATION = 5;
const PLAYER_GROUND_ACCELERATION = 20;
const PLAYER_HORIZONTAL_MAX_SPEED = 300;
const PLAYER_VERTICAL_IMPULSE_STRENGTH = 100;
const PLAYER_MAX_LIVES = 2;


class playerLogic{
    constructor(){
        this.flapstate = 0;
        this.playerLives = PLAYER_MAX_LIVES;
    }


    // Player Update Function
    // Takes a 'player' object and a 'cursors' object
    playerUpdate(player, cursor){
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
    
        if(player.body.velocity.x > PLAYER_HORIZONTAL_MAX_SPEED){
            player.body.velocity.x = PLAYER_HORIZONTAL_MAX_SPEED;
        }
        if(player.body.velocity.x < -PLAYER_HORIZONTAL_MAX_SPEED){
            player.body.velocity.x = -PLAYER_HORIZONTAL_MAX_SPEED;
        }
    
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
    }

    decrementPlayerLives(){
        this.playerLives--;
        livesText.setText('Lives Remaining: ' + this.playerLives);
        return this.playerLives;
    }




}