/**
 * Mobile Coupon Reveal Experience
 * Muestra un cupón al girar el teléfono a posición horizontal
 */

(function() {
    'use strict';

    // Inicializar Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Elementos del DOM
    const transitionOverlay = document.getElementById('transitionOverlay');
    const copyBtn = document.getElementById('copyBtn');

    // Estado actual
    let currentOrientation = null;
    let isTransitioning = false;

    /**
     * Actualiza la altura del viewport para móviles
     */
    function updateViewportHeight() {
        const vh = window.innerHeight;
        document.documentElement.style.setProperty('--real-vh', `${vh}px`);
        
        // Aplicar altura real a las vistas
        const views = document.querySelectorAll('.landscape-view, .portrait-view');
        views.forEach(view => {
            view.style.height = `${vh}px`;
        });
    }

    /**
     * Detecta la orientación actual del dispositivo
     */
    function getOrientation() {
        // Método 1: Screen Orientation API
        if (screen.orientation && screen.orientation.type) {
            return screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
        }
        
        // Método 2: window.orientation (legacy)
        if (typeof window.orientation !== 'undefined') {
            return (window.orientation === 0 || window.orientation === 180) ? 'portrait' : 'landscape';
        }
        
        // Método 3: Comparar dimensiones
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    /**
     * Maneja el cambio de orientación
     */
    function handleOrientationChange() {
        if (isTransitioning) return;
        
        updateViewportHeight();
        
        setTimeout(() => {
            const newOrientation = getOrientation();
            
            if (newOrientation !== currentOrientation) {
                if (currentOrientation !== null) {
                    isTransitioning = true;
                    transitionOverlay.classList.add('visible');
                    
                    setTimeout(() => {
                        transitionOverlay.classList.remove('visible');
                        isTransitioning = false;
                        
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }, 300);
                }
                
                currentOrientation = newOrientation;
                updateViewportHeight();
            }
        }, 50);
    }

    /**
     * Copia el código del cupón
     */
    function copyCouponCode() {
        const code = 'BKHOTDOG';
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                showCopyFeedback();
            }).catch(() => {
                fallbackCopy(code);
            });
        } else {
            fallbackCopy(code);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showCopyFeedback();
        } catch (err) {
            console.error('Error al copiar:', err);
        }
        
        document.body.removeChild(textarea);
    }

    function showCopyFeedback() {
        const btn = copyBtn;
        if (!btn) return;
        
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="icon-copy"></i>';
        btn.style.background = 'rgba(76, 175, 80, 0.5)';
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 2000);
    }

    /**
     * Inicializa los event listeners
     */
    function initListeners() {
        // Screen Orientation API
        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
        }
        
        // Evento orientationchange (legacy)
        window.addEventListener('orientationchange', () => {
            setTimeout(handleOrientationChange, 100);
        });
        
        // Resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateViewportHeight();
                handleOrientationChange();
            }, 100);
        });
        
        // matchMedia listener
        const mediaQuery = window.matchMedia('(orientation: portrait)');
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleOrientationChange);
        }
        
        // Copiar cupón
        if (copyBtn) {
            copyBtn.addEventListener('click', copyCouponCode);
        }
    }

    /**
     * Previene el zoom en iOS
     */
    function preventZoom() {
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    /**
     * Inicialización
     */
    function init() {
        updateViewportHeight();
        currentOrientation = getOrientation();
        initListeners();
        preventZoom();
        
        // Actualizar viewport cuando cambia
        window.addEventListener('load', updateViewportHeight);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
