/**
 * Mobile Orientation Experience
 * Detecta y responde a cambios de orientación del dispositivo
 */

(function() {
    'use strict';

    // Elementos del DOM
    const portraitView = document.querySelector('.portrait-view');
    const landscapeView = document.querySelector('.landscape-view');
    const transitionOverlay = document.getElementById('transitionOverlay');

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
     * Muestra la vista correspondiente a la orientación
     * @param {string} orientation - 'portrait' o 'landscape'
     * @param {boolean} animate - Si debe animar la transición
     */
    function showView(orientation, animate = true) {
        if (isTransitioning) return;
        
        const isPortrait = orientation === 'portrait';
        
        if (animate && currentOrientation !== null && currentOrientation !== orientation) {
            // Mostrar overlay de transición
            isTransitioning = true;
            transitionOverlay.classList.add('visible');
            
            // Remover clase active de ambas vistas
            portraitView.classList.remove('active');
            landscapeView.classList.remove('active');
            
            // Después de un breve delay, mostrar la nueva vista
            setTimeout(() => {
                if (isPortrait) {
                    portraitView.classList.add('active');
                } else {
                    landscapeView.classList.add('active');
                }
                
                // Ocultar overlay
                setTimeout(() => {
                    transitionOverlay.classList.remove('visible');
                    isTransitioning = false;
                }, 200);
            }, 300);
        } else {
            // Sin animación (carga inicial)
            if (isPortrait) {
                portraitView.classList.add('active');
                landscapeView.classList.remove('active');
            } else {
                landscapeView.classList.add('active');
                portraitView.classList.remove('active');
            }
        }
        
        currentOrientation = orientation;
        
        // Log para debugging
        console.log(`Orientación: ${orientation}`);
    }

    /**
     * Manejador del evento de cambio de orientación
     */
    function handleOrientationChange() {
        // Pequeño delay para asegurar que las dimensiones se actualicen
        setTimeout(() => {
            const newOrientation = getOrientation();
            if (newOrientation !== currentOrientation) {
                showView(newOrientation, true);
            }
        }, 100);
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
        
        // matchMedia listener (otro método de detección)
        const mediaQuery = window.matchMedia('(orientation: portrait)');
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleOrientationChange);
        } else if (mediaQuery.addListener) {
            // Para navegadores antiguos
            mediaQuery.addListener(handleOrientationChange);
        }
    }

    /**
     * Previene el zoom en iOS
     */
    function preventZoom() {
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
        
        // Prevenir doble tap zoom
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
        const initialOrientation = getOrientation();
        showView(initialOrientation, false);
        
        // Configurar listeners
        initListeners();
        
        // Prevenir zoom (mejor UX en móvil)
        preventZoom();
        
        console.log('Mobile Orientation Experience inicializado');
        console.log(`Orientación inicial: ${initialOrientation}`);
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
