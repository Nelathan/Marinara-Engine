# Mapas jerárquicos y contexto espacial V3

Estado: Propuesto, listo para implementar tras la aprobación del responsable del proyecto

Público: Producto, diseño y colaboradores de Marinara Engine

Reemplaza a: `hierarchical-locations-prd-v2.md`

## Límite de arquitectura

Este plan trata la orientación espacial como una capacidad de producto enfocada, con un límite de estado estrecho.

La función es un sistema de mapas jerárquicos y orientación espacial, no un motor de escenarios genérico al estilo de Voxta. Toma prestado un patrón útil de Voxta: un estado persistente selecciona un contexto de prompt pequeño y relevante. En un principio no agrega flags, variables, eventos, scripts, temporizadores ni un modelo aparte de inferencia de acciones.

Los modos propietarios admitidos son Roleplay y Game. El valor de enumeración heredado `visual_novel` es residuo de compatibilidad y no es un modo de producto admitido.

El plan tiene cinco capas enfocadas:

| Capa | Responsabilidad | Ejemplo |
| --- | --- | --- |
| Definición del mapa | Verdad espacial estable | La Library está dentro de la Wizard Tower |
| Estado en tiempo de ejecución | La ubicación actual de la escena | La escena está actualmente en la Library |
| Proyección del prompt | Orientación acotada del modelo | Ruta de navegación, memoria actual, salidas alcanzables |
| Identidad visual | Referencias de arte opcionales específicas del lugar | La Library conserva sus arcos, ventanas y materiales entre escenas |
| Transición | Cambio de estado validado | Moverse de la Library al Observatory |

La máquina de estados es deliberadamente pequeña:

```text
current location + requested destination + definition revision
                              ↓
                  validate ownership and reachability
                       ↙ accepted       rejected ↘
              persist snapshot         preserve state
```

El movimiento manual se entrega primero. Más adelante, una herramienta acotada del modelo, como `change_location({ destinationId })`, podría solicitar la misma transición. El servidor, no el modelo, la valida y la aplica. Una llamada aparte de inferencia de acciones se pospone salvo que evidencia posterior muestre que hace falta.

## Resumen

Agrega una función compartida de Mapa jerárquico para Roleplay y Game. Ofrece una jerarquía de ubicaciones definida por el autor, una única ubicación focal autoritativa, un contexto de prompt acotado a la ubicación actual y movimiento validado por el servidor.

Los lorebooks (libros de trasfondo) siguen siendo la fuente canónica de datos reutilizables del mundo. La jerarquía puede hacer referencia a entradas existentes de un lorebook por su ID estable, de modo que la ubicación activa pueda seleccionar el trasfondo relevante sin copiarlo ni reescribirlo. El borrador de mapa asistido por IA puede usar lorebooks seleccionados explícitamente como material de origen fundamentado, y debe distinguir las ubicaciones respaldadas por una fuente de las añadidas por inferencia o invención.

Una ubicación también puede tener un kit opcional de identidad visual: un ancla visual breve más referencias estables a imágenes de la galería del perfil. La ubicación sigue siendo una entidad espacial, no una imagen. El perfil de estilo de imagen del chat controla el estilo general de renderizado, las referencias de ubicación preservan el lugar, y las referencias de personaje o persona preservan a las personas que hay en él.

La Conversation conectada puede leer más adelante una proyección segura de la ubicación de la historia enlazada, pero nunca posee ni cambia el estado espacial.

```text
authoritative hierarchy + current location
                    ↓
resolve breadcrumb, context, and valid destinations
                    ↓
build the mode-specific prompt
                    ↓
commit a validated move with the next owner turn
                    ↺
```

Esto no es un motor de escenarios general. No agrega flags, eventos, JavaScript del autor ni búsqueda de rutas. Sí incluye un explorador de mapas visual y anidado con presentaciones de mapa, capa y lista.

## Decisiones de producto

Estas decisiones resuelven las preguntas abiertas de la V2:

1. La definición de la jerarquía y la ubicación actual se almacenan por separado.
2. La ubicación actual se guarda como snapshot junto con el estado del mensaje y del swipe (respuesta alternativa) confirmados, de modo que las ramas, la regeneración y los puntos de control restauren la posición correcta.
3. El movimiento manual se confirma de forma atómica con el siguiente turno del usuario en el modo propietario, antes de la generación del prompt.
4. El Spatial Context es autoritativo cuando está activado. La ubicación heredada de texto libre de Game no debe convertirse en una segunda fuente de verdad.
5. Roleplay y Game usan un mismo contrato compartido de proyección espacial con adaptadores de prompt finos y específicos de cada modo.
6. `awarenessSummary` lo escribe el autor. Cuando falta, la Conversation recibe un extracto acotado únicamente de la descripción pública.
7. La Conversation usa una redacción a nivel de escena salvo que datos de presencia autoritativos demuestren que el personaje conectado está presente.
8. Los enlaces directos y la colocación visual de hijos están incluidos en el MVP.
9. Los mapas de cuadrícula y de nodos existentes de Game pueden vincularse explícitamente a ubicaciones de la jerarquía; los nombres nunca se emparejan de forma automática.
10. Los lorebooks poseen los datos canónicos reutilizables del mundo; el mapa posee la identidad espacial, la contención, la navegación y el estado de ubicación actual. Las ubicaciones del mapa hacen referencia a entradas de lorebook por su ID estable y nunca copian su contenido.
11. Un adjunto de ubicación es una fuente de activación explícita con alcance de chat. Mientras esa ubicación exacta sea la actual, sus entradas activadas pueden activarse sin coincidencia de palabra clave, pero los libros y entradas desactivados o excluidos explícitamente siguen desactivados.
12. El borrador de mapa fundamentado en lorebooks sigue la interfaz de tiempo de ejecución del modo propietario y precede a la Conversation conectada. Cuando se seleccionan lorebooks de origen, el borrador debe exponer qué ubicaciones están respaldadas por una fuente, cuáles son inferidas y cuáles inventadas, en lugar de presentar una geografía sin respaldo como canon.
13. Una ubicación nunca se reemplaza por una imagen. Puede hacer referencia a recursos opcionales de identidad visual por su ID de imagen estable, con una referencia principal de ambientación y referencias de apoyo acotadas.
14. Las referencias visuales de ubicación solo alimentan las rutas de generación de imágenes elegibles. La generación de texto, la activación de trasfondo y la Conversation conectada nunca reciben bytes de imagen ni notas exclusivas de imagen.
15. El Storyboard (secuencia de viñetas) es un consumidor posterior del mismo resolvedor visual. Cada storyboard congela un manifiesto de referencias anclado a un mensaje y un swipe, de modo que una regeneración posterior no adopte en silencio arte de ubicación o de personaje más reciente.
16. El movimiento solicitado por el modelo sigue siendo una fase posterior.

## Alcance

| Modo | Posee jerarquía | Mueve la ubicación focal | Proyección de historia | Proyección conectada |
| --- | ---: | ---: | ---: | ---: |
| Roleplay | Sí | Sí | Sí | N/A |
| Game | Sí | Sí | Sí | N/A |
| Conversation | No | No | No | Fase posterior, solo lectura |

## Experiencia de usuario

### Autoría

**Chat Settings** (Ajustes del chat) muestra una sección compacta de Spatial Context con:

- Estado de activación
- Ruta de navegación actual
- Recuentos de ubicaciones y advertencias
- Acción `Open Location Editor`

El editor es un espacio de trabajo de mapa cargado de forma diferida, no un formulario de configuración estrecho:

- El escritorio usa un panel de jerarquía, una vista de mapa local o de capas, y un panel de detalle de la ubicación.
- El móvil muestra un panel a la vez con una navegación de retroceso clara.
- La validación aparece junto al campo o nodo afectado.
- El estado de guardado y los conflictos de revisión siempre están visibles.
- Archivar es la acción principal de eliminación; el borrado definitivo está restringido.
- La selección previsualiza una ubicación. Una acción `Enter` distinta navega hasta ella, así que hacer clic nunca significa de forma ambigua inspeccionar, editar y mover.
- Cada padre presenta a sus hijos como un mapa posicionado, capas ordenadas o una lista accesible.
- Duplicar un subárbol permite la reutilización por parte del creador sin requerir plantillas entre chats en el MVP.
- Cada ubicación tiene una sección progresiva `Linked lore` que busca en las entradas existentes de lorebook, muestra las referencias desactivadas o ausentes, y admite `Open entry` y `Detach` sin copiar ni eliminar contenido de trasfondo.
- Cada ubicación tiene una sección progresiva `Visual identity` con una imagen principal, referencias de apoyo, notas de uso, y acciones explícitas de galería, subida o generación. Las imágenes nunca reemplazan el nombre, el icono ni la etiqueta de navegación accesible de la ubicación.

### Borrador fundamentado en lorebooks

El generador de mapas por IA ofrece fundamentación en lorebooks cuando el chat propietario tiene lorebooks seleccionados o activos. La fundamentación es explícita e inspeccionable, no un escaneo normal de palabras clave.

- La configuración de Game usa los lorebooks seleccionados en el paso Lorebooks como fuentes de mapa predeterminadas.
- Roleplay usa como predeterminados los lorebooks activos del chat abierto y permite al creador cambiar la selección de fuentes en el generador de mapas.
- `Strict canon` crea cada nodo con nombre a partir de al menos una entrada de trasfondo seleccionada. Preserva varias raíces con fuente en lugar de inventar lugares de conexión sin respaldo.
- `Canon with expansion` preserva los nombres y relaciones con fuente y permite ubicaciones inferidas o inventadas, claramente etiquetadas, para cubrir huecos prácticos.
- `Setup only` preserva el comportamiento existente y usa la configuración, el resumen del mundo, el arco de la historia, el escenario y el contexto del personaje sin fundamentación en lorebooks.
- Cuando existen lorebooks seleccionados, `Canon with expansion` es el valor predeterminado accesible. El generador mantiene `Strict canon` a un control de distancia para creadores con muchos lorebooks.

Cada nodo generado en la vista previa del borrador muestra `Lore-backed`, `Inferred` o `Added by AI`. Los nodos con respaldo de trasfondo listan sus entradas de origen y ofrecen `Open entry`. La etiqueta prueba una referencia de fuente válida, no que el modelo haya interpretado la prosa a la perfección, así que la revisión del creador sigue siendo la autoridad semántica. `Apply` cambia solo la copia de trabajo local, y `Save` sigue siendo el límite de persistencia.

### Identidad visual de la ubicación y arte de referencia

Las imágenes de ubicación deberían mejorar la coherencia de la escena sin convertir la jerarquía en una galería ni en otra fuente de verdad espacial.

- Un creador puede subir una imagen, seleccionar una imagen existente de la galería del perfil, promover una escena generada, o generar una referencia de ambientación a partir de la ruta de navegación de la ubicación, la descripción pública, el ancla visual, el trasfondo enlazado y el perfil de estilo de imagen seleccionado.
- Adjuntar una imagen de la galería del chat, un fondo de Game generado u otra fuente temporal crea primero un recurso duradero en la galería del perfil. El mapa almacena el ID de imagen estable de la galería, nunca una ruta de archivo, una URL externa ni una carga en base64.
- Una imagen `identity` puede ser la principal. Las imágenes de apoyo pueden describir un detalle distintivo, una vista alternativa, una distribución o una pauta de estilo artístico heredable.
- Las referencias `layout` siguen siendo ayudas del editor a menos que una solicitud especializada de fondo o de plano lo pida explícitamente. No se envían automáticamente a la ilustración de escena habitual porque pueden distorsionar la composición.
- Solo las referencias `style` pueden optar por la herencia a los descendientes. Las imágenes de identidad y detalle se aplican a la ubicación exacta, así que el horizonte de una ciudad no se usa en silencio como identidad visual de cada habitación dentro de ella.
- El arte de escena generado nunca se vuelve canon de forma automática. `Set as location reference` es una acción de revisión explícita, que evita que la generación repetida amplifique detalles accidentales o desvíe el estilo.
- El inspector de la ubicación seleccionada muestra la imagen principal y los roles de referencia. Las vistas densas de jerarquía y mapa se mantienen con el nombre primero; pueden mostrar una miniatura pequeña cuando el espacio lo permita, pero la navegación nunca depende del reconocimiento de imágenes.
- La vista previa de generación de imágenes nombra cada referencia de ubicación y personaje resuelta, su rol, y cualquier referencia omitida por límites del proveedor. Nunca registra ni muestra base64 en bruto en los diagnósticos.

La pila de coherencia prevista es:

```text
chat image style profile  -> shared rendering language
current location refs     -> stable architecture and place identity
character/persona refs     -> stable people and appearance
scene prompt              -> current action, framing, weather, and lighting
```

El arte de referencia es evidencia visual, no trasfondo automático. Agregar una imagen nunca crea ubicaciones, cambia la contención ni escribe datos de lorebook. La inferencia de imagen a mapa sigue siendo un flujo de trabajo futuro revisado por separado.

### Continuidad de referencias del Storyboard

El Storyboard debería consumir las identidades visuales revisadas del turno del GM completado sin hacer que la función espacial dependa del Storyboard.

- La galería del perfil y las galerías de entidades forman un banco de referencias que puede contener varias imágenes revisadas de una ubicación, un personaje o una persona. Un fotograma clave generado recibe solo una carga de referencias dimensionada al proveedor, seleccionada de ese banco.
- Crear un storyboard resuelve el snapshot espacial exacto de su mensaje y swipe de origen. La ubicación más reciente del chat nunca sustituye a un turno anterior.
- El storyboard congela la ubicación resuelta, los ID de imagen candidatos ordenados, las selecciones por fotograma clave, las omisiones y la capacidad del proveedor en un manifiesto de referencias visuales. La regeneración reutiliza ese manifiesto hasta que el creador elige explícitamente `Refresh references`.
- El mismo candidato de ubicación principal está disponible para cada fotograma clave. Los candidatos de personaje y persona varían según la lista de personajes visibles del fotograma, de modo que los miembros del reparto fuera de escena no consumen espacios de referencia.
- La primera versión selecciona automáticamente una imagen principal por entidad representada y como máximo una imagen de ubicación de apoyo. Los bancos más ricos siguen siendo útiles para la selección manual y el futuro emparejamiento de ángulo, vestuario, expresión o detalle según la toma, pero Marinara no envía cada imagen almacenada en cada fotograma.
- Si solo queda un espacio automático, un fotograma clave con personajes visibles selecciona al personaje visible principal; un fotograma clave de ambientación sin personajes visibles selecciona la ubicación principal. Con dos o más espacios, la ubicación principal se selecciona antes que las referencias adicionales de personajes visibles.
- Un proveedor de mayor capacidad no agrega referencias en silencio a un storyboard existente. Un proveedor de menor capacidad produce un conflicto `Review references` en línea en lugar de cambiar en silencio la carga congelada.
- Cada vista previa de fotograma clave tiene una divulgación progresiva `Visual sources` que lista la ubicación resuelta, los personajes seleccionados, los roles de imagen, el orden y los motivos de omisión. `Refresh references` está disponible allí sin agregar un administrador de recursos aparte del Storyboard ni una ventana bloqueante.
- Los fotogramas clave generados nunca se vuelven referencias de personaje o de ubicación de forma automática. Las acciones de promoción explícitas existentes siguen siendo el único límite de persistencia.

### Movimiento en tiempo de ejecución

Las superficies de chat del modo propietario muestran:

- Ruta de navegación actual persistida
- Selector de destinos válidos
- Destino pendiente claramente etiquetado

Seleccionar un destino no cambia de inmediato el estado autoritativo. Al enviar el siguiente mensaje se envía el ID de destino y la revisión esperada por separado del texto visible del mensaje. El servidor confirma el movimiento antes de ensamblar el prompt de respuesta.

Si la validación falla, el mensaje y el movimiento no se confirman parcialmente. El cliente conserva el borrador y explica el conflicto.

## Modelo de datos

Las definiciones pertenecen a la metadata del chat. La posición en tiempo de ejecución pertenece al historial de snapshots.

```ts
export type SpatialOwnerMode = "roleplay" | "game";

export type LocationVisualReferenceRole = "identity" | "detail" | "layout" | "style";

export interface LocationVisualReference {
  imageId: string;
  role: LocationVisualReferenceRole;
  primary?: boolean;
  usageNote?: string;
  inheritToDescendants?: boolean;
  sortOrder: number;
}

export interface ChatLocation {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  kind: "region" | "settlement" | "place" | "building" | "floor" | "room";
  modelMemory?: string;
  icon?: string;
  childPresentation: "map" | "layers" | "list";
  placement?: { x: number; y: number };
  layerOrder?: number;
  awarenessSummary?: string;
  visualIdentity?: string;
  visualReferences: LocationVisualReference[];
  lorebookEntryIds: string[];
  links: ChatLocationLink[];
  status: "active" | "archived";
  sortOrder: number;
}

export interface ChatLocationLink {
  targetId: string;
  label?: string;
  bidirectional: boolean;
  state: "available" | "hidden" | "blocked";
}

export interface SpatialContextDefinition {
  schemaVersion: 1;
  ownerMode: SpatialOwnerMode;
  enabled: boolean;
  locations: ChatLocation[];
  startingLocationId: string | null;
  revision: number;
}

export interface SpatialContextSnapshot {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  createdAt: string;
}

export interface PendingSpatialTransition {
  destinationId: string;
  expectedDefinitionRevision: number;
  expectedCurrentLocationId: string | null;
  commandId: string;
}
```

No almacenes `ownerChatId` dentro de `SpatialContextDefinition`; el chat que lo contiene es el propietario. Los ID opacos y estables sobreviven a los cambios de nombre y de padre.

El primer MVP propietario trata un campo `lorebookEntryIds` o `visualReferences` ausente como un arreglo vacío, de modo que paquetes posteriores puedan extender la versión 1 del esquema sin reescribir con avidez las definiciones existentes. Las referencias de entrada y de imagen son solo ID estables. Los nombres de lorebook, los nombres de entrada, las claves, el contenido, las rutas de imagen y los bytes de imagen se resuelven en el momento de uso y nunca se copian en la definición espacial. `imageId` se resuelve a través de la galería duradera del perfil; adjuntar una imagen temporal o con alcance de chat promueve primero una copia duradera.

## Reglas del grafo

Los destinos válidos están activos:

- Hijos de la ubicación actual
- El padre de la ubicación actual
- Destinos de enlaces directos
- Destinos inversos de enlaces bidireccionales

Los hermanos no son adyacentes de forma automática.

Rechazar:

- ID duplicados
- Padre o destinos de enlace ausentes
- Auto-paternidad o ciclos de padres
- Más de 500 ubicaciones
- Profundidad superior a 20
- Más de 50 enlaces por ubicación
- Más de 50 referencias de entrada de lorebook por ubicación
- Referencias de entrada de lorebook duplicadas en una misma ubicación
- Más de 6 referencias visuales por ubicación
- Referencias de imagen visual duplicadas en una misma ubicación
- Más de una referencia visual principal, o una referencia principal cuyo rol no sea `identity`
- Herencia a descendientes en un rol distinto de `style`
- Coordenadas de colocación fuera del rango de 0 a 100
- Orden de capas inválido o duplicado dentro de un padre de capa
- Movimiento a ubicaciones archivadas, ocultas, bloqueadas o inalcanzables
- Revisiones obsoletas o una ubicación actual cambiada
- ID de comando reutilizados con contenidos distintos
- Intentos de mutación desde la Conversation

Límites de texto:

- Nombre: 200 caracteres
- Descripción: 4.000 caracteres
- Resumen de conciencia: 1.000 caracteres
- Memoria privada del modelo: 8.000 caracteres
- Identidad visual: 800 caracteres
- Nota de uso de referencia visual: 300 caracteres

Los ciclos de enlaces directos son válidos. Los ciclos de padres no lo son.

### Archivar y eliminar

- La ubicación actual o inicial necesita un reemplazo atómico antes de archivarla.
- Una ubicación con hijos activos no se puede archivar.
- El borrado definitivo solo se permite para una hoja archivada sin enlaces entrantes.
- Los descendientes nunca se reasignan a otro padre en silencio.
- Las referencias de lorebook ausentes aparecen como advertencias, no como corrupción del grafo.
- Archivar o eliminar una ubicación nunca elimina sus entradas de lorebook referenciadas.
- Eliminar un lorebook o una entrada nunca reescribe el mapa en silencio. La ubicación conserva una referencia rota reparable hasta que el creador la desvincula o la reemplaza.
- Archivar o eliminar una ubicación nunca elimina una imagen compartida de la galería del perfil.
- Eliminar una imagen de galería que aún está referenciada por una ubicación o por un manifiesto congelado de Storyboard está bloqueado hasta que el creador la desvincula o actualiza cada manifiesto dependiente. Las referencias de imagen ausentes siguen siendo advertencias reparables y nunca se convierten en respaldos de ruta en bruto.

## Persistencia e historial

### Definiciones

Almacena `SpatialContextDefinition` en `chat.metadata.spatialContext`. Las actualizaciones de definición requieren `expectedRevision`; las actualizaciones aceptadas incrementan la revisión.

### Posición en tiempo de ejecución

Almacena la posición actual usando snapshots direccionables por mensaje/swipe, siguiendo el patrón de snapshot existente de Game State.

- Los chats propietarios nuevos comienzan en `startingLocationId`.
- Un turno confirmado crea un snapshot tras cualquier movimiento aceptado.
- La regeneración asocia la posición con el swipe resultante.
- Cambiar de swipe resuelve el snapshot correspondiente.
- Ramificar en un mensaje copia el snapshot vigente en ese punto, no la posición más reciente del chat de origen.
- Los puntos de control de Game hacen referencia o incluyen el snapshot espacial aplicable.
- Recargar resuelve el snapshot confirmado más reciente.

La edición de definiciones no se rebobina con la ramificación ordinaria de mensajes en el MVP. Una rama recibe una copia de la definición actual, con su propio historial de revisiones futuro. Su posición en tiempo de ejecución proviene del punto de ramificación.

## Proyecciones del prompt

Un servicio compartido de proyección del servidor resuelve datos de proyección estructurados. Adaptadores de modo finos los convierten en el texto final del prompt.

### Proyección de historia del propietario

Incluir:

- Nombres de la ruta de navegación
- ID de la ubicación actual
- Descripción pública
- Memoria privada del modelo de la ubicación actual
- Nombres, ID y etiquetas de enlace de los destinos disponibles
- Una instrucción de estado autoritativo

Excluir todas las descripciones y memorias de ubicaciones no relacionadas, los destinos ocultos o bloqueados, las coordenadas del lienzo y la metadata del editor.

### Activación de trasfondo de la ubicación actual

El resolvedor espacial del propietario devuelve los `lorebookEntryIds` de la ubicación actual exacta junto a la proyección espacial normal. El formateador no pega esos ID ni el contenido de las entradas en el bloque espacial. En cambio, el ensamblado del prompt pasa los ID al procesador de lorebook existente como candidatos forzados con fuente de activación `current_location`.

Reglas:

- Solo la ubicación actual exacta activa el trasfondo adjunto en la primera entrega. Los padres y descendientes no heredan entradas de forma implícita.
- Un adjunto de ubicación explícito puede activar una entrada activada aunque su lorebook no sea global, no esté enlazado a un personaje o persona, ni esté fijado al chat de otro modo.
- Un lorebook desactivado globalmente, una entrada desactivada o una exclusión explícita del chat siempre prevalecen sobre el adjunto.
- Se reutilizan los macros, las posiciones de inserción, la recursión, el orden y los límites de token y de entrada por libro existentes de los lorebooks.
- El trasfondo adjunto a la ubicación también tiene un tope total reservado de 2.048 tokens por prompt del propietario. El truncamiento es determinista y aparece en Active Context.
- Una entrada activada tanto por la ubicación como por reglas ordinarias de palabra clave, semánticas, recursivas o constantes se inyecta una sola vez e informa de cada fuente de activación.
- Un movimiento confirmado resuelve las entradas del destino antes de ensamblar el prompt de respuesta del propietario. El movimiento pendiente o rechazado no cambia la activación de trasfondo.
- La redacción de Game trata la ubicación como la posición autoritativa del grupo. La redacción de Roleplay la trata como la escena focal y no infiere que todos los personajes estén presentes.

La interfaz de Active Context agrupa estas entradas bajo `Current location`, muestra el lorebook propietario, las fuentes de activación, el uso o truncamiento de tokens, y `Open entry`. Las referencias rotas, desactivadas y excluidas siguen visibles en el editor de mapas pero nunca entran en el prompt.

### Proyección de la Conversation conectada

Se agrega en la Fase 3. Incluir solo:

- Nombre y modo de la historia enlazada
- Ruta de navegación
- `awarenessSummary`, o un extracto acotado de la descripción pública
- Instrucción de solo lectura
- Presencia de personaje solo cuando el estado autoritativo la demuestre

Nunca incluir la memoria privada del modelo, los ID internos, los destinos ocultos, la jerarquía completa, los ID o el contenido de lorebook adjuntos a la ubicación, los ID de referencia visual de la ubicación, las notas de identidad visual, las notas de uso, las rutas de imagen ni los bytes de imagen.

Game puede demostrar la presencia mediante su estado confirmado `presentCharacters`. Roleplay usa una redacción neutra como “The linked story's current scene is…” hasta que obtenga una fuente de presencia explícita. Nunca infieras la presencia por el nombre del personaje.

### Rutas de prompt requeridas

El mismo resolvedor de proyección debe alimentar:

- La generación de Roleplay
- La generación del GM de Game
- La vista previa de simulación (dry-run)
- El ensamblado en vivo de Peek Prompt

El Peek Prompt en caché sigue mostrando el prompt exacto enviado originalmente. El registro de depuración incluye la proyección final pero no debe registrar la memoria privada del modelo en niveles normales.

### Proyección visual de la ubicación actual para la generación de imágenes

Las referencias visuales usan un resolvedor separado del prompt de historia. Resuelve el snapshot espacial aplicable al objetivo de la imagen, no simplemente la ubicación más reciente del chat. El arte automático de Game usa el snapshot confirmado para ese mensaje del asistente. Reintentar el arte de un swipe anterior e invocar al Illustrator desde un mensaje anterior usan la ubicación resuelta de ese mensaje y swipe.

Las rutas elegibles son el arte de escena automático de Game, la ilustración de escena manual de Game, y la generación de escena o fondo del Illustrator de Roleplay cuando el control de referencia de ubicación por chat está activado. La generación de retratos, selfies, avatares y sprites (imagen del personaje) no adjunta referencias de ubicación de forma automática.

Dos controles de la metadata del chat reflejan los controles de referencia de avatar existentes: `illustratorUseLocationReferences` y `gameImageUseLocationReferences`. Ausente o falso sigue estando desactivado por compatibilidad hacia atrás. Cuando el creador establece la primera imagen principal de ubicación, el mismo flujo de guardado ofrece `Use this location in scene art`, marcado de forma predeterminada pero explícito, de modo que nunca se envíen bytes de imagen a un proveedor solo porque una imagen se muestre en el editor de mapas.

El orden de candidatos es determinista y consciente del proveedor:

1. Referencias explícitas seleccionadas para esta solicitud de imagen.
2. La referencia `identity` principal de la ubicación resuelta exacta.
3. Los personajes y la persona referenciados en el orden de la escena.
4. Las referencias de apoyo `identity` y `detail` de la ubicación exacta en `sortOrder`.
5. La referencia `style` heredable del ancestro más cercano.

No se permite ningún respaldo por hermanos ni basado en nombres. Como máximo dos imágenes de ubicación son candidatas para una solicitud de escena ordinaria, y el adaptador del proveedor existente aplica su límite total de imágenes. Las referencias de solicitud explícitas siempre consumen espacios primero. Para los espacios automáticos restantes, una solicitud de fondo prioriza la identidad de la ubicación sobre las referencias de personaje, mientras que una ilustración elige la referencia de ubicación principal antes que las referencias adicionales de personas representadas. Si un proveedor no puede aceptar tanto el lugar como cada persona solicitada, la vista previa informa del compromiso determinista y de cada motivo de omisión.

El compilador del prompt de imagen agrega la ruta de navegación de la ubicación, el `visualIdentity` acotado y el `usageNote` acotado de cada referencia seleccionada. El `ImageStyleProfile` seleccionado del chat sigue siendo la autoridad de estilo. Las imágenes de referencia preservan la identidad del lugar o del sujeto y no deben reemplazar en silencio el texto de estilo del perfil, las etiquetas positivas, las etiquetas negativas ni el modo de prompt.

Los roles de referencia expresan la intención del creador y la prioridad de selección; no garantizan que cada proveedor interprete una imagen como identidad, detalle, distribución o estilo. Las notas de capacidad del proveedor y la vista previa generada mantienen al creador como autoridad visual.

Las solicitudes al modelo de texto no reciben ninguno de estos bytes de imagen ni notas de uso exclusivas de imagen. La Conversation conectada no recibe ni los ID de referencia visual ni sus contenidos. Los registros de depuración de imagen pueden incluir ID de imagen, ID de ubicación, roles, motivos de selección y omisiones, pero nunca base64 ni rutas del sistema de archivos.

### Manifiestos de referencias visuales del Storyboard

El adaptador de Storyboard resuelve los candidatos visuales una sola vez para el turno del GM completado, después de que su mensaje y swipe se confirman. Almacena un banco congelado y la carga dimensionada al proveedor elegida para cada fotograma clave. Esto separa la identidad de referencia duradera de una solicitud al proveedor que puede aceptar solo un subconjunto pequeño.

La selección es determinista:

1. Las referencias explícitas del fotograma clave consumen espacios primero.
2. Con un espacio automático restante, un fotograma de ambientación selecciona la ubicación principal y un fotograma con personajes visibles selecciona al personaje visible principal.
3. Con dos o más espacios automáticos restantes, selecciona la ubicación principal exacta, luego una referencia principal por cada personaje o persona visible en orden narrativo.
4. Usa la capacidad restante para una identidad o detalle de apoyo de la ubicación exacta, luego referencias secundarias de entidades representadas, y luego el estilo de ubicación heredable más cercano.

El Storyboard nunca crea una hoja de contactos ni una referencia compuesta de forma implícita. Esas técnicas pueden cambiar la interpretación del proveedor y siguen siendo una optimización futura específica del proveedor. Las imágenes ausentes, un proveedor cambiado o un límite de proveedor reducido marcan el manifiesto como `needs_review`; no elige en silencio una entidad distinta. Aumentar la capacidad también preserva la carga congelada hasta que se confirma `Refresh references`.

El manifiesto almacena ID, etiquetas, roles, orden, motivos de selección, omisiones, mensaje y swipe de origen, ID de ubicación resuelta, revisión de definición, identidad del proveedor y el límite de referencias usado. No almacena bytes de imagen ni rutas del sistema de archivos. La salida de depuración puede describir ese manifiesto pero sigue las mismas reglas de no-base64 y no-ruta que la generación de imágenes ordinaria.

## Compatibilidad con Game

Los mapas de cuadrícula y de nodos existentes de Game siguen siendo representaciones locales o tácticas. La jerarquía se convierte en la capa de mundo y contención por encima de ellos.

Cuando el Spatial Context está activado:

- El Spatial Context suministra la ubicación con nombre autoritativa a los prompts.
- El tracker (agente de seguimiento) de Game muestra la ruta de navegación espacial como su ubicación.
- Los parches heredados del modelo o manuales no pueden cambiar de forma independiente la ubicación de texto libre de Game.
- `GameMap.spatialLocationId` puede vincular un mapa entero a una ubicación de la jerarquía.
- `GridCell.spatialLocationId` y `MapNode.spatialLocationId` pueden vincular un destino al que se puede entrar.
- Los vínculos usan solo ID estables; los nombres nunca se emparejan de forma automática.
- Seleccionar un destino vinculado crea la misma transición pendiente que el explorador de jerarquía.
- Moverse entre celdas o nodos no vinculados cambia solo la posición táctica del grupo.
- Entrar en una ubicación puede seleccionar su mapa local vinculado; salir puede seleccionar el mapa ancestro vinculado más cercano.

Cuando está desactivado, el comportamiento de ubicación existente de Game no cambia.

Este límite preserva la interfaz de mapa y las partidas guardadas actuales a la vez que evita dos fuentes de verdad espacial con nombre.

## Forma de la API

```text
GET  /api/chats/:chatId/spatial-context
PUT  /api/chats/:chatId/spatial-context
```

Actualización de definición:

```ts
interface UpdateSpatialContextRequest {
  expectedRevision: number;
  expectedCurrentLocationId: string | null;
  replacementCurrentLocationId?: string | null;
  definition: SpatialContextDefinition;
}
```

`replacementCurrentLocationId` solo se usa cuando una edición de definición archiva la ubicación actual vigente. El servidor debe validar y aplicar ese reemplazo en la misma escritura que la revisión de definición. El movimiento ordinario sigue pasando por el envío de turno del modo propietario.

El movimiento pendiente se envía a través de la solicitud de turno del modo propietario existente en lugar de un endpoint separado de transición inmediata.

El servidor valida la integridad de la definición, el modo propietario, la revisión esperada, la ubicación actual esperada, la alcanzabilidad y la idempotencia del comando dentro de la misma transacción que el envío del mensaje.

Devuelve `409 Conflict` para estado obsoleto y `400 Bad Request` para grafos o destinos inválidos. Los errores no deben revelar destinos ocultos.

## Plan de implementación

### Fase 0: núcleo compartido y fixtures de prueba

- Agregar tipos compartidos y esquemas de Zod.
- Agregar validación pura del grafo, ruta de navegación y ayudantes de destino.
- Agregar fixtures deterministas para grafos válidos e inválidos.
- Confirmar los puntos de integración de snapshot de mensaje/swipe para Roleplay y Game.
- Medir proyecciones de prompt representativas.

Condición de salida: el esquema, la semántica de movimiento y el comportamiento de snapshot se prueban sin interfaz.

### Fase 1: MVP del propietario

1. Agregar persistencia de definición con concurrencia optimista.
2. Agregar almacenamiento y resolución de snapshots espaciales.
3. Integrar el movimiento pendiente atómico en el envío de turno del modo propietario.
4. Manejar recarga, swipes, ramas y puntos de control de Game.
5. Agregar el servicio de proyección compartido a cada ruta de prompt requerida.
6. Agregar la sección compacta de configuración, el navegador de jerarquía, el lienzo de mapa local, el selector de capas y el espacio de trabajo del editor.
7. Agregar la ruta de navegación, el selector de destinos, la vista previa y el estado pendiente a las superficies del propietario.
8. Vincular los mapas, celdas y nodos existentes de Game mediante ID de ubicación estables.
9. Reconciliar la ubicación del tracker de Game cuando esté activado.

Condición de salida: Roleplay y Game pueden crear, mover, persistir, restaurar y generar prompts a partir del mismo modelo espacial. El movimiento por mapa vinculado de Game y el movimiento táctico no vinculado siguen siendo distintos.

### Fase 2A: vínculos de lorebook por ubicación y tiempo de ejecución

- Agregar `lorebookEntryIds` a las ubicaciones con un valor predeterminado de compatibilidad de arreglo vacío.
- Agregar estados en línea de adjuntar, abrir, desvincular, desactivado, excluido y referencia rota al Location Editor.
- Resolver las referencias de la ubicación actual exacta como candidatos forzados a través del procesador de lorebook existente.
- Reutilizar los macros, la inserción, la recursión, el orden y los límites por libro normales; agregar deduplicación determinista y un tope total de trasfondo de ubicación de 2.048 tokens.
- Informar `current_location` junto a cualquier fuente de activación de palabra clave, semántica, recursiva o constante en Active Context.
- Probar un comportamiento idéntico en Roleplay y Game, incluidos movimiento, recarga, regeneración, swipes y ramas.
- Probar que la Conversation conectada no recibe ni los ID ni el contenido del trasfondo de la ubicación.

Condición de salida: los creadores pueden vincular explícitamente trasfondo existente a las ubicaciones, y solo la ubicación actual aceptada activa esas entradas en los prompts del propietario.

### Fase 2B: borrador de mapa fundamentado en lorebooks

- Extender las solicitudes de crear, reemplazar y expandir con seguridad de historial con un modo de fundamentación y selección explícita de lorebook o entrada de origen.
- Leer directamente las entradas de trasfondo activadas seleccionadas para esta operación de autoría en lugar de depender de la activación por palabra clave o del resumen del mundo generado.
- Construir un catálogo de fuentes acotado y consciente de la conexión, con recuentos de omisión visibles y orden determinista.
- Dar al modelo claves de fuente temporales, validar cada clave devuelta en el servidor, y persistir solo los ID de entrada estables.
- Admitir el comportamiento `setup_only`, `lore_strict` y `lore_expand` con procedencia en la vista previa.
- Autovincular las entradas de origen válidas a las ubicaciones generadas preservando `Apply` y `Save` como límites de revisión separados.
- Preservar cada ID de ubicación y vínculo de trasfondo existente durante la expansión de solo adición.

Condición de salida: un creador con dominio de lorebooks puede generar un mapa fundamentado directamente en el canon seleccionado, identificar cada adición sin respaldo, y rechazarla o editarla antes de la persistencia.

### Fase 2C: identidad visual de la ubicación y referencias de escena

- Agregar campos acotados `visualIdentity` y `visualReferences` con valores predeterminados de compatibilidad vacíos.
- Reutilizar los ID de imagen duraderos de la galería del perfil y las rutas seguras existentes de subida a la galería, metadata y generación de imágenes. Nunca persistir rutas en bruto, URL externas ni base64 en la definición.
- Agregar los controles paralelos por chat de referencia de ubicación del Illustrator y de Game. El flujo de guardado de la primera imagen principal obtiene consentimiento explícito antes de activar el uso por el proveedor.
- Generar una referencia de ambientación a partir del contexto acotado de la ubicación exacta y solo del trasfondo adjunto activado. No escanear lorebooks ni ramas de jerarquía no relacionados.
- Agregar estados en línea de principal, apoyo, rol, nota de uso, selección de galería, subida, generar, desvincular, referencia rota y enlace de retorno al Location Editor.
- Resolver la ubicación exacta del mensaje y swipe en las solicitudes de arte de escena elegibles de Game y Roleplay, luego combinar las referencias de ubicación, personaje, persona y explícitas bajo los límites específicos del proveedor.
- Agregar la promoción explícita `Set as location reference` para el arte generado. Nunca promover escenas generadas de forma automática.
- Preservar los ID de referencia visual a través de las ramas y la exportación de metadata JSONL, advertir sobre recursos de destino ausentes, e incluir los recursos en la copia de seguridad y la restauración del perfil.
- Probar que los prompts de historia y la Conversation conectada no reciben ni los ID de imagen de ubicación, ni los bytes, ni las rutas, ni las notas exclusivas de imagen.

Condición de salida: un creador puede establecer un lugar visualmente, generar varias escenas que reutilicen su identidad revisada, ver exactamente qué referencias visuales se enviaron, y eliminar o reemplazar esas referencias sin cambiar la verdad espacial ni la de trasfondo.

### Fase 2D: manifiestos de referencias visuales del Storyboard

- Agregar un adaptador de Storyboard posterior alrededor del resolvedor visual de la Fase 2C en lugar de acoplar la persistencia espacial al Storyboard.
- Resolver el snapshot espacial del mensaje y swipe de origen, luego congelar la ubicación y el banco de referencias de entidades más las cargas del proveedor por fotograma clave.
- Reutilizar la ubicación principal exacta entre fotogramas clave cuando la capacidad lo permita, seleccionando las referencias de personaje y persona de la lista de personajes visibles de cada fotograma.
- Persistir la identidad del proveedor, la capacidad de referencias, las selecciones ordenadas y los motivos de omisión para que la regeneración sea reproducible.
- Agregar estados en línea `Visual sources`, `Review references` y `Refresh references` explícito a la vista previa y regeneración del Storyboard.
- Rechazar la reselección silenciosa cuando falta una imagen o la capacidad del proveedor se reduce. No rellenar automáticamente la capacidad recién disponible.
- Preservar el manifiesto a través del ciclo de vida existente del Storyboard y probar que el paso de imagen a video del fotograma clave sigue usando solo el fotograma clave renderizado como su entrada de primer fotograma.

Condición de salida: cada fotograma clave del Storyboard puede explicar y reproducir sus entradas visuales, los fotogramas repetidos comparten la identidad histórica de lugar correcta, y las limitaciones del proveedor nunca cambian en silencio la ubicación ni las personas representadas.

### Fase 3: Conversation conectada

- Resolver el estado propietario más reciente a través de `connectedChatId` en el momento de la generación.
- Agregar una proyección acotada de solo lectura.
- Usar una redacción conservadora de presencia.
- Excluir los ID y el contenido del trasfondo adjunto a la ubicación, los ID y la metadata de referencia visual, las rutas de imagen y los bytes de imagen, incluso cuando la generación del modo propietario los use.
- Cubrir los controles negativos de desvincular, revincular, propietario eliminado, enlaces malformados, historias concluidas y trasfondo de ubicación.

### Fase 4: movimiento solicitado por el modelo

- Agregar una solicitud tipada `change_location` para los modos propietarios.
- Aplicar la misma validación de revisión, alcanzabilidad e idempotencia.
- Registrar las solicitudes aceptadas y rechazadas en los diagnósticos de depuración.
- La Conversation sigue sin poder solicitar transiciones.

### Fase 5: plantillas del creador

- Guardar e importar subárboles de ubicaciones reutilizables o mapas completos.
- Permitir a los creadores entregar mapas iniciales con personajes una vez especificados el comportamiento de propiedad y de fusión.
- Preservar las referencias internas generando ID nuevos al copiar a otro chat.

## Plano de implementación del repositorio

Línea base de planificación: `hierarchical-locations` tras fusionar `staging` en `4fd752ea` el 2026-07-13. En esta línea base la rama contiene solo los documentos de planificación V1, V2 y V3. Aún no existe código de tiempo de ejecución de Spatial Context.

### Restricciones de integración confirmadas

| Preocupación | Comportamiento actual del repositorio | Consecuencia de la implementación |
| --- | --- | --- |
| Almacenamiento de definición | La metadata del chat es JSON y las actualizaciones genéricas de metadata son fusiones parciales. | Las definiciones espaciales permanecen en `chat.metadata.spatialContext`, pero usan un endpoint validado dedicado en lugar de la ruta genérica de parche de metadata. |
| Historial en tiempo de ejecución | `game_state_snapshots` es el único historial de estado del mundo direccionable por mensaje y swipe. | Agregar una tabla de snapshots espaciales neutral respecto al modo. No agregar columnas de Spatial Context a los snapshots exclusivos de Game. |
| Inicio de turno del propietario | `/api/generate` confirma el estado visible de Game, crea el mensaje del usuario, y luego actualiza los adjuntos y los datos de persona en llamadas separadas. | Agregar un servicio pequeño de turno del propietario ligado a una transacción para que la creación del mensaje del usuario y un movimiento espacial aceptado tengan éxito o fallen juntos. Mantener las llamadas al proveedor fuera de la transacción. |
| Swipes y ramas | La eliminación de swipe desplaza los índices de los snapshots de Game. La creación de ramas copia todos los snapshots de Game y de turno de juego a nuevos ID de mensaje. | Los snapshots espaciales deben participar en ambas rutas y deben copiar el snapshot vigente en un punto de ramificación anterior. |
| Ensamblado del prompt | La generación en vivo, la simulación, el Peek Prompt en vivo, el Peek Prompt en caché y los prompts del GM de Game tienen rutas de ensamblado distintas. | Resolver los datos espaciales estructurados una sola vez, luego llamar a un formateador/inyector compartido desde cada ruta en vivo. El Peek Prompt en caché sigue leyendo la solicitud exacta guardada del proveedor. |
| Datos del cliente | Los datos del servidor usan React Query. Los borradores de entrada por chat sobreviven a la navegación y la recarga. Los editores pesados se cargan de forma diferida a través de `AppShell`. | Agregar un hook dedicado de query/mutation, persistir las transiciones pendientes junto a los borradores por chat, y enrutar un Location Editor diferido a través del modelo de vista de detalle existente. |
| Viaje en Game | Los mapas de Game ya tienen posiciones de cuadrícula y de nodo más un movimiento de mapa pendiente que se convierte en texto visible `*moves to ...*`. | Agregar vínculos opcionales por ID estable. Los destinos vinculados usan solicitudes espaciales estructuradas sin prosa visible; el movimiento no vinculado mantiene el flujo táctico existente. |
| Almacenamiento | Los snapshots nativos de archivo son el único backend de persistencia. Se usan transacciones pequeñas, mientras que se evitan los bucles de transacciones grandes para mantener las escrituras ágiles. | Mantener la transacción de turno del propietario de tamaño constante y probarla contra el almacenamiento nativo de archivo antes de expandir la función. |
| Procesamiento de lorebook | La activación de lorebook ya admite ID de chat explícitos, coincidencia por palabra clave y semántica, macros, recursión, orden y marcadores de prompt. La configuración inicial de Game escanea sin mensajes de chat, así que las entradas ordinarias por palabra clave no fundamentan directamente el borrador de mapa posterior. | Agregar candidatos forzados de ubicación actual al procesador de lorebook compartido y dar al borrador de mapa una ruta de catálogo de fuentes explícita y acotada. No inferir el canon del mapa solo a partir del resumen del mundo. |
| Coherencia de imagen | Los perfiles de estilo de imagen controlan el estilo del prompt, los avatares de personaje y persona ya se pueden enviar como referencias, y los proveedores aceptan distintos recuentos máximos de referencia. Las galerías almacenan los ID de imagen estables por separado de las rutas de archivo. | Mantener la identidad del lugar separada del estilo global y de la identidad del personaje. Resolver el snapshot espacial aplicable, adjuntar imágenes estables de galería solo a las solicitudes de arte de escena elegibles, y recortar los candidatos de forma determinista a través de los adaptadores de proveedor existentes. |
| Referencias del Storyboard | El Storyboard ya planifica los personajes visibles por fotograma clave, resuelve los límites de referencia específicos del proveedor, envía imágenes de personaje a través de la vista previa y el renderizado, almacena su mensaje y swipe de origen, y usa cada fotograma clave renderizado como el primer fotograma del video. | Agregar un manifiesto congelado de referencias visuales que resuelva la ubicación histórica una sola vez, varíe los personajes por fotograma clave, y preserve las selecciones ordenadas a través de la regeneración. Mantener sin cambios la entrada de imagen a video. |

### Mapa de módulos objetivo

Módulos compartidos nuevos:

- `packages/shared/src/types/spatial-context.ts`: tipos públicos de definición, snapshot, transición, proyección, respuesta, advertencia y código de error.
- `packages/shared/src/schemas/spatial-context.schema.ts`: esquemas de Zod y todos los límites de almacenamiento/solicitud.
- `packages/shared/src/utils/spatial-context.ts`: indexación pura del grafo, validación, ruta de navegación, alcanzabilidad, comprobaciones de archivado y orden determinista de destinos.
- `packages/shared/src/index.ts`: exportaciones explícitas del nuevo contrato compartido.

Módulos de servidor nuevos:

- `packages/server/src/db/schema/spatial-context.ts`: esquema de `spatial_context_snapshots`.
- `packages/server/src/services/storage/spatial-context.storage.ts`: lecturas, escrituras, copias de rama, desplazamientos de swipe, búsqueda de comando y limpieza de snapshots.
- `packages/server/src/services/spatial-context/state-resolution.ts`: resolución de snapshot vigente para el arranque, swipe visible, regeneración, ramificación y puntos de control.
- `packages/server/src/services/spatial-context/projection.ts`: proyecciones estructuradas del propietario y conectadas más el formateo de texto acotado.
- `packages/server/src/services/spatial-context/visual-reference-resolution.ts`: selección visual de ubicación consciente del snapshot, herencia, candidatos del proveedor y diagnósticos seguros.
- `packages/server/src/services/spatial-context/storyboard-reference-manifest.ts`: bancos congelados de Storyboard, selección de carga por fotograma clave, revisión de capacidad del proveedor, actualización y serialización segura.
- `packages/server/src/services/spatial-context/owner-turn.ts`: validación y movimiento atómico de tamaño constante más la confirmación del mensaje del usuario.
- `packages/server/src/services/spatial-context/game-map-binding.ts`: proyección autoritativa de la ruta de navegación más la resolución de vínculos explícitos de mapa, celda y nodo de Game.
- `packages/server/src/routes/spatial-context.routes.ts`: rutas GET dedicada y PUT con revisión.

Módulos de cliente nuevos:

- `packages/client/src/hooks/use-spatial-context.ts`: claves de query, GET, PUT de definición, manejo de conflictos e invalidación de caché.
- `packages/client/src/features/spatial-context/SpatialContextSettingsSection.tsx`: resumen compacto de **Chat Settings** y acción del editor.
- `packages/client/src/features/spatial-context/SpatialMapWorkspace.tsx`: cáscara del editor de página completa cargada de forma diferida.
- `packages/client/src/features/spatial-context/components/HierarchyNavigator.tsx`: navegación de la jerarquía e interacciones de teclado.
- `packages/client/src/features/spatial-context/components/LocalMapCanvas.tsx`: mapa posicionado de ubicaciones hijas.
- `packages/client/src/features/spatial-context/components/LayerSelector.tsx`: capas ordenadas de piso, torre y mazmorra.
- `packages/client/src/features/spatial-context/components/LocationInspector.tsx`: edición de campos, vista previa, enlaces, controles de archivado y validación en línea.
- `packages/client/src/features/spatial-context/components/SpatialContextRuntimeBar.tsx`: ruta de navegación, selector de destinos, estado pendiente y acción de limpiar.
- `packages/client/src/features/spatial-context/lib/editor-state.ts`: operaciones sobre la copia de trabajo y mapeo de errores del servidor. Esto permanece local del cliente y no se exporta a través de un barrel.

Archivos de integración existentes que se espera que cambien:

- Persistencia: `packages/server/src/db/migrate.ts`, `packages/server/src/db/schema/index.ts`, `packages/server/src/db/file-backed-store.ts`, `packages/server/src/services/storage/chats.storage.ts`, y `packages/server/src/routes/backup.routes.ts` donde lo requiera el registro de la tabla.
- Ciclo de vida del chat: `packages/server/src/routes/chats.routes.ts`, `packages/server/src/routes/generate.routes.ts`, y `packages/shared/src/schemas/chat.schema.ts`.
- Rutas de prompt: `packages/server/src/routes/generate/dry-run-route.ts`, `packages/server/src/services/generation/game-gm-prompt-runtime.ts`, y la parte de vista previa en vivo de `packages/server/src/routes/chats.routes.ts`.
- Fundamentación y activación de lorebook: `packages/server/src/services/lorebook/`, `packages/server/src/routes/spatial-context.routes.ts`, `packages/client/src/features/spatial-context/components/LocationInspector.tsx`, el editor de lorebook, y la interfaz de Active Context.
- Arte de referencia de ubicación: `packages/server/src/db/schema/gallery.ts`, el almacenamiento y las rutas de galería, `packages/server/src/services/image/`, `packages/server/src/routes/generate/illustrator-references.ts`, la ilustración de Game y el ensamblado del Storyboard en `packages/server/src/routes/game.routes.ts`, `packages/server/src/services/storage/game-storyboards.storage.ts`, los contratos compartidos de prompt del Storyboard, `packages/client/src/features/spatial-context/components/LocationInspector.tsx`, y las interfaces de generación de imágenes y de vista previa del Storyboard.
- Enrutamiento del cliente y rutas de envío: `packages/client/src/stores/ui.store.ts`, `packages/client/src/stores/chat.store.ts`, `packages/client/src/components/layout/AppShell.tsx`, `packages/client/src/components/chat/ChatSettingsDrawer.tsx`, `packages/client/src/components/chat/ChatArea.tsx`, `packages/client/src/components/chat/ChatRoleplaySurface.tsx`, `packages/client/src/components/chat/ChatInput.tsx`, `packages/client/src/components/game/GameSurface.tsx`, y `packages/client/src/components/game/GameInput.tsx`.
- Portabilidad y prueba: el código nativo de importación/exportación de chat en `packages/server/src/routes/chats.routes.ts` y `packages/server/src/services/import/`, `scripts/regressions/`, `e2e/core-flows.e2e.ts`, y los scripts de `package.json` raíz.

La lista de archivos es un límite, no un requisito de editar cada archivo en una sola pull request. Cada paquete de trabajo a continuación debería mantener su diff enfocado.

### Contrato de persistencia

Las definiciones permanecen dentro de la metadata del chat y se copian automáticamente cuando una rama copia la metadata del chat. El estado en tiempo de ejecución usa una tabla separada:

```ts
interface SpatialContextSnapshotRow {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  source: "bootstrap" | "owner_turn" | "assistant_swipe" | "definition_repair" | "branch_copy";
  transitionCommandId: string | null;
  transitionPayloadHash: string | null;
  createdAt: string;
}
```

Índices e invariantes requeridos:

- Una fila vigente por `(chatId, messageId, swipeIndex)`.
- Un ID de comando de transición es único dentro de su chat cuando no es nulo.
- Un ID de comando repetido con distinto destino, revisión esperada o ubicación actual esperada devuelve `409 spatial_transition_command_mismatch`.
- Un ID de comando repetido con la misma carga devuelve `409 spatial_transition_already_applied`, incluye el snapshot confirmado y el ID del mensaje del usuario, y no realiza una segunda escritura. El cliente reconcilia a partir de la respuesta en lugar de reenviar el turno.
- Las filas de snapshot usan ID de ubicación estables. Los cambios de nombre y de padre no reescriben los snapshots.
- Una fila de arranque usa `messageId: ""` y swipe `0` hasta que exista un anclaje de mensaje confirmado.
- Eliminar un chat, mensaje o swipe elimina o desplaza las filas espaciales correspondientes en los mismos lugares que actualmente mantienen los snapshots de Game y de turno de juego.

La nueva tabla debe registrarse en las definiciones de tabla de archivo, la lista de tablas nativas de archivo, el grafo de cascada, la copia de seguridad/restauración del perfil y la metadata de integridad de la Mari DB. El comportamiento de búsqueda debe estar cubierto por regresiones nativas de archivo.

### Reglas de estado vigente e historial

Usa un resolvedor para las API, los prompts, la ramificación y la respuesta del cliente:

1. Si se solicita un mensaje y swipe específicos, devuelve ese snapshot espacial.
2. Para la vista actual, inspecciona el mensaje visible más reciente del asistente y su swipe activo.
3. Si ese swipe del asistente no tiene fila, retrocede al snapshot de turno de usuario o de asistente más cercano en el orden de mensajes visibles.
4. Recurre a la fila de arranque.
5. Si no existe ningún snapshot y la definición activada tiene una ubicación inicial válida, devuelve un estado inicial en memoria y materialízalo en el primer turno del propietario.

Anclaje del turno del propietario:

- Antes de la persistencia, resuelve el estado de origen a partir del historial actualmente visible, no de la fila más reciente solo por marca de tiempo.
- En la transacción atómica del turno, crea el mensaje del usuario, el swipe inicial, las marcas de tiempo del chat y un snapshot espacial `owner_turn` anclado a ese mensaje del usuario.
- Después de que se guarde una respuesta del asistente, materializa el mismo estado en su `(messageId, swipeIndex)` como `assistant_swipe`.
- Una llamada al proveedor fallida o abortada deja confirmados el turno de usuario aceptado y su snapshot espacial. Por lo tanto, la recarga muestra el movimiento y el mensaje del usuario guardado, sin inventar una respuesta del asistente.
- La regeneración resuelve el estado inmediatamente antes del mensaje objetivo del asistente y escribe ese estado en el nuevo swipe. La continuación retiene el estado del swipe objetivo.
- Seleccionar un swipe cambia el estado vigente a través de la fila de swipe activo existente. No reescribe otros snapshots.
- La creación de una rama copia la definición, vuelve a asignar la clave de cada snapshot espacial copiado a los nuevos ID de mensaje, e incluye la fila de arranque. Una rama en un mensaje anterior deja de copiar en el corte seleccionado.
- Los puntos de control de Game almacenan el ID del snapshot espacial aplicable o una copia estable de su ubicación actual y revisión de definición. Cargar un punto de control restaura tanto el estado de Game como el estado espacial.

La edición de definiciones no es histórica. Un cambio de nombre o de padre cambia la ruta de navegación renderizada para snapshots antiguos porque el ID de ubicación estable se resuelve contra la definición actual de la rama. Un snapshot antiguo puede referirse a una ubicación archivada; sigue siendo legible, pero el siguiente destino debe ser un nodo activo y alcanzable. Si un editor archiva la ubicación actualmente vigente, se requiere `replacementCurrentLocationId` y el servidor escribe un snapshot `definition_repair` en el anclaje visible actual en la misma transacción que la nueva revisión de definición.

### Secuencia atómica del turno del propietario

Extiende `generateRequestSchema` y el contrato de generación del cliente con `pendingSpatialTransition` opcional. Solo se acepta para chats propietarios de Roleplay y Game.

La secuencia del servidor es:

1. Adquirir el bloqueo de generación por chat existente.
2. Analizar la solicitud y cargar el chat dentro del ciclo de vida de la solicitud.
3. Si no hay transición espacial, preservar el flujo de mensajes actual.
4. Si existe una transición, iniciar una transacción de base de datos de tamaño constante.
5. Volver a leer la definición y el estado visible dentro de la transacción.
6. Validar el modo propietario, el estado activado, la revisión de definición esperada, la ubicación actual esperada, el ID de comando, el estado del destino y la alcanzabilidad.
7. Crear el mensaje del usuario y el swipe inicial a través de una instancia de almacenamiento de chat ligada a la transacción.
8. Insertar el snapshot espacial y actualizar las marcas de tiempo del chat.
9. Para Game, confirmar el snapshot visible de Game en la misma transacción donde sea práctico.
10. Confirmar, luego continuar el enriquecimiento de adjuntos, la toma de snapshot de persona, el ensamblado del prompt y el trabajo del proveedor fuera de la transacción.

Los fallos de validación ocurren antes de que el estado optimista del cliente se trate como autoritativo. Un error de grafo o destino `400` y un error de estado obsoleto `409` contienen códigos de máquina estables, texto seguro de cara al usuario, la revisión actual y la ruta de navegación actual. Nunca incluyen nombres de destino ocultos o bloqueados.

El cliente retiene el texto enviado, los adjuntos y el destino pendiente hasta que el servidor acepta el turno. Ante un conflicto, elimina el mensaje optimista, actualiza la query de Spatial Context, restaura el borrador y ofrece `Review destinations`. Ante la aceptación, limpia los tres juntos.

### Contrato de proyección compartido

El resolvedor devuelve datos estructurados antes de que se produzca cualquier texto de prompt:

```ts
interface ResolvedOwnerSpatialProjection {
  kind: "owner";
  chatId: string;
  ownerMode: SpatialOwnerMode;
  definitionRevision: number;
  currentLocationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  description: string;
  modelMemory: string | null;
  lorebookEntryIds: string[];
  destinations: Array<{ id: string; name: string; label?: string }>;
  omittedDestinationCount: number;
}

interface ResolvedLocationVisualProjection {
  chatId: string;
  messageId: string | null;
  swipeIndex: number | null;
  locationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  visualIdentity: string | null;
  references: Array<{
    imageId: string;
    role: LocationVisualReferenceRole;
    usageNote: string | null;
    sourceLocationId: string;
    inherited: boolean;
  }>;
}

interface StoryboardVisualReferenceCandidate {
  imageId: string;
  source: "explicit" | "location" | "character" | "persona" | "inherited_style";
  entityId?: string;
  label: string;
  role: string;
  order: number;
}

interface StoryboardKeyframeReferencePayload {
  keyframeIndex: number;
  imageIds: string[];
  omitted: Array<{
    imageId: string;
    reason: "provider_limit" | "not_visible" | "missing" | "setting_disabled";
  }>;
}

interface StoryboardVisualReferenceManifest {
  sourceMessageId: string;
  sourceSwipeIndex: number;
  locationId: string | null;
  definitionRevision: number | null;
  provider: string;
  model: string;
  providerReferenceLimit: number;
  status: "ready" | "needs_review";
  candidates: StoryboardVisualReferenceCandidate[];
  keyframes: StoryboardKeyframeReferencePayload[];
  createdAt: string;
}
```

Los límites del prompt son separados de los límites de almacenamiento:

- Como máximo 20 nodos de ruta de navegación.
- Como máximo 4.000 caracteres de descripción del propietario.
- Como máximo 8.000 caracteres de memoria privada del modelo.
- Como máximo 50 destinos en orden determinista de `sortOrder`, nombre y luego ID, seguidos solo de un recuento de omitidos.
- Como máximo 50 referencias de lorebook de la ubicación actual antes de que el procesador de lorebook aplique los presupuestos de entrada y de tokens.
- Como máximo 6 referencias visuales almacenadas por ubicación y como máximo 2 candidatos de referencia de ubicación para una solicitud de escena ordinaria antes del límite total de referencias del proveedor.
- Un manifiesto de Storyboard puede retener todos los ID de candidato resueltos para auditoría y actualización, pero cada carga de fotograma clave está topada por el límite del proveedor capturado cuando se crea el manifiesto.
- Como máximo 1.000 caracteres para un `awarenessSummary` conectado o un extracto de respaldo de la descripción pública.

Un formateador produce el bloque estructurado compartido del propietario. Roleplay y Game usan adaptadores finos alrededor de ese bloque. El formateador nunca serializa `lorebookEntryIds`; el pipeline del prompt del propietario los consume a través del procesador de lorebook. Un segundo formateador, introducido solo en la Fase 3, produce el bloque de Conversation con privacidad reducida y no recibe ningún campo de trasfondo de ubicación.

Cada ruta en vivo llama al mismo resolvedor y formateador inmediatamente antes de la preparación final de la solicitud al modelo:

- Generación estándar de Roleplay.
- Generación del GM de Game.
- `/api/generate/dryRun`.
- Ensamblado en vivo de Peek Prompt cuando no existe una solicitud guardada exacta.
- Rutas de reintento y continuación que reconstruyen un prompt.

El Peek Prompt exacto en caché no necesita ensamblado nuevo. Muestra la solicitud del proveedor ya guardada, que debe contener el bloque espacial usado para ese swipe. La cobertura de regresión debe comparar bloques espaciales normalizados entre la generación en vivo, la simulación y el Peek Prompt en vivo para el mismo fixture.

### Contrato de borrador fundamentado en lorebooks

La fundamentación del mapa es una entrada de autoría explícita:

```ts
interface SpatialMapGroundingRequest {
  mode: "setup_only" | "lore_strict" | "lore_expand";
  lorebookIds: string[];
  entryIds?: string[];
}
```

La configuración de Game toma los `lorebookIds` predeterminados de `GameSetupConfig.activeLorebookIds`. Roleplay los toma de los libros globales, enlazados y fijados activos del chat. El creador puede cambiar la selección antes de la generación. Los libros y entradas desactivados o excluidos explícitamente nunca se envían.

Esto no es un escaneo de activación de lorebook. El servidor lee las fuentes seleccionadas directamente, resuelve los macros admitidos contra el contexto de configuración del propietario sin persistir el texto resuelto, y construye un catálogo que contiene:

- Clave de fuente temporal
- Nombres de entrada y de lorebook
- Claves de activación y etiquetas
- Descripción de la entrada cuando esté presente
- De lo contrario, un extracto acotado del contenido

El catálogo está limitado por el menor de 100 entradas, 16.000 caracteres, y el contexto de conexión restante tras reservar el espacio de configuración, de sistema y de salida solicitada. La prioridad es determinista:

1. `entryIds` seleccionados explícitamente.
2. Entradas con etiquetas, nombres o claves de tipo ubicación.
3. Entradas con descripciones escritas por el autor.
4. Entradas restantes en orden estable de lorebook y de entrada.

Si se omiten entradas, la vista previa informa del recuento y ofrece `Refine sources`. Nunca implica que se consideró el lorebook completo.

El plan de modelo simplificado agrega claves de fuente temporales a cada ubicación propuesta. El servidor rechaza las claves desconocidas, mapea las claves válidas a ID de entrada estables, elimina duplicados, y calcula la procedencia de la vista previa:

- `Lore-backed`: al menos una entrada de origen validada.
- `Inferred`: una relación o contenedor derivado del material de origen pero no representado como su propia entrada de origen.
- `Added by AI`: ninguna entrada de origen respalda el nodo.

`lore_strict` rechaza cada nodo sin una clave de fuente validada. `lore_expand` acepta los nodos inferidos y añadidos pero los etiqueta de forma visible. Una clave de fuente válida prueba la procedencia, no la fidelidad semántica; la vista previa debe mostrar los extractos de origen para que el creador pueda detectar una relación o un nombre mal interpretados antes de `Apply`.

El endpoint de generación devuelve la definición de borrador normalizada más un mapa de procedencia transitorio indexado por ID de ubicación generada. Solo `lorebookEntryIds` persisten tras `Save`. Reemplazar y expandir retienen las protecciones de historial existentes; la expansión puede agregar vínculos a nodos nuevos pero no puede reescribir ubicaciones ni vínculos existentes.

### Límite de compatibilidad con Game

Cuando el Spatial Context está activado para un chat de Game:

- `SpatialContextSnapshot.currentLocationId` es autoritativo.
- El `location` del estado de Game es solo una proyección de compatibilidad.
- Las respuestas GET del estado de Game y la interfaz del tracker reciben la ruta de navegación resuelta como la ubicación mostrada.
- Los parches del agente World State y los parches manuales del tracker de Game no pueden escribir `location` de forma independiente; el servidor descarta ese campo con un diagnóstico de depuración o devuelve un conflicto a nivel de campo para ediciones manuales explícitas.
- Los nuevos snapshots de Game reflejan la ruta de navegación en su valor heredado `location` para que el historial de sesión y la interfaz existente sigan siendo legibles, pero el código del prompt aún lee la proyección espacial.
- Un mapa, celda de cuadrícula o nodo de Game puede vincularse explícitamente a un ID de ubicación estable de la jerarquía.
- Seleccionar un destino vinculado crea una transición espacial pendiente estructurada y no inserta prosa de movimiento.
- El movimiento de celda y nodo no vinculado sigue siendo táctico y cambia solo la posición del grupo.
- Entrar en una ubicación vinculada selecciona su mapa local cuando está disponible; salir selecciona el mapa ancestro vinculado más cercano cuando está disponible.
- La interfaz etiqueta los sistemas de forma distinta como `Story location` y `Map position` cuando ambos son visibles.
- Desactivar el Spatial Context restaura de inmediato el comportamiento de ubicación heredado actual de Game sin eliminar las definiciones ni los snapshots espaciales.

Los controles negativos deben probar que un parche de ubicación de Game emitido por el modelo, una edición manual del tracker y un clic en un mapa no vinculado no pueden cambiar `currentLocationId`. Los controles positivos prueban que un clic vinculado válido usa el validador de transición normal.

### Contrato de interfaz del propietario

**Chat Settings** agrega una sección compacta `Hierarchical Map` solo para Roleplay y Game. Muestra el estado activado, la ruta de navegación actual, los recuentos activos y archivados, el recuento de advertencias, y `Open Map Editor`. No incrusta el editor completo en el panel lateral.

El Location Editor sigue la ruta de editor de página completa existente:

- El escritorio usa un navegador de jerarquía, una vista de mapa local o de capas, y un inspector de la ubicación seleccionada.
- El móvil muestra la jerarquía primero y los detalles después, con una acción visible `Back to locations`. Ninguna operación depende de pasar el cursor ni de arrastrar.
- Las filas exponen acciones de agregar hijo, agregar hermano, reasignar padre, duplicar subárbol, archivar y enlazar mediante controles etiquetados.
- La vista local renderiza los hijos como nodos de mapa posicionados, capas ordenadas o una lista accesible.
- La selección previsualiza una ubicación; una acción `Enter` distinta navega hasta ella.
- El inspector contiene el nombre, el tipo, la descripción pública, la memoria privada del modelo, el icono, la presentación, la colocación o el orden de capa, el estado, el padre, los enlaces directos y el trasfondo enlazado.
- La identidad visual es una sección en línea del inspector, no una ventana bloqueante. Muestra la vista previa principal primero, luego las referencias de apoyo, el rol, la nota de uso, el estado de herencia, el estado roto y la metadata de la fuente de imagen.
- La selección de galería y la subida reutilizan los controles de imagen existentes. `Generate establishing reference` abre una vista previa; aceptar la imagen y establecerla como principal son acciones explícitas.
- Una escena generada ofrece `Set as location reference` desde sus acciones de imagen existentes. Nunca muta la ubicación solo porque la escena se generó allí.
- El trasfondo enlazado usa una divulgación en línea con búsqueda en lugar de una ventana bloqueante. Los resultados agrupan las entradas por lorebook y exponen el estado desactivado o excluido antes de adjuntar.
- Las filas adjuntas ofrecen `Open entry` y `Detach`. Desvincular nunca elimina el trasfondo, y duplicar el subárbol copia los vínculos.
- El editor de lorebook muestra los enlaces de retorno del mapa del chat actual para que un creador pueda encontrar cada ubicación que usa una entrada.
- Los controles del borrador por IA muestran los libros de origen, el modo de fundamentación, los recuentos de entradas consideradas y omitidas, y la procedencia sin requerir conocimiento técnico del prompt.
- La validación es en línea y también se resume cerca de `Save`. Seleccionar un elemento del resumen enfoca el nodo y el campo afectados.
- El editor usa una copia de trabajo local y una única acción `Save` con revisión. `editorDirty` protege la navegación. Los conflictos del servidor preservan la copia de trabajo y ofrecen `Reload server version` o `Review differences`; no hay sobrescritura a ciegas.
- El estado vacío enseña la primera acción: `Create a starting location`. La activación no está disponible hasta que exista una ubicación inicial activa válida.
- La carga usa el vocabulario de esqueleto del editor existente. Los estados de guardado, conflicto, archivado, oculto, bloqueado e inválido usan texto o iconos además de color.

Las superficies de chat del propietario comparten `SpatialContextRuntimeBar`:

- La ruta de navegación persistida es visible encima o junto a la entrada sin cubrir el contenido de la historia.
- El selector de destinos lista el padre, los hijos y los enlaces directos en grupos etiquetados preservando el orden determinista.
- Seleccionar un destino crea un chip pendiente claramente etiquetado. No mueve el estado de inmediato.
- El chip se puede limpiar y sobrevive al cambio de chat o a la recarga junto con el borrador de texto.
- El envío puede contener texto, adjuntos o solo un destino pendiente. La transición es dato de solicitud y no se anexa al texto visible del mensaje.
- Un destino pendiente obsoleto permanece visible tras un conflicto, marcado como `Needs review`, hasta que el usuario selecciona un reemplazo válido o lo limpia.
- En pantallas estrechas la ruta de navegación se trunca por el medio, retiene el nombre de la ubicación actual, y expone la ruta completa a través de una divulgación accesible.

El editor y los controles de tiempo de ejecución usan los tokens semánticos de tema existentes, admiten los temas oscuro, claro y de SillyTavern, mantienen objetivos táctiles de 44px para las acciones móviles principales, e incluyen estados de foco visibles. El movimiento se limita a transiciones de estado de 150 a 250 ms y nunca mueve la disposición solo por decoración.

### Cobertura de portabilidad y ciclo de vida

La exportación de chat nativa de Marinara debe llevar:

- La definición actual en `marinara_metadata`.
- Los snapshots espaciales indexados por el ordinal del mensaje exportado y el índice de swipe, no por nombres para mostrar.
- El snapshot de arranque cuando esté presente.

La importación crea nuevos ID de chat, mensaje y snapshot preservando los ID de ubicación dentro de la definición. Los grafos importados malformados desactivan el Spatial Context, preservan la definición en bruto para reparación, y devuelven advertencias. Nunca se emparejan por nombre en silencio ni se activan parcialmente.

La exportación JSONL de chat preserva los ID de ubicación a entrada porque son parte de la definición, pero no empaqueta contenido de lorebook en silencio. La importación resuelve las referencias contra el perfil de destino e informa de las entradas ausentes como advertencias reparables sin coincidencia por nombre. La copia de seguridad y la restauración del perfil preservan las referencias funcionales porque llevan tanto las definiciones espaciales como las tablas de lorebook. Un futuro paquete de campaña explícito puede empaquetar los lorebooks referenciados para la portabilidad entre perfiles.

El JSONL de chat también preserva los ID de ubicación a imagen, los roles, las notas de uso y el orden, pero no incrusta bytes de imagen. La importación resuelve esos ID contra el perfil de destino e informa de las imágenes ausentes como advertencias reparables sin coincidencia de ruta ni de nombre de archivo. La copia de seguridad y la restauración del perfil incluyen los registros y archivos de la galería del perfil. Un futuro paquete de campaña explícito puede ofrecer `Include location images`, con un recuento de recursos, el tamaño total y un recordatorio de licencia antes de la exportación.

Cuando el ciclo de vida existente del Storyboard se exporta o copia, su manifiesto visual preserva el ordinal del mensaje de origen y el swipe, el ID de ubicación resuelta, los ID de imagen candidatos y el orden de fotogramas clave sin incrustar bytes. La importación reasigna los ID de mensaje y de storyboard, resuelve los ID de imagen de galería en el perfil de destino, y marca los recursos ausentes como `needs_review`. Los storyboards heredados sin manifiesto resuelven uno a partir de su mensaje y swipe de origen guardados en la primera regeneración; nunca recurren a la coincidencia por nombre ni a la ubicación más reciente del chat.

La copia de seguridad y la restauración del perfil incluyen la tabla nueva a través de `FILE_BACKED_TABLES`. La eliminación de chat, la eliminación masiva, la purga, la eliminación de rama, la eliminación de swipe y la eliminación de mensaje siguen las rutas existentes de cascada y de limpieza de la aplicación. Los chats existentes no necesitan migración con avidez porque la metadata ausente significa Spatial Context desactivado.

### Paquetes de trabajo y orden de fusión

#### Paquete A: contrato del núcleo y spike de prueba

- Agregar tipos, esquemas, ayudantes puros del grafo, límites, fixtures y códigos de error estables compartidos.
- Agregar un arnés de prueba temporal para transacciones de tamaño constante contra el almacenamiento nativo de archivo. No conservar archivos `.test.ts`.
- Probar el resolvedor de estado con fixtures de arranque, swipe visible, punto de ramificación anterior, ubicación actual histórica archivada y definición obsoleta.
- Medir los tamaños de proyección para grafos poco profundos, de profundidad 20, anchos de 500, de texto largo y enlazados.

Compuerta: la semántica del grafo, los límites de proyección, los anclajes de snapshot y la viabilidad de la transacción se demuestran antes de que empiece el trabajo de interfaz.

#### Paquete B: API de definición y almacenamiento

- Agregar esquema, migración, registro nativo de archivo, adaptador de almacenamiento, GET, y PUT con revisión.
- Agregar reemplazo de ubicación actual para las operaciones de archivado.
- Conectar la eliminación, el desplazamiento de swipe y la copia de seguridad/restauración del perfil.
- Agregar cobertura de regresión del servidor para conflictos de revisión, grafos inválidos, errores ocultos y reutilización de comandos.

Compuerta: las definiciones y los snapshots hacen round-trip en ambos backends de almacenamiento y las escrituras inválidas no dejan estado parcial.

#### Paquete C: integración del historial del turno del propietario

- Extender la solicitud de generación con `pendingSpatialTransition`.
- Agregar la persistencia atómica del turno del propietario y la materialización del swipe del asistente.
- Integrar la regeneración, la continuación, los swipes activos, las ramas y los puntos de control de Game.
- Agregar la exportación/importación nativa de chat de definiciones y snapshots.

Compuerta: la recarga, el fallo del proveedor, los cambios de swipe, la ramificación en un mensaje anterior, la importación/exportación y la restauración de puntos de control resuelven la ubicación esperada.

#### Paquete D: proyección del prompt y autoridad de Game

- Agregar la proyección estructurada y los formateadores acotados.
- Integrar la generación en vivo, el GM de Game, la simulación, el Peek Prompt en vivo, los reintentos y las continuaciones.
- Hacer cumplir el límite de compatibilidad con Game y la visualización de la ruta de navegación del tracker.
- Agregar controles negativos de privacidad y de ubicación inactiva.

Compuerta: todas las rutas de prompt contienen el mismo bloque espacial, no se filtra texto de ubicación no relacionado, y Game no puede mantener una ubicación autoritativa competidora.

#### Paquete E: explorador de mapas y editor

- Agregar hooks de React Query, mapeo de conflictos, resumen de configuración, y ruta de editor diferida.
- Agregar los flujos de jerarquía, mapa local, capa, lista, vista previa, inspector y duplicar subárbol.
- Agregar estados accesibles de escritorio y móvil.
- Preservar las ediciones sin guardar a través de los conflictos de revisión.

Compuerta: los creadores pueden construir y reparar mapas anidados sin arrastrar, pasar el cursor ni entrada de precisión.

#### Paquete E.1: borrador de mapa asistido por IA

- Agregar un generador a demanda en tiempo de configuración que use el contexto de configuración acotado de Game o Roleplay, nunca una mutación implícita en tiempo de turno.
- Generar un plan de mapa simplificado con claves, luego asignar ID estables, reparar omisiones de disposición seguras, y validar la definición completa en el servidor.
- Previsualizar la jerarquía generada como un borrador local antes de reemplazar el estado del editor.
- Requerir acciones explícitas de `Apply` y `Save`; la generación nunca activa el Spatial Context ni escribe una definición por sí sola.
- Mantener el historial de conversación ordinario fuera del prompt de generación y exponer los prompts finales a través del registro de depuración.

Compuerta: un creador no técnico puede describir un mundo, recibir un mapa anidado válido, inspeccionarlo, y rechazarlo o aplicarlo sin cambiar el estado persistido hasta `Save`.

#### Paquete E.1.1: expansión de mapa por IA segura para el historial

- Tratar la creación de mapa completo por IA como un flujo de trabajo previo a la campaña. Una vez que existe un historial espacial ligado a mensajes, preservar cada ID de ubicación existente en el servidor.
- Reemplazar el generador de campaña activa con un flujo de trabajo de expansión de solo adición limitado a una ubicación activa seleccionada.
- Preservar la ubicación actual, la ubicación inicial, las descripciones existentes, los enlaces, la disposición, los nodos archivados y los futuros vínculos de Game. Asignar ID estables nuevos solo a las ubicaciones añadidas.
- Mantener la expansión basada en el contexto acotado de configuración y de la ubicación seleccionada, no en el historial de turnos ordinario.
- Previsualizar las ubicaciones nuevas como un borrador local y retener el límite existente de `Apply` y `Save`.
- Permitir el reemplazo de mapa completo solo antes de que exista historial espacial confirmado, con la expansión como valor predeterminado más seguro cuando ya hay un mapa presente.

Compuerta: la IA puede hacer crecer un mapa de campaña activa sin dejar huérfanos los snapshots de turno, cambiar la ubicación actual ni reemplazar los ID existentes.

#### Paquete E.2: opción de mapa del asistente de configuración de Game

- Agregar una opción `Draft a hierarchical world map` al paso Features existente, con una selección de tamaño sencilla.
- Ejecutar la generación de mapa solo después de que `/game/setup` persista el resumen del mundo y el arco de la historia. No se requiere un turno de juego.
- Mantener la configuración visiblemente ocupada mientras se genera el borrador de seguimiento, incluso después de aplicar una carga de configuración reparada.
- Abrir la vista previa normal por IA y el editor de mapas después de la generación. `Skip` regresa al juego, `Apply` cambia solo la copia de trabajo, y `Save` sigue siendo el límite de persistencia.
- Si la generación de mapa falla, preservar el juego creado con éxito, explicar el fallo, y dejar que el creador construya un mapa más tarde desde **Chat Settings**.
- No incrustar el editor de mapas completo en el estrecho asistente de configuración ni activar y persistir en silencio una definición generada.

Compuerta: un creador puede solicitar un mapa inicial más rico durante la configuración sin generar a partir de un estado incompleto del asistente local ni saltarse la revisión.

#### Paquete F: interfaz de tiempo de ejecución de Roleplay y Game

- Agregar la barra de tiempo de ejecución compartida y la persistencia de transición pendiente por chat.
- Integrar las rutas de envío de Roleplay y Game sin alterar el texto visible del mensaje.
- Agregar controles explícitos de vínculo de mapa, celda y nodo de Game.
- Seleccionar los mapas vinculados tras las transiciones aceptadas preservando el movimiento táctico no vinculado.

Compuerta: Roleplay y Game pueden moverse, recuperarse de un estado obsoleto, recargar, cambiar de chat, y usar la función con teclado y táctil.

#### Paquete F.1: vínculos de lorebook por ubicación y activación en tiempo de ejecución

- Extender el esquema compartido y la copia de trabajo del editor con `lorebookEntryIds` acotados.
- Agregar controles de adjunto de mapa en línea, enlaces de retorno de lorebook, y advertencias de referencia rota.
- Extender el procesamiento de lorebook compartido con ID de candidato forzados, deduplicación de fuente de activación, exclusiones, y el tope reservado de trasfondo de ubicación.
- Integrar el mismo resolvedor en las rutas de Roleplay, GM de Game, simulación y Peek Prompt en vivo.
- Agregar el informe de fuente y truncamiento de Active Context.
- Preservar los ID de referencia a través de los flujos de rama y de exportación/importación JSONL, y advertir cuando falte el trasfondo de destino.

Compuerta: moverse entre ubicaciones activa solo el trasfondo adjunto activado del destino en cada ruta de prompt del propietario, sin inyección duplicada ni fuga a la Conversation.

#### Paquete F.2: borrador de mapa fundamentado en lorebooks

- Agregar el modo de fundamentación y la selección de fuente explícita a las solicitudes de crear, reemplazar y expandir.
- Construir el catálogo de fuentes acotado a partir de los lorebooks seleccionados, no del escaneo ordinario de chat.
- Validar las claves de fuente temporales y autovincular las entradas válidas a los nodos generados.
- Mostrar la procedencia `Lore-backed`, `Inferred` y `Added by AI` con inspección de la fuente en la vista previa del borrador.
- Hacer cumplir los nodos con respaldo de fuente en `Strict canon` y las adiciones sin respaldo visibles en `Canon with expansion`.
- Preservar la expansión de solo adición segura para el historial y el límite de revisión existente de `Apply` y luego `Save`.

Compuerta: los datos de lorebook seleccionados fundamentan directamente la jerarquía generada, cada ubicación sin respaldo es visible antes de `Save`, y el modo estricto no puede persistir un nodo generado sin referencia.

#### Paquete F.3: identidad visual de la ubicación y referencias de arte de escena

- Agregar texto acotado de identidad visual y vínculos estables de la galería del perfil al esquema de ubicación y a la copia de trabajo del editor.
- Agregar el editor de identidad visual en línea, los roles principal y de apoyo, la herencia de estilo explícita, los enlaces de retorno de galería, y la reparación de referencia rota.
- Agregar los controles paralelos por chat de uso del proveedor del Illustrator y de Game, con consentimiento de la primera imagen principal y valores predeterminados desactivados compatibles hacia atrás.
- Agregar la generación de referencia de ambientación a demanda y la promoción explícita de escenas generadas revisadas.
- Resolver la ubicación del mensaje y swipe aplicable para las solicitudes de arte de escena del Illustrator de Roleplay y de Game.
- Combinar los candidatos explícitos, de ubicación, de personaje, de persona y de estilo heredado de forma determinista bajo el límite existente de cada proveedor, con motivos de omisión visibles.
- Preservar los ID y la metadata a través de las ramas y el JSONL, incluir los binarios en la copia de seguridad y la restauración del perfil, y agregar controles negativos de prompt de historia y de Conversation.

Compuerta: el arte repetido en una ubicación puede reutilizar una identidad de lugar revisada con compromisos deterministas y visibles frente a las referencias de personaje, el arte de mensajes históricos resuelve su ubicación histórica, y no se filtra ningún dato exclusivo de imagen a los prompts de texto.

#### Paquete F.3.1: manifiestos de referencias visuales del Storyboard

- Mantener F.3.1 como un consumidor posterior de F.3 y un cambio revisable por separado; no expande la compuerta de persistencia de F.3.
- Agregar un banco de referencias congelado y un manifiesto de carga ordenada por fotograma clave a la metadata del Storyboard.
- Anclar la resolución de ubicación al mensaje y swipe de origen del Storyboard, luego reutilizar el mismo candidato de lugar a través de sus fotogramas.
- Seleccionar las referencias de personaje y persona de la lista de personajes visibles de cada fotograma clave y nunca gastar capacidad en miembros del reparto fuera de escena.
- Aplicar las prioridades explícita, de un solo espacio, de múltiples espacios, de apoyo y de estilo heredado de forma determinista a través del resolvedor de capacidad del proveedor existente.
- Agregar `Visual sources` progresivo, motivos de omisión, conflictos de necesita revisión, y `Refresh references` explícito a la vista previa y regeneración.
- Preservar el comportamiento heredado del Storyboard cuando el Spatial Context está desactivado o no existe una referencia de ubicación elegible.

Compuerta: regenerar un fotograma clave reutiliza su carga congelada, las selecciones de ubicación y personaje son históricamente correctas e inspeccionables, y cambiar la capacidad del proveedor no puede alterar en silencio un storyboard existente.

#### Paquete G: Conversation conectada

- Implementar solo después de que los Paquetes A a F.3.1 estén estables.
- Resolver el propietario enlazado en el momento de la generación y usar el formateador de proyección reducida.
- Agregar redacción conservadora de presencia e interfaz de solo lectura.
- Probar el comportamiento de desvincular, revincular, propietario eliminado, enlaces recíprocos malformados, ciclos e historia concluida.

Compuerta: la Conversation nunca recibe la memoria privada del modelo, los ID internos, los destinos ocultos, los ID o el contenido del trasfondo adjunto a la ubicación, los ID o los contenidos de referencia visual de la ubicación, ni capacidad de mutación.

El movimiento solicitado por el modelo, las plantillas del creador, los paquetes de campaña portables, la inferencia de imagen a mapa, la generación masiva de arte de ubicación, la selección automática de referencias de personaje de múltiples vistas, y las posiciones por personaje siguen siendo paquetes posteriores separados después de que se entregue el trabajo de fundamentación del propietario, identidad visual y manifiesto del Storyboard.

### Límites de issue y pull request

Esta es una función grande bajo el flujo de trabajo del repositorio. Antes de que empiece la implementación del Paquete A:

1. Confirmar o abrir el issue único de seguimiento y hacer visible la propiedad allí.
2. Comprobar si existe una rama enlazada al issue, una pull request en borrador, o un elemento del tablero del proyecto.
3. Abrir una pull request en borrador contra `staging` en cuanto empiece la implementación.
4. Usar los paquetes de trabajo como límites de PR revisables cuando sea práctico; no combinar el MVP del propietario y la Conversation conectada solo para reducir el número de PR.

División de issues sugerida:

1. Núcleo compartido de Spatial Context, persistencia y API de definición.
2. Snapshots de turno del propietario, swipes, ramas, puntos de control y portabilidad.
3. Proyección de prompt del propietario y compatibilidad con Game.
4. Editor del propietario e interfaz de movimiento en tiempo de ejecución.
5. Vínculos de lorebook por ubicación y activación en tiempo de ejecución del propietario.
6. Borrador de mapa fundamentado en lorebooks.
7. Identidad visual de la ubicación y resolución de referencias de arte de escena.
8. Manifiestos congelados de referencias visuales del Storyboard.
9. Proyección de solo lectura de la Conversation conectada.
10. Movimiento solicitado por el modelo.

### Matriz de prueba

| Afirmación | Prueba automatizada | Prueba manual |
| --- | --- | --- |
| La activación de trasfondo de ubicación es exacta y acotada | Los fixtures cubren movimiento aceptado, movimiento pendiente y rechazado, entradas desactivadas y excluidas, fuentes de activación duplicadas, truncamiento de tokens, recarga, swipes y ramas | Moverse entre dos ubicaciones con distintos vínculos en Roleplay y Game, luego inspeccionar Active Context y Peek Prompt |
| La fundamentación en lorebooks es inspeccionable | Los fixtures de modo estricto rechazan nodos sin referencia; los fixtures de expansión preservan las claves de fuente validadas y etiquetan los nodos sin respaldo; los topes del catálogo y los recuentos de omisión son deterministas | Crear un borrador a partir de un lorebook grande existente, abrir extractos de fuente, comparar `Strict canon` y `Canon with expansion`, y rechazar una ubicación inventada |
| El arte de ubicación se mantiene coherente y acotado | Los fixtures cubren la selección de ubicación exacta, la resolución de swipe histórico, la herencia de estilo explícita, imágenes ausentes, límites de proveedor, tipos de solicitud y motivos de omisión deterministas | Establecer una referencia principal, generar varias escenas de Game y Roleplay en el mismo lugar, moverse a otro sitio, reintentar el arte en un swipe más antiguo, e inspeccionar la vista previa de fuentes visuales |
| Las referencias del Storyboard son reproducibles | Los fixtures cubren el anclaje al swipe de origen, los bancos congelados, la selección de personajes visibles, proveedores de un solo espacio y de múltiples espacios, recursos ausentes, capacidad de reemplazo menor y mayor, manifiestos heredados, y actualización explícita | Generar un storyboard de múltiples fotogramas, moverse de ubicación, cambiar un personaje y una ubicación principal, regenerar antes y después de `Refresh references`, e inspeccionar las `Visual sources` de cada fotograma |
| La validación del grafo es determinista | Script de regresión espacial dedicado con fixtures positivos y negativos | Inspeccionar los errores en línea del editor para nodos inválidos representativos |
| El movimiento y el mensaje del usuario son atómicos | Fallo de almacenamiento inyectado antes y después de cada escritura de transacción en ambos backends | Forzar una revisión obsoleta mientras un borrador y un destino están pendientes |
| El historial restaura la ubicación correcta | Regresión de snapshots que cubre recarga, swipes, regeneración, corte de rama y punto de control | Ejercitar cada flujo en Roleplay y Game |
| Las rutas de prompt coinciden | Comparar bloques normalizados del ayudante de generación, la simulación y el Peek Prompt en vivo | Inspeccionar el Peek Prompt y la salida de depuración para un chat por modo propietario |
| El contexto se mantiene acotado | Los fixtures anchos y de texto largo verifican los topes de caracteres y de destinos | Inspeccionar una jerarquía profunda y ancha en el editor y el selector de destinos |
| La privacidad se mantiene | Afirmaciones negativas para la memoria privada, los enlaces ocultos, los nodos inactivos, las descripciones no relacionadas, los ID y el contenido del trasfondo adjunto a la ubicación, y todos los campos y bytes de referencia visual de la ubicación | Enlazar un chat de Conversation e inspeccionar sus vistas previas de solicitud de texto e imagen en la Fase 3 |
| Game tiene una autoridad de ubicación | Rechazar parches heredados; validar transiciones vinculadas; preservar el movimiento no vinculado | Probar la edición del tracker, movimientos de mapa vinculados y no vinculados, carga de punto de control, activar y desactivar |
| La interfaz es resiliente | Flujo de Playwright para crear, editar, movimiento pendiente, conflicto y navegación móvil | Verificar oscuro, claro, SillyTavern, teclado, táctil, nombres largos y estados vacíos |
| La portabilidad preserva los ID y el estado | Los round-trips de exportación/importación nativa y de copia de seguridad/restauración del perfil cubren los vínculos espaciales, de trasfondo, de imagen y de manifiesto del Storyboard; el trasfondo o las imágenes de destino ausentes producen advertencias | Exportar un chat ramificado con un storyboard, importarlo con y sin sus lorebooks y recursos de galería, e inspeccionar la ruta de navegación, el historial, los vínculos, las fuentes de fotograma clave congeladas y las advertencias |

Agrega `scripts/regressions/spatial-context.regression.ts` y un script de paquete `regression:spatial`, luego inclúyelo en `pnpm regression`. No agregues archivos `.test.ts` permanentes. Cada PR de implementación aún ejecuta la regresión espacial estrecha más las comprobaciones del repositorio apropiadas a su alcance.

## Criterios de aceptación

- Una ubicación de mapa almacena referencias de entrada de lorebook, nunca contenido de trasfondo copiado.
- Una ubicación almacena metadata opcional de identidad visual y referencias estables de imagen de galería, nunca rutas en bruto, URL externas ni bytes de imagen.
- Los perfiles de estilo de imagen controlan el estilo de renderizado, las referencias de ubicación controlan la identidad del lugar, y las referencias de personaje o persona controlan la identidad del sujeto.
- Las solicitudes de arte de escena elegibles resuelven la ubicación exacta de su mensaje y swipe, incluidos los reintentos históricos, y nunca emparejan una ubicación por nombre de forma difusa.
- El arte generado se convierte en una referencia de ubicación solo tras una acción explícita del creador.
- Las referencias de disposición nunca entran en la generación de escena ordinaria de forma automática, y solo las referencias de estilo pueden heredarse a los descendientes.
- Los prompts de texto y la Conversation conectada no reciben ningún ID de referencia visual de ubicación, bytes, rutas ni notas exclusivas de imagen.
- El Storyboard resuelve la ubicación a partir de su mensaje y swipe de origen, congela su banco de referencias y las cargas de fotograma clave ordenadas, y las reutiliza durante la regeneración hasta una actualización explícita.
- Cada fotograma clave del Storyboard selecciona referencias solo para su ubicación resuelta y las personas visibles; los miembros del reparto fuera de escena nunca consumen capacidad.
- El comportamiento del proveedor de un solo espacio y de múltiples espacios es determinista y visible, y los cambios de proveedor nunca agregan, eliminan ni reemplazan en silencio las referencias congeladas.
- Los manifiestos del Storyboard almacenan ID estables y metadata, nunca bytes de imagen ni rutas del sistema de archivos.
- Los storyboards heredados sin manifiestos nunca usan la coincidencia por nombre de ubicación ni la ubicación más reciente del chat como reparación implícita.
- Solo la ubicación actual exacta aceptada fuerza la activación del trasfondo adjunto, sujeta a las reglas de desactivado, exclusión, deduplicación, orden, límite de entradas y presupuesto de tokens.
- Active Context identifica la activación de la ubicación actual, las fuentes de activación combinadas, y el truncamiento determinista.
- El borrador fundamentado lee directamente las entradas de trasfondo seleccionadas explícitamente en lugar de depender de escaneos por palabra clave o de resúmenes del mundo generados.
- `Strict canon` produce solo ubicaciones con respaldo de fuente; `Canon with expansion` etiqueta cada adición inferida o sin respaldo antes de `Save`.
- La Conversation conectada no recibe ningún ID ni contenido del trasfondo adjunto a la ubicación.
- Las operaciones de cambio de nombre y de padre preservan la identidad de la ubicación.
- Los grafos inválidos y las escrituras obsoletas nunca mutan el estado.
- El movimiento se confirma con un turno de usuario o no se confirma en absoluto.
- La recarga, la selección de swipe, la ramificación en un mensaje anterior y la restauración de puntos de control de Game resuelven la ubicación correcta.
- Los prompts del propietario contienen solo el contexto de la ubicación activa y los destinos válidos.
- Game no muestra ni genera prompts a partir de una ubicación de texto libre competidora cuando está activado.
- Los mapas existentes de Game pueden vincularse explícitamente a ubicaciones de la jerarquía sin romper el movimiento táctico.
- Roleplay y Game usan las mismas reglas de jerarquía y de transición.
- La simulación y el Peek Prompt usan el mismo comportamiento de proyección que la generación.
- Los chats existentes y el Spatial Context desactivado retienen el comportamiento actual.
- La Conversation no puede poseer ni mutar el estado espacial.
- La memoria privada del modelo nunca entra en la proyección de Conversation.

## Validación

La cobertura determinista debe incluir los límites del grafo, ciclos, direcciones de navegación, enlaces ocultos y bloqueados, revisiones obsoletas, idempotencia, puntos de ramificación, swipes, puntos de control, límites de referencia de lorebook, activación forzada, exclusiones, deduplicación, truncamiento de tokens, topes del catálogo de fundamentación, validación de claves de fuente, rechazo del modo estricto, procedencia, límites de referencia visual, reglas principales y de herencia, resolución visual histórica, recorte del proveedor, advertencias de imagen ausente, exclusiones por tipo de solicitud, anclaje de origen del Storyboard, regeneración con manifiesto congelado, filtrado de personajes visibles, selección de un solo espacio y de múltiples espacios, cambios de capacidad del proveedor, actualización explícita, respaldo de manifiesto heredado, límites de privacidad, y controles negativos de ubicación inactiva.

Comprobaciones del repositorio:

```bash
pnpm check
pnpm regression:prompt
pnpm smoke:ui
```

La verificación manual cubre la autoría de escritorio y móvil, las rutas de navegación profundas, las capas, los mapas posicionados, los nombres largos, la recuperación de conflictos, las protecciones de archivado, Roleplay, Game, el movimiento de mapa vinculado y no vinculado, la recarga, la ramificación, la restauración de puntos de control, el adjunto y los enlaces de retorno de trasfondo enlazado, el trasfondo desactivado y roto, las advertencias de omisión de fuentes grandes, las vistas previas de `Strict canon` y `Canon with expansion`, la subida visual y la selección de galería, las referencias principales y de apoyo, la promoción de escena explícita, el estilo heredado, las imágenes rotas, el informe de omisión del proveedor, el arte de swipe histórico, las `Visual sources` del Storyboard, los proveedores de un solo espacio y de múltiples espacios, la regeneración congelada, la revisión de cambio de proveedor, la actualización explícita, los Storyboards heredados, Active Context, y el Peek Prompt. Las casillas de validación de la PR permanecen sin marcar para la verificación humana.

## Aplazado

- Movimiento inmediato sin un turno de chat
- Posiciones de personaje independientes
- Flags, eventos o scripts genéricos
- Plantillas de ubicación y paquetes de escenario
- Conocimiento espacial por personaje
- Trasfondo de ubicación compartible en Conversation
- Inferencia automática de imagen a mapa
- Promoción automática de escenas generadas al canon de la ubicación
- Generación masiva de arte de referencia para cada ubicación
- Selección automática consciente de la toma entre múltiples vestuarios, ángulos, expresiones y referencias de detalle de personaje
- Generación de referencia compuesta o de hoja de contactos específica del proveedor
