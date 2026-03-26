# Estructura y uso del backend

En los archivos *.routes.ts se definen rutas relativas al router, esto significa que luego se le agregara un prefijo (osea el api endpoint) en el archivo app.ts.

### Ejemplo:
En etiquetas.routes.ts
Se definen rutas relativas al router:

```typescript
POST "/"
GET "/"
GET "/:nombre"
DELETE "/:id"
```

Luego en app.ts se monta ese router con
```typescript
app.use("/api/etiquetas", etiquetaRoutes)
```
Resultados:
```typescript
POST /api/etiquetas
GET /api/etiquetas
GET /api/etiquetas/:nombre
DELETE /api/etiquetas/:id
```

