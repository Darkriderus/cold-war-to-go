import Phaser from "phaser";
import { TERRAIN_INFO } from "../objects/terrain";

const GRID_SIZE = 90; // 90 x 90 Raster
const CELL_SIZE = 10; // Zellen sind 10x10 Pixel groß
const BRUSH_SIZES = [1, 3, 5]; // Verfügbare Pinselgrößen (1x1, 3x3, 5x5)

export default class MapGenScene extends Phaser.Scene {
    private selectedColor: number = 0xffffff; // Standardfarbe
    private selectedBrushSize: number = BRUSH_SIZES[0]; // Standardpinselgröße (1x1)
    private grid: Phaser.GameObjects.Rectangle[][] = [];
    private isDrawing: boolean = false; // Ob die Maus gedrückt ist

    constructor() {
        super("MapGenScene");
    }

    create() {
        // Raster erstellen
        for (let row = 0; row < GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GRID_SIZE; col++) {
                let cell = this.add.rectangle(
                    col * CELL_SIZE,
                    row * CELL_SIZE,
                    CELL_SIZE,
                    CELL_SIZE,
                    0xffffff // Standardfarbe: Weiß
                )
                    .setOrigin(0)
                    .setInteractive()
                    .setStrokeStyle(1, 0x000000); // Schwarzer Rahmen

                // Einzelklick färbt das Feld
                cell.on("pointerdown", () => {
                    this.fillCells(col, row);
                });

                this.grid[row][col] = cell;
            }
        }

        // Farbauswahl-Menü

        Object.entries(TERRAIN_INFO).forEach(([terrainType, terrain], index) => {
            let button = this.add.rectangle(
                GRID_SIZE * CELL_SIZE + 20, // Position neben dem Raster
                50 + index * 50,
                40,
                40,
                terrain.color
            )
                .setInteractive()
                .setOrigin(0);

            button.on("pointerdown", () => {
                this.selectedColor = terrain.color;
            });

            this.add.text(
                GRID_SIZE * CELL_SIZE + 60,
                50 + index * 50,
                `${terrainType}`,
                { font: '16px Arial', color: '#ffffff' }
            );
        });

        // Pinselgrößen-Auswahl-Menü
        BRUSH_SIZES.forEach((size, index) => {
            let button = this.add.rectangle(
                GRID_SIZE * CELL_SIZE + 100, // Position neben dem Farbauswahl-Menü
                50 + index * 50,
                40,
                40,
                0xaaaaaa // Graue Buttons für Pinselgrößen
            )
                .setInteractive()
                .setOrigin(0);

            button.on("pointerdown", () => {
                this.selectedBrushSize = size;
            });

            // Pinselgrößentext
            this.add.text(
                GRID_SIZE * CELL_SIZE + 140,
                50 + index * 50,
                `${size}x${size}`,
                { font: '16px Arial', color: '#ffffff' }
            );
        });

        // Export-Button
        let exportButton = this.add.rectangle(
            GRID_SIZE * CELL_SIZE + 20, 500, 100, 40, 0x00ff00
        )
            .setInteractive()
            .setOrigin(0);

        this.add.text(GRID_SIZE * CELL_SIZE + 30, 510, "Export", { font: '16px Arial', color: '#000' });

        exportButton.on("pointerdown", () => {
            this.exportGrid();
        });

        // Import-Button
        let importButton = this.add.rectangle(
            GRID_SIZE * CELL_SIZE + 140, 500, 100, 40, 0xffaa00
        )
            .setInteractive()
            .setOrigin(0);

        this.add.text(GRID_SIZE * CELL_SIZE + 150, 510, "Import", { font: '16px Arial', color: '#000' });

        importButton.on("pointerdown", () => {
            this.importGrid();
        });

        // Maus gedrückt halten, um mehrere Felder zu färben
        this.input.on("pointerdown", () => {
            this.isDrawing = true;
        });

        this.input.on("pointerup", () => {
            this.isDrawing = false;
        });

        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (this.isDrawing) {
                const col = Math.floor(pointer.x / CELL_SIZE);
                const row = Math.floor(pointer.y / CELL_SIZE);
                if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
                    this.fillCells(col, row);
                }
            }
        });
    }

    // Funktion zum Füllen der Zellen im Bereich der Pinselgröße
    private fillCells(col: number, row: number) {
        const halfBrush = Math.floor(this.selectedBrushSize / 2);
        for (let dx = -halfBrush; dx <= halfBrush; dx++) {
            for (let dy = -halfBrush; dy <= halfBrush; dy++) {
                const targetCol = col + dx;
                const targetRow = row + dy;

                // Sicherstellen, dass wir innerhalb des Rasters bleiben
                if (
                    targetCol >= 0 &&
                    targetCol < GRID_SIZE &&
                    targetRow >= 0 &&
                    targetRow < GRID_SIZE
                ) {
                    this.grid[targetRow][targetCol].fillColor = this.selectedColor;
                }
            }
        }
    }

    // Exportiert das Raster als JSON-Datei
    private exportGrid() {
        const gridData = this.grid.map(row => row.map(cell => cell.fillColor));
        const jsonData = JSON.stringify(gridData);

        // Erstellen und Herunterladen der Datei
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "grid_data.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    // Importiert ein JSON-Raster
    private importGrid() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";

        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target?.result as string);
                    this.loadGrid(jsonData);
                } catch (error) {
                    console.error("Fehler beim Laden der Datei:", error);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    // Lädt das Raster aus JSON-Daten
    private loadGrid(gridData: number[][]) {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (gridData[row] && gridData[row][col] !== undefined) {
                    this.grid[row][col].fillColor = gridData[row][col];
                }
            }
        }
    }
}
