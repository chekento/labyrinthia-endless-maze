// Handle UI elements that were previously in index.html
export function addVibeJamButton() {
  const button = document.createElement('a');
  button.href = 'https://jam.pieter.com';
  button.target = '_blank';
  button.style.fontFamily = 'system-ui, sans-serif';
  button.style.position = 'fixed';
  button.style.bottom = '-1px';
  button.style.right = '-1px';
  button.style.padding = '7px';
  button.style.fontSize = '14px';
  button.style.fontWeight = 'bold';
  button.style.background = '#fff';
  button.style.color = '#000';
  button.style.textDecoration = 'none';
  button.style.zIndex = '10000';
  button.style.borderTopLeftRadius = '12px';
  button.style.border = '1px solid #fff';
  button.textContent = '🕹️ Vibe Jam 2025';
  
  document.body.appendChild(button);
}

export function showInfoPopup(message, onClose) {
  // Create and style the popup container
  const popup = document.createElement('div');
  popup.className = 'info-popup';

  // Add content
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button class="ok-btn">OK</button>
    </div>
  `;

  // Add styles to document if not already present
  if (!document.getElementById('info-popup-styles')) {
    const styles = document.createElement('style');
    styles.id = 'info-popup-styles';
    styles.textContent = `
      .info-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        font-family: 'Orbitron', sans-serif;
        animation: fadeIn 0.3s ease-out;
      }

      .info-popup .popup-content {
        background: linear-gradient(145deg, #1a1a4a 0%, #0a0a2a 100%);
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        border: 2px solid #4a4aff;
        box-shadow: 0 0 20px rgba(74, 74, 255, 0.5);
        animation: scaleIn 0.3s ease-out;
      }

      .info-popup .popup-content p {
        color: #e0e0ff;
        font-size: 1.2em;
        margin-bottom: 1.5rem;
      }

      .info-popup .ok-btn {
        background: #4a4aff;
        color: #e0e0ff;
        border: none;
        padding: 1rem 2rem;
        font-size: 1.1em;
        border-radius: 10px;
        cursor: pointer;
        font-family: 'Orbitron', sans-serif;
        transition: all 0.3s ease;
      }

      .info-popup .ok-btn:hover {
        background: #7a7aff;
        box-shadow: 0 0 15px rgba(74, 74, 255, 0.7);
        transform: scale(1.05);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      @media (max-width: 600px) {
        .info-popup .popup-content {
          padding: 1.5rem;
          margin: 1rem;
        }

        .info-popup .popup-content p {
          font-size: 1em;
        }

        .info-popup .ok-btn {
          padding: 0.8rem 1.6rem;
          font-size: 1em;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  // Add to document
  document.body.appendChild(popup);

  // Handle close
  const closePopup = () => {
    popup.classList.add('fade-out');
    setTimeout(() => {
      popup.remove();
      if (onClose) onClose();
    }, 300);
  };

  // Add click handler to button
  const okBtn = popup.querySelector('.ok-btn');
  okBtn.addEventListener('click', closePopup);
}

// Time attack UI component
export function createTimeAttackUI(currentTime, bestTime) {
  let ui = document.getElementById('time-attack-ui');
  if (!ui) {
    ui = document.createElement('div');
    ui.id = 'time-attack-ui';
    ui.className = 'time-attack-ui';
    document.body.appendChild(ui);
  }
  
  const current = (currentTime / 1000).toFixed(1);
  const best = bestTime ? (bestTime / 1000).toFixed(1) : 'N/A';
  
  ui.innerHTML = `
    <div>⏱️ Current: ${current}s</div>
    <div>🏆 Best: ${best}s</div>
  `;
  
  return ui;
}