# Przewodnik po silniku storyboardów

Ten przewodnik wyjaśnia, czym są storyboardy w aplikacji Marinara Engine. Storyboard zamienia gotowy tekst fabularny w krótką serię klatek kluczowych i może dodać animowane klipy. Storyboardy w trybie Game Mode powstają z jednej zakończonej tury GM. Storyboardy w trybie Roleplay łączą zakończone wymiany wiadomości w odcinek osadzony w czacie. Czaty Conversation nie korzystają ze storyboardów.

## Czym są storyboardy

Game Mode to tryb czatu, w którym Game Master (GM, czyli mistrz gry) prowadzony przez AI opowiada przygodę podzieloną na tury. Kiedy GM kończy turę narracji, silnik storyboardów może ją zilustrować. W trybie Roleplay agent Storyboard czyta zakończone wiadomości użytkownika i odpowiedzi AI od czasu swojego poprzedniego udanego odcinka.

Marinara czyta narrację GM i dzieli ją na krótką serię uporządkowanych klatek kluczowych. Każda klatka kluczowa to jeden obrazek pokazujący jedną chwilę z tury. Storyboard mieści od 1 do 6 klatek kluczowych. Domyślnie są 3.

Każda klatka kluczowa jest przypisana do fragmentu tekstu tury. Te fragmenty nazywają się sekcjami czytania. W miarę przewijania tury mały podgląd pokazuje klatkę kluczową pasującą do bieżącego miejsca w tekście.

Zanim Marinara zaplanuje obrazy, usuwa z tury znaczniki poleceń GM. Znaczniki poleceń GM to ukryte instrukcje w wiadomości GM, na przykład rzuty kością albo aktualizacje stanu gry. Zostają usunięte, żeby nie trafiły na obrazek.

Nieruchome klatki kluczowe zapisują się w panelu **Gallery** (Galeria), w zakładce **Images** (Obrazy). Klipy klatek kluczowych zapisują się jako wideo scen, w zakładce **Videos** (Wideo). Ponieważ są zwykłymi elementami panelu **Gallery**, każdą klatkę kluczową da się osobno obejrzeć, pobrać, przypiąć albo skopiować z niej prompt (tekst, który Marinara wysyła do AI).

## Odcinki storyboardu w trybie Roleplay

Storyboardy w trybie Roleplay to co innego niż Illustrator. Illustrator dalej tworzy swoje zwykłe pojedyncze obrazy, a Storyboard planuje w tym czasie jedną lub więcej uporządkowanych klatek kluczowych z zakończonego fragmentu czatu.

1. Zainstaluj agenta **Storyboard** w sekcji **Agents > Download Agents**.
2. Otwórz czat w trybie Roleplay, a potem dodaj agenta **Storyboard** w **Chat Settings > Agents**.
3. W sekcji **Storyboard** wybierz **Manual only**, **Still images** albo **Animations**.
4. Wskaż połączenie promptu, połączenie obrazowe i opcjonalnie połączenie wideo. Połączenie obrazowe jest wymagane.
5. Odcinek ręczny: otwórz panel **Gallery** i kliknij przycisk **Create storyboard**. Odcinki automatyczne uruchamiają się po ustawionej liczbie nowych zakończonych odpowiedzi AI.

Domyślny odstęp to 1, więc odcinek automatyczny może pojawiać się po każdej nowo zakończonej odpowiedzi AI. Większa wartość w polu **Assistant messages per episode** daje miejsce na dialog i wymianę zdań. Po osiągnięciu odstępu Marinara łączy wiadomości od poprzedniego udanego storyboardu, w granicach ograniczonego okna ostatnich wiadomości. Otwarcie istniejącego czatu nie uzupełnia starych wiadomości wstecz, a nieudany odcinek nie przesuwa punktu odniesienia dla kolejnych odcinków.

Klatki kluczowe w trybie Roleplay wyświetlają się w czacie, zaraz pod odpowiedzią kończącą odcinek. W storyboardach z kilkoma klatkami kluczowymi przełączaj kadry strzałkami. Obrazy i klipy zapisują się też w panelu **Gallery**.

Planowanie w trybie Roleplay ma cztery edytowalne warstwy w globalnych ustawieniach **Agents > Storyboard**:

- **Episode contract** wybiera zakończone wątki fabularne z przekazanych wiadomości.
- **Visual style** daje do wyboru styl zwykły/anime, NovelAI, komiks, kolorową mangę i mangę czarno-białą.
- **Animation addon** dokłada się tylko do storyboardów animowanych. Traktuje ilustrację jako dokładną klatkę T=0, a potem opisuje prostą akcję, zachowanie kamery, dialog ze źródła, efekty dźwiękowe, tło dźwiękowe i przytrzymanie na końcu.
- **Output contract** określa format JSON klatek kluczowych, który zwraca model planujący.

Te prompty trybu Roleplay nie zastępują zoptymalizowanej biblioteki planerów trybu Game Mode. Formatery dostawców obrazu i wideo pozostają wspólne i nadal da się je wybierać. Plan animacji jest niezależny od dostawcy, więc może korzystać z Google Gemini Omni, LTX/ComfyUI albo innego skonfigurowanego połączenia Video Generation, które przyjmuje żądania image-to-video. Możliwości dostawców i jakość wyniku wciąż się różnią.

## Storyboardy w trybie Game Mode

Ta sekcja wyjaśnia, jak skonfigurować, wygenerować, przejrzeć i animować storyboardy dla tur w trybie Game Mode.

## Zanim zaczniesz

Kilka rzeczy trzeba przygotować, zanim storyboard się wygeneruje.

1. Czat w trybie Game Mode. Poniższa konfiguracja dotyczy konkretnie pracy w trybie Game Mode.
2. Działające połączenie obrazowe dla ilustratora gry. Ustaw je w jednym z dwóch miejsc – wystarczy jedno:
   - Istniejąca gra: otwórz panel **Chat Settings** (ustawienia czatu), przejdź do zakładki **Agents** (Agenci), a potem do sekcji **Illustrator**. Włącz opcję **Game Illustrator** i wybierz połączenie w polu **Image Connection**.
   - Nowa gra: w kreatorze konfiguracji włącz opcję **Visual Generation** i wybierz połączenie w polu **Image Generation Connection**.
3. Najlepiej użyć mocnego, nowego modelu obrazowego. Aplikacja podpowiada model obrazowy z najwyższej półki albo odpowiednik modelu Google Nano Banana 2 Lite.

Do animowanych klipów potrzebne jest dodatkowo połączenie wideo. Zajrzyj do kroków z animacjami poniżej.

Jeśli żadne połączenie obrazowe nie jest ustawione, prośba o storyboard kończy się takim komunikatem: "Choose an Illustrator image connection in Game Settings first."

Żeby postacie wyglądały tak samo na kolejnych klatkach kluczowych, używaj kart postaci z awatarami i włącz opcję **Send Avatar References** w sekcji **Illustrator**. Dzięki temu awatar każdej postaci trafia do modelu jako obraz referencyjny.

## Szybki start

1. Otwórz lub utwórz czat w trybie Game Mode.
2. Ustaw połączenie obrazowe zgodnie z opisem w sekcji powyżej.
3. Graj dalej, aż GM skończy turę narracji.
4. Otwórz panel **Gallery**.
5. Kliknij przycisk **Create storyboard** (utworzenie storyboardu). W trakcie pracy przycisk pokazuje napis **Creating...** i kręcące się kółko.
   - Jeśli w sekcji **Settings > Generation** włączona jest opcja **Expose image prompts before sending**, przejrzyj i popraw gotowy prompt dla każdej klatki kluczowej, a potem potwierdź generowanie.
6. Czytaj turę dalej. Pływający podgląd pojawia się sam i przełącza klatki kluczowe w miarę czytania.

Zamknięty podgląd da się otworzyć ponownie. W panelu **Gallery** kliknij przycisk **View storyboard**.

Kiedy storyboard się generuje, panel **Gallery** pokazuje taki baner: "Storyboard generation is running. Keyframes will appear in the game storyboard viewer when ready."

## Storyboardy automatyczne i ręczne

Storyboardy można tworzyć samodzielnie albo zostawić to aplikacji Marinara Engine.

Tryb ręczny to przycisk **Create storyboard** w panelu **Gallery**. Buduje storyboard dla ostatniej zakończonej tury narracji GM, i to tylko na żądanie. Przydaje się też do odświeżenia albo ponownego zilustrowania bieżącej tury, nawet przy wyłączonych storyboardach automatycznych.

Storyboardy automatyczne ustawia się osobno dla każdego czatu. Kontrolki są w jednym z dwóch miejsc:

- Nowa gra: kreator konfiguracji, sekcja **Visual Generation**, a w niej podsekcja **Storyboards**.
- Istniejąca gra: **Chat Settings**, **Agents**, a potem sekcja **Storyboards**.

Opcja **Automatic Storyboard Illustrations** tworzy nieruchome klatki kluczowe po każdej zakończonej turze GM, bez żadnego kliknięcia. To tańsza droga. W nowej grze utworzonej przez kreator opcja ta jest domyślnie włączona, gdy tylko włączona jest opcja **Visual Generation**. Nic nie robi, dopóki nie zostanie skonfigurowana opcja **Game Illustrator**.

Storyboardy automatyczne nie zatrzymują ścieżki zakończonej tury po to, żeby pokazać prompt do sprawdzenia. Przy włączonej opcji **Expose image prompts before sending** użyj ręcznego przycisku **Create storyboard**, żeby zobaczyć i poprawić każdy gotowy prompt klatki kluczowej. Uruchomienia automatyczne idą dalej bez okna dialogowego, dzięki czemu gra nie staje w miejscu, gdy nikt nie siedzi przy czacie.

Opcja **Automatic Storyboard Animations** tworzy dodatkowo klip MP4 dla każdej klatki kluczowej. Domyślnie jest wyłączona. Wymaga nieruchomych ilustracji oraz połączenia wideo. Włączenie animacji włącza też ilustracje. Wyłączenie ilustracji wyłącza animacje.

Konfiguracja klipów wygląda tak:

1. Utwórz połączenie **Video Generation** w sekcji **Settings** (Ustawienia), a potem **Connections**.
2. Wybierz je w polu **Video Generation Connection** w kreatorze albo w **Chat Settings**, **Agents**, sekcja **Scene Videos**, pole **Video Connection**.
3. Włącz opcję **Automatic Storyboard Animations**.

Po włączeniu animacji bez połączenia wideo kreator ostrzega: "Choose a Video Generation connection below to save automatic storyboard animations."

Storyboard tworzy zwykle 3 zadania obrazowe, po jednym na klatkę kluczową. Przy włączonych animacjach dochodzi do 3 zadań wideo. Liczba wynika z ustawienia **Keyframes per Turn**, więc wybór wartości 5 może oznaczać 5 zadań obrazowych i do 5 zadań wideo. Zadania wideo są dużo wolniejsze i droższe. Zacznij od nieruchomych ilustracji, a animacje włączaj tylko w tych czatach, gdzie czas oczekiwania i koszt nie przeszkadzają.

## Ustawienia storyboardu

Wszystkie te ustawienia znajdują się w sekcji **Storyboards**. Otwórz panel **Chat Settings**, przejdź do zakładki **Agents**, a potem do sekcji **Storyboards**.

| Ustawienie | Domyślnie | Do czego służy |
| --- | --- | --- |
| **Automatic Storyboard Illustrations** | Włączone w nowych grach z kreatora, gdy działa Visual Generation; poza tym wyłączone | Tworzy nieruchome klatki kluczowe po każdej turze GM |
| **Automatic Storyboard Animations** | Wyłączone | Dodaje klip MP4 do każdej klatki kluczowej; wymaga połączenia wideo |
| **Keyframes per Turn** | 3 (zakres od 1 do 6) | Ile klatek kluczowych planuje każda tura |
| **Animation Clip Duration** | 6 sekund (zakres od 1 do 15) | Długość każdego klipu |
| **Viewer Display** | Floating | Pływający panel albo pełne tło |
| **Illustration Planner** | Still Keyframes | Planuje gotowe nieruchome klatki kluczowe wraz z opisami obrazów |
| **Animation Planner** | Comic Page Animation | Planuje obrazy źródłowe gotowe do animacji oraz wskazówki ruchu |
| **Use Storyboard Template** | Włączone | Formatuje zaplanowane sceny według wybranego ustawienia Storyboard Illustration Prompt. Wyłącz je, żeby wysyłać bezpośrednie prompty tagowe NovelAI |
| **Storyboard Illustration Prompt** | Game Scene Illustration | Formatuje każdą zaplanowaną klatkę kluczową pod model obrazowy |
| **Storyboard Video Prompt** | Tak samo jak Game Video Prompt | Prompt ruchu używany tylko w klipach klatek kluczowych storyboardu |

**Keyframes per Turn** to suwak. Silnik stara się zaplanować tyle klatek kluczowych. Krótka tura może dostać ich mniej. Nigdy nie planuje więcej niż 6.

**Animation Clip Duration** podaje się w sekundach. Pole jest wyszarzone, dopóki nie zostanie włączona opcja **Automatic Storyboard Animations**. Do momentu ustawienia własnej wartości obowiązuje domyślne 6 sekund, a obok widać kafelek **Storyboard default**. Po ustawieniu własnej wartości pojawia się przycisk **Use storyboard default**, który ją czyści. Niektórzy dostawcy wideo mogą przyciąć wartość do niższego maksimum, więc dokładna długość nie jest gwarantowana.

W trybie podglądu **Background** każda animacja odtwarza się raz, z dźwiękiem, w chwili gdy jej fragment fabuły staje się aktywny. Narracja może się wyświetlać w trakcie odtwarzania, ale automatyczne odtwarzanie narracji czeka na koniec klipu. Animacja zatrzymuje się potem na ostatniej klatce. Pasek narzędzi gry daje kontrolki powtórzenia, odtwarzania/pauzy i wyciszenia, zarówno na komputerze, jak i na telefonie. Pływające wideo storyboardu też odtwarza się raz i można je powtórzyć zamiast puszczać w kółko.

Plan wizualny powstaje w dwóch planerach. **Illustration Planner** służy do storyboardów nieruchomych. **Animation Planner** działa przy generowaniu wideo i tworzy zarówno opis obrazu gotowego do animacji, jak i zwięzłą wskazówkę ruchu.

Ustawienie **Storyboard Illustration Prompt** formatuje potem opis obrazu z planera w gotowe zapytanie wysyłane do modelu obrazowego. W istniejących czatach domyślną wartością jest **Game Scene Illustration**. Wybór **Storyboard Illustration** zostawia wynik planera na pierwszym planie, a dokłada do niego referencje postaci, uwagi o wyglądzie, kierunek artystyczny kampanii oraz instrukcje obrazowe.

**Storyboard Video Prompt** to co innego niż ogólne ustawienie **Game Video Prompt** w sekcji **Scene Videos**. Łączy wygenerowaną klatkę kluczową, wskazówkę ruchu z planera Animation Planner i bieżący kontekst sceny w gotowe zapytanie wysyłane do modelu wideo. Zostaw wartość odziedziczoną, żeby korzystać z ogólnego promptu, albo wybierz **Anime Game Video** dla klipów klatek kluczowych, nie zmieniając przy tym ręcznych wideo z panelu **Gallery** ani z sekcji **Game Assets**.

Wybierz **Comic Page Animation** dla stron źródłowych komiksu dopasowanych do długości klipu, a potem wskaż **Comic Page Video**, żeby te kadry zostały odczytane jako uporządkowane wizualne punkty odniesienia dla jednego klipu. Pierwotny **Comic Page** nadal jest dostępny dla zwykłych ilustracji. Osobny wybór wideo nie rusza odziedziczonego ustawienia **Game Video Prompt** ani ręcznych wideo z panelu **Gallery** i sekcji **Game Assets**.

Nowe gry utworzone z prezentacją **Storyboard Optimized** dostają **Storyboard Game Prompt**, planer **Comic Page Animation**, **Storyboard Illustration** oraz **Comic Page Video**. Taki czat da się w każdej chwili przełączyć na kombinację pojedynczego ujęcia, wybierając **Still Keyframe Animation** i **Anime Game Video**.

### LTX 2.3 image-to-video

Przy lokalnym przepływie pracy LTX 2.3 w aplikacji ComfyUI zacznij od ustawień: **LTX Simple Image-to-Video** jako Animation Planner, **Storyboard First Frame** jako Storyboard Illustration Prompt i **LTX Director Video** jako Storyboard Video Prompt. Animation Planner tworzy zarówno prompt obrazu T=0 w języku naturalnym, jak i pełny akapit opisujący ruch. Storyboard First Frame przekazuje scenę T=0 do dostawcy obsługującego język naturalny, z minimalną obudową, a LTX Director Video wysyła akapit ruchu na wejście `%prompt%` przepływu pracy. **LTX Director Storyboard** to wariant bardziej szczegółowy, świadomy długości klipu; korzysta z tego samego promptu wideo i tego samego kontraktu przepływu pracy.

Wybór modelu, symbole zastępcze ComfyUI, komplet ustawień gry, kroki weryfikacji i rozwiązywanie problemów opisuje przewodnik [Storyboardy LTX 2.3 w Game Mode](ltx-2-3-storyboards.md).

## Presety stylu

Presety planerów decydują o tym, jak wybierana i opisywana jest każda klatka kluczowa. Wskazują je dwa selektory:

- **Illustration Planner** działa, gdy storyboardy tworzą nieruchome klatki kluczowe bez wideo. Domyślnie: **Still Keyframes**.
- **Animation Planner** działa, gdy włączona jest opcja **Automatic Storyboard Animations**. Domyślnie: **Comic Page Animation**.

Oba selektory mają osobne listy presetów. Presety ilustracji opisują gotowe obrazy nieruchome i mogą zawierać komiksowe lub mangowe napisy widoczne dla czytelnika. Presety animacji opisują stabilną pierwszą klatkę oraz wskazówkę ruchu dopasowaną do długości klipu. Preset ilustracji nigdy nie pojawi się w menu Animation Planner, a preset animacji nigdy nie pojawi się w menu Illustration Planner.

| Ścieżka | Preset | Najlepszy do |
| --- | --- | --- |
| Ilustracja | **Still Keyframes** | Zwykłego czytania. Klatki kluczowe z jedną sceną, bez kadrów komiksowych, dymków, podpisów i napisów dźwiękowych. |
| Ilustracja | **NovelAI Keyframes** | Zwięzłych promptów tagowych do obrazów nieruchomych, dostrojonych pod NovelAI V4 i V4.5. Dla czystego promptu tagowego wyłącz opcję **Use Storyboard Template**. |
| Ilustracja | **Comic Page** | Gotowych ilustracji w formie strony komiksu z 2-6 kadrami, dymkami dialogowymi, podpisami i liternictwem. |
| Ilustracja | **Colored Manga** | Gotowych kolorowych kadrów mangi z cieniowaniem płaskim, rastrami, dymkami i napisami dźwiękowymi. |
| Ilustracja | **B&W Manga** | Gotowej czarno-białej mangi z tuszem, rastrami, mocnymi czerniami, dymkami i napisami dźwiękowymi. |
| Animacja | **Still Keyframe Animation** | Uporządkowanych pojedynczych ujęć z dokładną pierwszą klatką, jednym głównym ruchem, prostą pracą kamery, ruchem otoczenia i przytrzymaniem na końcu. |
| Animacja | **Anime Episode Director** | Pojedynczych ujęć w stylu anime telewizyjnego, z ciągłością pierwszej klatki, zwięzłą wskazówką ruchu i kadrowaniem bezpiecznym dla dostawców. |
| Animacja | **NovelAI Keyframe Animation** | Pierwszych klatek opartych na tagach NovelAI, z czasem i ruchem opisanymi osobno we wskazówce animacji. |
| Animacja | **Comic Page Animation** | Stron źródłowych komiksu dopasowanych do długości klipu, których chronologiczne kadry służą jako uporządkowane odniesienia wizualne dla jednego klipu. |
| Animacja | **Colored Manga Animation** | Pierwszych klatek kolorowej mangi bez tekstu, z ruchem zachowującym kreskę i cieniowanie płaskie. |
| Animacja | **B&W Manga Animation** | Pierwszych klatek monochromatycznych bez tekstu, z ruchem zachowującym tusz i rastry. |

Preset **Still Keyframe Animation** to neutralny stylistycznie odpowiednik presetu **Still Keyframes** w wersji z ruchem. **Anime Episode Director** to osobna, wyspecjalizowana opcja, którą łączy się z **Anime Game Video**, gdy chodzi o planowanie ujęć jak w anime telewizyjnym. Trzyma drastyczną przemoc poza kadrem i buduje ją tam, gdzie się da, przez wyczekiwanie, zasłonięcie, reakcję albo skutki. Dzięki temu dostawcy rzadziej odrzucają obraz, a kanoniczna opowieść GM zostaje bez zmian.

Preset **Comic Page Animation** dobiera gęstość strony do długości klipu animacji. Domyślnie daje 2 kadry przy klipie 6-7 sekund i dopuszcza trzeci tylko przy trzech prostych fragmentach po mniej więcej 2 sekundy; przy 8-10 sekundach używa 2-3 kadrów, a przy dłuższych klipach nie więcej niż 4. Strony animowane stawiają rytm wizualny ponad liternictwo, trzymają każdy kadr skupiony na jednej rzeczy i rezerwują krótkie przytrzymanie na końcu. Kadry układają się w kolejności czytania, zgodnie z zasadą przyczyny i skutku. **Comic Page Video** zwykle wchodzi od razu w kadr 1; pozwala na bardzo krótkie ujęcie całej strony tylko wtedy, gdy nie zdradzi to przedwcześnie późniejszego skutku.

Preset **NovelAI Keyframes** pisze zwięzłe tagi Danbooru. Tagi Danbooru to krótkie słowa kluczowe oddzielone przecinkami, których oczekują niektóre modele obrazowe od anime. Wybór presetu animacji, komiksu albo mangi sam z siebie nie włącza animacji. Do klipów nadal potrzebna jest opcja **Automatic Storyboard Animations** i połączenie wideo.

## Styl artystyczny kampanii i profile stylu obrazu

Konfiguracja gry tworzy styl artystyczny na poziomie całej kampanii, żeby obrazy trzymały się jednej konwencji. W istniejącej grze otwórz **Chat Settings > Agents > Illustrator** i zobacz go pod nagłówkiem **Campaign art style**. Da się go edytować, wyczyścić, przywrócić pierwotne brzmienie z konfiguracji albo wyłączyć opcję **Use Campaign Art Style**.

Styl artystyczny kampanii i profil **Image Style** to dwie osobne warstwy promptu. Gdy oba są włączone, Marinara dokłada oba. Wyłączenie albo wyczyszczenie stylu kampanii zostawia wybrany profil Image Style nietknięty. To ustawienie dotyczy klatek kluczowych storyboardu oraz pozostałych generowanych materiałów wizualnych w grze.

Przy włączonej opcji **Expose image prompts before sending** w sekcji **Settings > Generation** ręczne żądania **Create storyboard** pokazują najpierw dokładne, gotowe prompty pozytywne i negatywne dla wszystkich zaplanowanych klatek kluczowych. Zmiany wprowadzone w tym podglądzie obowiązują tylko dla tego jednego storyboardu; nie zastępują ustawień stylu kampanii ani profilu Image Style.

## Edytowanie presetów storyboardu

Wbudowanych presetów nie da się zmieniać. Żeby zrobić własny, otwórz w sekcji **Storyboards** jedną z opcji: **Edit Illustration Planner Presets**, **Edit Animation Planner Presets**, **Edit Illustration Prompt Presets** albo **Edit Video Prompt Presets**. Każda sekcja pokazuje tylko wbudowane presety i własne kopie dla danego etapu.

Skopiuj wbudowany preset do edytowalnego szablonu związanego z jednym czatem, a potem wybierz tę kopię w odpowiednim selektorze. Kopii z Illustration Planner nie da się wybrać jako Animation Planner, a kopii z Animation Planner jako Illustration Planner. Kopie ustawienia Storyboard Illustration Prompt wpływają wyłącznie na obrazy storyboardu. Kopie promptów wideo pozostają wspólne z ogólnym ustawieniem Game Video Prompt, więc może z nich korzystać każdy z selektorów wideo.

Każda własna kopia ma nazwę, krótki opis i treść promptu do edycji. Przycisk kosza usuwa kopię po potwierdzeniu w oknie dialogowym. Takie kopie zapisują się przy tym jednym czacie, a nie w całej aplikacji.

## Podgląd storyboardu

Podgląd podąża za miejscem, w którym trwa czytanie. Pokazuje klatkę kluczową, której sekcja czytania odpowiada bieżącemu miejscu w tekście tury. To nie jest po prostu "najnowszy obraz z panelu **Gallery**". Są dwa style wyświetlania, wybierane w ustawieniu **Viewer Display**.

Domyślny jest tryb **Floating**. Nad grą siedzi mały panel, który da się przeciągać. W jego nagłówku widnieje napis **Storyboard**. Odtwarza wideo klatki kluczowej, gdy jest gotowe, a w czasie oczekiwania na klip albo po jego niepowodzeniu wraca do obrazu.

Pływający podgląd ma takie kontrolki:

- **Close storyboard viewer** ukrywa panel tylko na czas bieżącej tury. Panel wraca po zakończeniu następnej tury GM. Odświeżenie strony też cofa ukrycie.
- **Drag storyboard viewer** to uchwyt w nagłówku. Przeciągnij panel w dowolne miejsce ekranu.
- **Play storyboard video** i **Pause storyboard video** sterują odtwarzaniem klipu. Klipy startują wyciszone.
- **Mute storyboard video** i **Unmute storyboard video** pokazują się tylko wtedy, gdy klatka kluczowa ma gotowy klip.
- **Change storyboard viewer size** przełącza po kolei trzy szerokości: małą, średnią (domyślną) i dużą.
- Uchwyt w rogu pozwala zmieniać rozmiar panelu dowolnie i ma pierwszeństwo przed ustawioną szerokością.

Tryb **Background** wypełnia aktywną klatką kluczową całą powierzchnię gry, zamiast pływającej karty. Obraz albo klip siedzi za kontrolkami gry. Miejsce czytania działa tak samo jak w podglądzie pływającym.

Tryb tła ma swoją cenę. Wyłącza normalne generowane tło lokacji sceny. Kiedy jest włączony, przycisk **Generate background** w panelu podręcznym ilustratora jest nieaktywny. Przycisk pokazuje wtedy taką informację: "Storyboard background display is active, so scene background generation is disabled."

## Jak uzyskać lepsze efekty

Storyboard jest tylko tak czytelny jak tura, którą czyta. Najlepsze tury mówią, kto się rusza, co się zmienia i gdzie jest kluczowy moment. Mglista tura w stylu "walka trwa dalej" daje silnikowi mniej do narysowania niż tura z konkretną akcją i szczegółami otoczenia.

Dla większej powtarzalności:

- Opisz konkretnie miejsce akcji, ton i styl artystyczny już przy konfiguracji gry.
- Używaj kart postaci ze szczegółowymi awatarami i włącz opcję **Send Avatar References**.
- Trzymaj w narracji jasno opisane ważne stroje, rany, rekwizyty i lokacje.
- Wybieraj profile stylu obrazu pod wykończenie, o które chodzi.
- Do zwykłego czytania używaj presetu **Still Keyframes**, a przy włączonych klipach presetu komiksowego lub mangowego.

## Opcje NovelAI

Żeby wysłać zwięzłe zapytanie do NovelAI, wybierz **NovelAI Keyframes** i wyłącz opcję **Use Storyboard Template** w sekcji **Storyboards**. Zaplanowany prompt sceny idzie wtedy prosto do modelu, a osobne ustawienia wyglądu, obrazów referencyjnych, instrukcji obrazowych i stylu nadal są dostępne.

Opcja **Use NovelAI Character Prompts** przepuszcza każdą widoczną postać przez natywne podpisy i pozycje NovelAI Add Character. Domyślnie jest włączona. Ważne: działa tylko przy oficjalnym połączeniu NovelAI z modelem V4 lub V4.5 na novelai.net. Przy każdym innym dostawcy lub modelu przełącznik nic nie robi, a Marinara używa wspólnego, starszego promptu.

## Rozwiązywanie problemów

**"Choose an Illustrator image connection in Game Settings first."** Otwórz panel **Chat Settings**, zakładkę **Agents**, a potem sekcję **Illustrator**. Włącz opcję **Game Illustrator** i wybierz połączenie w polu **Image Connection**. W nowej grze włącz opcję **Visual Generation** i wybierz połączenie w polu **Image Generation Connection** w kreatorze konfiguracji.

**"Storyboards can only be generated from GM narration turns."** Przycisk **Create storyboard** działa tylko na zakończonej turze narracji GM. Nie działa na własnych wiadomościach gracza. Poczekaj, aż GM skończy odpowiedź, i spróbuj ponownie.

**"This GM turn has no narration to storyboard."** Tura nie ma tekstu fabularnego do narysowania. Zdarza się to, gdy tura GM zawiera same ukryte znaczniki poleceń i żadnej narracji. Graj dalej, aż GM napisze turę z tekstem fabularnym, i zrób storyboard z niej.

**Obrazy się pojawiają, ale wideo nie.** Wideo wymaga włączonej opcji **Automatic Storyboard Animations** i wybranego połączenia **Video Generation**. Przy wyłączonych animacjach storyboardy tworzą tylko nieruchome klatki kluczowe.

**Storyboardy automatyczne się nie uruchamiają.** Sprawdź, czy włączona jest opcja **Automatic Storyboard Illustrations** albo **Automatic Storyboard Animations**. Sprawdź też, czy połączenie obrazowe jest ustawione i czy tura GM skończyła się streamować. Marinara nie zrobi drugiego storyboardu dla tury, która już go ma. Nadal da się go odtworzyć ręcznie przyciskiem **Create storyboard** w panelu **Gallery**.

**Storyboard jest niepełny albo stoi w miejscu.** Zwykle znaczy to, że jedno lub więcej zadań obrazowych albo wideo się nie powiodło, przekroczyło limit czasu lub trafiło na limit zapytań dostawcy. Zadanie może też zablokować niedozwolona treść. Jeśli dostawca jest powolny, zwiększ limity czasu generowania obrazów i wideo w pliku `.env`, a potem uruchom ponownie aplikację Marinara Engine. Dokładne nazwy zmiennych podaje przewodnik [Konfiguracja serwera](../CONFIGURATION.md).

Do głębszej diagnozy ustaw poziom logowania na debug i obserwuj log serwera (dziennik serwera). Linie logu dotyczące storyboardu mają znaczniki `[debug/game/storyboard-illustrator]`, `[debug/game/storyboard-image-preview]`, `[debug/game/storyboard-image-assets]` oraz `[debug/game/storyboard-video]`.

## Powiązane przewodniki

- [Generowanie wideo scen](../media/scene-video.md)
- [Dostawcy generowania obrazów](../media/image-providers.md)
- [Game Mode: pierwsze kroki](getting-started.md)
- [Storyboardy LTX 2.3 w Game Mode](ltx-2-3-storyboards.md)
