const WallTile = 'W', BlockTile = 'B', GoalTile = 'G', EmptyTile = ' ', Player = 'P';

const settings = {
  gridSize: 25,
  moveSpeedMs: 100
}

const globalState = {
  isMoving: false,
  score: 0,
  active: true
}

const Directions = { Up: 'up', Left: 'left', Right: 'right', Down: 'down' }

const charToCssClass = { 
  'W': 'wall-tile',
  'B': 'block-tile',
  'G': 'goal-tile',
  'P': 'player-tile'
}

function updateDivPos(div) {
  div.style.left = (div.posX * settings.gridSize) + "px";
  div.style.top = (div.posY * settings.gridSize) + "px";
}

function updateScoreOnScreen(globalState) {
  let div = document.querySelector('#score');
  div.innerHTML = `Score: ${globalState.score}`;
}

function handlePossibleWin(globalState) {
  let nBlocks = document.querySelectorAll('.block-tile').length;
  if (globalState.score === nBlocks) {
    document.querySelector('#win-screen').style.visibility = 'visible';
    console.log('game over!');
    globalState.active = false;
  }
}

function onBlockHasMoved(e) {
  if (e.target.gameObjType === BlockTile) {
    const block = e.target;
    const isInGoalArea = block.mapGrid[block.posY][block.posX][0] == GoalTile;
    if (isInGoalArea && !block.inGoalArea) {
      block.inGoalArea = true;
      block.classList.add('block-tile-goal');
      block.globalState.score += 1;
      updateScoreOnScreen(block.globalState);
      handlePossibleWin(block.globalState);
    } else if(block.inGoalArea && !isInGoalArea) {
      block.classList.remove('block-tile-goal');
      block.inGoalArea = false;
      block.globalState.score -= 1;
      updateScoreOnScreen(block.globalState);
    }
  }
}

function makeMap(tileMap, settings, charToCssClass) {
  const { mapGrid, height, width } = tileMap;
  const { gridSize } = settings;
  let container = document.querySelector('#game-container');
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      var div = document.createElement("div");
      div.classList.add("tile");
      div.posX = x; // adding logic map position to each div
      div.posY = y;
      // evry tile has access to global variables
      div.mapGrid = mapGrid; 
      div.globalState = globalState;
      updateDivPos(div);
      const tile = mapGrid[y][x][0];
      div.gameObjType = tile;
      const isMovableObject = tile == Player || tile == BlockTile;
      if (isMovableObject) {
        // removing movable objects from mapGrid since they now exists in DOM
        tileMap.mapGrid[y][x][0] = EmptyTile;
        // Adding an extra floor-tile below movable objects
        var divBelow = document.createElement("div");
        divBelow.classList.add("tile");
        divBelow.posX = x;
        divBelow.posY = y;
        updateDivPos(divBelow);
        container.appendChild(divBelow);
      }
      if (tile == BlockTile) {
        console.log('dd12');
        div.inGoalArea = false;
        document.addEventListener('transitionend', onBlockHasMoved);
      }
      div.classList.add(charToCssClass[tile]);
      container.appendChild(div);
    }
  }
}

function findBoxByPos(posX, posY) {
  const blocks = Array.from(document.querySelectorAll('.block-tile'));
  return blocks.find(b => b.posX === posX && b.posY === posY);
}

function getNextPlayerPos(keyCode) {
  let div = document.querySelector('.player-tile');
  let { posY: nextPosY, posX: nextPosX } = div;
  let direction;
  if (keyCode === 'ArrowUp') nextPosY -= 1, direction = Directions.Up;
  else if (keyCode === 'ArrowDown') nextPosY += 1, direction = Directions.Down;
  else if (keyCode === 'ArrowLeft') nextPosX -= 1, direction = Directions.Left;
  else if (keyCode === 'ArrowRight') nextPosX += 1, direction = Directions.Right;
  return { nextPosY, nextPosX, direction }
}

function getNextPos(posY, posX, direction) {
  if (direction == Directions.Up) return {posY: posY - 1, posX}
  if (direction == Directions.Down) return {posY: posY + 1, posX}
  if (direction == Directions.Left) return {posY, posX: posX - 1}
  if (direction == Directions.Right) return {posY, posX: posX + 1}
}

function checkCollision(posY, posX, tileMap, direction) {
  const { mapGrid } = tileMap;
  const nextTile = mapGrid[posY][posX][0];
  if (nextTile == WallTile) return false;
  const blockTile = findBoxByPos(posX, posY);
  if (!!blockTile) {
    let { posY: nextY, posX: nextX } = getNextPos(posY, posX, direction);
    const nextTile = mapGrid[nextY][nextX][0];
    const boxCanBeMoved = nextTile == EmptyTile || nextTile == GoalTile;
    const boxBehindBox = findBoxByPos(nextX, nextY);
    if (boxBehindBox) return false; 
    const behindNextTile = mapGrid[nextY][nextX][0];
    if (behindNextTile == WallTile) return false;
    blockTile.posX = nextX;
    blockTile.posY = nextY;
    updateDivPos(blockTile);
    return boxCanBeMoved;
  };
  return true;
}

function movePlayer(keyCode, tileMap, globalState) {
  if (globalState.isMoving) return;
  let player = document.querySelector('.player-tile');
  const { nextPosY, nextPosX, direction } = getNextPlayerPos(keyCode);
  if (!checkCollision(nextPosY, nextPosX, tileMap, direction)) return;
  globalState.isMoving = true;
  setTimeout(() => globalState.isMoving = false, settings.moveSpeedMs);
  player.posX = nextPosX;
  player.posY = nextPosY;
  player.direction = direction;
  updateDivPos(player);
}

function handleKeypress(e) {
  e.preventDefault();
  movePlayer(e.code, tileMap01, globalState);
}

function init() {
  document.addEventListener('keydown', handleKeypress);
  makeMap(tileMap01, settings, charToCssClass);
}

init();
