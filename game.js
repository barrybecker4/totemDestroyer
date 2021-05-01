// From https://www.emanueleferonato.com/2021/03/13/build-a-html5-game-like-old-flash-glory-totem-destroyer-using-phaser-and-planck-js-physics-engine/
let game;

let gameOptions = {

    // conversion unit from pixels to meters. 30 pixels = 1 meter
    worldScale: 30
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor:0x87ceea,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 800,
            height: 400
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}

// constants to store block types
const TERRAIN = 0;
const IDOL = 1;
const BREAKABLE = 2;
const UNBREAKABLE = 3;

class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    create() {

        // world gravity, as a Vec2 object. It's just a x, y vector
        let gravity = planck.Vec2(0, 3);

        // this is how we create a Box2D world
        this.world = planck.World(gravity);

        // totem creation
        this.createBox(game.config.width / 2, game.config.height - 20, game.config.width, 40, false, TERRAIN, 0x049b15);
        this.createBox(game.config.width / 2 - 60, game.config.height - 60, 40, 40, true, BREAKABLE, 0x6e5d42);
        this.createBox(game.config.width / 2 + 60, game.config.height - 60, 40, 40, true, BREAKABLE, 0x6e5d42);
        this.createBox(game.config.width / 2, game.config.height - 100, 160, 40, true, BREAKABLE, 0x6e5d42);
        this.createBox(game.config.width / 2, game.config.height - 140, 80, 40, true, UNBREAKABLE, 0x3b3b3b);
        this.createBox(game.config.width / 2 - 20, game.config.height - 180, 120, 40, true, BREAKABLE, 0x6e5d42);
        this.createBox(game.config.width / 2, game.config.height - 240, 160, 80, true, UNBREAKABLE, 0x3b3b3b);
        this.idol = this.createBox(game.config.width / 2, game.config.height - 320, 40, 80, true, IDOL, 0xfff43a);

        // input listener to call destroyBlock method
        this.input.on("pointerdown", this.destroyBlock, this);

    }

    // method to destroy a block
    destroyBlock(e) {

        // convert pointer coordinates to world coordinates
        let worldX = this.toWorldScale(e.x);
        let worldY = this.toWorldScale(e.y);
        let worldPoint = planck.Vec2(worldX, worldY);

        // query for the world coordinates to check fixtures under the pointer
        this.world.queryAABB(planck.AABB(worldPoint, worldPoint), function(fixture) {

            // get the body from the fixture
            let body = fixture.getBody();

            // get the userdata from the body
            let userData = body.getUserData();

            // is a breakable body?
            if (userData.blockType == BREAKABLE) {

                // destroy the sprite
                userData.sprite.destroy();

                // destroy the body
                this.world.destroyBody(body);
            }
        }.bind(this));
    }

    // simple function to convert pixels to meters
    toWorldScale(n) {
        return n / gameOptions.worldScale;
    }

    // totem block creation
    createBox(posX, posY, width, height, isDynamic, blockType, color) {

        // this is how we create a generic Box2D body
        let box = this.world.createBody();
        if (isDynamic) {

            // Box2D bodies born as static bodies, but we can make them dynamic
            box.setDynamic();
        }

        // a body can have one or more fixtures. This is how we create a box fixture inside a body
        box.createFixture(planck.Box(width / 2 / gameOptions.worldScale, height / 2 / gameOptions.worldScale));

        // now we place the body in the world
        box.setPosition(planck.Vec2(posX / gameOptions.worldScale, posY / gameOptions.worldScale));

        // time to set mass information
        box.setMassData({
            mass: 1,
            center: planck.Vec2(),

            // I have to say I do not know the meaning of this "I", but if you set it to zero, bodies won't rotate
            I: 1
        });

        // now we create a graphics object representing the body
        let borderColor = Phaser.Display.Color.IntegerToColor(color);
        borderColor.darken(20);

        let userData = {
            blockType: blockType,
            sprite: this.add.graphics()
        }
        userData.sprite.fillStyle(color);
        userData.sprite.fillRect(- width / 2, - height / 2, width, height);
        userData.sprite.lineStyle(4, borderColor.color)
        userData.sprite.strokeRect(- width / 2 + 2, - height / 2 + 2, width - 4, height - 4);

        // a body can have anything in its user data, normally it's used to store its sprite
        box.setUserData(userData);

        return box;
    }

    update(t, dt) {

        // advance world simulation
        this.world.step(dt / 1000 * 2);

        // crearForces  method should be added at the end on each step
        this.world.clearForces();

        // get idol contact list
        for (let ce = this.idol.getContactList(); ce; ce = ce.next) {

            // get the contact
            let contact = ce.contact;

            // get the fixture from the contact
            let fixture = contact.getFixtureA();

            // get the body from the fixture
            let body = fixture.getBody();

            // the the userdata from the body
            let userData = body.getUserData();

            // did the idol hit the terrain?
            if (userData.blockType == TERRAIN) {

                // oh no!!
                this.cameras.main.setBackgroundColor(0xa90000)
            }
        }

        // iterate through all bodies
        for (let b = this.world.getBodyList(); b; b = b.getNext()) {

            // get body position
            let bodyPosition = b.getPosition();

            // get body angle, in radians
            let bodyAngle = b.getAngle();

            // get body user data, the graphics object
            let userData = b.getUserData();

            // adjust graphic object position and rotation
            userData.sprite.x = bodyPosition.x * gameOptions.worldScale;
            userData.sprite.y = bodyPosition.y * gameOptions.worldScale;
            userData.sprite.rotation = bodyAngle;
        }
    }
};
