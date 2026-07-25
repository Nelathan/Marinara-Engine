# Importar desde SillyTavern

Esta guía te muestra cómo traer tus datos de SillyTavern a Marinara Engine. Puedes importar un archivo a la vez, o escanear una carpeta completa de SillyTavern e importar todo de una sola vez.

## Qué puedes traer

Marinara Engine puede importar estos tipos de datos de SillyTavern:

- Personajes (tarjetas de personaje)
- Chats (registros de mensajes)
- Chats grupales (chats con más de un personaje)
- Presets (ajustes de generación)
- Lorebooks (SillyTavern los llama "World Info")
- Backgrounds (imágenes de fondo del chat)
- Personas (tus propios perfiles de **{{user}}**)

Un lorebook (libro de trasfondo) es un conjunto de notas que la IA lee cuando aparecen ciertas palabras en el chat. Un preset (ajuste guardado) es un paquete guardado de ajustes de generación. Una persona es el perfil que te representa a ti en un chat.

Hay dos formas de importar. Usa los botones de un solo archivo para un archivo. Usa el asistente de configuración **Import from SillyTavern Folder** (Importar desde carpeta de SillyTavern) para mover una instalación completa de SillyTavern de una sola vez.

## Importaciones rápidas de un solo archivo

Abre **Settings** (Configuración), luego la pestaña **Imports** (Importaciones), y busca la sección **SillyTavern Import**. Su descripción dice "Bring over characters, chats, presets, and lorebooks from SillyTavern files."

Esta sección tiene cuatro botones de un solo archivo. Cada uno abre un selector de archivos normal sin opciones adicionales:

- **Import Character (JSON/PNG)** toma una tarjeta de personaje `.json` o `.png`.
- **Import Chat (JSONL)** toma un registro de chat `.jsonl`. Siempre crea un chat **Roleplay** y te cambia a él.
- **Import Preset (JSON)** toma un archivo de preset `.json`.
- **Import Lorebook (JSON)** toma un archivo World Info `.json`.

JSONL significa un registro JSON por línea. Es el formato que usa SillyTavern para guardar un registro de chat.

Cuando importas un personaje cuya tarjeta tiene un lorebook incrustado, un aviso del navegador pregunta si también quieres importarlo como un lorebook de Marinara independiente. Haz clic en **OK** para conservar el World Info como su propio lorebook que puedes reutilizar. Haz clic en **Cancel** para saltar ese paso e importar solo el personaje.

Estos botones rápidos usan valores predeterminados fijos que no puedes cambiar aquí. Conservan todas las etiquetas de origen y limitan cualquier script de regex solo al personaje. Un script de regex es una regla de buscar y reemplazar que cambia el texto antes o después de que la IA lo vea. Para elegir esas opciones tú mismo, usa el botón **Import** del panel Characters. Consulta [Importar y exportar tarjetas de personaje](../characters/import-export.md).

### Importar un chat a un modo elegido

El botón de un solo archivo **Import Chat (JSONL)** de arriba siempre crea un chat **Roleplay**. Si quieres que el chat vaya a un modo diferente, usa el pequeño botón de importación en la parte superior de la lista de chats. Su tooltip (texto de ayuda) dice **Import SillyTavern or Marinara chat JSONL**. Ese botón importa el archivo al modo que tengas abierto en la pestaña, como Conversation, Roleplay o Game. Para más información sobre importar y exportar chats, consulta [Exportar e importar chats](../chats/export-import.md).

## Importar desde la carpeta de SillyTavern

Este asistente de configuración escanea una carpeta completa de SillyTavern e importa muchos elementos de una sola vez. Lee personajes, chats, chats grupales, presets, lorebooks, backgrounds y personas juntos.

Para abrirlo, ve a **Settings**, luego **Imports**, después la sección **SillyTavern Import**, y haz clic en **Import from SillyTavern Folder**. Se abre una ventana titulada **Import from SillyTavern**.

### Paso 1: apunta a tu carpeta de SillyTavern

1. En el campo etiquetado **SillyTavern Folder Path**, escribe la ruta a tu carpeta de SillyTavern. Un ejemplo es `/path/to/SillyTavern`.
2. O haz clic en **Browse** para elegir la carpeta con el selector de carpetas de tu computadora. En un servidor remoto o sin pantalla que no tiene selector de carpetas, se abre en su lugar un explorador de carpetas dentro de la app, con un botón **Select This Folder**.
3. Apunta a la carpeta principal de SillyTavern. El consejo en la ventana dice que suele ser la carpeta que contiene una carpeta `data/` o `public/` dentro.
4. Haz clic en **Scan Folder**. El botón muestra **Scanning...** mientras trabaja.

Después del escaneo, Marinara informa cuántos elementos encontró en cada categoría. Si no puede leer la carpeta, muestra un error como "Could not find SillyTavern data directory."

### Paso 2: elige qué importar

La siguiente pantalla se titula **Choose exactly what to import**. Muestra una lista de verificación para cada categoría: **Characters**, **Chats**, **Group Chats**, **Presets**, **Lorebooks**, **Backgrounds** y **Personas**. Un contador muestra cuántos elementos has seleccionado.

Cada categoría tiene botones **All** y **None** y un interruptor **Show** o **Hide** para que puedas ver los elementos individuales y sus fechas.

Casi todo empieza preseleccionado. Los presets integrados de SillyTavern son la excepción. Marinara los detecta y los deja sin marcar, y un aviso explica por qué. Estos son los presets de fábrica como `default`, `deterministic`, `neutral` y los presets `universal-*`. Déjalos sin marcar a menos que realmente quieras copias.

Si el escaneo encontró personajes, aparecen dos controles adicionales:

- **Imported character tags** define el modo de importación de etiquetas. Elige **All tags** para conservar las etiquetas de origen, **No tags** para omitirlas, o **Existing only** para conservar solo las etiquetas que ya tienes en Marinara. El valor predeterminado es **All tags**.
- **Imported regex scripts** define dónde van los scripts de regex. Elige **Character only** para que los scripts se apliquen a cada bot, o **Global** para agregarlos a **Presets -> Regexes** para cada chat. El valor predeterminado es **Character only**.

Cuando tu selección se vea bien, haz clic en **Import Selected**. Haz clic en **Back** para volver al paso de la carpeta.

### Paso 3: observa el progreso

Marinara importa los elementos uno a la vez. Verás un indicador de carga, la categoría y el nombre del elemento actual, una barra de progreso y conteos en curso por categoría.

### Paso 4: lee los resultados

El último paso muestra un aviso **Import complete!** cuando la importación tiene éxito, o un aviso de error cuando falla. Si tiene éxito, una tarjeta por cada categoría muestra su conteo final. Si algún elemento individual falló, una lista de advertencias muestra una línea por cada fallo, como `Character "Foo": error message`. Haz clic en **Done** para cerrar la ventana.

### Cómo maneja tus datos el asistente

- La importación es de mejor esfuerzo por elemento. Si un personaje, chat, preset, lorebook, background o persona falla, Marinara lo omite, registra una advertencia y sigue con el resto.
- Varios archivos de chat que pertenecen a un mismo personaje se importan como ramas de un solo chat, no como chats separados.
- Los chats grupales siempre se importan como chats **Roleplay**.
- Los elementos importados conservan la fecha de última modificación del archivo de origen como su fecha en Marinara. No usan el momento en que ejecutaste la importación.

## Reglas de acceso y de carpetas

Los botones de importación de un solo archivo funcionan para todos sin configuración adicional.

El asistente **Import from SillyTavern Folder** lee archivos del disco, así que necesita acceso con privilegios. En la misma máquina que el servidor (loopback), funciona sin configuración adicional. Desde otro dispositivo o navegador, debes establecer un secreto de administrador en el servidor. Luego guarda el mismo valor en **Settings -> Advanced -> Admin Access**. Consulta [Referencia de configuración del servidor](../CONFIGURATION.md) para saber cómo establecer el secreto de administrador.

Si tu servidor establece `IMPORT_ALLOWED_ROOTS`, Marinara rechaza las rutas escritas que estén fuera de esas carpetas. Las rutas que eliges con **Browse** o con el explorador de carpetas dentro de la app siempre funcionan, incluso con ese ajuste activado.

## Qué no se transfiere

El asistente de carpeta solo escanea las siete categorías listadas arriba. Otros datos de SillyTavern, como los ajustes globales de la app y las respuestas rápidas, no se leen ni se importan.

Los presets integrados de SillyTavern se dejan sin marcar de forma predeterminada, así que no se traen a menos que los marques tú mismo.

Marinara omite cualquier elemento individual que no logre convertir. Revisa la lista de advertencias en el último paso del asistente para ver exactamente qué quedó fuera.

## Guías relacionadas

- [Importar y exportar tarjetas de personaje](../characters/import-export.md)
- [Importar y exportar lorebooks](../lorebooks/import-export.md)
- [Exportar e importar chats](../chats/export-import.md)
- [Scripts de regex](../extending/regex-scripts.md)
