import Phaser from 'phaser'

import BattlemapScene from './scenes/BattlemapScene'
import BattleUI from './scenes/BattleUI'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1200,
		height: 800,
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
	scene: [BattlemapScene, BattleUI],
}

export default new Phaser.Game(config)
