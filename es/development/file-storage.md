# Almacenamiento nativo en archivos

Esta guía describe la arquitectura de persistencia local de Marinara Engine. Para ver la organización de carpetas de cara al usuario, consulta [Dónde se guardan tus datos](../data/where-data-is-stored.md).

## Fuente de verdad

Marinara guarda las filas de la aplicación como instantáneas JSON dentro de `DATA_DIR/storage`:

```text
storage/
├── manifest.json
└── tables/
    ├── chats.json
    ├── messages.json
    ├── characters.json
    └── ...
```

`FILE_STORAGE_DIR` puede reemplazar el directorio `storage`. Cada archivo de tabla contiene un arreglo JSON. `manifest.json` registra la versión del formato de almacenamiento, la hora de guardado, el identificador del backend y el número de filas de cada tabla registrada.

## Modelo en tiempo de ejecución

`packages/server/src/db/file-backed-store.ts` carga las instantáneas de las tablas en memoria al iniciar. El servidor lee y cambia esas filas mediante las operaciones nativas de archivo que expone `db/file-query.ts`. `db/file-schema.ts` aporta metadatos de tabla y columna seguros ante colisiones para las definiciones que están en `db/schema/`.

La API fluida de `select`, `insert`, `update` y `delete` mantiene compactos los servicios de almacenamiento sin depender de una base de datos externa ni de un ORM. Los filtros y el orden admitidos son objetos de expresión explícitos, así que el almacén nunca analiza cadenas de consulta.

Las tablas declaran claves naturales con `fileTable(..., { uniqueBy: [...] })`. Las inserciones y actualizaciones validan las claves primarias y las claves naturales declaradas contra el cambio candidato completo antes de mutar las filas en memoria, así que una restricción fallida deja la tabla intacta. Una regla puede incluir un predicado `when` cuando la unicidad solo aplica a un subconjunto de filas.

Los paquetes de capacidades descargados pueden traer sus propias instancias de tabla de archivo. El almacén resuelve esas instancias por el nombre de tabla registrado después de comprobar la identidad del objeto, lo que permite que el código de almacenamiento propio de un paquete use las tablas del Engine de forma segura.

## Persistencia y recuperación

Las escrituras marcan como sucias las tablas afectadas. Un breve retardo agrupa los cambios cercanos, mientras que un temporizador de seguridad vuelca periódicamente el trabajo pendiente. El apagado ordenado espera a las escrituras activas y luego persiste cualquier fila que haya cambiado durante esa escritura.

Cada instantánea se escribe en un archivo temporal, se vuelca y se renombra de forma atómica. Antes del reemplazo, la instantánea sana anterior se actualiza como un archivo `.bak`. Al iniciar, un archivo primario ilegible se recupera desde su copia de seguridad cuando es posible. Si ninguna de las dos copias es utilizable, Marinara pone en cuarentena los archivos corruptos con un sufijo de marca de tiempo e inicia solo esa tabla vacía, de modo que la interfaz siga accesible para la recuperación.

## Transacciones

Las transacciones usan instantáneas de copia sobre escritura (copy-on-write) delimitadas con `AsyncLocalStorage`. Una tabla se clona solo cuando esa transacción la muta por primera vez. Si la función de retorno lanza un error, solo se restauran las tablas cambiadas por esa transacción; las escrituras concurrentes no relacionadas sobreviven.

## Agregar una tabla

Al agregar datos persistentes:

1. Define la tabla en `packages/server/src/db/schema/` con `fileTable` y los constructores de columnas nativos de archivo.
2. Expórtala desde `db/schema/index.ts`.
3. Declara las claves naturales con la opción de tabla `uniqueBy`.
4. Registra su nombre en `FILE_BACKED_TABLES`.
5. Define las relaciones en cascada o de establecer-nulo en `file-backed-store.ts` cuando sea necesario.
6. Incluye los metadatos de columna JSON en `services/mari-db/mari-db.service.ts` cuando un campo de texto contenga JSON estructurado.
7. Confirma el comportamiento de copia de seguridad y restauración del perfil.
8. Ejecuta `pnpm check` y las regresiones de almacenamiento correspondientes.

Mantén alineadas las definiciones de tabla, los metadatos de relación, la portabilidad del perfil y la validación de Mari DB en el mismo cambio.
