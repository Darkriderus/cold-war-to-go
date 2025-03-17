type UnitInfo = {
    playerId : number,
    unitName : string,
    unitId : number
}

type UnitParams = {
    scene : Phaser.Scene,
    unitInfo: UnitInfo
}

export default class Unit extends Phaser.GameObjects.GameObject {   
    constructor(data : UnitParams) {
        let { scene, unitInfo } = data;

    //   let spriteCard = new Phaser.GameObjects.Sprite(scene, 0, 0, card);
    //   let spriteImage = new Phaser.GameObjects.Sprite(scene, 0, 20, image);
    //   let textName = new Phaser.GameObjects.BitmapText(scene, 0, 0, 'pressstart', name, 16, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        super(scene, `unit_${unitInfo.unitId}`);
    //   this.spriteCard = spriteCard;
    //   this.spriteImage = spriteImage;
    //   this.textName = textName;
    //   this.cardname = name;
    //   this.depth = depth;
    //   this.scene = scene;
    //   this.scene.add.existing(this);
    }
  }