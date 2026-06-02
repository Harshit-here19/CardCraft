const ModalModule = (function () {
  // --- 1. CSS Injection ---
  const style = document.createElement('style');
  style.textContent = `
    .modal-overlay {
      /* Absolute layout tracks relative to document height canvas */
      position: absolute !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      /* Using dynamic viewport height units to prevent layout collapse */
      height: 100vh !important;
      background: rgba(10, 10, 16, 0.75) !important;
      backdrop-filter: blur(4px) !important;
      -webkit-backdrop-filter: blur(4px) !important;
      z-index: 2147483647 !important; 
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      opacity: 0;
      transition: opacity 0.3s ease !important;
      font-family: 'JetBrains Mono', monospace !important;
      box-sizing: border-box !important;
    }

    .modal-overlay.show {
      opacity: 1 !important;
    }

    .modal-box {
      background-color: #1a1a28 !important;
      border: 1px solid #2c2c3e !important;
      border-radius: 14px !important;
      padding: 28px !important;
      width: 100% !important;
      max-width: 420px !important;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 255, 195, 0.1) !important;
      transform: scale(0.9) translateY(10px) !important;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      box-sizing: border-box !important;
    }

    .modal-overlay.show .modal-box {
      transform: scale(1) translateY(0) !important;
    }

    .modal-box .modal-title {
      font-size: 18px !important;
      font-weight: 700 !important;
      color: #f0f0f0 !important;
      text-transform: uppercase !important;
      letter-spacing: 1px !important;
      margin-bottom: 12px !important;
      text-shadow: 0 0 3px rgba(0, 255, 195, 0.4) !important;
    }

    .modal-box .modal-message {
      font-size: 14px !important;
      line-height: 1.5 !important;
      color: #c0c0c0 !important;
      font-weight: 500 !important;
      margin-bottom: 20px !important;
    }

    .modal-box .modal-input-field {
      width: 100% !important;
      background: #11111e !important;
      border: 1px solid #33334c !important;
      border-radius: 8px !important;
      color: #ffffff !important;
      padding: 10px 14px !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 14px !important;
      outline: none !important;
      box-sizing: border-box !important;
      margin-bottom: 24px !important;
      transition: border-color 0.2s !important;
    }

    .modal-box .modal-input-field:focus {
      border-color: #00ffc3 !important;
    }

    .modal-box .modal-actions {
      display: flex !important;
      justify-content: flex-end !important;
      gap: 12px !important;
    }

    .modal-box .modal-btn {
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      border: none !important;
      transition: all 0.2s !important;
    }

    .modal-box .modal-btn.cancel {
      background: #252538 !important;
      color: #a0a0b0 !important;
    }
    .modal-box .modal-btn.cancel:hover {
      background: #2e2e45 !important;
      color: #ffffff !important;
    }

    .modal-box .modal-btn.confirm {
      background: #00ffc3 !important;
      color: #1a1a28 !important;
    }
    .modal-box .modal-btn.confirm:hover {
      background: #00a896 !important;
    }

    .modal-box .modal-btn.confirm.destructive {
      background: #ff3b30 !important;
      color: #ffffff !important;
    }
    .modal-box .modal-btn.confirm.destructive:hover {
      background: #d32f2f !important;
    }
  `;
  document.head.appendChild(style);

  // Passive JavaScript event locking routines
  function preventDefaultScroll(e) { e.preventDefault(); }
  const keysToBlock = { 32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1 };
  function preventKeyScroll(e) { if (keysToBlock[e.keyCode]) e.preventDefault(); }

  function showModal(title, message, options = {}) {
    return new Promise((resolve) => {
      const {
        type = 'confirm',
        placeholder = 'Enter value...',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        isDestructive = false
      } = options;

      // 1. Instantly extract current window context position metrics
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      
      // 2. Affix overlay top position match directly to your current scroll value 
      overlay.style.top = `${currentScrollY}px`;

      let inputHtml = '';
      if (type === 'prompt') {
        inputHtml = `<input type="text" class="modal-input-field" placeholder="${placeholder}" autocomplete="off">`;
      }

      overlay.innerHTML = `
        <div class="modal-box">
          <div class="modal-title">${title}</div>
          <div class="modal-message">${message}</div>
          ${inputHtml}
          <div class="modal-actions">
            <button class="modal-btn cancel">${cancelText}</button>
            <button class="modal-btn confirm ${isDestructive ? 'destructive' : ''}">${confirmText}</button>
          </div>
        </div>
      `;

      // Mount into body root canvas workspace
      document.body.insertAdjacentElement('afterbegin', overlay);
      
      // Turn on software scroll lock event handlers
      window.addEventListener('wheel', preventDefaultScroll, { passive: false });
      window.addEventListener('touchmove', preventDefaultScroll, { passive: false });
      window.addEventListener('keydown', preventKeyScroll, { passive: false });

      setTimeout(() => overlay.classList.add('show'), 10);

      const confirmBtn = overlay.querySelector('.modal-btn.confirm');
      const cancelBtn = overlay.querySelector('.modal-btn.cancel');
      const inputField = overlay.querySelector('.modal-input-field');

      // Prevention fix: preventDefault on focus event ensures window tracking does not snap top
      if (type === 'prompt' && inputField) {
        setTimeout(() => {
          if(inputField) {
            inputField.focus({ preventScroll: true }); // Native DOM method override to block focus jumps
          }
        }, 150);
      }

      const closeModal = (resultValue) => {
        overlay.classList.remove('show');
        
        // Remove scroll lock event listeners
        window.removeEventListener('wheel', preventDefaultScroll);
        window.removeEventListener('touchmove', preventDefaultScroll);
        window.removeEventListener('keydown', preventKeyScroll);
        
        setTimeout(() => {
          overlay.remove();
          resolve(resultValue);
        }, 300);
      };

      confirmBtn.addEventListener('click', () => {
        closeModal(type === 'prompt' ? inputField.value : true);
      });

      cancelBtn.addEventListener('click', () => {
        closeModal(type === 'prompt' ? null : false);
      });

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(type === 'prompt' ? null : false);
      });

      if (inputField) {
        inputField.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') confirmBtn.click();
        });
      }
    });
  }

  return {
    open: showModal
  };
})();