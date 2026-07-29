# Game Mode: widgety HUD

Ten przewodnik wyjaśnia, jak działają widgety HUD w trybie Game Mode aplikacji Marinara Engine. Skrót HUD oznacza heads-up display, czyli pasek informacji: małe panele przyklejone do lewej i prawej krawędzi ekranu gry. Znajdziesz tu opis typów widgetów, kroku przeglądu przed startem gry, przesuwania i blokowania paneli oraz udostępniania układów widgetów.

## Czym są widgety HUD

Widgety HUD to małe własne panele, które w trakcie gry pokazują wybrane wartości: pasek zdrowia, licznik złota albo poziom zaufania sojusznika. Każda gra może mieć własny zestaw widgetów. To coś innego niż trackery paska HUD w trybie Roleplay. Opis paska trackerów używanego w czatach w trybie Roleplay znajdziesz w sekcji z powiązanymi przewodnikami na dole.

Widgetów może być łącznie maksymalnie 4. Rozdziel je między lewą i prawą stronę ekranu tak, jak chcesz.

Widgety działają tylko wtedy, gdy w danej grze włączona jest opcja **Custom HUD Widgets** (własne widgety HUD). W kreatorze konfiguracji ta opcja jest domyślnie włączona. Kiedy jest aktywna, postać Game Master (GM, mistrz gry) sterowana przez AI projektuje początkowy zestaw widgetów w trakcie budowania świata.

## Osiem typów widgetów

Typów widgetów jest osiem. Postać GM dobiera typ do każdego tworzonego widgetu. Przy ręcznym budowaniu widgetów typ wybierasz samodzielnie.

| Typ widgetu | Co pokazuje |
|---|---|
| **Progress Bar** | Poziomy pasek wartości z określonym maksimum, na przykład zdrowia lub wytrzymałości. |
| **Gauge** | Półokrągły wskaźnik wartości z określonym maksimum. |
| **Relationship Meter** | Pasek ze znacznikami kamieni milowych i etykietą, dobry do zaufania postaci NPC albo do więzi. |
| **Counter** | Jedna duża liczba: złoto, liczba dni albo pokonanych przeciwników. |
| **Stat Block** | Mała siatka nazwanych pól z wartościami, na przykład STR i DEX albo słowo opisujące stan. |
| **List** | Krótka lista punktowana, na przykład aktywne cele. |
| **Inventory Grid** | Siatka miejsc na przedmioty, opcjonalnie z zakładkami kategorii i liczbą sztuk. |
| **Timer** | Zegar odliczający minuty i sekundy, który może tykać na żywo. |

## Okno przeglądu przed sesją

Jeśli własne widgety istnieją, przed pierwszą turą uruchamia się krok przeglądu. W chwili naciśnięcia przycisku **Start Game** (rozpoczęcie gry) otwiera się okno **Review Starting Widgets** (przegląd widgetów początkowych). Zawiera listę wszystkich widgetów startowych, więc możesz je poprawić, zanim gra je utrwali.

W tym oknie da się:

- Nacisnąć przycisk **Edit** (edycja) przy widgecie, aby zmienić wartości początkowe albo zmienić nazwy pól typu **Stat Block**.
- Nacisnąć przycisk **Remove** (usunięcie), aby wyrzucić niepotrzebny widget.
- Nacisnąć przycisk **Back** (powrót), aby zamknąć okno bez rozpoczynania gry.
- Nacisnąć przycisk **Start Game**, aby zacząć grę z widgetami w pokazanej postaci.

Podobne okno pojawia się przy rozpoczynaniu nowej sesji w trwającej grze. Nosi tytuł **Prepare Next Session Widgets** (przygotowanie widgetów na kolejną sesję), a zamiast przycisku **Start Game** ma przycisk **Start Next Session**. Przycisk zamykający jest opisany **Cancel** zamiast **Back**.

## Edytowanie widgetu w trakcie gry

W trakcie gry postać GM sama aktualizuje wartości widgetów wraz z rozwojem historii. Jeśli GM pominie aktualizację, popraw widget ręcznie.

1. Znajdź panel widgetu przy lewej lub prawej krawędzi ekranu.
2. Kliknij przycisk z ołówkiem (**Edit**) w nagłówku widgetu.
3. Zmień wartości w oknie edytora. Na przykład ustaw nową wartość w polach **Current value** i **Maximum value** paska.
4. Kliknij przycisk **Save Changes** (zapisanie zmian).

W nagłówku jest też mały znak plus lub minus. Kliknij nagłówek widgetu, aby zwinąć lub rozwinąć jego zawartość.

## Przesuwanie i blokowanie paneli

Panele widgetów są domyślnie zablokowane w miejscu. Każdy panel ma w nagłówku ikonę kłódki.

1. Kliknij ikonę kłódki, aby odblokować panel. Delikatny obrys pokazuje, że panel da się już przesuwać.
2. Przeciągnij panel w nowe miejsce.
3. Kliknij ikonę kłódki ponownie, aby zablokować panel w nowym położeniu.

Aby przywrócić panel na domyślne miejsce, kliknij dwukrotnie jego ikonę kłódki albo naciśnij klawisz R, gdy ikona jest zaznaczona. Każdy panel zapamiętuje położenie i stan blokady osobno dla każdej gry. Układ nie przenosi się między różnymi grami.

Na telefonie widgety wyświetlają się jako małe kafelki zamiast pełnych paneli. Dotknij kafelka, aby otworzyć dany widget, i dotknij znaku X, aby go zamknąć.

## Budowanie własnych widgetów

Zamiast zdawać się na postać GM, możesz zaprojektować widgety samodzielnie. Ręczny edytor widgetów otwiera się w dwóch miejscach:

- W kreatorze konfiguracji gry: włącz opcję **Custom HUD Widgets**, a potem przełącznik **Build Widget Setup**. Edytor pojawia się pod przełącznikiem.
- W istniejącej grze: otwórz panel **Chat Settings** (ustawienia czatu), a w nim sekcję **Widgets**.

W edytorze wybierz typ widgetu z listy rozwijanej i naciśnij przycisk **Add** (dodanie). Dla każdego widgetu ustawisz:

- **Icon**: krótki symbol lub emoji pokazywany w nagłówku.
- **Label**: nazwa wyświetlana na górze widgetu.
- **Type**: jeden z ośmiu typów widgetów.
- **Side**: **Left HUD** albo **Right HUD**.
- **Accent**: kolor widgetu.

Poniżej tych ustawień każdy typ ma własne pola. Pasek korzysta z pól **Value** i **Max**. Licznik korzysta z pola **Count**. Siatka ekwipunku korzysta z pól **Slots** i **Contents**. Zegar korzysta z pól **Seconds** i **Running**. Edytor pokazuje, ile widgetów jest już zajętych z dostępnych 4.

W panelu **Chat Settings** naciśnij przycisk **Save Widgets** (zapisanie widgetów), aby zastosować zmiany w grze, albo przycisk **Reset**, aby cofnąć niezapisane poprawki.

## Udostępnianie widgetów przez import i eksport

Układ widgetów da się zapisać do pliku i wczytać w innej grze. Te przyciski znajdziesz zarówno w kreatorze konfiguracji, jak i w sekcji **Widgets** panelu **Chat Settings**.

1. Naciśnij przycisk **Export Widgets** (eksport widgetów), aby pobrać bieżące widgety jako plik JSON. JSON to format danych zapisywany zwykłym tekstem.
2. W innej grze naciśnij przycisk **Import Widgets** (import widgetów) i wskaż ten plik, aby wczytać te same widgety.

W panelu **Chat Settings** pamiętaj, żeby po imporcie nacisnąć przycisk **Save Widgets** – dopiero wtedy wczytane widgety zaczynają obowiązywać.

## Powiązane przewodniki

- [Game Mode: pierwsze kroki](getting-started.md)
- [Pasek HUD i trackery w trybie Roleplay](../roleplay/hud-and-trackers.md)
