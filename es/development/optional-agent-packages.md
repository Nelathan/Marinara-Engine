# Paquetes opcionales de agentes y capacidades

Estado: implementado para el ciclo de desarrollo v2.3.0 en el issue #3612.

## Objetivo

La distribución base de Marinara Engine no debe compilar ni incluir implementaciones opcionales de agentes y capacidades. Las instalaciones nuevas empiezan sin paquetes opcionales. Las actualizaciones conservan las capacidades que estaban disponibles antes de que se introdujera este sistema de paquetes.

El catálogo oficial, las fuentes de los paquetes, los artefactos reproducibles, los scripts de validación y el flujo de contribución están en [Pasta-Devs/Marinara-Agents](https://github.com/Pasta-Devs/Marinara-Agents). Los artefactos instalados quedan dentro de la carpeta de datos de Marinara configurada, para que las actualizaciones de la aplicación no puedan sobrescribirlos.

## Modelo de paquetes

Un paquete de agente puede aportar uno o más agentes declarativos y capacidades ejecutables de confianza opcionales:

- puntos de entrada del servidor para rutas, hooks de ciclo de vida, proveedores de prompt (instrucciones enviadas a la IA), manejadores de resultados y migraciones de almacenamiento;
- puntos de entrada del cliente para paneles, superficies de chat, secciones de configuración, opciones de configuración inicial y visualizaciones en tiempo de ejecución;
- esquemas JSON compartidos y contratos de comunicación estables;
- recursos propios del paquete, documentación y fragmentos de conocimiento de Professor Mari.

Los paquetes apuntan a una API de capacidades de Marinara con versión. No deben importar rutas de código privadas del motor.

Los elementos de capacidad del cliente reciben la configuración regional de la interfaz elegida en el Engine a través de sus atributos `lang` y `dir` y del objeto
`capabilityProps.localization`. Las interfaces propias del paquete conservan sus propios archivos de idioma y recurren al inglés del paquete; el Engine no traduce los prompts del paquete ni los valores de máquina escritos por el paquete. Los cambios de idioma reutilizan el evento
`marinara-capability-props` existente, para que una interfaz instalada pueda volver a renderizarse sin reiniciar el Engine.

La API de capacidades 1.1 añade una fachada genérica de tiempo de ejecución al contexto de activación del servidor.
Los paquetes pueden leer el estado efectivo de depuración de agentes y escribir a través del
logger Pino del Engine, incluidos los reemplazos explícitos del modo de depuración, sin importar el
logger privado ni los módulos de configuración de tiempo de ejecución. La fachada expone operaciones,
no los objetos internos del Engine.

La API de capacidades 1.2 añade operaciones de chat/mensaje con alcance de transacción, escrituras
limitadas de metadatos de chat y lecturas de existencia de entradas de lore, y el almacén de
compatibilidad de instantáneas espaciales. Los paquetes pueden validar cambios de dominio dentro de una
transacción del Engine y confirmar de forma atómica los metadatos junto con un mensaje propietario, un swipe (respuesta alternativa) o una instantánea
espacial, sin recibir un manejador de base de datos ni un objeto de tabla. El Engine conserva
la reversión y la compatibilidad de almacenamiento histórico; los paquetes conservan la validación y
la política de dominio. La misma API expone registros normalizados de chat y personaje, la selección
de entradas de lore elegibles, el análisis de respuestas tipo JSON y las llamadas resueltas al modelo de lenguaje.
Las credenciales de conexión, las implementaciones de proveedor, los manejadores de base de datos y los objetos de almacenamiento
siguen siendo privados del Engine.

## Paquetes iniciales

- todos los agentes integrados actuales;
- mapas espaciales jerárquicos para Roleplay y Game;
- llamadas de audio y video de Conversation;
- UNO;
- Chess;
- Poker;
- 8-Ball Pool;
- Tic-Tac-Toe;
- Rock-Paper-Scissors.

La base conserva el gestor de paquetes, el cliente del catálogo, los contratos genéricos del pipeline de agentes, los contratos genéricos del host de juegos por turnos y las interfaces de host inertes. Las implementaciones concretas pertenecen a los paquetes.

## Confianza e instalación

El catálogo oficial es un documento JSON con versión y validado por esquema, obtenido por HTTPS. Cada entrada de versión incluye URLs de artefactos inmutables, resúmenes SHA-256, tamaños en bytes, compatibilidad con el motor, permisos y si su tiempo de ejecución requiere reinicio.

Al iniciar el servidor, el host obtiene el catálogo una vez cuando hay al menos un paquete oficial instalado, selecciona solo las versiones más nuevas compatibles con el Engine y la API de capacidades en ejecución, las verifica mediante el pipeline de instalación normal y las instala antes de que se activen los tiempos de ejecución de los paquetes. Los fallos se aíslan por paquete. Los archivos existentes y el estado del registro siguen siendo utilizables cuando el catálogo está fuera de línea o la verificación falla, y los fallos de disponibilidad del tiempo de ejecución del servidor usan la ruta de reversión a la versión anterior.

El instalador debe:

1. exigir acceso privilegiado de loopback/administrador;
2. imponer HTTPS, límites de descarga y tiempos de espera;
3. verificar la confianza del catálogo y el SHA-256 del artefacto antes de la extracción;
4. rechazar rutas absolutas, traversal, enlaces, archivos de dispositivo y archivos no declarados;
5. validar el manifiesto y la compatibilidad con el motor;
6. extraer en una carpeta hermana temporal;
7. activar de forma atómica solo después de que la validación tenga éxito;
8. conservar la versión anterior hasta que el nuevo tiempo de ejecución arranque correctamente;
9. revertir la activación en caso de fallo;
10. nunca ejecutar scripts de instalación, actualización o desinstalación.

Solo los paquetes ejecutables de confianza de primera parte quedan habilitados por el catálogo oficial. Un futuro flujo de terceros requiere un diseño de confianza explícito aparte.

## Comportamiento en tiempo de ejecución y reinicio

El servidor es dueño del registro de paquetes instalados y expone las capacidades instaladas a los clientes. Los módulos declarativos y recargables se activan de inmediato. La interfaz invalida las consultas de catálogo, agente, capacidad de modo y chat activo después de la activación.

El manifiesto puede declarar `restartRequired` solo cuando el host no puede recargar ese punto de entrada de forma segura. La activación en caliente exitosa dice `Agent installed. It is ready to use.` La activación que requiere reinicio dice `Agent installed. Restart Marinara Engine to finish setup.`

Los paquetes de juegos por turnos son recargables en caliente: la instalación registra de inmediato su motor de servidor y su lanzador manual por comando slash, y la desinstalación desacopla el tiempo de ejecución sin reiniciar el Engine. Los ajustes de Conversation Commands por chat solo controlan si los personajes pueden emitir el comando oculto del paquete; no limitan el lanzador slash del usuario. Los manifiestos oficiales actuales de juegos por turnos conservan su marcador conservador de reinicio heredado para compatibilidad con el Engine 2.x; el Engine 3.x reconoce el tipo `turn-game`, realiza la activación en caliente segura y devuelve el paquete como activo y listo.

## Migración de compatibilidad

En el primer arranque tras la actualización:

- los agentes personalizados quedan intactos;
- cada agente integrado heredado visible para esa instalación se registra como instalado;
- los mapas, las llamadas de Conversation y los juegos de Conversation conservan su disponibilidad anterior;
- la configuración por chat existente, las instantáneas, el estado del juego, el historial de llamadas y la memoria de agente permanecen en su lugar;
- la migración es idempotente y registra su finalización solo después de que todas las entradas de disponibilidad heredadas sean duraderas.

Los artefactos de paquetes heredados siguen disponibles en el catálogo oficial como fuentes de migración. Las instalaciones nuevas no los exponen ni los activan hasta que el usuario los instala.

## Desinstalación

La desinstalación quita el paquete de las selecciones del chat activo, elimina su configuración de agente y los archivos ejecutables descargados, y desacopla su tiempo de ejecución en el reinicio cuando es necesario. Los chats históricos, los mensajes, las instantáneas de mapa, los resúmenes de llamadas y los registros de juegos completados siguen siendo legibles, para que quitar un paquete no pueda destruir el trabajo del usuario. La eliminación destructiva de datos de dominio históricos es una acción de usuario aparte y explícita.

Toda desinstalación requiere confirmación. Los chats afectados vuelven a sus superficies base ordinarias sin corromper el historial.

## Interfaz del catálogo

El panel de Agents contiene un control `Download Agents` que coincide con la función `Download Cards` del Card Browser. Abre una biblioteca responsiva a pantalla completa con búsqueda, tipos de paquete, información de compatibilidad, estado de instalación/actualización, permisos, costo de almacenamiento, documentación y controles de desinstalación.

En escritorio se usa una lista de exploración con una región de detalle adyacente. En móvil se usa un solo panel con navegación de retroceso explícita y acciones de tamaño táctil. Los estados vacío, fuera de línea, incompatible, descarga corrupta, instalación interrumpida, actualización, reversión y requiere-reinicio son de primera clase.

## Puerta de extracción

Una extracción está completa solo cuando los paquetes base de producción del cliente y del servidor ya no contienen la implementación del paquete, una instalación nueva no puede activarlo sin descargar el paquete, una instalación actualizada lo conserva, y la instalación/actualización/desinstalación del paquete pasa en sistemas de archivos de escritorio, móvil y compatibles con Termux.
