# Conversation Mode 프로필(Display Name, About Me, Behavior)

이 가이드에서는 Conversation Mode(대화)의 모든 캐릭터와 페르소나가 갖는 작은 프로필을 설명합니다. 프로필은 표시 이름, "about me" 소개글, 행동 지시문 3가지로 이루어집니다. 이 입력란들은 채팅 앱의 프로필(Discord를 떠올리면 됩니다)과 비슷하게 동작합니다. Conversation Mode에서만 적용되고 Roleplay(롤플레이)나 Game Mode(게임 모드)에서는 전혀 쓰이지 않습니다.

Conversation Mode는 DM이나 메신저 형태의 채팅입니다. 처음이라면 [Conversation Mode: 시작하기](getting-started.md)를 먼저 읽으세요. 페르소나는 채팅에서 `{{user}}` 자리를 대신하는 프로필입니다.

## 이 입력란이 있는 곳

프로필 입력란은 모두 **Convo** 탭에 있습니다. 캐릭터와 페르소나 양쪽 모두 이 탭이 있습니다.

1. 캐릭터의 프로필을 편집하려면 **Character Editor**(캐릭터 편집기)에서 캐릭터를 열고 **Convo** 탭을 클릭하세요.
2. 페르소나의 프로필을 편집하려면 **Persona Editor**(페르소나 편집기)에서 페르소나를 열고 **Convo** 탭을 클릭하세요.

**Convo** 탭에는 **Convo Display Name**(Conversation 표시 이름), **About Me**(내 소개), **Convo Behavior**(Conversation 동작) 3가지 입력란이 있습니다. 캐릭터와 페르소나가 동일하며, 아래에서 설명하는 작은 차이 하나만 있습니다.

## Convo Display Name

**Convo Display Name**은 Conversation Mode 채팅에서 이 캐릭터나 페르소나에게 표시되는 이름입니다. 비워 두면 카드 이름을 그대로 씁니다. 이름을 바꾸면 이미 주고받은 메시지의 이름도 즉시 바뀝니다. Conversation Mode에만 영향을 줍니다.

캐릭터에는 **Declare this name on the card in the prompt**(프롬프트에서 카드에 이 이름을 명시합니다) 체크박스가 하나 더 있습니다. 페르소나에는 없습니다. 이 체크박스를 켜면 Marinara가 캐릭터의 카드 텍스트에 짧은 한 줄을 덧붙입니다. 그 줄은 어떤 카드가 어떤 표시 이름으로 보이는지 모델에 알려 줍니다. 이 체크박스를 쓰려면 표시 이름을 먼저 설정해야 합니다.

`{{convo_display}}` 매크로는 응답하는 캐릭터의 표시 이름을 사용자 지정 프롬프트에 넣습니다. 매크로는 `{{convo_display}}`처럼 실제 텍스트로 바뀌는 자리 표시자입니다. Conversation Mode 밖에서는 아무 값도 남기지 않습니다. [매크로](../prompts/macros.md)를 참고하세요.

## About Me

**About Me**는 캐릭터나 페르소나가 직접 쓴 짧은 소개글이며 Conversation Mode에 표시됩니다. 한두 줄이어도 되고, 이모지 하나, 농담 한마디여도 되고, 아예 비워 두어도 됩니다. 텍스트 상자 툴바에 이모지 버튼이 있어서 소개글에 이모지를 바로 넣을 수 있습니다.

소개글은 단순한 장식이 아닙니다. 기본적으로 Marinara는 매 턴마다 그 자리에 있는 모든 캐릭터와 페르소나의 **About Me**를 프롬프트에 추가합니다. 소개글은 참가자 프로필을 짧게 나열한 목록 형태로 들어갑니다. 덕분에 모델은 각자가 스스로를 어떻게 소개하는지 항상 알고 있습니다. 이 동작을 위해 따로 할 일은 없습니다.

### Professor Mari로 About Me 쓰기

소개글을 직접 쓰지 않아도 됩니다. 홈 화면에서 Professor Mari를 열고 특정 캐릭터나 페르소나의 **About Me**를 써 달라고 하거나 고쳐 달라고 하세요. Professor Mari는 저장된 프로필을 먼저 읽고, 그 캐릭터의 말투로 짧은 자기소개를 쓴 다음 실제 **About Me** 입력란에 바로 저장합니다.

예를 들어 `Write Luna's About Me as a cryptic one-line bio.`처럼 요청하면 됩니다. 이미 있는 소개글을 더 재미있게, 더 짧게, 더 따뜻하게, 또는 카드에 더 충실하게 고쳐 달라고 할 수도 있습니다.

Professor Mari는 평소 설정된 모델을 그대로 씁니다. 캐릭터 편집기와 페르소나 편집기에는 About Me 전용 연결이나 소스 선택기, 생성 버튼이 따로 없습니다. Professor Mari가 저장한 변경은 평소와 같은 검토 흐름에 나타나므로 그대로 두거나 되돌릴 수 있습니다. 편집기에서 직접 고친 내용에는 여전히 **Revert**(되돌리기)가 표시되며, 현재 편집을 시작하기 전 텍스트로 되돌립니다.

## Convo Behavior

**Convo Behavior**는 캐릭터나 페르소나가 Conversation Mode에서 어떻게 행동할지 자유롭게 적는 지시문입니다. 예를 들어 답장을 짧게 소문자로 유지하고, 나레이터가 아니라 실제 사람처럼 메시지를 보내라고 적을 수 있습니다. Roleplay나 Game Mode에서는 절대 전송되지 않습니다.

### Insertion(지시문이 들어가는 위치)

**Convo Behavior** 상자 아래에는 **Insertion**(삽입) 드롭다운이 있습니다. 이 지시문을 프롬프트의 어느 위치에 넣을지 정하는 설정입니다. 선택지는 다음과 같습니다.

- "after the card"로 표시된 **Constant** 옵션(기본값): 항상 추가되며 카드 텍스트 바로 뒤에 들어갑니다.
- "before the card"로 표시된 **Constant** 옵션: 항상 추가되며 카드 텍스트 바로 앞에 들어갑니다.
- **Append to post-history**: post-history 지시문 끝에 덧붙입니다.
- **Prepend to post-history**: post-history 지시문 맨 앞에 붙입니다.
- **Replace post-history**: post-history 지시문 대신 사용합니다.
- **Only where `{{convo_behavior}}` is placed**: 사용자 지정 프롬프트에서 `{{convo_behavior}}` 매크로를 넣어 둔 자리에만 삽입합니다.

post-history 지시문은 최근 채팅 기록 뒤에 앱이 배치하는 프롬프트 텍스트입니다. 프롬프트를 직접 작성하는 것이 아니라면 기본값 그대로 두세요.

## 채팅별 About Me 재정의

카드의 **About Me**는 어디서나 쓰이는 기본 소개글입니다. 특정 채팅 하나에만 다른 소개글을 지정할 수도 있습니다. 이것이 채팅별 재정의이며, 프로필 팝업에서 설정합니다.

1. Conversation Mode 채팅에서 캐릭터나 페르소나의 아바타 또는 이름을 클릭하세요.
2. 아바타 옆에 작은 프로필 카드가 열립니다. 모바일에서는 화면 아래에서 위로 올라옵니다.
3. 카드에는 크게 표시된 아바타, 이름, 현재 **About Me**가 보입니다.
4. 카드의 소개글이 표시되는 중이면 **Default** 배지가, 채팅별 재정의를 쓰는 중이면 **Chat-specific**(채팅별) 배지가 붙습니다. 캐릭터는 여기에 상태도 함께 표시합니다. **Online**, **Away**, **Busy**, **Offline** 중 하나입니다.

재정의를 설정하는 방법은 다음과 같습니다.

1. 팝업에서 **Edit**(편집)를 클릭하세요.
2. 이 채팅에서 쓸 소개글을 입력하세요. **Custom emojis**(사용자 지정 이모지) 탭이 포함된 이모지 선택기를 쓸 수 있습니다.
3. **Save**(저장)를 클릭하세요. 채팅별 **About Me**를 저장했다는 안내가 나타납니다.

편집하는 동안 **Revert** 버튼은 저장하지 않은 변경을 되돌리고, **Cancel**(취소)은 저장하지 않고 편집 모드를 닫습니다. 재정의가 있을 때는 **Clear**(지우기) 버튼으로 지우고 카드 기본값으로 돌아갈 수 있습니다. 빈 소개글을 저장해도 재정의가 사라집니다. 기본 **About Me**는 카드에서 편집하고, 재정의는 그 채팅 하나에만 적용된다는 점을 기억하세요.

## 캐릭터가 필요할 때 스스로 About Me 바꾸게 하기

캐릭터가 대화 도중 직접 자기 소개글을 바꿀 수 있는 도구도 있습니다. 이름은 **update_about_me**입니다. 기본값은 꺼짐입니다. **Chat Settings**(채팅 설정)의 **Function Calling**(기능 호출) 섹션에서 켜세요. **Enable Tool Use**(도구 사용 활성화)를 켜고 **update_about_me** 도구를 추가하면 됩니다.

이 도구를 켜면 캐릭터는 두 가지 방식 중 하나로 자기 소개글을 바꿀 수 있습니다.

- Public 범위는 모든 채팅에 보이는 실제 소개글을 바꿉니다. 이 변경은 먼저 승인 요청으로 표시됩니다.
- Chat 범위는 현재 채팅에만 적용되는 소개글을 바꿉니다.

## 사용자 지정 프롬프트에서 프로필 활용하기

프로필 값이 모델에 전달되는 데 매크로가 꼭 필요하지는 않습니다. **About Me** 소개글은 프롬프트에 자동으로 추가되고, **Convo Behavior**는 **Insertion** 설정을 따릅니다. 매크로는 사용자 지정 프롬프트에서 값을 원하는 위치에 직접 놓고 싶을 때 쓰는 것입니다.

매크로 4가지로 이 프로필 값을 본문에 바로 넣을 수 있습니다. 모두 Conversation Mode 밖에서는 아무 값도 남기지 않습니다.

- `{{convo_display}}`: 응답하는 캐릭터의 표시 이름.
- `{{char_about}}`: 캐릭터에 실제로 적용되는 **About Me**.
- `{{persona_about}}`: 페르소나에 실제로 적용되는 **About Me**.
- `{{convo_behavior}}`: 캐릭터의 **Convo Behavior** 지시문.

전체 매크로 목록은 [매크로](../prompts/macros.md)를 참고하세요.

## 관련 가이드

- [Conversation Mode: 시작하기](getting-started.md)
- [캐릭터 만들기와 편집](../characters/creating-and-editing-characters.md)
- [사용자 페르소나: 만들기 및 편집](../characters/personas.md)
- [다운로드 가능한 에이전트 레퍼런스](../agents/built-in-agents.md)
- [매크로](../prompts/macros.md)
