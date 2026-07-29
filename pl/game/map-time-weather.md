# Game Mode: mapa, czas i pogoda

Z tego przewodnika dowiesz się, jak działa panel mapy w trybie Game Mode i systemy, które śledzą świat wokół drużyny. Chodzi o dzień i godzinę, pogodę oraz morale drużyny. Znajdziesz tu opis widoków mapy, sposobów poruszania się i przybliżania oraz ręcznego ustawiania dnia i godziny.

## Panel mapy

Game Mode pokazuje na ekranie gry niewielki panel mapy. Panel podaje nazwę bieżącej mapy, dzień gry i ikonę nieba oznaczającą porę dnia.

Na komputerze mapa jest wbudowanym panelem, który widać od razu. Na telefonie dotknij ikony mapy w lewym górnym rogu. Przycisk nosi nazwę **Open map** (otwarcie mapy) i pokazuje mapę w panelu podręcznym.

Panel da się przeciągać i zablokować w wybranym miejscu. Zasady działania przeciąganych paneli opisuje przewodnik o widgetach HUD, do którego link znajdziesz niżej.

## Widok siatki i widok węzłów

Mapa ma dwa widoki. Marinara Engine sama dobiera widok do rodzaju miejsca, które mapa przedstawia. Widoków nie przełącza się ręcznie.

- Widok **grid** (siatka) obsługuje otwarte przestrzenie: świat zewnętrzny, region albo miasto. Pokazuje kwadraty pokolorowane według terenu, na przykład trawa, las, woda, góry, pustynia, śnieg, miasteczko, droga i jaskinia.
- Widok **node** (węzły) obsługuje zamknięte przestrzenie, czyli lochy i wnętrza. Pokazuje lokalizacje jako kółka połączone liniami. Lokalizacja jeszcze nieodkryta ma ikonę znaku zapytania. Linia przerywana to ścieżka, którą nikt jeszcze nie przeszedł. Linia ciągła to ścieżka już przebyta.

## Poruszanie drużyną

Żeby ruszyć w drogę, wskaż miejsce na mapie. Wybrać można tylko niektóre miejsca. Na mapie siatki kwadrat musi sąsiadować z drużyną i być już odkryty. Na mapie węzłów węzeł musi łączyć się z bieżącą lokalizacją albo być już odkryty. Pozostałe kwadraty i węzły nie reagują na kliknięcie.

1. Kliknij kwadrat siatki albo węzeł na mapie węzłów.
2. Nad polem wiadomości pojawia się kafelek **Destination:** (cel podróży) z nazwą miejsca.
3. Wpisz wiadomość i wyślij ją. Marinara dopisuje na jej początku krótką linijkę w rodzaju `*moves to <place>*`.

Żeby zrezygnować, kliknij mały przycisk czyszczenia (X) na kafelku **Destination:**.

Na telefonie wygląda to nieco inaczej. Dotknij węzła raz, żeby go zaznaczyć, a potem dotknij przycisku **Set destination** (ustawienie celu) na dole. Węzeł oznaczony jako **You are here** to bieżąca lokalizacja.

## Przybliżanie mapy

Każda mapa ma w prawym górnym rogu sterowanie powiększeniem.

- Kliknij przycisk **Zoom in** (plus), żeby przybliżyć obraz.
- Kliknij przycisk **Zoom out** (minus), żeby zobaczyć więcej.

Powiększenie mieści się w zakresie od 75% do 180%, ze skokiem co 25%.

## Przełączanie map

Niektóre gry mają więcej niż jedną mapę albo region. Kiedy map jest kilka, u góry panelu mapy pojawia się mała lista rozwijana. Wybierz z niej mapę, którą chcesz obejrzeć. Mapa, na której faktycznie stoi drużyna, ma dopisek **(Current)**.

## Generowanie nowej mapy

W lewym górnym rogu panelu mapy jest przycisk z różdżką o nazwie **Generate another map** (wygenerowanie kolejnej mapy). Kliknij go, żeby zastąpić bieżącą mapę zupełnie nową.

Jeśli gra nie ma jeszcze żadnej mapy, panel pokazuje napis **No map yet** oraz przycisk **Generate**, który robi dokładnie to samo.

## Ręczne ustawianie dnia i godziny

Sterowanie dniem i godziną znajduje się u góry panelu mapy. Widać tam napis **Day** wraz z liczbą oraz małą ikonę nieba oznaczającą porę dnia.

1. Kliknij pole **Day** (dzień).
2. Wpisz w polu nowy numer dnia. Dozwolony zakres to od 1 do 9999.
3. Wybierz porę dnia z listy rozwijanej. Do wyboru są **Dawn**, **Morning**, **Afternoon**, **Evening**, **Night** i **Midnight**.
4. Kliknij poza polem albo naciśnij Enter, żeby zapisać.

To ustawienie ręczne, które ma pierwszeństwo. Dzień i godzinę ustawiasz samodzielnie, niezależnie od automatycznego zegara opisanego niżej. Zegar potrafi też sam pokazać **Noon**, ale tej pory nie ma na liście do ręcznego wyboru.

## Jak czas płynie automatycznie

Zegar gry chodzi sam. Opiera się na sztywnych obliczeniach, a nie na AI, więc zawsze jest spójny. Każda nowa gra zaczyna się w dniu 1 o godzinie 08:00 rano. Każde działanie przesuwa zegar o ustaloną wartość.

| Działanie | Doliczany czas |
|---|---|
| Rozmowa | 15 minut |
| Eksploracja | 30 minut |
| Runda walki | 5 minut |
| Krótki odpoczynek | 1 godzina |
| Długi odpoczynek | 8 godzin |
| Podróż | 2 godziny |

Kiedy zegar minie północ, numer dnia rośnie o jeden.

## Pogoda

Pogodę gra również prowadzi sama, na sztywnych obliczeniach i bez udziału AI. Pogoda zależy od biomu i pory roku. Biom to rodzaj miejsca, w którym przebywa drużyna, na przykład pustynia, arktyka, wybrzeże albo góry. Pogoda bywa bezchmurna albo pochmurna, może pojawić się deszcz, burza, śnieg, zamieć, mgła i burza piaskowa.

Pogoda potrafi zmienić się po twoim działaniu. Najczęściej zmienia się podczas podróży i długiego odpoczynku, czasem przy eksploracji, a poza tym rzadko. Nadaje ona koloryt opisom scen tworzonym przez postać Game Master.

Żeby zobaczyć pogodę na ekranie, włącz ustawienie **Dynamic weather effects (rain, snow, fog, etc.)** w ustawieniach wyglądu aplikacji. Domyślnie jest włączone. Po włączeniu nad grą pojawiają się animowane cząsteczki deszczu, śniegu czy mgły. Pasują one do bieżącej pogody i pory dnia. Więcej opcji wyświetlania opisuje przewodnik po ustawieniach wyglądu, do którego link znajdziesz niżej.

## Morale drużyny

Gra prowadzi ukryty wskaźnik morale drużyny w skali od 0 do 100. Ma on pięć poziomów, od najniższego do najwyższego: Broken, Low, Steady, High i Inspired.

Morale zmienia się wraz z wydarzeniami w historii. Wygrana walka, ukończone zadanie albo znaleziony skarb je podnoszą. Przegrana walka, nieudane zadanie albo utrata sojusznika je obniżają. Z czasem morale samo wraca w okolice środka skali.

Gra nie pokazuje morale jako liczby. Wskaźnik działa w tle. Wpływa na rzuty kością, od plus 2 przy poziomie Inspired do minus 2 przy poziomie Broken. Zabarwia też opisy nastroju drużyny tworzone przez postać Game Master.

## Powiązane przewodniki

- [Game Mode: pierwsze kroki](getting-started.md)
- [Game Mode: widgety HUD](hud-widgets.md)
- [Ustawienia wyglądu](../appearance/appearance-settings.md)
