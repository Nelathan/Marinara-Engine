# Home Assistant 연동

이 가이드에서는 Marinara Engine과 Home Assistant를 연결하는 방법을 설명합니다. 연결을 마치면 AI 캐릭터가 채팅 안에서 실제 스마트홈 기기를 조작할 수 있습니다. 조명, 냉난방, 커버, 미디어 플레이어를 다룰 수 있습니다. 반대로 Home Assistant 자동화가 Marinara로 메시지를 보내는 것도 가능합니다.

Home Assistant는 스마트홈 기기를 제어하는 무료 오픈 소스 플랫폼입니다. Home Assistant를 쓰지 않는다면 이 연동은 필요 없습니다.

## 이 연동으로 할 수 있는 일

연동 기능은 Home Assistant 안에 설치하는 작은 프로그램입니다. 실행 중인 Home Assistant와 실행 중인 Marinara Engine 서버를 이어 줍니다. 설치하면 다음 세 가지가 자동으로 이루어집니다.

- Marinara 안에 스마트홈 도구를 만듭니다. 이 도구는 Presets 패널의 **Functions**(기능) 영역에 나타납니다. Marinara는 이것을 "custom tools" 또는 "Functions"라고 부릅니다. Functions의 일반적인 동작 방식은 [사용자 지정 도구](../extending/custom-tools.md)를 참고하세요.
- Marinara 안에 **Home Assistant**라는 이름의 AI 에이전트를 하나 만듭니다. 에이전트는 채팅과 함께 돌아가는 AI 기능입니다. [에이전트: 채팅을 도와주는 AI](../agents/agents-overview.md)를 참고하세요.
- Home Assistant 쪽에서 Marinara를 살펴보고 제어할 수 있도록 Home Assistant 엔티티를 여러 개 만듭니다. 엔티티는 Home Assistant 안의 기기, 센서, 컨트롤을 뜻합니다.

도구 주소를 복사하거나 도구를 직접 설정할 일은 없습니다. 처음 설정할 때 연동 기능이 모든 연결을 알아서 맞춰 줍니다.

## 준비물

시작하기 전에 아래 항목이 모두 갖춰져 있어야 합니다.

- 실행 중인 Home Assistant. 버전 2024.1.0 이상이어야 합니다.
- Home Assistant에 설치된 HACS. HACS는 Home Assistant Community Store로, 기본 제공되지 않는 사용자 지정 연동을 설치하는 도구입니다.
- 설치되어 실행 중이며 Home Assistant가 돌아가는 컴퓨터에서 접근 가능한 Marinara Engine. 기본 주소는 `localhost:7860`입니다. Home Assistant가 다른 기기에서 돌아간다면 아래의 비밀번호 관련 안내를 읽어 보세요.
- Marinara의 `.env` 파일에 추가한 `WEBHOOK_LOCAL_URLS_ENABLED=true` 설정.

`.env` 파일은 Marinara 서버의 설정을 담은 일반 텍스트 파일입니다. 이 파일의 위치와 편집 방법은 [서버 설정](../CONFIGURATION.md)에서 확인할 수 있습니다.

마지막 설정이 필요한 이유는 연동 기능이 웹훅을 쓰기 때문입니다. 웹훅은 한 앱이 다른 앱으로 데이터를 자동으로 보낼 수 있게 해 주는 웹 주소입니다. Home Assistant의 웹훅 주소는 로컬 주소이고 암호화되지 않은 `http` 주소입니다. Marinara는 안전을 위해 로컬 `http` 주소로의 호출을 기본적으로 차단합니다. `WEBHOOK_LOCAL_URLS_ENABLED=true`로 설정하면 이 호출이 허용됩니다.

`.env` 파일에 다음 줄을 추가하세요.

```
WEBHOOK_LOCAL_URLS_ENABLED=true
```

이 설정은 몇 초 안에 적용됩니다. Marinara 서버를 다시 시작할 필요는 없습니다.

### Home Assistant가 다른 기기에서 돌아가는 경우

연동 기능은 사용자 이름이나 비밀번호 없이 Marinara에 접속합니다. 설정 양식에도 이를 입력하는 칸이 없습니다. 그래서 Home Assistant가 어디에서 돌아가는지가 중요합니다.

- Home Assistant와 Marinara가 같은 컴퓨터에서 돌아간다면 별다른 작업 없이 바로 연결됩니다.
- Home Assistant가 다른 기기에서 돌아간다면 Marinara가 기본적으로 연결을 차단합니다. 해당 Home Assistant 기기가 비밀번호 없이 접속할 수 있도록 허용해야 합니다. 한 가지 방법은 Marinara의 `.env` 파일에서 `IP_ALLOWLIST`에 그 기기의 IP 주소를 추가하는 것입니다. IP 주소는 네트워크에서 기기를 가리키는 숫자 주소입니다. 완전히 신뢰할 수 있는 가정용 네트워크라면 대신 `ALLOW_UNAUTHENTICATED_PRIVATE_NETWORK=true`로 설정해도 됩니다.
- Marinara를 `BASIC_AUTH_USER`와 `BASIC_AUTH_PASS`로 보호하고 있다면 연동 기능은 로그인할 수 없습니다. 이때는 같은 컴퓨터에서만, 또는 `IP_ALLOWLIST`에 등록된 기기에서만 동작합니다.

각 설정의 동작 방식과 어느 쪽을 골라야 하는지는 [원격 접근](../REMOTE_ACCESS.md)을 참고하세요.

## Home Assistant에 연동 기능 설치하기

설치는 두 단계로 나뉩니다. 먼저 HACS에 추가한 다음 설정합니다.

### HACS에 추가하기

1. Home Assistant에서 **HACS**를 여세요.
2. 점 세 개 메뉴를 열고 **Custom repositories**를 클릭하세요.
3. 저장소 입력란에 다음 주소를 입력하세요.

```
https://github.com/Pasta-Devs/Marinara-Engine
```

4. 카테고리를 **Integration**으로 지정한 다음 **Add**를 클릭하세요.
5. **Marinara Engine**을 검색한 다음 설치하세요.
6. Home Assistant를 다시 시작하세요.

### 설정하기

1. **Settings**(설정)로 이동한 다음 **Devices & Services**로 들어가 **Add Integration**을 클릭하세요.
2. **Marinara Engine**을 검색하세요.
3. Marinara가 실행 중인 **Host**와 **Port**를 입력하세요. 기본값은 `localhost`와 `7860`입니다.
4. **Submit**을 클릭하세요.

해당 주소에서 Marinara에 접근할 수 없으면 Home Assistant가 오류를 표시하고 설정을 끝내지 못합니다. 아래의 문제 해결을 참고하세요.

## Marinara Engine이 자동으로 만드는 것

설정에 성공하면 연동 기능이 필요한 것을 전부 만들어 둡니다.

- Home Assistant 안에 비공개 웹훅을 등록합니다.
- Marinara의 **Functions** 영역에 스마트홈 도구를 만들고, 각 도구가 그 웹훅을 가리키도록 미리 지정합니다.
- 활성화된 도구를 모두 담은 **Home Assistant** 에이전트를 Marinara에 만듭니다.
- 이 가이드 뒷부분에서 설명하는 Home Assistant 엔티티를 만듭니다.

## 채팅에 Home Assistant 에이전트 추가하기

에이전트를 만들었다고 해서 모든 채팅에 자동으로 붙지는 않습니다. 스마트홈을 제어하려는 채팅마다 직접 추가해야 합니다.

1. 원하는 채팅을 여세요.
2. **Chat Settings**(채팅 설정)를 열고 **Agents**(에이전트) 영역으로 이동하세요.
3. 채팅에 **Home Assistant** 에이전트를 추가하세요.

Home Assistant 에이전트는 Roleplay(롤플레이), Conversation(대화), Game Mode(게임 모드) 채팅에서 동작합니다. 추가하고 나면 그 채팅의 AI가 스마트홈 도구를 자동으로 쓸 수 있습니다. 채팅에서 따로 켜야 하는 항목은 없습니다.

## 설정이 잘 되었는지 확인하기

간단한 요청 하나로 연결을 시험해 봅니다.

1. 위에서 설명한 대로 채팅에 **Home Assistant** 에이전트를 추가하세요.
2. 그 채팅에 평범한 요청을 입력하세요. 예를 들어 `Turn on the office lights`처럼 씁니다.
3. 메시지를 보내세요.

정상이라면 AI가 `ha_turn_on` 같은 스마트홈 도구를 호출하고 해당 조명이 켜집니다. 그다음 AI가 무엇을 했는지 알려 줍니다. 아무 반응이 없으면 `WEBHOOK_LOCAL_URLS_ENABLED=true`가 설정되어 있는지 확인하고 문제 해결을 참고하세요.

## 공개되는 도구 카테고리

연동 기능은 스마트홈 도구를 8가지 카테고리로 묶어 둡니다. 어떤 카테고리를 Marinara가 쓸 수 있게 할지는 직접 고릅니다.

카테고리를 바꾸려면 **Settings**를 열고 **Devices & Services**로 이동한 다음 **Marinara Engine**을 클릭하고 **Configure**를 클릭하세요. 다음 두 가지 옵션이 나타납니다.

- **Primary Chat**: Home Assistant 서비스가 기본으로 대상으로 삼는 채팅입니다. 해당 서비스는 이 가이드 뒷부분에서 설명합니다.
- **Exposed Tool Categories**: Marinara가 쓸 수 있는 도구 카테고리 목록입니다.

아래 표는 각 카테고리와 기본 상태, 포함된 도구를 정리한 것입니다.

| 카테고리 | 기본값 | 도구 |
|---|---|---|
| Lights & Switches | On | ha_turn_on, ha_turn_off, ha_toggle, ha_set_brightness, ha_set_color, ha_set_color_temp |
| Climate | On | ha_set_temperature, ha_set_hvac_mode |
| Covers (Blinds & Garage) | On | ha_open_cover, ha_close_cover, ha_set_cover_position |
| Locks | Off | ha_lock, ha_unlock |
| Media Players | On | ha_media_play, ha_media_pause, ha_set_volume |
| Scenes & Scripts | On | ha_activate_scene, ha_run_script |
| Query | On | ha_get_state, ha_list_areas, ha_list_entities, ha_notify |
| Generic Service Calls (Advanced) | Off | ha_call_service |

**Locks**와 **Generic Service Calls (Advanced)**는 둘 다 기본적으로 꺼져 있습니다. 필요할 때만 켜세요. **Generic Service Calls (Advanced)**는 AI가 Home Assistant의 어떤 서비스든 호출할 수 있게 하므로 신중하게 다뤄야 합니다.

대부분의 도구는 특정 기기 하나 또는 방 이름을 받습니다. 방 이름을 주면 그 방에 있는 해당 기기 전부를 한 번에 조작합니다.

카테고리 변경은 **Marinara Sync HA Tools**를 누르거나 Home Assistant를 다시 시작해야 적용됩니다. 이 버튼은 다음 절에서 설명합니다.

## Home Assistant 엔티티

연동 기능은 **Marinara Engine**이라는 이름의 Home Assistant 기기 아래에 다음 엔티티를 만듭니다.

| 엔티티 | 종류 | 역할 |
|---|---|---|
| Marinara Chat Count | Sensor | Marinara 채팅의 총 개수를 보여 줍니다 |
| Marinara Active Agent Count | Sensor | 활성화된 Marinara 에이전트 수를 보여 줍니다 |
| Marinara Active Chat | Select | Home Assistant 서비스가 대상으로 삼을 채팅을 고릅니다 |
| Marinara Agent: (name) | Switch | Marinara 에이전트 하나를 켜거나 끕니다. 에이전트마다 스위치가 하나씩 있습니다 |
| Marinara Abort Generation | Button | 생성 중인 AI 응답을 취소합니다 |
| Marinara Sync HA Tools | Button | 모든 도구를 다시 보내고 Home Assistant 에이전트를 다시 만듭니다 |

연동 기능은 30초마다 Marinara에 새 채팅과 에이전트가 있는지 확인합니다. Marinara에서 방금 만든 채팅이나 에이전트는 여기에 나타나기까지 최대 30초가 걸릴 수 있습니다.

## Home Assistant 자동화로 Marinara 제어하기

연동 기능은 Home Assistant 서비스를 두 개 추가합니다. 이 서비스는 Marinara가 아니라 Home Assistant 자동화 안에서 씁니다. 둘 다 기본적으로 **Primary Chat**을 대상으로 삼을 수 있습니다.

### Send Message (marinara_engine.send_message)

Marinara 채팅으로 메시지를 보냅니다.

- `message`: 메시지 본문입니다. 필수 항목입니다.
- `chat_id`: 어느 채팅으로 보낼지 지정합니다. 비워 두면 Primary Chat을 씁니다.
- `role`: 메시지를 보낸 주체입니다. `user`, `assistant`, `system`, `narrator` 중 하나를 쓸 수 있습니다. 기본값은 `user`입니다.
- `trigger_generation`: true로 두면 메시지를 보낸 뒤 AI가 답변까지 합니다. 기본값은 false입니다.

현관문이 열리면 AI에 알려 주는 자동화 예시입니다.

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

눈에 보이는 메시지를 보내지 않고도 채팅에서 AI 답변을 시작합니다.

- `chat_id`: 어느 채팅을 쓸지 지정합니다. 비워 두면 Primary Chat을 씁니다.
- `user_message`: 답변 차례에 함께 넣을 메시지입니다. 생략할 수 있습니다.

## 설정을 바꾼 뒤 다시 동기화하기

활성화된 카테고리를 바꿨다면 **Marinara Sync HA Tools**를 눌러 변경 사항을 적용하세요. 이 버튼은 Home Assistant의 **Marinara Engine** 기기 페이지에 있습니다.

**Marinara Sync HA Tools**를 누르면 다음이 이루어집니다.

- 기존 도구를 그 자리에서 갱신해 변경 사항이 Marinara에 반영됩니다.
- Marinara에서 **Home Assistant** 에이전트를 삭제했다면 다시 만듭니다.
- 카테고리를 끈 도구는 비활성화합니다. 도구 자체를 삭제하지는 않습니다.

Marinara 안에서 Home Assistant 도구를 직접 편집하지 마세요. 다음 동기화 때 편집 내용을 덮어쓰고 도구를 다시 켭니다.

## 문제 해결

### 설정 양식에서 연결할 수 없다고 나옵니다

Marinara Engine이 실행 중인지 확인하세요. 입력한 **Host**와 **Port**가 실제로 수신 중인 주소와 일치하는지도 확인하세요. 기본값은 `localhost`와 `7860`입니다.

Home Assistant가 Marinara와 다른 기기에서 돌아간다면 Marinara가 기본적으로 이를 차단합니다. 연동 기능은 비밀번호를 보낼 수 없으므로, Marinara가 비밀번호 없이 그 기기를 받아들이도록 해야 합니다. Marinara의 `.env` 파일에서 `IP_ALLOWLIST`에 Home Assistant 기기의 IP 주소를 추가하세요. 이 방법과 다른 선택지는 [원격 접근](../REMOTE_ACCESS.md)에서 확인할 수 있습니다. `BASIC_AUTH_USER`와 `BASIC_AUTH_PASS`로 보호된 Marinara 역시, 해당 기기가 `IP_ALLOWLIST`에 없으면 연동 기능을 거부합니다.

이 규칙은 설정을 마친 뒤에도 계속 적용됩니다. 나중에 Marinara가 Home Assistant 기기를 차단하면 센서와 채팅 목록이 조용히 갱신을 멈춥니다.

### AI가 기기 도구를 쓰려고 하는데 아무 일도 일어나지 않습니다

웹훅 호출이 차단되었을 가능성이 가장 큽니다. Marinara의 `.env` 파일에 `WEBHOOK_LOCAL_URLS_ENABLED=true`를 추가하고 저장하세요. 몇 초 안에 적용됩니다. 이 설정이 없으면 `http`가 허용되지 않는다거나 사설 주소가 거부되었다는 메시지와 함께 도구 호출이 실패할 수 있습니다.

Marinara와 Home Assistant가 같은 컴퓨터에서 돌아간다면 연동 기능이 웹훅에 내부 주소를 자동으로 씁니다. Marinara가 다른 기기에서 돌아간다면 그 기기에서 Home Assistant의 로컬 네트워크 주소에 접근할 수 있는지 확인하세요.

### Functions 목록에 도구가 나타나지 않습니다

**Marinara Sync HA Tools**를 누르거나 Home Assistant를 다시 시작하세요. 그런 다음 Marinara에서 Presets 패널의 **Functions** 영역을 확인하세요.

### 채팅에 Home Assistant 에이전트가 없습니다

먼저 Marinara의 Agents에 **Home Assistant** 에이전트가 있는지 확인하세요. 없다면 **Marinara Sync HA Tools**를 눌러 다시 만드세요. 그다음 **Chat Settings**를 열고 **Agents** 영역으로 이동해 그 채팅에 **Home Assistant** 에이전트를 추가하세요.

### 웹훅 주소를 직접 찾기

각 도구에 주소가 이미 지정되어 있으므로 이 작업이 필요한 경우는 드뭅니다. 주소를 확인하려면 Home Assistant에서 **Settings**를 열고 **Devices & Services**로 이동한 다음 **Marinara Engine**을 여세요. 웹훅은 다음 형태를 씁니다. 여기서 8123은 Home Assistant의 기본 포트입니다.

```
http://<homeassistant-ip>:8123/api/webhook/<webhook-id>
```

## 제거하기

연동 기능을 없애려면 Home Assistant에서 **Settings**를 열고 **Devices & Services**로 이동한 다음 **Marinara Engine**에서 삭제하세요. 이렇게 하면 Home Assistant 엔티티가 사라집니다. Marinara의 **Functions** 영역에 만들어진 도구는 Marinara에 그대로 남습니다. **Home Assistant** 에이전트도 마찬가지입니다. 더 이상 쓰지 않는다면 Marinara에서 둘 다 직접 삭제하세요.

## 관련 가이드

- [사용자 지정 도구](../extending/custom-tools.md)
- [에이전트: 채팅을 도와주는 AI](../agents/agents-overview.md)
- [서버 설정](../CONFIGURATION.md)
- [원격 접근](../REMOTE_ACCESS.md)
