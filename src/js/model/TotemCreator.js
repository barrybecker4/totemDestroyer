import blockTypes from "./blockTypes.js"

export default class TotemCreator {

  constructor(world, width, height, worldScale, createGraphics) {
    this.world = world;
    this.width = width;
    this.height = height;
    this.worldScale = worldScale;
    this.createGraphics = createGraphics;
  }

  create() {
    const game = this.game;

    const totemModel = {
      name: "Example Totem",
      blocks: [
        {
          xOffset: -60, yOffset: 60,
          width: 40, height: 40,
          blockType: blockTypes.BREAKABLE,
        },
        {
          xOffset: 60, yOffset: 60,
          width: 40, height: 40,
          blockType: blockTypes.BREAKABLE,
        },
        {
          xOffset: 0, yOffset: 100,
          width: 160, height: 40,
          blockType: blockTypes.BREAKABLE,
        },
        {
          xOffset: 0, yOffset: 140,
          width: 80, height: 40,
          blockType: blockTypes.UNBREAKABLE,
        },
        {
          xOffset: -20, yOffset: 180,
          width: 120, height: 40,
          blockType: blockTypes.BREAKABLE,
        },
        {
          xOffset: 0, yOffset: 240,
          width: 160, height: 80,
          blockType: blockTypes.UNBREAKABLE,
        },
      ],
      idol: {
        xOffset: 0, yOffset: 320,
        width: 40, height: 80,
        blockType: blockTypes.IDOL,
      }
    }


    this.createBox(this.width / 2, this.height - 20, this.width, 40,  blockTypes.TERRAIN);

    totemModel.blocks.forEach(blockDef => this.createBoxFromDef(blockDef));

    return this.createBoxFromDef(totemModel.idol);
  }

  createBoxFromDef(def) {
      return this.createBox(this.width / 2 + def.xOffset, this.height - def.yOffset, def.width, def.height, def.blockType)
  }
  // totem block creation
  createBox(posX, posY, width, height, blockType) {

      // this is how we create a generic Box2D body
      let box = this.world.createBody();
      if (blockType != blockTypes.TERRAIN) {
          // Box2D bodies born as static bodies, but we can make them dynamic
          box.setDynamic();
      }

      // a body can have one or more fixtures. This is how we create a box fixture inside a body
      const worldScale = this.worldScale;
      box.createFixture(planck.Box(width / 2 / worldScale, height / 2 / worldScale));

      // now we place the body in the world
      box.setPosition(planck.Vec2(posX / worldScale, posY / worldScale));

      // time to set mass information
      box.setMassData({
          mass: 1,
          center: planck.Vec2(),

          // I have to say I do not know the meaning of this "I", but if you set it to zero, bodies won't rotate
          I: 1
      });

      // now we create a graphics object representing the body
      let borderColor = Phaser.Display.Color.IntegerToColor(blockType.color);
      borderColor.darken(20);

      let userData = {
          blockType: blockType,
          sprite: this.createGraphics()
      }
      userData.sprite.fillStyle(blockType.color);
      userData.sprite.fillRect(- width / 2, - height / 2, width, height);
      userData.sprite.lineStyle(4, borderColor.color)
      userData.sprite.strokeRect(- width / 2 + 2, - height / 2 + 2, width - 4, height - 4);

      // a body can have anything in its user data, normally it's used to store its sprite
      box.setUserData(userData);

      return box;
  }
}