# Interioridades de los prompts de Noodle (para desarrolladores)

Referencia para desarrolladores sobre dónde viven en el código los prompts de generación de Noodle, cómo personalizarlos y cómo depurar los prompts finales. Los usuarios finales configuran Noodle desde su panel de Settings (Configuración); consulta las guías de Noodle en `docs/noodle/`.

## Mapa de origen de los prompts

Noodle tiene por ahora un prompt de generación de texto en línea, un override de prompt de texto registrado y un override de prompt de imagen registrado.

| Propósito                                                     | Origen                                                             | Símbolo principal                                     | Cómo personalizarlo                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Publicaciones, respuestas, seguimientos, encuestas, votos y resúmenes del timeline | `packages/server/src/routes/noodle.routes.ts`                      | `buildRefreshPrompt()`                          | Edita en el código los mensajes de sistema y de contexto en línea. La parte de tono y libertad creativa se delega al override **Noodle Timeline Voice & Tone** que se describe más abajo; el resto (reglas del formato de salida, críticas para el esquema) no se puede personalizar desde la interfaz. |
| Instrucciones de voz/tono del timeline (subconjunto del prompt de sistema) | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_TIMELINE_VOICE` (`noodle.timelineVoice`) | Edita **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Timeline Voice & Tone**, o cambia en el código el valor predeterminado registrado (`noodleTimelineVoiceDefaultText(enhanced)` en `noodle-prompt.ts`). Se limita a propósito solo al tono: los límites de acciones estructuradas, las reglas de los campos de destino y otras instrucciones críticas para el esquema quedan fijas en el código, fuera de este override, para que una reescritura no pueda romper el análisis de `noodleGeneratedRefreshSchema`. El valor predeterminado sin editar sigue el ajuste `enableEnhancedTimelineWriting` de Noodle (`ctx.enhanced`, desactivado de forma predeterminada, reproduce la instrucción de tono original de una sola línea); una vez que un usuario guarda su propio texto de override, ese texto gana sin importar ese ajuste. |
| Perfiles de cuentas de personaje por primera vez                       | `packages/server/src/routes/noodle.routes.ts`                      | `generateMissingNoodleProfiles()`               | Edita en el código los mensajes de sistema y de usuario en línea. La selección de participantes se ejecuta primero, y a este prompt solo se pasan las cuentas de personaje seleccionadas que no tengan `profileGenerated`.                       |
| Prompt de imagen de una publicación generada                                 | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_IMAGE_POST` (`noodle.imagePost`)        | Edita **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Post Image**, o cambia en el código el valor predeterminado registrado. |
| Instrucciones de imagen predeterminadas específicas de Noodle                  | `packages/shared/src/schemas/noodle.schema.ts`                     | `DEFAULT_NOODLE_SETTINGS.imageGenerationPrompt` | Cambia el ajuste de Noodle en la interfaz o su valor predeterminado del esquema en el código.                                                                    |
| Contexto de chat con participación voluntaria insertado en la generación del timeline     | `packages/server/src/routes/noodle.routes.ts`                      | `buildOptedInChatContext()`                     | Cambia en el código el ensamblado del contexto; la participación voluntaria del usuario sigue estando en los ajustes de cada chat.                                                     |
| Entradas de imagen de publicaciones y respuestas del timeline                        | `packages/server/src/services/noodle/noodle-vision.ts`             | `prepareNoodleVisionAttachments()`              | Cambia en el código la selección de imágenes, la normalización, los límites o la alternativa de compatibilidad solo texto.                                           |
| Actividad de Noodle insertada en los prompts del chat                  | `packages/server/src/services/noodle/noodle-context.ts`            | `buildRecentSocialMediaActivityBlock()`         | Cambia en el código el filtrado o el ensamblado del bloque; los usuarios controlan los modos de destino y los límites de elementos en Noodle Settings, mientras que el bloque envuelto tiene un tope duro de 8192 tokens.                                  |
| Contrato JSON generado                                     | `packages/shared/src/schemas/noodle.schema.ts`                     | `noodleGeneratedRefreshSchema`                  | Cámbialo solo junto con el prompt, el procesamiento de la ruta, los tipos compartidos y la cobertura de regresión.                                            |
| Contexto de mundo/lore del lorebook insertado en la generación del timeline | `packages/server/src/routes/noodle.routes.ts`                    | `buildRefreshPrompt()` (llama a `processLorebooks()`) | Controlado por el ajuste de Noodle **Lorebook context** (`enableLorebookContext`, desactivado de forma predeterminada). Reutiliza el mismo `processLorebooks()` multipersonaje que usan los chats grupales, con un presupuesto de tokens específico de Noodle desde `noodleLorebookTokenBudget()` en `noodle-prompt.ts`, escalado según el número de personajes activos y con un tope duro de 8192 tokens. Se ejecuta con `previewOnly: true` porque Noodle no tiene un espacio por chat donde guardar el estado de temporización de fijado/enfriamiento. |

Los prompts del timeline y de perfil no aparecen por ahora en la interfaz de Prompt Overrides. La plantilla **Noodle Post Image** es el único prompt de generación de Noodle expuesto allí. El campo **Prompt instructions** local de Noodle se pasa a esa plantilla de imagen; no modifica el prompt de escritura del timeline.

La ruta de imagen carga `NOODLE_IMAGE_POST` y luego pasa el resultado por `compileImagePrompt()` antes de enviarlo al proveedor de imágenes. Esto significa que la solicitud final también puede verse afectada por el perfil de estilo de imagen seleccionado y por los valores predeterminados de la conexión.

## Inspeccionar los prompts finales

Un refresco manual solicitado con Debug Mode activado registra los mensajes finales de modelo del perfil y del timeline a través del logger compartido del servidor. Busca:

```text
[debug/noodle] Profile prompt sent to model
[debug/noodle] Prompt sent to model
[debug/noodle] Attached N timeline image input(s) to the refresh prompt
```

Las cargas de imagen del timeline nunca se escriben como base64 en los registros de depuración. El texto registrado contiene las mismas claves de adjunto de publicación/respuesta enviadas al modelo, más el número de entradas de imagen nativas. Noodle normaliza y limita estas entradas en `noodle-vision.ts`. Si un proveedor rechaza de forma explícita el contenido de visión, la ruta lo registra y envía en su lugar el prompt alternativo solo texto ya ensamblado.

Para las imágenes, activa **Expose media prompts before sending** en **Settings -> Generations -> Image Generation** para inspeccionar y editar los prompts positivo y negativo finales ya compilados antes de enviar la solicitud.

## Editar con seguridad

El ensamblado del prompt es un límite de compatibilidad de alto riesgo. Cuando lo edites, mantén alineados el prompt, `noodleGeneratedRefreshSchema`, el procesamiento de la ruta y las regresiones de menciones y encuestas de Noodle. Ejecuta al menos:

```bash
pnpm check
pnpm regression:prompt
pnpm regression:noodle
```

## Guías relacionadas

- [Noodle: el timeline social dentro de la app](../noodle/overview.md)
- [Ajustes de Noodle y traspaso del chat](../noodle/settings.md)
- [Mapa de arquitectura (para desarrolladores)](architecture-map.md)
