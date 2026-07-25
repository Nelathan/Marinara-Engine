# Arquitectura de las extensiones personales

Las extensiones personales son código desactivado de forma predeterminada y aprobado por hash, con dos entornos de ejecución aislados. Los borradores de Professor Mari son la única clase de extensión disponible de forma predeterminada. Todas las demás fuentes son extensiones externas y requieren dos controles independientes del operador.

## Invariantes de seguridad

Mantén ciertas estas propiedades:

1. La creación y la importación siempre producen un borrador desactivado y sin aprobar.
2. La aprobación requiere el hash de contenido `sha256:` exacto y actual, y una confirmación explícita de código en el entorno aislado (sandbox).
3. Cualquier cambio ejecutable desactiva la extensión y borra `approvedHash`.
4. La reversión restaura un borrador desactivado.
5. La copia de seguridad y la importación de perfil borran la aprobación y el estado de activación.
6. Professor Mari puede crear y actualizar borradores, pero no tiene ninguna acción que los apruebe ni los active.
7. Toda fuente distinta de `professor_mari` es externa, incluidas `external`, `local`, `legacy`, `profile_import` y los valores desconocidos que se normalizan a `legacy`.
8. Los registros externos no aparecen en las respuestas de gestión ni de tiempo de ejecución a menos que `ENABLE_EXTERNAL_EXTENSIONS=true` y la aceptación persistida de la Danger Zone (Zona de peligro) también sea verdadera.
9. Cerrar cualquiera de los dos controles desactiva los registros externos guardados y detiene los procesos activos del servidor. El sondeo del entorno de ejecución del navegador elimina los procesos de trabajo activos del navegador.
10. El código del navegador nunca se ejecuta en el documento de Marinara. El código del servidor nunca se ejecuta en el proceso del servidor de Marinara.
11. No hay instalador por URL, catálogo remoto ni actualizador automático.
12. Las contribuciones al host son descriptores planos validados. El marcado, los estilos, las URLs, los componentes y los callbacks de la extensión nunca cruzan al árbol de React de Marinara.
13. El registro, la activación, los eventos, las actualizaciones y la eliminación de contribuciones permanecen ligados al hash de contenido aprobado y exacto de la extensión activada.

Los controles se aplican en las rutas y en los servicios de tiempo de ejecución. Ocultar controles no es un límite de seguridad. Un registro externo añadido manualmente, restaurado, heredado (legacy) o creado fuera de banda debe permanecer invisible e inejecutable mientras cualquiera de los dos controles esté cerrado.

## Almacenamiento y política

La tabla de archivos `installed_extensions` guarda metadatos, código ejecutable, `contentHash`, `approvedHash`, la fuente y hasta diez revisiones ejecutables anteriores. Los ajustes privados de la extensión usan claves de `app_settings` con el prefijo `extension-storage:`. La aceptación de la Danger Zone usa `external-extensions-enabled`.

El arranque ejecuta `preparePersonalExtensionTrust`. Una fila heredada sin hash se conserva, pero queda desactivada y sin aprobar. Una fila cuyo hash guardado ya no coincide con sus campos ejecutables también se desactiva y se vuelve a calcular su huella.

`personal-extension-policy.service.ts` combina el control en vivo de `.env` con la aceptación persistida del usuario. `personal-extension-storage.service.ts` puede desactivar todos los registros que no sean de Professor. El observador de `.env` vuelve a aplicar la política en aproximadamente dos segundos y pide al entorno de ejecución del servidor que detenga el código cuando el control se cierra.

## API

La superficie de gestión está bajo `/api/personal-extensions`:

- `GET /policy` devuelve el estado de ambos controles y la disponibilidad del sandbox del servidor.
- `PATCH /policy/external` cambia la aceptación de la Danger Zone y rechaza `true` a menos que el control de `.env` esté abierto.
- `GET /` lista los borradores de Professor más los borradores externos solo cuando ambos controles están abiertos.
- `POST /` importa una extensión externa y se rechaza a menos que ambos controles estén abiertos.
- `PATCH /:id` edita o desactiva un borrador.
- `POST /:id/approve` aprueba el hash exacto y actual, aplica el control externo y rechaza la aprobación del servidor sin un sandbox de sistema operativo compatible.
- `POST /:id/rollback` restaura una revisión anterior desactivada.
- `DELETE /:id` elimina la extensión y los ajustes privados.

Los metadatos aprobados del entorno de ejecución del navegador se leen desde `GET /runtime/client`. El documento ejecutable lo sirve `GET /:id/sandbox.html?hash=...` solo mientras el hash exacto esté activado, aprobado y permitido por la política.

## Entorno de ejecución del navegador

`PersonalExtensionInjector.tsx` crea un iframe oculto con `sandbox="allow-scripts"` y sin `allow-same-origin`. Por tanto, el iframe tiene un origen opaco y no puede acceder al DOM, las cookies, el almacenamiento ni las APIs del mismo origen de Marinara.

La respuesta del sandbox reemplaza la política normal de la página por una CSP estrecha: sin recursos predeterminados, sin conexiones, sin formularios, sin objetos y sin autoridad de navegación. El CSS de la extensión permanece dentro del iframe oculto. El JavaScript se ejecuta en un Worker dedicado creado por el arranque del iframe de confianza. Los globales de red y de workers anidados se eliminan como defensa en profundidad.

El worker recibe solo:

- registro con espacio de nombres;
- almacenamiento privado de la extensión intermediado por el padre;
- temporizadores gestionados;
- registro de limpieza;
- una ventana de iframe restringida a través de `marinara.ui.showWindow(...)`;
- ranuras de contribución del host de confianza a través de `marinara.ui.registerContribution(...)`.

`marinara.ui.showWindow({ title, elements, onEvent, onClose })` devuelve un identificador con `update({ title?, elements? })` y `close()`. El worker solo envía descriptores, y el arranque del iframe de confianza construye cada elemento con las APIs del DOM y `textContent` (nunca `innerHTML`). El host revela el iframe del sandbox, oculto en el resto de casos, solo mientras hay una ventana abierta, y lo vuelve a ocultar al cerrarla.

`marinara.ui.registerContribution({ id, kind, label, description?, icon?, elements?, onActivate?, onEvent? })` devuelve un identificador congelado con `update(patch)` y `remove()`. Admite tres ubicaciones fijas:

- `button`: una acción compacta en la barra superior en pantallas grandes y una acción en el menú Extensions (Extensiones) en todas partes;
- `menu-item`: una acción en el menú Extensions;
- `panel`: una entrada que abre el panel lateral de confianza Extensions de Marinara.

Los elementos del panel usan el mismo vocabulario declarativo que las ventanas restringidas: `heading`, `text`, `pre`, `button`, `input`, `select`, `toggle`, `slider`, `color` y `spacer`. Los controles interactivos requieren IDs únicos. Un botón de panel envía `{ contributionId, elementId, values }` a `onEvent`; `values` contiene el valor de cadena actual de cada control. `onActivate` se ejecuta dentro del Worker de la extensión cuando el usuario abre o invoca la contribución. La extensión puede llamar a `handle.update(...)` para reemplazar su etiqueta, descripción, icono o elementos del panel después de cambios de estado.

El cliente valida de forma independiente cada descriptor antes de añadirlo al almacén del entorno de ejecución. Las clases de contribución, los iconos, los controles, los IDs, las listas de opciones, las longitudes de texto, el texto total del panel, el número de elementos y el número de contribuciones por extensión están en lista de permitidos y limitados por un tope. React renderiza el texto de la extensión como texto. No se acepta ningún HTML, CSS, URL, componente de React ni callback del host controlado por la extensión. El host elimina todas las contribuciones cuando el worker se detiene, cuando su hash cambia o cuando desaparece de la respuesta del entorno de ejecución aprobado. Los eventos se envían solo al worker registrado para el mismo ID de extensión y el mismo hash de contenido.

No hay ayudante del DOM, ni acceso a la API de Marinara, ni acceso a eventos del padre, ni capacidad de red arbitraria. El iframe valida y limita la tasa de los mensajes. Un vigilante de latidos (heartbeat) termina un worker que no responde o que está en un bucle ocupado.

## Compatibilidad de extensiones complejas

El protocolo de contribuciones está pensado para admitir herramientas reales cargadas de ajustes y flujos de trabajo de varios pasos, no solo botones decorativos. Una extensión compleja puede reemplazar progresivamente los elementos de un panel y mantener su propio estado en el almacenamiento privado de la extensión.

Los paquetes heredados existentes que inyectan botones con selectores del host, recorren los internos de React, escriben superposiciones arbitrarias o llaman a rutas `/api` del mismo origen no funcionan sin cambios en el entorno de ejecución seguro. Pórtalos reemplazando su interfaz por descriptores de contribución. La funcionalidad que necesita datos de la aplicación Marinara o efectos visuales a nivel de escena debe usar una capacidad de intermediación separada, de alcance estrecho y aprobada por el usuario cuando exista; nunca restaures el DOM sin procesar ni la autoridad de API sin restricciones como atajo de compatibilidad.

## Entorno de ejecución del servidor

El código fuente del servidor se ejecuta en un proceso de Node separado, nunca a través de una importación dentro del mismo proceso. El modelo de permisos de Node deniega las capacidades de sistema de archivos, red, proceso hijo, worker, complemento nativo, WASI e inspector. El proceso hijo también se ejecuta dentro de:

- macOS Seatbelt; o
- Linux Bubblewrap con espacios de nombres separados de PID, red, IPC y montaje.

El sandbox recibe un entorno mínimo, un heap de V8 pequeño, ningún archivo de la aplicación, ningún secreto del servidor y archivos de protocolo delimitados por líneas y acotados dentro de su directorio temporal privado. Recibe solo registro, almacenamiento privado de la extensión, temporizadores gestionados y registro de limpieza. Las cuotas de mensajes y un archivo de latidos separado contienen la inundación del protocolo y los bucles ocupados.

Los permisos de Node y `node:vm` son capas de defensa en profundidad, no el límite de seguridad. El sandbox de sistema operativo separado es obligatorio. Windows, Android, Linux sin `bwrap` y cualquier otra plataforma no compatible se niegan a activar las extensiones de servidor.

## Validación

Ejecuta:

```bash
pnpm check
pnpm regression:extensions-security
pnpm regression:professor-mari-shell-sandbox
pnpm smoke:ui
```

La regresión de seguridad debe demostrar el control de dos pasos, la invalidación por hash exacto, la forma del worker de origen opaco, la validación y limpieza de las contribuciones del host, la eliminación de la inyección del mismo origen, la depuración del entorno, la denegación de sistema de archivos y red, el almacenamiento privado y la disponibilidad del sandbox que falla en estado cerrado (fail-closed).
