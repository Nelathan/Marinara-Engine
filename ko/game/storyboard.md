# 스토리보드 엔진 가이드

이 가이드에서는 Marinara Engine의 스토리보드를 설명합니다. 스토리보드는 완성된 이야기 글을 짧은 키프레임 이미지 묶음으로 바꾸고, 여기에 움직이는 클립을 더할 수도 있습니다. Game Mode(게임 모드) 스토리보드는 완료된 GM 턴 하나를 다룹니다. Roleplay(롤플레이) 스토리보드는 완료된 대화 묶음을 하나의 인라인 에피소드로 엮습니다. Conversation(대화) 채팅에서는 스토리보드를 쓰지 않습니다.

## 스토리보드란

Game Mode는 AI 게임 마스터(GM)가 턴제 모험을 진행해 주는 채팅 모드입니다. GM이 서술 턴을 마치면 스토리보드 엔진이 그 턴 하나를 그림으로 옮길 수 있습니다. Roleplay에서는 Storyboard 에이전트가 직전에 성공한 에피소드 이후에 완료된 사용자 메시지와 어시스턴트 메시지를 읽습니다.

Marinara는 GM 서술을 읽고 순서가 있는 짧은 키프레임 묶음으로 나눕니다. 키프레임 하나는 그 턴의 한 순간을 담은 그림 하나입니다. 스토리보드 하나에는 키프레임이 1개에서 6개까지 들어갑니다. 기본값은 3개입니다.

키프레임은 각각 턴 본문의 특정 구간과 연결됩니다. 이 구간을 읽기 구간이라고 합니다. 턴을 아래로 읽어 내려가면 작은 뷰어가 지금 읽고 있는 위치에 맞는 키프레임을 보여 줍니다.

이미지를 계획하기 전에 Marinara는 턴에서 GM 명령 태그를 걷어냅니다. GM 명령 태그는 주사위 굴림이나 세계 상태 갱신처럼 GM 메시지 안에 숨어 있는 지시용 태그입니다. 그림에 나타나지 않도록 미리 제거합니다.

키프레임 정지 이미지는 **Gallery**(갤러리)의 **Images**(이미지) 탭에 저장합니다. 키프레임 클립은 장면 동영상으로 **Videos**(동영상) 탭에 저장합니다. 일반 Gallery 항목과 같기 때문에 키프레임 하나하나를 따로 미리 보거나 다운로드하고, 고정하거나 프롬프트를 복사할 수 있습니다.

## Roleplay 스토리보드 에피소드

Roleplay 스토리보드는 Illustrator와 별개입니다. Storyboard가 채팅의 완료된 구간에서 순서가 있는 키프레임을 하나 이상 계획하는 동안에도 Illustrator는 평소처럼 단일 이미지를 계속 만들 수 있습니다.

1. **Agents > Download Agents**(에이전트 다운로드)에서 **Storyboard**(스토리보드)를 설치하세요.
2. Roleplay 채팅을 열고 **Chat Settings > Agents**(채팅 설정 > 에이전트)에서 **Storyboard**를 추가하세요.
3. Storyboard 카드에서 **Manual only**, **Still images**, **Animations** 중 하나를 고르세요.
4. 프롬프트 연결과 이미지 연결을 고르고, 필요하면 동영상 연결도 고르세요. 이미지 연결은 반드시 있어야 합니다.
5. 에피소드를 직접 만들려면 **Gallery**를 열고 **Create storyboard**(스토리보드 만들기)를 고르세요. 자동 에피소드는 설정한 개수만큼 사용자 메시지와 어시스턴트 메시지가 쌓인 뒤 어시스턴트 응답이 완료되면 실행됩니다.

기본 간격은 1이라서 새로 완료된 어시스턴트 응답마다 자동 에피소드가 나올 수 있습니다. **Messages per episode** 값을 키우면 대화와 주고받는 흐름이 더 쌓인 뒤에 만들어집니다. 사용자 메시지와 어시스턴트 메시지 모두 간격을 채우는 데 반영됩니다. 간격에 도달하면 Marinara는 직전에 성공한 Storyboard 이후의 메시지를 최근 범위 안에서 묶습니다. 기존 채팅을 다시 열어도 예전 메시지를 소급해서 채우지는 않으며, 실패한 에피소드는 성공 기준점을 앞으로 옮기지 않습니다.

Roleplay 키프레임은 에피소드를 끝맺은 어시스턴트 응답 바로 뒤에 인라인으로 표시됩니다. 키프레임이 여러 개인 Storyboard에서는 화살표로 프레임을 넘길 수 있습니다. 이미지와 클립은 Gallery에도 저장됩니다.

Roleplay 계획 단계는 전역 **Agents > Storyboard** 설정에서 편집할 수 있는 4개 층으로 이루어집니다.

- **Episode contract**는 전달받은 메시지에서 완결된 이야기 단락을 골라냅니다.
- **Visual style**(비주얼 스타일)은 일반/애니메이션풍, NovelAI, 코믹, 컬러 만화, 흑백 만화 중에서 고르게 해 줍니다.
- **Animation addon**은 움직이는 Storyboard에만 들어갑니다. 일러스트를 정확한 T=0 프레임으로 보고, 단순한 동작과 카메라 움직임, 원문 대사, 효과음, 분위기, 마무리 정지 구간을 설명합니다.
- **Output contract**는 계획 모델이 돌려주는 키프레임 JSON의 형식을 정합니다.

이 Roleplay 프롬프트들은 최적화된 Game Mode 플래너 묶음을 대체하지 않습니다. 이미지와 동영상 제공자용 포맷터는 그대로 공유하며 선택할 수 있습니다. 애니메이션 계획은 특정 제공자에 묶여 있지 않아서 Google Gemini Omni, LTX/ComfyUI, 또는 이미지-투-비디오 요청을 받는 다른 Video Generation 연결이면 무엇이든 쓸 수 있습니다. 다만 제공자마다 기능과 결과물 품질은 다릅니다.

## Game Mode 스토리보드

이 절에서는 Game Mode 턴의 스토리보드를 설정하고 생성하고 확인하고 움직이게 만드는 방법을 설명합니다.

## 시작하기 전에

스토리보드가 만들어지려면 먼저 준비해 둘 것이 몇 가지 있습니다.

1. Game Mode 채팅. 아래 설정은 Game Mode 워크플로 전용입니다.
2. 게임의 Illustrator가 쓸 이미지 연결. 아래 두 곳 중 한 곳에서 설정하면 되고, 한 번만 하면 됩니다.
   - 기존 게임: **Chat Settings**(채팅 설정)를 열고 **Agents**(에이전트)로 이동한 다음 **Illustrator** 카드를 여세요. **Game Illustrator**(게임 Illustrator)를 켜고 **Image Connection**(이미지 연결)을 고르세요.
   - 새 게임: 설정 마법사에서 **Visual Generation**을 켜고 **Image Generation Connection**(이미지 생성 연결)을 고르세요.
3. 성능이 좋은 최신 이미지 모델을 권장합니다. 앱은 최신 수준의 이미지 모델이나 Google Nano Banana 2 Lite에 준하는 모델을 추천합니다.

움직이는 클립까지 만들려면 동영상 연결도 필요합니다. 아래 애니메이션 설정 단계를 참고하세요.

이미지 연결을 설정하지 않으면 스토리보드 요청이 실패하면서 다음 메시지가 나옵니다: "Choose an Illustrator image connection in Game Settings first."

키프레임마다 캐릭터 모습을 일정하게 유지하려면 아바타가 있는 캐릭터 카드를 쓰고 **Illustrator** 카드에서 **Send Avatar References**(아바타 참조 전송)를 켜세요. 그러면 각 캐릭터의 아바타를 참고 이미지로 함께 보냅니다.

## 빠르게 시작하기

1. Game Mode 채팅을 열거나 새로 만드세요.
2. 위 절에서 설명한 대로 이미지 연결을 설정하세요.
3. GM이 서술 턴을 마칠 때까지 진행하세요.
4. **Gallery** 패널을 여세요.
5. **Create storyboard**를 클릭하세요. 실행 중에는 버튼에 스피너와 함께 **Creating...**이 표시됩니다.
   - **Settings > Generation**에서 **Expose image prompts before sending**을 켜 두었다면 키프레임마다 완성된 프롬프트를 확인하고 고친 다음 생성을 확정하세요.
6. 계속 턴을 읽으세요. 떠 있는 뷰어가 나타나서 읽는 위치에 따라 키프레임을 바꿔 줍니다.

뷰어를 닫았다면 다시 열 수 있습니다. **Gallery** 패널에서 **View storyboard**(스토리보드 보기)를 클릭하세요.

스토리보드를 만드는 동안 **Gallery**에는 다음 안내가 표시됩니다: "Storyboard generation is running. Keyframes will appear in the game storyboard viewer when ready."

## 자동 스토리보드와 수동 스토리보드

스토리보드는 직접 만들 수도 있고 Marinara에 맡길 수도 있습니다.

수동은 **Gallery**의 **Create storyboard** 버튼입니다. 요청할 때만 가장 최근에 끝난 GM 서술 턴으로 스토리보드를 만듭니다. 자동 스토리보드를 꺼 둔 상태에서도 현재 턴을 다시 그리거나 새로 고치는 용도로 쓸 수 있습니다.

자동 스토리보드는 채팅마다 따로 설정합니다. 아래 두 곳에서 찾을 수 있습니다.

- 새 게임: 설정 마법사의 **Visual Generation** 안에 있는 **Storyboards** 하위 항목.
- 기존 게임: **Chat Settings**의 **Agents**에 있는 **Storyboards** 카드.

**Automatic Storyboard Illustrations**(자동 스토리보드 일러스트)는 GM 턴이 끝날 때마다 클릭 없이 정지 키프레임 이미지를 만듭니다. 비용이 더 적게 드는 쪽입니다. 마법사로 새 게임을 만들면 **Visual Generation**을 켜는 순간 이 항목도 기본으로 켜집니다. 다만 **Game Illustrator**를 설정하기 전까지는 아무 동작도 하지 않습니다.

자동 스토리보드는 프롬프트 확인을 위해 턴 완료 이후의 처리를 멈추지 않습니다. **Expose image prompts before sending**을 켠 상태에서 키프레임별 최종 프롬프트를 모두 보고 고치려면 수동 **Create storyboard**를 쓰세요. 자동 실행은 창을 띄우지 않고 진행하므로 자리를 비운 채팅에서도 진행이 멈추지 않습니다.

**Automatic Storyboard Animations**(자동 스토리보드 애니메이션)는 키프레임마다 MP4 클립까지 만듭니다. 기본값은 꺼짐입니다. 정지 일러스트와 동영상 연결이 함께 있어야 합니다. 애니메이션을 켜면 일러스트도 함께 켜지고, 일러스트를 끄면 애니메이션도 꺼집니다.

클립을 설정하려면 다음과 같이 하세요.

1. **Settings**(설정)의 **Connections**(연결)에서 **Video Generation**(동영상 생성) 연결을 만드세요.
2. 마법사의 **Video Generation Connection**(비디오 생성 연결) 입력란에서 고르거나, **Chat Settings**의 **Agents**에 있는 **Scene Videos**(장면 비디오)에서 **Video Connection**(비디오 연결)으로 고르세요.
3. **Automatic Storyboard Animations**를 켜세요.

동영상 연결 없이 애니메이션을 켜면 마법사가 이렇게 경고합니다: "Choose a Video Generation connection below to save automatic storyboard animations."

스토리보드는 보통 키프레임당 하나씩 이미지 작업 3개를 만듭니다. 애니메이션을 켜면 동영상 작업도 최대 3개까지 생깁니다. 개수는 **Keyframes per Turn**(턴당 키프레임 수) 값을 따르므로 5를 고르면 이미지 작업 5개와 동영상 작업 최대 5개가 될 수 있습니다. 동영상 작업은 훨씬 느리고 비용도 더 듭니다. 먼저 정지 일러스트로 시작하고, 기다리는 시간과 비용을 감당할 수 있는 채팅에서만 애니메이션을 더하세요.

## 스토리보드 설정

아래 항목은 모두 **Storyboards** 카드에 있습니다. **Chat Settings**를 열고 **Agents**로 이동한 다음 **Storyboards**를 여세요.

| 설정 | 기본값 | 기능 |
| --- | --- | --- |
| **Automatic Storyboard Illustrations** | 마법사로 만들고 Visual Generation을 켠 새 게임은 켜짐, 그 외에는 꺼짐 | GM 턴이 끝날 때마다 정지 키프레임을 만듭니다 |
| **Automatic Storyboard Animations** | 꺼짐 | 키프레임마다 MP4 클립을 더합니다. 동영상 연결이 필요합니다 |
| **Keyframes per Turn** | 3(1에서 6까지) | 턴마다 계획할 키프레임 개수 |
| **Animation Clip Duration**(애니메이션 클립 길이) | 6초(1에서 15까지) | 클립 하나의 길이 |
| **Viewer Display**(시청자 화면) | Floating | 떠 있는 패널 또는 전체 배경 |
| **Illustration Planner**(일러스트 플래너) | Still Keyframes | 완성된 정지 키프레임과 그 이미지 설명을 계획합니다 |
| **Animation Planner**(애니메이션 플래너) | Comic Page Animation | 애니메이션용 원본 이미지와 움직임 지시를 계획합니다 |
| **Use Storyboard Template**(스토리보드 템플릿 사용) | 켜짐 | 계획한 장면을 선택한 Storyboard Illustration Prompt 형식으로 다듬습니다. NovelAI 태그 프롬프트를 그대로 보내려면 끄세요 |
| **Storyboard Illustration Prompt**(스토리보드 일러스트 프롬프트) | Game Scene Illustration | 계획한 키프레임을 이미지 모델에 맞게 다듬습니다 |
| **Storyboard Video Prompt**(스토리보드 동영상 프롬프트) | Game Video Prompt와 동일 | 스토리보드 키프레임 클립에만 쓰는 움직임 프롬프트 |

**Keyframes per Turn**은 슬라이더입니다. 엔진은 지정한 개수만큼 키프레임을 계획하려고 합니다. 턴이 짧으면 더 적게 나올 수 있습니다. 6개를 넘기는 일은 없습니다.

**Animation Clip Duration**은 초 단위 숫자입니다. **Automatic Storyboard Animations**가 켜져 있지 않으면 흐리게 표시됩니다. 값을 직접 정하기 전까지는 기본값 6초를 쓰고 **Storyboard default** 배지가 붙습니다. 값을 직접 정하면 그 값을 지우는 **Use storyboard default** 버튼이 나타납니다. 일부 동영상 제공자는 값을 더 낮은 최댓값으로 깎기 때문에 정확한 길이를 보장하지는 않습니다.

**Background**(배경) 뷰어 모드에서는 각 애니메이션이 해당 이야기 단락에 도달할 때 소리와 함께 한 번 재생됩니다. 재생 중에도 서술을 표시할 수 있지만, 서술 자동 재생은 클립이 끝날 때까지 기다립니다. 재생이 끝난 애니메이션은 마지막 프레임에서 멈춘 채로 남습니다. 게임 툴바에서는 데스크톱과 모바일 모두 다시 재생, 재생/일시정지, 음소거를 조작할 수 있습니다. 떠 있는 스토리보드 동영상도 무한 반복이 아니라 한 번만 재생되며 필요할 때 다시 재생할 수 있습니다.

두 플래너가 시각 계획을 만듭니다. **Illustration Planner**는 정지 스토리보드에 쓰고, **Animation Planner**는 동영상을 생성할 때 써서 애니메이션용 이미지 설명과 간결한 움직임 지시를 함께 만들어 냅니다.

그다음 **Storyboard Illustration Prompt**가 플래너의 이미지 설명을 이미지 모델에 보낼 최종 요청 형태로 다듬습니다. 기존 채팅의 기본값은 **Game Scene Illustration**입니다. **Storyboard Illustration**은 플래너 결과를 중심에 두면서 캐릭터 참조, 외형 설명, 캠페인 아트 디렉션, 이미지 지시를 덧붙입니다.

**Storyboard Video Prompt**는 **Scene Videos** 카드에 있는 일반 **Game Video Prompt**(게임 동영상 프롬프트)와 별개입니다. 생성한 키프레임, Animation Planner의 움직임 지시, 현재 장면 컨텍스트를 합쳐서 동영상 모델에 보낼 최종 요청을 만듭니다. 일반 프롬프트를 그대로 쓰려면 상속받은 선택을 유지하고, 수동 Gallery 동영상이나 Game Assets 동영상은 그대로 두면서 키프레임 클립만 바꾸려면 **Anime Game Video**를 고르세요.

길이를 감안한 코믹 원본 페이지를 쓰려면 **Comic Page Animation**을 고르고, 그 칸들을 클립 하나를 위한 순서 있는 시각 참조로 해석하도록 **Comic Page Video**를 고르세요. 일반 일러스트용으로는 기존 **Comic Page**를 그대로 쓸 수 있습니다. 동영상 프롬프트를 따로 고르더라도 상속받은 **Game Video Prompt**와 수동 Gallery 동영상, Game Assets 동영상은 바뀌지 않습니다.

**Storyboard Optimized**(스토리보드 최적화) 표현 방식으로 만든 새 게임은 **Storyboard Game Prompt**, **Comic Page Animation** 플래너, **Storyboard Illustration**, **Comic Page Video**를 선택합니다. **Still Keyframe Animation**과 **Anime Game Video**를 고르면 그 채팅을 언제든 단발 조합으로 바꿀 수 있습니다.

### LTX 2.3 이미지-투-비디오

로컬 LTX 2.3 ComfyUI 워크플로에서는 Animation Planner를 **LTX Simple Image-to-Video**로, Storyboard Illustration Prompt를 **Storyboard First Frame**으로, Storyboard Video Prompt를 **LTX Director Video**로 두고 시작하세요. Animation Planner가 자연어로 된 T=0 이미지 프롬프트와 완결된 움직임 문단을 함께 만듭니다. Storyboard First Frame은 T=0 장면을 거의 손대지 않고 자연어 이미지 제공자에게 넘기고, LTX Director Video는 움직임 문단을 워크플로의 `%prompt%` 입력으로 보냅니다. 더 자세하고 길이까지 감안하는 대안은 **LTX Director Storyboard**이며, 동영상 프롬프트와 워크플로 형식은 동일합니다.

모델 선택, ComfyUI 자리표시자, Game 설정 프로필 전체, 확인 절차, 문제 해결은 [Game Mode의 LTX 2.3 스토리보드](ltx-2-3-storyboards.md) 문서를 참고하세요.

## 스타일 프리셋

플래너 프리셋은 키프레임을 어떻게 고르고 어떻게 설명할지를 정합니다. 선택은 두 곳에서 합니다.

- **Illustration Planner**는 동영상 없이 정지 키프레임만 만들 때 씁니다. 기본값은 **Still Keyframes**입니다.
- **Animation Planner**는 **Automatic Storyboard Animations**가 켜져 있을 때 씁니다. 기본값은 **Comic Page Animation**입니다.

두 선택 항목의 프리셋 목록은 서로 다릅니다. 일러스트 프리셋은 완성된 정지 그림을 설명하며 독자가 읽는 코믹이나 만화 글자 연출을 넣을 수 있습니다. 애니메이션 프리셋은 안정된 첫 프레임과 길이를 감안한 움직임 지시를 설명합니다. 일러스트 프리셋은 Animation Planner 목록에 나오지 않고, 애니메이션 프리셋은 Illustration Planner 목록에 나오지 않습니다.

| 구분 | 프리셋 | 적합한 용도 |
| --- | --- | --- |
| 일러스트 | **Still Keyframes** | 평범하게 읽을 때. 만화 칸, 말풍선, 자막, 효과음 글자가 없는 단일 장면 키프레임입니다. |
| 일러스트 | **NovelAI Keyframes** | NovelAI V4와 V4.5에 맞춘 간결한 정지 이미지 태그 프롬프트. 태그 프롬프트를 그대로 보내려면 **Use Storyboard Template**을 끄세요. |
| 일러스트 | **Comic Page** | 칸 2개에서 6개까지와 대사 말풍선, 자막, 글자 연출까지 갖춘 완성형 코믹 페이지 일러스트. |
| 일러스트 | **Colored Manga** | 셀 셰이딩, 스크린톤, 말풍선, 효과음을 갖춘 완성형 컬러 만화 연출. |
| 일러스트 | **B&W Manga** | 완성형 흑백 만화 펜선에 스크린톤, 짙은 먹칠, 말풍선, 효과음을 더한 형태. |
| 애니메이션 | **Still Keyframe Animation** | 첫 프레임이 정확하고 주된 움직임 하나, 단순한 카메라 움직임, 배경 움직임, 마무리 정지 구간을 갖춘 순서 있는 단일 숏. |
| 애니메이션 | **Anime Episode Director** | 첫 프레임 연결성과 간결한 움직임 지시, 제공자 안전 기준에 맞는 연출을 갖춘 방송 애니메이션식 단일 숏. |
| 애니메이션 | **NovelAI Keyframe Animation** | NovelAI 태그 기반 첫 프레임. 타이밍과 움직임은 별도의 애니메이션 지시로 분리합니다. |
| 애니메이션 | **Comic Page Animation** | 길이를 감안한 코믹 원본 페이지. 시간 순서대로 배치한 칸들이 클립 하나의 순서 있는 시각 참조가 됩니다. |
| 애니메이션 | **Colored Manga Animation** | 글자가 없는 컬러 만화 첫 프레임. 선화와 셀 셰이딩을 유지하는 움직임을 씁니다. |
| 애니메이션 | **B&W Manga Animation** | 글자가 없는 흑백 첫 프레임. 펜선과 스크린톤을 유지하는 움직임을 씁니다. |

**Still Keyframe Animation** 프리셋은 **Still Keyframes**에 대응하는, 스타일을 타지 않는 움직임 쪽 프리셋입니다. **Anime Episode Director**는 방송 애니메이션식 숏 구성이 필요할 때 **Anime Game Video**와 짝지어 쓰는 별도의 전문 선택지입니다. 심한 폭력은 직접적으로 그리지 않고 가능하면 예고, 가림, 반응, 사후 장면으로 연출하므로 GM이 정한 이야기를 바꾸지 않으면서 제공자의 안전 거부를 줄일 수 있습니다.

**Comic Page Animation** 프리셋은 애니메이션 클립 길이로 페이지 밀도를 조절합니다. 6초에서 7초 클립에서는 기본이 칸 2개이고, 각각 약 2초짜리 간단한 이야기 단락 3개일 때만 세 번째 칸을 허용합니다. 8초에서 10초에서는 칸 2개에서 3개를 쓰고, 그보다 긴 클립에서도 4개를 넘지 않습니다. 애니메이션 페이지는 만화 글자 연출보다 시각적 타이밍을 앞세우고, 칸마다 초점을 하나로 좁히며, 짧은 마무리 정지 구간을 남깁니다. 칸은 읽는 순서대로 원인과 결과를 따릅니다. **Comic Page Video**는 보통 첫 번째 칸부터 바로 들어가며, 뒤에 올 결과를 미리 드러내지 않는 경우에만 아주 짧게 페이지 전체를 보여 주는 연출을 허용합니다.

**NovelAI Keyframes** 프리셋은 간결한 Danbooru 태그를 씁니다. Danbooru 태그는 일부 애니메이션풍 이미지 모델이 요구하는, 쉼표로 구분한 짧은 키워드 태그입니다. 애니메이션이나 코믹, 만화 프리셋을 고른다고 해서 애니메이션이 저절로 켜지지는 않습니다. 클립을 만들려면 **Automatic Storyboard Animations**와 동영상 연결이 여전히 필요합니다.

## 캠페인 아트 스타일과 이미지 스타일 프로필

게임 설정 단계에서 시각적 통일감을 위해 캠페인 단위의 아트 스타일을 만듭니다. 기존 게임이라면 **Chat Settings > Agents > Illustrator**를 열고 **Campaign art style** 항목에서 확인할 수 있습니다. 여기서 내용을 고치거나 지울 수 있고, 처음 만들어진 문구로 되돌리거나 **Use Campaign Art Style**(캠페인 아트 스타일 사용)을 끌 수도 있습니다.

캠페인 아트 스타일과 **Image Style**(이미지 스타일) 프로필은 서로 다른 프롬프트 층입니다. 둘 다 켜져 있으면 Marinara는 양쪽을 모두 넣습니다. 캠페인 스타일을 끄거나 지워도 선택한 Image Style 프로필은 그대로 남습니다. 이 설정은 스토리보드 키프레임과 게임의 다른 생성 시각 자산에도 함께 적용됩니다.

**Settings > Generation**에서 **Expose image prompts before sending**을 켜 두면, 수동 **Create storyboard** 요청은 계획한 모든 키프레임의 최종 긍정 프롬프트와 부정 프롬프트를 먼저 보여 줍니다. 이 확인 화면에서 고친 내용은 해당 스토리보드에만 적용되는 일회성 변경이며, 캠페인 스타일이나 Image Style 프로필 설정을 바꾸지 않습니다.

## 스토리보드 프리셋 편집

기본 제공 프리셋은 읽기 전용입니다. 직접 만들려면 **Storyboards** 카드 안에서 **Edit Illustration Planner Presets**(일러스트 플래너 프리셋 편집), **Edit Animation Planner Presets**(애니메이션 플래너 프리셋 편집), **Edit Illustration Prompt Presets**(일러스트 프롬프트 프리셋 편집), **Edit Video Prompt Presets**(동영상 프롬프트 프리셋 편집)를 여세요. 각 항목에는 해당 단계의 기본 제공 프리셋과 사용자 사본만 나옵니다.

기본 제공 프리셋을 복사해 그 채팅에서만 편집할 수 있는 템플릿으로 만든 다음, 짝이 맞는 선택 항목에서 그 사본을 고르세요. Illustration Planner 사본은 Animation Planner로 고를 수 없고, Animation Planner 사본은 Illustration Planner로 고를 수 없습니다. Storyboard Illustration Prompt 사본은 스토리보드 이미지에만 영향을 줍니다. 동영상 프롬프트 사본은 일반 Game Video Prompt와 계속 공유하므로 두 동영상 선택 항목 어느 쪽에서나 쓸 수 있습니다.

사본마다 이름과 짧은 설명, 그리고 직접 편집하는 프롬프트 본문이 있습니다. 휴지통 버튼을 누르면 확인 창을 거쳐 사본을 지웁니다. 이 사본은 앱 전체가 아니라 해당 채팅 하나에만 저장됩니다.

## 스토리보드 뷰어

뷰어는 읽고 있는 위치를 따라갑니다. 턴 본문에서 지금 보고 있는 지점과 읽기 구간이 맞아떨어지는 키프레임을 보여 줍니다. 단순히 "가장 최근 Gallery 이미지"를 띄우는 것이 아닙니다. 표시 방식은 **Viewer Display**로 정하며 2가지가 있습니다.

**Floating**이 기본값입니다. 게임 위에 작은 패널이 떠 있고 마우스로 끌 수 있습니다. 머리글에는 **Storyboard**라고 표시됩니다. 키프레임의 동영상이 준비되면 재생하고, 클립이 아직 준비 중이거나 실패했으면 이미지를 대신 보여 줍니다.

떠 있는 뷰어에는 다음 조작이 있습니다.

- **Close storyboard viewer**(스토리보드 뷰어 닫기)는 현재 턴에 한해 패널을 숨깁니다. 다음 GM 턴이 끝나면 다시 나타납니다. 페이지를 새로 고쳐도 숨김이 풀립니다.
- **Drag storyboard viewer**(스토리보드 뷰어 드래그)는 머리글의 손잡이입니다. 패널을 화면 어디로든 끌어다 놓을 수 있습니다.
- **Play storyboard video**(스토리보드 동영상 재생)와 **Pause storyboard video**(스토리보드 동영상 일시 중지)로 클립 재생을 조작합니다. 클립은 음소거 상태로 시작합니다.
- **Mute storyboard video**(스토리보드 동영상 음소거)와 **Unmute storyboard video**(스토리보드 동영상 음소거 해제)는 그 키프레임에 완성된 클립이 있을 때만 나타납니다.
- **Change storyboard viewer size**(스토리보드 뷰어 크기 조절)는 작게, 중간(기본값), 크게 3가지 너비를 차례로 바꿉니다.
- 모서리의 손잡이로 패널 크기를 자유롭게 조절할 수 있으며, 이 경우 크기 프리셋보다 우선합니다.

**Background**는 떠 있는 카드 대신 활성 키프레임으로 게임 화면 전체를 채웁니다. 이미지나 클립이 게임 조작 요소 뒤에 깔립니다. 읽는 위치를 따라가는 방식은 떠 있는 뷰어와 같습니다.

배경 모드에는 한 가지 맞바꿈이 있습니다. Marinara가 평소에 만들어 주는 장면 배경이 꺼집니다. 배경 모드를 켜 두는 동안에는 Illustrator 팝오버의 **Generate background**(배경 생성) 버튼이 비활성화되고, 버튼에 다음 안내가 표시됩니다: "Storyboard background display is active, so scene background generation is disabled."

## 결과를 더 좋게 만들기

스토리보드는 읽어 들인 턴만큼만 선명해집니다. 좋은 턴은 누가 움직이는지, 무엇이 달라지는지, 결정적인 순간이 어디인지를 짚어 줍니다. "싸움이 계속된다" 같은 두루뭉술한 턴은 구체적인 동작과 배경 묘사가 담긴 턴보다 그릴 거리가 적습니다.

결과를 더 안정적으로 만들려면 다음을 지켜 보세요.

- 설정 단계에서 게임의 배경, 분위기, 아트 스타일을 구체적으로 적어 두세요.
- 아바타를 꼼꼼히 갖춘 캐릭터 카드를 쓰고 **Send Avatar References**를 켜세요.
- 중요한 복장, 상처, 소품, 장소를 서술에서 분명하게 밝히세요.
- 원하는 마무리 느낌에 맞는 이미지 스타일 프로필을 쓰세요.
- 평범하게 읽을 때는 **Still Keyframes**를, 클립을 켜 둘 때는 코믹이나 만화 프리셋을 쓰세요.

## NovelAI 관련 설정

NovelAI에 간결한 요청을 보내려면 **Storyboards** 카드에서 **NovelAI Keyframes**를 고르고 **Use Storyboard Template**을 끄세요. 그러면 계획한 장면 프롬프트를 그대로 보내면서도 외형, 참고 이미지, 이미지 지시, 스타일 설정은 따로 쓸 수 있습니다.

**Use NovelAI Character Prompts**(NovelAI 캐릭터 프롬프트 사용)는 화면에 나오는 캐릭터마다 NovelAI 자체의 Add Character 설명과 위치를 함께 보냅니다. 기본값은 켜짐입니다. 주의할 점이 있습니다. novelai.net의 공식 NovelAI 연결에서 V4 또는 V4.5 모델을 쓸 때만 동작합니다. 다른 제공자나 모델에서는 이 토글이 아무 일도 하지 않고, Marinara는 공용 구형 프롬프트를 대신 씁니다.

## 문제 해결

**"Choose an Illustrator image connection in Game Settings first."** **Chat Settings**의 **Agents**에서 **Illustrator** 카드를 여세요. **Game Illustrator**를 켜고 **Image Connection**을 고르세요. 새 게임이라면 설정 마법사에서 **Visual Generation**을 켜고 **Image Generation Connection**을 고르세요.

**"Storyboards can only be generated from GM narration turns."** **Create storyboard**는 끝난 GM 서술 턴에서만 동작합니다. 직접 쓴 플레이어 메시지에는 쓸 수 없습니다. GM의 답변이 끝날 때까지 기다린 다음 다시 시도하세요.

**"This GM turn has no narration to storyboard."** 그 턴에 그릴 이야기 글이 없다는 뜻입니다. GM 턴이 숨은 명령 태그만 담고 서술이 하나도 없을 때 이런 일이 생깁니다. GM이 이야기 글이 있는 턴을 쓸 때까지 진행한 다음 그 턴으로 스토리보드를 만드세요.

**이미지는 나오는데 동영상이 없습니다.** 동영상을 만들려면 **Automatic Storyboard Animations**가 켜져 있어야 하고 **Video Generation** 연결도 선택되어 있어야 합니다. 애니메이션이 꺼져 있으면 스토리보드는 정지 키프레임만 만듭니다.

**자동 스토리보드가 실행되지 않습니다.** **Automatic Storyboard Illustrations**나 **Automatic Storyboard Animations**가 켜져 있는지 확인하세요. 이미지 연결이 설정되어 있는지, GM 턴의 스트리밍이 끝났는지도 확인하세요. Marinara는 이미 스토리보드가 있는 턴에 두 번째 스토리보드를 만들지 않습니다. 그래도 **Gallery**의 **Create storyboard**로 직접 다시 만들 수 있습니다.

**스토리보드가 일부만 나오거나 멈춰 있습니다.** 대개 이미지나 동영상 작업이 하나 이상 실패했거나 시간이 초과됐거나 제공자의 요청 한도에 걸린 경우입니다. 금지된 콘텐츠 때문에 작업이 막히기도 합니다. 제공자의 응답이 느리다면 `.env` 파일에서 이미지와 동영상 생성 시간 초과 값을 늘린 다음 Marinara를 다시 시작하세요. 정확한 변수 이름은 [서버 설정 참고 문서](../CONFIGURATION.md)에 있습니다.

더 깊이 살펴보려면 로그 레벨을 debug로 바꾸고 서버 로그를 지켜보세요. 스토리보드 관련 로그 줄에는 `[debug/game/storyboard-illustrator]`, `[debug/game/storyboard-image-preview]`, `[debug/game/storyboard-image-assets]`, `[debug/game/storyboard-video]` 태그가 붙습니다.

## 관련 가이드

- [장면 동영상 생성](../media/scene-video.md)
- [이미지 생성 제공자](../media/image-providers.md)
- [Game Mode: 시작하기](getting-started.md)
- [Game Mode의 LTX 2.3 스토리보드](ltx-2-3-storyboards.md)
