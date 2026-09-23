// Procedural maze utilities. The maze is intentionally larger than the viewport;
// game.js renders a camera window around the player instead of shrinking the maze.

export function createSeed(level = 1, salt = Date.now()) {
  let value = (Math.imul(level + 0x9e3779b9, 0x85ebca6b) ^ Math.floor(salt)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d) >>> 0;
  value ^= value >>> 15;
  return value >>> 0;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function oddAtLeast(value) {
  const integer = Math.max(5, Math.floor(value));
  return integer % 2 === 0 ? integer + 1 : integer;
}

export function levelDimensions(currentLevel) {
  const level = Math.max(1, Math.floor(Number(currentLevel) || 1));
  // Grow for a long time, then keep a safe upper bound for mobile memory.
  const growth = 15 + Math.floor(Math.sqrt(level) * 5.2) + Math.floor(level / 12) * 2;
  const side = Math.min(181, Math.max(15, growth));
  return { cols: oddAtLeast(side), rows: oddAtLeast(side) };
}

export function initMaze(canvas, cellSize, currentLevel, seed = createSeed(currentLevel)) {
  const { cols, rows } = levelDimensions(currentLevel);
  const exit = { x: cols - 2, y: rows - 2 };
  const maze = [];

  for (let y = 0; y < rows; y += 1) {
    maze[y] = [];
    for (let x = 0; x < cols; x += 1) {
      maze[y][x] = {
        x,
        y,
        walls: [true, true, true, true],
        visited: false
      };
    }
  }

  return { maze, cols, rows, exit, seed, cellSize };
}

export function generateMaze(maze, cols, rows, currentLevel, seed = createSeed(currentLevel)) {
  const random = mulberry32(seed);
  const stack = [];
  const start = maze[1][1];
  start.visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, maze, cols, rows);

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const next = neighbors[Math.floor(random() * neighbors.length)];
    removeWalls(current, next);
    next.visited = true;
    stack.push(next);
  }

  addExtraPaths(maze, cols, rows, currentLevel, random);
  return maze;
}

export function chooseKey(maze, cols, rows, exit, seed = 1) {
  const random = mulberry32((seed ^ 0xa5a5a5a5) >>> 0);
  const candidates = [];
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < cols - 1; x += 1) {
      const distanceFromStart = Math.abs(x - 1) + Math.abs(y - 1);
      const distanceFromExit = Math.abs(x - exit.x) + Math.abs(y - exit.y);
      if (!(x === 1 && y === 1) && !(x === exit.x && y === exit.y) && distanceFromStart + distanceFromExit > Math.floor((cols + rows) * 0.55)) {
        candidates.push(maze[y][x]);
      }
    }
  }
  return candidates.length > 0 ? candidates[Math.floor(random() * candidates.length)] : maze[Math.max(1, rows - 3)][Math.max(1, cols - 3)];
}

export function getUnvisitedNeighbors(cell, maze, cols, rows) {
  const neighbors = [];
  const { x, y } = cell;
  if (y > 1 && !maze[y - 1][x].visited) neighbors.push(maze[y - 1][x]);
  if (x < cols - 2 && !maze[y][x + 1].visited) neighbors.push(maze[y][x + 1]);
  if (y < rows - 2 && !maze[y + 1][x].visited) neighbors.push(maze[y + 1][x]);
  if (x > 1 && !maze[y][x - 1].visited) neighbors.push(maze[y][x - 1]);
  return neighbors;
}

export function removeWalls(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  if (dx === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (dx === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  if (dy === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (dy === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

export function addExtraPaths(maze, cols, rows, currentLevel, random = Math.random) {
  const pathAttempts = Math.min(Math.floor(cols * rows * 0.18), 8 + Math.floor(Math.sqrt(currentLevel) * 2));
  for (let i = 0; i < pathAttempts; i += 1) {
    const x = 1 + Math.floor(random() * Math.max(1, cols - 2));
    const y = 1 + Math.floor(random() * Math.max(1, rows - 2));
    const direction = Math.floor(random() * 4);
    const nx = x + (direction === 1 ? 1 : direction === 3 ? -1 : 0);
    const ny = y + (direction === 2 ? 1 : direction === 0 ? -1 : 0);
    if (nx <= 0 || nx >= cols - 1 || ny <= 0 || ny >= rows - 1) continue;
    maze[y][x].walls[direction] = false;
    maze[ny][nx].walls[(direction + 2) % 4] = false;
  }
}

export function canMove(maze, player, dx, dy) {
  const currentCell = maze?.[player.y]?.[player.x];
  if (!currentCell) return false;
  if (dx === 1) return !currentCell.walls[1];
  if (dx === -1) return !currentCell.walls[3];
  if (dy === 1) return !currentCell.walls[2];
  if (dy === -1) return !currentCell.walls[0];
  return false;
}

export function solveMaze(maze, start, target, cols, rows) {
  const queue = [{ x: start.x, y: start.y }];
  const visited = new Set([`${start.x},${start.y}`]);
  const previous = new Map();

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.x === target.x && current.y === target.y) return reconstructPath(previous, current);

    for (const neighbor of getValidNeighborsForAI(current, maze, cols, rows)) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      previous.set(key, current);
      queue.push({ x: neighbor.x, y: neighbor.y });
    }
  }
  return [];
}

function getValidNeighborsForAI(cell, maze, cols, rows) {
  const neighbors = [];
  if (cell.y > 0 && !maze[cell.y][cell.x].walls[0]) neighbors.push(maze[cell.y - 1][cell.x]);
  if (cell.x < cols - 1 && !maze[cell.y][cell.x].walls[1]) neighbors.push(maze[cell.y][cell.x + 1]);
  if (cell.y < rows - 1 && !maze[cell.y][cell.x].walls[2]) neighbors.push(maze[cell.y + 1][cell.x]);
  if (cell.x > 0 && !maze[cell.y][cell.x].walls[3]) neighbors.push(maze[cell.y][cell.x - 1]);
  return neighbors.filter((neighbor) => neighbor.x > 0 && neighbor.x < cols - 1 && neighbor.y > 0 && neighbor.y < rows - 1);
}

function reconstructPath(previous, endCell) {
  const path = [];
  let current = endCell;
  while (current) {
    path.unshift(current);
    current = previous.get(`${current.x},${current.y}`);
  }
  return path;
}
