# Finanzas App — Guía de instalación

## 1. Instalar dependencias
```bash
npm install
```

## 2. Configurar variables de entorno
Copiá el archivo `.env.example` como `.env` y completá con tus credenciales de Firebase:
```bash
cp .env.example .env
```

## 3. Índices de Firestore (IMPORTANTE)
Algunos queries usan filtros combinados (`uid` + `orderBy`), lo que requiere índices compuestos en Firestore.

La primera vez que cargues datos, Firebase mostrará en la consola del navegador un **link directo** para crear cada índice. Hacé clic en el link y el índice se crea automáticamente en Firebase Console.

Los índices necesarios son:
- Colección `finances`: `uid` (asc) + `date` (desc)
- Colección `cards`: `uid` (asc) + `createdAt` (desc)
- Colección `loans`: `uid` (asc) + `createdAt` (desc)
- Colección `fixedExpenses`: `uid` (asc) + `createdAt` (desc)
- Colección `installments`: `uid` (asc) + `createdAt` (desc)

## 4. Levantar en desarrollo
```bash
npm run dev
```

## 5. Build para producción
```bash
npm run build
```

---

## Cambios realizados

### 🐛 Bugs corregidos
- **Seguridad crítica**: Todos los servicios ahora filtran datos por UID del usuario. Antes, todos los usuarios veían los datos de todos.
- **FinanceTable**: `window.location.reload()` reemplazado por callback `onReload` (más eficiente, sin parpadeo).
- **Dashboard**: Corregida referencia `item.description`→`item.entity` e `item.monthlyPayment`→`item.installmentAmount` para préstamos.
- **Sidebar**: Agregado `Gastos Fijos` al menú (estaba ausente — la sección era inaccesible).
- **loanService**: Filtrado movido de cliente a Firestore (más seguro y eficiente).
- **cardService**: Renombrado de `.jsx` a `.js`.
- **Cuotas.jsx**: Eliminados todos los `console.log()` de debug.
- **AuthContext**: Ahora expone `loading` en el contexto.

### 📱 Mobile-first
- **Bottom navigation bar**: Navegación rápida en celular (Dashboard, Finanzas, Cuotas, Préstamos, Menú).
- **Sidebar overlay**: En mobile, el sidebar se abre como panel lateral con animación.
- **FinanceTable**: Vista de cards en mobile en lugar de tabla.
- **Formularios**: Completamente adaptados a pantalla chica.
- **Hamburger menu**: Botón en el Navbar para abrir el sidebar en mobile.

### ✨ Mejoras
- **Toast notifications**: Sistema de notificaciones reemplaza los `window.alert()`.
- **formatCurrency**: Utilidad implementada y usada en todo el proyecto.
- **Fuente**: DM Sans (mejor legibilidad que Geist sin CDN externo).
- **Configuración**: Página completamente funcional (cambio de contraseña, exportar datos, perfil).
- **Tarjetas**: Diseño visual con gradientes por tipo de tarjeta.
- **Cuotas y Préstamos**: Barras de progreso de pago.
- **Login**: Diseño mejorado con toggle entre login y registro.
- **Exportar datos**: Función real en Configuración (JSON con todos los datos).
