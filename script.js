/**
 * Mobile Coupon Reveal Experience
 * Muestra un cupón al girar el teléfono a posición horizontal
 * Con truco de scroll para ocultar barras en Safari iOS
 */

/**
 * ================================
 * MÓDULO: DeviceDetector
 * Detecta tipo de dispositivo, OS, navegador y versión
 * ================================
 */
const DeviceDetector = (function() {
    'use strict';
    
    const ua = navigator.userAgent;
    
    // Versiones mínimas soportadas (Feb 2026)
    const MIN_VERSIONS = {
        safari_ios: { min: 14, recommended: 17, current: 18 },
        safari_macos: { min: 14, recommended: 17, current: 18 },
        chrome: { min: 100, recommended: 120, current: 130 },
        firefox: { min: 100, recommended: 120, current: 130 },
        samsung: { min: 20, recommended: 24, current: 25 },
        edge: { min: 100, recommended: 120, current: 130 }
    };
    
    /**
     * Detecta el sistema operativo y su versión
     */
    function getOS() {
        let name = 'Unknown';
        let version = '';
        let versionNum = 0;
        
        // iOS
        if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
            name = 'iOS';
            const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
            if (match) {
                version = `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}`;
                versionNum = parseFloat(`${match[1]}.${match[2]}`);
            }
        }
        // Android
        else if (/Android/.test(ua)) {
            name = 'Android';
            const match = ua.match(/Android (\d+\.?\d*)/);
            if (match) {
                version = match[1];
                versionNum = parseFloat(match[1]);
            }
        }
        // Windows
        else if (/Windows/.test(ua)) {
            name = 'Windows';
            if (/Windows NT 10/.test(ua)) {
                version = '10/11';
                versionNum = 10;
            } else if (/Windows NT 6.3/.test(ua)) {
                version = '8.1';
                versionNum = 8.1;
            } else if (/Windows NT 6.2/.test(ua)) {
                version = '8';
                versionNum = 8;
            }
        }
        // macOS
        else if (/Mac OS X/.test(ua)) {
            name = 'macOS';
            const match = ua.match(/Mac OS X (\d+)[_.](\d+)/);
            if (match) {
                version = `${match[1]}.${match[2]}`;
                versionNum = parseFloat(`${match[1]}.${match[2]}`);
            }
        }
        // Linux
        else if (/Linux/.test(ua)) {
            name = 'Linux';
            version = '';
            versionNum = 0;
        }
        
        return { name, version, versionNum };
    }
    
    /**
     * Detecta el navegador y su versión
     */
    function getBrowser() {
        let name = 'Unknown';
        let version = '';
        let versionNum = 0;
        let engine = 'Unknown';
        
        // Samsung Internet (debe ir antes de Chrome porque también tiene "Chrome" en el UA)
        if (/SamsungBrowser/.test(ua)) {
            name = 'Samsung Internet';
            const match = ua.match(/SamsungBrowser\/(\d+\.?\d*)/);
            if (match) {
                version = match[1];
                versionNum = parseFloat(match[1]);
            }
            engine = 'Blink';
        }
        // Edge (nuevo, basado en Chromium)
        else if (/Edg\//.test(ua)) {
            name = 'Edge';
            const match = ua.match(/Edg\/(\d+\.?\d*)/);
            if (match) {
                version = match[1];
                versionNum = parseFloat(match[1]);
            }
            engine = 'Blink';
        }
        // Opera
        else if (/OPR\//.test(ua) || /Opera/.test(ua)) {
            name = 'Opera';
            const match = ua.match(/(?:OPR|Opera)\/(\d+\.?\d*)/);
            if (match) {
                version = match[1];
                versionNum = parseFloat(match[1]);
            }
            engine = 'Blink';
        }
        // Firefox
        else if (/Firefox/.test(ua)) {
            name = 'Firefox';
            const match = ua.match(/Firefox\/(\d+\.?\d*)/);
            if (match) {
                version = match[1];
                versionNum = parseFloat(match[1]);
            }
            engine = 'Gecko';
        }
        // Safari (debe ir antes de Chrome porque Chrome también tiene "Safari" en el UA)
        else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
            name = 'Safari';
            const match = ua.match(/Version\/(\d+\.?\d*)/);
            if (match) {
                version = match[1];
                versionNum = parseFloat(match[1]);
            }
            engine = 'WebKit';
        }
        // Chrome
        else if (/Chrome/.test(ua)) {
            name = 'Chrome';
            const match = ua.match(/Chrome\/(\d+\.?\d*)/);
            if (match) {
                version = match[1];
                versionNum = parseFloat(match[1]);
            }
            engine = 'Blink';
        }
        
        return { name, version, versionNum, engine };
    }
    
    /**
     * Detecta el tipo de dispositivo
     */
    function getDeviceType() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const minDimension = Math.min(width, height);
        const maxDimension = Math.max(width, height);
        
        // Detectar iPad específicamente
        const isIPad = /iPad/.test(ua) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Detectar tablets Android
        const isAndroidTablet = /Android/.test(ua) && !/Mobile/.test(ua);
        
        // Es tablet si es iPad, Android tablet, o tiene dimensiones de tablet
        if (isIPad || isAndroidTablet) {
            return 'tablet';
        }
        
        // Móvil: tiene touch y dimensiones pequeñas
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isMobileUA = /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        
        if (isMobileUA || (hasTouchScreen && minDimension <= 480)) {
            return 'mobile';
        }
        
        // Desktop por defecto si las dimensiones son grandes
        if (minDimension > 768 || maxDimension > 1024) {
            return 'desktop';
        }
        
        // Tablet si está entre móvil y desktop
        if (minDimension > 480 && minDimension <= 768) {
            return 'tablet';
        }
        
        return 'desktop';
    }
    
    /**
     * Obtiene el nombre aproximado del dispositivo
     */
    function getDeviceName() {
        const os = getOS();
        const type = getDeviceType();
        const width = window.screen.width;
        const height = window.screen.height;
        const dpr = window.devicePixelRatio || 1;
        
        if (os.name === 'iOS') {
            // Detectar modelo de iPhone aproximado basado en dimensiones
            const screenHeight = Math.max(width, height);
            if (type === 'tablet') return 'iPad';
            if (screenHeight >= 932) return 'iPhone Pro Max';
            if (screenHeight >= 896) return 'iPhone Plus/Pro Max';
            if (screenHeight >= 844) return 'iPhone Pro';
            if (screenHeight >= 812) return 'iPhone';
            if (screenHeight >= 736) return 'iPhone Plus';
            if (screenHeight >= 667) return 'iPhone';
            return 'iPhone SE/Mini';
        }
        
        if (os.name === 'Android') {
            // Intentar obtener modelo del User Agent
            const match = ua.match(/;\s*([^;)]+)\s*Build\//);
            if (match && match[1]) {
                const model = match[1].trim();
                // Limpiar nombres comunes
                if (model.includes('SM-')) return 'Samsung Galaxy';
                if (model.includes('Pixel')) return model;
                if (model.includes('Redmi') || model.includes('Mi ')) return 'Xiaomi';
                if (model.includes('HUAWEI') || model.includes('Honor')) return 'Huawei';
                return model.substring(0, 20); // Limitar longitud
            }
            return type === 'tablet' ? 'Android Tablet' : 'Android';
        }
        
        if (os.name === 'macOS') {
            return 'Mac';
        }
        
        if (os.name === 'Windows') {
            return 'Windows PC';
        }
        
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
    
    /**
     * Verifica compatibilidad del navegador
     * @returns {object} { compatible: boolean, status: 'current'|'outdated'|'obsolete', message: string }
     */
    function checkCompatibility() {
        const browser = getBrowser();
        const os = getOS();
        let minVersions = null;
        let browserKey = '';
        
        // Determinar qué versiones mínimas usar
        if (browser.name === 'Safari') {
            browserKey = os.name === 'iOS' ? 'safari_ios' : 'safari_macos';
            minVersions = MIN_VERSIONS[browserKey];
        } else if (browser.name === 'Chrome') {
            browserKey = 'chrome';
            minVersions = MIN_VERSIONS.chrome;
        } else if (browser.name === 'Firefox') {
            browserKey = 'firefox';
            minVersions = MIN_VERSIONS.firefox;
        } else if (browser.name === 'Samsung Internet') {
            browserKey = 'samsung';
            minVersions = MIN_VERSIONS.samsung;
        } else if (browser.name === 'Edge') {
            browserKey = 'edge';
            minVersions = MIN_VERSIONS.edge;
        }
        
        // Si no tenemos info del navegador, asumir compatible
        if (!minVersions || browser.versionNum === 0) {
            return {
                compatible: true,
                status: 'unknown',
                message: ''
            };
        }
        
        const version = browser.versionNum;
        
        // Obsoleto: muy antiguo, puede fallar
        if (version < minVersions.min) {
            return {
                compatible: false,
                status: 'obsolete',
                message: `${browser.name} ${browser.version} es muy antiguo. Actualiza para continuar.`
            };
        }
        
        // Desactualizado: funciona pero recomendamos actualizar
        if (version < minVersions.recommended) {
            return {
                compatible: true,
                status: 'outdated',
                message: `${browser.name} ${browser.version} - Recomendamos actualizar`
            };
        }
        
        // Actualizado
        return {
            compatible: true,
            status: 'current',
            message: ''
        };
    }
    
    /**
     * Obtiene información completa del dispositivo
     */
    function getFullInfo() {
        const os = getOS();
        const browser = getBrowser();
        const deviceType = getDeviceType();
        const deviceName = getDeviceName();
        const compatibility = checkCompatibility();
        
        return {
            device: {
                type: deviceType,
                name: deviceName
            },
            os: os,
            browser: browser,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight,
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                dpr: window.devicePixelRatio || 1
            },
            compatibility: compatibility
        };
    }
    
    /**
     * Obtiene info formateada para mostrar al usuario
     */
    function getDeviceInfoFormatted() {
        const info = getFullInfo();
        return {
            deviceLine: info.device.name,
            osLine: `${info.os.name}${info.os.version ? ' ' + info.os.version : ''}`,
            browserLine: `${info.browser.name}${info.browser.version ? ' ' + info.browser.version : ''}`
        };
    }
    
    /**
     * Log de debug en consola
     */
    function logDebug() {
        const info = getFullInfo();
        console.log('%c[DeviceDetector]', 'color: #FF6B00; font-weight: bold;', info);
        return info;
    }
    
    // API pública
    return {
        getOS,
        getBrowser,
        getDeviceType,
        getDeviceName,
        checkCompatibility,
        getFullInfo,
        getDeviceInfoFormatted,
        logDebug,
        MIN_VERSIONS
    };
})();

// Exponer globalmente para debug
window.DeviceDetector = DeviceDetector;

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
    
    // Elementos nuevos para desktop/tablet y advertencias
    const desktopView = document.getElementById('desktopView');
    const portraitView = document.querySelector('.portrait-view');
    const landscapeView = document.querySelector('.landscape-view');
    const browserWarning = document.getElementById('browserWarning');
    const browserObsoleteModal = document.getElementById('browserObsoleteModal');
    const dismissWarningBtn = document.getElementById('dismissWarning');
    const qrContainer = document.getElementById('qrContainer');
    
    // Elementos de info de dispositivo
    const browserVersionInfo = document.getElementById('browserVersionInfo');
    const obsoleteBrowserName = document.getElementById('obsoleteBrowserName');
    const detectedDevice = document.getElementById('detectedDevice');
    const detectedOS = document.getElementById('detectedOS');
    const detectedBrowser = document.getElementById('detectedBrowser');

    // Estado actual
    let currentOrientation = null;
    let isTransitioning = false;
    let currentViewMode = null; // 'mobile' | 'desktop'
    let qrGenerated = false;

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
     * ================================
     * GENERACIÓN DE QR
     * ================================
     */
    function generateQR() {
        if (qrGenerated || !qrContainer) return;
        
        // Verificar que QRCode esté disponible
        if (typeof QRCode === 'undefined') {
            console.warn('[BK Coupon] QRCode library not loaded');
            // Mostrar un placeholder o mensaje
            qrContainer.innerHTML = '<p style="color: #512314; font-size: 0.9rem; padding: 20px;">QR no disponible</p>';
            return;
        }
        
        // Limpiar contenedor
        qrContainer.innerHTML = '';
        
        // Generar QR con la URL actual
        const currentURL = window.location.href;
        
        try {
            new QRCode(qrContainer, {
                text: currentURL,
                width: 200,
                height: 200,
                colorDark: '#512314',  // BK brown
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });
            qrGenerated = true;
            console.log('[BK Coupon] QR generated for:', currentURL);
        } catch (err) {
            console.error('[BK Coupon] Error generating QR:', err);
            qrContainer.innerHTML = '<p style="color: #512314; font-size: 0.9rem; padding: 20px;">Error al generar QR</p>';
        }
    }

    /**
     * ================================
     * ACTUALIZAR INFO DE DISPOSITIVO
     * ================================
     */
    function updateDeviceInfo() {
        const info = DeviceDetector.getDeviceInfoFormatted();
        
        if (detectedDevice) {
            detectedDevice.textContent = info.deviceLine;
        }
        if (detectedOS) {
            detectedOS.textContent = info.osLine;
        }
        if (detectedBrowser) {
            detectedBrowser.textContent = info.browserLine;
        }
    }

    /**
     * ================================
     * VIEW ROUTER
     * Decide qué vista mostrar según el dispositivo
     * ================================
     */
    function routeView() {
        const deviceType = DeviceDetector.getDeviceType();
        const compatibility = DeviceDetector.checkCompatibility();
        
        // Log para debug
        DeviceDetector.logDebug();
        
        // Primero verificar compatibilidad del navegador
        handleBrowserCompatibility(compatibility);
        
        // Si el navegador es obsoleto, no continuar
        if (!compatibility.compatible) {
            return;
        }
        
        // Decidir vista según tipo de dispositivo
        if (deviceType === 'mobile') {
            showMobileView();
        } else {
            // Tablet o Desktop -> mostrar QR
            showDesktopView();
        }
    }

    /**
     * Maneja la compatibilidad del navegador
     */
    function handleBrowserCompatibility(compatibility) {
        // Navegador obsoleto -> modal bloqueante
        if (!compatibility.compatible && compatibility.status === 'obsolete') {
            if (browserObsoleteModal) {
                browserObsoleteModal.classList.remove('hidden');
            }
            if (obsoleteBrowserName) {
                const browser = DeviceDetector.getBrowser();
                obsoleteBrowserName.textContent = `${browser.name} ${browser.version}`;
            }
            return;
        }
        
        // Navegador desactualizado -> banner de advertencia
        if (compatibility.status === 'outdated') {
            if (browserWarning) {
                browserWarning.classList.remove('hidden');
            }
            if (browserVersionInfo) {
                browserVersionInfo.textContent = compatibility.message;
            }
        }
    }

    /**
     * Muestra la vista móvil (portrait/landscape según orientación)
     */
    function showMobileView() {
        if (currentViewMode === 'mobile') return;
        currentViewMode = 'mobile';
        
        // Ocultar vista desktop
        if (desktopView) {
            desktopView.classList.add('hidden');
        }
        
        // Las vistas portrait/landscape se manejan por CSS media queries
        // Solo necesitamos asegurarnos de que no estén ocultas por JS
        if (portraitView) {
            portraitView.style.display = '';
        }
        if (landscapeView) {
            landscapeView.style.display = '';
        }
        
        console.log('[BK Coupon] Mobile view activated');
    }

    /**
     * Muestra la vista desktop/tablet con QR
     */
    function showDesktopView() {
        if (currentViewMode === 'desktop') return;
        currentViewMode = 'desktop';
        
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
        
        // Actualizar info del dispositivo
        updateDeviceInfo();
        
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
                
                // Resetear estado cuando vuelve a portrait
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
        // Screen Orientation API
        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
        }
        
        // Evento orientationchange (legacy)
        window.addEventListener('orientationchange', () => {
            setTimeout(handleOrientationChange, 100);
        });
        
        // Resize - también re-evaluar tipo de dispositivo
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateViewportHeight();
                
                // Re-evaluar si cambió el tipo de dispositivo
                const newDeviceType = DeviceDetector.getDeviceType();
                if ((newDeviceType === 'mobile' && currentViewMode !== 'mobile') ||
                    (newDeviceType !== 'mobile' && currentViewMode !== 'desktop')) {
                    routeView();
                } else {
                    handleOrientationChange();
                }
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
        
        // Ocultar indicador cuando el usuario hace scroll manualmente
        window.addEventListener('scroll', () => {
            if (getOrientation() === 'landscape' && window.scrollY > 50) {
                hideSwipeIndicator();
            }
        }, { passive: true });
        
        // Dismiss browser warning
        if (dismissWarningBtn) {
            dismissWarningBtn.addEventListener('click', () => {
                if (browserWarning) {
                    browserWarning.classList.add('hidden');
                }
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
        
        // Actualizar viewport cuando cambia
        window.addEventListener('load', () => {
            updateViewportHeight();
            
            // Re-inicializar iconos (para la flecha de swipe)
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
