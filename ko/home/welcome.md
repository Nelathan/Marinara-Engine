# Marinara Engine 시작하기

Marinara Engine에 오신 것을 환영합니다. 이 가이드에서는 이 앱이 어떤 프로그램인지, 홈 화면에 무엇이 있는지, 첫 채팅을 시작하기까지 무엇을 해야 하는지 설명합니다. 앱을 처음 쓰는 분을 기준으로 썼기 때문에 미리 알아야 할 설정 지식은 없습니다.

## Marinara Engine이란

Marinara Engine은 AI 캐릭터와 채팅하고 롤플레이하는 로컬 앱입니다. 내 컴퓨터에서 직접 돌아가고, 원하는 AI 서비스에 연결해서 씁니다. 캐릭터를 만들거나 가져온 다음, 채팅 방식을 고르고 대화하면 됩니다. Marinara는 AI를 직접 돌리지 않습니다. 그래서 가장 먼저 할 일은 연결을 추가하는 것입니다. 대부분은 온라인 AI 제공자에 연결합니다. 앱에 내장된 작은 **Local Model**(로컬 모델)을 다운로드해서 쓸 수도 있습니다. 다만 가벼운 보조 작업에 적합하고 주력 채팅용으로는 부족합니다. [Local Model 설정](../connections/local-model.md)을 참고하세요. 이 첫 설정만 마치면 나머지는 모두 앱 안에서 해결됩니다.

## 홈 화면 한눈에 보기

홈 화면은 열려 있는 채팅이 없을 때 보이는 화면입니다. 위에서 아래로 다음 요소가 있습니다.

- 앱 로고, **Marinara Engine**이라는 글자, 그 아래의 버전 번호.
- 최근 채팅 목록. 최대 3개까지 칩 형태로 보이고, 클릭하면 그 채팅이 다시 열립니다. 아직 채팅이 없으면 이 줄에 "No chats yet"이 표시됩니다.
- **Ask Professor Mari**(Professor Mari에게 묻기) 카드. 앱 사용법을 설명하고 설정을 도와주는 내장 어시스턴트와 이야기하는 입력 상자입니다. 옆에는 자주 나오는 질문과 답을 모은 짧은 **FAQ**가 있습니다.
- **Achievements**(업적) 버튼. Achievements 설정을 켰을 때만 보입니다.
- 아래쪽 바닥글의 버튼들: **Discord**, **Support**(지원), **Credits**(크레딧), **Documentation**(문서), **Replay Tutorial**(튜토리얼 다시 보기).

Marinara를 처음 열면 짧은 안내 투어가 주요 버튼과 채팅 모드를 하나씩 짚어 줍니다. 전체 과정은 [첫 실행 튜토리얼](tutorial.md)에서 볼 수 있습니다.

## 첫 단계

첫 채팅까지 가는 과정입니다. 순서대로 따라 하세요.

1. Marinara Engine을 설치하고 브라우저에서 여세요. [Marinara Engine 설치](../INSTALLATION.md)에서 사용 중인 플랫폼을 고르세요.
2. 앱이 AI 서비스에 접속할 수 있도록 연결을 추가하세요. 연결에는 제공자, API 키, 모델이 함께 저장됩니다. API 키는 AI 제공자에게서 받는 비밀 문자열이며, 비밀번호와 비슷한 역할을 합니다. [AI 제공자에 연결하기](../connections/connecting-to-a-provider.md)를 참고하세요.
3. 대화할 캐릭터를 만들거나 가져오세요. **Characters**(캐릭터) 패널을 열고 **New**(새로 만들기)를 클릭하면 **Create Character**(캐릭터 만들기) 창이 열립니다. 파일로 된 캐릭터 카드를 불러오려면 **Import**(가져오기)를 클릭하세요. [캐릭터 만들기와 편집](../characters/creating-and-editing-characters.md)을 참고하세요.
4. 채팅을 시작하세요. 채팅 사이드바에서 모드 탭을 고른 다음 **+** 버튼을 클릭하세요. 버튼 이름은 선택한 탭에 따라 **New Conversation**(새 대화), **New Roleplay**(새 롤플레이), **New Game**(새 게임)으로 바뀝니다. 새 채팅이 열리면서 나머지 과정을 안내하는 설정 창이 함께 뜹니다. 저장해 둔 연결이 아직 없으면 **Set Up Conversation**, **Set Up Roleplay**, **Set Up Game** 창이 먼저 나타납니다. 여기서 연결을 고르고 **Create Chat**(채팅 생성)을 클릭하세요.

중간에 막히는 부분이 있으면 내장 어시스턴트에게 물어보세요. 무엇을 해 줄 수 있는지는 [Professor Mari, 앱 안의 어시스턴트](professor-mari.md)에 정리되어 있습니다.

## 채팅 모드 3가지

Marinara에는 채팅 모드가 3가지 있습니다. 새 채팅을 시작할 때 하나를 고릅니다.

- **Conversation**(대화): 롤플레이 요소가 없는 단순하고 직접적인 AI 채팅입니다. 화면은 메신저 앱처럼 생겼습니다. [Conversation Mode: 시작하기](../conversation/getting-started.md)를 참고하세요.
- **Roleplay**(롤플레이): 캐릭터, 장면 추적, 세계 상태를 갖춘 몰입형 롤플레이입니다. [Roleplay Mode: 시작하기](../roleplay/getting-started.md)를 참고하세요.
- **Game**: AI 게임 마스터(GM)가 진행하는 1인용 롤플레잉 게임입니다. 파티, 주사위, 지도, 퀘스트가 등장합니다. [Game Mode: 시작하기](../game/getting-started.md)를 참고하세요.

## 도움받는 곳

앱을 벗어나지 않고도 도움을 받을 방법이 여러 가지 있습니다.

- 홈 화면의 **Professor Mari**에게 설정 방법과 사용법을 물어보세요.
- 홈 화면의 **FAQ**에서 자주 나오는 질문의 답을 바로 확인하세요.
- 홈 화면 바닥글의 **Documentation** 버튼으로 앱 안의 가이드를 여세요.
- 바닥글의 **Discord**를 클릭하면 커뮤니티로 연결되고, **Support**를 클릭하면 프로젝트를 후원할 수 있습니다.

무언가 고장 났거나 제대로 동작하지 않으면 [Marinara Engine 문제 해결](../TROUBLESHOOTING.md)을 참고하세요.

## 관련 가이드

- [Marinara Engine 설치](../INSTALLATION.md)
- [AI 제공자에 연결하기](../connections/connecting-to-a-provider.md)
- [캐릭터 만들기와 편집](../characters/creating-and-editing-characters.md)
- [첫 실행 튜토리얼](tutorial.md)
- [Professor Mari, 앱 안의 어시스턴트](professor-mari.md)
- [Conversation Mode: 시작하기](../conversation/getting-started.md)
- [Roleplay Mode: 시작하기](../roleplay/getting-started.md)
- [Game Mode: 시작하기](../game/getting-started.md)
