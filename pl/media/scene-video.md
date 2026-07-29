# Generowanie wideo sceny

Ten przewodnik wyjaśnia, jak Marinara Engine zamienia ilustrację sceny w krótki klip wideo MP4. Znajdziesz tu opis dostawców wideo, sposób generowania klipu w panelu **Gallery** (galeria), kontrolki trybu **Game Mode** oraz ustawienia wideo. Wideo sceny to krótki animowany klip zrobiony z jednego nieruchomego obrazu.

## Do czego służy wideo sceny

Wideo sceny bierze istniejący obraz z galerii i animuje go w krótki klip MP4. Nieruchomy obraz staje się pierwszą klatką, a AI dodaje ruch. Wideo sceny działa w czatach w trybie **Roleplay** i **Game Mode**.

Najpierw zawsze potrzebny jest obraz. Generowanie wideo sceny nie ruszy z samego tekstu. Zanim cokolwiek da się zanimować, trzeba wygenerować lub wgrać obraz do galerii.

Wideo sceny korzysta z osobnego typu połączenia o nazwie **Video Generation** (generowanie wideo). To nie to samo co zwykłe generowanie obrazów. Gotowe klipy zapisują się razem z czatem i pokazują się w panelu **Gallery**, gdzie można je przypiąć, pobrać lub obejrzeć.

## Połączenia typu Video Generation

Żeby robić wideo sceny, dodaj najpierw połączenie, które potrafi generować wideo. Służy do tego ten sam panel **Connections** (połączenia) co przy połączeniach czatu i obrazów.

1. Otwórz sekcję **Settings** (ustawienia), a potem **Connections**.
2. Kliknij przycisk **Add Connection**.
3. Ustaw typ dostawcy na **Video Generation**.
4. W polu **Video Service** wybierz jedną z sześciu poniższych usług.
5. Wpisz klucz API (tajny kod, trochę jak hasło) dla usługi w chmurze. Lokalne ComfyUI go nie potrzebuje.
6. Przy usługach w chmurze wybierz model albo zostaw domyślny model dostawcy. Przy ComfyUI zostaw pole modelu puste, chyba że workflow używa `%model%`.
7. Zapisz połączenie.

Lista **Video Service** daje sześć możliwości. Każda podstawia domyślny adres internetowy, a tam, gdzie ma to zastosowanie, także domyślny model:

| Video Service        | Model domyślny                    | Uwagi                                                                        |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| **Google AI Studio** | `gemini-omni-flash-preview`       | Uruchamia modele wideo Gemini Omni i Veo przez API Gemini.                   |
| **xAI Imagine**      | `grok-imagine-video-1.5`          | Wideo Grok Imagine przez API xAI Videos.                                     |
| **OpenRouter Video** | `google/veo-3.1`                  | Modele wideo przez OpenRouter. Można wpisać dowolny identyfikator modelu wideo z OpenRouter. |
| **Atlas Cloud**      | `google/veo3.1/text-to-video`     | Hostowane modele text-to-video i image-to-video przez Atlas Cloud.           |
| **Seedance 2.0**     | `seedance-2-0`                    | Tryby wideo: z tekstu, z pierwszej klatki oraz z pierwszej i ostatniej klatki. |
| **ComfyUI**          | Zależny od workflow               | Lokalne WAN i inne workflow wideo wyeksportowane w formacie API.             |

**Google AI Studio** obejmuje dwie rodziny modeli. **Gemini Omni** korzysta z `gemini-omni-flash-preview`. **Google Veo** korzysta z `veo-3.1-generate-preview`. To, która rodzina zadziała, zależy od modelu wybranego w połączeniu.

Przy **ComfyUI** użyj zwykłego adresu lokalnego `http://127.0.0.1:8188` i wklej workflow wideo w formacie API do pola **ComfyUI Workflow**. Workflow jest wymagany. Opis symboli zastępczych i wymagań dotyczących węzła wyjściowego znajdziesz w przewodniku [Konfiguracja workflow w ComfyUI](comfyui.md#comfyui-video-workflows).

### Ustawienie domyślnego połączenia wideo

Edytor połączenia typu Video Generation pokazuje grupę **Default for Videos**. Włącz przełącznik **Use as default video connection**, żeby Marinara mogła sięgać po to połączenie, gdy czat nie ma własnego połączenia wideo. Jako domyślne połączenie wideo oznacz tylko jedno połączenie.

### Ustawienia domyślne wideo w połączeniu

Połączenie typu Video Generation ma w edytorze własny panel **Video Generation Defaults**. Ustawiasz tu domyślną długość klipu, proporcje obrazu i rozdzielczość dla tego połączenia. Te ustawienia domyślne mają pierwszeństwo przed zapasową długością obowiązującą w całej aplikacji.

| Usługa           | Długość domyślna | Zakres długości | Proporcje obrazu | Rozdzielczość     |
| ---------------- | -------------- | ------------ | ------------ | ---------------- |
| Gemini Omni      | 10s            | od 1 do 60s  | 16:9         | Domyślna dostawcy |
| Google Veo       | 8s             | 4, 6 lub 8s  | 16:9         | 720p             |
| xAI Imagine      | 10s            | od 1 do 15s  | 16:9         | 720p             |
| OpenRouter Video | 10s            | od 1 do 60s  | 16:9         | 720p             |
| Atlas Cloud      | 8s             | od 1 do 60s  | 16:9         | 720p             |
| Seedance 2.0     | 5s             | od 4 do 15s  | 16:9         | 720p             |
| ComfyUI          | 5s             | od 1 do 60s  | 16:9         | 720p             |

Gemini Omni nie ma pola rozdzielczości, a długość trafia do treści promptu zamiast do osobnego ustawienia. Google Veo wymusza 8 sekund zawsze, gdy animuje obraz referencyjny, bo tyle czasu potrzebuje na zmiksowanie pierwszej i ostatniej klatki.

### Klatki referencyjne w Seedance

Seedance musi pobrać obraz referencyjny przez publiczny adres internetowy, zanim go zanimuje. Lokalny serwer Marinara Engine nie ma publicznego adresu, więc zwykła instalacja lokalna wymaga jednego dodatkowego kroku.

Otwórz połączenie Seedance i włącz przełącznik **Upload Seedance reference frames temporarily**. Klatka referencyjna trafia wtedy pod tymczasowy publiczny adres, z którego Seedance może ją odczytać. Czas życia tego adresu wybierasz w polu **Temporary link lifetime**, a domyślnie wynosi on 12 godzin.

Jeśli serwer Marinara Engine ma już publiczny adres internetowy, zamiast tymczasowego wgrywania da się ustawić zmienną środowiskową. Ustawienie obrazu referencyjnego dla wideo opisuje [Konfiguracja serwera](../CONFIGURATION.md).

## Wybór dostawcy

Wszystkie sześć usług robi krótkie klipy z obrazu. Różnią się szybkością, długością klipu i sposobem obsługi obrazów referencyjnych.

- **Google AI Studio (Gemini Omni)**: elastyczna długość do 60 sekund. Długość wpisuje się w treść promptu, nie ma osobnej kontrolki.
- **Google AI Studio (Veo)**: wysoka jakość, ale sztywne 4, 6 lub 8 sekund. Przy animowaniu obrazu używa 8 sekund.
- **xAI Imagine**: klipy od 1 do 15 sekund. Ma krótszy limit długości promptu niż pozostałe usługi.
- **OpenRouter Video**: od 1 do 60 sekund, z możliwością wpisania dowolnego modelu wideo obsługiwanego przez konto OpenRouter.
- **Atlas Cloud**: od 1 do 60 sekund, z wyselekcjonowanymi modelami startowymi Veo 3.1 i Seedance 2.0. Można wpisać inny dokładny identyfikator modelu wideo Atlas Cloud; ograniczenia czasu trwania, rozdzielczości i obrazu referencyjnego danego modelu nadal obowiązują.
- **Seedance 2.0**: klipy od 4 do 15 sekund, z trybem pierwszej klatki oraz pierwszej i ostatniej klatki. Wymaga publicznego adresu do obrazu referencyjnego.
- **ComfyUI**: generowanie lokalne przez własny workflow w formacie API. Marinara wgrywa obraz referencyjny prosto do ComfyUI, gdy workflow używa `%reference_image_name%`.

Zadania wideo trwają. Dostawca uruchamia zadanie, a potem Marinara czeka i sprawdza, aż klip będzie gotowy. Jeden klip może zająć kilka minut, czyli dłużej niż nieruchomy obraz. Duże lokalne modele WAN mogą potrzebować więcej niż domyślne 30 minut; w takim wypadku podnieś `VIDEO_GEN_TIMEOUT_MS` i uruchom aplikację Marinara Engine ponownie.

## Generowanie wideo w panelu Gallery

Czaty w trybie **Roleplay** i **Game Mode** robią wideo sceny z poziomu panelu **Gallery**. Otwiera go ikona obrazu lub galerii w czacie. Czaty w trybie **Game Mode** mają jeszcze drugie miejsce do tego samego, czyli panel **Game Assets**, opisany dalej w tym przewodniku.

Panel **Gallery** ma zakładkę **Images** i zakładkę **Videos**, każdą z licznikiem. Nieruchome obrazy znajdują się w zakładce **Images**. Gotowe klipy trafiają do zakładki **Videos**.

Żeby zanimować najnowszy obraz:

1. Sprawdź, czy w zakładce **Images** jest przynajmniej jeden obraz. Użyj wcześniej przycisku **Illustrate** albo wgraj obraz.
2. Kliknij przycisk **Video** w rzędzie akcji na górze panelu **Gallery**.
3. Jeśli w sekcji **Settings**, **Generations**, **Image Generation** włączono opcję **Expose media prompts before sending**, przejrzyj lub popraw skompilowany prompt animacji i kliknij przycisk **Generate**. Anulowanie tego okna nie wysyła do dostawcy żadnego żądania.
4. Przycisk zmienia się w **Generating...**, a baner informuje, że generowanie wideo trwa.
5. Po zakończeniu klip pojawia się w zakładce **Videos**.

Żeby zanimować konkretny obraz zamiast najnowszego:

1. Otwórz zakładkę **Images**.
2. Najedź kursorem na wybrany obraz.
3. Kliknij przycisk **Animate illustration** (ikona kliszy filmowej) wśród kontrolek, które się wtedy pokazują.

Przy włączonym przeglądaniu promptu to samo okno **Review Video Prompt** pojawia się także dla przycisku **Animate illustration**. Pokazuje dokładny prompt skompilowany przez serwer, czas trwania, proporcje obrazu i rozdzielczość, które zostaną użyte dla wybranego obrazu. Poprawka działa tylko dla tego jednego generowania i nie zastępuje wielokrotnego szablonu Game Video Prompt.

W zakładce **Videos** każdy klip odtwarza się na miejscu i pokazuje swoją długość oraz nazwę modelu. Klip można przypiąć przyciskiem **Pin video to chat** albo zapisać przyciskiem **Download scene video**. Dopóki nie ma żadnych klipów, zakładka pokazuje napis **No videos yet**.

Przy próbie zrobienia wideo bez żadnego obrazu w czacie Marinara pokazuje komunikat: "Add or generate a gallery image before generating a scene video." Wygeneruj lub wgraj obraz, a potem spróbuj ponownie.

## Wideo sceny w trybie Game Mode

Tryb **Game Mode** ma drugie miejsce do robienia wideo sceny: panel **Game Assets**. Otwiera go przycisk **Game Assets** wśród kontrolek gry.

1. Otwórz panel **Game Assets**.
2. Kliknij przycisk **Generate video**. Jego podpowiedź brzmi "Generate a scene video from the latest illustration."
3. Gotowy najnowszy klip odtwarza się w panelu.

Przycisk **Generate video** pozostaje nieaktywny, dopóki gra nie ma zarówno połączenia wideo, jak i ilustracji sceny. Po zbyt wczesnym kliknięciu może pojawić się jeden z tych komunikatów:

- "Choose a Video Generation connection in Game Settings first." Ustaw połączenie wideo dla gry.
- "Generate a scene illustration before generating a scene video." Zrób najpierw obraz.

Gdy klip się nie uda, panel pokazuje napis "Scene video generation failed." Spróbuj ponownie, a przy powtarzających się błędach sprawdź połączenie i klucz API.

## Wybór połączenia wideo dla czatu

Każdy czat wybiera własne połączenie wideo. Ustawia się je w sekcji **Chat Settings** (ustawienia czatu), następnie **Agents**, następnie **Scene Videos**.

Czaty w trybie **Roleplay** pokazują kafelek **Scene Videos** z opisem "Generate manual MP4 scene videos from gallery images." Ma on jedną kontrolkę, listę rozwijaną **Video Connection**. Wybierz tutaj swoje połączenie typu Video Generation.

Czaty w trybie **Game Mode** pokazują kafelek **Scene Videos** z opisem "Generate MP4 scene videos from game illustrations." Ma on więcej kontrolek:

- **Video Connection**: połączenie typu Video Generation, z którego korzysta ta gra.
- **Game Video Prompt**: szablon promptu decydujący o tym, jak animuje się obraz. Wbudowany domyślny szablon to **Cinematic Scene Video**.
- **Edit Video Presets**: dodawanie i edycja własnych kopii szablonu promptu wideo dla tego czatu.

Szablon **Game Video Prompt** nadal steruje ręcznymi filmami z panelu **Gallery** i **Game Assets**. Klipy z klatek kluczowych storyboardu mogą korzystać z innego szablonu **Storyboard Video Prompt** w sekcji **Chat Settings**, **Agents**, następnie **Storyboards**. Bez osobnego wyboru dla storyboardu dziedziczą one szablon Game Video Prompt.

Przy pierwszym tworzeniu czatu w trybie **Game Mode** kreator konfiguracji też ma listę **Video Generation Connection**. Znajduje się w kroku **Features** i pojawia się po włączeniu opcji **Visual Generation**.

Jeśli czat nie ma własnego połączenia wideo, Marinara sięga po połączenie oznaczone przełącznikiem **Use as default video connection**. Gdy nie ma ani połączenia w czacie, ani domyślnego, akcje wideo pokazują ostrzeżenie z prośbą o wybór.

## Ustawienia generowania wideo

Część ustawień domyślnych wideo mieszka w ustawieniach aplikacji, nie w połączeniu. Otwórz sekcję **Settings**, następnie **Generations**, a potem sekcję **Video Generation**. Jej opis brzmi "Set default clip lengths and edit reusable video prompts for Game, Gallery, and Calls."

Głównym ustawieniem wideo sceny jest tutaj **Scene video fallback length**, domyślnie 10 sekund. Działa tylko wtedy, gdy wybrane połączenie wideo nie ma własnej długości. Da się je ustawić w zakresie od 1 do 60 sekund.

W tej samej sekcji jest też **Video Generation Prompt Overrides**, gdzie edytuje się wielokrotne szablony promptów wideo. To zaawansowany sposób na zmianę ruchu w klipach bez ruszania kodu.

Ta sama sekcja zawiera ustawienie **Animated expression length**. Należy ono do osobnej funkcji, czyli animowanych sprite'ów portretowych. Opisuje ją przewodnik [Animowane wyrazy twarzy](animated-expressions.md).

## Storyboardy

Tryb **Game Mode** potrafi też zbudować storyboard, czyli uporządkowany zestaw obrazów klatek kluczowych dla jednej tury gry. Po włączeniu animacji storyboardu Marinara animuje każdą klatkę kluczową w klip, korzystając z twojego połączenia wideo i szablonu **Storyboard Video Prompt**. Bez wyboru osobnego szablonu dziedziczy on **Game Video Prompt**. Klatka kluczowa to jedna nieruchoma klatka w tym uporządkowanym zestawie.

Storyboardy mają własne kontrolki i własny przewodnik. Pełną konfigurację i sposób pracy opisuje [Przewodnik po silniku storyboardów](../game/storyboard.md).

## Rozwiązywanie problemów

### "Choose a Video Generation connection"

Czat nie ma wybranego połączenia wideo. Otwórz sekcję **Chat Settings**, następnie **Agents**, następnie **Scene Videos**, i wybierz połączenie. Jeśli lista rozwijana jest pusta, dodaj połączenie w sekcji **Settings**, a potem **Connections**.

### "Add or generate a gallery image before generating a scene video"

Wideo sceny zawsze animuje istniejący obraz. Użyj przycisku **Illustrate**, wgraj obraz albo kliknij przycisk **Animate illustration** na obrazie, który już masz.

### Wideo powstaje bardzo długo

To normalne. Dostawca uruchamia zadanie, a Marinara czeka i sprawdza, aż klip będzie gotowy. Veo, xAI, OpenRouter, Atlas Cloud i Seedance działają tak samo, a jeden klip potrafi zająć kilka minut.

### Seedance nie potrafi odczytać obrazu referencyjnego

Seedance potrzebuje publicznego adresu do obrazu. Na serwerze lokalnym otwórz połączenie Seedance i włącz przełącznik **Upload Seedance reference frames temporarily**. Zajrzyj do sekcji o Seedance powyżej.

### Żądania wideo ciągle kończą się błędem

Sprawdź, czy połączenie ma poprawny klucz API i czy konto ma dostęp do wideo. Otwórz połączenie w sekcji **Settings**, a potem **Connections**, i potwierdź klucz oraz model. Limity czasu po stronie serwera opisuje [Konfiguracja serwera](../CONFIGURATION.md).

## Powiązane przewodniki

- [Animowane wyrazy twarzy](animated-expressions.md)
- [Przewodnik po silniku storyboardów](../game/storyboard.md)
- [Storyboardy LTX 2.3 w Game Mode](../game/ltx-2-3-storyboards.md)
- [Obsługiwani dostawcy AI](../connections/providers-reference.md)
- [Konfiguracja serwera](../CONFIGURATION.md)
