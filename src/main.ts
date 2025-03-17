import Phaser from 'phaser'

import BattlemapScene from './scenes/BattlemapScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1200,
		height: 900
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {
				y: 200,
				x: 0
			},
		},
	},
	scene: [BattlemapScene],
}

export default new Phaser.Game(config)
