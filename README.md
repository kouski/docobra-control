# DocObra Control

Proyecto base en Vite + React + Firebase para gestionar documentación de obras.

## Arranque

1. Copia `.env.example` a `.env.local`
2. Rellena las claves de Firebase
3. Ejecuta:

```bash
npm install
npm run dev
```

## Funcionalidades

- Login con Firebase Auth
- Obras por empresa
- Checklist dinámico por obra
- Registro de entrega
- Fecha y medio de aportación
- Aprobación por cliente
- Subida de archivos a Firebase Storage
- Historial documental

## Colecciones esperadas

- `users/{uid}`
- `companies/{companyId}/projects/{projectId}`
- `companies/{companyId}/projects/{projectId}/documentTypes/{documentTypeId}`
- `companies/{companyId}/projects/{projectId}/submissions/{submissionId}`
