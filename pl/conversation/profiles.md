# Profile w trybie Conversation Mode (nazwa wyświetlana, About Me, zachowanie)

Z tego przewodnika dowiesz się, do czego służy niewielki profil, który w trybie Conversation Mode dostaje każda postać i każda persona. Profil ma trzy części: nazwę wyświetlaną, biogram "about me" oraz wytyczną dotyczącą zachowania. Te pola działają jak profil w komunikatorze, takim jak Discord. Obowiązują wyłącznie w trybie Conversation Mode i nigdy nie trafiają do trybu Roleplay ani Game Mode.

Tryb Conversation Mode to czat w stylu wiadomości prywatnych (DM) albo komunikatora. Jeśli to dla Ciebie nowość, zacznij od przewodnika [Tryb Conversation: pierwsze kroki](getting-started.md). Persona to profil, który w czacie zastępuje Ciebie (czyli `{{user}}`).

## Gdzie znaleźć te pola

Wszystkie pola profilu znajdują się w zakładce **Convo**. Mają ją zarówno postacie, jak i persony.

1. Aby edytować profil postaci, otwórz postać w panelu **Character Editor** (edytor postaci) i kliknij zakładkę **Convo**.
2. Aby edytować profil persony, otwórz personę w panelu **Persona Editor** (edytor persony) i kliknij zakładkę **Convo**.

W zakładce **Convo** są trzy pola: **Convo Display Name**, **About Me** i **Convo Behavior**. Dla postaci i person wyglądają tak samo, poza jedną drobną różnicą opisaną niżej.

## Convo Display Name

Pole **Convo Display Name** (nazwa wyświetlana w trybie Conversation Mode) decyduje o tym, jak dana postać lub persona podpisuje się w czatach tego trybu. Zostaw je puste, a aplikacja użyje nazwy z karty. Zmiana od razu poprawia nazwę na istniejących wiadomościach. Działa tylko w trybie Conversation Mode.

Postacie (ale nie persony) mają dodatkowo pole wyboru **Declare this name on the card in the prompt**. Po jego włączeniu Marinara dopisuje krótką linijkę do tekstu karty postaci. Ta linijka mówi modelowi, która karta kryje się pod którą nazwą wyświetlaną. To pole wyboru działa dopiero wtedy, gdy nazwa wyświetlana jest ustawiona.

Makro `{{convo_display}}` wstawia nazwę wyświetlaną odpowiadającej postaci do własnego promptu. Makro to symbol zastępczy, na przykład `{{convo_display}}`, który zamienia się w prawdziwy tekst. Poza trybem Conversation Mode nie daje nic. Zobacz [Makra](../prompts/macros.md).

## About Me

Pole **About Me** (o mnie) to krótki biogram napisany w imieniu postaci lub persony, widoczny w trybie Conversation Mode. Może mieć linijkę albo dwie, może być jednym emoji, żartem albo zostać puste. Na pasku narzędzi pola tekstowego jest przycisk emoji, więc emoji da się wstawić do biogramu jednym kliknięciem.

Biogram to nie sama ozdoba. Domyślnie Marinara dodaje pole **About Me** każdej obecnej postaci i persony do promptu w każdej turze. Biogramy trafiają tam jako krótka lista profili uczestników. Dzięki temu model zawsze wie, jak każda osoba się przedstawia. Nie trzeba nic w tym celu ustawiać.

### Pisanie pola About Me z asystentką Professor Mari

Biogramu nie musisz pisać samodzielnie. Otwórz asystentkę Professor Mari z ekranu głównego i poproś ją o napisanie albo poprawienie pola **About Me** dla wskazanej postaci lub persony. Najpierw czyta zapisany profil, potem pisze krótki biogram głosem tej osoby i zapisuje go wprost w prawdziwym polu **About Me**.

Przykładowa prośba: `Write Luna's About Me as a cryptic one-line bio.` Można też poprosić o poprawkę, na przykład o to, żeby istniejący biogram był zabawniejszy, krótszy, cieplejszy albo bliższy karcie.

Professor Mari korzysta ze swojego zwykłego, skonfigurowanego modelu. W edytorach postaci i person nie ma osobnego połączenia, listy źródeł ani przycisku generowania dla pola About Me. Zapisana przez nią zmiana trafia do zwykłego przeglądu zmian, gdzie można ją zachować albo przywrócić poprzednią wersję. Przy ręcznej edycji w edytorze nadal pojawia się przycisk **Revert** (cofnięcie zmian), który przywraca tekst sprzed bieżącej edycji.

## Convo Behavior

Pole **Convo Behavior** (zachowanie w trybie Conversation Mode) to dowolny tekst z instrukcją, jak postać lub persona ma się zachowywać w tym trybie. Na przykład: krótkie odpowiedzi małymi literami, pisane jak przez prawdziwą osobę, a nie przez narratora. Ta treść nigdy nie trafia do trybu Roleplay ani Game Mode.

### Insertion (miejsce wstawienia wytycznej)

Pod polem **Convo Behavior** jest lista rozwijana **Insertion** (miejsce wstawienia). Decyduje o tym, gdzie w prompcie ląduje twoja wytyczna. Do wyboru są:

- Opcja **Constant** opisana jako "after the card" (domyślna): dodawana zawsze, zaraz po tekście karty.
- Opcja **Constant** opisana jako "before the card": dodawana zawsze, tuż przed tekstem karty.
- **Append to post-history**: dodawana na końcu instrukcji post-history.
- **Prepend to post-history**: dodawana na początku instrukcji post-history.
- **Replace post-history**: używana zamiast instrukcji post-history.
- **Only where `{{convo_behavior}}` is placed**: wstawiana tylko tam, gdzie we własnym prompcie umieścisz makro `{{convo_behavior}}`.

Instrukcje post-history to fragment promptu, który aplikacja umieszcza za ostatnimi wiadomościami z czatu. Jeśli nie piszesz własnych promptów, zostaw ustawienie domyślne.

## Biogramy About Me osobne dla jednego czatu

Pole **About Me** na karcie to domyślny biogram używany wszędzie. Da się jednak ustawić inny biogram dla jednego konkretnego czatu. To właśnie ten wyjątek dla pojedynczego czatu, a otwiera się go w panelu podręcznym profilu.

1. W czacie trybu Conversation Mode kliknij awatar albo nazwę postaci lub persony.
2. Obok awatara otwiera się mała wizytówka profilu. Na telefonie wysuwa się od dołu.
3. Wizytówka pokazuje powiększony awatar, nazwę i aktualną treść pola **About Me**.
4. Plakietka **Default** oznacza biogram z karty, a **Chat-specific** – biogram ustawiony dla tego jednego czatu. Przy postaciach widać tu też status obecności: **Online**, **Away**, **Busy** albo **Offline**.

Aby ustawić biogram dla jednego czatu:

1. Kliknij przycisk **Edit** (edycja) w panelu podręcznym.
2. Wpisz biogram na potrzeby tego czatu. Do dyspozycji masz wybór emoji, razem z zakładką **Custom emojis**.
3. Kliknij przycisk **Save** (zapis). Powinno pojawić się potwierdzenie, że biogram dla tego czatu został zapisany.

W trakcie edycji przycisk **Revert** cofa niezapisane zmiany, a **Cancel** (anulowanie) zamyka tryb edycji bez zapisu. Kiedy biogram dla jednego czatu już istnieje, przycisk **Clear** (wyczyszczenie) usuwa go i przywraca wersję z karty. Zapisanie pustego biogramu również go usuwa. Pamiętaj: domyślne pole **About Me** edytuje się na karcie, a osobny biogram obowiązuje tylko w tym jednym czacie.

## Jak pozwolić postaci samodzielnie zmieniać własne pole About Me

Jest też narzędzie, po które postać może sięgnąć w trakcie rozmowy, żeby zmienić własny biogram. Nazywa się **update_about_me** i domyślnie jest wyłączone. Włącz je w panelu **Chat Settings** (ustawienia czatu) w sekcji **Function Calling**: włącz przełącznik **Enable Tool Use** i dodaj narzędzie **update_about_me**.

Po włączeniu postać może zmienić własny biogram na dwa sposoby:

- Zakres publiczny zmienia prawdziwy biogram widoczny we wszystkich czatach. Taka zmiana najpierw trafia do Ciebie do zatwierdzenia.
- Zakres czatu zmienia biogram widoczny tylko w bieżącej rozmowie.

## Profile we własnych promptach

Żeby profile dotarły do modelu, makra nie są potrzebne. Biogramy **About Me** dokleja się do promptu automatycznie, a pole **Convo Behavior** trafia tam zgodnie z ustawieniem **Insertion**. Makra przydają się przy własnych promptach, kiedy chcesz samodzielnie umieścić wartość w konkretnym miejscu.

Cztery makra wstawiają wartości z profilu bezpośrednio w tekst. Poza trybem Conversation Mode każde z nich nie daje nic:

- `{{convo_display}}`: nazwa wyświetlana odpowiadającej postaci.
- `{{char_about}}`: obowiązująca treść pola **About Me** postaci.
- `{{persona_about}}`: obowiązująca treść pola **About Me** persony.
- `{{convo_behavior}}`: wytyczna z pola **Convo Behavior** postaci.

Pełną listę makr znajdziesz w przewodniku [Makra](../prompts/macros.md).

## Powiązane przewodniki

- [Tryb Conversation: pierwsze kroki](getting-started.md)
- [Tworzenie i edycja postaci](../characters/creating-and-editing-characters.md)
- [Persony użytkownika: tworzenie i edycja](../characters/personas.md)
- [Agenci do pobrania: przegląd pakietów](../agents/built-in-agents.md)
- [Makra](../prompts/macros.md)
