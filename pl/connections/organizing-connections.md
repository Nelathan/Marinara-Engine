# Porządkowanie połączeń

Z tego przewodnika dowiesz się, jak utrzymać porządek wśród zapisanych połączeń w aplikacji Marinara Engine. Opisuje foldery połączeń, wyszukiwanie i sortowanie, duplikowanie i usuwanie, pulę losową, panel **Quick Connection Switcher** (szybkie przełączanie połączeń) oraz eksport i import połączeń. Połączenie to zapisany zestaw ustawień, dzięki któremu Marinara wie, jak dotrzeć do jednej usługi AI.

Wszystko to robi się w panelu **Connections** (Połączenia). Po jego otwarciu zapisane połączenia pokazują się jako lista wierszy. W każdym wierszu widać nazwę połączenia, a pod nią dostawcę i model.

## Foldery połączeń

Grupuj powiązane ze sobą połączenia w folderach. Na przykład wszystkie modele lokalne trafiają do jednego folderu, a wszyscy płatni dostawcy do drugiego.

Aby utworzyć folder, wykonaj kolejno te kroki:

1. Kliknij przycisk **New Folder** (nowy folder) nad listą połączeń.
2. Pojawia się nowy folder o nazwie "unnamed".
3. Zmień jego nazwę od razu, żeby dało się go odróżnić (opis poniżej).

Aby zmienić nazwę folderu, kliknij dwukrotnie wiersz folderu, a na ekranie dotykowym dotknij go dwa razy. Inna opcja: zaznacz wiersz folderu i naciśnij klawisz **F2**. Wpisz nową nazwę i naciśnij Enter.

Aby wrzucić połączenie do folderu, przeciągnij wiersz połączenia i upuść go na folderze. Aby wyjąć połączenie z powrotem, przeciągnij je na obszar pod folderami. W trakcie przeciągania widać podpowiedź **Drop here to move out of folder**.

Aby zwinąć lub rozwinąć folder, kliknij jego wiersz raz. Mała liczba w wierszu folderu pokazuje, ile połączeń jest w środku.

Aby usunąć folder, kliknij ikonę kosza w jego wierszu. Jeśli w folderze wciąż są połączenia, Marinara prosi o potwierdzenie w oknie **Delete Folder** (usunięcie folderu). Pusty folder znika od razu, bez pytania o potwierdzenie. Usunięcie folderu nie usuwa połączeń, które są w środku. Te połączenia wracają do obszaru poza folderami.

## Wyszukiwanie i sortowanie

Pole **Search connections...** filtruje listę w trakcie pisania. Dopasowanie obejmuje nazwę połączenia, dostawcę, model, bazowy adres URL, usługę obrazów lub wideo oraz model embeddingu. Gdy nic nie pasuje, widać komunikat "No connections match your search".

Lista rozwijana **Sort order** (kolejność sortowania) obok pola wyszukiwania zmienia kolejność listy. Ma pięć opcji:

| Opcja | Co robi |
|---|---|
| **Custom** | Twoja własna kolejność ustawiona przeciąganiem. |
| **A-Z** | Sortuje po nazwie, od A do Z. |
| **Z-A** | Sortuje po nazwie, od Z do A. |
| **Newest** | Najnowsze połączenia na górze. |
| **Oldest** | Najstarsze połączenia na górze. |

Aby ustawić własną kolejność, przeciągaj wiersze połączeń w górę lub w dół. Przeciągnięcie połączenia automatycznie przełącza sortowanie na **Custom**.

## Duplikowanie i usuwanie

Najedź kursorem na wiersz połączenia, żeby zobaczyć jego przyciski akcji, a na ekranie dotykowym po prostu spójrz na wiersz.

Aby zduplikować połączenie, kliknij przycisk **Duplicate** (duplikowanie) z ikoną kopiowania. Powstaje pełna kopia razem z zapisanym kluczem API, czyli tajnym kodem, trochę jak hasło. Kopia otwiera się w edytorze, więc od razu da się zmienić jej nazwę. Nie ma kroku potwierdzenia.

Aby usunąć pojedyncze połączenie, kliknij jego przycisk **Delete** (usunięcie) z ikoną kosza. Marinara pokazuje okno **Delete Connection** z treścią Delete "your connection name"? This cannot be undone. Kliknij przycisk **Delete**, żeby potwierdzić.

Aby usunąć lub wyeksportować kilka połączeń naraz, kliknij przycisk **Select** (wybieranie) u góry panelu. Włącza się tryb zaznaczania. Dotknij połączeń, które mają zostać objęte operacją, a potem użyj przycisku **Export** lub **Delete** na pasku akcji na dole. Przy usuwaniu zbiorczym pojawia się najpierw okno **Delete Connections**.

## Pula losowa i panel Quick Connection Switcher

Dzięki puli losowej czat przy każdej odpowiedzi wybiera inne połączenie. Przydaje się to wtedy, gdy zapytania mają się rozkładać na kilku dostawców lub kilka modeli.

Aby dodać połączenie do puli losowej, kliknij ikonę tasowania w jego wierszu. Podpowiedź brzmi **Add to random pool**. Gdy połączenie jest już w puli, podpowiedź zmienia się na **In random pool (click to remove)**. Ponowne kliknięcie ikony wyjmuje połączenie z puli.

Aby czat korzystał z puli losowej, otwórz **Chat Settings** (ustawienia czatu), znajdź sekcję **Connection** i wybierz z listy rozwijanej opcję **🎲 Random**. W trybie Game Mode ta lista rozwijana nosi nazwę **GM / Party Model**. Każda odpowiedź losuje wtedy połączenie z puli.

Panel **Quick Connection Switcher** to szybszy sposób na zmianę połączenia w otwartym czacie. Kliknij ikonę ogniwa w polu wpisywania wiadomości, żeby go otworzyć. Połączenia pokazują się w małym menu:

- Kliknij połączenie, żeby od razu użyć go w bieżącym czacie.
- Kliknij przycisk z kością u góry menu, żeby włączyć lub wyłączyć pulę losową dla tego czatu.
- Gdy pula losowa jest włączona, kliknięcie połączenia dodaje je do puli albo z niej usuwa. Znacznik pokazuje, które połączenia są w puli.

## Eksport i import połączeń

Połączenia da się wyeksportować do pliku jako kopię zapasową albo po to, żeby przenieść je do innej instalacji, a później zaimportować.

**Eksport nigdy nie zawiera kluczy API.** Po zaimportowaniu połączeń trzeba otworzyć każde z nich i wpisać klucz API jeszcze raz.

Aby wyeksportować pojedyncze połączenie, otwórz je w edytorze i kliknij przycisk **Export** (eksport) z ikoną wgrywania. Aby wyeksportować kilka naraz, włącz w panelu tryb **Select** i kliknij przycisk **Export** na pasku akcji. Zanim pobieranie ruszy, Marinara pokazuje okno **Export Connection Data** z takim ostrzeżeniem: This will export your connection data, WITHOUT your provided API Key. Remember to never share those with others! Kliknij przycisk **Export**, żeby kontynuować.

Pojedyncze połączenie pobiera się jako plik `.connection.json`. Kilka połączeń pobiera się razem jako plik `marinara-connections.zip`.

Aby zaimportować połączenia, kliknij przycisk **Import** (import) u góry panelu Connections. Otwiera się okno **Import Connections**. Upuść na nie jeden plik `.json` lub kilka takich plików albo kliknij, żeby je wskazać. Okno przypomina: Imported connections never include API keys. Add each key again after import. Po imporcie każde nowe połączenie ma puste pole klucza API, dopóki nie zostanie ono uzupełnione.

## Powiązane przewodniki

- [Łączenie z dostawcą AI](connecting-to-a-provider.md)
- [Panel **Chat Settings** – przegląd](../chats/chat-settings.md)
