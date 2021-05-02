// Derived from
// https://www.emanueleferonato.com/2021/03/13/build-a-html5-game-like-old-flash-glory-totem-destroyer-using-phaser-and-planck-js-physics-engine/

import TotemCreator from "./model/TotemCreator.js"
import blockTypes from "./model/blockTypes.js"

let game;

let gameOptions = {
    // conversion unit from pixels to meters. 30 pixels = 1 meter
    worldScale: 30
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor:0x9ad9ff,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 800,
            height: 600
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}


class playGame extends Phaser.Scene {

    constructor() {
        super("PlayGame");
    }

    preload() {
       this.load.tilemapTiledJSON("totem", "src/assets/totem2.json");
    }

    create() {

        let gravity = planck.Vec2(0, 3);

        // this is how we create a Box2D world
        this.world = planck.World(gravity);

        const creator = new TotemCreator(this.world,
            game.config.width, game.config.height, gameOptions.worldScale, () => this.add.graphics());

        // totem creation
        const map = this.add.tilemap("totem");
        const blocks = map.objects[0].objects;
        this.idol = creator.create(blocks);

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
            if (userData.blockType == blockTypes.BREAKABLE) {

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
            if (userData.blockType == blockTypes.TERRAIN) {

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
