# Budowa promptów Noodle od środka (dla programistów)

Materiał dla programistów: gdzie w kodzie siedzą prompty (teksty, które Marinara wysyła do AI) generujące treści Noodle, jak je dostosować i jak debugować gotowe prompty. Zwykli użytkownicy konfigurują Noodle w panelu **Settings** (Ustawienia) – zobacz przewodniki Noodle w folderze `docs/noodle/`.

## Mapa źródeł promptów

Noodle ma na razie jeden wbudowany prompt do generowania tekstu, jedno zarejestrowane nadpisanie promptu tekstowego i jedno zarejestrowane nadpisanie promptu obrazu.

| Do czego służy | Źródło | Główny symbol | Jak dostosować |
| --- | --- | --- | --- |
| Wpisy na osi czasu, odpowiedzi, obserwacje, ankiety, głosy i podsumowania | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` | Zmień w kodzie wbudowane wiadomości systemowe i kontekstowe. Za ton i swobodę twórczą odpowiada opisane niżej nadpisanie **Noodle Timeline Voice & Tone**, a reszty, czyli reguł formatu wyjścia kluczowych dla schematu, nie da się zmienić z poziomu interfejsu. |
| Instrukcje głosu i tonu osi czasu (część promptu systemowego) | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_TIMELINE_VOICE` (`noodle.timelineVoice`) | Edytuj **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Timeline Voice & Tone** albo zmień w kodzie zarejestrowaną wartość domyślną (`noodleTimelineVoiceDefaultText(enhanced)` w pliku `noodle-prompt.ts`). Zakres celowo obejmuje wyłącznie ton: limity akcji strukturalnych, reguły pola docelowego i inne instrukcje kluczowe dla schematu są zapisane na stałe poza tym nadpisaniem, żeby przeredagowanie tekstu nie zepsuło parsowania `noodleGeneratedRefreshSchema`. Nietknięta wartość domyślna zależy od ustawienia `enableEnhancedTimelineWriting` w sekcji Noodle (`ctx.enhanced`; domyślnie wyłączone odtwarza pierwotną, jednolinijkową instrukcję tonu). Zapisany własny tekst nadpisania ma pierwszeństwo niezależnie od tego ustawienia. |
| Profile kont postaci tworzone przy pierwszym uruchomieniu | `packages/server/src/routes/noodle.routes.ts` | `generateMissingNoodleProfiles()` | Zmień w kodzie wbudowane wiadomości systemowe i wiadomości użytkownika. Najpierw działa wybór uczestników, a do tego promptu trafiają tylko wybrane konta postaci bez `profileGenerated`. |
| Prompt obrazu do wygenerowanego wpisu | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_IMAGE_POST` (`noodle.imagePost`) | Edytuj **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Post Image** albo zmień w kodzie zarejestrowaną wartość domyślną. |
| Domyślne instrukcje obrazów właściwe dla Noodle | `packages/shared/src/schemas/noodle.schema.ts` | `DEFAULT_NOODLE_SETTINGS.imageGenerationPrompt` | Zmień to ustawienie Noodle w interfejsie albo wartość domyślną w schemacie w kodzie. |
| Kontekst udostępnionych czatów wstawiany przy generowaniu osi czasu | `packages/server/src/routes/noodle.routes.ts` | `buildOptedInChatContext()` | Zmień w kodzie sposób składania kontekstu; zgoda na udostępnienie pozostaje w ustawieniach każdego czatu. |
| Obrazy wejściowe wpisów i odpowiedzi na osi czasu | `packages/server/src/services/noodle/noodle-vision.ts` | `prepareNoodleVisionAttachments()` | Zmień w kodzie wybór obrazów, normalizację, limity albo awaryjny tryb zgodności tylko z tekstem. |
| Aktywność Noodle wstawiana do promptów czatu | `packages/server/src/services/noodle/noodle-context.ts` | `buildRecentSocialMediaActivityBlock()` | Zmień w kodzie filtrowanie albo składanie bloku; tryby docelowe i limity elementów użytkownicy ustawiają w sekcji Noodle Settings, a sam opakowany blok ma twardy limit 8192 tokenów (token to mały kawałek tekstu). |
| Kontrakt wygenerowanego formatu JSON | `packages/shared/src/schemas/noodle.schema.ts` | `noodleGeneratedRefreshSchema` | Zmieniaj tylko razem z promptem, obsługą trasy, typami współdzielonymi i pokryciem testami regresji. |
| Kontekst świata i lore z lorebooków, wstawiany przy generowaniu osi czasu | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` (wywołuje `processLorebooks()`) | Zależy od ustawienia **Lorebook context** w sekcji Noodle (`enableLorebookContext`, domyślnie wyłączone). Korzysta z tej samej wielopostaciowej funkcji `processLorebooks()` co czaty grupowe, z limitem tokenów właściwym dla Noodle z `noodleLorebookTokenBudget()` w pliku `noodle-prompt.ts`, skalowanym liczbą aktywnych postaci i twardo ograniczonym do 8192 tokenów. Działa z `previewOnly: true`, bo Noodle nie ma slotu przy czacie, w którym dałoby się zapisać stan czasowy wpisów przyklejonych i odstępów cooldown. |

Prompty osi czasu i profili nie są na razie wymienione w interfejsie Prompt Overrides. Jedynym promptem generującym Noodle, który tam widać, jest szablon **Noodle Post Image**. Pole **Prompt instructions** z ustawień Noodle trafia do tego szablonu obrazu i nie zmienia promptu piszącego oś czasu.

Trasa obrazów wczytuje `NOODLE_IMAGE_POST`, a wynik przepuszcza jeszcze przez `compileImagePrompt()`, zanim wyśle go do dostawcy obrazów. Na końcowe żądanie wpływa więc także wybrany profil stylu obrazu i domyślne ustawienia połączenia.

## Podgląd gotowych promptów

Ręczne odświeżenie uruchomione przy włączonym trybie **Debug Mode** zapisuje w logach (dzienniku serwera) końcowe wiadomości modelu dla profilu i osi czasu, przez wspólny logger serwera. Szukaj wpisów:

```text
[debug/noodle] Profile prompt sent to model
[debug/noodle] Prompt sent to model
[debug/noodle] Attached N timeline image input(s) to the refresh prompt
```

Dane obrazów z osi czasu nigdy nie trafiają do logów diagnostycznych w postaci base64. Zapisany tekst zawiera te same klucze załączników wpisów i odpowiedzi, które dostaje model, oraz liczbę natywnych obrazów wejściowych. Noodle normalizuje i ogranicza te dane wejściowe w pliku `noodle-vision.ts`. Jeśli dostawca wprost odrzuca treści obrazowe, trasa zapisuje to w logach i wysyła zamiast tego przygotowany prompt awaryjny, wyłącznie tekstowy.

W przypadku obrazów włącz opcję **Expose media prompts before sending** w **Settings -> Generations -> Image Generation**, żeby obejrzeć i poprawić gotowe prompty, pozytywny i negatywny, zanim żądanie zostanie wysłane.

## Bezpieczne wprowadzanie zmian

Składanie promptu to granica zgodności o wysokim ryzyku. Przy zmianach pilnuj, żeby prompt, `noodleGeneratedRefreshSchema`, obsługa trasy oraz testy regresji wzmianek i ankiet Noodle pozostały spójne. Uruchom przynajmniej:

```bash
pnpm check
pnpm regression:prompt
pnpm regression:noodle
```

## Powiązane przewodniki

- [Noodle: wbudowana oś czasu społecznościowa](../noodle/overview.md)
- [Ustawienia Noodle i przeniesienie do czatów](../noodle/settings.md)
- [Mapa architektury (dla programistów)](architecture-map.md)
