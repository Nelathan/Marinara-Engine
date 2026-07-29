# Prompty warunkowe ({{#if}})

Z tego przewodnika dowiesz się, jak używać bloków `{{#if}}` w aplikacji Marinara Engine. Blok warunkowy dołącza fragment promptu (tekstu, który Marinara wysyła do AI) tylko wtedy, gdy jakaś wartość pasuje do ustalonej reguły. Warunki są częścią systemu makr, więc działają wszędzie tam, gdzie działają makra: w kartach postaci, personach, wpisach lorebooków i presetach promptów.

## Do czego służą prompty warunkowe

Makro to zapis w `{{podwójnych klamrach}}`, który Marinara Engine zamienia na aktualną wartość podczas budowania promptu. Blok warunkowy idzie o krok dalej. Sprawdza wartość, zostawia jeden fragment tekstu, a resztę wyrzuca.

Zapisujesz warunek, tekst na wypadek jego spełnienia i opcjonalnie tekst na wypadek niespełnienia. Marinara odczytuje warunek przy każdym budowaniu promptu. Dzięki temu ta sama karta postaci czy ten sam preset zachowuje się inaczej przy różnych postaciach, personach i czatach.

Częste zastosowanie to instrukcje przypisane do konkretnej postaci wewnątrz jednego wspólnego presetu. Drugie częste zastosowanie to dołączanie pola tylko wtedy, gdy coś w nim jest – tak, żeby do modelu nie trafiła pusta etykieta.

## Podstawowa składnia

Blok warunkowy zaczyna się od `{{#if warunek}}`, a kończy na `{{/if}}`. Wszystko pomiędzy to tekst używany przy spełnionym warunku.

```
{{#if condition}}
Text used when the condition is true.
{{/if}}
```

Dla przypadku niespełnionego warunku dodaj gałąź `{{else}}`:

```
{{#if condition}}
Text used when true.
{{else}}
Text used when false.
{{/if}}
```

Kolejne warunki dopisuje się przez `{{else if}}`. Marinara sprawdza gałęzie po kolei, od góry do dołu. Zostawia pierwszą gałąź ze spełnionym warunkiem, rozwija makra w jej wnętrzu i odrzuca wszystkie pozostałe gałęzie. Jeśli żaden warunek nie jest spełniony i nie ma gałęzi `{{else}}`, cały blok znika bez śladu.

```
{{#if length == "short"}}
Keep your reply to one or two sentences.
{{else if length == "long"}}
Write a detailed, multi-paragraph reply.
{{else}}
Write a reply of normal length.
{{/if}}
```

Blok możesz rozpisać na kilka linii, jak wyżej, albo zmieścić w jednej. Jeden warunek da się też zagnieździć w gałęzi innego, większego warunku.

## Obsługiwane operatory

Warunek to zwykle wartość po lewej, operator i wartość po prawej, na przykład `char == "Alice"`. Poniższa tabela wymienia wszystkie dostępne operatory. Każdy zapisano stylem kodu.

| Operator | Znaczenie |
| --- | --- |
| `==`, `=`, `is` | Równe. |
| `!=`, `is not` | Różne. |
| `>` | Większe niż (tylko liczby). |
| `<` | Mniejsze niż (tylko liczby). |
| `>=` | Większe lub równe (tylko liczby). |
| `<=` | Mniejsze lub równe (tylko liczby). |
| `contains`, `includes` | Wartość po lewej zawiera wartość po prawej jako tekst. |
| `not contains`, `not includes` | Wartość po lewej nie zawiera wartości po prawej. |

Porównywaniem rządzi kilka reguł:

1. Przy `==`, `=`, `is`, `!=` i `is not` Marinara porównuje obie strony jak liczby, o ile obie wyglądają na liczby. Dlatego `5` równa się `5.0`. W przeciwnym razie porównuje je jak tekst, bez rozróżniania wielkich i małych liter. Dlatego `Mari` równa się `mari`.
2. Przy `>`, `<`, `>=` i `<=` obie strony muszą być liczbami. Jeśli którakolwiek liczbą nie jest, warunek nie jest spełniony.
3. Przy `contains`, `includes`, `not contains` i `not includes` wielkość liter nie ma znaczenia. Dlatego `contains "dr"` pasuje do tekstu `Dr Smith`.

## Łączenie warunków przez OR i AND

Użyj `||`, kiedy wystarczy dopasowanie któregokolwiek warunku. Użyj `&&`, kiedy pasować musi każdy warunek.

```
{{#if character == "Maukie" || character == "Pantalone"}}
Use the shared Maukie and Pantalone instructions.
{{/if}}

{{#if characters contains "Maukie" && characters contains "Pantalone"}}
Both characters are present in this chat.
{{/if}}
```

`&&` liczy się przed `||`. Dodaj nawiasy, żeby wprost narzucić kolejność:

```
{{#if (character == "Maukie" || character == "Pantalone") && scenario contains "lake"}}
Use the lakeside instructions for either character.
{{/if}}
```

Przy kilku możliwych wartościach tej samej rzeczy powtórzoną lewą stronę po `||` da się pominąć:

```
{{#if character == "Maukie" || "Pantalone"}}
Use the shared instructions.
{{/if}}
```

Ten skrót znaczy tyle co `character == "Maukie" || character == "Pantalone"`. Działa z operatorami równości `==`, `=` i `is`. Po obu stronach `&&` zapisuj pełne warunki, bo jedna wartość rzadko kiedy równa się dwóm różnym rzeczom naraz.

### Sprawdzenie prawdziwości (bez operatora)

Warunek bez operatora oznacza dla aplikacji Marinara Engine sprawdzenie prawdziwości. Pada wtedy proste pytanie: czy ta wartość zawiera cokolwiek konkretnego?

```
{{#if scenario}}
Current scene: {{scenario}}
{{else}}
No specific scene is set.
{{/if}}
```

Sprawdzenie prawdziwości wypada pozytywnie, gdy wartość nie jest pusta i nie jest jednym z tych słów: `false`, `0`, `no`, `off`, `null` lub `undefined`. Wielkość liter w tych słowach nie ma znaczenia. Sięgaj po sprawdzenie prawdziwości wtedy, gdy tekst ma trafić do promptu tylko przy wypełnionym polu.

### Co można porównywać

Po lewej lub prawej stronie warunku może stać dowolna z tych rzeczy:

1. Słowo kluczowe pola lub tożsamości, na przykład `char`, `user`, `group`, `persona`, `description`, `personality`, `scenario`, `input` albo `model`. Odczytują one te same wartości co odpowiadające im makra. `group` wymienia pozostałe aktywne postacie czatu, z pominięciem tej, która właśnie odpowiada.
2. Wartość w cudzysłowie, na przykład `"Alice"`.
3. Nazwa zmiennej presetu, na przykład `length`. Zmienna presetu to nazwana wartość zdefiniowana w presecie promptu (**Prompt Preset**). Zobacz [Zmienne presetu](preset-variables.md).
4. Jawne odwołanie do zmiennej zapisane jako `var:name` albo `var.name`.
5. Inne makro – jego wartość rozwija się najpierw, a dopiero potem trafia do porównania.

Gołe słowo, które nie jest słowem kluczowym, Marinara bierze za nazwę zmiennej. Jeśli zmienna o takiej nazwie nie istnieje, słowo zostaje potraktowane jako zwykły tekst. Cudzysłów przy stałych wartościach usuwa tę niejednoznaczność, więc w razie wątpliwości go dopisz.

## Zasady używania cudzysłowów

Stały fragment tekstu, z którym coś porównujesz, ujmij w cudzysłów. To znak dla aplikacji Marinara Engine, że chodzi o dosłowną wartość, a nie o słowo kluczowe czy zmienną.

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{/if}}
```

Możesz użyć prostego cudzysłowu podwójnego albo prostego apostrofu. Marinara przyjmuje też cudzysłowy drukarskie, ale proste są najbezpieczniejsze i zgodne ze wszystkimi przykładami w aplikacji. Wewnątrz wartości w cudzysłowie znak cudzysłowu poprzedza się ukośnikiem wstecznym, a `\n` oznacza przejście do nowej linii.

Wartość ze spacją, taką jak `"Dr Smith"`, zawsze ujmuj w cudzysłów. Kilka słów bez cudzysłowu Marinara czyta jako jedną nazwę zmiennej, a to prawie nigdy nie jest zamierzony efekt.

## Bloki grupowe dla wielu postaci

W czacie grupowym z dwiema postaciami lub większą ich liczbą blok grupowy powtarza ten sam tekst raz dla każdej postaci. Dzięki temu jeden blok opisuje wszystkie postacie w scenie.

Blok grupowy tworzy się tak: samotny znak `[` w osobnej linii, potem tekst, potem samotny znak `]` w osobnej linii. Wewnątrz musi znaleźć się makro postaci, na przykład `{{char}}` albo `{{description}}`, albo warunek oparty na postaci, na przykład `{{#if char == "Alice"}}`. Marinara powtarza wtedy blok raz na postać i za każdym razem rozwija makra postaci względem kolejnej z nich.

```
[
{{char}}'s current attitude:
{{#if char == "Alice"}}cheerful and open{{else}}guarded and quiet{{/if}}
]
```

W czacie grupowym z postaciami Alice i Bob blok wykonuje się dwa razy. Pierwsze przejście wstawia imię Alice i wybiera jej gałąź. Drugie wstawia imię Bob i wybiera jego gałąź. Poza blokiem grupowym makro postaci rozwija się wyłącznie względem bieżącej lub głównej postaci.

Bloki grupowe rozwijają się tylko w czacie z co najmniej dwiema postaciami. W czacie z jedną postacią linie `[` i `]` zostają zwykłym tekstem.

## Przykłady z omówieniem (przed i po)

Oto trzy pełne przykłady wraz z tym, co ostatecznie dostaje model.

Ton wypowiedzi zależny od postaci wewnątrz wspólnego presetu:

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{else}}
Speak warmly and casually.
{{/if}}
```

Przy postaci o nazwie `Dottore` model dostaje `Speak in a cold, clinical tone.` Przy każdej innej postaci dostaje `Speak warmly and casually.`

Dołączenie pola tylko wtedy, gdy jest wypełnione:

```
{{#if backstory}}
Backstory to remember: {{backstory}}
{{/if}}
```

Jeśli postać ma wypełnione pole **Backstory** (historia postaci), model dostaje tę linię razem z treścią historii. Jeśli pole **Backstory** jest puste, cały blok znika bez śladu, więc pusta etykieta nigdzie nie trafia.

Dopasowanie fragmentu nazwy użytkownika:

```
{{#if user contains "Dr"}}
Address the user as Doctor.
{{/if}}
```

Jeśli nazwa persony zawiera `Dr`, model dostaje polecenie, żeby zwracać się do ciebie per doktorze. W przeciwnym razie blok znika bez śladu.

## Powiązane przewodniki

- [Makra promptów](macros.md)
- [Zmienne presetu](preset-variables.md)
- [Czaty grupowe w trybach Conversation i Roleplay](../chats/group-chats.md)
