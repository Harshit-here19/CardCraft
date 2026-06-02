const NotificationModule = (function () {
  // --- 1. CSS Injection ---
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'JetBrains Mono';
      src: url('./fonts/JetBrainsMono-VariableFont_wght.woff2') format('woff2');
      font-weight: 100 800;
      font-style: normal;
    }

    #notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'JetBrains Mono', monospace;
    }

    .notification {
      color: #e0e0e0;
      background-color: #1a1a28;
      padding: 20px 25px;
      border-radius: 10px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 255, 195, 0.2);
      min-width: 350px;
      max-width: 400px;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.4s ease, box-shadow 0.6s ease-in-out;
      position: relative;
      overflow: hidden;
      border-left: 5px solid #555;
      margin: 10px 0;
    }

    .notification.show {
      opacity: 1;
      transform: translateY(0);
      animation: pulse-glow 1.5s infinite alternate;
    }

    @keyframes pulse-glow {
      0% { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 255, 195, 0.2); }
      100% { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 255, 195, 0.5); }
    }

    .notification .heading {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #f0f0f0;
      text-shadow: 0 0 3px rgba(0, 255, 195, 0.6);
    }

    .notification .message {
      font-size: 14px;
      line-height: 1.2;
      color: #c0c0c0;
      font-weight: 600;
    }

    .notification .close-btn {
      position: absolute;
      top: 8px;
      right: 12px;
      cursor: pointer;
      font-weight: bold;
      color: #aaa;
    }

    .notification .progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      background: linear-gradient(90deg, #00ffc3, #00a896, #00ffc3);
      width: 0%;
      transition: width linear;
    }

    .notification.success { border-left-color: #2ecc71; }
    .notification.error { border-left-color: #e74c3c; }
    .notification.info { border-left-color: #3498db; }
    .notification.warning { border-left-color: #f1c40f; }
  `;
  document.head.appendChild(style);

  // --- 2. Logic ---
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
  }

  function createNotification(heading, message, options = {}) {
    const { type = 'info', duration = 4000, sound = null } = options;

    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `
      <div class="heading">${heading}</div>
      <div class="message">${message}</div>
      <span class="close-btn">&times;</span>
      <div class="progress"></div>
    `;

    if (sound) {
      const audio = new Audio(sound);
      audio.play().catch(e => console.warn('Sound failed to play:', e));
    }

    notif.querySelector('.close-btn').addEventListener('click', () => hideNotification(notif));
    container.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 50);

    const progress = notif.querySelector('.progress');
    progress.style.transition = `width ${duration}ms linear`;
    setTimeout(() => progress.style.width = '100%', 50);

    setTimeout(() => hideNotification(notif), duration);
  }

  function hideNotification(notif) {
    notif.classList.remove('show');
    setTimeout(() => {
      if (notif.parentNode) notif.parentNode.removeChild(notif);
    }, 400);
  }

  return {
    notify: createNotification
  };
})();