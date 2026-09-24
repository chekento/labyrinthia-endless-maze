import confetti from 'canvas-confetti';

export function showCongratulations(currentLevel, onClose) {
  // Create and style the popup container
  const popup = document.createElement('div');
  popup.className = 'congratulations-popup';
  
  // Add content
  popup.innerHTML = `
    <div class="popup-content">
      <h2>🎉 Congratulations! 🎉</h2>
      <p>You completed Level ${currentLevel}!</p>
      <button class="next-level-btn">Continue to Level ${currentLevel + 1} →</button>
    </div>
  `;

  // Add styles to document if not already present
  if (!document.getElementById('congratulations-styles')) {
    const styles = document.createElement('style');
    styles.id = 'congratulations-styles';
    styles.textContent = `
      .congratulations-popup {
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

      .popup-content {
        background: linear-gradient(145deg, #1a1a4a 0%, #0a0a2a 100%);
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        border: 2px solid #4a4aff;
        box-shadow: 0 0 20px rgba(74, 74, 255, 0.5);
        animation: scaleIn 0.3s ease-out;
      }

      .popup-content h2 {
        color: #e0e0ff;
        font-size: 2em;
        margin-bottom: 1rem;
        text-shadow: 0 0 10px rgba(74, 74, 255, 0.5);
      }

      .popup-content p {
        color: #e0e0ff;
        font-size: 1.2em;
        margin-bottom: 1.5rem;
      }

      .next-level-btn {
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

      .next-level-btn:hover {
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
        .popup-content {
          padding: 1.5rem;
          margin: 1rem;
        }
        
        .popup-content h2 {
          font-size: 1.5em;
        }
        
        .popup-content p {
          font-size: 1em;
        }
        
        .next-level-btn {
          padding: 0.8rem 1.6rem;
          font-size: 1em;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  // Add to document
  document.body.appendChild(popup);

  // Start confetti
  const confettiDuration = 3000;
  const confettiInterval = setInterval(() => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, 250);

  // Handle close
  const closePopup = () => {
    clearInterval(confettiInterval);
    popup.classList.add('fade-out');
    setTimeout(() => {
      popup.remove();
      if (onClose) onClose();
    }, 300);
  };

  // Add click handler to button
  const nextLevelBtn = popup.querySelector('.next-level-btn');
  nextLevelBtn.textContent = `Continue to Level ${currentLevel + 1} →`;
  nextLevelBtn.addEventListener('click', closePopup);
}