# Importowanie i eksportowanie lorebooków

Z tego przewodnika dowiesz się, jak wczytać lorebooki do aplikacji Marinara Engine i jak zapisać je z powrotem do plików. Omawia pojedyncze pliki, wiele plików naraz oraz dwa formaty eksportu. Lorebook to zbiór notatek wyzwalanych słowami kluczowymi, które Marinara dokłada do promptu (tekstu wysyłanego do AI), gdy w rozmowie padnie pasujące słowo. W niektórych innych narzędziach do roleplayu ta funkcja nazywa się **World Info**.

## Co można zaimportować

Marinara czyta dwa rodzaje plików lorebooka i sama rozpoznaje, który z nich dostała:

- Lorebook wyeksportowany z aplikacji Marinara Engine. Zachowuje każde pole i każdy folder.
- Plik **World Info** z innego narzędzia. Należą tu pliki World Info z aplikacji SillyTavern oraz format "character-book" z kart postaci V2. Marinara przekłada pola z drugiego narzędzia na własne.

Oba rodzaje to zwykłe pliki `.json`. Do zaimportowania lorebooka nie trzeba konta ani klucza API (tajnego kodu, trochę jak hasło).

## Importowanie lorebooka

Wykonaj kolejno te kroki, aby zaimportować jeden plik lorebooka.

1. Otwórz panel **Lorebooks** (lorebooki) z lewej strony aplikacji.
2. Kliknij ikonę strzałki pobierania w górnym rzędzie akcji. Jej podpowiedź brzmi **Import**. Znajduje się między ikoną plusa (**New**) a ikoną znacznika (**Select**). Te trzy przyciski pokazują same ikony, więc najedź na nie kursorem, żeby zobaczyć nazwy.
3. Otwiera się okno **Import Lorebook** (import lorebooka). Widać w nim pole z napisem **Drop one or more lorebook files here or click to browse**.
4. Przeciągnij plik `.json` na to pole albo kliknij je i wskaż plik.
5. Poczekaj na wynik. Przy każdym pliku pojawia się zielony znacznik z napisem **Imported lorebook** albo czerwony znak z komunikatem błędu.
6. Kliknij przycisk **Close**. Nowy lorebook jest już widoczny na liście w panelu **Lorebooks**.

Marinara zachowuje datę utworzenia zapisaną w importowanym pliku, a nie moment samego importu.

## Importowanie wielu lorebooków naraz (import zbiorczy)

Okno **Import Lorebook** przyjmuje za jednym razem więcej niż jeden plik.

1. Otwórz panel **Lorebooks** i kliknij ikonę strzałki pobierania. Jej podpowiedź brzmi **Import**.
2. Przeciągnij kilka plików `.json` na pole jednocześnie albo kliknij pole i zaznacz kilka plików.
3. Marinara importuje pliki po kolei i dla każdego wypisuje wiersz z wynikiem. Linia podsumowania pokazuje, ile plików się udało, a ile nie.

W jednej partii można wymieszać pliki z aplikacji Marinara Engine i pliki **World Info**. Marinara sprawdza każdy plik osobno.

## Eksportowanie lorebooka

Eksport zapisuje jeden lorebook do pliku na urządzeniu. W ten sposób udostępnia się lorebook innym albo przenosi go do innej instalacji.

1. W panelu **Lorebooks** kliknij lorebook, żeby otworzyć jego edytor.
2. Kliknij ikonę eksportu w nagłówku edytora. Jej podpowiedź brzmi **Export lorebook**.
3. Otwiera się okno **Export Lorebook** (eksport lorebooka) z dwiema opcjami. Wybierz jedną:
   - Format **Marinara Native** zachowuje foldery aplikacji Marinara Engine i wszystkie pola wpisów. Wybierz go, żeby przenieść lorebook do innej instalacji aplikacji Marinara Engine bez żadnych strat. Nazwa pliku kończy się na `.marinara.json`.
   - Format **Compatible JSON** zapisuje plik **World Info** bez folderów, z myślą o innych narzędziach do roleplayu. Część szczegółów właściwych tylko dla aplikacji Marinara Engine przepada. Nazwa pliku kończy się na `.json`.
4. Przeglądarka pobiera plik.

Wybierz **Marinara Native**, kiedy plik trafi z powrotem do aplikacji Marinara Engine. Wybierz **Compatible JSON**, kiedy plik jest dla innego narzędzia.

## Eksportowanie wielu lorebooków naraz (eksport zbiorczy)

Kilka lorebooków da się zapisać do jednego pliku zip.

1. W panelu **Lorebooks** kliknij ikonę znacznika w górnym rzędzie akcji. Jej podpowiedź brzmi **Select**.
2. Zaznacz pole wyboru przy każdym lorebooku, który ma trafić do eksportu.
3. Kliknij przycisk **Export** na pasku zaznaczenia na dole.
4. Przeglądarka pobiera jeden plik zip o nazwie `marinara-lorebooks.zip`.

Eksport zbiorczy zawsze używa formatu **Marinara Native**, więc taki plik wraca do aplikacji Marinara Engine bez żadnych strat.

## Importowanie całego folderu SillyTavern

Powyższe kroki dotyczą plików lorebooków, które już masz. Lorebooki można też pobrać wprost z folderu pełnej instalacji aplikacji SillyTavern. Ta droga zabiera przy okazji postacie, czaty i presety (zapisane szablony promptów). Korzysta z osobnego kreatora importu folderu. Zobacz [Importowanie z SillyTavern](../data/importing-from-sillytavern.md).

## Po imporcie

Zaimportowany lorebook działa od razu ze słowami wyzwalającymi. Jeśli korzystasz z wyszukiwania semantycznego, które dopasowuje wpisy według znaczenia, po imporcie trzeba zbudować jego wektory od nowa. Zobacz [Wyszukiwanie semantyczne w lorebookach](semantic-search.md).

## Powiązane przewodniki

- [Lorebooki – przegląd](overview.md)
- [Podpinanie lorebooków do postaci i person](linking-to-characters.md)
- [Wyszukiwanie semantyczne w lorebookach](semantic-search.md)
- [Importowanie z SillyTavern](../data/importing-from-sillytavern.md)
