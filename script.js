/**
 * Mobile Coupon Reveal Experience
 * Muestra un cupón al girar el teléfono a posición horizontal
 * Con mensaje para desktop/tablet indicando que es solo para móviles
 */

/**
 * ================================
 * DETECCIÓN DE DISPOSITIVO (SIMPLE)
 * ================================
 */
function isMobileDevice() {
    const ua = navigator.userAgent;
    
    // Detectar móviles por User Agent - solo iPhone y Android Mobile
    const isMobile = /iPhone|iPod|Android.*Mobile/i.test(ua);
    
    // Log para debug
    console.log('[BK Coupon] User Agent:', ua);
    console.log('[BK Coupon] Is Mobile:', isMobile);
    
    return isMobile;
}

// Exponer para debug
window.isMobileDevice = isMobileDevice;

/**
 * ================================
 * APLICACIÓN PRINCIPAL
 * ================================
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
    const swipeIndicator = document.getElementById('swipeIndicator');
    const desktopView = document.getElementById('desktopView');
    const portraitView = document.querySelector('.portrait-view');
    const landscapeView = document.querySelector('.landscape-view');

    // Estado actual
    let currentOrientation = null;
    let isTransitioning = false;
    let currentViewMode = null; // 'mobile' | 'desktop'

    /**
     * Actualiza la altura del viewport
     */
    function updateViewportHeight() {
        const vh = window.innerHeight;
        document.documentElement.style.setProperty('--real-vh', `${vh}px`);
    }

    /**
     * Oculta el indicador de swipe cuando el usuario hace scroll
     */
    function hideSwipeIndicator() {
        if (swipeIndicator && !swipeIndicator.classList.contains('hidden')) {
            swipeIndicator.classList.add('hidden');
        }
    }
    
    /**
     * Muestra el indicador de swipe
     */
    function showSwipeIndicator() {
        if (swipeIndicator) {
            swipeIndicator.classList.remove('hidden');
        }
    }
    
    /**
     * Resetea el estado cuando vuelve a portrait
     */
    function resetScrollState() {
        window.scrollTo(0, 0);
        showSwipeIndicator();
    }

    /**
     * Detecta la orientación actual del dispositivo
     */
    function getOrientation() {
        if (screen.orientation && screen.orientation.type) {
            return screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
        }
        
        if (typeof window.orientation !== 'undefined') {
            return (window.orientation === 0 || window.orientation === 180) ? 'portrait' : 'landscape';
        }
        
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    /**
     * ================================
     * VIEW ROUTER
     * ================================
     */
    function routeView() {
        const isMobile = isMobileDevice();
        
        if (isMobile) {
            showMobileView();
        } else {
            showDesktopView();
        }
    }

    /**
     * Muestra la vista móvil (portrait/landscape según orientación)
     */
    function showMobileView() {
        if (currentViewMode === 'mobile') return;
        currentViewMode = 'mobile';
        
        // Quitar clase de modo desktop del body
        document.body.classList.remove('is-desktop-mode');
        
        // Ocultar vista desktop
        if (desktopView) {
            desktopView.classList.add('hidden');
        }
        
        // Mostrar vistas móviles
        if (portraitView) {
            portraitView.style.display = '';
        }
        if (landscapeView) {
            landscapeView.style.display = '';
        }
        
        console.log('[BK Coupon] Mobile view activated');
    }

    /**
     * Muestra la vista desktop/tablet con mensaje
     */
    function showDesktopView() {
        if (currentViewMode === 'desktop') return;
        currentViewMode = 'desktop';
        
        // Agregar clase de modo desktop al body
        document.body.classList.add('is-desktop-mode');
        
        // Ocultar vistas móviles
        if (portraitView) {
            portraitView.style.display = 'none';
        }
        if (landscapeView) {
            landscapeView.style.display = 'none';
        }
        
        // Mostrar vista desktop
        if (desktopView) {
            desktopView.classList.remove('hidden');
        }
        
        // Re-inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        console.log('[BK Coupon] Desktop/Tablet view activated');
    }

    /**
     * Maneja el cambio de orientación (solo para móviles)
     */
    function handleOrientationChange() {
        if (isTransitioning || currentViewMode !== 'mobile') return;
        
        updateViewportHeight();
        
        setTimeout(() => {
            const newOrientation = getOrientation();
            
            if (newOrientation !== currentOrientation) {
                if (currentOrientation !== null) {
                    isTransitioning = true;
                    if (transitionOverlay) {
                        transitionOverlay.classList.add('visible');
                    }
                    
                    setTimeout(() => {
                        if (transitionOverlay) {
                            transitionOverlay.classList.remove('visible');
                        }
                        isTransitioning = false;
                        
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }, 300);
                }
                
                currentOrientation = newOrientation;
                updateViewportHeight();
                
                if (newOrientation === 'portrait') {
                    resetScrollState();
                }
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
        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
        }
        
        window.addEventListener('orientationchange', () => {
            setTimeout(handleOrientationChange, 100);
        });
        
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateViewportHeight();
                handleOrientationChange();
            }, 100);
        });
        
        const mediaQuery = window.matchMedia('(orientation: portrait)');
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleOrientationChange);
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', copyCouponCode);
        }
        
        window.addEventListener('scroll', () => {
            if (getOrientation() === 'landscape' && window.scrollY > 50) {
                hideSwipeIndicator();
            }
        }, { passive: true });
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
        
        // Routing inicial según dispositivo
        routeView();
        
        window.addEventListener('load', () => {
            updateViewportHeight();
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
