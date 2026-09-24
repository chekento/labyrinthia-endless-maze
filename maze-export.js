import * as jspdf_module from 'jspdf';
const jsPDF = jspdf_module.jsPDF || jspdf_module.default;
import { exportIconSVGs, exportStyles } from './maze-export-icons.js';

// Update function to use new styles and icons
export async function exportMazeAsJPG(canvas, maze, cellSize, cols, rows, currentLevel, key, exit) {
  try {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width + exportStyles.padding * 2;
    exportCanvas.height = canvas.height + exportStyles.padding * 2;
    const ctx = exportCanvas.getContext('2d');
    
    // Clear background
    ctx.fillStyle = exportStyles.backgroundColor;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Add header
    ctx.font = exportStyles.headerFont;
    ctx.fillStyle = exportStyles.headerColor;
    ctx.textAlign = 'center';
    ctx.fillText('Labyrinthia: The Endless Maze', exportCanvas.width/2, exportStyles.padding/2);
    ctx.font = exportStyles.headerFont.replace('28px', '20px');
    ctx.fillText(`Level ${currentLevel}`, exportCanvas.width/2, exportStyles.padding/2 + 30);

    // Draw maze
    ctx.translate(exportStyles.padding, exportStyles.padding);
    ctx.lineWidth = exportStyles.lineWidth;
    ctx.strokeStyle = exportStyles.wallColor;

    drawMazeWalls(ctx, maze, cellSize, cols, rows);
    await drawMazeMarkers(ctx, key, exit, cellSize);

    // Add footer
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = exportStyles.footerFont;
    ctx.fillStyle = exportStyles.footerColor;
    ctx.fillText('https://labyrinthia.webgpl.ai', exportCanvas.width/2, exportCanvas.height - exportStyles.padding/2);

    // Export
    const dataUrl = exportCanvas.toDataURL('image/jpeg', 1.0);
    downloadFile(dataUrl, `labyrinthia-level-${currentLevel}.jpg`);
  } catch (error) {
    console.error('Error exporting maze:', error);
    alert('Failed to export maze');
  }
}

// Helper functions
function drawMazeWalls(ctx, maze, cellSize, cols, rows) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = maze[y][x];
      const cellX = x * cellSize;
      const cellY = y * cellSize;

      if (cell.walls[0]) drawLine(ctx, cellX, cellY, cellX + cellSize, cellY);
      if (cell.walls[1]) drawLine(ctx, cellX + cellSize, cellY, cellX + cellSize, cellY + cellSize);
      if (cell.walls[2]) drawLine(ctx, cellX, cellY + cellSize, cellX + cellSize, cellY + cellSize);
      if (cell.walls[3]) drawLine(ctx, cellX, cellY, cellX, cellY + cellSize);
    }
  }
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

async function drawMazeMarkers(ctx, key, exit, cellSize) {
  const startIcon = new Image();
  const startBlob = new Blob([exportIconSVGs.start], { type: 'image/svg+xml' });
  const startUrl = URL.createObjectURL(startBlob);
  
  const keyIcon = new Image();
  const keyBlob = new Blob([exportIconSVGs.key], { type: 'image/svg+xml' });
  const keyUrl = URL.createObjectURL(keyBlob);

  const exitIcon = new Image();
  const exitBlob = new Blob([exportIconSVGs.finish], { type: 'image/svg+xml' });
  const exitUrl = URL.createObjectURL(exitBlob);

  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalImages = 3;
    
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        resolve();
      }
    };

    startIcon.onload = () => {
      ctx.drawImage(startIcon, cellSize * 0.2, cellSize * 0.2, 
                    cellSize * 0.6, cellSize * 0.6);
      URL.revokeObjectURL(startUrl);
      checkComplete();
    };
    startIcon.src = startUrl;

    keyIcon.onload = () => {
      ctx.drawImage(keyIcon, key.x * cellSize + cellSize * 0.2, key.y * cellSize + cellSize * 0.2, 
                    cellSize * 0.6, cellSize * 0.6);
      URL.revokeObjectURL(keyUrl);
      checkComplete();
    };
    keyIcon.src = keyUrl;

    exitIcon.onload = () => {
      ctx.drawImage(exitIcon, exit.x * cellSize + cellSize * 0.2, exit.y * cellSize + cellSize * 0.2, 
                    cellSize * 0.6, cellSize * 0.6);
      URL.revokeObjectURL(exitUrl);
      checkComplete();
    };
    exitIcon.src = exitUrl;
  });
}

function downloadFile(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

// Add PDF export functionality
export async function exportMazeAsPDF(canvas, maze, cellSize, cols, rows, currentLevel, key, exit) {
  try {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width + exportStyles.padding * 2, canvas.height + exportStyles.padding * 2]
    });

    // Add header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Labyrinthia: The Endless Maze', pdf.internal.pageSize.getWidth() / 2, exportStyles.padding/2, {
      align: 'center'
    });
    
    pdf.setFontSize(20);
    pdf.text(`Level ${currentLevel}`, pdf.internal.pageSize.getWidth() / 2, exportStyles.padding/2 + 30, {
      align: 'center'
    });

    // Create temporary canvas for maze drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');

    // Draw maze with thicker lines
    ctx.lineWidth = exportStyles.lineWidth;
    ctx.strokeStyle = exportStyles.wallColor;
    
    drawMazeWalls(ctx, maze, cellSize, cols, rows);
    await drawMazeMarkers(ctx, key, exit, cellSize);

    // Add maze to PDF
    pdf.addImage(
      tempCanvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      exportStyles.padding,
      exportStyles.padding,
      canvas.width,
      canvas.height
    );

    // Add footer
    pdf.setFontSize(14);
    pdf.setTextColor(102, 102, 102);
    pdf.text('https://labyrinthia.webgpl.ai', pdf.internal.pageSize.getWidth() / 2, 
             pdf.internal.pageSize.getHeight() - exportStyles.padding/2, {
      align: 'center'
    });

    // Save PDF
    pdf.save(`labyrinthia-level-${currentLevel}.pdf`);

  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Failed to export maze as PDF');
  }
}