# Podpinanie lorebooków do postaci i person

Z tego przewodnika dowiesz się, jak podpiąć lorebooki do postaci albo persony, żeby włączały się same w odpowiednich czatach. Persona to postać, w którą się wcielasz. Opisuje też osadzanie lorebooka w karcie postaci oraz sekcję **Lorebooks** (lorebooki), którą ma każdy czat. Lorebook to zbiór faktów o twoim świecie: wpisy World Info wyzwalane słowami kluczowymi. Jeśli to nowe pojęcie, zacznij od przewodnika [Lorebooki – przegląd](overview.md).

## Dwa sposoby na dołączenie lorebooka

Lorebook da się dołączyć do postaci na dwa sposoby. Działają inaczej, więc wybierz ten, który pasuje.

- **Link (Assign)** (podpięcie): lorebook zostaje w bibliotece, a postać albo persona tylko na niego wskazuje. Włącza się sam w czatach z tą postacią lub z tą personą. Podpięty lorebook NIE wędruje razem z wyeksportowaną kartą postaci.
- **Embed** (osadzenie): lorebook zostaje zapisany wewnątrz karty postaci. Podróżuje razem z kartą przy eksporcie i przy udostępnianiu postaci. Osadzanie działa tylko dla postaci, nie dla person.

Najczęściej wystarczy podpięcie. Osadzanie ma sens wtedy, gdy karta postaci ma trafić do kogoś z lorebookiem w środku.

## Zakładka **Lorebook** w edytorze

Zakładkę **Lorebook** ma zarówno edytor postaci, jak i edytor persony.

1. Otwórz postać albo personę do edycji.
2. Kliknij zakładkę **Lorebook**.
3. Zobaczysz sekcję **Lorebooks** z dwoma przyciskami: **New** (nowy) i **Assign Lorebook** (podpięcie lorebooka).

Przycisk **New** tworzy nowy lorebook, od razu podpięty do edytowanej postaci lub persony. Otwiera okno **Create Lorebook** z polem **Category** ustawionym na **Character**.

Przycisk **Assign Lorebook** podpina lorebook, który już jest w bibliotece. Lista wyboru pokazuje wyłącznie lorebooki z kategorii **Character**. Opisuje to następna sekcja.

## Podpięcie istniejącego lorebooka

Okno **Assign Lorebook** pokazuje tylko te lorebooki, których pole **Category** ma wartość **Character**. Dotyczy to także edycji persony. Lorebook z innej kategorii, na przykład World albo NPC, nie pojawi się ani na liście wyboru, ani wśród podpiętych. Żeby się pojawił, otwórz lorebook i na zakładce **Overview** ustaw jego **Category** na **Character**. Przycisk **New** omija ten problem, bo od razu tworzy lorebook w kategorii Character.

1. W zakładce **Lorebook** kliknij przycisk **Assign Lorebook**.
2. W polu wyszukiwania wpisz fragment nazwy lorebooka.
3. Kliknij wybrany lorebook. Obok niego pojawi się znacznik wyboru.
4. Po prawej stronie wybierz **Scope** (zasięg) – opisuje go następna sekcja.
5. Kliknij przycisk **Assign**.

Lorebook trafia teraz na listę podpiętych. Każdy wiersz ma przycisk **Scope** do późniejszej zmiany zasięgu oraz ikonę kosza, która usuwa podpięcie. Kliknięcie nazwy otwiera lorebook w pełnym edytorze.

Lorebook ustawiony jako Global działa w każdym czacie i nie da się go podpiąć do postaci ani persony. Kategorię Global wyjaśnia [Lorebooki – przegląd](overview.md).

## Scope: które czaty mogą korzystać z podpiętego lorebooka

**Scope** decyduje o tym, gdzie podpięty lorebook ma prawo się włączyć. Nie chodzi o każdy czat w aplikacji Marinara Engine, tylko o czaty z tą postacią albo z tą personą. Zasięg ma trzy tryby.

- **All chats with [name]**: ustawienie domyślne. Lorebook włącza się w każdym czacie z tą postacią lub z tą personą.
- **Disabled for all chats**: podpięcie zostaje, ale lorebook nigdy się nie włącza. Tak wstrzymuje się lorebook bez usuwania podpięcia.
- **Specific chats**: konkretne czaty wybiera się z listy. Tylko zaznaczone czaty mogą korzystać z lorebooka. Lista pokazuje czaty, które już zawierają tę postać lub używają tej persony.

Przy opcji **Specific chats** trzeba zaznaczyć co najmniej jeden czat, inaczej zapis się nie uda.

Żeby zmienić zasięg później, kliknij przycisk **Scope** w wierszu podpiętego lorebooka, popraw ustawienie i kliknij **Assign** jeszcze raz.

## Osadzanie lorebooka w karcie postaci

Osadzenie zapisuje lorebook wewnątrz karty postaci, więc lorebook eksportuje się razem z postacią. Działa tylko dla postaci. Przydaje się wtedy, gdy chcesz udostępnić postać z gotową wiedzą o świecie.

1. Otwórz postać w edytorze postaci.
2. Przejdź do zakładki **Lorebook**.
3. Sprawdź, czy wybrany lorebook jest już podpięty (patrz wyżej).
4. W jego wierszu kliknij **Embed into card**.

W wierszu powinna pojawić się plakietka **Embedded**. Od tej chwili wpisy lorebooka żyją w karcie i eksportują się razem z nią.

Karta postaci mieści jeden osadzony lorebook naraz. Jeśli karta już jakiś ma, przycisk **Embed into card** jest nieaktywny, a obok widnieje uwaga "Remove the current embedded lorebook first". Najpierw usuń obecną osadzoną kopię, dopiero potem osadź inny lorebook.

Po edycji podpiętego lorebooka kliknij **Refresh** w jego wierszu. Marinara zapisuje wtedy osadzoną kopię od nowa, z aktualnych wpisów lorebooka, więc kopia w karcie nie odstaje od oryginału.

## Zarządzanie osadzonym lorebookiem

Kiedy karta postaci ma już osadzony lorebook, pod listą podpiętych pojawiają się dodatkowe kontrolki. Jest tam też lista osadzonych wpisów, tylko do odczytu.

- **Import Embedded Lorebook** (import osadzonego lorebooka): zamienia wpisy zapisane w karcie w zwykły, edytowalny lorebook w bibliotece. Nowy lorebook zostaje podpięty z powrotem do postaci. Gdy podpięta kopia już istnieje, przycisk nosi nazwę **Reimport Embedded Lorebook**.
- **Edit Embedded Lorebook**: otwiera ten podpięty lorebook w pełnym edytorze. Zmiany trafiają stamtąd do osadzonej kopii w karcie automatycznie.
- **Remove from card**: usuwa osadzoną kopię z karty. Osobno podpięty lorebook w bibliotece zostaje nietknięty.

To przydaje się przy kartach zaimportowanych z innych narzędzi. Wiele z nich przychodzi z osadzonym lorebookiem. Kliknij **Import Embedded Lorebook**, żeby dostać w pełni edytowalną wersję w aplikacji Marinara Engine.

## Sekcja **Lorebooks** w panelu **Chat Settings**

Każdy czat ma własne kontrolki **Lorebooks**. Widać tu, które lorebooki działają w bieżącym czacie, i można je ustawić tylko dla niego.

1. Otwórz czat.
2. Otwórz **Chat Settings** (ustawienia czatu).
3. Znajdź sekcję **Lorebooks**. Plakietka z liczbą pokazuje, ile lorebooków jest aktywnych.

Każdy aktywny lorebook ma jedną plakietkę lub więcej, a one mówią, dlaczego jest włączony:

- **Chat**: został dodany do tego czatu ręcznie.
- **Global**: to lorebook globalny.
- **Character**: jest podpięty do postaci obecnej w tym czacie.
- **Persona**: jest podpięty do persony używanej w tym czacie.

Zestaw aktywnych lorebooków da się zmienić na potrzeby samego tego czatu.

- **Add Lorebook** (dodanie lorebooka): przypina lorebook do tego czatu. Przypięte lorebooki mają plakietkę **Chat**.
- Ikona kosza (**Remove from chat**): odpina lorebook dodany ręcznie.
- Ikona przekreślonego oka (**Disable in this chat**): tymczasowo ukrywa automatycznie włączony lorebook, tylko w tym czacie i bez usuwania podpięcia. Wyłączony lorebook ma przekreśloną nazwę i plakietkę **Disabled**.
- Ikona oka (**Enable in this chat**): włącza wyłączony lorebook z powrotem w tym czacie.

### Lorebook Token Budget

**Lorebook Token Budget** to pole liczbowe w tej sekcji. Ogranicza, ile tekstu z lorebooków można wstawić w tym czacie, a miarą są tokeny, czyli małe kawałki tekstu. Domyślna wartość to **8192**. Wpisz **0**, żeby znieść limit. Ten limit obejmuje cały czat i jest niezależny od limitu tokenów ustawionego w samym lorebooku. Działają oba naraz. Jak się uzupełniają, opisuje przewodnik [Limity tokenów i rekurencja w lorebookach](token-budgets.md).

## Powiązane przewodniki

- [Lorebooki – przegląd](overview.md)
- [Limity tokenów i rekurencja w lorebookach](token-budgets.md)
- [Importowanie i eksportowanie lorebooków](import-export.md)
- [Tworzenie i edycja postaci](../characters/creating-and-editing-characters.md)
- [Panel **Chat Settings** – przegląd](../chats/chat-settings.md)
