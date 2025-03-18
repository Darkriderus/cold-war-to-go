import Phaser from 'phaser'

import BattlemapScene from './scenes/BattlemapScene'
import { SMALL_MAP_PIXELSIZE_HEIGHT, SMALL_MAP_PIXELSIZE_WIDTH } from './helper/constants'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: SMALL_MAP_PIXELSIZE_WIDTH,
		height: SMALL_MAP_PIXELSIZE_HEIGHT
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
