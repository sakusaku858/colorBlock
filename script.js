CELL_WIDTH = 60
CELL_HEIGHT = 40
CELL_NUM_X = 10
CELL_NUM_Y = 8

CANVAS_WIDTH = CELL_WIDTH * CELL_NUM_X
CANVAS_HEIGHT = CELL_HEIGHT * CELL_NUM_Y

COLOR_NUM = 5
RED = 0
GREEN = 1
BLUE = 2
YELLOW = 3
ORANGE = 4
REMOVED = 5

var canvas = document.getElementById('canvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
console.log(canvas)
var ctx = canvas.getContext('2d');

canvas.addEventListener("click", e => {
    const rect = e.target.getBoundingClientRect()
    const viewX = e.clientX - rect.left
    const viewY = e.clientY - rect.top
    const scaleWidth = canvas.clientWidth / canvas.width
    const scaleHeight = canvas.clientHeight / canvas.height
    const canvasX = Math.floor(viewX / scaleWidth)
    const canvasY = Math.floor(viewY / scaleHeight)
    board.clickedFunc(canvasX, canvasY)
})


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

class Cell {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.x1 = x * CELL_WIDTH
        this.x2 = (x + 1) * CELL_WIDTH
        this.y1 = y * CELL_HEIGHT
        this.y2 = (y + 1) * CELL_HEIGHT
        this.color = getRandomInt(0, COLOR_NUM)
    }
    draw() {
        if (this.isRemoved()) return
        let colors = ["red", "green", "blue", "yellow", "orange", "white"]
        ctx.fillStyle = colors[this.color]
        ctx.strokeStyle = "black"
        ctx.fillRect(this.x1, this.y1, CELL_WIDTH, CELL_HEIGHT)
        ctx.strokeRect(this.x1, this.y1, CELL_WIDTH, CELL_HEIGHT)
    }
    isClicked(x, y) {
        return this.x1 < x && x < this.x2 && this.y1 < y && y < this.y2
    }
    remove() {
        this.color = REMOVED
    }
    isRemoved() {
        console.log(this.color == REMOVED)
        return this.color == REMOVED
    }
    isConnected(cell) {
        let d = (cell.x - this.x) ** 2 + (cell.y - this.y) ** 2
        return d == 1
    }
}

class Board {
    constructor() {
        this.cells = []
        for (let i = 0; i < CELL_NUM_X * CELL_NUM_Y; i++) {
            this.cells.push(new Cell(i % CELL_NUM_X, Math.floor(i / CELL_NUM_X)))
        }
    }
    cell(x, y) {
        return this.cells[x + y * CELL_NUM_X]
    }
    draw() {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH)
        for (let cell of this.cells) {
            cell.draw()
        }
    }
    clickedFunc(x, y) {
        console.log(x, y)
        let clickedCell = null
        for (let cell of this.cells) {
            if (cell.isClicked(x, y)) {
                clickedCell = cell
                break
            }
        }
        let connectedCells = this.getConnectedCells(clickedCell)
        for (let cell of connectedCells) {
            cell.remove()
        }
        this.fall()
        this.shiftColumn()
        this.draw()
    }
    getConnectedCells(clickedCell) {
        if (clickedCell == null) return
        let connectedCells = new Set()
        connectedCells.add(clickedCell)
        let color = clickedCell.color
        while (true) {
            let preSize = connectedCells.size
            for (let cell of this.cells) {
                if (cell.color != color) continue
                for (let cnct of connectedCells) {
                    if (cnct.isConnected(cell)) {
                        connectedCells.add(cell)
                    }
                }
            }
            if (preSize == connectedCells.size) break
        }
        if (connectedCells.size == 1) return new Set()
        return connectedCells
    }
    replace(cell1, cell2) {
        let tmp = cell1.color
        cell1.color = cell2.color
        cell2.color = tmp
    }
    fall() {
        for (let x = 0; x < CELL_NUM_X; x++) {
            for (let y = CELL_NUM_Y - 2; y >= 0; y--) {
                let cell = this.cell(x, y)
                while (true) {
                    if (cell.isRemoved()) break
                    let lowerCell = this.getLowerCell(cell)
                    if (lowerCell == null) break
                    if (!lowerCell.isRemoved()) break
                    this.replace(cell, this.getLowerCell(cell))
                    cell = lowerCell
                }
            }
        }
    }
    getLowerCell(cell) {
        let x = cell.x
        let y = cell.y
        if (y == CELL_NUM_Y - 1) return null
        return this.cell(x, y + 1)
    }
    shiftColumn() {
        for (let x = 0; x < CELL_NUM_X; x++) {
            if (this.getColorCellNumOfColumn(x) > 0) {
                while (true) {
                    if (x == 0) break
                    if (this.getColorCellNumOfColumn(x) == 0) break
                    if (this.getColorCellNumOfColumn(x - 1) != 0) break
                    this.replaceColumn(x, x - 1)
                    x = x - 1
                }
            }
        }
    }
    replaceColumn(c1, c2) {
        for (let y = 0; y < CELL_NUM_Y; y++) {
            this.replace(this.cell(c1, y), this.cell(c2, y))
        }
    }
    getColorCellNumOfColumn(x) {
        let count = 0
        for (let y = 0; y < CELL_NUM_Y; y++) {
            if (!this.cell(x, y).isRemoved()) count++
        }
        return count
    }
}

let board = new Board()
board.draw()