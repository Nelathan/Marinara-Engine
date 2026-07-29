# Wpisy lorebooka: słowa kluczowe, pozycja i czas działania

Ten przewodnik wyjaśnia, jak budować wpisy w lorebooku (zbiorze faktów o twoim świecie). Opisuje zakładkę **Entries** (wpisy), słowa kluczowe wyzwalające wpis oraz trzy typy wpisów. Pokazuje też, w którym miejscu promptu ląduje każdy wpis i jakie ustawienia czasu decydują o momencie jego uruchomienia. Jeśli lorebooki są nowością, zacznij od przewodnika [Lorebooki – przegląd](overview.md).

Wpis to jeden blok tekstu plus reguły, które decydują o tym, kiedy Marinara Engine dokłada ten tekst do promptu AI (prompt to tekst, który Marinara wysyła do AI). Aktywny wpis wstawia swoją treść do promptu, dzięki czemu AI "pamięta" fakt, którego nigdy nie wpisano w czacie.

## Zakładka Entries

Otwórz lorebook w panelu **Lorebooks**, żeby wejść do pełnoekranowego edytora. Edytor ma dwie boczne zakładki: **Overview** (przegląd) i **Entries**. Kliknij zakładkę **Entries**, aby zobaczyć listę wpisów. Plakietka przy zakładce pokazuje, ile wpisów liczy lorebook.

Pasek narzędzi na górze zakładki **Entries** zawiera te kontrolki:

- Pole **Search entries…**: filtruje listę po nazwie wpisu, słowach kluczowych lub treści.
- Lista rozwijana sortowania z opcjami **Order**, **Entries**, **Name A→Z**, **Name Z→A**, **Tokens ↓**, **Keys ↓**, **Newest** i **Oldest**. Opcje ze strzałką ↓ sortują od największych do najmniejszych.
- **Select** (zaznaczanie): włącza tryb wielokrotnego wyboru, żeby skopiować, przenieść lub usunąć kilka wpisów naraz.
- **Add Folder** (dodanie folderu): tworzy folder grupujący wpisy (opisuje go sekcja o folderach wpisów poniżej).
- **Add Entry** (dodanie wpisu): tworzy nowy, pusty wpis na górze listy.

Pod paskiem narzędzi jedna linia podsumowania pokazuje liczbę wpisów, liczbę folderów i łączny szacowany rozmiar treści wszystkich wpisów w tokenach (token to mały kawałek tekstu).

## Dodawanie i edycja wpisu

Wykonaj kolejno te kroki, żeby utworzyć wpis.

1. Otwórz swój lorebook i kliknij zakładkę **Entries**.
2. Kliknij przycisk **Add Entry**. Na liście pojawia się nowy wiersz.
3. Wpisz nazwę w polu nazwy w tym wierszu. Każdy wpis musi mieć nazwę.
4. Kliknij wiersz (albo strzałkę na jego końcu), żeby rozwinąć pełny panel boczny edytora.
5. Uzupełnij słowa kluczowe i treść – opisują je sekcje poniżej.

Zmiany zapisują się same. Podczas pisania panel pokazuje kolejno **Autosaving…**, **Saving…** i **Saved automatically**. Jeśli zapis się nie uda, tekst zostaje na miejscu, a Marinara ponawia próbę przy następnej zmianie. Wpisy nie mają osobnego przycisku zapisu.

Każdy wpis wyświetla się jako zwarty, jednolinijkowy wiersz. Wiersz mieści najczęściej używane kontrolki. Resztę widać po rozwinięciu wiersza.

Aby powielić wpis, najedź na wiersz i kliknij przycisk **Duplicate** (powielenie). Aby go usunąć, kliknij przycisk **Delete** (usunięcie). Marinara prosi o potwierdzenie komunikatem "Delete this lorebook entry?".

## Treść wpisu i słowa kluczowe

Rozwiń wpis, żeby edytować jego główne pola.

- **Primary Keys** (główne słowa kluczowe): słowa kluczowe wyzwalające ten wpis. Kiedy w niedawnych wiadomościach czatu pada którekolwiek z nich, wpis się aktywuje. Wpisz słowo kluczowe i naciśnij Enter, żeby dodać je jako kafelek.
- **Content** (treść): tekst wstawiany do promptu AI w chwili aktywacji wpisu. Zapisz go jako zwykły fakt, który AI ma znać. Treść obsługuje makra promptu, a pod polem widać bieżący szacunek liczby tokenów.
- **Secondary Keys** (dodatkowe słowa kluczowe): dodatkowe słowa kluczowe, używane tylko przy typie wpisu **Selective**. Zajrzyj do sekcji o typach wpisów poniżej.
- **Description** (opis): krótkie streszczenie wpisu. Czyta je wyłącznie agent **Knowledge Router**, żeby zdecydować, czy wstawić wpis. Ten tekst nigdy nie trafia do głównego AI jako treść. Zobacz [Źródła wiedzy: agenci Knowledge Retrieval i Knowledge Router](../agents/knowledge-sources.md).

Oto prosty przykład.

- Nazwa: `Silverhaven`
- Primary Keys: `Silverhaven`, `the capital`
- Content: `Silverhaven is the mountain capital. Its people mine blue crystal and distrust outsiders.`

Kiedy w czacie padnie `Silverhaven` albo `the capital` – z twojej strony lub ze strony AI – model automatycznie dostaje ten fakt.

## Reguły dopasowania słów kluczowych

Domyślnie główne słowo kluczowe pasuje, jeśli pojawia się gdziekolwiek w niedawnym tekście czatu, niezależnie od wielkości liter. Sposób dopasowania zmieniają trzy kontrolki. **Whole Words** i **Case Sensitive** siedzą w rozwiniętym panelu bocznym. Przełącznik **Regex** to mała ikona w zwartym wierszu, która po włączeniu robi się pomarańczowa.

| Kontrolka | Gdzie | Domyślnie | Co robi |
|---|---|---|---|
| **Whole Words** | Panel boczny wpisu | Off | Słowo kluczowe musi pasować do całego wyrazu, a nie do fragmentu dłuższego wyrazu. |
| **Case Sensitive** | Panel boczny wpisu | Off | Wielkość liter musi zgadzać się dokładnie. |
| **Regex** | Zwarty wiersz | Off | Traktuje każde słowo kluczowe jak wzorzec wyrażenia regularnego zamiast zwykłego tekstu. |

Regex (wyrażenie regularne) to język opisu wzorców tekstowych. Sięgaj po niego tylko wtedy, gdy znasz regex. Dla bezpieczeństwa Marinara nakłada na każde słowo kluczowe z regexem krótki limit czasu. Zbyt wolny wzorzec nie dopasuje się w danym skanowaniu, więc buduj proste wzorce.

## Typy wpisów: Normal, Constant, Selective

Każdy wpis ma swój typ. Kliknij małą kolorową kropkę w wierszu wpisu, aby otworzyć menu typów i wybrać jeden z nich.

- **Normal** (zielona kropka): wyzwala się, gdy główne słowo kluczowe pasuje do skanowanego tekstu. To ustawienie domyślne.
- **Constant** (żółta kropka): wstawia się za każdym razem, gdy lorebook jest aktywny, bez żadnego słowa kluczowego. Nadaje się do faktów, które muszą być obecne zawsze.
- **Selective** (czerwona kropka): muszą pasować główne słowa kluczowe, a dodatkowo musi się zgadzać logika dodatkowych słów kluczowych.

Wpis typu **Constant** nadal podlega ustawieniom czasu, prawdopodobieństwu i wszystkim ustawionym filtrom. Nie potrzebuje tylko słowa kluczowego.

Przy typie **Selective** dodaj w polu **Secondary Keys** co najmniej jedno słowo kluczowe i wybierz przycisk **Logic** (logika) w panelu bocznym:

- **AND Any**: musi pojawić się przynajmniej jedno dodatkowe słowo kluczowe.
- **AND All**: muszą pojawić się wszystkie dodatkowe słowa kluczowe.
- **NOT Any**: wpis jest blokowany, jeśli pojawi się którekolwiek dodatkowe słowo kluczowe.
- **NOT All**: wpis jest blokowany tylko wtedy, gdy pojawią się wszystkie dodatkowe słowa kluczowe.

Weźmy przykład: wpis typu **Selective** z głównym słowem kluczowym `king`, dodatkowym słowem kluczowym `Silverhaven` i logiką **AND Any**. Uruchamia się dopiero wtedy, gdy w czacie padnie i król, i Silverhaven. Dzięki temu pospolite słowo w rodzaju `king` nie wyzwala wpisu w niewłaściwej scenie.

## Position, Depth i Order

Te kontrolki decydują o tym, w którym miejscu promptu ląduje aktywowany wpis. Na szerokim ekranie znajdują się w zwartym wierszu. Na wąskim ekranie dotknij przycisku szybkich kontrolek w wierszu, żeby do nich dotrzeć.

- **Position** (pozycja): wybierz **Before chat**, **After chat**, **@ Depth** albo **Outlet**. Before chat i After chat umieszczają wpis wokół historii czatu. **@ Depth** wstawia wpis wewnątrz historii czatu. **Outlet** nie wstawia wpisu automatycznie – udostępnia aktywowaną treść nazwanemu makru `{{outlet::name}}`. Na szerokim ekranie wiersz pokazuje pierwsze trzy pozycje w postaci skróconych etykiet **↑Char**, **↓Char** i **@Depth**.
- **Depth** (głębokość): pojawia się tylko wtedy, gdy pole **Position** ma wartość **@ Depth**. Ustawia, ile wiadomości wstecz od ostatniej wiadomości trafia wpis. Domyślnie 4.
- **Order** (kolejność): kolejność wstawiania, gdy naraz aktywuje się kilka wpisów. Niższa liczba trafia do promptu wcześniej. Domyślnie 100.

Po wybraniu wartości **Outlet** pojawia się pole **Outlet name** (nazwa outletu). Wpisz dokładną nazwę z uwzględnieniem wielkości liter, na przykład `character_rules`, a potem umieść `{{outlet::character_rules}}` w sekcji promptu. Każdy wpis przypisany do tego outletu (nazwanego punktu wstawiania) nadal podlega swoim zwykłym regułom: słów kluczowych, typu constant, prawdopodobieństwa, filtrów, czasu, limitu wpisów i limitu tokenów. Marinara zbiera wyłącznie wpisy aktywowane dla bieżącego generowania. Wpisy o tej samej nazwie outletu łączą się w kolejności Order, rozdzielone znakami nowej linii.

Makro outletu bez aktywnych pasujących wpisów zwraca pustkę. Treść outletu nie może wywołać kolejnego makra outletu, co zapobiega rekurencyjnym pętlom outletów. Makra outletu działają w sekcjach promptu w trybach Conversation, Roleplay i Game Mode.

## Prawdopodobieństwo wyzwolenia

Każdy wpis ma wartość **Probability** (prawdopodobieństwo), pokazywaną w wierszu jako procent. Domyślnie wynosi 100%, czyli wpis uruchamia się zawsze, gdy jego słowa kluczowe pasują. Obniż ją, żeby wpis uruchamiał się tylko czasem. Na przykład 25% oznacza jedną szansę na cztery przy każdym dopasowaniu słów kluczowych.

## Czas działania: Sticky, Cooldown, Delay, Ephemeral

Pola **Timing** (czas działania) w panelu bocznym sterują zachowaniem wpisu na przestrzeni kilku wiadomości. **Sticky**, **Cooldown** i **Delay** liczą wiadomości. **Ephemeral** liczy aktywacje. Wszystkie cztery są początkowo nieustawione (0, czyli wyłączone).

- **Sticky**: po wyzwoleniu wpis pozostaje aktywny przez tyle kolejnych wiadomości, nawet bez świeżego dopasowania słowa kluczowego.
- **Cooldown**: po wyzwoleniu wpis czeka tyle wiadomości, zanim może wyzwolić się ponownie.
- **Delay**: wpis czeka tyle wiadomości od początku czatu, zanim może aktywować się po raz pierwszy.
- **Ephemeral**: wpis wyłącza się sam po tylu aktywacjach. Wartość 0 oznacza brak limitu.

Na przykład ustaw **Sticky** na 3, żeby zatrzymać fakt w treści promptu na kilka tur po tym, jak się pojawi. Dzięki temu AI nie zapomina o nim w środku sceny.

## Więcej opcji wpisu

W rozwiniętym panelu bocznym czeka jeszcze kilka pól.

- **Role** (rola): decyduje o tym, czy wstawiony tekst jest oznaczony jako **System**, **User** czy **Assistant**. Ma to znaczenie tylko wtedy, gdy pole **Position** ma wartość **@ Depth**. Domyślnie **System**.
- **Group** (grupa) i **Tag**: umieść wpisy w tej samej grupie **Group**, żeby aktywował się tylko jeden z nich naraz. Pole **Tag** to dowolna etykieta tekstowa do własnego sortowania.
- **Locked** (zablokowany): nie pozwala agentowi **Lorebook Keeper** zmieniać tego wpisu. Zobacz [Agenci do pobrania: przegląd pakietów](../agents/built-in-agents.md).
- **No Vector** i plakietka stanu wektorów dotyczą wyszukiwania semantycznego. Zobacz [Wyszukiwanie semantyczne w lorebookach](semantic-search.md).

Panel boczny ma też sekcję **Context filters & matching sources** (filtry kontekstu i źródła dopasowania). Można w niej ograniczyć wpis do wybranych postaci, tagów postaci lub typów generowania. Da się też przeszukiwać pod kątem słów kluczowych wpisu dodatkowe pola karty postaci, na przykład opis postaci.

## Narzędzie Keyword test

Panel **Keyword test** (test słów kluczowych) na górze zakładki **Entries** pozwala sprawdzić słowa kluczowe bez rozpoczynania czatu. Rozwiń go i wklej do pola przykładowy akapit albo kilka wiadomości.

Wpisy, których słowa kluczowe by pasowały, dostają zielone wyróżnienie i kafelek **Would activate**. Wpisy typu **Constant** dostają kafelek **Always active**, bo uruchamiają się niezależnie od treści tekstu. Linia z licznikiem pokazuje, ile z włączonych wpisów by się aktywowało.

Ten test sprawdza wyłącznie reguły słów kluczowych. Pomija czas działania, prawdopodobieństwo, filtry postaci i dopasowanie semantyczne, więc żywy czat może wypaść inaczej niż podgląd.

## Foldery wpisów

Foldery grupują wpisy wewnątrz jednego lorebooka. To co innego niż foldery biblioteki w głównym panelu **Lorebooks**.

- Kliknij przycisk **Add Folder**, żeby utworzyć folder, a potem zmień jego nazwę na miejscu.
- Przeciągnij wpis na folder, żeby go tam umieścić, albo wskaż folder w polu **Folder** we wpisie.
- Przeciągnij folder na inny folder, żeby go zagnieździć, albo przeciągnij go na górny pasek, żeby wyciągnąć go na najwyższy poziom.
- Każdy folder ma przełącznik **Enabled** (włączony). Wyłączony folder zatrzymuje aktywację wszystkich wpisów w środku, nawet jeśli własny przełącznik wpisu jest włączony.
- Nagłówek folderu ma też przyciski **Clone** (klonowanie) i **Delete**. **Clone** kopiuje folder w całości, razem ze wszystkimi wpisami i podfolderami. **Delete** usuwa wyłącznie sam folder. Jego wpisy i podfoldery przechodzą poziom wyżej.

Foldery wyświetlają się jako grupy tylko przy sortowaniu **Order** i pustym wyszukiwaniu. Każde inne sortowanie lub wyszukiwanie przełącza widok na płaską listę i pokazuje notkę "Folder view paused (clear search and sort by Order)".

## Powiązane przewodniki

- [Lorebooki – przegląd](overview.md)
- [Limity tokenów i rekurencja w lorebookach](token-budgets.md)
- [Wyszukiwanie semantyczne w lorebookach](semantic-search.md)
- [Źródła wiedzy: agenci Knowledge Retrieval i Knowledge Router](../agents/knowledge-sources.md)
