// SVG icons and templates for export functionality
export const exportIcons = {
  start: `<svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#00ff00" opacity="0.7"/>
    <text x="12" y="16" fill="#000" text-anchor="middle" font-size="12">S</text>
  </svg>`,
  
  key: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="#ffff00" d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>`,
  
  finish: `<svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#ff0000" opacity="0.7"/>
    <text x="12" y="16" fill="#000" text-anchor="middle" font-size="12">F</text>
  </svg>`
};

export function createExportHeader() {
  return `
    <div style="text-align: center; margin-bottom: 20px; font-family: 'Arial', sans-serif;">
      <h1 style="color: #000; font-size: 24px; margin: 0;">Labyrinthia: The Endless Maze</h1>
    </div>
  `;
}

export function createExportFooter() {
  return `
    <div style="text-align: center; margin-top: 20px; font-family: 'Arial', sans-serif;">
      <p style="color: #666; font-size: 12px;">
        Play online at: https://labyrinthia.webgpl.ai
      </p>
    </div>
  `;
}