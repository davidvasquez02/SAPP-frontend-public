# SAPP Frontend Public (Flujo Aspirante)

Frontend público del sistema SAPP enfocado en el **flujo completo de aspirante**: validación de ingreso, consulta/cargue de documentos y registro de información de investigación.

## Propósito y alcance

Este proyecto (`SAPP-frontend-public/`) ahora implementa como pantalla inicial:

1. **Login de aspirante** por número de inscripción + tipo/número de documento.
2. **Carga de documentos** del checklist de admisiones.
3. **Actualización de información de investigación** (grupo y director).
4. **Cambio de estado de inscripción** a `POR_VAL` cuando el checklist obligatorio queda completo.

> Alcance actual: solo flujo aspirante (sin módulos administrativos internos).

## Arquitectura breve

- **UI**: React + TypeScript.
- **Estado de sesión**: `AuthProvider` + `localStorage` (`SAPP_AUTH_SESSION`).
- **HTTP**: wrapper `fetch` en `src/shared/http/httpClient.ts` con `VITE_API_URL`.
- **Pantalla inicial**: `AspiranteLoginPage`.
- **Pantalla autenticada**: `AspiranteLayout` + `AspiranteDocumentosPage`.

## Stack y versiones (lockfile)

- Node.js: recomendado `>=18`
- React: `19.2.5`
- React DOM: `19.2.5`
- Vite: `8.0.8`
- TypeScript: `6.0.3`
- ESLint: `9.39.4`
- `@vitejs/plugin-react`: `6.0.1`

## Ejecución local

```bash
cd SAPP-frontend-public
npm install
npm run dev
```

### Build

```bash
npm run build
```

## Despliegue y rutas SPA

El contenedor incluye una regla explícita de fallback para las invitaciones
`/evaluacion/{token}`. Estas URL deben llegar al contenedor del frontend: Nginx
entrega `index.html` y React interpreta el token y el parámetro `accion`.

Si existe un ingress, proxy reverso o gateway delante del contenedor, se debe
enrutar `/evaluacion` y `/evaluacion/*` al servicio **frontend**. Solamente las
rutas bajo `/api/sapp/*` deben dirigirse al backend. Enviar `/evaluacion/*` al
backend produce una respuesta de recurso estático inexistente antes de que la
aplicación React pueda iniciar.

## Variables de entorno

Crear `.env` o `.env.local` en `SAPP-frontend-public/`:

```env
VITE_API_URL=http://localhost:8080/api/sapp
```

Comportamiento por defecto sin variables:

- Local (`npm run dev`): llama a `http://localhost:8080/api/sapp`.
- Build dev/prod: llama a la ruta relativa del servidor `/api/sapp`.

Para probar local usando la misma ruta relativa de dev/prod:

```env
VITE_API_URL=/api/sapp
VITE_DEV_PROXY_TARGET=http://localhost:8080
VITE_EVALUATION_API_PATH=/evaluacionJurado
```

El proxy de Vite reenvía `/api/sapp/*` al backend local. El cliente normaliza paths heredados como `/sapp/aspirante/consultaInfo` para evitar duplicar el prefijo.

`VITE_EVALUATION_API_PATH` define el recurso del backend usado por el portal de
jurados. Su valor predeterminado es `/evaluacionJurado`, por lo que abrir la ruta
SPA `/evaluacion/{token}` consulta
`/api/sapp/evaluacionJurado/{token}` y no confunde la ruta pública del navegador
con el recurso REST. También se aplica a las operaciones `aceptar`, `declinar`,
`documento` y `evaluacion` del mismo recurso.

`VITE_API_BASE_URL` se mantiene como fallback de compatibilidad para `.env` antiguos.

## Seeds / datos iniciales

No hay seeds en este frontend. Depende de endpoints disponibles en backend SAPP con datos de aspirantes, checklist y catálogo de documentos/tipos.

## Changelog-lite (decisiones recientes)

- Se reemplazó el template base de Vite por una app enfocada en aspirantes.
- La pantalla de inicio ahora es el login de aspirante.
- Se portó la lógica de:
  - autenticación de aspirante,
  - checklist y cargue de documentos,
  - cálculo de completitud de obligatorios,
  - actualización de investigación,
  - transición de estado de inscripción al completar checklist.
- Se dejó el proyecto original (`/src` raíz del repo) sin cambios funcionales para este flujo.
