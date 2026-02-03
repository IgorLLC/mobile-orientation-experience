/**
 * Mobile Coupon Reveal Experience
 * Muestra un cupón al girar el teléfono a posición vertical
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
     * Detecta la orientación actual del dispositivo
     * @returns {string} 'portrait' o 'landscape'
     */
    function getOrientation() {
        // Método 1: Screen Orientation API (más confiable)
        if (screen.orientation && screen.orientation.type) {
            return screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
        }
        
        // Método 2: window.orientation (legacy, para iOS antiguo)
        if (typeof window.orientation !== 'undefined') {
            return (window.orientation === 0 || window.orientation === 180) ? 'portrait' : 'landscape';
        }
        
        // Método 3: Comparar dimensiones de ventana
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    /**
     * Maneja el cambio de orientación con transición
     */
    function handleOrientationChange() {
        if (isTransitioning) return;
        
        // Pequeño delay para asegurar que las dimensiones se actualicen
        setTimeout(() => {
            const newOrientation = getOrientation();
            
            if (newOrientation !== currentOrientation) {
                // Mostrar transición breve
                if (currentOrientation !== null) {
                    isTransitioning = true;
                    transitionOverlay.classList.add('visible');
                    
                    setTimeout(() => {
                        transitionOverlay.classList.remove('visible');
                        isTransitioning = false;
                        
                        // Re-inicializar iconos después de la transición
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }, 400);
                }
                
                currentOrientation = newOrientation;
                console.log(`Orientación: ${newOrientation}`);
            }
        }, 100);
    }

    /**
     * Copia el código del cupón al portapapeles
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

    /**
     * Fallback para copiar en navegadores sin Clipboard API
     */
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

    /**
     * Muestra feedback visual al copiar
     */
    function showCopyFeedback() {
        const btn = copyBtn;
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
        // Screen Orientation API (moderno)
        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
        }
        
        // Evento orientationchange (legacy, mejor soporte)
        window.addEventListener('orientationchange', handleOrientationChange);
        
        // Resize como fallback (útil para testing en desktop)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleOrientationChange, 150);
        });
        
        // matchMedia listener
        const mediaQuery = window.matchMedia('(orientation: portrait)');
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleOrientationChange);
        } else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleOrientationChange);
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
     * Inicialización principal
     */
    function init() {
        // Detectar orientación inicial
        currentOrientation = getOrientation();
        
        // Configurar listeners
        initListeners();
        
        // Prevenir zoom
        preventZoom();
        
        console.log('Coupon Reveal Experience inicializado');
        console.log(`Orientación inicial: ${currentOrientation}`);
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
