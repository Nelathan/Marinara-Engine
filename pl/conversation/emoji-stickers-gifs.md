# Własne emoji, naklejki i GIF-y

Z tego przewodnika dowiesz się, jakie dodatkowe obrazki da się wstawić do czatu w trybie Conversation: własne emoji, własne naklejki i GIF-y z wyszukiwarki. Zobaczysz też, jak zdecydować, których własnych emoji i naklejek postać może użyć w odpowiedzi.

Te narzędzia działają wyłącznie w trybie Conversation. Tryby Roleplay i Game Mode mają zwykłą tabelę emoji, bez własnych emoji, bez naklejek i bez wyszukiwarki GIF-ów.

## Gdzie znaleźć te narzędzia

W czacie w trybie Conversation spójrz na pasek wpisywania wiadomości. Jest tam okrągły przycisk z ikoną uśmiechniętej buźki, podpisany **Emoji, GIFs & stickers** (emoji, GIF-y i naklejki). Kliknij go, a nad paskiem otworzy się mały panel.

Panel ma następujące zakładki:

- **Emoji**: standardowa tabela emoji oraz zakładka z gwiazdką o nazwie **Custom emojis** (własne emoji) na wgrane obrazki.
- **GIFs**: wyszukiwarka GIF-ów na żywo.
- **Stickers**: wgrane naklejki.

Zakładka **Tools** pojawia się dodatkowo wtedy, gdy włączone są inne narzędzia paska wpisywania. Na telefonie te same zakładki otwierają się w panelu nad klawiaturą.

## Własne emoji

Własne emoji to mały obrazek, który wgrywasz raz i wykorzystujesz w dowolnym czacie w trybie Conversation. W wiadomości zapisujesz je jako kod skrótowy, czyli nazwę emoji otoczoną dwukropkami, na przykład `:kekw:`.

Własne emoji są wspólne dla całego profilu. Wystarczy wgrać je raz, żeby korzystać z nich wszędzie.

### Wgrywanie własnego emoji

1. Otwórz panel **Emoji, GIFs & stickers** i przejdź do zakładki **Emoji**.
2. Kliknij zakładkę z gwiazdką o nazwie **Custom emojis**.
3. Kliknij przycisk **Upload** (wgranie) i wskaż jeden plik graficzny lub kilka.
4. W oknie **Name this emoji** wpisz nazwę i kliknij przycisk **Add**.

Nowe emoji powinno pojawić się w tabeli **Custom emojis**.

Nazwy emoji podlegają ścisłym regułom. Nazwa ma od 1 do 32 znaków. Wolno używać wyłącznie małych liter, cyfr i podkreśleń. Spacje i wielkie litery aplikacja poprawia sama. Zamienia na przykład wielkie litery na małe, a pozostałe znaki na podkreślenia.

Obrazek własnego emoji nie może być większy niż 256 na 256 pikseli. Aplikacja sprawdza to podczas wgrywania. Nazwy muszą być niepowtarzalne w obrębie wszystkich własnych emoji. Przy nazwie, która jest już zajęta, pojawia się błąd `An emoji named ":name:" already exists.`

Jako własne emoji można wgrać animowany plik GIF. W czacie odtwarza się z animacją. To coś innego niż zakładka **GIFs** opisana niżej.

### Używanie własnego emoji

Kliknij dowolny kafelek w tabeli **Custom emojis**, aby wstawić jego kod skrótowy do wiadomości. To nie wysyła wiadomości, a jedynie wstawia tekst. Kod skrótowy da się też wpisać ręcznie, na przykład `:kekw:`. Wpisz nazwę małymi literami, dokładnie tak, jak została zapisana.

### Zmiana nazwy, usuwanie, eksport i import

Kliknij przycisk **Edit** (edycja) u góry zakładki **Custom emojis**, aby włączyć tryb edycji.

W trybie edycji:

- Kliknij kafelek, aby otworzyć okno **Rename emoji**, a potem kliknij przycisk **Rename**.
- Kliknij małą ikonę kosza na kafelku, aby usunąć to emoji. Okno **Delete emoji** ostrzega, że w wiadomościach, które już go użyły, pojawi się zwykły tekst.
- Kliknij przycisk **Export** (eksport), aby pobrać wszystkie własne emoji w pliku o nazwie `marinara-custom-emojis.json`. Plik zawiera w sobie same obrazki, więc jest w pełni przenośny.
- Kliknij przycisk **Import** (import), aby wczytać wcześniej wyeksportowany plik. Import pomija emoji, które łamią reguły nazwy lub rozmiaru albo mają nazwę już zajętą.

## Własne naklejki

Własna naklejka działa jak własne emoji, tylko dotyczy większych obrazków. Naklejkę zapisujesz jako `sticker:name:` i zawsze wyświetla się jako duży obrazek blokowy w osobnej linii.

Otwórz zakładkę **Stickers** w tym samym panelu. Wgrywanie, nadawanie nazw, zmiana nazwy, usuwanie, eksport i import działają tak samo jak przy emoji, z tymi różnicami:

- Okno wgrywania nosi tytuł **Name this sticker**.
- Obrazek naklejki nie może być większy niż 512 na 512 pikseli.
- Nazwy naklejek są niepowtarzalne w obrębie wszystkich naklejek. Przy powtórzeniu pojawia się `A sticker named "sticker:name:" already exists.`
- Eksport pobiera plik o nazwie `marinara-custom-stickers.json`.

### Wysyłanie naklejki

Kliknij kafelek naklejki w tabeli. Okno **Send sticker** pyta, w jaki sposób jej użyć, i daje dwie możliwości:

- **Send & reply**: od razu publikuje naklejkę jako osobną wiadomość i pozwala postaci odpowiedzieć.
- **Add to message**: wstawia tekst `sticker:name:` do wiadomości, żeby dało się pisać dalej.

## Wyszukiwarka GIF-ów (Giphy)

Zakładka **GIFs** przeszukuje serwis Giphy, czyli dużą internetową bibliotekę GIF-ów. Wpisz hasło w polu wyszukiwania albo przejrzyj listę popularnych pozycji. Kliknięty GIF trafia do czatu.

### Wyszukiwarka GIF-ów wymaga klucza

Wyszukiwarka GIF-ów wymaga darmowego klucza API do serwisu Giphy. Klucz API to tajny kod, trochę jak hasło, dzięki któremu Marinara Engine rozmawia z serwisem Giphy w twoim imieniu. Bez klucza zakładka **GIFs** pokazuje kartę konfiguracji zamiast wyników.

Aby uruchomić wyszukiwarkę GIF-ów:

1. Otwórz panel Giphy Developer Dashboard pod adresem `https://developers.giphy.com/dashboard/`.
2. Utwórz darmowy klucz API dla aplikacji internetowej.
3. Dodaj klucz do pliku `.env`. To plik z ustawieniami serwera aplikacji Marinara Engine.

Dopisz do pliku `.env` linię w tej postaci:

```
GIPHY_API_KEY=your_key_here
```

Po dodaniu klucza uruchom ponownie aplikację Marinara Engine. Pełne wyjaśnienie pliku `.env` znajdziesz w przewodniku konfiguracji serwera, do którego link jest niżej.

### Klasyfikacja treści GIF-ów

Wyniki wyszukiwania GIF-ów korzystają z klasyfikacji treści dla dorosłych w serwisie Giphy. Jest to ustawione na stałe i nie da się tego zmienić w aplikacji. Wśród wyników mogą trafić się GIF-y sugestywne lub dla dorosłych, więc warto szukać z tą świadomością. Nie ma źródła GIF-ów działającego offline ani wyłącznie bezpiecznego.

## Oznaczanie obrazka z galerii jako emoji lub naklejki

Dowolny obrazek zapisany już w galerii postaci lub w galerii persony da się oznaczyć jako własne emoji lub naklejkę. Tak oznaczony obrazek z galerii należy tylko do tej jednej postaci albo persony. Działa wyłącznie w czatach, w których one występują.

Aby oznaczyć obrazek z galerii:

1. Otwórz panel **Character Editor** (edytor postaci) lub **Persona Editor** (edytor persony).
2. Przejdź do zakładki **Gallery** i otwórz podzakładkę **Images**.
3. Najedź na obrazek i kliknij mały przycisk oznaczania w jego lewym górnym rogu.
4. Wybierz **Make emoji** albo **Make sticker**.
5. W oknie **Custom Emoji** lub **Custom Sticker** wpisz nazwę.

Przycisk oznaczania powinien zmienić się tak, aby pokazywać nadaną nazwę.

Obowiązują tu te same limity rozmiaru. **Make emoji** dopuszcza najwyżej 256 na 256 pikseli, a **Make sticker** najwyżej 512 na 512 pikseli. Jeśli obrazek jest za duży dla wybranego rodzaju, pojawia się czerwony komunikat błędu.

Aby później zmienić oznaczony obrazek, kliknij jego przycisk oznaczania ponownie. Menu proponuje opcję **Rename**, opcję zamiany w rodzaju **Switch to sticker** oraz opcję usunięcia w rodzaju **Remove emoji**. Oznaczenie nie przenosi ani nie kopiuje obrazka, bo pozostaje on też zwykłym obrazkiem w galerii.

## Preferencje wyboru

Marinara Engine potrafi podpowiedzieć odpowiadającej postaci, których własnych emoji i naklejek wolno jej użyć w odpowiedzi. Steruje tym panel **Selection preferences** (preferencje wyboru).

Aby otworzyć ten panel, kliknij ikonę koła zębatego podpisaną **Selection preferences**. Znajduje się u góry zakładki **Custom emojis** oraz zakładki **Stickers**. Obie otwierają to samo ustawienie. Ustawienie zapisuje się osobno dla każdego czatu, więc może się różnić między czatami.

Panel ma jeden wiersz trybu z trzema możliwościami:

- **Semantic** (domyślnie): proponuje emoji i naklejki najlepiej pasujące do ostatnich wiadomości. Ten tryb korzysta z lokalnego modelu embeddingu, czyli małego modelu AI działającego na twoim komputerze. Kiedy model jest niedostępny, tryb przechodzi na losowanie.
- **Random**: przy każdej odpowiedzi proponuje losowy zestaw.
- **Tool-call**: pasujące pozycje wybiera przy każdej odpowiedzi osobne zapytanie do modelu. Trzeba wskazać połączenie na liście rozwijanej, która się pojawia. Kiedy połączenie nie jest wybrane albo zawiedzie, tryb przechodzi na **Semantic**. W turze czatu grupowego, w której odpowiada więcej niż jedna postać, tryb **Tool-call** jest pomijany, a wybór przechodzi na **Semantic**.

Pod trybami jest ustawienie **Max offered (each)**. Decyduje ono, ile nazw własnych emoji i ile nazw naklejek trafia do postaci w każdej turze. Domyślnie jest to 20. Da się ustawić wartość od 1 do 100.

## Jak wyświetlają się własne emoji i naklejki

W czacie w trybie Conversation kod skrótowy emoji w rodzaju `:kekw:` wyświetla się jako mały obrazek wewnątrz linii tekstu. Jeśli wiadomość zawiera wyłącznie kody skrótowe emoji i nic poza tym, obrazki są większe.

Naklejka w rodzaju `sticker:wave:` zawsze wyświetla się jako duży obrazek blokowy w osobnej linii.

Kiedy nazwy nie da się odnaleźć, na przykład po usunięciu danego emoji, wiadomość pokazuje zamiast obrazka zwykły tekst kodu skrótowego, czyli `:kekw:`.

## Reakcje korzystają tylko z globalnej puli emoji

Na wiadomość można zareagować własnym emoji. Reakcje korzystają wyłącznie z głównych własnych emoji, czyli z globalnej puli. Emoji oznaczone w galerii, naklejki i GIF-y nie są dostępne jako reakcje. Reakcje na wiadomości opisuje przewodnik pierwszych kroków w trybie Conversation.

## Powiązane przewodniki

- [Tryb Conversation: pierwsze kroki](getting-started.md)
- [Galerie postaci i person](../characters/galleries.md)
- [Konfiguracja serwera](../CONFIGURATION.md)
