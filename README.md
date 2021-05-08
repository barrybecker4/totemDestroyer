# Totem Destroyer

Re-creation of the old Flash based Totem Destroyer game in javascript using [Phaser]()https://phaser.io/ and [Planck](https://github.com/shakiba/planck.js/). This project is derived from [Emanuele Feronato's blog post](https://www.emanueleferonato.com/2021/03/13/build-a-html5-game-like-old-flash-glory-totem-destroyer-using-phaser-and-planck-js-physics-engine/).' 

## Develop

Npm is used to manage the dependencies. Run `npm ci`, then open index.html in your favorite browser.

If you want to create your own levels you can use [Tiled](https://www.mapeditor.org/). Hold control key when creating block so vertices snap to grid. Create new tile map, create new object layer, and then insert rectangles where desired, with a totem on top. Export as json when done and clean it up a bit.