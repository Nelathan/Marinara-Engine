# SillyTavern에서 가져오기

이 가이드에서는 SillyTavern의 데이터를 Marinara Engine으로 옮기는 방법을 설명합니다. 파일을 하나씩 가져올 수도 있고, SillyTavern 폴더 전체를 검사해서 한 번에 모두 가져올 수도 있습니다.

## 옮길 수 있는 것

Marinara Engine이 가져올 수 있는 SillyTavern 데이터는 다음과 같습니다.

- 캐릭터(캐릭터 카드)
- 채팅(메시지 기록)
- 그룹 채팅(캐릭터가 둘 이상인 채팅)
- 프리셋(생성 설정)
- 로어북(SillyTavern에서는 "World Info"라고 부릅니다)
- 배경(채팅 배경 이미지)
- 페르소나(**{{user}}** 프로필)

로어북은 채팅에 특정 단어가 나올 때 AI가 읽는 메모 모음입니다. 프리셋은 생성 설정을 한데 저장해 둔 것입니다. 페르소나는 채팅에서 나를 대신하는 프로필입니다.

가져오는 방법은 두 가지입니다. 파일 하나만 옮길 때는 단일 파일 버튼을 쓰고, SillyTavern 설치본 전체를 한 번에 옮길 때는 **Import from SillyTavern Folder**(SillyTavern 폴더에서 가져오기) 마법사를 씁니다.

## 파일 하나씩 빠르게 가져오기

**Settings**(설정)를 열고 **Imports**(가져오기) 탭으로 이동한 다음 **SillyTavern Import**(SillyTavern 가져오기) 항목을 찾으세요. 설명에는 "Bring over characters, chats, presets, and lorebooks from SillyTavern files."라고 적혀 있습니다.

이 항목에는 파일 하나짜리 버튼이 네 개 있습니다. 각 버튼을 누르면 별다른 선택지 없이 일반 파일 선택 창이 열립니다.

- **Import Character (JSON/PNG)**(캐릭터 가져오기): `.json` 또는 `.png` 캐릭터 카드를 받습니다.
- **Import Chat (JSONL)**(채팅 가져오기): `.jsonl` 채팅 기록을 받습니다. 항상 **Roleplay** 채팅으로 만들고 그 채팅으로 이동합니다.
- **Import Preset (JSON)**(프리셋 가져오기): `.json` 프리셋 파일을 받습니다.
- **Import Lorebook (JSON)**(로어북 가져오기): `.json` World Info 파일을 받습니다.

JSONL은 한 줄에 JSON 기록 하나가 들어가는 형식입니다. SillyTavern이 채팅 기록을 저장할 때 쓰는 형식입니다.

로어북이 내장된 카드를 가져오면 브라우저 확인 창이 뜹니다. 그 로어북을 Marinara의 독립 로어북으로도 가져올지 묻는 내용입니다. **OK**를 클릭하면 World Info가 따로 재사용할 수 있는 로어북으로 남습니다. **Cancel**(취소)을 클릭하면 그 단계를 건너뛰고 캐릭터만 가져옵니다.

이 빠른 버튼들은 여기서 바꿀 수 없는 고정 기본값을 씁니다. 원본 태그를 모두 유지하고, 정규식 스크립트는 해당 캐릭터에만 적용되도록 범위를 지정합니다. 정규식 스크립트는 AI가 글을 보기 전이나 본 뒤에 텍스트를 바꾸는 찾아 바꾸기 규칙입니다. 이런 선택지를 직접 고르려면 대신 Characters 패널의 **Import** 버튼을 쓰세요. [캐릭터 카드 가져오기와 내보내기](../characters/import-export.md) 문서를 참고하세요.

### 원하는 모드로 채팅 가져오기

위에서 설명한 단일 파일 **Import Chat (JSONL)** 버튼은 항상 **Roleplay** 채팅을 만듭니다. 다른 모드로 채팅을 넣고 싶다면 채팅 목록 위쪽에 있는 작은 가져오기 버튼을 쓰세요. 툴팁에는 **Import SillyTavern or Marinara chat JSONL**이라고 표시됩니다. 이 버튼은 현재 열어 둔 모드 탭으로 파일을 가져옵니다. Conversation(대화), Roleplay(롤플레이), Game 어느 쪽이든 마찬가지입니다. 채팅 가져오기와 내보내기에 대한 자세한 내용은 [채팅 내보내기와 가져오기](../chats/export-import.md) 문서를 참고하세요.

## Import from SillyTavern Folder

이 마법사는 SillyTavern 폴더 전체를 검사해서 여러 항목을 한 번에 가져옵니다. 캐릭터, 채팅, 그룹 채팅, 프리셋, 로어북, 배경, 페르소나를 함께 읽습니다.

열려면 **Settings**로 이동해 **Imports**를 누르고, **SillyTavern Import** 항목에서 **Import from SillyTavern Folder**를 클릭하세요. **Import from SillyTavern**(SillyTavern에서 가져오기)이라는 제목의 창이 열립니다.

### 1단계: SillyTavern 폴더 지정하기

1. **SillyTavern Folder Path**(SillyTavern 폴더 경로) 입력란에 SillyTavern 폴더 경로를 입력하세요. 예를 들면 `/path/to/SillyTavern`입니다.
2. 또는 **Browse**(찾기)를 클릭해 컴퓨터의 폴더 선택 창으로 폴더를 고르세요. 폴더 선택 창이 없는 원격 서버나 헤드리스 서버에서는 대신 앱 안의 폴더 브라우저가 열리고, **Select This Folder**(이 폴더 선택) 버튼이 함께 표시됩니다.
3. SillyTavern의 최상위 폴더를 지정하세요. 창의 안내에 따르면 보통 안에 `data/`나 `public/` 폴더가 들어 있는 폴더입니다.
4. **Scan Folder**(폴더 스캔)를 클릭하세요. 작업 중에는 버튼에 **Scanning...**이 표시됩니다.

검사가 끝나면 Marinara가 각 분류에서 몇 개를 찾았는지 알려 줍니다. 폴더를 읽지 못하면 "Could not find SillyTavern data directory."처럼 오류가 표시됩니다.

### 2단계: 가져올 항목 고르기

다음 화면의 제목은 **Choose exactly what to import**입니다. **Characters**(캐릭터), **Chats**(채팅), **Group Chats**(그룹 채팅), **Presets**(프리셋), **Lorebooks**(로어북), **Backgrounds**(배경), **Personas**(페르소나) 분류마다 체크 목록이 나옵니다. 선택한 항목 수는 카운터에 표시됩니다.

각 분류에는 **All** 버튼과 **None** 버튼이 있고, **Show**(보기)/**Hide**(숨기기) 토글로 개별 항목과 날짜를 펼쳐 볼 수 있습니다.

거의 모든 항목이 처음부터 선택되어 있습니다. 예외는 SillyTavern에 기본으로 들어 있는 프리셋입니다. Marinara가 이를 알아채고 선택하지 않은 상태로 두며, 이유는 배너로 설명합니다. `default`, `deterministic`, `neutral`, `universal-*` 같은 기본 제공 프리셋이 여기에 해당합니다. 사본이 꼭 필요한 경우가 아니라면 선택하지 않은 채로 두세요.

검사 결과에 캐릭터가 있으면 추가 컨트롤이 두 개 나타납니다.

- **Imported character tags**(가져온 캐릭터 태그): 태그 가져오기 방식을 정합니다. 원본 태그를 유지하려면 **All tags**, 태그를 건너뛰려면 **No tags**, Marinara에 이미 있는 태그만 남기려면 **Existing only**를 고르세요. 기본값은 **All tags**입니다.
- **Imported regex scripts**(가져온 정규식 스크립트): 정규식 스크립트가 적용될 범위를 정합니다. 스크립트를 각 봇에만 적용하려면 **Character only**, 모든 채팅에 적용되도록 **Presets -> Regexes**에 추가하려면 **Global**을 고르세요. 기본값은 **Character only**입니다.

선택이 끝났으면 **Import Selected**(선택 항목 가져오기)를 클릭하세요. **Back**(뒤로)을 클릭하면 폴더 지정 단계로 돌아갑니다.

### 3단계: 진행 상황 확인하기

Marinara는 항목을 하나씩 가져옵니다. 화면에는 스피너, 현재 분류와 항목 이름, 진행 막대, 분류별 누적 개수가 표시됩니다.

### 4단계: 결과 확인하기

마지막 단계에서는 가져오기가 성공하면 **Import complete!** 배너가, 실패하면 오류 배너가 표시됩니다. 성공한 경우 분류마다 카드가 나타나 최종 개수를 보여 줍니다. 개별 항목이 실패했다면 경고 목록에 실패 하나당 한 줄씩 `Character "Foo": error message`처럼 표시됩니다. **Done**(완료)을 클릭하면 창이 닫힙니다.

### 마법사가 데이터를 처리하는 방식

- 가져오기는 항목 단위로 최선을 다해 진행합니다. 캐릭터, 채팅, 프리셋, 로어북, 배경, 페르소나 중 하나가 실패하면 Marinara는 그 항목을 건너뛰고 경고를 기록한 뒤 나머지 작업을 계속합니다.
- 한 캐릭터에 속한 채팅 파일이 여러 개면 별개의 채팅이 아니라 하나의 채팅의 분기로 가져옵니다.
- 그룹 채팅은 항상 **Roleplay** 채팅으로 들어옵니다.
- 가져온 항목은 원본 파일의 마지막 변경 날짜를 Marinara에서의 날짜로 그대로 씁니다. 가져오기를 실행한 시각을 쓰지 않습니다.

## 접근 권한과 폴더 규칙

단일 파일 가져오기 버튼은 별도 설정 없이 누구나 쓸 수 있습니다.

**Import from SillyTavern Folder** 마법사는 디스크에서 파일을 읽기 때문에 관리자 권한이 필요합니다. 서버와 같은 컴퓨터(루프백)에서는 별도 설정 없이 동작합니다. 다른 기기나 브라우저에서 쓰려면 서버에 관리자 시크릿을 설정해야 합니다. 그런 다음 같은 값을 **Settings -> Advanced -> Admin Access**에 저장하세요. 관리자 시크릿을 설정하는 방법은 [서버 설정 참고 문서](../CONFIGURATION.md)를 참고하세요.

서버에 `IMPORT_ALLOWED_ROOTS`가 설정되어 있으면 Marinara는 그 폴더 바깥의 경로를 직접 입력했을 때 거부합니다. **Browse**나 앱 안의 폴더 브라우저로 고른 경로는 이 설정이 켜져 있어도 항상 동작합니다.

## 옮겨지지 않는 것

폴더 마법사는 위에 나열한 7가지 분류만 검사합니다. 앱 전역 설정이나 빠른 답장 같은 그 밖의 SillyTavern 데이터는 읽지 않고 가져오지도 않습니다.

SillyTavern에 기본으로 들어 있는 프리셋은 처음부터 선택되지 않은 상태이므로 직접 선택하지 않는 한 옮겨지지 않습니다.

변환에 실패한 항목은 Marinara가 건너뜁니다. 무엇이 빠졌는지는 마법사 마지막 단계의 경고 목록에서 정확히 확인할 수 있습니다.

## 관련 가이드

- [캐릭터 카드 가져오기와 내보내기](../characters/import-export.md)
- [로어북 가져오기와 내보내기](../lorebooks/import-export.md)
- [채팅 내보내기와 가져오기](../chats/export-import.md)
- [정규식 스크립트](../extending/regex-scripts.md)
