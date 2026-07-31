# Memory Recall과 채팅 요약

채팅이 길어져서 AI 모델이 한 번에 읽을 수 있는 분량을 넘어가면 앞의 내용이 흐트러지기 쉽습니다. 이 가이드에서는 그런 상황에서 Marinara Engine이 이야기의 흐름을 지켜 주는 방법을 설명합니다. 지난 메시지를 의미로 검색하는 **Memory Recall**(기억 회상), Roleplay 채팅용 **Chat Summary**(채팅 요약), Conversation 채팅용 **Automatic Summarization**(자동 요약)을 다룹니다.

## 두 가지 기억 기능

AI 모델은 한 번에 정해진 분량의 글만 읽을 수 있습니다. 이 한계를 컨텍스트 창이라고 부릅니다. 채팅이 길어지면 오래된 메시지부터 컨텍스트 창 밖으로 밀려나고, AI는 그 내용을 잊어버립니다. Marinara Engine(이하 Marinara)에는 이 문제를 해결하는 기능이 두 가지 있습니다.

- **Memory Recall**은 방금 입력한 내용과 가장 관련이 깊은 부분을 지난 메시지에서 찾아내 프롬프트에 조용히 되돌려 놓습니다. 모든 채팅 모드에서 작동합니다.
- 요약은 오래된 메시지를 짧은 줄거리로 압축해서 프롬프트에 원본 메시지 대신 넣습니다. Roleplay 채팅은 **Chat Summary**를, Conversation 채팅은 **Automatic Summarization**을 사용합니다.

Game Mode 채팅에서는 **Memory Recall**만 쓸 수 있습니다. 두 요약 기능은 모두 없습니다.

두 기능은 함께 켜 두어도 됩니다. 하는 일이 서로 달라서 충돌하지 않습니다.

## Memory Recall 설정

**Memory Recall**은 채팅 앞부분에서 관련 있는 조각을 찾아 기억으로 프롬프트에 주입합니다. 이때 임베딩을 사용합니다. 임베딩은 메시지의 의미를 숫자로 나타낸 지문 같은 것입니다. Marinara는 새 메시지의 지문을 저장해 둔 지난 메시지의 지문과 비교한 뒤, 가장 가까운 것을 골라 넣습니다.

### Memory Recall 켜기

1. 채팅을 열고 채팅 헤더의 **Chat Settings**(채팅 설정) 버튼을 클릭하세요.
2. **Memory Recall** 섹션을 찾으세요. 두뇌 모양 아이콘이 붙어 있습니다.
3. **Enable Memory Recall**(이전 기억 불러오기) 토글을 켜세요.

**Enable Memory Recall**은 채팅마다 따로 저장되는 설정입니다. 기본값은 모드에 따라 다릅니다.

- Conversation 채팅에서는 기본으로 켜져 있습니다.
- 장면이 활성화되어 있는 Roleplay 또는 Game 채팅에서도 기본으로 켜져 있습니다.
- 그 밖의 채팅에서는 기본으로 꺼져 있습니다.

토글을 끄면 불러온 기억이 프롬프트에 들어가지 않습니다. 이미 저장된 내용이 지워지지는 않습니다.

### 임베딩 소스

Memory Recall이 의미 지문을 만들려면 임베딩 소스가 필요합니다. 임베딩 소스는 채팅 설정이 아니라 연결에서 지정합니다. 연결은 AI 제공자에 접속하는 데 필요한 정보를 한데 저장해 둔 것입니다.

1. **Connections**(연결) 패널을 열고 연결을 편집하세요.
2. **Semantic Search (Embeddings)**(시맨틱 검색) 섹션을 찾으세요.
3. 모델 입력란에 임베딩 모델 이름을 입력하세요. 예를 들면 `text-embedding-3-small`입니다.
4. 주소를 따로 지정하려면 **Embedding Endpoint URL**(임베딩 엔드포인트 URL)을 입력하세요.
5. 다른 연결의 키와 주소를 빌려 쓰려면 **Embedding Connection**(임베딩 연결) 드롭다운을 사용하세요. **Same as this connection**과 **Local Model (sidecar)** 등을 고를 수 있습니다.

임베딩을 제공하지 않는 제공자도 있습니다. 그럴 때 Marinara는 임베딩 전용 연결을 고르라는 안내를 표시합니다. OpenAI 호환 연결, Google, Local Model 중에서 선택하면 됩니다.

임베딩 연결을 전혀 지정하지 않으면 Marinara는 내장 로컬 임베딩 모델로 대체합니다. 이 모델은 처음 한 번만 다운로드하고 이후에는 컴퓨터에서 직접 실행되며, API 키도 필요 없습니다. 내장 모델은 [Local Model 설정](../connections/local-model.md)에서 더 자세히 확인할 수 있습니다.

같은 **Semantic Search (Embeddings)** 설정이 로어북 시맨틱 검색에도 쓰입니다. 한 번만 설정해 두면 두 기능에 모두 적용됩니다.

### Memories for This Chat

채팅이 무엇을 기억하고 있는지 보려면 **Chat Settings**를 열고 **Memory Recall** 섹션에서 **Access memories for this chat**(이 채팅의 기억에 접근)을 클릭하세요. **Memories for This Chat**(이 채팅의 기억) 창이 열립니다.

이 창에는 저장된 기억 조각의 개수와 대략적인 토큰 추정치가 표시됩니다. 각 조각 카드에는 포함하는 날짜 범위, 메시지 개수, 상태, 만들어진 시각이 나옵니다. 상태는 다음 세 가지 중 하나입니다.

- **Vectorized**: 지문이 만들어져 검색할 준비가 끝났습니다.
- **Waiting for vector**: 지문을 아직 만드는 중입니다.
- **Embedding unavailable**: 지문을 만들 임베딩 소스가 없습니다.

도구 모음에는 기억 내보내기, 기억 가져오기, 기억 다시 만들기, 전체 삭제 아이콘이 있습니다. 조각마다 붙어 있는 휴지통 아이콘으로 그 조각만 지울 수도 있습니다.

- 조각의 휴지통 아이콘을 클릭하면 **Forget Memory**(기억 잊기) 창이 열립니다. **Forget**(잊기)을 눌러 확인하세요.
- 전체 삭제 휴지통 아이콘을 클릭하면 **Clear Memories**(기억 지우기) 창이 열립니다. **Clear**(지우기)를 눌러 확인하세요. 불러오기용 기억만 지워지고 채팅 메시지는 남습니다.
- 새로고침 아이콘은 현재 채팅 메시지를 바탕으로 모든 기억 조각을 다시 만듭니다. 임베딩 모델을 바꾼 뒤에 사용하세요.
- 내보내기는 `.marinara.json` 파일로 저장합니다. 가져오기는 `.json` 또는 `.marinara` 파일을 받아 기존 기억에 합칩니다.

### Memory Recall의 동작 방식

다음 내용을 기억해 두면 좋습니다.

- Marinara는 임베딩 소스만 있으면 **Enable Memory Recall**이 꺼져 있어도 백그라운드에서 기억 조각을 저장합니다. 토글은 저장된 기억을 주입할지만 결정합니다. 저장 자체를 멈추려면 임베딩 소스를 지우거나 기억을 이따금 비우세요.
- 새 메시지가 5개는 모여야 조각 하나가 만들어집니다. 그보다 적으면 다음 답변까지 기다립니다.
- 불러온 조각은 유사도 검사를 통과할 만큼 관련이 깊어야 합니다. 관련성이 약하면 건너뛰기 때문에, 기억이 있어도 아무것도 불러오지 않을 수 있습니다.
- 불러온 기억에 쓰는 프롬프트 분량은 아주 적습니다. 그래서 가장 관련 깊은 몇 개만 들어갑니다.
- 기억이 이미 쌓인 뒤에 임베딩 모델을 바꾸면 예전 조각은 더 이상 맞지 않습니다. 다시 만들기 아이콘으로 새로 만드세요.
- 채팅 메시지를 지우면 그 채팅의 기억 조각도 함께 지워집니다.

Marinara Lite라고 부르는 일부 컨테이너 빌드에서는 Memory Recall이 완전히 꺼져 있습니다. 이런 빌드에서는 **Memory Recall** 섹션 자체가 보이지 않습니다.

## Chat Summary(Roleplay)

**Chat Summary**는 오래된 메시지를 요약 항목이라고 부르는 짧은 줄거리로 압축합니다. 각 항목은 AI가 쓸 수도 있고 직접 쓸 수도 있으며, 항목마다 따로 켜고 끌 수 있습니다. 이 기능은 Roleplay 채팅에만 있습니다.

Roleplay 채팅 헤더의 **Chat Summary** 버튼(두루마리 아이콘)을 클릭하면 **Chat Summary** 창이 열립니다.

### 요약 항목 만들기

1. **Summary Scope**(요약 범위)에서 최근 메시지를 요약하려면 **Last**를, 특정 메시지 구간을 고르려면 **Range**를 선택하세요.
2. 그 범위로 AI에게 항목을 쓰게 하려면 **Generate**(생성)를 클릭하세요.
3. 직접 쓰려면 **Write**(작성)를 클릭해 빈 항목을 만들고 줄거리를 입력하세요.

목록의 각 항목에는 제목, 출처 범위 또는 메시지 개수, 예상 토큰 크기가 표시됩니다. 항목을 활성화하거나 비활성화할 수 있고, 펼쳐 볼 수 있으며, **Edit**(편집)로 고치거나 **Delete**(삭제)로 지울 수 있습니다. 일괄 처리 버튼으로 비활성 항목을 **Show Inactive**(비활성 표시) 또는 **Hide Inactive**(비활성 숨기기) 할 수 있고, 한 번에 **Activate All**(전체 활성화) 또는 **Deactivate All**(전체 비활성화) 할 수도 있습니다.

### Automatic Summaries

**Automatic Summaries** 패널은 채팅을 이어 가는 동안 요약을 계속 최신 상태로 유지합니다. Roleplay 채팅에만 나타납니다.

- **Automatic Summaries** 패널 안의 **Enabled**(활성화) 토글을 켜세요.
- 실행 주기는 **Every** 입력란에서 사용자 메시지 개수 단위로 설정합니다. 기본값은 5이고 1에서 200까지 지정할 수 있습니다.
- 요약이 한 번도 없던 예전 채팅을 따라잡으려면 **Backfill Summary**(요약 백필)를 클릭하세요. 채팅을 여러 묶음으로 나눠 처리하며, 진행하는 동안 진행 막대가 나타납니다. 도중에 멈추려면 **Stop**(중지)을 클릭하세요.

### Summary Prompt 템플릿

**Summary Prompt**(요약 프롬프트) 패널에서는 AI가 요약을 쓸 때 따르는 지시를 관리합니다. 현재 프롬프트를 고치려면 **Edit**를 클릭하세요. 템플릿 관리자를 열려면 **Templates**(템플릿)를 클릭하세요. 관리자에서 **New template**(새 템플릿)을 누르면 이름을 붙여 프롬프트를 저장할 수 있습니다. 저장한 템플릿마다 **Duplicate**(복제), **Edit**, **Delete** 컨트롤이 있습니다.

저장한 템플릿은 앱 전체에 적용되는 설정입니다. 한 Roleplay 채팅에서 템플릿을 고치거나 선택하면 모든 Roleplay 채팅의 요약 프롬프트가 바뀝니다.

### Summary Connection과 출력 크기

**Summary Connection**(요약 연결) 패널에서는 요약을 작성할 연결을 고릅니다. 기본값은 **Agent default (falls back to chat connection)**입니다. 기본 에이전트 연결을 먼저 쓰고, 그다음으로 채팅 자체의 연결을 쓴다는 뜻입니다.

**Maximum output size**(최대 출력 크기) 입력란은 생성된 요약의 최대 길이를 정합니다. 기본값은 4096 토큰이고 1에서 32768까지 지정할 수 있습니다.

### 표시 옵션

창의 **Display**(표시) 컨트롤은 요약된 메시지를 화면에 어떻게 보여 줄지 결정합니다.

- **Hide summarised messages**(요약된 메시지 숨기기): 요약이 포함하는 원본 메시지를 숨깁니다. 기본값은 꺼짐입니다.
- **Recent message tail**(유지할 최근 메시지 수): 숨기기가 켜져 있어도 최신 메시지를 이 개수만큼은 그대로 보여 줍니다. 기본값은 10이고 0 이상의 정수를 넣을 수 있습니다. 0으로 두면 요약된 묶음 전체가 숨겨집니다. 값이 클수록 프롬프트가 커지고 모델 비용도 늘어납니다.
- **Collapse hidden messages**(숨겨진 메시지 접기): 숨겨진 메시지를 채팅 기록에서 어떤 모습으로 표시할지 정합니다.

채팅에 에이전트 쓰기 승인이 필요하도록 설정되어 있으면(**Agents**의 별도 설정입니다) AI가 만든 요약은 검토를 거친 뒤에야 적용됩니다.

## Automatic Summarization(Conversation)

Conversation 채팅은 **Automatic Summarization**이라는 다른 기능을 사용합니다. 하루가 끝날 때마다 그날의 요약을 만들고, 한 주가 끝나면 그 주의 일별 요약을 묶어 주간 요약을 만듭니다. 그리고 프롬프트에는 주간 요약, 이번 주의 일별 요약, 오늘 메시지만 담습니다. 덕분에 요청 하나하나가 작게 유지됩니다.

이 기능은 스스로 작동하며, Conversation 채팅에서는 끌 수 없습니다.

### 편집기 열기

1. Conversation 채팅을 열고 **Chat Settings**를 클릭하세요.
2. **Automatic Summarization** 섹션을 찾으세요. 달력 모양 아이콘이 붙어 있습니다.
3. **Edit Summaries**(요약 편집)를 클릭해 **Automatic Summarization** 창을 여세요.

이 창에는 주간 항목이 먼저 나오고, 아직 주간으로 묶이지 않은 날짜가 그 뒤에 나옵니다. 항목을 펼치면 **Summary** 본문과 **Key Details**(주요 내용) 목록을 고칠 수 있고, 목록에 줄을 추가하거나 삭제할 수 있습니다.

### Day Rollover Hour와 Recent Message Tail

**Automatic Summarization** 섹션의 설정 2가지가 하루를 나누는 기준을 정합니다.

- **Day Rollover Hour**(하루 시작 시간 설정): 요약에서 새 하루가 시작되는 시각입니다. 기본값은 4 AM이고, 12 AM(자정)부터 11 AM까지 고를 수 있습니다. 이 시각 이전에 보낸 메시지는 전날에 포함됩니다. 채팅을 하지 않는 시간대로 정해야 늦은 밤 세션이 둘로 잘리지 않습니다.
- **Recent Message Tail**: 요약이 끝난 뒤에도 오늘 메시지 중 몇 개를 원문 그대로 남길지 정합니다. 기본값은 10이고 0 이상의 정수를 넣을 수 있습니다. 값이 클수록 프롬프트가 커지고 모델 비용도 늘어납니다.

요약이 이미 쌓인 뒤에 **Day Rollover Hour**를 바꾸면 Marinara가 예전 요약은 이전 설정을 기준으로 만들어졌다고 알려 줍니다.

### 빠진 날짜 채우기

예전 채팅을 가져온 뒤처럼 어떤 날의 요약이 만들어지지 않는 경우가 있습니다. 창의 **Missing Summaries**(누락된 요약) 패널에 있는 **Backfill**(백필) 버튼을 누르면 요약이 없는 최근 날짜를 다시 시도합니다. 한 번에 최대 14일 전까지 거슬러 올라갑니다.

요약에 쓰는 연결이나 모델을 바꿔도 이미 만들어진 일별 항목과 주간 항목을 다시 쓰지는 않습니다.

## 문제 해결

### Memory Recall이 아무것도 불러오지 않을 때

- 임베딩 소스가 설정되어 있는지 확인하세요. **Memories for This Chat**의 조각이 **Embedding unavailable** 상태라면 연결의 **Semantic Search (Embeddings)** 섹션을 설정하거나 내장 로컬 모델을 사용하세요. [Local Model 설정](../connections/local-model.md)을 참고하세요.
- 조각이 **Waiting for vector** 상태라면 잠시 기다리세요. 지문은 답변이 끝난 뒤에 만들어집니다.
- 불러오기는 최근 메시지와 관련이 깊은 기억만 넣습니다. 관련된 내용이 없으면 아무것도 넣지 않습니다. 정상 동작입니다.
- 최근에 임베딩 모델을 바꿨다면 **Memories for This Chat**의 다시 만들기 아이콘을 사용해 예전 조각을 새 모델에 맞추세요.

### 요약이 생성되지 않을 때

- 채팅에 정상 작동하는 텍스트 연결이 있는지 확인하세요. Chat Summary는 **Summary Connection**을 사용하고, Automatic Summarization은 자동으로 결정된 요약용 연결을 사용합니다. 쓸 수 있는 연결이 하나도 없으면 생성을 건너뜁니다.
- 채팅에 에이전트 쓰기 승인이 필요하도록 설정되어 있으면 AI 요약은 승인을 받은 뒤에 적용됩니다.
- 실패한 요약은 잠시 뒤 자동으로 다시 시도합니다. 그래도 진행되지 않으면 **Backfill Summary**(Roleplay)나 **Backfill**(Conversation)을 직접 실행해 보세요.

## 관련 가이드

- [Local Model 설정](../connections/local-model.md)
- [AI 제공자에 연결하기](../connections/connecting-to-a-provider.md)
- [Conversation Mode: 시작하기](../conversation/getting-started.md)
- [Roleplay Mode: 시작하기](../roleplay/getting-started.md)
- [Marinara Engine 문제 해결](../TROUBLESHOOTING.md)
