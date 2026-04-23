# Plan de Integración con Sanity CMS

## Contexto

Este proyecto (`BKhotdog`) es una experiencia promocional mobile-first para la campaña **Whopper Dog** de Burger King Puerto Rico.

El cliente usa el CMS de RBI en Sanity Studio (staging):
`https://staging-bk-pr-cms.rbi.tools`

Documento target en Sanity:
- **Tipo:** `staticPage`
- **ID:** `e27a6c4f-6646-4a7c-9cd2-dd691d35b3d3`
- **Sección:** `marketingContent > staticPages`

---

## Objetivo

Conectar esta experiencia al Sanity de RBI para que el contenido (imágenes, texto, código de cupón) sea editable desde el CMS, sin necesidad de tocar código.

---

## Paso 1 — Obtener credenciales del proyecto Sanity

**Responsable:** Cliente / equipo de RBI

Necesitamos los siguientes datos:

| Dato | Dónde encontrarlo |
|------|-------------------|
| `projectId` | Sanity Studio > Manage > API Settings |
| `dataset` | Probablemente `staging` o `production` |
| `token de lectura` | Sanity Studio > Manage > API > Tokens (si el dataset es privado) |

> El `projectId` también se puede ver en el código fuente del Studio: abrir `https://staging-bk-pr-cms.rbi.tools` en el browser, F12 > Sources y buscar `projectId`.

---

## Paso 2 — Explorar el schema del `staticPage`

Con el `projectId` y `dataset` en mano, hacer esta consulta para ver todos los campos del documento:

```
GET https://{projectId}.api.sanity.io/v2021-10-21/data/query/{dataset}?query=*[_id == "e27a6c4f-6646-4a7c-9cd2-dd691d35b3d3"][0]
```

Esto devuelve el JSON completo del documento. Necesitamos identificar:

- [ ] Campo para la imagen de la hamburguesa
- [ ] Campo para el texto/imagen de portrait (`TEXTO_01.png`)
- [ ] Campo para el texto/imagen de landscape/cupón (`TEXTO_02.png`)
- [ ] Campo para el código del cupón (`BKWHOPPERDOG`)
- [ ] Si hay un campo de tipo URL o embed para apuntar a esta experiencia

---

## Paso 3 — Decidir la estrategia de integración

Hay dos opciones según lo que permita el schema de RBI:

### Opción A — Esta página deployada como iframe (recomendada)
El campo `staticPage` apunta a la URL de Vercel donde está deployada esta experiencia. RBI la embebe como `<iframe>` en su app.

**Ventaja:** Mínimo cambio en el código, la experiencia queda aislada.

### Opción B — Contenido dinámico desde Sanity
Los textos e imágenes se cargan desde Sanity mediante `fetch()` al iniciar la página.

**Ventaja:** El equipo de contenido puede actualizar imágenes y texto desde el CMS sin tocar código.

---

## Paso 4 — Modificar el código (si se elige Opción B)

### 4a. Eliminar la vista de desktop

En `script.js`, cambiar la función `routeView()` para que **siempre muestre la experiencia móvil**:

```javascript
// ANTES
function routeView() {
    const isMobile = isMobileDevice();
    if (isMobile) {
        showMobileView();
    } else {
        showDesktopView();
    }
    hideInitialLoader();
}

// DESPUÉS
function routeView() {
    showMobileView();
    hideInitialLoader();
}
```

### 4b. Agregar fetch de contenido desde Sanity

Agregar al inicio de `script.js`:

```javascript
const SANITY_PROJECT_ID = 'REEMPLAZAR_CON_PROJECT_ID';
const SANITY_DATASET = 'staging'; // o 'production'
const SANITY_DOC_ID = 'e27a6c4f-6646-4a7c-9cd2-dd691d35b3d3';

async function fetchSanityContent() {
    const query = encodeURIComponent(`*[_id == "${SANITY_DOC_ID}"][0]`);
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${query}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.result;
    } catch (err) {
        console.error('[BK] Error fetching Sanity content:', err);
        return null;
    }
}
```

### 4c. Aplicar contenido al DOM

Una vez que sabemos los nombres de los campos (Paso 2), mapearlos así:

```javascript
async function applyContent(content) {
    if (!content) return;

    // Ejemplo — ajustar según los campos reales del schema
    // if (content.couponCode) {
    //   COUPON_CODE = content.couponCode;
    // }
    // if (content.burgerImage) {
    //   document.querySelector('.burger-image').src = buildImageUrl(content.burgerImage);
    // }
}

// Función helper para construir URLs de imágenes de Sanity
function buildImageUrl(imageField) {
    const ref = imageField.asset._ref;
    const [, id, dimensions, format] = ref.split('-');
    return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`;
}
```

---

## Paso 5 — Configurar CORS en Sanity

Si el dataset es privado (probable en staging de RBI), se necesita una de estas dos cosas:

- **Token de lectura** — solicitarlo al equipo de RBI (solo lectura, no escritura)
- **Allowlist de origen** — que el equipo de RBI agregue el dominio de Vercel en `Sanity > Manage > API > CORS Origins`

---

## Paso 6 — Deploy y QA

1. Hacer deploy en Vercel del branch `sanity`
2. Probar en dispositivo móvil real (iOS y Android)
3. Probar que el contenido de Sanity se carga correctamente
4. Si es Opción A: entregar la URL al equipo de RBI para que la configuren en el campo `staticPage`
5. Si es Opción B: verificar que los cambios en Sanity se reflejen en la página

---

## Checklist de bloqueos actuales

- [ ] `projectId` de Sanity — pendiente del cliente
- [ ] `dataset` — pendiente del cliente
- [ ] Token de lectura (si el dataset es privado) — pendiente del cliente
- [ ] Schema del `staticPage` — pendiente de explorar con las credenciales
- [ ] Estrategia de integración (Opción A o B) — pendiente de definir con el cliente
