# Hierarchical Maps i Spatial Context V3

Status: propozycja, gotowa do wdrożenia po akceptacji opiekuna projektu

Odbiorcy: zespół produktowy, projektanci i osoby współtworzące aplikację Marinara Engine

Zastępuje: `hierarchical-locations-prd-v2.md`

## Granica architektury

Ten plan traktuje orientację przestrzenną jako wąsko zakrojoną funkcję produktu z jasno wytyczoną granicą stanu.

Powstaje system map hierarchicznych i orientacji przestrzennej, a nie uniwersalny silnik scenariuszy w stylu Voxta. Z Voxta zapożyczamy jeden przydatny wzorzec: trwały stan wybiera niewielki, adekwatny kontekst promptu. Na początku nie dochodzą flagi, zmienne, zdarzenia, skrypty, liczniki czasu ani osobny model wnioskujący o akcjach.

Obsługiwane tryby właściciela to Roleplay i Game.

Plan opiera się na pięciu wyraźnie rozdzielonych warstwach:

| Warstwa | Odpowiedzialność | Przykład |
| --- | --- | --- |
| Definicja mapy | Trwała prawda o przestrzeni | Biblioteka leży wewnątrz Wieży Maga |
| Stan w czasie działania | Lokalizacja bieżącej sceny | Scena rozgrywa się teraz w Bibliotece |
| Projekcja promptu | Ograniczona orientacja modelu | Ścieżka nawigacji, pamięć bieżącej lokalizacji, dostępne wyjścia |
| Tożsamość wizualna | Opcjonalne referencje graficzne przypisane do miejsca | Biblioteka zachowuje swoje łuki, okna i materiały w kolejnych scenach |
| Przejście | Zweryfikowana zmiana stanu | Przejście z Biblioteki do Obserwatorium |

Maszyna stanów jest celowo prosta:

```text
current location + requested destination + definition revision
                              ↓
                  validate ownership and reachability
                       ↙ accepted       rejected ↘
              persist snapshot         preserve state
```

Najpierw powstaje przemieszczanie ręczne. Później o to samo przejście może poprosić ograniczone narzędzie modelu, na przykład `change_location({ destinationId })`. Weryfikuje je i stosuje serwer, a nie model. Osobne wywołanie wnioskujące o akcji czeka na dowody, że jest w ogóle potrzebne.

## Podsumowanie

Dodajemy wspólną funkcję Hierarchical Map dla trybów Roleplay i Game. Daje ona hierarchię lokalizacji zdefiniowaną przez twórcę, jedną rozstrzygającą lokalizację ogniskową, ograniczony kontekst promptu dla bieżącej lokalizacji oraz przemieszczanie weryfikowane przez serwer.

Lorebooki pozostają kanonicznym źródłem faktów o świecie używanych wielokrotnie. Hierarchia może odwoływać się do istniejących wpisów lorebooka przez stabilne identyfikatory, dzięki czemu aktywna lokalizacja wybiera potrzebną wiedzę o świecie bez kopiowania jej ani przepisywania. Tworzenie szkicu mapy przez AI może korzystać z jawnie wybranych lorebooków jako materiału źródłowego i musi odróżniać lokalizacje poparte źródłem od wywnioskowanych lub wymyślonych.

Lokalizacja może też mieć własny, opcjonalny zestaw tożsamości wizualnej: krótką kotwicę wizualną oraz stabilne referencje do obrazów z galerii profilu. Lokalizacja pozostaje bytem przestrzennym, a nie obrazem. Profil stylu obrazów wybrany dla czatu decyduje o ogólnym stylu renderowania, referencje lokalizacji utrwalają samo miejsce, a referencje postaci lub persony utrwalają ludzi, którzy się w nim znajdują.

Połączony tryb Conversation może z czasem odczytywać bezpieczną projekcję powiązanej lokalizacji fabularnej, ale nigdy nie jest właścicielem stanu przestrzennego ani go nie zmienia.

```text
authoritative hierarchy + current location
                    ↓
resolve breadcrumb, context, and valid destinations
                    ↓
build the mode-specific prompt
                    ↓
commit a validated move with the next owner turn
                    ↺
```

To nie jest uniwersalny silnik scenariuszy. Nie dochodzą flagi, zdarzenia, autorski kod JavaScript ani wyznaczanie tras. Dochodzi natomiast wizualna, zagnieżdżona przeglądarka map z widokiem mapy, warstw i listy.

## Decyzje produktowe

Te decyzje zamykają pytania otwarte z wersji V2:

1. Definicja hierarchii i bieżąca lokalizacja są przechowywane osobno.
2. Bieżąca lokalizacja trafia do migawki razem z zatwierdzonym stanem wiadomości i swipe'a, więc gałęzie, ponowne generowanie i punkty kontrolne przywracają właściwą pozycję.
3. Ręczne przemieszczenie zatwierdza się atomowo razem z kolejną turą użytkownika w trybie właściciela, przed zbudowaniem promptu.
4. Włączony Spatial Context rozstrzyga o wszystkim. Dawna tekstowa lokalizacja trybu Game nie może stać się drugim źródłem prawdy.
5. Roleplay i Game korzystają z jednego wspólnego kontraktu projekcji przestrzennej z cienkimi adapterami promptu dla każdego trybu.
6. Pole `awarenessSummary` pisze twórca. Gdy go nie ma, tryb Conversation dostaje wyłącznie ograniczony fragment publicznego opisu.
7. Conversation opisuje rzecz na poziomie sceny, chyba że rozstrzygające dane o obecności dowodzą, że powiązana postać jest na miejscu.
8. Łącza bezpośrednie i wizualne rozmieszczanie lokalizacji podrzędnych wchodzą już do MVP.
9. Istniejące mapy siatkowe i węzłowe trybu Game można jawnie powiązać z lokalizacjami hierarchii; nazwy nigdy nie są dopasowywane automatycznie.
10. Lorebooki odpowiadają za kanoniczne fakty o świecie używane wielokrotnie; mapa odpowiada za tożsamość przestrzenną, zawieranie, nawigację i stan bieżącej lokalizacji. Lokalizacje na mapie odwołują się do wpisów lorebooka przez stabilne identyfikatory i nigdy nie kopiują ich treści.
11. Przypięcie do lokalizacji to jawne źródło aktywacji ograniczone do jednego czatu. Dopóki bieżąca jest dokładnie ta lokalizacja, jej włączone wpisy mogą się aktywować bez trafienia słowa kluczowego, ale wyłączone albo jawnie wykluczone lorebooki i wpisy pozostają wyłączone.
12. Tworzenie szkicu mapy ugruntowanego w lorebookach działa w interfejsie trybu właściciela i wyprzedza połączony tryb Conversation. Po wybraniu lorebooków źródłowych szkic musi pokazać, które lokalizacje mają oparcie w źródle, które są wywnioskowane, a które wymyślone, zamiast podawać niepopartą geografię jako kanon.
13. Lokalizacji nigdy nie zastępuje obraz. Może ona wskazywać opcjonalne zasoby tożsamości wizualnej przez stabilne identyfikatory obrazów, z jedną główną referencją otwierającą i ograniczoną liczbą referencji uzupełniających.
14. Referencje wizualne lokalizacji trafiają wyłącznie do uprawnionych ścieżek generowania obrazów. Generowanie tekstu, aktywacja wiedzy o świecie i połączony tryb Conversation nigdy nie dostają bajtów obrazu ani notatek dotyczących samych obrazów.
15. Storyboard konsumuje wyniki tego samego resolvera wizualnego. Każdy storyboard zamraża manifest referencji przypisany do konkretnej wiadomości i swipe'a, żeby późniejsze ponowne generowanie nie przejęło po cichu nowszej grafiki lokalizacji lub postaci.
16. Przemieszczanie na żądanie modelu zostaje na późniejszy etap.

## Zakres

| Tryb | Właściciel hierarchii | Zmiana lokalizacji ogniskowej | Projekcja fabularna | Projekcja połączona |
| --- | ---: | ---: | ---: | ---: |
| Roleplay | Tak | Tak | Tak | N/D |
| Game | Tak | Tak | Tak | N/D |
| Conversation | Nie | Nie | Nie | Późniejszy etap, tylko do odczytu |

## Doświadczenie użytkownika

### Tworzenie treści

Panel **Chat Settings** (ustawienia czatu) pokazuje zwartą sekcję Spatial Context, a w niej:

- Stan włączenia
- Bieżącą ścieżkę nawigacji
- Liczbę lokalizacji i ostrzeżeń
- Akcję **Open Location Editor** (otwarcie edytora lokalizacji)

Edytor to ładowany na żądanie warsztat pracy z mapą, a nie wąski formularz ustawień:

- Na komputerze widać panel hierarchii, widok mapy lokalnej lub warstw oraz panel szczegółów lokalizacji.
- Na telefonie widoczny jest jeden panel naraz, z czytelnym powrotem do poprzedniego.
- Komunikaty walidacji pojawiają się obok pola lub węzła, którego dotyczą.
- Stan zapisu i konflikty wersji są zawsze widoczne.
- Podstawową operacją usuwania jest archiwizacja; trwałe usunięcie jest ograniczone.
- Zaznaczenie podgląda lokalizację. Do wejścia w nią służy osobna akcja **Enter**, więc kliknięcie nigdy nie oznacza naraz podglądu, edycji i przejścia.
- Każdy element nadrzędny pokazuje elementy podrzędne jako mapę z pozycjami, uporządkowane warstwy albo dostępną listę.
- Powielanie poddrzewa pozwala twórcy używać własnej pracy wielokrotnie bez szablonów działających między czatami w MVP.
- Każda lokalizacja ma rozwijaną sekcję `Linked lore`, która przeszukuje istniejące wpisy lorebooków, pokazuje odwołania wyłączone lub brakujące i udostępnia akcje **Open entry** (otwarcie wpisu) oraz **Detach** (odłączenie) bez kopiowania i bez usuwania treści.
- Każda lokalizacja ma rozwijaną sekcję `Visual identity` z obrazem głównym, referencjami uzupełniającymi, notatkami o zastosowaniu oraz jawnymi akcjami wyboru z galerii, wgrania i wygenerowania. Obrazy nigdy nie zastępują nazwy lokalizacji, ikony ani dostępnej etykiety nawigacyjnej.

### Szkic mapy ugruntowany w lorebookach

Kreator map AI proponuje ugruntowanie w lorebookach, gdy czat właściciela ma wybrane lub aktywne lorebooki. Ugruntowanie jest jawne i możliwe do sprawdzenia, a nie zwykłym skanowaniem słów kluczowych.

- Konfiguracja trybu Game bierze jako domyślne źródła mapy lorebooki wybrane w kroku **Lorebooks**.
- Roleplay przyjmuje jako domyślne aktywne lorebooki otwartego czatu i pozwala twórcy zmienić wybór źródeł w kreatorze map.
- Tryb `Strict canon` tworzy każdy nazwany węzeł na podstawie co najmniej jednego wybranego wpisu. Zachowuje wiele źródłowych korzeni, zamiast wymyślać niepoparte miejsca łączące.
- Tryb `Canon with expansion` zachowuje nazwy i relacje ze źródeł, a jednocześnie pozwala wypełnić praktyczne luki wyraźnie oznaczonymi lokalizacjami wywnioskowanymi lub wymyślonymi.
- Tryb `Setup only` zachowuje dotychczasowe działanie i korzysta z konfiguracji, przeglądu świata, łuku fabularnego, scenariusza i kontekstu postaci bez ugruntowania w lorebookach.
- Gdy wybrane lorebooki istnieją, domyślnym i najprzystępniejszym trybem jest `Canon with expansion`. Kreator trzyma `Strict canon` o jedną kontrolkę dalej, z myślą o twórcach mocno opartych na lorebookach.

Każdy wygenerowany węzeł w podglądzie szkicu ma etykietę `Lore-backed`, `Inferred` albo `Added by AI`. Węzły z etykietą `Lore-backed` wymieniają swoje wpisy źródłowe i dają akcję **Open entry**. Etykieta dowodzi istnienia poprawnego odwołania do źródła, a nie tego, że model zrozumiał tekst bezbłędnie, więc autorytetem znaczeniowym pozostaje przegląd twórcy. Akcja **Apply** (zastosowanie) zmienia tylko lokalną kopię roboczą, a granicą zapisu pozostaje **Save** (zapis).

### Tożsamość wizualna lokalizacji i grafika referencyjna

Obrazy lokalizacji mają poprawiać spójność scen, a nie zamieniać hierarchię w galerię ani w kolejne źródło prawdy o przestrzeni.

- Twórca może wgrać obraz, wybrać istniejący obraz z galerii profilu, awansować wygenerowaną scenę albo wygenerować referencję otwierającą na podstawie ścieżki nawigacji lokalizacji, publicznego opisu, kotwicy wizualnej, powiązanej wiedzy o świecie i wybranego profilu stylu obrazów.
- Dołączenie obrazu z galerii czatu, wygenerowanego tła trybu Game albo innego źródła tymczasowego najpierw tworzy trwały zasób w galerii profilu. Mapa zapisuje stabilny identyfikator obrazu z galerii, nigdy ścieżkę pliku, zewnętrzny adres URL ani dane base64.
- Jeden obraz w roli `identity` może być główny. Obrazy uzupełniające mogą pokazywać charakterystyczny detal, inne ujęcie, układ pomieszczenia albo dziedziczoną wskazówkę stylistyczną.
- Referencje `layout` pozostają pomocą dla edytora, chyba że wyraźnie poprosi o nie wyspecjalizowane żądanie tła lub rzutu poziomego. Nie trafiają automatycznie do zwykłej ilustracji sceny, bo potrafią zaburzyć kompozycję.
- Tylko referencje `style` mogą zgłosić się do dziedziczenia przez elementy podrzędne. Obrazy tożsamości i detalu dotyczą dokładnie jednej lokalizacji, więc panorama miasta nie stanie się po cichu tożsamością wizualną każdego pokoju w jego wnętrzu.
- Wygenerowana grafika sceny nigdy nie staje się kanonem automatycznie. Akcja `Set as location reference` wymaga świadomej decyzji, dzięki czemu powtarzane generowanie nie wzmacnia przypadkowych detali ani nie odsuwa stylu od zamierzonego.
- Inspektor zaznaczonej lokalizacji pokazuje obraz główny i role referencji. Gęste widoki hierarchii i mapy zostają przy nazwach na pierwszym miejscu; mogą pokazać małą miniaturę, gdy starcza miejsca, ale nawigacja nigdy nie zależy od rozpoznania obrazu.
- Podgląd generowania obrazu wymienia każdą rozwiązaną referencję lokalizacji i postaci, jej rolę oraz każdą referencję pominiętą z powodu limitów dostawcy. Nigdy nie loguje ani nie wyświetla surowych danych base64 w diagnostyce.

Zamierzony stos spójności wygląda tak:

```text
chat image style profile  -> shared rendering language
current location refs     -> stable architecture and place identity
character/persona refs    -> stable people and appearance
scene prompt              -> current action, framing, weather, and lighting
```

Grafika referencyjna jest wizualnym dowodem, a nie automatyczną wiedzą o świecie. Dodanie obrazu nigdy nie tworzy lokalizacji, nie zmienia zawierania i nie zapisuje faktów w lorebooku. Wnioskowanie o mapie na podstawie obrazu pozostaje osobnym, przyszłym procesem do zaprojektowania.

### Ciągłość referencji w storyboardach

Storyboard ma korzystać z przejrzanych tożsamości wizualnych z ukończonej tury GM, ale funkcja przestrzenna nie może od niego zależeć.

- Galeria profilu i galerie bytów tworzą bank referencji, w którym może być kilka przejrzanych obrazów jednej lokalizacji, postaci lub persony. Wygenerowana klatka kluczowa dostaje tylko taki zestaw referencji, jaki mieści się u dostawcy, wybrany z tego banku.
- Utworzenie storyboardu rozwiązuje dokładną migawkę przestrzenną dla jego wiadomości źródłowej i swipe'a. Najnowsza lokalizacja czatu nigdy nie podmienia stanu z wcześniejszej tury.
- Storyboard zamraża w manifeście referencji wizualnych rozwiązaną lokalizację, uporządkowane identyfikatory kandydujących obrazów, wybory dla poszczególnych klatek kluczowych, pominięcia i pojemność dostawcy. Ponowne generowanie używa tego manifestu, dopóki twórca sam nie wybierze `Refresh references`.
- Ten sam główny kandydat lokalizacji jest dostępny dla każdej klatki kluczowej. Kandydaci postaci i persony zmieniają się zależnie od listy postaci widocznych w klatce, więc obsada poza kadrem nie zajmuje miejsc na referencje.
- Pierwsza wersja wybiera automatycznie jeden obraz główny na każdy przedstawiony byt i najwyżej jeden obraz uzupełniający lokalizacji. Bogatszy bank przydaje się przy wyborze ręcznym oraz przy przyszłym dopasowywaniu ujęcia, stroju, wyrazu twarzy i detalu, ale Marinara nie wysyła każdego zapisanego obrazu przy każdej klatce.
- Jeśli zostaje tylko jedno automatyczne miejsce, klatka z widocznymi postaciami wybiera pierwszoplanową widoczną postać, a klatka otwierająca bez postaci wybiera główny obraz lokalizacji. Przy dwóch miejscach lub większej liczbie najpierw wybierana jest główna lokalizacja, a dopiero potem kolejne referencje widocznych postaci.
- Dostawca o większej pojemności nie dokłada po cichu referencji do istniejącego storyboardu. Dostawca o mniejszej pojemności wywołuje wbudowany w widok konflikt `Review references`, zamiast po cichu zmieniać zamrożony zestaw.
- Podgląd każdej klatki kluczowej ma jedną rozwijaną sekcję `Visual sources` z rozwiązaną lokalizacją, wybranymi postaciami, rolami obrazów, kolejnością i powodami pominięć. Akcja `Refresh references` jest dostępna na miejscu, bez osobnego menedżera zasobów w storyboardzie i bez blokującego okna.
- Wygenerowane klatki kluczowe nigdy nie stają się automatycznie referencjami postaci ani lokalizacji. Jedyną granicą zapisu pozostają istniejące, jawne akcje awansowania.

### Przemieszczanie w czasie działania

Ekrany czatu w trybie właściciela pokazują:

- Zapisaną bieżącą ścieżkę nawigacji
- Listę dostępnych celów podróży
- Wyraźnie oznaczony cel oczekujący na zatwierdzenie

Wybór celu nie zmienia od razu stanu rozstrzygającego. Wysłanie kolejnej wiadomości przesyła identyfikator celu i oczekiwaną wersję osobno od widocznej treści wiadomości. Serwer zatwierdza ruch, zanim złoży prompt odpowiedzi.

Jeśli walidacja się nie powiedzie, wiadomość i przemieszczenie nie zostają zatwierdzone połowicznie. Klient zachowuje wersję roboczą i wyjaśnia konflikt.

## Model danych

Definicje należą do metadanych czatu. Pozycja w czasie działania należy do historii migawek.

```ts
export type SpatialOwnerMode = "roleplay" | "game";

export type LocationVisualReferenceRole = "identity" | "detail" | "layout" | "style";

export interface LocationVisualReference {
  imageId: string;
  role: LocationVisualReferenceRole;
  primary?: boolean;
  usageNote?: string;
  inheritToDescendants?: boolean;
  sortOrder: number;
}

export interface ChatLocation {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  kind: "region" | "settlement" | "place" | "building" | "floor" | "room";
  modelMemory?: string;
  icon?: string;
  childPresentation: "map" | "layers" | "list";
  placement?: { x: number; y: number };
  layerOrder?: number;
  awarenessSummary?: string;
  visualIdentity?: string;
  visualReferences: LocationVisualReference[];
  lorebookEntryIds: string[];
  links: ChatLocationLink[];
  status: "active" | "archived";
  sortOrder: number;
}

export interface ChatLocationLink {
  targetId: string;
  label?: string;
  bidirectional: boolean;
  state: "available" | "hidden" | "blocked";
}

export interface SpatialContextDefinition {
  schemaVersion: 1;
  ownerMode: SpatialOwnerMode;
  enabled: boolean;
  locations: ChatLocation[];
  startingLocationId: string | null;
  revision: number;
}

export interface SpatialContextSnapshot {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  createdAt: string;
}

export interface PendingSpatialTransition {
  destinationId: string;
  expectedDefinitionRevision: number;
  expectedCurrentLocationId: string | null;
  commandId: string;
}
```

Nie zapisuj pola `ownerChatId` wewnątrz `SpatialContextDefinition`; właścicielem jest czat, który je zawiera. Stabilne, nieprzezroczyste identyfikatory przetrwają zmiany nazw i przenoszenie w hierarchii.

Pierwsze MVP trybu właściciela traktuje brakujące pole `lorebookEntryIds` albo `visualReferences` jak pustą tablicę, więc kolejne pakiety mogą rozszerzać schemat w wersji 1 bez natychmiastowego przepisywania istniejących definicji. Odwołania do wpisów i obrazów to wyłącznie stabilne identyfikatory. Nazwy lorebooków, nazwy wpisów, klucze, treści, ścieżki obrazów i bajty obrazów rozwiązują się dopiero w momencie użycia i nigdy nie są kopiowane do definicji przestrzennej. Pole `imageId` rozwiązuje się przez trwałą galerię profilu; dołączenie obrazu tymczasowego lub związanego z czatem tworzy najpierw trwałą kopię.

## Zasady grafu

Poprawne cele podróży to aktywne:

- Lokalizacje podrzędne wobec bieżącej
- Lokalizacja nadrzędna wobec bieżącej
- Cele łączy bezpośrednich
- Cele odwrotne łączy dwukierunkowych

Lokalizacje na tym samym poziomie nie sąsiadują ze sobą automatycznie.

Odrzucamy:

- Zduplikowane identyfikatory
- Brakujące lokalizacje nadrzędne lub cele łączy
- Bycie własnym rodzicem oraz cykle w hierarchii
- Ponad 500 lokalizacji
- Głębokość powyżej 20
- Ponad 50 łączy na lokalizację
- Ponad 50 odwołań do wpisów lorebooka na lokalizację
- Zduplikowane odwołania do wpisów lorebooka w jednej lokalizacji
- Ponad 6 referencji wizualnych na lokalizację
- Zduplikowane odwołania do tego samego obrazu w jednej lokalizacji
- Więcej niż jedną główną referencję wizualną oraz referencję główną w roli innej niż `identity`
- Dziedziczenie przez elementy podrzędne w roli innej niż `style`
- Współrzędne rozmieszczenia spoza zakresu od 0 do 100
- Niepoprawną lub zduplikowaną kolejność warstw w obrębie jednego elementu nadrzędnego
- Ruch do lokalizacji zarchiwizowanych, ukrytych, zablokowanych lub nieosiągalnych
- Nieaktualne wersje oraz zmienioną bieżącą lokalizację
- Ponownie użyte identyfikatory poleceń o innej zawartości
- Próby zmiany stanu z trybu Conversation

Limity tekstu:

- Nazwa: 200 znaków
- Opis: 4 000 znaków
- Podsumowanie orientacyjne: 1 000 znaków
- Prywatna pamięć modelu: 8 000 znaków
- Tożsamość wizualna: 800 znaków
- Notatka o zastosowaniu referencji wizualnej: 300 znaków

Cykle w łączach bezpośrednich są poprawne. Cykle w hierarchii nie.

### Archiwizacja i usuwanie

- Bieżąca lub początkowa lokalizacja wymaga atomowego zastąpienia przed archiwizacją.
- Lokalizacji z aktywnymi elementami podrzędnymi nie da się zarchiwizować.
- Trwałe usunięcie jest dozwolone tylko dla zarchiwizowanego liścia bez łączy przychodzących.
- Elementy podrzędne nigdy nie zmieniają po cichu rodzica.
- Brakujące odwołania do lorebooków pojawiają się jako ostrzeżenia, a nie jako uszkodzenie grafu.
- Archiwizacja ani usunięcie lokalizacji nigdy nie kasuje wpisów lorebooka, do których się ona odwołuje.
- Usunięcie lorebooka lub wpisu nigdy nie przepisuje po cichu mapy. Lokalizacja zachowuje uszkodzone odwołanie, które da się naprawić, dopóki twórca go nie odłączy albo nie zastąpi.
- Archiwizacja ani usunięcie lokalizacji nigdy nie kasuje współdzielonego obrazu z galerii profilu.
- Usunięcie obrazu z galerii, do którego wciąż odwołuje się lokalizacja lub zamrożony manifest storyboardu, jest blokowane, dopóki twórca go nie odłączy albo nie odświeży każdego zależnego manifestu. Brakujące odwołania do obrazów pozostają ostrzeżeniami możliwymi do naprawy i nigdy nie zamieniają się w awaryjne surowe ścieżki.

## Trwałość i historia

### Definicje

Zapisuj `SpatialContextDefinition` w `chat.metadata.spatialContext`. Aktualizacja definicji wymaga pola `expectedRevision`; przyjęta aktualizacja zwiększa numer wersji.

### Pozycja w czasie działania

Zapisuj bieżącą pozycję w migawkach adresowanych wiadomością i swipe'em, zgodnie z istniejącym wzorcem migawek stanu gry.

- Nowe czaty właściciela zaczynają od `startingLocationId`.
- Zatwierdzona tura tworzy migawkę po każdym przyjętym przemieszczeniu.
- Ponowne generowanie wiąże pozycję z powstałym swipe'em.
- Przełączenie swipe'ów rozwiązuje pasującą migawkę.
- Utworzenie gałęzi przy danej wiadomości kopiuje migawkę obowiązującą w tym miejscu, a nie najnowszą pozycję czatu źródłowego.
- Punkty kontrolne trybu Game wskazują odpowiednią migawkę przestrzenną albo ją zawierają.
- Przeładowanie rozwiązuje najnowszą zatwierdzoną migawkę.

Zwykłe tworzenie gałęzi z wiadomości nie cofa edycji definicji w MVP. Gałąź dostaje kopię bieżącej definicji z własną, przyszłą historią wersji. Pozycja w czasie działania pochodzi z punktu rozgałęzienia.

## Projekcje promptu

Wspólna serwerowa usługa projekcji rozwiązuje ustrukturyzowane dane projekcji. Cienkie adaptery trybów zamieniają je w gotowy tekst promptu.

### Projekcja fabularna dla trybu właściciela

Zawiera:

- Nazwy w ścieżce nawigacji
- Identyfikator bieżącej lokalizacji
- Publiczny opis
- Prywatną pamięć modelu dla bieżącej lokalizacji
- Nazwy, identyfikatory i etykiety łączy dostępnych celów podróży
- Instrukcję o rozstrzygającym charakterze stanu

Pomija wszystkie niepowiązane opisy i pamięci lokalizacji, cele ukryte lub zablokowane, współrzędne na płótnie oraz metadane edytora.

### Aktywacja wiedzy o świecie dla bieżącej lokalizacji

Resolver przestrzenny trybu właściciela zwraca pole `lorebookEntryIds` dokładnie tej bieżącej lokalizacji obok zwykłej projekcji przestrzennej. Formater nie wkleja tych identyfikatorów ani treści wpisów do bloku przestrzennego. Zamiast tego składanie promptu przekazuje identyfikatory do istniejącego procesora lorebooków jako kandydatów wymuszonych, ze źródłem aktywacji `current_location`.

Zasady:

- W pierwszym wydaniu przypiętą wiedzę o świecie aktywuje wyłącznie dokładnie ta bieżąca lokalizacja. Lokalizacje nadrzędne i podrzędne nie dziedziczą wpisów w sposób domyślny.
- Jawne przypięcie do lokalizacji może aktywować włączony wpis nawet wtedy, gdy jego lorebook nie jest globalny, powiązany z postacią, powiązany z personą ani przypięty do czatu.
- Globalnie wyłączony lorebook, wyłączony wpis albo jawne wykluczenie w czacie zawsze wygrywa z przypięciem.
- Istniejące makra lorebooków, pozycje wstawiania, rekurencja, kolejność oraz limity tokenów i wpisów dla każdego lorebooka działają tak samo jak dotąd.
- Wiedza przypięta do lokalizacji ma też łączny zarezerwowany limit 2 048 tokenów na jeden prompt trybu właściciela. Skracanie jest deterministyczne i widać je w panelu **Active Context** (aktywny kontekst).
- Wpis aktywowany jednocześnie przez lokalizację i zwykłą regułę słowa kluczowego, semantyczną, rekurencyjną albo stałą zostaje wstawiony raz i raportuje wszystkie źródła aktywacji.
- Zatwierdzony ruch rozwiązuje wpisy celu podróży, zanim powstanie prompt odpowiedzi trybu właściciela. Przemieszczenie oczekujące albo odrzucone nie zmienia aktywacji.
- Sformułowania trybu Game traktują lokalizację jako rozstrzygającą pozycję drużyny. Sformułowania trybu Roleplay traktują ją jako scenę ogniskową i nie zakładają, że są tam wszystkie postacie.

Panel **Active Context** grupuje te wpisy pod nagłówkiem `Current location`, pokazuje lorebook, do którego należą, źródła aktywacji, zużycie tokenów lub skrócenie oraz akcję **Open entry**. Odwołania uszkodzone, wyłączone i wykluczone pozostają widoczne w edytorze mapy, ale nigdy nie trafiają do promptu.

### Projekcja dla połączonego trybu Conversation

Dochodzi w fazie 3. Zawiera tylko:

- Nazwę i tryb powiązanej historii
- Ścieżkę nawigacji
- Pole `awarenessSummary` albo ograniczony fragment publicznego opisu
- Instrukcję tylko do odczytu
- Obecność postaci wyłącznie wtedy, gdy dowodzi jej rozstrzygający stan

Nigdy nie zawiera prywatnej pamięci modelu, wewnętrznych identyfikatorów, ukrytych celów podróży, pełnej hierarchii, identyfikatorów ani treści lorebooków przypiętych do lokalizacji, identyfikatorów referencji wizualnych lokalizacji, notatek o tożsamości wizualnej, notatek o zastosowaniu, ścieżek obrazów ani bajtów obrazów.

Tryb Game może dowieść obecności przez zatwierdzony stan `presentCharacters`. Roleplay używa neutralnych sformułowań w rodzaju "The linked story's current scene is...", dopóki nie zyska jawnego źródła danych o obecności. Nigdy nie wnioskuj o obecności z nazwy postaci.

### Wymagane ścieżki promptu

Ten sam resolver projekcji musi zasilać:

- Generowanie w trybie Roleplay
- Generowanie GM w trybie Game
- Podgląd na sucho
- Bieżące składanie w panelu **Peek Prompt** (podgląd promptu)

Panel **Peek Prompt** z pamięci podręcznej nadal pokazuje dokładnie ten prompt, który został wysłany. Logi diagnostyczne obejmują końcową projekcję, ale przy zwykłych poziomach logowania nie mogą zapisywać prywatnej pamięci modelu.

### Projekcja wizualna bieżącej lokalizacji dla generowania obrazów

Referencje wizualne korzystają z innego resolvera niż prompt fabularny. Rozwiązuje on migawkę przestrzenną właściwą dla celu obrazu, a nie po prostu najnowszą lokalizację czatu. Automatyczna grafika trybu Game używa migawki zatwierdzonej dla danej wiadomości asystenta. Ponowna próba grafiki dla wcześniejszego swipe'a oraz wywołanie narzędzia **Illustrator** z wcześniejszej wiadomości korzystają z lokalizacji rozwiązanej dla tej wiadomości i tego swipe'a.

Uprawnione ścieżki to automatyczna grafika sceny w trybie Game, ręczna ilustracja sceny w trybie Game oraz generowanie sceny lub tła narzędziem **Illustrator** w trybie Roleplay, gdy dla danego czatu włączono kontrolkę referencji lokalizacji. Generowanie portretów, selfie, awatarów i sprite'ów nie dołącza referencji lokalizacji automatycznie.

Dwie kontrolki w metadanych czatu odpowiadają istniejącym kontrolkom referencji awatara: `illustratorUseLocationReferences` i `gameImageUseLocationReferences`. Brak wartości lub wartość fałszywa oznacza wyłączenie, co zachowuje zgodność wsteczną. Gdy twórca ustawia pierwszy główny obraz lokalizacji, ten sam zapis proponuje opcję `Use this location in scene art`, domyślnie zaznaczoną, ale wymagającą świadomej zgody, żeby bajty obrazu nigdy nie trafiły do dostawcy tylko dlatego, że obraz widać w edytorze mapy.

Kolejność kandydatów jest deterministyczna i zależna od dostawcy:

1. Referencje wskazane wprost dla tego żądania obrazu.
2. Główna referencja `identity` dokładnie tej rozwiązanej lokalizacji.
3. Wskazane postacie i persona w kolejności ze sceny.
4. Uzupełniające referencje `identity` i `detail` dokładnie tej lokalizacji, w kolejności `sortOrder`.
5. Dziedziczona referencja `style` z najbliższej lokalizacji nadrzędnej.

Rezerwowy wybór na podstawie sąsiedztwa ani nazwy jest niedozwolony. Do zwykłego żądania sceny kandydują najwyżej dwa obrazy lokalizacji, a istniejący adapter dostawcy stosuje swój łączny limit obrazów. Referencje wskazane wprost w żądaniu zawsze zajmują miejsca jako pierwsze. W pozostałych automatycznych miejscach żądanie tła stawia tożsamość lokalizacji przed referencjami postaci, a ilustracja wybiera główną referencję lokalizacji przed kolejnymi referencjami przedstawianych osób. Jeśli dostawca nie przyjmie jednocześnie miejsca i wszystkich wskazanych osób, podgląd pokazuje deterministyczny kompromis i każdy powód pominięcia.

Kompilator promptu obrazu dokłada ścieżkę nawigacji lokalizacji, ograniczone pole `visualIdentity` oraz ograniczone pole `usageNote` każdej wybranej referencji. Autorytetem stylu pozostaje wybrany dla czatu `ImageStyleProfile`. Obrazy referencyjne utrwalają tożsamość miejsca lub postaci i nie mogą po cichu zastąpić opisu stylu z profilu, tagów pozytywnych, tagów negatywnych ani trybu promptu.

Role referencji wyrażają intencję twórcy i kolejność wyboru; nie gwarantują, że każdy dostawca odczyta obraz jako tożsamość, detal, układ lub styl. Notatki o możliwościach dostawcy oraz wygenerowany podgląd zostawiają twórcy ostatnie słowo w sprawach wizualnych.

Żądania do modeli tekstowych nie dostają żadnych z tych bajtów obrazu ani notatek dotyczących wyłącznie obrazów. Połączony tryb Conversation nie dostaje ani identyfikatorów referencji wizualnych, ani ich treści. Logi diagnostyczne generowania obrazów mogą zawierać identyfikatory obrazów, identyfikatory lokalizacji, role, powody wyboru i pominięcia, ale nigdy dane base64 ani ścieżki w systemie plików.

### Manifesty referencji wizualnych w storyboardzie

Adapter storyboardu rozwiązuje kandydatów wizualnych raz dla ukończonej tury GM, po zatwierdzeniu jej wiadomości i swipe'a. Zapisuje zamrożony bank oraz zestaw referencji dobrany do możliwości dostawcy dla każdej klatki kluczowej. W ten sposób trwała tożsamość referencji jest czymś innym niż żądanie do dostawcy, który przyjmie może tylko niewielki podzbiór.

Wybór jest deterministyczny:

1. Referencje wskazane wprost dla klatki kluczowej zajmują miejsca jako pierwsze.
2. Gdy zostaje jedno automatyczne miejsce, klatka otwierająca wybiera obraz główny lokalizacji, a klatka z widocznymi postaciami wybiera postać pierwszoplanową.
3. Gdy zostają dwa automatyczne miejsca lub więcej, wybierany jest obraz główny dokładnie tej lokalizacji, a potem po jednej głównej referencji każdej widocznej postaci lub persony w kolejności narracyjnej.
4. Pozostałą pojemność zajmuje jedna uzupełniająca referencja `identity` lub `detail` dokładnie tej lokalizacji, potem drugorzędne referencje przedstawianych bytów, a na końcu najbliższa dziedziczona referencja stylu lokalizacji.

Storyboard nigdy nie tworzy samoczynnie arkusza stykowego ani referencji złożonej. Takie techniki potrafią zmienić interpretację po stronie dostawcy i zostają jako przyszła optymalizacja zależna od dostawcy. Brakujące obrazy, zmiana dostawcy albo obniżony limit dostawcy oznaczają manifest jako `needs_review`; nie prowadzą do cichego wyboru innego bytu. Zwiększenie pojemności również zachowuje zamrożony zestaw, dopóki nie potwierdzisz akcji `Refresh references`.

Manifest zapisuje identyfikatory, etykiety, role, kolejność, powody wyboru, pominięcia, wiadomość źródłową i swipe, identyfikator rozwiązanej lokalizacji, wersję definicji, tożsamość dostawcy oraz zastosowany limit referencji. Nie zapisuje bajtów obrazów ani ścieżek w systemie plików. Wyjście diagnostyczne może ten manifest opisywać, ale obowiązują je te same zasady bez base64 i bez ścieżek co przy zwykłym generowaniu obrazów.

## Zgodność z trybem Game

Istniejące mapy siatkowe i węzłowe trybu Game pozostają reprezentacją lokalną lub taktyczną. Hierarchia staje się warstwą świata i zawierania ponad nimi.

Gdy Spatial Context jest włączony:

- Spatial Context dostarcza promptom rozstrzygającą nazwaną lokalizację.
- Tracker trybu Game pokazuje ścieżkę nawigacji jako swoją lokalizację.
- Dawne poprawki modelu ani ręczne nie mogą samodzielnie zmienić tekstowej lokalizacji trybu Game.
- Pole `GameMap.spatialLocationId` może powiązać całą mapę z jedną lokalizacją hierarchii.
- Pola `GridCell.spatialLocationId` i `MapNode.spatialLocationId` mogą powiązać cel podróży, w który da się wejść.
- Powiązania korzystają wyłącznie ze stabilnych identyfikatorów; nazwy nigdy nie są dopasowywane automatycznie.
- Wybór powiązanego celu tworzy takie samo przejście oczekujące jak przeglądarka hierarchii.
- Ruch między niepowiązanymi polami lub węzłami zmienia tylko taktyczną pozycję drużyny.
- Wejście do lokalizacji może wybrać powiązaną z nią mapę lokalną; wyjście może wybrać najbliższą powiązaną mapę nadrzędną.

Po wyłączeniu dotychczasowe działanie lokalizacji w trybie Game nie zmienia się.

Ta granica zachowuje obecny interfejs map i zapisy gry, a jednocześnie nie dopuszcza do powstania dwóch źródeł prawdy o nazwanej przestrzeni.

## Kształt API

```text
GET  /api/chats/:chatId/spatial-context
PUT  /api/chats/:chatId/spatial-context
```

Aktualizacja definicji:

```ts
interface UpdateSpatialContextRequest {
  expectedRevision: number;
  expectedCurrentLocationId: string | null;
  replacementCurrentLocationId?: string | null;
  definition: SpatialContextDefinition;
}
```

Pole `replacementCurrentLocationId` przydaje się tylko wtedy, gdy edycja definicji archiwizuje obowiązującą bieżącą lokalizację. Serwer musi zweryfikować i zastosować to zastąpienie w tym samym zapisie co nową wersję definicji. Zwykłe przemieszczanie nadal idzie przez wysłanie tury w trybie właściciela.

Przemieszczenie oczekujące wysyłamy w istniejącym żądaniu tury trybu właściciela, a nie osobnym punktem końcowym natychmiastowego przejścia.

Serwer sprawdza spójność definicji, tryb właściciela, oczekiwaną wersję, oczekiwaną bieżącą lokalizację, osiągalność i idempotencję polecenia w tej samej transakcji co wysłanie wiadomości.

Zwracaj `409 Conflict` przy nieaktualnym stanie i `400 Bad Request` przy niepoprawnych grafach lub celach. Komunikaty błędów nie mogą ujawniać ukrytych celów podróży.

## Plan wdrożenia

### Faza 0: wspólny rdzeń i dane dowodowe

- Dodanie wspólnych typów i schematów Zod.
- Dodanie czystych funkcji walidacji grafu, ścieżki nawigacji i celów podróży.
- Dodanie deterministycznych danych testowych dla grafów poprawnych i niepoprawnych.
- Potwierdzenie punktów integracji migawek wiadomości i swipe'ów dla trybów Roleplay i Game.
- Pomiar reprezentatywnych projekcji promptu.

Warunek wyjścia: schemat, semantyka przemieszczania i zachowanie migawek są udowodnione bez interfejsu.

### Faza 1: MVP trybu właściciela

1. Dodanie trwałego zapisu definicji z optymistyczną kontrolą współbieżności.
2. Dodanie przechowywania i rozwiązywania migawek przestrzennych.
3. Wpięcie atomowego przemieszczenia oczekującego w wysyłanie tury trybu właściciela.
4. Obsługa przeładowania, swipe'ów, gałęzi i punktów kontrolnych trybu Game.
5. Dodanie wspólnej usługi projekcji do każdej wymaganej ścieżki promptu.
6. Dodanie zwartej sekcji ustawień, nawigatora hierarchii, płótna mapy lokalnej, selektora warstw i warsztatu edycji.
7. Dodanie ścieżki nawigacji, listy celów podróży, podglądu i stanu oczekiwania na ekranach trybu właściciela.
8. Powiązanie istniejących map, pól i węzłów trybu Game przez stabilne identyfikatory lokalizacji.
9. Uzgodnienie lokalizacji w trackerze trybu Game po włączeniu funkcji.

Warunek wyjścia: Roleplay i Game potrafią tworzyć, przemieszczać, zapisywać, przywracać i promptować z tego samego modelu przestrzennego. Ruch po powiązanej mapie trybu Game i niepowiązany ruch taktyczny pozostają rozdzielone.

### Faza 2A: powiązania lokalizacji z lorebookami i działanie w czasie gry

- Dodanie pola `lorebookEntryIds` do lokalizacji z domyślną pustą tablicą dla zgodności.
- Dodanie do edytora lokalizacji wbudowanych stanów: przypięcia, otwarcia, odłączenia, wyłączenia, wykluczenia i uszkodzonego odwołania.
- Rozwiązywanie odwołań dokładnie bieżącej lokalizacji jako kandydatów wymuszonych przez istniejący procesor lorebooków.
- Ponowne użycie zwykłych makr, wstawiania, rekurencji, kolejności i limitów każdego lorebooka; dodanie deterministycznego usuwania duplikatów i łącznego limitu 2 048 tokenów dla wiedzy przypiętej do lokalizacji.
- Raportowanie źródła `current_location` obok źródeł aktywacji przez słowo kluczowe, semantycznych, rekurencyjnych i stałych w panelu **Active Context**.
- Udowodnienie identycznego działania w trybach Roleplay i Game, łącznie z przemieszczaniem, przeładowaniem, ponownym generowaniem, swipe'ami i gałęziami.
- Udowodnienie, że połączony tryb Conversation nie dostaje ani identyfikatorów, ani treści wiedzy przypisanej do lokalizacji.

Warunek wyjścia: twórcy mogą jawnie wiązać istniejącą wiedzę o świecie z lokalizacjami, a wpisy te aktywuje wyłącznie przyjęta bieżąca lokalizacja w promptach trybu właściciela.

### Faza 2B: szkic mapy ugruntowany w lorebookach

- Rozszerzenie żądań tworzenia, zastąpienia i bezpiecznego dla historii rozszerzania o tryb ugruntowania oraz jawny wybór lorebooków lub wpisów źródłowych.
- Odczyt wybranych włączonych wpisów bezpośrednio na potrzeby tej operacji tworzenia, zamiast polegania na aktywacji przez słowa kluczowe albo na wygenerowanym przeglądzie świata.
- Zbudowanie ograniczonego katalogu źródeł świadomego kontekstu połączenia, z widoczną liczbą pominięć i deterministyczną kolejnością.
- Przekazanie modelowi tymczasowych kluczy źródłowych, weryfikacja każdego zwróconego klucza po stronie serwera i zapisanie wyłącznie stabilnych identyfikatorów wpisów.
- Obsługa zachowań `setup_only`, `lore_strict` i `lore_expand` wraz z pochodzeniem widocznym w podglądzie.
- Automatyczne wiązanie poprawnych wpisów źródłowych z wygenerowanymi lokalizacjami, z zachowaniem akcji **Apply** i **Save** jako osobnych granic przeglądu.
- Zachowanie każdego istniejącego identyfikatora lokalizacji i powiązania z wiedzą podczas rozszerzania wyłącznie dodającego.

Warunek wyjścia: twórca obeznany z lorebookami może wygenerować mapę ugruntowaną wprost w wybranym kanonie, rozpoznać każdy niepoparty dodatek i odrzucić go albo poprawić przed zapisem.

### Faza 2C: tożsamość wizualna lokalizacji i referencje do scen

- Dodanie ograniczonych pól `visualIdentity` i `visualReferences` z pustymi wartościami domyślnymi dla zgodności.
- Ponowne użycie trwałych identyfikatorów obrazów z galerii profilu oraz istniejących, bezpiecznych ścieżek wgrywania, metadanych i generowania obrazów. Zakaz zapisywania surowych ścieżek, zewnętrznych adresów URL i danych base64 w definicji.
- Dodanie równoległych kontrolek referencji lokalizacji dla narzędzia **Illustrator** i trybu Game w obrębie czatu. Zapis pierwszego obrazu głównego prosi o wyraźną zgodę przed udostępnieniem obrazu dostawcy.
- Generowanie referencji otwierającej wyłącznie z ograniczonego kontekstu dokładnie tej lokalizacji i włączonej przypiętej wiedzy. Zakaz przeszukiwania niepowiązanych lorebooków i gałęzi hierarchii.
- Dodanie do edytora lokalizacji wbudowanych stanów: obrazu głównego, uzupełniającego, roli, notatki o zastosowaniu, wyboru z galerii, wgrania, wygenerowania, odłączenia, uszkodzonego odwołania i odnośników zwrotnych.
- Rozwiązywanie dokładnej lokalizacji danej wiadomości i swipe'a w uprawnionych żądaniach grafiki scen w trybach Game i Roleplay, a potem łączenie referencji lokalizacji, postaci, persony i wskazanych wprost w granicach limitów dostawcy.
- Dodanie jawnego awansowania `Set as location reference` dla wygenerowanej grafiki. Zakaz automatycznego awansowania wygenerowanych scen.
- Zachowanie identyfikatorów referencji wizualnych w gałęziach i w eksporcie metadanych JSONL, ostrzeganie o brakujących zasobach w profilu docelowym oraz objęcie zasobów kopią zapasową profilu i przywracaniem.
- Udowodnienie, że prompty fabularne i połączony tryb Conversation nie dostają identyfikatorów obrazów lokalizacji, bajtów, ścieżek ani notatek dotyczących samych obrazów.

Warunek wyjścia: twórca może wizualnie ustalić miejsce, wygenerować wiele scen korzystających z jego przejrzanej tożsamości, zobaczyć dokładnie, które referencje wizualne poszły w świat, oraz usunąć je lub wymienić bez zmiany prawdy przestrzennej i wiedzy o świecie.

### Faza 2D: manifesty referencji wizualnych w storyboardzie

- Dodanie adaptera storyboardu wokół resolvera wizualnego z fazy 2C, zamiast wiązania trwałego zapisu przestrzennego ze storyboardem.
- Rozwiązanie migawki przestrzennej wiadomości źródłowej i swipe'a, a potem zamrożenie banku referencji lokalizacji i bytów oraz zestawów wysyłanych do dostawcy dla każdej klatki kluczowej.
- Ponowne użycie obrazu głównego dokładnie tej lokalizacji w kolejnych klatkach, o ile pozwala na to pojemność, przy wyborze referencji postaci i persony z listy widocznych postaci każdej klatki.
- Zapisanie tożsamości dostawcy, pojemności referencji, uporządkowanych wyborów i powodów pominięć, żeby ponowne generowanie dawało odtwarzalny wynik.
- Dodanie do podglądu i ponownego generowania storyboardu wbudowanych stanów `Visual sources`, `Review references` oraz jawnej akcji `Refresh references`.
- Odrzucenie cichego przewyboru, gdy brakuje obrazu albo pojemność dostawcy maleje. Zakaz automatycznego wypełniania nowo dostępnej pojemności.
- Zachowanie manifestu w istniejącym cyklu życia storyboardu i udowodnienie, że przejście z klatki kluczowej do wideo nadal używa jako pierwszej klatki wyłącznie wyrenderowanej klatki kluczowej.

Warunek wyjścia: każda klatka kluczowa storyboardu potrafi wyjaśnić i odtworzyć swoje wejścia wizualne, powtarzane klatki dzielą tę samą, historycznie poprawną tożsamość miejsca, a ograniczenia dostawcy nigdy nie podmieniają po cichu lokalizacji ani przedstawianych osób.

### Faza 3: połączony tryb Conversation

- Rozwiązanie najnowszego stanu właściciela przez `connectedChatId` w chwili generowania.
- Dodanie ograniczonej projekcji tylko do odczytu.
- Używanie ostrożnych sformułowań o obecności.
- Wykluczenie identyfikatorów i treści wiedzy przypiętej do lokalizacji, identyfikatorów i metadanych referencji wizualnych, ścieżek obrazów oraz bajtów obrazów, nawet gdy generowanie w trybie właściciela z nich korzysta.
- Pokrycie odłączenia, ponownego połączenia, usuniętego właściciela, uszkodzonych powiązań, zakończonych historii oraz kontroli negatywnych dla wiedzy przypisanej do lokalizacji.

### Faza 4: przemieszczanie na żądanie modelu

- Dodanie typowanego żądania `change_location` dla trybów właściciela.
- Zastosowanie tej samej walidacji wersji, osiągalności i idempotencji.
- Zapisywanie przyjętych i odrzuconych żądań w diagnostyce.
- Conversation nadal nie może prosić o przejścia.

### Faza 5: szablony twórcy

- Zapis i import wielokrotnie używanych poddrzew lokalizacji albo całych map.
- Umożliwienie twórcom dołączania map startowych do postaci po ustaleniu zasad własności i scalania.
- Zachowanie wewnętrznych odwołań przy generowaniu nowych identyfikatorów w trakcie kopiowania do innego czatu.

## Plan wdrożenia w repozytorium

Punkt odniesienia dla planu: gałąź `hierarchical-locations` po scaleniu gałęzi `staging` z rewizji `4fd752ea` z dnia 2026-07-13. W tym punkcie gałąź zawiera wyłącznie dokumenty planistyczne V1, V2 i V3. Kodu wykonawczego funkcji Spatial Context jeszcze nie ma.

### Potwierdzone ograniczenia integracyjne

| Zagadnienie | Obecne zachowanie repozytorium | Konsekwencja dla wdrożenia |
| --- | --- | --- |
| Zapis definicji | Metadane czatu są w formacie JSON, a ogólne aktualizacje metadanych scalają dane częściowo. | Definicje przestrzenne zostają w `chat.metadata.spatialContext`, ale korzystają z dedykowanego, weryfikowanego punktu końcowego zamiast ogólnej trasy aktualizacji metadanych. |
| Historia w czasie działania | Tabela `game_state_snapshots` to jedyna historia stanu świata adresowana wiadomością i swipe'em. | Dochodzi tabela migawek przestrzennych niezależna od trybu. Nie dodawaj kolumn funkcji Spatial Context do migawek dostępnych tylko w trybie Game. |
| Start tury właściciela | Trasa `/api/generate` zapisuje widoczny stan gry, tworzy wiadomość użytkownika, a potem osobnymi wywołaniami aktualizuje załączniki i dane persony. | Dochodzi mała usługa tury właściciela w granicach transakcji, żeby utworzenie wiadomości użytkownika i przyjęty ruch przestrzenny udawały się albo zawodziły razem. Wywołania do dostawcy zostają poza transakcją. |
| Swipe'y i gałęzie | Usunięcie swipe'a przesuwa indeksy migawek trybu Game. Utworzenie gałęzi kopiuje wszystkie migawki trybu Game i migawki tur do nowych identyfikatorów wiadomości. | Migawki przestrzenne muszą brać udział w obu ścieżkach i muszą kopiować migawkę obowiązującą we wcześniejszym punkcie rozgałęzienia. |
| Składanie promptu | Generowanie na żywo, przebieg na sucho, bieżący panel **Peek Prompt**, panel **Peek Prompt** z pamięci podręcznej i prompty GM trybu Game mają osobne ścieżki składania. | Rozwiąż ustrukturyzowane dane przestrzenne raz, a potem wywołuj wspólny formater z każdej ścieżki na żywo. Panel **Peek Prompt** z pamięci podręcznej nadal czyta dokładnie to żądanie, które zapisano. |
| Dane po stronie klienta | Dane serwera obsługuje React Query. Wersje robocze wpisu dla każdego czatu przeżywają nawigację i przeładowanie. Ciężkie edytory ładują się na żądanie przez `AppShell`. | Dochodzi dedykowany hook zapytania i mutacji, przejścia oczekujące zapisujemy obok wersji roboczych czatu, a ładowany na żądanie edytor lokalizacji prowadzimy przez istniejący model widoku szczegółów. |
| Podróże w trybie Game | Mapy trybu Game mają już pozycje na siatce i w węzłach oraz oczekujący ruch po mapie, który zamienia się w widoczny tekst `*moves to ...*`. | Dochodzą opcjonalne powiązania po stabilnych identyfikatorach. Powiązane cele korzystają z ustrukturyzowanych żądań przestrzennych bez widocznej prozy; ruch niepowiązany zachowuje dotychczasowy przebieg taktyczny. |
| Magazyn danych | Migawki zapisywane natywnie w plikach to jedyny backend trwałego zapisu. Używamy małych transakcji i unikamy dużych pętli transakcyjnych, żeby zapisy pozostały szybkie. | Transakcja tury właściciela ma mieć stały rozmiar i wymaga sprawdzenia na magazynie plikowym przed rozbudową funkcji. |
| Przetwarzanie lorebooków | Aktywacja lorebooków obsługuje już jawne identyfikatory czatów, dopasowanie po słowach kluczowych i semantyczne, makra, rekurencję, kolejność oraz znaczniki promptu. Początkowa konfiguracja trybu Game skanuje bez żadnych wiadomości czatu, więc zwykłe wpisy ze słowami kluczowymi nie ugruntowują bezpośrednio późniejszego szkicu mapy. | Dochodzą wymuszeni kandydaci bieżącej lokalizacji we wspólnym procesorze lorebooków, a tworzenie mapy dostaje osobną, jawną i ograniczoną ścieżkę katalogu źródeł. Nie wnioskuj kanonu mapy z samego przeglądu świata. |
| Spójność obrazów | Profile stylu obrazów sterują stylem promptu, awatary postaci i persony można już wysyłać jako referencje, a dostawcy przyjmują różną maksymalną liczbę referencji. Galerie przechowują stabilne identyfikatory obrazów osobno od ścieżek plików. | Tożsamość miejsca zostaje oddzielona od globalnego stylu i tożsamości postaci. Rozwiązuj właściwą migawkę przestrzenną, dołączaj stabilne obrazy z galerii wyłącznie do uprawnionych żądań grafiki scen i przycinaj kandydatów deterministycznie w istniejących adapterach dostawców. |
| Referencje w storyboardzie | Storyboard planuje już widoczne postacie dla każdej klatki kluczowej, rozwiązuje limity referencji danego dostawcy, wysyła obrazy postaci w podglądzie i renderowaniu, zapisuje swoją wiadomość źródłową i swipe oraz używa każdej wyrenderowanej klatki kluczowej jako pierwszej klatki wideo. | Dochodzi zamrożony manifest referencji wizualnych, który raz rozwiązuje historyczną lokalizację, zmienia postacie w każdej klatce kluczowej i zachowuje uporządkowane wybory przy ponownym generowaniu. Wejście z klatki do wideo pozostaje bez zmian. |

### Mapa docelowych modułów

Nowe moduły wspólne:

- `packages/shared/src/types/spatial-context.ts`: publiczne typy definicji, migawki, przejścia, projekcji, odpowiedzi, ostrzeżeń i kodów błędów.
- `packages/shared/src/schemas/spatial-context.schema.ts`: schematy Zod oraz wszystkie limity zapisu i żądań.
- `packages/shared/src/utils/spatial-context.ts`: czyste indeksowanie grafu, walidacja, ścieżka nawigacji, osiągalność, kontrole archiwizacji i deterministyczne sortowanie celów podróży.
- `packages/shared/src/index.ts`: jawne eksporty nowego wspólnego kontraktu.

Nowe moduły serwera:

- `packages/server/src/db/schema/spatial-context.ts`: schemat `spatial_context_snapshots`.
- `packages/server/src/services/storage/spatial-context.storage.ts`: odczyty i zapisy migawek, kopie gałęzi, przesunięcia swipe'ów, wyszukiwanie poleceń i porządkowanie danych.
- `packages/server/src/services/spatial-context/state-resolution.ts`: rozwiązywanie obowiązującej migawki przy starcie, dla widocznego swipe'a, przy ponownym generowaniu, rozgałęzianiu i punktach kontrolnych.
- `packages/server/src/services/spatial-context/projection.ts`: ustrukturyzowane projekcje dla trybu właściciela i trybu połączonego oraz ograniczone formatowanie tekstu.
- `packages/server/src/services/spatial-context/visual-reference-resolution.ts`: wybór wizualny lokalizacji świadomy migawki, dziedziczenie, kandydaci dla dostawcy i bezpieczna diagnostyka.
- `packages/server/src/services/spatial-context/storyboard-reference-manifest.ts`: zamrożone banki storyboardu, wybór zestawu dla każdej klatki kluczowej, przegląd pojemności dostawcy, odświeżanie i bezpieczna serializacja.
- `packages/server/src/services/spatial-context/owner-turn.ts`: walidacja oraz atomowy ruch o stałym rozmiarze wraz z zapisem wiadomości użytkownika.
- `packages/server/src/services/spatial-context/game-map-binding.ts`: rozstrzygająca projekcja ścieżki nawigacji oraz rozwiązywanie jawnych powiązań mapy, pola i węzła trybu Game.
- `packages/server/src/routes/spatial-context.routes.ts`: dedykowane trasy GET i wersjonowana trasa PUT.

Nowe moduły klienta:

- `packages/client/src/hooks/use-spatial-context.ts`: klucze zapytań, GET, PUT definicji, obsługa konfliktów i unieważnianie pamięci podręcznej.
- `packages/client/src/features/spatial-context/SpatialContextSettingsSection.tsx`: zwarte podsumowanie w panelu **Chat Settings** i akcja otwarcia edytora.
- `packages/client/src/features/spatial-context/SpatialMapWorkspace.tsx`: ładowana na żądanie powłoka pełnoekranowego edytora.
- `packages/client/src/features/spatial-context/components/HierarchyNavigator.tsx`: nawigacja po hierarchii i obsługa klawiatury.
- `packages/client/src/features/spatial-context/components/LocalMapCanvas.tsx`: mapa lokalizacji podrzędnych z pozycjami.
- `packages/client/src/features/spatial-context/components/LayerSelector.tsx`: uporządkowane warstwy pięter, wież i lochów.
- `packages/client/src/features/spatial-context/components/LocationInspector.tsx`: edycja pól, podgląd, łącza, kontrolki archiwizacji i walidacja na miejscu.
- `packages/client/src/features/spatial-context/components/SpatialContextRuntimeBar.tsx`: ścieżka nawigacji, lista celów podróży, stan oczekiwania i akcja czyszczenia.
- `packages/client/src/features/spatial-context/lib/editor-state.ts`: operacje na kopii roboczej i mapowanie błędów serwera. Ten moduł pozostaje lokalny dla klienta i nie jest eksportowany przez plik zbiorczy.

Istniejące pliki integracyjne, które prawdopodobnie się zmienią:

- Trwały zapis: `packages/server/src/db/migrate.ts`, `packages/server/src/db/schema/index.ts`, `packages/server/src/db/file-backed-store.ts`, `packages/server/src/services/storage/chats.storage.ts` oraz `packages/server/src/routes/backup.routes.ts`, jeśli wymaga tego rejestracja tabeli.
- Cykl życia czatu: `packages/server/src/routes/chats.routes.ts`, `packages/server/src/routes/generate.routes.ts` i `packages/shared/src/schemas/chat.schema.ts`.
- Ścieżki promptu: `packages/server/src/routes/generate/dry-run-route.ts`, `packages/server/src/services/generation/game-gm-prompt-runtime.ts` oraz część pliku `packages/server/src/routes/chats.routes.ts` odpowiadająca za podgląd na żywo.
- Ugruntowanie i aktywacja lorebooków: `packages/server/src/services/lorebook/`, `packages/server/src/routes/spatial-context.routes.ts`, `packages/client/src/features/spatial-context/components/LocationInspector.tsx`, edytor lorebooków i interfejs panelu **Active Context**.
- Grafika referencyjna lokalizacji: `packages/server/src/db/schema/gallery.ts`, magazyn i trasy galerii, `packages/server/src/services/image/`, `packages/server/src/routes/generate/illustrator-references.ts`, ilustracje trybu Game i składanie storyboardu w `packages/server/src/routes/game.routes.ts`, `packages/server/src/services/storage/game-storyboards.storage.ts`, wspólne kontrakty promptu storyboardu, `packages/client/src/features/spatial-context/components/LocationInspector.tsx` oraz interfejsy generowania obrazów i podglądu storyboardu.
- Trasowanie i ścieżki wysyłki po stronie klienta: `packages/client/src/stores/ui.store.ts`, `packages/client/src/stores/chat.store.ts`, `packages/client/src/components/layout/AppShell.tsx`, `packages/client/src/components/chat/ChatSettingsDrawer.tsx`, `packages/client/src/components/chat/ChatArea.tsx`, `packages/client/src/components/chat/ChatRoleplaySurface.tsx`, `packages/client/src/components/chat/ChatInput.tsx`, `packages/client/src/components/game/GameSurface.tsx` i `packages/client/src/components/game/GameInput.tsx`.
- Przenośność i dowody: kod natywnego importu i eksportu czatów w `packages/server/src/routes/chats.routes.ts` oraz `packages/server/src/services/import/`, `scripts/regressions/`, `e2e/core-flows.e2e.ts` i skrypty w głównym pliku `package.json`.

Lista plików wyznacza granicę, a nie obowiązek zmiany każdego z nich w jednym pull requeście. Każdy pakiet prac opisany niżej powinien mieć wąską zmianę.

### Kontrakt trwałego zapisu

Definicje zostają w metadanych czatu i kopiują się automatycznie, gdy gałąź kopiuje metadane czatu. Stan w czasie działania korzysta z osobnej tabeli:

```ts
interface SpatialContextSnapshotRow {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  source: "bootstrap" | "owner_turn" | "assistant_swipe" | "definition_repair" | "branch_copy";
  transitionCommandId: string | null;
  transitionPayloadHash: string | null;
  createdAt: string;
}
```

Wymagane indeksy i niezmienniki:

- Jeden obowiązujący wiersz na `(chatId, messageId, swipeIndex)`.
- Identyfikator polecenia przejścia jest unikalny w obrębie czatu, gdy nie jest pusty.
- Powtórzony identyfikator polecenia z innym celem, oczekiwaną wersją albo oczekiwaną bieżącą lokalizacją zwraca `409 spatial_transition_command_mismatch`.
- Powtórzony identyfikator polecenia z tą samą zawartością zwraca `409 spatial_transition_already_applied`, dołącza zapisaną migawkę i identyfikator wiadomości użytkownika oraz nie wykonuje drugiego zapisu. Klient uzgadnia stan na podstawie odpowiedzi, zamiast wysyłać turę ponownie.
- Wiersze migawek korzystają ze stabilnych identyfikatorów lokalizacji. Zmiana nazwy i przeniesienie w hierarchii nie przepisują migawek.
- Wiersz startowy używa `messageId: ""` i swipe'a `0`, dopóki nie istnieje zatwierdzona kotwica w postaci wiadomości.
- Usunięcie czatu, wiadomości lub swipe'a usuwa albo przesuwa pasujące wiersze przestrzenne w tych samych miejscach, w których dziś obsługiwane są migawki trybu Game i migawki tur.

Nową tabelę trzeba zarejestrować w definicjach tabel plikowych, na liście tabel zapisywanych w plikach, w grafie kaskad, w kopii zapasowej i przywracaniu profilu oraz w metadanych spójności bazy Mari DB. Zachowanie wyszukiwania musi pokrywać regresja dla magazynu plikowego.

### Zasady stanu obowiązującego i historii

Jeden resolver obsługuje API, prompty, rozgałęzianie i odpowiedź dla klienta:

1. Jeśli żądanie wskazuje konkretną wiadomość i swipe, zwróć tę migawkę przestrzenną.
2. Dla bieżącego widoku sprawdź najnowszą widoczną wiadomość asystenta i jej aktywny swipe.
3. Jeśli ten swipe asystenta nie ma wiersza, cofaj się do najbliższej migawki tury użytkownika lub asystenta w kolejności widocznych wiadomości.
4. W ostateczności użyj wiersza startowego.
5. Jeśli nie ma żadnej migawki, a włączona definicja ma poprawną lokalizację początkową, zwróć stan początkowy trzymany w pamięci i utrwal go przy pierwszej turze właściciela.

Kotwiczenie tury właściciela:

- Przed zapisem rozwiąż stan źródłowy z aktualnie widocznej historii, a nie z najnowszego wiersza według samego znacznika czasu.
- W atomowej transakcji tury utwórz wiadomość użytkownika, pierwszy swipe, znaczniki czasu czatu oraz migawkę przestrzenną `owner_turn` zakotwiczoną w tej wiadomości użytkownika.
- Po zapisaniu odpowiedzi asystenta utrwal ten sam stan na jej `(messageId, swipeIndex)` jako `assistant_swipe`.
- Nieudane lub przerwane wywołanie dostawcy zostawia przyjętą turę użytkownika i jej migawkę przestrzenną zapisane. Po przeładowaniu widać więc ruch i zapisaną wiadomość użytkownika, bez wymyślonej odpowiedzi asystenta.
- Ponowne generowanie rozwiązuje stan bezpośrednio sprzed docelowej wiadomości asystenta i zapisuje go w nowym swipie. Kontynuacja zachowuje stan docelowego swipe'a.
- Wybór swipe'a zmienia stan obowiązujący przez istniejący wiersz aktywnego swipe'a. Nie przepisuje pozostałych migawek.
- Utworzenie gałęzi kopiuje definicję, przypisuje każdą skopiowaną migawkę przestrzenną do nowych identyfikatorów wiadomości i obejmuje wiersz startowy. Gałąź z wcześniejszej wiadomości przerywa kopiowanie na wybranym punkcie odcięcia.
- Punkty kontrolne trybu Game zapisują identyfikator odpowiedniej migawki przestrzennej albo stabilną kopię jej bieżącej lokalizacji i wersji definicji. Wczytanie punktu kontrolnego przywraca zarówno stan gry, jak i stan przestrzenny.

Edycja definicji nie jest historyczna. Zmiana nazwy lub rodzica zmienia ścieżkę nawigacji renderowaną dla starych migawek, bo stabilny identyfikator lokalizacji rozwiązuje się względem bieżącej definicji danej gałęzi. Stara migawka może wskazywać lokalizację zarchiwizowaną; nadal da się ją odczytać, ale kolejnym celem podróży musi być aktywny, osiągalny węzeł. Jeśli edytor archiwizuje obowiązującą lokalizację, wymagane jest pole `replacementCurrentLocationId`, a serwer zapisuje migawkę `definition_repair` przy bieżącej widocznej kotwicy w tej samej transakcji co nowa wersja definicji.

### Atomowa sekwencja tury właściciela

Rozszerz `generateRequestSchema` i kliencki kontrakt generowania o opcjonalne pole `pendingSpatialTransition`. Przyjmujemy je wyłącznie dla czatów właściciela w trybach Roleplay i Game.

Sekwencja po stronie serwera:

1. Pobierz istniejącą blokadę generowania dla danego czatu.
2. Sparsuj żądanie i wczytaj czat w cyklu życia żądania.
3. Jeśli nie ma przejścia przestrzennego, zachowaj dotychczasowy przebieg wiadomości.
4. Jeśli przejście istnieje, rozpocznij transakcję bazy danych o stałym rozmiarze.
5. Odczytaj definicję i widoczny stan ponownie wewnątrz transakcji.
6. Sprawdź tryb właściciela, stan włączenia, oczekiwaną wersję definicji, oczekiwaną bieżącą lokalizację, identyfikator polecenia, status celu i osiągalność.
7. Utwórz wiadomość użytkownika i pierwszy swipe przez instancję magazynu czatów związaną z transakcją.
8. Wstaw migawkę przestrzenną i zaktualizuj znaczniki czasu czatu.
9. W trybie Game zapisz widoczną migawkę gry w tej samej transakcji, o ile to wykonalne.
10. Zatwierdź transakcję, a potem poza nią kontynuuj wzbogacanie załączników, tworzenie migawki persony, składanie promptu i pracę z dostawcą.

Błędy walidacji pojawiają się, zanim optymistyczny stan klienta zacznie uchodzić za rozstrzygający. Błąd `400` grafu lub celu oraz błąd `409` nieaktualnego stanu zawierają stabilne kody maszynowe, bezpieczny tekst dla użytkownika, bieżącą wersję i bieżącą ścieżkę nawigacji. Nigdy nie zawierają nazw celów ukrytych ani zablokowanych.

Klient zachowuje wysłany tekst, załączniki i oczekujący cel podróży, dopóki serwer nie przyjmie tury. Przy konflikcie usuwa optymistyczną wiadomość, odświeża zapytanie o Spatial Context, przywraca wersję roboczą i proponuje akcję `Review destinations`. Po przyjęciu czyści wszystkie trzy rzeczy naraz.

### Wspólny kontrakt projekcji

Resolver zwraca ustrukturyzowane dane, zanim powstanie jakikolwiek tekst promptu:

```ts
interface ResolvedOwnerSpatialProjection {
  kind: "owner";
  chatId: string;
  ownerMode: SpatialOwnerMode;
  definitionRevision: number;
  currentLocationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  description: string;
  modelMemory: string | null;
  lorebookEntryIds: string[];
  destinations: Array<{ id: string; name: string; label?: string }>;
  omittedDestinationCount: number;
}

interface ResolvedLocationVisualProjection {
  chatId: string;
  messageId: string | null;
  swipeIndex: number | null;
  locationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  visualIdentity: string | null;
  references: Array<{
    imageId: string;
    role: LocationVisualReferenceRole;
    usageNote: string | null;
    sourceLocationId: string;
    inherited: boolean;
  }>;
}

interface StoryboardVisualReferenceCandidate {
  imageId: string;
  source: "explicit" | "location" | "character" | "persona" | "inherited_style";
  entityId?: string;
  label: string;
  role: string;
  order: number;
}

interface StoryboardKeyframeReferencePayload {
  keyframeIndex: number;
  imageIds: string[];
  omitted: Array<{
    imageId: string;
    reason: "provider_limit" | "not_visible" | "missing" | "setting_disabled";
  }>;
}

interface StoryboardVisualReferenceManifest {
  sourceMessageId: string;
  sourceSwipeIndex: number;
  locationId: string | null;
  definitionRevision: number | null;
  provider: string;
  model: string;
  providerReferenceLimit: number;
  status: "ready" | "needs_review";
  candidates: StoryboardVisualReferenceCandidate[];
  keyframes: StoryboardKeyframeReferencePayload[];
  createdAt: string;
}
```

Limity promptu są niezależne od limitów zapisu:

- Najwyżej 20 węzłów w ścieżce nawigacji.
- Najwyżej 4 000 znaków opisu dla trybu właściciela.
- Najwyżej 8 000 znaków prywatnej pamięci modelu.
- Najwyżej 50 celów podróży w deterministycznej kolejności `sortOrder`, nazwy, a potem identyfikatora, a za nimi wyłącznie liczba pominięć.
- Najwyżej 50 odwołań do lorebooków bieżącej lokalizacji, zanim procesor lorebooków zastosuje limity wpisów i tokenów.
- Najwyżej 6 zapisanych referencji wizualnych na lokalizację i najwyżej 2 kandydujące referencje lokalizacji w zwykłym żądaniu sceny, przed łącznym limitem referencji dostawcy.
- Manifest storyboardu może zachować wszystkie rozwiązane identyfikatory kandydatów na potrzeby audytu i odświeżenia, ale każdy zestaw dla klatki kluczowej ogranicza limit dostawcy zapisany przy tworzeniu manifestu.
- Najwyżej 1 000 znaków w polu `awarenessSummary` dla trybu połączonego albo w zastępczym fragmencie publicznego opisu.

Jeden formater tworzy wspólny, ustrukturyzowany blok dla trybu właściciela. Roleplay i Game używają wokół niego cienkich adapterów. Formater nigdy nie serializuje pola `lorebookEntryIds`; korzysta z niego potok promptu trybu właściciela za pośrednictwem procesora lorebooków. Drugi formater, wprowadzony dopiero w fazie 3, tworzy ograniczony pod względem prywatności blok dla trybu Conversation i nie dostaje pola z wiedzą przypisaną do lokalizacji.

Każda ścieżka na żywo wywołuje ten sam resolver i formater bezpośrednio przed przygotowaniem końcowego żądania do modelu:

- Standardowe generowanie w trybie Roleplay.
- Generowanie GM w trybie Game.
- `/api/generate/dryRun`.
- Bieżące składanie w panelu **Peek Prompt**, gdy nie ma dokładnego zapisanego żądania.
- Ścieżki ponowienia i kontynuacji, które budują prompt od nowa.

Dokładny panel **Peek Prompt** z pamięci podręcznej nie potrzebuje nowego składania. Pokazuje już zapisane żądanie do dostawcy, które musi zawierać blok przestrzenny użyty przy tym swipie. Pokrycie regresyjne musi porównać znormalizowane bloki przestrzenne z generowania na żywo, przebiegu na sucho i bieżącego panelu **Peek Prompt** dla tych samych danych testowych.

### Kontrakt szkicu ugruntowanego w lorebookach

Ugruntowanie mapy to jawne wejście tworzone przez twórcę:

```ts
interface SpatialMapGroundingRequest {
  mode: "setup_only" | "lore_strict" | "lore_expand";
  lorebookIds: string[];
  entryIds?: string[];
}
```

Konfiguracja trybu Game domyślnie wypełnia `lorebookIds` z `GameSetupConfig.activeLorebookIds`. Roleplay bierze domyślnie aktywne lorebooki czatu: globalne, powiązane i przypięte. Twórca może zmienić wybór przed generowaniem. Wyłączone albo jawnie wykluczone lorebooki i wpisy nigdy nie są wysyłane.

To nie jest skanowanie aktywacyjne lorebooków. Serwer czyta wybrane źródła bezpośrednio, rozwija obsługiwane makra względem kontekstu konfiguracji trybu właściciela bez zapisywania rozwiniętego tekstu i buduje katalog zawierający:

- Tymczasowy klucz źródłowy
- Nazwy wpisu i lorebooka
- Klucze aktywacji i tagi
- Opis wpisu, jeśli istnieje
- W przeciwnym razie ograniczony fragment treści

Katalog ogranicza najmniejsza z wartości: 100 wpisów, 16 000 znaków oraz kontekst połączenia pozostały po zarezerwowaniu miejsca na konfigurację, część systemową i żądane wyjście. Priorytet jest deterministyczny:

1. Jawnie wybrane `entryIds`.
2. Wpisy z tagami, nazwami lub kluczami przypominającymi lokalizacje.
3. Wpisy z napisanym opisem.
4. Pozostałe wpisy w stabilnej kolejności lorebooków i wpisów.

Jeśli któreś wpisy zostaną pominięte, podgląd podaje ich liczbę i proponuje akcję **Refine sources** (doprecyzowanie źródeł). Nigdy nie sugeruje, że wzięto pod uwagę cały lorebook.

Uproszczony plan modelu dokłada tymczasowe klucze źródłowe do każdej proponowanej lokalizacji. Serwer odrzuca klucze nieznane, mapuje poprawne klucze na stabilne identyfikatory wpisów, usuwa duplikaty i wylicza pochodzenie widoczne w podglądzie:

- `Lore-backed`: co najmniej jeden zweryfikowany wpis źródłowy.
- `Inferred`: relacja lub element zawierający wyprowadzony z materiału źródłowego, ale niemający własnego wpisu.
- `Added by AI`: żaden wpis źródłowy nie popiera tego węzła.

Tryb `lore_strict` odrzuca każdy węzeł bez zweryfikowanego klucza źródłowego. Tryb `lore_expand` przyjmuje węzły wywnioskowane i dodane, ale wyraźnie je oznacza. Poprawny klucz źródłowy dowodzi pochodzenia, a nie wierności znaczeniowej; podgląd musi pokazać fragmenty źródeł, żeby twórca wyłapał źle odczytaną relację lub nazwę przed zastosowaniem zmian.

Punkt końcowy generowania zwraca znormalizowaną definicję szkicu oraz tymczasową mapę pochodzenia z kluczami w postaci wygenerowanych identyfikatorów lokalizacji. Po zapisie zostaje wyłącznie `lorebookEntryIds`. Zastąpienie i rozszerzenie zachowują dotychczasowe zabezpieczenia historii; rozszerzenie może dodać powiązania do nowych węzłów, ale nie może przepisać istniejących lokalizacji ani powiązań.

### Granica zgodności z trybem Game

Gdy Spatial Context jest włączony dla czatu w trybie Game:

- Pole `SpatialContextSnapshot.currentLocationId` rozstrzyga o lokalizacji.
- Pole `location` w stanie gry jest wyłącznie projekcją zgodności.
- Odpowiedzi GET stanu gry i interfejs trackera dostają rozwiązaną ścieżkę nawigacji jako wyświetlaną lokalizację.
- Poprawki agenta stanu świata ani ręczne poprawki w trackerze trybu Game nie mogą samodzielnie zapisać pola `location`; serwer odrzuca to pole z komunikatem diagnostycznym albo zwraca konflikt na poziomie pola przy jawnej edycji ręcznej.
- Nowe migawki trybu Game przepisują ścieżkę nawigacji do swojej dawnej wartości `location`, żeby historia sesji i istniejący interfejs pozostały czytelne, ale kod promptu nadal czyta projekcję przestrzenną.
- Mapa, pole siatki albo węzeł trybu Game mogą jawnie wskazywać stabilny identyfikator lokalizacji w hierarchii.
- Wybór powiązanego celu tworzy ustrukturyzowane oczekujące przejście przestrzenne i nie wstawia prozy o ruchu.
- Ruch po niepowiązanych polach i węzłach pozostaje taktyczny i zmienia wyłącznie pozycję drużyny.
- Wejście do powiązanej lokalizacji wybiera jej mapę lokalną, jeśli taka istnieje; wyjście wybiera najbliższą powiązaną mapę nadrzędną, jeśli taka istnieje.
- Interfejs opisuje oba systemy osobno, jako `Story location` i `Map position`, gdy widać je jednocześnie.
- Wyłączenie funkcji Spatial Context natychmiast przywraca dotychczasowe zachowanie lokalizacji w trybie Game, bez usuwania definicji i migawek przestrzennych.

Kontrole negatywne muszą dowieść, że poprawka lokalizacji trybu Game wygenerowana przez model, ręczna edycja w trackerze ani kliknięcie w niepowiązaną mapę nie zmieniają pola `currentLocationId`. Kontrole pozytywne dowodzą, że poprawne kliknięcie w powiązany cel przechodzi przez zwykły walidator przejść.

### Kontrakt interfejsu trybu właściciela

Panel **Chat Settings** zyskuje jedną zwartą sekcję `Hierarchical Map`, wyłącznie dla trybów Roleplay i Game. Pokazuje stan włączenia, bieżącą ścieżkę nawigacji, liczbę lokalizacji aktywnych i zarchiwizowanych, liczbę ostrzeżeń oraz akcję `Open Map Editor`. Nie osadza pełnego edytora w panelu bocznym.

Edytor lokalizacji korzysta z istniejącej pełnoekranowej trasy edytora:

- Na komputerze widać nawigator hierarchii, widok mapy lokalnej lub warstw oraz inspektor zaznaczonej lokalizacji.
- Na telefonie najpierw widać hierarchię, potem szczegóły, z widoczną akcją powrotu do listy lokalizacji. Żadna operacja nie zależy od najechania kursorem ani przeciągania.
- Wiersze udostępniają przez opisane kontrolki akcje dodania elementu podrzędnego, dodania elementu na tym samym poziomie, zmiany rodzica, powielenia poddrzewa, archiwizacji i utworzenia łącza.
- Widok lokalny renderuje elementy podrzędne jako węzły mapy z pozycjami, uporządkowane warstwy albo dostępną listę.
- Zaznaczenie podgląda lokalizację; do wejścia w nią służy osobna akcja **Enter**.
- Inspektor zawiera nazwę, rodzaj, publiczny opis, prywatną pamięć modelu, ikonę, sposób prezentacji, rozmieszczenie lub kolejność warstw, status, element nadrzędny, łącza bezpośrednie i powiązaną wiedzę o świecie.
- Tożsamość wizualna to sekcja wbudowana w inspektor, a nie blokujące okno. Pokazuje najpierw podgląd obrazu głównego, a potem referencje uzupełniające, rolę, notatkę o zastosowaniu, stan dziedziczenia, stan uszkodzenia i metadane źródła obrazu.
- Wybór z galerii i wgrywanie korzystają z istniejących kontrolek obrazów. Akcja `Generate establishing reference` otwiera podgląd; przyjęcie obrazu i ustawienie go jako głównego to osobne, świadome decyzje.
- Wygenerowana scena udostępnia akcję `Set as location reference` wśród swoich dotychczasowych akcji obrazu. Nigdy nie zmienia lokalizacji tylko dlatego, że scena powstała właśnie tam.
- Powiązana wiedza o świecie korzysta z wbudowanej, przeszukiwalnej sekcji zamiast blokującego okna. Wyniki grupują wpisy według lorebooków i pokazują stan wyłączenia lub wykluczenia jeszcze przed przypięciem.
- Przypięte wiersze mają akcje **Open entry** i **Detach**. Odłączenie nigdy nie usuwa wiedzy o świecie, a powielenie poddrzewa kopiuje powiązania.
- Edytor lorebooków pokazuje odnośniki zwrotne z mapy bieżącego czatu, żeby twórca znalazł każdą lokalizację korzystającą z danego wpisu.
- Kontrolki szkicu AI pokazują lorebooki źródłowe, tryb ugruntowania, liczbę wpisów wziętych pod uwagę i pominiętych oraz pochodzenie, i nie wymagają technicznej wiedzy o promptach.
- Walidacja działa na miejscu, a dodatkowo jest zebrana obok przycisku **Save**. Wybór pozycji z podsumowania ustawia fokus na węźle i polu, którego dotyczy.
- Edytor pracuje na lokalnej kopii roboczej i ma jedną wersjonowaną akcję **Save**. Flaga `editorDirty` chroni przed przypadkową nawigacją. Konflikt serwera zachowuje kopię roboczą i proponuje akcje `Reload server version` lub `Review differences`; nie ma nadpisania w ciemno.
- Stan pusty uczy pierwszej akcji: `Create a starting location`. Włączenie funkcji jest niedostępne, dopóki nie istnieje poprawna, aktywna lokalizacja początkowa.
- Ładowanie korzysta z istniejącego szkieletu edytora. Stany zapisu, konfliktu, archiwizacji, ukrycia, zablokowania i niepoprawności są opisane tekstem lub ikoną, a nie tylko kolorem.

Ekrany czatu w trybie właściciela współdzielą komponent `SpatialContextRuntimeBar`:

- Zapisana ścieżka nawigacji jest widoczna nad polem wpisu albo obok niego i nie zasłania treści opowieści.
- Lista celów podróży pokazuje element nadrzędny, elementy podrzędne i łącza bezpośrednie w opisanych grupach, zachowując deterministyczną kolejność.
- Wybór celu tworzy wyraźnie opisany kafelek oczekiwania. Nie zmienia stanu od razu.
- Kafelek da się usunąć i przetrwa przełączenie czatu albo przeładowanie razem z roboczym tekstem.
- Wysyłka może zawierać tekst, załączniki albo sam oczekujący cel podróży. Przejście jest danymi żądania i nie dokleja się do widocznej treści wiadomości.
- Nieaktualny oczekujący cel pozostaje widoczny po konflikcie, oznaczony jako `Needs review`, dopóki nie wybierzesz poprawnego zamiennika albo go nie usuniesz.
- Na wąskich ekranach ścieżka nawigacji skraca się w środku, zachowuje nazwę bieżącej lokalizacji i udostępnia pełną ścieżkę w dostępnej sekcji rozwijanej.

Edytor i kontrolki działające w czasie gry korzystają z istniejących semantycznych tokenów motywu, obsługują motyw ciemny, jasny i SillyTavern, utrzymują cele dotykowe 44 px dla najważniejszych akcji mobilnych oraz mają widoczne stany fokusu. Ruch ogranicza się do przejść stanu trwających od 150 do 250 ms i nigdy nie przesuwa układu wyłącznie dla ozdoby.

### Przenośność i pokrycie cyklu życia

Natywny eksport czatu z aplikacji Marinara Engine musi przenosić:

- Bieżącą definicję w `marinara_metadata`.
- Migawki przestrzenne opisane numerem porządkowym wyeksportowanej wiadomości i indeksem swipe'a, a nie wyświetlanymi nazwami.
- Migawkę startową, jeśli istnieje.

Import tworzy nowe identyfikatory czatu, wiadomości i migawek, zachowując identyfikatory lokalizacji wewnątrz definicji. Uszkodzone zaimportowane grafy wyłączają Spatial Context, zachowują surową definicję do naprawy i zwracają ostrzeżenia. Nigdy nie są po cichu dopasowywane po nazwach ani częściowo aktywowane.

Eksport czatu do formatu JSONL zachowuje identyfikatory powiązań lokalizacji z wpisami, bo są częścią definicji, ale nie dołącza po cichu treści lorebooków. Import rozwiązuje odwołania względem profilu docelowego i zgłasza brakujące wpisy jako ostrzeżenia możliwe do naprawy, bez dopasowywania po nazwach. Kopia zapasowa profilu i przywracanie zachowują działające odwołania, bo niosą zarówno definicje przestrzenne, jak i tabele lorebooków. Przyszły jawny pakiet kampanii może dołączać powiązane lorebooki na potrzeby przenoszenia między profilami.

Eksport do formatu JSONL zachowuje też identyfikatory powiązań lokalizacji z obrazami, role, notatki o zastosowaniu i kolejność, ale nie osadza bajtów obrazów. Import rozwiązuje te identyfikatory względem profilu docelowego i zgłasza brakujące obrazy jako ostrzeżenia możliwe do naprawy, bez dopasowywania po ścieżkach ani nazwach plików. Kopia zapasowa profilu i przywracanie obejmują rekordy i pliki galerii profilu. Przyszły jawny pakiet kampanii może oferować opcję `Include location images`, z liczbą zasobów, łącznym rozmiarem i przypomnieniem o licencjach przed eksportem.

Gdy istniejący cykl życia storyboardu obejmuje eksport lub kopiowanie, jego manifest wizualny zachowuje numer porządkowy wiadomości źródłowej i swipe, identyfikator rozwiązanej lokalizacji, identyfikatory kandydujących obrazów oraz kolejność klatek kluczowych, bez osadzania bajtów. Import przypisuje nowe identyfikatory wiadomości i storyboardów, rozwiązuje identyfikatory obrazów galerii w profilu docelowym i oznacza brakujące zasoby jako `needs_review`. Dawne storyboardy bez manifestu rozwiązują go z zapisanej wiadomości źródłowej i swipe'a przy pierwszym ponownym generowaniu; nigdy nie sięgają po dopasowanie nazw ani najnowszą lokalizację czatu.

Kopia zapasowa profilu i przywracanie obejmują nową tabelę przez `FILE_BACKED_TABLES`. Usunięcie czatu, usunięcie zbiorcze, trwałe wyczyszczenie, usunięcie gałęzi, usunięcie swipe'a i usunięcie wiadomości idą istniejącymi ścieżkami kaskad i porządkowania danych. Istniejące czaty nie wymagają natychmiastowej migracji, bo brak metadanych oznacza wyłączony Spatial Context.

### Pakiety prac i kolejność scalania

#### Pakiet A: kontrakt rdzenia i prototyp dowodowy

- Dodanie wspólnych typów, schematów, czystych funkcji pomocniczych grafu, limitów, danych testowych i stabilnych kodów błędów.
- Dodanie tymczasowego środowiska dowodowego dla transakcji o stałym rozmiarze na magazynie plikowym. Bez pozostawiania plików `.test.ts`.
- Udowodnienie działania resolvera stanu na danych testowych: start, widoczny swipe, wcześniejszy punkt rozgałęzienia, zarchiwizowana lokalizacja historyczna i nieaktualna definicja.
- Pomiar rozmiaru projekcji dla grafów płytkich, o głębokości 20, o szerokości 500, z długimi tekstami i z łączami.

Bramka: semantyka grafu, granice projekcji, kotwice migawek i wykonalność transakcji są pokazane przed rozpoczęciem prac nad interfejsem.

#### Pakiet B: API definicji i magazyn danych

- Dodanie schematu, migracji, rejestracji w magazynie plikowym, adaptera magazynu, trasy GET i wersjonowanej trasy PUT.
- Dodanie zastępowania bieżącej lokalizacji na potrzeby archiwizacji.
- Podpięcie usuwania, przesuwania swipe'ów oraz kopii zapasowej i przywracania profilu.
- Dodanie serwerowego pokrycia regresyjnego dla konfliktów wersji, niepoprawnych grafów, ukrytych błędów i ponownego użycia poleceń.

Bramka: definicje i migawki przechodzą pełny obieg na obu backendach magazynu, a niepoprawne zapisy nie zostawiają stanu połowicznego.

#### Pakiet C: integracja historii tur właściciela

- Rozszerzenie żądania generowania o `pendingSpatialTransition`.
- Dodanie atomowego zapisu tury właściciela i utrwalania stanu na swipie asystenta.
- Wpięcie ponownego generowania, kontynuacji, aktywnych swipe'ów, gałęzi i punktów kontrolnych trybu Game.
- Dodanie natywnego eksportu i importu definicji oraz migawek w czacie.

Bramka: przeładowanie, awaria dostawcy, zmiana swipe'a, rozgałęzienie z wcześniejszej wiadomości, import i eksport oraz przywrócenie punktu kontrolnego dają oczekiwaną lokalizację.

#### Pakiet D: projekcja promptu i rozstrzygalność trybu Game

- Dodanie ustrukturyzowanej projekcji i ograniczonych formaterów.
- Wpięcie generowania na żywo, GM trybu Game, przebiegu na sucho, bieżącego panelu **Peek Prompt**, ponowień i kontynuacji.
- Wymuszenie granicy zgodności trybu Game i pokazywania ścieżki nawigacji w trackerze.
- Dodanie kontroli negatywnych dla prywatności i lokalizacji nieaktywnych.

Bramka: wszystkie ścieżki promptu zawierają ten sam blok przestrzenny, żaden niepowiązany tekst lokalizacji nie wycieka, a Game nie może utrzymywać konkurencyjnej rozstrzygającej lokalizacji.

#### Pakiet E: przeglądarka i edytor map

- Dodanie hooków React Query, mapowania konfliktów, podsumowania w ustawieniach i ładowanej na żądanie trasy edytora.
- Dodanie hierarchii, mapy lokalnej, warstw, listy, podglądu, inspektora i powielania poddrzewa.
- Dodanie dostępnych stanów dla komputera i telefonu.
- Zachowanie niezapisanych zmian mimo konfliktów wersji.

Bramka: twórcy potrafią budować i naprawiać zagnieżdżone mapy bez przeciągania, najeżdżania kursorem i precyzyjnych ruchów.

#### Pakiet E.1: szkic mapy z pomocą AI

- Dodanie generatora uruchamianego na żądanie na etapie konfiguracji, który korzysta z ograniczonego kontekstu konfiguracji trybu Game lub Roleplay i nigdy nie zmienia niczego samoczynnie w trakcie tury.
- Wygenerowanie uproszczonego planu mapy z kluczami, a potem przypisanie stabilnych identyfikatorów, bezpieczne uzupełnienie braków układu i weryfikacja pełnej definicji po stronie serwera.
- Podgląd wygenerowanej hierarchii jako lokalnego szkicu, zanim zastąpi ona stan edytora.
- Wymóg jawnych akcji **Apply** i **Save**; samo generowanie nigdy nie włącza funkcji Spatial Context ani nie zapisuje definicji.
- Trzymanie zwykłej historii rozmowy poza promptem generowania i udostępnienie końcowych promptów w logach diagnostycznych.

Bramka: nietechniczny twórca może opisać świat, dostać poprawną zagnieżdżoną mapę, obejrzeć ją i odrzucić albo zastosować, a stan zapisany nie zmieni się aż do użycia akcji **Save**.

#### Pakiet E.1.1: bezpieczne dla historii rozszerzanie mapy przez AI

- Potraktowanie tworzenia całej mapy przez AI jako czynności sprzed kampanii. Gdy istnieje już historia przestrzenna powiązana z wiadomościami, serwer zachowuje każdy istniejący identyfikator lokalizacji.
- Zastąpienie generatora w trwającej kampanii przebiegiem rozszerzania wyłącznie dodającego, ograniczonym do wybranej aktywnej lokalizacji.
- Zachowanie bieżącej lokalizacji, lokalizacji początkowej, istniejących opisów, łączy, układu, węzłów zarchiwizowanych i przyszłych powiązań trybu Game. Nowe stabilne identyfikatory dostają tylko dodane lokalizacje.
- Oparcie rozszerzania na ograniczonym kontekście konfiguracji i wybranej lokalizacji, a nie na zwykłej historii tur.
- Podgląd nowych lokalizacji jako lokalnego szkicu i zachowanie dotychczasowej granicy akcji **Apply** i **Save**.
- Dopuszczenie zastąpienia całej mapy tylko przed powstaniem zapisanej historii przestrzennej, przy czym bezpieczniejszym domyślnym wyborem przy istniejącej mapie jest rozszerzanie.

Bramka: AI potrafi rozbudować mapę trwającej kampanii bez osierocenia migawek tur, zmiany bieżącej lokalizacji i zastąpienia istniejących identyfikatorów.

#### Pakiet E.2: opcja mapy w kreatorze konfiguracji trybu Game

- Dodanie opcjonalnego wyboru `Draft a hierarchical world map` do istniejącego kroku **Features**, z prostym wyborem rozmiaru.
- Uruchamianie generowania mapy dopiero po tym, jak `/game/setup` zapisze przegląd świata i łuk fabularny. Tura rozgrywki nie jest potrzebna.
- Utrzymanie widocznego stanu zajętości konfiguracji podczas generowania szkicu, także po zastosowaniu naprawionych danych konfiguracji.
- Otwarcie zwykłego podglądu AI i edytora mapy po wygenerowaniu. Pominięcie wraca do gry, akcja **Apply** zmienia tylko kopię roboczą, a granicą zapisu pozostaje **Save**.
- Zachowanie poprawnie utworzonej gry przy niepowodzeniu generowania mapy, wyjaśnienie błędu i umożliwienie zbudowania mapy później z panelu **Chat Settings**.
- Zakaz osadzania pełnego edytora mapy w wąskim kreatorze konfiguracji oraz cichego włączania i zapisywania wygenerowanej definicji.

Bramka: twórca może poprosić o bogatszą mapę początkową w trakcie konfiguracji, bez generowania z niepełnego stanu kreatora i bez omijania przeglądu.

#### Pakiet F: interfejs czasu gry dla trybów Roleplay i Game

- Dodanie wspólnego paska działającego w czasie gry i zapisywania przejść oczekujących dla każdego czatu.
- Wpięcie ścieżek wysyłki trybów Roleplay i Game bez zmieniania widocznej treści wiadomości.
- Dodanie jawnych kontrolek powiązań mapy, pola i węzła trybu Game.
- Wybieranie powiązanych map po przyjętych przejściach, z zachowaniem niepowiązanego ruchu taktycznego.

Bramka: Roleplay i Game potrafią się przemieszczać, wyjść z nieaktualnego stanu, przeładować się, przełączać czaty i działać z klawiaturą oraz dotykiem.

#### Pakiet F.1: powiązania lokalizacji z lorebookami i aktywacja w czasie gry

- Rozszerzenie wspólnego schematu i kopii roboczej edytora o ograniczone pole `lorebookEntryIds`.
- Dodanie wbudowanych kontrolek przypinania na mapie, odnośników zwrotnych w lorebookach i ostrzeżeń o uszkodzonych odwołaniach.
- Rozszerzenie wspólnego przetwarzania lorebooków o wymuszone identyfikatory kandydatów, usuwanie duplikatów źródeł aktywacji, wykluczenia i zarezerwowany limit dla wiedzy przypiętej do lokalizacji.
- Wpięcie tego samego resolvera w ścieżki trybu Roleplay, GM trybu Game, przebiegu na sucho i bieżącego panelu **Peek Prompt**.
- Dodanie raportowania źródeł i skracania w panelu **Active Context**.
- Zachowanie identyfikatorów odwołań w gałęziach oraz w eksporcie i imporcie JSONL, a także ostrzeganie o brakującej wiedzy w profilu docelowym.

Bramka: przejście między lokalizacjami aktywuje wyłącznie włączoną wiedzę przypiętą do celu podróży, we wszystkich ścieżkach promptu trybu właściciela, bez podwójnego wstawiania i bez wycieku do trybu Conversation.

#### Pakiet F.2: szkic mapy ugruntowany w lorebookach

- Dodanie trybu ugruntowania i jawnego wyboru źródeł do żądań tworzenia, zastąpienia i rozszerzenia.
- Zbudowanie ograniczonego katalogu źródeł z wybranych lorebooków, a nie ze zwykłego skanowania czatu.
- Weryfikacja tymczasowych kluczy źródłowych i automatyczne wiązanie poprawnych wpisów z wygenerowanymi węzłami.
- Pokazanie w podglądzie szkicu pochodzenia `Lore-backed`, `Inferred` i `Added by AI` wraz z wglądem w źródła.
- Wymuszenie węzłów popartych źródłem w trybie `Strict canon` i widocznych niepopartych dodatków w trybie `Canon with expansion`.
- Zachowanie bezpiecznego dla historii rozszerzania wyłącznie dodającego oraz istniejącej granicy przeglądu: najpierw **Apply**, potem **Save**.

Bramka: wybrane fakty z lorebooków ugruntowują wygenerowaną hierarchię bezpośrednio, każda niepoparta lokalizacja jest widoczna przed zapisem, a tryb ścisły nie może zapisać węzła bez odwołania.

#### Pakiet F.3: tożsamość wizualna lokalizacji i referencje do grafiki scen

- Dodanie ograniczonego tekstu tożsamości wizualnej i stabilnych powiązań z galerią profilu do schematu lokalizacji i kopii roboczej edytora.
- Dodanie wbudowanego edytora tożsamości wizualnej, ról obrazu głównego i uzupełniających, jawnego dziedziczenia stylu, odnośników zwrotnych do galerii i naprawy uszkodzonych odwołań.
- Dodanie równoległych kontrolek użycia u dostawcy dla narzędzia **Illustrator** i trybu Game w obrębie czatu, ze zgodą przy pierwszym obrazie głównym i domyślnym wyłączeniem dla zgodności wstecznej.
- Dodanie generowania referencji otwierającej na żądanie i jawnego awansowania przejrzanych, wygenerowanych scen.
- Rozwiązywanie lokalizacji właściwej dla danej wiadomości i swipe'a w żądaniach grafiki scen narzędzia **Illustrator** w trybie Roleplay i w trybie Game.
- Deterministyczne łączenie kandydatów wskazanych wprost, lokalizacji, postaci, persony i dziedziczonego stylu w granicach limitu każdego dostawcy, z widocznymi powodami pominięć.
- Zachowanie identyfikatorów i metadanych w gałęziach oraz w formacie JSONL, objęcie plików binarnych kopią zapasową profilu i przywracaniem, a także dodanie kontroli negatywnych dla promptów fabularnych i trybu Conversation.

Bramka: powtarzana grafika w jednej lokalizacji może korzystać z przejrzanej tożsamości miejsca, z deterministycznymi i widocznymi kompromisami wobec referencji postaci, historyczna grafika wiadomości rozwiązuje swoją historyczną lokalizację, a dane wyłącznie wizualne nie wyciekają do promptów tekstowych.

#### Pakiet F.3.1: manifesty referencji wizualnych w storyboardzie

- Utrzymanie pakietu F.3.1 jako odbiorcy pakietu F.3 i osobnej zmiany do przeglądu; nie rozszerza on bramki trwałego zapisu z pakietu F.3.
- Dodanie do metadanych storyboardu zamrożonego banku referencji i uporządkowanego manifestu zestawów dla każdej klatki kluczowej.
- Zakotwiczenie rozwiązywania lokalizacji w wiadomości źródłowej i swipie storyboardu, a potem ponowne użycie tego samego kandydata miejsca w jego klatkach.
- Wybieranie referencji postaci i persony z listy widocznych postaci każdej klatki kluczowej i nieprzeznaczanie pojemności na obsadę poza kadrem.
- Deterministyczne stosowanie priorytetów: wskazanych wprost, jednego miejsca, wielu miejsc, referencji uzupełniających i dziedziczonego stylu, przez istniejący resolver możliwości dostawcy.
- Dodanie do podglądu i ponownego generowania rozwijanych sekcji `Visual sources`, powodów pominięć, konfliktów wymagających przeglądu oraz jawnej akcji `Refresh references`.
- Zachowanie dotychczasowego działania storyboardu, gdy Spatial Context jest wyłączony albo gdy nie ma uprawnionej referencji lokalizacji.

Bramka: ponowne wygenerowanie klatki kluczowej korzysta z jej zamrożonego zestawu, wybory lokalizacji i postaci są historycznie poprawne oraz możliwe do sprawdzenia, a zmiana pojemności dostawcy nie zmienia po cichu istniejącego storyboardu.

#### Pakiet G: połączony tryb Conversation

- Wdrożenie dopiero po ustabilizowaniu pakietów od A do F.3.1.
- Rozwiązanie powiązanego właściciela w chwili generowania i użycie ograniczonego formatera projekcji.
- Dodanie ostrożnych sformułowań o obecności i interfejsu tylko do odczytu.
- Udowodnienie zachowania przy odłączeniu, ponownym połączeniu, usuniętym właścicielu, uszkodzonych powiązaniach wzajemnych, cyklach i zakończonych historiach.

Bramka: Conversation nigdy nie dostaje prywatnej pamięci modelu, wewnętrznych identyfikatorów, ukrytych celów podróży, identyfikatorów ani treści wiedzy przypiętej do lokalizacji, identyfikatorów ani treści referencji wizualnych lokalizacji, ani możliwości zmiany stanu.

Przemieszczanie na żądanie modelu, szablony twórcy, przenośne pakiety kampanii, wnioskowanie o mapie z obrazu, masowe generowanie grafiki lokalizacji, automatyczny wybór referencji postaci z wielu ujęć oraz pozycje poszczególnych postaci zostają osobnymi, późniejszymi pakietami, po wydaniu prac nad ugruntowaniem w trybie właściciela, tożsamością wizualną i manifestami storyboardu.

### Granice zgłoszeń i pull requestów

To duża funkcja objęta procesem pracy w repozytorium. Zanim ruszy wdrożenie pakietu A:

1. Potwierdź istnienie pojedynczego zgłoszenia śledzącego albo je otwórz i zaznacz w nim, kto się nim zajmuje.
2. Sprawdź, czy istnieje już gałąź powiązana ze zgłoszeniem, roboczy pull request albo pozycja na tablicy projektu.
3. Otwórz roboczy pull request wobec gałęzi `staging`, gdy tylko ruszy wdrożenie.
4. Traktuj pakiety prac jako granice pull requestów do przeglądu tam, gdzie to praktyczne; nie łącz MVP trybu właściciela z połączonym trybem Conversation tylko po to, żeby zmniejszyć liczbę pull requestów.

Proponowany podział zgłoszeń:

1. Wspólny rdzeń, trwały zapis i API definicji funkcji Spatial Context.
2. Migawki tur właściciela, swipe'y, gałęzie, punkty kontrolne i przenośność.
3. Projekcja promptu trybu właściciela i zgodność z trybem Game.
4. Edytor trybu właściciela i interfejs przemieszczania.
5. Powiązania lokalizacji z lorebookami i aktywacja w czasie gry w trybie właściciela.
6. Szkic mapy ugruntowany w lorebookach.
7. Tożsamość wizualna lokalizacji i rozwiązywanie referencji do grafiki scen.
8. Zamrożone manifesty referencji wizualnych w storyboardzie.
9. Projekcja tylko do odczytu dla połączonego trybu Conversation.
10. Przemieszczanie na żądanie modelu.

### Macierz dowodów

| Twierdzenie | Dowód automatyczny | Dowód ręczny |
| --- | --- | --- |
| Aktywacja wiedzy o lokalizacji jest dokładna i ograniczona | Dane testowe obejmują przyjęty ruch, ruch oczekujący i odrzucony, wpisy wyłączone i wykluczone, powielone źródła aktywacji, skracanie tokenów, przeładowanie, swipe'y i gałęzie | Przejdź między dwiema różnie powiązanymi lokalizacjami w trybach Roleplay i Game, a potem sprawdź panel **Active Context** i **Peek Prompt** |
| Ugruntowanie w lorebookach da się sprawdzić | Dane testowe trybu ścisłego odrzucają węzły bez odwołań; dane rozszerzania zachowują zweryfikowane klucze źródłowe i oznaczają niepoparte węzły; limity katalogu i liczby pominięć są deterministyczne | Utwórz szkic z dużego, istniejącego lorebooka, otwórz fragmenty źródeł, porównaj tryby `Strict canon` i `Canon with expansion` oraz odrzuć wymyśloną lokalizację |
| Grafika lokalizacji pozostaje spójna i ograniczona | Dane testowe obejmują wybór dokładnej lokalizacji, rozwiązywanie historycznego swipe'a, jawne dziedziczenie stylu, brakujące obrazy, limity dostawcy, rodzaje żądań i deterministyczne powody pominięć | Ustaw referencję główną, wygeneruj kilka scen w trybach Game i Roleplay w tym samym miejscu, przenieś się gdzie indziej, ponów grafikę dla starszego swipe'a i sprawdź podgląd źródeł wizualnych |
| Referencje w storyboardzie są odtwarzalne | Dane testowe obejmują zakotwiczenie w swipie źródłowym, zamrożone banki, wybór widocznych postaci, dostawców z jednym i z wieloma miejscami, brakujące zasoby, mniejszą i większą pojemność zamiennika, dawne manifesty i jawne odświeżenie | Wygeneruj wieloklatkowy storyboard, zmień lokalizacje, zmień obraz główny postaci i lokalizacji, wygeneruj ponownie przed akcją `Refresh references` i po niej oraz sprawdź sekcję `Visual sources` każdej klatki |
| Walidacja grafu jest deterministyczna | Dedykowany skrypt regresyjny dla funkcji przestrzennych z danymi pozytywnymi i negatywnymi | Sprawdź komunikaty błędów w edytorze dla reprezentatywnych niepoprawnych węzłów |
| Ruch i wiadomość użytkownika są atomowe | Wstrzyknięta awaria magazynu przed każdym zapisem transakcji i po nim, na obu backendach | Wymuś nieaktualną wersję, gdy czekają wersja robocza i cel podróży |
| Historia przywraca właściwą lokalizację | Regresja migawek obejmująca przeładowanie, swipe'y, ponowne generowanie, odcięcie gałęzi i punkt kontrolny | Przejdź każdy z tych przebiegów w trybach Roleplay i Game |
| Ścieżki promptu się zgadzają | Porównanie znormalizowanych bloków z funkcji pomocniczej generowania, przebiegu na sucho i bieżącego panelu **Peek Prompt** | Sprawdź panel **Peek Prompt** i wyjście diagnostyczne dla jednego czatu w każdym trybie właściciela |
| Kontekst pozostaje ograniczony | Dane testowe o dużej szerokości i z długimi tekstami sprawdzają limity znaków i celów podróży | Obejrzyj głęboką i szeroką hierarchię w edytorze oraz na liście celów podróży |
| Prywatność jest zachowana | Asercje negatywne dla prywatnej pamięci, ukrytych łączy, węzłów nieaktywnych, niepowiązanych opisów, identyfikatorów i treści wiedzy przypiętej do lokalizacji oraz wszystkich pól i bajtów referencji wizualnych lokalizacji | Powiąż czat w trybie Conversation i sprawdź podglądy jego żądań tekstowych i obrazowych w fazie 3 |
| Tryb Game ma jedno źródło lokalizacji | Odrzucenie dawnych poprawek; walidacja powiązanych przejść; zachowanie ruchu niepowiązanego | Spróbuj edycji w trackerze, ruchu po mapie powiązanej i niepowiązanej, wczytania punktu kontrolnego oraz włączenia i wyłączenia funkcji |
| Interfejs jest odporny | Przebieg Playwright dla tworzenia, edycji, ruchu oczekującego, konfliktu i nawigacji mobilnej | Sprawdź motyw ciemny, jasny i SillyTavern, klawiaturę, dotyk, długie nazwy i stany puste |
| Przenośność zachowuje identyfikatory i stan | Pełne obiegi natywnego eksportu i importu oraz kopii zapasowej i przywracania profilu obejmują powiązania przestrzenne, wiedzy, obrazów i manifestów storyboardu; brakująca wiedza lub obrazy w profilu docelowym dają ostrzeżenia | Wyeksportuj rozgałęziony czat ze storyboardem, zaimportuj go z jego lorebookami i zasobami galerii oraz bez nich, a potem sprawdź ścieżkę nawigacji, historię, powiązania, zamrożone źródła klatek i ostrzeżenia |

Dodaj `scripts/regressions/spatial-context.regression.ts` oraz skrypt `regression:spatial` w pliku pakietu, a potem dołącz go do `pnpm regression`. Nie dodawaj trwałych plików `.test.ts`. Każdy pull request z wdrożeniem nadal uruchamia wąską regresję przestrzenną oraz te sprawdzenia repozytorium, które pasują do jego zakresu.

## Kryteria akceptacji

- Lokalizacja na mapie zapisuje odwołania do wpisów lorebooka, nigdy skopiowanej treści.
- Lokalizacja zapisuje opcjonalne metadane tożsamości wizualnej i stabilne odwołania do obrazów z galerii, nigdy surowych ścieżek, zewnętrznych adresów URL ani bajtów obrazu.
- Profile stylu obrazów sterują stylem renderowania, referencje lokalizacji sterują tożsamością miejsca, a referencje postaci lub persony sterują tożsamością przedstawianych osób.
- Uprawnione żądania grafiki scen rozwiązują dokładną lokalizację swojej wiadomości i swipe'a, łącznie z ponowieniami historycznymi, i nigdy nie dopasowują lokalizacji po zbliżonej nazwie.
- Wygenerowana grafika staje się referencją lokalizacji dopiero po świadomej decyzji twórcy.
- Referencje układu nigdy nie trafiają automatycznie do zwykłego generowania scen, a dziedziczyć mogą wyłącznie referencje stylu.
- Prompty tekstowe i połączony tryb Conversation nie dostają identyfikatorów, bajtów, ścieżek ani notatek dotyczących wyłącznie referencji wizualnych lokalizacji.
- Storyboard rozwiązuje lokalizację ze swojej wiadomości źródłowej i swipe'a, zamraża bank referencji i uporządkowane zestawy klatek kluczowych oraz używa ich ponownie przy generowaniu, dopóki nie nastąpi jawne odświeżenie.
- Każda klatka kluczowa storyboardu wybiera referencje wyłącznie dla swojej rozwiązanej lokalizacji i widocznych osób; obsada poza kadrem nigdy nie zajmuje pojemności.
- Zachowanie dostawców z jednym i z wieloma miejscami jest deterministyczne i widoczne, a zmiana dostawcy nigdy nie dokłada, nie usuwa ani nie podmienia po cichu zamrożonych referencji.
- Manifesty storyboardu przechowują stabilne identyfikatory i metadane, nigdy bajty obrazów ani ścieżki w systemie plików.
- Dawne storyboardy bez manifestów nigdy nie ratują się dopasowaniem nazwy lokalizacji ani najnowszą lokalizacją czatu.
- Wyłącznie przyjęta, dokładna bieżąca lokalizacja wymusza aktywację przypiętej wiedzy, z zachowaniem reguł wyłączenia, wykluczenia, usuwania duplikatów, kolejności, limitu wpisów i limitu tokenów.
- Panel **Active Context** wskazuje aktywację z bieżącej lokalizacji, połączone źródła aktywacji i deterministyczne skracanie.
- Ugruntowany szkic czyta jawnie wybrane wpisy bezpośrednio, zamiast polegać na skanowaniu słów kluczowych albo na wygenerowanych podsumowaniach przeglądu świata.
- Tryb `Strict canon` tworzy wyłącznie lokalizacje poparte źródłem; tryb `Canon with expansion` oznacza każdy wywnioskowany lub niepoparty dodatek przed zapisem.
- Połączony tryb Conversation nie dostaje identyfikatorów ani treści wiedzy przypiętej do lokalizacji.
- Zmiana nazwy i zmiana rodzica zachowują tożsamość lokalizacji.
- Niepoprawne grafy i nieaktualne zapisy nigdy nie zmieniają stanu.
- Ruch zatwierdza się razem z turą użytkownika albo wcale.
- Przeładowanie, wybór swipe'a, rozgałęzienie z wcześniejszej wiadomości i przywrócenie punktu kontrolnego trybu Game dają właściwą lokalizację.
- Prompty trybu właściciela zawierają wyłącznie kontekst aktywnej lokalizacji i poprawne cele podróży.
- Po włączeniu funkcji Game nie wyświetla konkurencyjnej tekstowej lokalizacji ani nie promptuje z niej.
- Istniejące mapy trybu Game da się jawnie powiązać z lokalizacjami hierarchii bez psucia ruchu taktycznego.
- Roleplay i Game korzystają z tej samej hierarchii i tych samych zasad przejść.
- Przebieg na sucho i panel **Peek Prompt** działają na projekcji tak samo jak generowanie.
- Istniejące czaty oraz wyłączony Spatial Context zachowują dotychczasowe działanie.
- Conversation nie może być właścicielem stanu przestrzennego ani go zmieniać.
- Prywatna pamięć modelu nigdy nie trafia do projekcji dla trybu Conversation.

## Walidacja

Deterministyczne pokrycie musi obejmować limity grafu, cykle, kierunki nawigacji, łącza ukryte i zablokowane, nieaktualne wersje, idempotencję, punkty rozgałęzienia, swipe'y, punkty kontrolne, limity odwołań do lorebooków, wymuszoną aktywację, wykluczenia, usuwanie duplikatów, skracanie tokenów, limity katalogu ugruntowania, weryfikację kluczy źródłowych, odrzucenia w trybie ścisłym, pochodzenie, limity referencji wizualnych, zasady obrazu głównego i dziedziczenia, historyczne rozwiązywanie grafiki, przycinanie po stronie dostawcy, ostrzeżenia o brakujących obrazach, wykluczenia rodzajów żądań, kotwiczenie źródła storyboardu, ponowne generowanie z zamrożonego manifestu, filtrowanie widocznych postaci, wybór przy jednym i przy wielu miejscach, zmiany pojemności dostawcy, jawne odświeżenie, awaryjną obsługę dawnych manifestów, granice prywatności oraz kontrole negatywne dla lokalizacji nieaktywnych.

Sprawdzenia repozytorium:

```bash
pnpm check
pnpm regression:prompt
pnpm smoke:ui
```

Weryfikacja ręczna obejmuje tworzenie treści na komputerze i telefonie, głębokie ścieżki nawigacji, warstwy, mapy z pozycjami, długie nazwy, wyjście z konfliktu, zabezpieczenia archiwizacji, tryb Roleplay, tryb Game, ruch po mapie powiązanej i niepowiązanej, przeładowanie, rozgałęzianie, przywrócenie punktu kontrolnego, przypinanie powiązanej wiedzy i odnośniki zwrotne, wiedzę wyłączoną i uszkodzoną, ostrzeżenia o pominięciach przy dużych źródłach, podglądy trybów `Strict canon` i `Canon with expansion`, wgrywanie obrazów i wybór z galerii, referencje główne i uzupełniające, jawne awansowanie sceny, dziedziczony styl, uszkodzone obrazy, raportowanie pominięć dostawcy, grafikę dla historycznego swipe'a, sekcję `Visual sources` w storyboardzie, dostawców z jednym i z wieloma miejscami, ponowne generowanie z zamrożonego zestawu, przegląd po zmianie dostawcy, jawne odświeżenie, dawne storyboardy, panel **Active Context** oraz panel **Peek Prompt**. Pola wyboru walidacji w pull requeście pozostają niezaznaczone do weryfikacji przez człowieka.

## Odłożone na później

- Natychmiastowy ruch bez tury czatu
- Niezależne pozycje poszczególnych postaci
- Ogólne flagi, zdarzenia i skrypty
- Szablony lokalizacji i pakiety scenariuszy
- Wiedza przestrzenna przypisana do poszczególnych postaci
- Wiedza o lokalizacjach możliwa do udostępnienia w trybie Conversation
- Automatyczne wnioskowanie o mapie na podstawie obrazu
- Automatyczne awansowanie wygenerowanych scen do kanonu lokalizacji
- Masowe generowanie grafiki referencyjnej dla każdej lokalizacji
- Automatyczny, świadomy ujęcia wybór spośród wielu strojów, ujęć, wyrazów twarzy i referencji detali postaci
- Generowanie referencji złożonych lub arkuszy stykowych zależne od dostawcy
