// Dependant on the 'phaser.js' library

// const PLAYER_STARTING_X = 260;
// const PLAYER_STARTING_Y = 610;
const PLAYER_STARTING_X = 888;
const PLAYER_STARTING_Y = 765;
const PLAYER_GRAVITY = 100;
const PLAYER_VERTICAL_BOUNCE = 0.2;
const PLAYER_HORIZONTAL_BOUNCE = 1;
const PLAYER_AIR_ACCELERATION = 5;
const PLAYER_GROUND_ACCELERATION = 20;
const PLAYER_HORIZONTAL_MAX_SPEED = 300;
const PLAYER_VERTICAL_IMPULSE_STRENGTH = 100;
const PLAYER_MAX_LIVES = 5;

const PLAYER_JUMP_STRENGTH = 500;


class playerLogic{
    constructor(){
        this.flapstate = 0;
        this.playerLives = PLAYER_MAX_LIVES;
		this.mount = -1;
    }


    // Player Update Function
    // Takes a 'player' object and a 'cursors' object
    playerMove(player, cursor){
        if(this.mount == -1){
            player.setTexture('hero_stand');
        }
        else{
            player.setTexture('hero_on_mount');
            player.clearTint();
        }

        if(cursor.left.isDown){
            player.flipX = false;
            if(player.body.touching.down){
                player.setVelocityX(player.body.velocity.x - PLAYER_GROUND_ACCELERATION);
            }
            else{
                player.setVelocityX(player.body.velocity.x - PLAYER_AIR_ACCELERATION);
            }
        }
        else if(cursor.right.isDown){
            player.flipX = true;
            if(player.body.touching.down){
                player.setVelocityX(player.body.velocity.x + PLAYER_GROUND_ACCELERATION);
            }
            else{
                player.setVelocityX(player.body.velocity.x + PLAYER_AIR_ACCELERATION);
            }
        }
        else{
            if(player.body.velocity.x > 0){
                player.flipX = true;
            }
            else{
                player.flipX = false;
            }
        }
		
		// Clamp player speed
		player.body.velocity.x = Phaser.Math.Clamp(player.body.velocity.x, -PLAYER_HORIZONTAL_MAX_SPEED, PLAYER_HORIZONTAL_MAX_SPEED);
   
        // simple state machine for 'flap'
        // when 'up' is pressed, it must be released and
        // pressed again before the next flap can happen
        if(this.mount != -1){
            if(this.flapstate == 0){
                if(cursor.up.isDown){
                    this.flapstate = 1;
                    player.setVelocityY(player.body.velocity.y - PLAYER_VERTICAL_IMPULSE_STRENGTH);
                    // player.anims.play('flap');
					mainScene.sound.play('wing_flap');
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

		// Player jumping logic
		let spaceObj = mainScene.input.keyboard.addKey('SPACE');

        if(spaceObj.isDown){
            this.heroJump();
        }
    }

    decrementPlayerLives(){
        this.playerLives--;
        livesText.setText('Lives Remaining: ' + this.playerLives);
        return this.playerLives;
    }

    heroJump(){
        if(this.mount == -1 && player.body.touching.down){
            player.setVelocityY(player.body.velocity.y - PLAYER_JUMP_STRENGTH);
        }
        else if(this.mount != -1){
            // player.setTexture('hero_jump');
            player.anims.play('hero_jumping');
            player.setVelocityY(player.body.velocity.y - PLAYER_JUMP_STRENGTH);
            player.setSize(player.displayWidth*2, player.displayHeight*2);
            this.spawnMount(player.getCenter().x, player.getCenter().y-100, this.mount);
            this.mount = -1;
        }
    }

    spawnMount(x, y, level){
        let _m = new Mount(x, y, level);
        mounts.add(_m, true);
        _m.setPhysics();
    }

}