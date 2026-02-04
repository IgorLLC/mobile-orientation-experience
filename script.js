/**
 * BK Whopper Dog - Mobile Experience
 * Muestra el Whopper Dog al girar el teléfono a posición horizontal
 * Con mensaje para desktop/tablet indicando que es solo para móviles
 */

/**
 * ================================
 * DETECCIÓN DE DISPOSITIVO (SIMPLE)
 * ================================
 */
function isMobileDevice() {
    const ua = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const maxScreen = Math.max(screenWidth, screenHeight);
    
    // 1. Detectar iPhone/iPod explícitamente (siempre móvil)
    if (/iPhone|iPod/i.test(ua)) {
        console.log('[BK Whopper Dog] Detected: iPhone/iPod');
        return true;
    }
    
    // 2. Detectar Android Mobile (no tablets)
    if (/Android.*Mobile/i.test(ua)) {
        console.log('[BK Whopper Dog] Detected: Android Mobile');
        return true;
    }
    
    // 3. Detectar iPad - es móvil para esta experiencia
    if (/iPad/i.test(ua)) {
        console.log('[BK Whopper Dog] Detected: iPad');
        return true;
    }
    
    // 4. Detectar iPadOS (se hace pasar por Mac pero tiene touch y pantalla pequeña)
    // iPads tienen max 1366px, MacBooks tienen más
    if (navigator.platform === 'MacIntel' && 
        navigator.maxTouchPoints > 1 && 
        maxScreen <= 1366) {
        console.log('[BK Whopper Dog] Detected: iPadOS (Mac disguise)');
        return true;
    }
    
    // 5. Todo lo demás es desktop
    console.log('[BK Whopper Dog] Detected: Desktop');
    console.log('[BK Whopper Dog] UA:', ua);
    console.log('[BK Whopper Dog] Screen:', screenWidth, 'x', screenHeight);
    return false;
}

/**
 * Genera el código QR (solo una vez)
 */
let qrGenerated = false;

function generateQR() {
    // Evitar generar múltiples veces
    if (qrGenerated) {
        console.log('[BK Whopper Dog] QR already generated');
        return;
    }
    
    const qrContainer = document.getElementById('qrContainer');
    if (!qrContainer) return;
    
    // Verificar que QRCode esté disponible
    if (typeof QRCode === 'undefined') {
        console.warn('[BK Whopper Dog] QRCode library not loaded');
        qrContainer.innerHTML = '<p style="color:#E4002B;padding:20px;">QR no disponible</p>';
        return;
    }
    
    // Limpiar contenedor
    qrContainer.innerHTML = '';
    
    // Generar QR con la URL actual
    const currentURL = window.location.href;
    
    try {
        new QRCode(qrContainer, {
            text: currentURL,
            width: 180,
            height: 180,
            colorDark: '#E4002B',
            colorLight: '#F5F0E1',
            correctLevel: QRCode.CorrectLevel.M
        });
        qrGenerated = true;
        console.log('[BK Whopper Dog] QR generated for:', currentURL);
    } catch (err) {
        console.error('[BK Whopper Dog] Error generating QR:', err);
        qrContainer.innerHTML = '<p style="color:#E4002B;padding:20px;">Error QR</p>';
    }
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
    const couponElement = document.getElementById('couponElement');
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
     * Oculta el loader inicial
     */
    function hideInitialLoader() {
        const loader = document.getElementById('initialLoader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.remove();
            }, 300);
        }
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
        
        // Ocultar loader después de detectar dispositivo
        hideInitialLoader();
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
        
        console.log('[BK Whopper Dog] Mobile view activated');
    }

    /**
     * Muestra la vista desktop/tablet con QR
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
        
        // Generar QR
        generateQR();
        
        // Re-inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        console.log('[BK Whopper Dog] Desktop/Tablet view activated');
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
            }
        }, 50);
    }

    /**
     * Copia el código del cupón BKWHOPPERDOG
     */
    function copyCouponCode() {
        const code = 'BKWHOPPERDOG';
        
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
        // Agregar clase de animación a la imagen
        if (couponElement) {
            couponElement.classList.add('copied');
            setTimeout(() => {
                couponElement.classList.remove('copied');
            }, 300);
        }
        
        // Mostrar toast de confirmación
        showToast('Codigo copiado: BKWHOPPERDOG');
    }

    /**
     * Muestra un toast de notificación
     */
    function showToast(message) {
        // Remover toast existente si hay uno
        const existingToast = document.querySelector('.copy-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Crear nuevo toast
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Mostrar con animación
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);
        
        // Ocultar después de 2 segundos
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                toast.remove();
            }, 300);
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
        
        // Click en la imagen del cupón para copiar el código
        if (couponElement) {
            couponElement.addEventListener('click', copyCouponCode);
            couponElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                copyCouponCode();
            });
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
