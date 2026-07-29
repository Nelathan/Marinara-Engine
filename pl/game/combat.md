# Game Mode: walka

Ten przewodnik wyjaśnia, jak działa walka w trybie Game Mode aplikacji Marinara Engine. Znajdziesz tu opis początku starcia, menu akcji oraz matematyki rzutów kośćmi stojącej za każdym trafieniem. Dalej opisane są efekty statusu, reakcje żywiołów, mechaniki bossów, łupy, kontrolka **Interrupt** i Quick-Time Events. Walkę prowadzi Game Master (GM, mistrz gry) sterowany przez AI – postać, która opowiada twoją przygodę.

## Początek starcia

Walki nie zaczynasz samodzielnie. Robi to GM, kiedy wymaga tego fabuła – na przykład po sprowokowaniu wroga albo po wejściu w zasadzkę. Wtedy nad narracją otwiera się pełny ekran bitwy. Silnik buduje starcie na podstawie tego, co dzieje się w fabule: dobiera drużynę, przeciwników, ich statystyki i ewentualne zasady specjalne.

Ekran bitwy pokazuje drużynę po jednej stronie, a przeciwników po drugiej. Każdy walczący ma pasek zdrowia (HP, punkty życia), a jeśli korzysta z umiejętności – także pasek many (MP, punkty magii). Kolejność tur widać na górze jako **Next:** i imię tego, kto działa jako następny. Licznik rund pokazuje **Round** oraz numer bieżącej rundy.

## Menu akcji

W swojej turze wybierasz z menu jedną akcję. Do dyspozycji jest sześć:

- **Attack**: zwykły atak wymierzony w jednego przeciwnika.
- **Skills**: użycie zdolności specjalnej. Umiejętności mogą kosztować MP. Jedne leczą sojusznika, inne ranią wroga, a jeszcze inne nakładają wzmocnienie albo osłabienie.
- **Special**: wpisanie dowolnej akcji własnymi słowami i kliknięcie przycisku **Ask GM**. Na przykład: "I kick sand into the Ruin Guard's cracked lens." O wyniku decyduje GM.
- **Defend**: podniesienie Defense do końca rundy, żeby otrzymywać mniejsze obrażenia.
- **Items**: użycie przedmiotu z torby. Opcja **Full inventory** otwiera stąd pełną listę przedmiotów.
- **Flee**: natychmiastowa ucieczka. Ucieczka od razu kończy walkę.

Po wyborze rozgrywa się cała runda. Wyniki widać jako unoszące się liczby obrażeń, zmieniające się paski zdrowia i wpisy w dzienniku walki.

## Jak liczona jest walka

Po rozpoczęciu starcia o każdej rundzie decyduje stała matematyka rzutów kośćmi, a nie AI. GM tylko opisuje wyniki. Nigdy nie rozstrzyga, kto trafia ani ile obrażeń zadaje. Dzięki temu walka jest uczciwa i przewidywalna. Zapis "k20" poniżej oznacza jeden rzut kością dwudziestościenną (wynik od 1 do 20).

### Inicjatywa (kolejność tur)

Na początku każdej rundy każdy walczący rzuca k20 i dolicza premię wynikającą ze statystyki Speed. Kto ma wyższy wynik, działa wcześniej. Walczący pomija całą rundę, jeśli jest zamrożony, ogłuszony lub uwięziony, albo gdy jego Speed spadła do 0.

### Atak i obrona

Kiedy jeden walczący atakuje drugiego:

1. Atakujący rzuca k20 i dolicza premię ze statystyki Attack.
2. Broniący się rzuca k20 i dolicza premię ze statystyki Defense.
3. Jeśli wynik atakującego jest niższy niż wynik broniącego się, atak chybia.
4. Trafienie krytyczne pada przy naturalnej dwudziestce albo gdy atakujący przebije obrońcę o 10 lub więcej.

### Obrażenia

Przy trafieniu obrażenia bazowe wynikają ze statystyki Attack atakującego i rosną wraz z jego poziomem. Do tego dochodzą dodatkowe kości obrażeń, a walczący na wyższych poziomach rzucają ich więcej. Trafienie krytyczne mnoży sumę przez 1.5. Na końcu Defense broniącego się zmniejsza obrażenia, blokując do 40 procent wartości tej statystyki.

### Skalowanie trudności

Ostatni krok skaluje obrażenia według poziomu trudności gry, ustawionego w kreatorze konfiguracji. Cztery ustawienia mnożą końcowe obrażenia tak:

| Trudność | Mnożnik obrażeń |
|---|---|
| Casual | 0.6 |
| Normal | 1.0 |
| Hard | 1.3 |
| Brutal | 1.6 |

Im wyższa trudność, tym mocniej biją obie strony, więc walki są krótsze i bardziej ryzykowne.

## Efekty statusu i reakcje żywiołów

Efekt statusu to tymczasowa zmiana Attack, Defense, Speed albo HP walczącego. Wzmocnienia pomagają, osłabienia szkodzą. Status trwa określoną liczbę rund, a potem mija. Efekty w rodzaju trucizny odbierają HP co rundę, a efekty regeneracyjne je przywracają. Trzy nazwane efekty – zamrożenie, ogłuszenie i uwięzienie – sprawiają, że objęty nimi walczący pomija turę.

Część ataków i umiejętności niesie żywioł: Fire, Ice, Lightning, Poison, Holy albo Shadow. Pierwszy żywioł, który trafi w cel, zostawia aurę, czyli utrzymujący się ślad tego żywiołu. Kolejne uderzenie innym żywiołem w ten sam cel wyzwala reakcję żywiołów. Reakcja dodaje premiowe obrażenia, a często też efekt statusu.

Przykładowe reakcje to Melt, Shatter, Overload, Superconduct, Toxic Blaze, Purification, Eclipse i Electrotoxin. Ten system działa sam. Nie trzeba go włączać ani konfigurować. Reakcje zachodzą automatycznie, gdy w ten sam cel trafią po sobie odpowiednie żywioły.

## Mechaniki bossów i łupy

Silni przeciwnicy mogą mieć mechaniki bossa, czyli zasady specjalne, które GM pisze na potrzeby danego starcia. Mechanika może odpalać się według harmonogramu, na przykład co kilka rund, albo gdy zdrowie bossa spadnie poniżej ustalonego progu. Mechaniki potrafią uderzyć w całą drużynę, wzmocnić bossa albo nałożyć efekt statusu. Kiedy któraś się uruchomi, jej działanie pojawia się w dzienniku walki, więc da się zareagować.

Po wygranej walce przeciwnicy zostawiają łupy. Każdy przedmiot ma rzadkość, od najczęstszej do najrzadszej: common, uncommon, rare, epic i legendary. Wyższa trudność przesuwa łupy w stronę rzadszych przedmiotów i daje ich nieco więcej. Po zwycięstwie pojawia się baner **Victory!**, a po upadku drużyny – baner **Defeat...**.

## Przerywanie wypowiedzi GM

Kiedy GM jeszcze pisze odpowiedź, można wejść mu w słowo przyciskiem **Interrupt** (przerwanie). Nic z tego, co wpiszesz, nie liczy się przed faktycznym wysłaniem. Kliknięcie przycisku **Interrupt** otwiera okno potwierdzenia zatytułowane **Attempt to Interrupt?** z trzema opcjami:

- **No**: anulowanie, GM pisze dalej.
- **Force Interrupt**: czyste wejście w słowo. GM nie dowiaduje się o przerwaniu. Pole wpisywania dostaje zielone obramowanie.
- **Yes**: próba przerwania w ramach fabuły, której GM może się oprzeć. Pole wpisywania robi się czerwone, a aplikacja podpowiada "using dice recommended" i pulsuje przyciskiem kości. Rzut kością zwiększa tu szansę powodzenia.

Po potwierdzeniu wpisz wiadomość i wyślij ją. Jeśli zmienisz zdanie, kliknij przycisk **Resume**, żeby porzucić oczekujące przerwanie i pozwolić narracji płynąć dalej. Ta kontrolka przydaje się w napiętych chwilach – na przykład wtedy, gdy trzeba zareagować sekundę przed wybuchem walki.

## Quick-Time Events

GM może wyświetlić nakładkę Quick-Time Events, w skrócie QTE, przy szybkich scenach akcji, takich jak unik czy pościg. Nakładka pokazuje kurczący się pasek odliczania, komunikat **React quickly!** oraz po jednym przycisku na każdą opcję. Każdy przycisk ma numer (1, 2, 3 i tak dalej). Kliknij przycisk odpowiadający wybranej akcji.

Wybór akcji przed upływem czasu daje premię. Im szybsza reakcja, tym większa premia. Jeśli czas minie pierwszy, zamiast premii przychodzi kara. Quick-Time Event nie korzysta z kości. Liczy się wyłącznie szybkość.

## Walka na urządzeniach mobilnych

Na telefonie ekran bitwy przestawia się tak, żeby zmieścić się na małym wyświetlaczu. Przyciski akcji trzymają się dołu ekranu. Panele, które nie mieszczą się w układzie, przenoszą się do wysuwanego panelu bocznego z czterema zakładkami:

- **Party**: członkowie drużyny i ich zdrowie.
- **Boss Mechanics**: zasady specjalne bieżącego starcia.
- **Dialogue**: kwestie wypowiadane przez walczących.
- **Combat Log**: zapis wydarzeń runda po rundzie.

Dotknij zakładki, żeby otworzyć jej panel. Aby go zamknąć, dotknij poza panelem albo dotknij przycisku zamykania.

## Powiązane przewodniki

- [Game Mode: rzuty kośćmi i testy umiejętności](dice-and-skill-checks.md)
- [Game Mode: drużyna i postacie NPC](party-and-npcs.md)
- [Game Mode: pierwsze kroki](getting-started.md)
- [Starcia bojowe (Roleplay)](../roleplay/combat-encounters.md)
