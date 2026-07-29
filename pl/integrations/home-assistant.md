# Integracja z Home Assistant

Z tego przewodnika dowiesz się, jak połączyć aplikację Marinara Engine z platformą Home Assistant. Po połączeniu postacie AI sterują prawdziwymi urządzeniami inteligentnego domu prosto z czatu. Obsługują światła, klimatyzację, rolety i odtwarzacze multimediów. Dzięki temu połączeniu automatyzacje Home Assistant mogą też wysyłać wiadomości do aplikacji Marinara Engine.

Home Assistant to darmowa platforma open source do sterowania urządzeniami inteligentnego domu. Bez platformy Home Assistant ta integracja nie jest do niczego potrzebna.

## Do czego służy ta integracja

Integracja to niewielki program, który instaluje się wewnątrz platformy Home Assistant. Łączy działającą platformę Home Assistant z działającym serwerem Marinara Engine. Po instalacji robi automatycznie trzy rzeczy:

- Tworzy w aplikacji Marinara Engine narzędzia inteligentnego domu. Pojawiają się one w sekcji **Functions** (Funkcje) w panelu Presets. Marinara nazywa je "custom tools" albo "Functions". O tym, jak działają Functions w ogóle, opowiada przewodnik [Własne narzędzia](../extending/custom-tools.md).
- Tworzy w aplikacji Marinara Engine jednego agenta AI o nazwie **Home Assistant**. Agent to pomocnik AI, który pracuje obok czatu. Zobacz przewodnik [Agenci: pomocnicy AI w czatach](../agents/agents-overview.md).
- Tworzy kilka encji Home Assistant, dzięki którym można podglądać aplikację Marinara Engine i sterować nią od strony platformy Home Assistant. Encja to urządzenie, czujnik lub kontrolka w platformie Home Assistant.

Nigdzie nie trzeba kopiować adresów narzędzi ani konfigurować ich ręcznie. Integracja łączy wszystko ze sobą już przy pierwszej konfiguracji.

## Czego potrzebujesz na start

Zanim zaczniesz, przygotuj wszystko z tej listy.

- Działającą platformę Home Assistant w wersji 2024.1.0 lub nowszej.
- HACS zainstalowany w platformie Home Assistant. HACS to Home Assistant Community Store, narzędzie do instalowania integracji, których nie ma w standardzie.
- Zainstalowaną i uruchomioną aplikację Marinara Engine, dostępną z komputera z platformą Home Assistant. Domyślny adres to `localhost:7860`. Jeśli Home Assistant działa na innym urządzeniu, przeczytaj uwagę o hasłach poniżej.
- Ustawienie `WEBHOOK_LOCAL_URLS_ENABLED=true` dopisane do pliku `.env` aplikacji Marinara Engine.

Plik `.env` to zwykły tekstowy plik ustawień serwera Marinara Engine. Gdzie go znaleźć i jak go edytować, wyjaśnia przewodnik [Konfiguracja serwera](../CONFIGURATION.md).

To ostatnie ustawienie jest konieczne, ponieważ integracja korzysta z webhooka. Webhook to adres internetowy, dzięki któremu jedna aplikacja automatycznie przesyła dane do drugiej. Adres webhooka platformy Home Assistant jest lokalny i używa zwykłego protokołu `http`. Marinara ze względów bezpieczeństwa domyślnie blokuje wywołania lokalnych adresów `http`. Ustawienie `WEBHOOK_LOCAL_URLS_ENABLED=true` na nie zezwala.

Dopisz tę linię do pliku `.env`:

```
WEBHOOK_LOCAL_URLS_ENABLED=true
```

Ustawienie zaczyna działać po paru sekundach. Serwera Marinara Engine nie trzeba uruchamiać ponownie.

### Kiedy Home Assistant działa na innym urządzeniu

Integracja łączy się z aplikacją Marinara Engine bez nazwy użytkownika i hasła. W formularzu konfiguracji nie ma nawet pól, w które dałoby się je wpisać. Dlatego ma znaczenie, gdzie działa Home Assistant:

- Kiedy Home Assistant i Marinara Engine działają na tym samym komputerze, połączenie działa od razu.
- Kiedy Home Assistant działa na innym urządzeniu, Marinara domyślnie blokuje połączenie. Trzeba wtedy zezwolić temu urządzeniu na połączenie bez hasła. Jeden ze sposobów to dopisanie jego adresu IP do zmiennej `IP_ALLOWLIST` w pliku `.env` aplikacji Marinara Engine. Adres IP to liczbowy adres urządzenia w sieci. W całkowicie zaufanej sieci domowej można zamiast tego ustawić `ALLOW_UNAUTHENTICATED_PRIVATE_NETWORK=true`.
- Jeśli aplikacja Marinara Engine jest chroniona zmiennymi `BASIC_AUTH_USER` i `BASIC_AUTH_PASS`, integracja nie ma jak się zalogować. Działa wtedy wyłącznie z tego samego komputera albo z urządzenia wpisanego do `IP_ALLOWLIST`.

Jak działają te ustawienia i które wybrać, opisuje przewodnik [Dostęp zdalny](../REMOTE_ACCESS.md).

## Instalacja integracji w platformie Home Assistant

Instalacja przebiega w dwóch etapach. Najpierw dodajesz integrację do HACS, potem ją konfigurujesz.

### Dodanie do HACS

1. W platformie Home Assistant otwórz **HACS**.
2. Otwórz menu z trzema kropkami i kliknij **Custom repositories**.
3. W polu repozytorium wpisz ten adres:

```
https://github.com/Pasta-Devs/Marinara-Engine
```

4. Ustaw kategorię na **Integration**, a potem kliknij przycisk **Add**.
5. Wyszukaj **Marinara Engine** i zainstaluj integrację.
6. Uruchom ponownie platformę Home Assistant.

### Konfiguracja

1. Przejdź do **Settings** (Ustawienia), potem **Devices & Services** i kliknij przycisk **Add Integration**.
2. Wyszukaj **Marinara Engine**.
3. Wpisz **Host** i **Port**, pod którymi działa aplikacja Marinara Engine. Domyślne wartości to `localhost` i `7860`.
4. Kliknij przycisk **Submit**.

Jeśli aplikacja Marinara Engine jest pod tym adresem nieosiągalna, Home Assistant pokazuje błąd i przerywa konfigurację. Zajrzyj do sekcji Rozwiązywanie problemów poniżej.

## Co Marinara Engine tworzy automatycznie

Po udanej konfiguracji integracja buduje całą resztę sama.

- Rejestruje prywatny webhook wewnątrz platformy Home Assistant.
- Tworzy narzędzia inteligentnego domu w sekcji **Functions** aplikacji Marinara Engine, każde od razu wskazujące na ten webhook.
- Tworzy w aplikacji Marinara Engine agenta **Home Assistant** z listą wszystkich włączonych narzędzi.
- Tworzy encje Home Assistant opisane dalej w tym przewodniku.

## Dodanie agenta Home Assistant do czatu

Utworzenie agenta nie podpina go do każdego czatu. Trzeba dodać go osobno w każdym czacie, w którym ma działać sterowanie inteligentnym domem.

1. Otwórz wybrany czat.
2. Otwórz **Chat Settings** (ustawienia czatu), a potem sekcję **Agents**.
3. Dodaj do czatu agenta **Home Assistant**.

Agent Home Assistant działa w czatach Roleplay, Conversation i Game. Po dodaniu narzędzia inteligentnego domu stają się automatycznie dostępne dla AI w tym czacie. Nic więcej w czacie włączać nie trzeba.

## Sprawdzenie, czy wszystko działa

Przetestuj połączenie jedną prostą prośbą.

1. Dodaj agenta **Home Assistant** do czatu, tak jak opisano powyżej.
2. W tym czacie napisz zwykłą prośbę, na przykład: `Turn on the office lights`.
3. Wyślij wiadomość.

AI powinno wywołać narzędzie inteligentnego domu, na przykład `ha_turn_on`, a odpowiednie światła powinny się zapalić. Potem AI potwierdza, co zrobiło. Jeśli nic się nie dzieje, sprawdź, czy ustawienie `WEBHOOK_LOCAL_URLS_ENABLED=true` jest na miejscu, i zajrzyj do sekcji Rozwiązywanie problemów.

## Udostępniane kategorie narzędzi

Integracja dzieli narzędzia inteligentnego domu na osiem kategorii. To ty decydujesz, z których kategorii Marinara może korzystać.

Żeby zmienić kategorie, otwórz **Settings**, potem **Devices & Services**, kliknij **Marinara Engine**, a następnie przycisk **Configure**. Zobaczysz dwie opcje:

- **Primary Chat**: domyślny czat, do którego kierują usługi Home Assistant. Te usługi opisuje dalsza część przewodnika.
- **Exposed Tool Categories**: lista kategorii narzędzi, z których Marinara może korzystać.

Ta tabela zestawia kategorie, ich stan domyślny i narzędzia, które zawierają.

| Kategoria | Domyślnie | Narzędzia |
|---|---|---|
| Lights & Switches (światła i przełączniki) | On | ha_turn_on, ha_turn_off, ha_toggle, ha_set_brightness, ha_set_color, ha_set_color_temp |
| Climate (klimatyzacja) | On | ha_set_temperature, ha_set_hvac_mode |
| Covers (Blinds & Garage) (rolety i brama garażowa) | On | ha_open_cover, ha_close_cover, ha_set_cover_position |
| Locks (zamki) | Off | ha_lock, ha_unlock |
| Media Players (odtwarzacze multimediów) | On | ha_media_play, ha_media_pause, ha_set_volume |
| Scenes & Scripts (sceny i skrypty) | On | ha_activate_scene, ha_run_script |
| Query (zapytania) | On | ha_get_state, ha_list_areas, ha_list_entities, ha_notify |
| Generic Service Calls (Advanced) (ogólne wywołania usług) | Off | ha_call_service |

Kategorie **Locks** oraz **Generic Service Calls (Advanced)** są domyślnie wyłączone. Włącz je tylko wtedy, gdy naprawdę mają być używane. Kategoria **Generic Service Calls (Advanced)** pozwala AI wywołać dowolną usługę Home Assistant, więc obchodź się z nią ostrożnie.

Większość narzędzi przyjmuje albo jedno konkretne urządzenie, albo nazwę pomieszczenia. Po podaniu nazwy pomieszczenia narzędzie działa naraz na wszystkich pasujących urządzeniach w tym pomieszczeniu.

Zmiany kategorii zaczynają obowiązywać dopiero po naciśnięciu przycisku **Marinara Sync HA Tools** albo po ponownym uruchomieniu platformy Home Assistant. Ten przycisk opisuje następna sekcja.

## Encje Home Assistant

Integracja tworzy poniższe encje w ramach urządzenia Home Assistant o nazwie **Marinara Engine**.

| Encja | Typ | Do czego służy |
|---|---|---|
| Marinara Chat Count | Sensor | Pokazuje łączną liczbę czatów w aplikacji Marinara Engine |
| Marinara Active Agent Count | Sensor | Pokazuje, ilu agentów jest włączonych w aplikacji Marinara Engine |
| Marinara Active Chat | Select | Wybiera czat, do którego kierują usługi Home Assistant |
| Marinara Agent: (nazwa) | Switch | Włącza i wyłącza jednego agenta. Każdy agent ma własny przełącznik |
| Marinara Abort Generation | Button | Przerywa trwające generowanie odpowiedzi AI |
| Marinara Sync HA Tools | Button | Wysyła ponownie wszystkie narzędzia i odbudowuje agenta Home Assistant |

Integracja sprawdza w aplikacji Marinara Engine nowe czaty i nowych agentów co 30 sekund. Czat lub agent utworzony przed chwilą może pojawić się tutaj z opóźnieniem do 30 sekund.

## Sterowanie aplikacją Marinara Engine z automatyzacji Home Assistant

Integracja dodaje dwie usługi Home Assistant. Używa się ich w automatyzacjach Home Assistant, a nie w aplikacji Marinara Engine. Obie domyślnie kierują do czatu **Primary Chat**.

### Send Message (marinara_engine.send_message)

Ta usługa wysyła wiadomość do czatu w aplikacji Marinara Engine.

- `message`: treść wiadomości. To pole jest wymagane.
- `chat_id`: czat, do którego trafia wiadomość. Puste pole oznacza czat Primary Chat.
- `role`: nadawca wiadomości. Możliwe wartości to `user`, `assistant`, `system` i `narrator`. Domyślnie `user`.
- `trigger_generation`: przy wartości true AI odpowiada po wysłaniu wiadomości. Domyślnie false.

Oto automatyzacja, która informuje AI o otwarciu drzwi wejściowych:

```yaml
automation:
  trigger:
    platform: state
    entity_id: binary_sensor.front_door
    to: "on"
  action:
    service: marinara_engine.send_message
    data:
      message: "Someone just arrived at the front door."
      trigger_generation: true
```

### Trigger Generation (marinara_engine.trigger_generation)

Ta usługa zaczyna generowanie odpowiedzi AI w czacie, bez wysyłania widocznej wiadomości.

- `chat_id`: czat, w którym ma powstać odpowiedź. Puste pole oznacza czat Primary Chat.
- `user_message`: opcjonalna wiadomość dołączana do tury z odpowiedzią.

## Ponowna synchronizacja po zmianie ustawień

Po zmianie włączonych kategorii naciśnij przycisk **Marinara Sync HA Tools**, żeby zmiana zaczęła obowiązywać. Znajdziesz go na stronie urządzenia **Marinara Engine** w platformie Home Assistant.

Naciśnięcie przycisku **Marinara Sync HA Tools** powoduje, że:

- Istniejące narzędzia aktualizują się w miejscu, więc wszystkie zmiany docierają do aplikacji Marinara Engine.
- Agent **Home Assistant** odbudowuje się, jeśli został usunięty w aplikacji Marinara Engine.
- Narzędzia z wyłączonych kategorii zostają wyłączone. Nie są przy tym usuwane.

Nie edytuj narzędzi Home Assistant ręcznie w aplikacji Marinara Engine. Kolejna synchronizacja nadpisuje takie zmiany i włącza narzędzia z powrotem.

## Rozwiązywanie problemów

### Formularz konfiguracji zgłasza brak połączenia

Sprawdź, czy aplikacja Marinara Engine działa. Zweryfikuj, czy wpisane **Host** i **Port** odpowiadają temu, gdzie nasłuchuje. Domyślnie są to `localhost` i `7860`.

Kiedy Home Assistant działa na innym urządzeniu niż Marinara Engine, Marinara domyślnie je blokuje. Integracja nie potrafi wysłać hasła, więc Marinara musi przyjąć to urządzenie bez hasła. Dopisz adres IP urządzenia z platformą Home Assistant do zmiennej `IP_ALLOWLIST` w pliku `.env` aplikacji Marinara Engine. Ten i inne warianty opisuje przewodnik [Dostęp zdalny](../REMOTE_ACCESS.md). Marinara chroniona zmiennymi `BASIC_AUTH_USER` i `BASIC_AUTH_PASS` również odrzuca integrację, chyba że urządzenie widnieje w `IP_ALLOWLIST`.

Te zasady obowiązują także po konfiguracji. Jeśli Marinara zablokuje później urządzenie z platformą Home Assistant, czujniki i lista czatów po cichu przestają się aktualizować.

### AI próbuje użyć narzędzia, ale nic się nie dzieje

Najprawdopodobniej blokowane jest wywołanie webhooka. Dopisz `WEBHOOK_LOCAL_URLS_ENABLED=true` do pliku `.env` aplikacji Marinara Engine i zapisz plik. Zmiana działa po paru sekundach. Bez niej wywołania narzędzi kończą się komunikatem o niedozwolonym protokole `http` albo o odrzuconym adresie prywatnym.

Kiedy Marinara Engine i Home Assistant działają na tym samym komputerze, integracja sama używa adresu wewnętrznego dla webhooka. Kiedy Marinara Engine działa na innym urządzeniu, sprawdź, czy adres platformy Home Assistant w sieci lokalnej jest z tego urządzenia osiągalny.

### Narzędzia nie pojawiają się na liście Functions

Naciśnij przycisk **Marinara Sync HA Tools** albo uruchom ponownie platformę Home Assistant. Potem sprawdź sekcję **Functions** w panelu Presets w aplikacji Marinara Engine.

### Agenta Home Assistant nie ma w moim czacie

Najpierw potwierdź, że agent **Home Assistant** istnieje w aplikacji Marinara Engine w sekcji Agents. Jeśli go brakuje, naciśnij przycisk **Marinara Sync HA Tools**, żeby go odbudować. Potem otwórz **Chat Settings**, przejdź do sekcji **Agents** i dodaj agenta **Home Assistant** do tego czatu.

### Ręczne odszukanie adresu webhooka

Rzadko bywa to potrzebne, bo każde narzędzie ma już wpisany adres. Żeby go znaleźć, otwórz w platformie Home Assistant **Settings**, potem **Devices & Services**, a następnie **Marinara Engine**. Webhook korzysta z takiego wzorca, gdzie 8123 to domyślny port platformy Home Assistant:

```
http://<homeassistant-ip>:8123/api/webhook/<webhook-id>
```

## Odinstalowanie

Żeby usunąć integrację, skasuj ją w platformie Home Assistant w **Settings**, potem **Devices & Services**, a następnie **Marinara Engine**. Usuwa to encje Home Assistant. Narzędzia utworzone w sekcji **Functions** aplikacji Marinara Engine pozostają na miejscu. Tak samo agent **Home Assistant**. Jeśli nie są już potrzebne, usuń jedno i drugie ręcznie w aplikacji Marinara Engine.

## Powiązane przewodniki

- [Własne narzędzia](../extending/custom-tools.md)
- [Agenci: pomocnicy AI w czatach](../agents/agents-overview.md)
- [Konfiguracja serwera](../CONFIGURATION.md)
- [Dostęp zdalny](../REMOTE_ACCESS.md)
