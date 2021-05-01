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
      this.createBox(this.width / 2, this.height - 20, this.width, 40, false, blockTypes.TERRAIN, 0x049b15);
      this.createBox(this.width / 2 - 60, this.height - 60, 40, 40, true, blockTypes.BREAKABLE, 0x6e5d42);
      this.createBox(this.width / 2 + 60, this.height - 60, 40, 40, true, blockTypes.BREAKABLE, 0x6e5d42);
      this.createBox(this.width / 2, this.height - 100, 160, 40, true, blockTypes.BREAKABLE, 0x6e5d42);
      this.createBox(this.width / 2, this.height - 140, 80, 40, true, blockTypes.UNBREAKABLE, 0x3b3b3b);
      this.createBox(this.width / 2 - 20, this.height - 180, 120, 40, true, blockTypes.BREAKABLE, 0x6e5d42);
      this.createBox(this.width / 2, this.height - 240, 160, 80, true, blockTypes.UNBREAKABLE, 0x3b3b3b);
      const idol = this.createBox(this.width / 2, this.height - 320, 40, 80, true, blockTypes.IDOL, 0xfff43a);
      return idol;
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
      let borderColor = Phaser.Display.Color.IntegerToColor(color);
      borderColor.darken(20);

      let userData = {
          blockType: blockType,
          sprite: this.createGraphics()
      }
      userData.sprite.fillStyle(color);
      userData.sprite.fillRect(- width / 2, - height / 2, width, height);
      userData.sprite.lineStyle(4, borderColor.color)
      userData.sprite.strokeRect(- width / 2 + 2, - height / 2 + 2, width - 4, height - 4);

      // a body can have anything in its user data, normally it's used to store its sprite
      box.setUserData(userData);

      return box;
  }
}