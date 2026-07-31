# Hierarchical Maps 및 Spatial Context V3

상태: 제안됨. 관리자 승인 후 구현 착수 가능

대상 독자: 제품, 디자인, Marinara Engine 기여자

대체 문서: `hierarchical-locations-prd-v2.md`

## 아키텍처 경계

이 계획은 공간 방향 파악을 상태 경계가 좁은 집중형 제품 기능으로 다룹니다.

이 기능은 계층형 지도와 공간 방향 파악 시스템이며, Voxta식 범용 시나리오 엔진이 아닙니다. Voxta에서 빌려 온 패턴은 하나뿐입니다. 지속되는 상태가 작고 관련 있는 프롬프트 컨텍스트를 골라 준다는 점입니다. 초기 단계에서는 플래그, 변수, 이벤트, 스크립트, 타이머, 별도의 행동 추론 모델을 추가하지 않습니다.

지원하는 소유자 모드는 Roleplay와 Game입니다. 레거시 `visual_novel` enum 값은 호환성 잔재이며 지원 대상 제품 모드가 아닙니다.

이 계획은 집중된 5개 계층으로 나뉩니다.

| 계층 | 담당 범위 | 예시 |
| --- | --- | --- |
| 지도 정의 | 고정된 공간 정보 | Library는 Wizard Tower 안에 있습니다 |
| 런타임 상태 | 현재 장면의 위치 | 장면은 지금 Library에 있습니다 |
| 프롬프트 프로젝션 | 범위를 제한한 모델 방향 정보 | 브레드크럼(위치 경로), 현재 위치 기억, 갈 수 있는 출구 |
| 시각 정체성 | 선택 사항인 장소별 참조 아트 | Library는 장면이 바뀌어도 아치, 창문, 재질을 유지합니다 |
| 전환 | 검증을 거친 상태 변경 | Library에서 Observatory로 이동 |

상태 기계는 의도적으로 작게 유지합니다.

```text
current location + requested destination + definition revision
                              ↓
                  validate ownership and reachability
                       ↙ accepted       rejected ↘
              persist snapshot         preserve state
```

수동 이동을 먼저 출시합니다. 이후에는 `change_location({ destinationId })` 같은 제한된 모델 도구가 같은 전환을 요청할 수 있습니다. 검증하고 적용하는 주체는 모델이 아니라 서버입니다. 별도의 행동 추론 호출은 필요하다는 근거가 나오기 전까지 보류합니다.

## 요약

Roleplay와 Game이 함께 쓰는 Hierarchical Map 기능을 추가합니다. 제작자가 정의한 위치 계층 구조, 하나뿐인 기준 초점 위치, 범위를 제한한 현재 위치 프롬프트 컨텍스트, 서버가 검증하는 이동을 제공합니다.

재사용 가능한 세계 설정 사실의 정식 출처는 여전히 로어북입니다. 계층 구조는 안정적인 ID로 기존 로어북 항목을 참조할 수 있어서, 활성 위치가 로어를 복사하거나 다시 쓰지 않고도 관련 로어를 골라낼 수 있습니다. AI 지도 초안 작성은 명시적으로 선택한 로어북을 근거 자료로 쓸 수 있으며, 출처가 있는 위치와 추론하거나 새로 만든 위치를 반드시 구분해야 합니다.

위치는 선택 사항인 시각 정체성 키트를 가질 수도 있습니다. 짧은 시각 앵커 하나와 프로필 갤러리 이미지를 가리키는 안정적인 참조로 구성합니다. 위치는 이미지가 아니라 공간 개체로 남습니다. 전체 렌더링 스타일은 채팅의 이미지 스타일 프로필이 정하고, 위치 참조는 장소를 유지하며, 캐릭터나 페르소나 참조는 그 안의 인물을 유지합니다.

Connected Conversation은 나중에 연결된 스토리 위치의 안전한 프로젝션을 읽을 수 있지만, 공간 상태를 소유하거나 바꾸는 일은 절대 없습니다.

```text
authoritative hierarchy + current location
                    ↓
resolve breadcrumb, context, and valid destinations
                    ↓
build the mode-specific prompt
                    ↓
commit a validated move with the next owner turn
                    ↺
```

이것은 범용 시나리오 엔진이 아닙니다. 플래그, 이벤트, 제작자 JavaScript, 경로 탐색은 추가하지 않습니다. 대신 지도, 레이어, 목록 표현을 갖춘 시각적 중첩 지도 브라우저를 포함합니다.

## 제품 결정 사항

아래 결정은 V2에서 열려 있던 질문들을 정리한 것입니다.

1. 계층 구조 정의와 현재 위치는 따로 저장합니다.
2. 현재 위치는 커밋된 메시지 및 스와이프 상태와 함께 스냅샷으로 남습니다. 그래서 분기, 재생성, 체크포인트에서 올바른 위치를 복원합니다.
3. 수동 이동은 프롬프트 생성 전에, 다음 소유자 모드 사용자 턴과 함께 원자적으로 커밋됩니다.
4. Spatial Context를 켜면 그것이 기준입니다. Game의 레거시 자유 입력 위치가 두 번째 기준 출처가 되어서는 안 됩니다.
5. Roleplay와 Game은 하나의 공용 공간 프로젝션 계약을 쓰고, 모드별 프롬프트 어댑터는 얇게 유지합니다.
6. `awarenessSummary`는 제작자가 직접 씁니다. 없으면 Conversation은 공개 설명의 일부만 잘라서 받습니다.
7. Conversation은 연결된 캐릭터가 그 자리에 있다는 것이 기준 데이터로 증명되지 않는 한 장면 단위 표현을 씁니다.
8. 직접 링크와 시각적 자식 배치는 MVP에 포함합니다.
9. 기존 Game 그리드 지도와 노드 지도는 계층 구조 위치에 명시적으로 연결할 수 있습니다. 이름으로 자동 대조하는 일은 절대 없습니다.
10. 재사용 가능한 정식 세계 설정 사실은 로어북이 소유하고, 공간 정체성, 포함 관계, 이동, 현재 위치 상태는 지도가 소유합니다. 지도 위치는 안정적인 ID로 로어북 항목을 참조하며 그 내용을 복사하지 않습니다.
11. 위치 첨부는 채팅 범위의 명시적 활성화 출처입니다. 바로 그 위치가 현재 위치인 동안에는 활성화된 항목이 키워드 일치 없이도 작동할 수 있지만, 비활성화했거나 명시적으로 제외한 로어북과 항목은 계속 비활성 상태로 남습니다.
12. 로어북에 근거한 지도 초안 작성은 소유자 런타임 UI를 따르며 Connected Conversation보다 먼저 진행합니다. 출처 로어북을 선택하면 초안은 어떤 위치가 출처 기반인지, 추론인지, 새로 만든 것인지 드러내야 하며 근거 없는 지형을 정식 설정처럼 보여 주면 안 됩니다.
13. 위치를 이미지로 대체하는 일은 절대 없습니다. 안정적인 이미지 ID로 선택 사항인 시각 정체성 자산을 참조할 수 있고, 대표 설정 참조는 하나이며 보조 참조는 개수를 제한합니다.
14. 위치 시각 참조는 자격을 갖춘 이미지 생성 경로에만 전달합니다. 텍스트 생성, 로어 활성화, Connected Conversation은 이미지 바이트나 이미지 전용 메모를 절대 받지 않습니다.
15. 스토리보드는 같은 시각 리졸버를 쓰는 하위 소비자입니다. 각 스토리보드는 메시지와 스와이프에 고정된 참조 매니페스트를 동결하므로, 나중에 재생성해도 더 최근의 위치 아트나 캐릭터 아트를 조용히 가져오지 않습니다.
16. 모델이 요청하는 이동은 이후 단계로 남깁니다.

## 범위

| 모드 | 계층 구조 소유 | 초점 위치 이동 | 스토리 프로젝션 | 연결 프로젝션 |
| --- | ---: | ---: | ---: | ---: |
| Roleplay | 예 | 예 | 예 | 해당 없음 |
| Game | 예 | 예 | 예 | 해당 없음 |
| Conversation | 아니요 | 아니요 | 아니요 | 이후 단계, 읽기 전용 |

## 사용자 경험

### 제작

**Chat Settings**(채팅 설정)에는 간결한 Spatial Context 섹션이 있고 다음을 보여 줍니다.

- 활성화 상태
- 현재 브레드크럼
- 위치 개수와 경고 개수
- **Open Location Editor**(위치 편집기 열기) 동작

편집기는 좁은 설정 양식이 아니라 지연 로딩되는 지도 작업 공간입니다.

- 데스크톱에서는 계층 구조 패널, 로컬 지도 또는 레이어 뷰, 위치 상세 패널을 씁니다.
- 모바일에서는 한 번에 패널 하나만 보여 주고 뒤로 가는 길을 분명히 제공합니다.
- 검증 결과는 해당 입력란이나 노드 옆에 표시합니다.
- 저장 상태와 리비전 충돌은 항상 보입니다.
- 기본 제거 동작은 보관이고, 완전 삭제는 제한합니다.
- 선택하면 위치를 미리 봅니다. 이동은 별도의 **Enter**(들어가기) 동작으로 합니다. 그래서 클릭 하나가 확인, 편집, 이동을 모호하게 겸하지 않습니다.
- 각 상위 위치는 자식을 좌표가 있는 지도, 순서 있는 레이어, 접근성 있는 목록 중 하나로 보여 줍니다.
- 하위 트리 복제로 제작자가 기존 구조를 재사용할 수 있어서, MVP 단계에서 채팅 간 템플릿이 필요하지 않습니다.
- 각 위치에는 점진적으로 펼쳐지는 `Linked lore` 섹션이 있습니다. 기존 로어북 항목을 검색하고, 비활성이거나 누락된 참조를 표시하며, 로어 내용을 복사하거나 삭제하지 않고 **Open entry**와 **Detach**를 지원합니다.
- 각 위치에는 점진적으로 펼쳐지는 `Visual identity` 섹션이 있습니다. 대표 이미지, 보조 참조, 사용 메모와 함께 갤러리 선택, 업로드, 생성 동작을 명시적으로 제공합니다. 이미지가 위치 이름, 아이콘, 접근성 탐색 라벨을 대체하는 일은 절대 없습니다.

### 로어북에 근거한 초안 작성

AI 지도 빌더는 소유자 채팅에 선택했거나 활성화된 로어북이 있을 때 로어북 근거 사용을 제안합니다. 근거 연결은 명시적이고 확인 가능하며, 평범한 키워드 스캔이 아닙니다.

- Game 설정에서는 **Lorebooks**(로어북) 단계에서 선택한 로어북을 기본 지도 출처로 씁니다.
- Roleplay에서는 열려 있는 채팅의 활성 로어북을 기본값으로 쓰고, 지도 빌더에서 출처 선택을 바꿀 수 있습니다.
- `Strict canon`은 이름이 붙은 모든 노드를 선택한 로어 항목 하나 이상에서 만듭니다. 근거 없는 연결 장소를 지어내는 대신 출처가 있는 여러 루트를 그대로 둡니다.
- `Canon with expansion`은 출처가 있는 이름과 관계를 유지하면서, 실용적인 빈틈을 메우도록 분명히 표시한 추론 위치나 새로 만든 위치를 허용합니다.
- `Setup only`는 기존 동작을 유지하며, 로어북 근거 없이 설정, 세계 개요, 스토리 아크, 시나리오, 캐릭터 컨텍스트를 씁니다.
- 선택한 로어북이 있으면 접근하기 쉬운 기본값은 `Canon with expansion`입니다. 빌더는 로어북을 많이 쓰는 제작자를 위해 `Strict canon`을 컨트롤 하나 거리에 둡니다.

초안 미리보기의 모든 생성 노드에는 `Lore-backed`, `Inferred`, `Added by AI` 중 하나가 표시됩니다. `Lore-backed` 노드는 출처 항목을 나열하고 **Open entry**를 제공합니다. 이 라벨은 유효한 출처 참조가 있다는 것을 증명할 뿐, 모델이 원문을 완벽하게 해석했다는 뜻은 아닙니다. 의미 판단의 최종 권한은 제작자 검토에 있습니다. **Apply**(적용)는 로컬 작업 사본만 바꾸고, 저장 경계는 **Save**(저장)입니다.

### 위치 시각 정체성과 참조 아트

위치 이미지는 계층 구조를 갤러리나 또 하나의 공간 기준으로 만들지 않으면서 장면 일관성을 높여야 합니다.

- 제작자는 이미지를 업로드하거나, 기존 프로필 갤러리 이미지를 고르거나, 생성된 장면을 승격하거나, 위치의 브레드크럼, 공개 설명, 시각 앵커, 연결된 로어, 선택한 이미지 스타일 프로필을 바탕으로 설정 참조를 생성할 수 있습니다.
- 채팅 갤러리 이미지, 생성된 Game 배경, 그 밖의 임시 출처를 붙이면 먼저 영구적인 프로필 갤러리 자산이 만들어집니다. 지도는 안정적인 갤러리 이미지 ID만 저장하고 파일 경로, 외부 URL, base64 페이로드는 저장하지 않습니다.
- `identity` 이미지 하나를 대표로 지정할 수 있습니다. 보조 이미지는 특징적인 세부, 다른 시점, 배치도, 상속 가능한 아트 스타일 단서를 담을 수 있습니다.
- `layout` 참조는 배경이나 평면도 요청이 명시적으로 요구하지 않는 한 편집기 보조 자료로 남습니다. 구도를 왜곡할 수 있어서 일반 장면 일러스트에는 자동으로 전달하지 않습니다.
- 자손 상속을 켤 수 있는 것은 `style` 참조뿐입니다. identity와 detail 이미지는 정확히 그 위치에만 적용되므로, 도시 스카이라인이 그 안 모든 방의 시각 정체성으로 조용히 쓰이지 않습니다.
- 생성된 장면 아트가 자동으로 정식 설정이 되는 일은 없습니다. `Set as location reference`는 명시적인 검토 동작이며, 반복 생성이 우연한 세부나 스타일 이탈을 증폭하지 못하게 막습니다.
- 선택한 위치의 인스펙터는 대표 이미지와 참조 역할을 보여 줍니다. 정보 밀도가 높은 계층 구조 뷰와 지도 뷰는 이름을 우선하며, 공간이 있으면 작은 썸네일을 보여 줄 수 있지만 탐색이 이미지 인식에 의존하지는 않습니다.
- 이미지 생성 미리보기는 해석된 모든 위치 참조와 캐릭터 참조, 각각의 역할, 제공자 한도 때문에 빠진 참조를 이름과 함께 보여 줍니다. 진단 정보에 원본 base64를 기록하거나 표시하지 않습니다.

의도한 일관성 구조는 다음과 같습니다.

```text
chat image style profile  -> shared rendering language
current location refs     -> stable architecture and place identity
character/persona refs    -> stable people and appearance
scene prompt              -> current action, framing, weather, and lighting
```

참조 아트는 시각적 근거일 뿐 자동 로어가 아닙니다. 이미지를 추가한다고 위치가 만들어지거나, 포함 관계가 바뀌거나, 로어북 사실이 기록되지는 않습니다. 이미지에서 지도를 추론하는 기능은 따로 검토할 이후 워크플로로 남습니다.

### 스토리보드 참조 연속성

스토리보드는 완료된 GM 턴에서 검토를 마친 시각 정체성을 가져다 쓰되, 공간 기능이 스토리보드에 의존하게 만들어서는 안 됩니다.

- 프로필 갤러리와 개체 갤러리는 하나의 위치, 캐릭터, 페르소나에 대해 검토를 마친 이미지를 여러 장 담을 수 있는 참조 은행을 이룹니다. 생성되는 키프레임은 그중에서 제공자 용량에 맞춰 고른 참조 페이로드만 받습니다.
- 스토리보드를 만들면 원본 메시지와 스와이프에 해당하는 정확한 공간 스냅샷을 해석합니다. 채팅의 최신 위치를 과거 턴에 대신 쓰는 일은 없습니다.
- 스토리보드는 해석된 위치, 순서가 정해진 후보 이미지 ID, 키프레임별 선택, 누락, 제공자 용량을 시각 참조 매니페스트에 동결합니다. 재생성은 제작자가 `Refresh references`를 직접 고르기 전까지 그 매니페스트를 재사용합니다.
- 같은 대표 위치 후보는 모든 키프레임이 쓸 수 있습니다. 캐릭터와 페르소나 후보는 각 프레임의 등장 캐릭터 목록에 따라 달라지므로, 화면에 없는 인물이 참조 자리를 차지하지 않습니다.
- 첫 버전은 등장 개체마다 대표 이미지 한 장과 보조 위치 이미지 최대 한 장을 자동으로 고릅니다. 참조가 풍부하면 수동 선택이나 앞으로의 샷 인식 기반 각도, 의상, 표정, 세부 대조에 유용하지만, Marinara는 저장된 이미지를 프레임마다 전부 보내지는 않습니다.
- 자동 자리가 하나만 남으면 등장 캐릭터가 있는 키프레임은 주요 등장 캐릭터를 고르고, 등장 캐릭터가 없는 설정 키프레임은 대표 위치를 고릅니다. 자리가 둘 이상이면 추가 등장 캐릭터 참조보다 대표 위치를 먼저 고릅니다.
- 용량이 더 큰 제공자라고 해서 기존 스토리보드에 참조를 조용히 더하지 않습니다. 용량이 더 작은 제공자는 동결된 페이로드를 조용히 바꾸는 대신 인라인 `Review references` 충돌을 냅니다.
- 각 키프레임 미리보기에는 점진적으로 펼쳐지는 `Visual sources` 영역이 하나 있어, 해석된 위치, 선택된 캐릭터, 이미지 역할, 순서, 누락 사유를 보여 줍니다. `Refresh references`도 거기서 쓸 수 있으므로 스토리보드에 별도 자산 관리자나 화면을 가리는 창을 두지 않습니다.
- 생성된 키프레임이 자동으로 캐릭터 참조나 위치 참조가 되는 일은 없습니다. 기존의 명시적 승격 동작만이 저장 경계입니다.

### 런타임 이동

소유자 모드 채팅 화면에는 다음이 표시됩니다.

- 저장된 현재 브레드크럼
- 유효한 목적지 선택기
- 분명히 표시된 대기 중 목적지

목적지를 고른다고 기준 상태가 곧바로 바뀌지는 않습니다. 다음 메시지를 보낼 때 목적지 ID와 예상 리비전을 보이는 메시지 텍스트와 분리해 제출합니다. 서버는 답변 프롬프트를 조립하기 전에 이동을 커밋합니다.

검증에 실패하면 메시지와 이동이 부분적으로 커밋되지 않습니다. 클라이언트는 입력 중이던 내용을 그대로 두고 충돌 상황을 설명합니다.

## 데이터 모델

정의는 채팅 메타데이터에, 런타임 위치는 스냅샷 기록에 둡니다.

```ts
export type SpatialOwnerMode = "roleplay" | "game";

export type LocationVisualReferenceRole = "identity" | "detail" | "layout" | "style";

export interface LocationVisualReference {
  imageId: string;
  role: LocationVisualReferenceRole;
  primary?: boolean;
  usageNote?: string;
  inheritToDescendants?: boolean;
  sortOrder: number;
}

export interface ChatLocation {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  kind: "region" | "settlement" | "place" | "building" | "floor" | "room";
  modelMemory?: string;
  icon?: string;
  childPresentation: "map" | "layers" | "list";
  placement?: { x: number; y: number };
  layerOrder?: number;
  awarenessSummary?: string;
  visualIdentity?: string;
  visualReferences: LocationVisualReference[];
  lorebookEntryIds: string[];
  links: ChatLocationLink[];
  status: "active" | "archived";
  sortOrder: number;
}

export interface ChatLocationLink {
  targetId: string;
  label?: string;
  bidirectional: boolean;
  state: "available" | "hidden" | "blocked";
}

export interface SpatialContextDefinition {
  schemaVersion: 1;
  ownerMode: SpatialOwnerMode;
  enabled: boolean;
  locations: ChatLocation[];
  startingLocationId: string | null;
  revision: number;
}

export interface SpatialContextSnapshot {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  createdAt: string;
}

export interface PendingSpatialTransition {
  destinationId: string;
  expectedDefinitionRevision: number;
  expectedCurrentLocationId: string | null;
  commandId: string;
}
```

`SpatialContextDefinition` 안에 `ownerChatId`를 저장하지 마세요. 소유자는 그 정의를 담고 있는 채팅입니다. 안정적인 불투명 ID는 이름 변경과 상위 변경에도 그대로 유지됩니다.

첫 소유자 MVP는 `lorebookEntryIds`나 `visualReferences` 필드가 없으면 빈 배열로 간주합니다. 그래서 이후 패키지가 기존 정의를 서둘러 다시 쓰지 않고도 스키마 버전 1을 확장할 수 있습니다. 항목 참조와 이미지 참조는 안정적인 ID만 씁니다. 로어북 이름, 항목 이름, 키, 내용, 이미지 경로, 이미지 바이트는 사용 시점에 해석하며 공간 정의에 복사하지 않습니다. `imageId`는 영구적인 프로필 갤러리를 통해 해석되고, 임시 이미지나 채팅 범위 이미지를 붙일 때는 영구 사본을 먼저 만듭니다.

## 그래프 규칙

유효한 목적지는 활성 상태인 다음 위치입니다.

- 현재 위치의 자식
- 현재 위치의 상위
- 직접 링크 대상
- 양방향 링크의 역방향 대상

형제 위치가 자동으로 인접해지지는 않습니다.

다음은 거부합니다.

- 중복 ID
- 상위나 링크 대상 누락
- 자기 자신을 상위로 지정하거나 상위 순환이 생기는 경우
- 위치 500개 초과
- 깊이 20 초과
- 위치당 링크 50개 초과
- 위치당 로어북 항목 참조 50개 초과
- 한 위치에 중복된 로어북 항목 참조
- 위치당 시각 참조 6개 초과
- 한 위치에 중복된 시각 이미지 참조
- 대표 시각 참조가 둘 이상이거나, 역할이 `identity`가 아닌 대표 참조
- `style` 이외의 역할에 걸린 자손 상속
- 0에서 100까지를 벗어난 배치 좌표
- 레이어 상위 안에서 잘못되었거나 중복된 레이어 순서
- 보관, 숨김, 차단 상태이거나 도달할 수 없는 위치로의 이동
- 오래된 리비전이나 바뀐 현재 위치
- 내용이 다른데 재사용된 명령 ID
- Conversation에서의 변경 시도

텍스트 길이 제한:

- 이름: 200자
- 설명: 4,000자
- 인지 요약: 1,000자
- 비공개 모델 기억: 8,000자
- 시각 정체성: 800자
- 시각 참조 사용 메모: 300자

직접 링크의 순환은 유효합니다. 상위 순환은 유효하지 않습니다.

### 보관과 삭제

- 현재 위치나 시작 위치는 보관하기 전에 원자적 교체가 필요합니다.
- 활성 자식이 있는 위치는 보관할 수 없습니다.
- 완전 삭제는 들어오는 링크가 없는 보관된 말단 위치에만 허용합니다.
- 자손이 조용히 다른 상위로 옮겨지는 일은 없습니다.
- 누락된 로어북 참조는 그래프 손상이 아니라 경고로 표시합니다.
- 위치를 보관하거나 삭제해도 참조된 로어북 항목은 삭제되지 않습니다.
- 로어북이나 항목을 삭제해도 지도가 조용히 다시 쓰이지 않습니다. 제작자가 참조를 떼거나 교체할 때까지 위치는 고칠 수 있는 끊어진 참조를 유지합니다.
- 위치를 보관하거나 삭제해도 공유 프로필 갤러리 이미지는 삭제되지 않습니다.
- 위치나 동결된 스토리보드 매니페스트가 아직 참조하는 갤러리 이미지는, 제작자가 참조를 떼거나 관련된 모든 매니페스트를 새로 고치기 전까지 삭제를 막습니다. 누락된 이미지 참조는 고칠 수 있는 경고로 남고 원본 경로 대체로 넘어가지 않습니다.

## 저장과 기록

### 정의

`SpatialContextDefinition`은 `chat.metadata.spatialContext`에 저장합니다. 정의를 업데이트하려면 `expectedRevision`이 필요하고, 수락된 업데이트는 리비전을 올립니다.

### 런타임 위치

현재 위치는 기존 Game 상태 스냅샷 패턴을 따라, 메시지와 스와이프로 주소를 지정하는 스냅샷에 저장합니다.

- 새 소유자 채팅은 `startingLocationId`에서 시작합니다.
- 커밋된 턴은 수락된 이동이 있으면 그 뒤에 스냅샷을 만듭니다.
- 재생성은 위치를 결과 스와이프에 연결합니다.
- 스와이프를 바꾸면 그에 맞는 스냅샷을 해석합니다.
- 메시지에서 분기하면 원본 채팅의 최신 위치가 아니라 그 지점에서 유효했던 스냅샷을 복사합니다.
- Game 체크포인트는 해당하는 공간 스냅샷을 참조하거나 함께 담습니다.
- 다시 불러오면 마지막으로 커밋된 스냅샷을 해석합니다.

MVP에서는 일반적인 메시지 분기로 정의 편집이 되감기지 않습니다. 분기는 현재 정의의 사본을 받고, 이후 리비전 기록은 따로 쌓습니다. 런타임 위치는 분기 지점에서 가져옵니다.

## 프롬프트 프로젝션

공용 서버 프로젝션 서비스가 구조화된 프로젝션 데이터를 해석합니다. 얇은 모드 어댑터가 그것을 최종 프롬프트 텍스트로 만듭니다.

### 소유자 스토리 프로젝션

포함할 내용:

- 브레드크럼 이름
- 현재 위치 ID
- 공개 설명
- 현재 위치의 비공개 모델 기억
- 갈 수 있는 목적지 이름, ID, 링크 라벨
- 기준 상태를 알리는 안내문

관련 없는 위치 설명과 기억, 숨김이나 차단 상태인 목적지, 캔버스 좌표, 편집기 메타데이터는 모두 제외합니다.

### 현재 위치 로어 활성화

소유자 공간 리졸버는 평소의 공간 프로젝션과 함께 정확히 현재 위치의 `lorebookEntryIds`를 반환합니다. 포매터는 그 ID나 항목 내용을 공간 블록에 붙여넣지 않습니다. 대신 프롬프트 조립 단계가 그 ID들을 활성화 출처 `current_location`의 강제 후보로 기존 로어북 처리기에 넘깁니다.

규칙:

- 첫 릴리스에서는 정확히 현재 위치만 첨부된 로어를 활성화합니다. 상위나 자손이 항목을 암묵적으로 물려받지 않습니다.
- 명시적인 위치 첨부는 로어북이 전역, 캐릭터 연결, 페르소나 연결, 채팅 고정 상태가 아니어도 활성화된 항목을 작동시킬 수 있습니다.
- 전역으로 비활성화한 로어북, 비활성화한 항목, 명시적인 채팅 제외는 언제나 첨부보다 우선합니다.
- 기존 로어북 매크로, 삽입 위치, 재귀, 순서, 로어북별 토큰 및 항목 제한을 그대로 씁니다.
- 위치에 첨부된 로어에는 소유자 프롬프트당 총 2,048 토큰의 예약 상한도 적용됩니다. 잘림은 결정적이며 **Active Context**(활성 컨텍스트)에 표시됩니다.
- 위치와 일반 키워드, 의미 기반, 재귀, 상시 규칙 양쪽으로 활성화된 항목은 한 번만 주입되고 모든 활성화 출처를 보고합니다.
- 커밋된 이동은 소유자 답변 프롬프트를 조립하기 전에 목적지의 항목을 해석합니다. 대기 중이거나 거부된 이동은 로어 활성화를 바꾸지 않습니다.
- Game의 표현은 그 위치를 파티의 기준 위치로 다룹니다. Roleplay의 표현은 초점이 되는 장면으로 다루며, 모든 캐릭터가 그 자리에 있다고 단정하지 않습니다.

**Active Context** UI는 이 항목들을 `Current location` 아래에 묶고, 소속 로어북, 활성화 출처, 토큰 사용량이나 잘림, **Open entry**를 보여 줍니다. 끊어졌거나 비활성이거나 제외된 참조는 지도 편집기에서는 계속 보이지만 프롬프트에는 절대 들어가지 않습니다.

### Connected Conversation 프로젝션

Phase 3에서 추가합니다. 다음만 포함합니다.

- 연결된 스토리 이름과 모드
- 브레드크럼
- `awarenessSummary` 또는 범위를 제한한 공개 설명 발췌
- 읽기 전용 안내문
- 기준 상태가 증명할 때만 알려 주는 캐릭터의 존재 여부

비공개 모델 기억, 내부 ID, 숨김 목적지, 전체 계층 구조, 위치에 첨부된 로어북 ID나 내용, 위치 시각 참조 ID, 시각 정체성 메모, 사용 메모, 이미지 경로, 이미지 바이트는 절대 포함하지 않습니다.

Game은 커밋된 `presentCharacters` 상태로 존재 여부를 증명할 수 있습니다. Roleplay는 명시적인 존재 정보원이 생기기 전까지 "The linked story's current scene is…" 같은 중립적 표현을 씁니다. 캐릭터 이름으로 존재 여부를 추론하는 일은 절대 없습니다.

### 필수 프롬프트 경로

같은 프로젝션 리졸버가 다음 모두에 데이터를 공급해야 합니다.

- Roleplay 생성
- Game GM 생성
- 드라이런 미리보기
- 실시간 **Peek Prompt**(프롬프트 미리보기) 조립

캐시된 **Peek Prompt**는 원래 보낸 프롬프트를 그대로 계속 보여 줍니다. 디버그 로그에는 최종 프로젝션이 들어가지만, 일반 레벨에서 비공개 모델 기억을 기록해서는 안 됩니다.

### 이미지 생성을 위한 현재 위치 시각 프로젝션

시각 참조는 스토리 프롬프트와 다른 리졸버를 씁니다. 채팅의 최신 위치가 아니라 이미지 대상에 해당하는 공간 스냅샷을 해석합니다. Game의 자동 아트는 그 어시스턴트 메시지에 커밋된 스냅샷을 씁니다. 이전 스와이프의 아트를 다시 만들거나 이전 메시지에서 Illustrator를 실행할 때는 그 메시지와 스와이프에서 해석된 위치를 씁니다.

자격이 있는 경로는 Game 자동 장면 아트, Game 수동 장면 일러스트, 그리고 채팅별 위치 참조 설정이 켜져 있을 때의 Roleplay Illustrator 장면 생성 또는 배경 생성입니다. 인물 사진, 셀카, 아바타, 스프라이트 생성에는 위치 참조를 자동으로 붙이지 않습니다.

채팅 메타데이터 설정 두 개가 기존 아바타 참조 설정과 짝을 이룹니다. `illustratorUseLocationReferences`와 `gameImageUseLocationReferences`입니다. 값이 없거나 false이면 하위 호환을 위해 꺼진 상태로 둡니다. 제작자가 첫 대표 위치 이미지를 지정하면 같은 **Save** 흐름에서 `Use this location in scene art`를 제안합니다. 기본으로 체크되어 있지만 확인을 명시적으로 받으므로, 지도 편집기에 이미지가 보인다는 이유만으로 이미지 바이트가 제공자에게 전달되지 않습니다.

후보 순서는 결정적이며 제공자를 고려합니다.

1. 이번 이미지 요청에 명시적으로 선택한 참조.
2. 정확히 해석된 위치의 대표 `identity` 참조.
3. 장면 순서대로 참조된 캐릭터와 페르소나.
4. 그 위치의 보조 `identity` 및 `detail` 참조를 `sortOrder` 순으로.
5. 가장 가까운 조상의 상속 가능한 `style` 참조.

형제 위치나 이름 기반 대체는 허용하지 않습니다. 일반 장면 요청에서 후보가 되는 위치 이미지는 최대 2장이고, 총 이미지 한도는 기존 제공자 어댑터가 적용합니다. 명시적 요청 참조가 항상 자리를 먼저 씁니다. 남은 자동 자리에서는 배경 요청이 캐릭터 참조보다 위치 정체성을 우선하고, 일러스트는 추가 등장 인물 참조보다 대표 위치 참조를 먼저 고릅니다. 제공자가 장소와 요청된 인물을 모두 받을 수 없으면 미리보기가 결정적인 절충 결과와 모든 누락 사유를 알려 줍니다.

이미지 프롬프트 컴파일러는 위치 브레드크럼, 범위를 제한한 `visualIdentity`, 선택된 각 참조의 범위를 제한한 `usageNote`를 추가합니다. 스타일의 기준은 채팅에서 선택한 `ImageStyleProfile`입니다. 참조 이미지는 장소나 대상의 정체성을 유지할 뿐, 프로필의 스타일 텍스트, 긍정 태그, 부정 태그, 프롬프트 모드를 조용히 대체해서는 안 됩니다.

참조 역할은 제작자의 의도와 선택 우선순위를 나타냅니다. 모든 제공자가 이미지를 identity, detail, layout, style로 해석한다고 보장하지는 않습니다. 제공자 기능 안내와 생성 미리보기가 있어서 시각적 판단의 주체는 제작자로 남습니다.

텍스트 모델 요청은 이런 이미지 바이트나 이미지 전용 사용 메모를 전혀 받지 않습니다. Connected Conversation은 시각 참조 ID도 그 내용도 받지 않습니다. 이미지 디버그 로그에는 이미지 ID, 위치 ID, 역할, 선택 사유, 누락이 들어갈 수 있지만 base64나 파일 시스템 경로는 절대 들어가지 않습니다.

### 스토리보드 시각 참조 매니페스트

스토리보드 어댑터는 완료된 GM 턴의 메시지와 스와이프가 커밋된 뒤에 시각 후보를 한 번 해석합니다. 동결된 참조 은행과 각 키프레임에 고른 제공자 용량만큼의 페이로드를 저장합니다. 그래서 영구적인 참조 정체성과, 일부만 받을 수도 있는 제공자 요청이 분리됩니다.

선택은 결정적입니다.

1. 명시적인 키프레임 참조가 자리를 먼저 씁니다.
2. 자동 자리가 하나 남으면 설정 프레임은 대표 위치를, 등장 캐릭터가 있는 프레임은 주요 등장 캐릭터를 고릅니다.
3. 자동 자리가 둘 이상 남으면 정확한 위치의 대표를 먼저 고르고, 이어서 서술 순서대로 등장 캐릭터와 페르소나마다 대표 참조를 하나씩 고릅니다.
4. 남은 용량은 정확한 위치의 보조 identity나 detail, 그다음 부차적인 등장 개체 참조, 그다음 가장 가까운 상속 가능한 위치 style에 씁니다.

스토리보드가 암묵적으로 콘택트 시트나 합성 참조를 만드는 일은 없습니다. 그런 기법은 제공자의 해석을 바꿀 수 있어서 이후 제공자별 최적화 과제로 남깁니다. 이미지가 없거나 제공자가 바뀌거나 제공자 한도가 줄면 매니페스트를 `needs_review`로 표시하며, 다른 개체를 조용히 고르지는 않습니다. 용량이 늘어나도 `Refresh references`를 확인하기 전까지 동결된 페이로드를 유지합니다.

매니페스트에는 ID, 라벨, 역할, 순서, 선택 사유, 누락, 원본 메시지와 스와이프, 해석된 위치 ID, 정의 리비전, 제공자 정보, 사용한 참조 한도를 저장합니다. 이미지 바이트나 파일 시스템 경로는 저장하지 않습니다. 디버그 출력은 그 매니페스트를 설명할 수 있지만, 일반 이미지 생성과 같은 base64 금지 및 경로 금지 규칙을 따릅니다.

## Game 호환성

기존 Game 그리드 지도와 노드 지도는 로컬 표현이나 전술 표현으로 남습니다. 계층 구조는 그 위의 세계 계층이자 포함 관계 계층이 됩니다.

Spatial Context를 켜면 다음과 같습니다.

- Spatial Context가 프롬프트에 기준이 되는 위치 이름을 공급합니다.
- Game 트래커는 공간 브레드크럼을 위치로 표시합니다.
- 레거시 모델 패치나 수동 패치가 자유 입력 Game 위치를 독자적으로 바꿀 수 없습니다.
- `GameMap.spatialLocationId`로 지도 전체를 계층 구조 위치 하나에 연결할 수 있습니다.
- `GridCell.spatialLocationId`와 `MapNode.spatialLocationId`로 들어갈 수 있는 목적지를 연결할 수 있습니다.
- 연결에는 안정적인 ID만 쓰며, 이름으로 자동 대조하는 일은 없습니다.
- 연결된 목적지를 고르면 계층 구조 브라우저와 똑같은 대기 중 전환이 만들어집니다.
- 연결되지 않은 칸이나 노드 사이의 이동은 전술적 파티 위치만 바꿉니다.
- 위치에 들어가면 그에 연결된 로컬 지도를 고를 수 있고, 나가면 가장 가까운 연결된 조상 지도를 고를 수 있습니다.

끄면 기존 Game 위치 동작이 그대로 유지됩니다.

이 경계 덕분에 현재 지도 UI와 저장 데이터를 그대로 두면서도 이름이 붙은 공간 기준이 둘로 갈라지지 않습니다.

## API 형태

```text
GET  /api/chats/:chatId/spatial-context
PUT  /api/chats/:chatId/spatial-context
```

정의 업데이트:

```ts
interface UpdateSpatialContextRequest {
  expectedRevision: number;
  expectedCurrentLocationId: string | null;
  replacementCurrentLocationId?: string | null;
  definition: SpatialContextDefinition;
}
```

`replacementCurrentLocationId`는 정의 편집이 실제 현재 위치를 보관 처리할 때만 씁니다. 서버는 그 교체를 정의 리비전과 같은 쓰기 작업 안에서 검증하고 적용해야 합니다. 일반적인 이동은 여전히 소유자 모드 턴 제출을 거칩니다.

대기 중 이동은 별도의 즉시 전환 엔드포인트가 아니라 기존 소유자 모드 턴 요청으로 제출합니다.

서버는 정의 무결성, 소유자 모드, 예상 리비전, 예상 현재 위치, 도달 가능성, 명령 멱등성을 메시지 제출과 같은 트랜잭션 안에서 검증합니다.

오래된 상태에는 `409 Conflict`를, 잘못된 그래프나 목적지에는 `400 Bad Request`를 반환합니다. 오류 메시지가 숨김 목적지를 드러내서는 안 됩니다.

## 구현 계획

### Phase 0: 공용 코어와 검증용 픽스처

- 공용 타입과 Zod 스키마를 추가합니다.
- 순수 함수로 된 그래프 검증, 브레드크럼, 목적지 헬퍼를 추가합니다.
- 유효한 그래프와 잘못된 그래프의 결정적 픽스처를 추가합니다.
- Roleplay와 Game의 메시지/스와이프 스냅샷 통합 지점을 확인합니다.
- 대표적인 프롬프트 프로젝션의 크기를 측정합니다.

종료 조건: UI 없이도 스키마, 이동 동작의 의미, 스냅샷 동작이 증명됩니다.

### Phase 1: 소유자 MVP

1. 낙관적 동시성 제어와 함께 정의 저장을 추가합니다.
2. 공간 스냅샷 저장과 해석을 추가합니다.
3. 원자적인 대기 중 이동을 소유자 모드 턴 제출에 통합합니다.
4. 다시 불러오기, 스와이프, 분기, Game 체크포인트를 처리합니다.
5. 공용 프로젝션 서비스를 필수 프롬프트 경로 전부에 추가합니다.
6. 간결한 설정 섹션, 계층 구조 내비게이터, 로컬 지도 캔버스, 레이어 선택기, 편집기 작업 공간을 추가합니다.
7. 소유자 화면에 브레드크럼, 목적지 선택기, 미리보기, 대기 상태를 추가합니다.
8. 기존 Game 지도, 칸, 노드를 안정적인 위치 ID로 연결합니다.
9. 켜져 있을 때 Game 트래커의 위치를 맞춰 줍니다.

종료 조건: Roleplay와 Game이 같은 공간 모델로 제작, 이동, 저장, 복원, 프롬프트 생성을 할 수 있습니다. 연결된 Game 지도 이동과 연결되지 않은 전술 이동은 서로 구분된 상태로 남습니다.

### Phase 2A: 위치 로어북 연결과 런타임

- 빈 배열 호환 기본값과 함께 위치에 `lorebookEntryIds`를 추가합니다.
- **Location Editor**에 인라인 첨부, 열기, 떼기, 비활성, 제외, 끊어진 참조 상태를 추가합니다.
- 정확한 현재 위치의 참조를 기존 로어북 처리기의 강제 후보로 해석합니다.
- 일반 매크로, 삽입, 재귀, 순서, 로어북별 제한을 그대로 쓰고, 결정적 중복 제거와 2,048 토큰의 위치 로어 총량 상한을 추가합니다.
- 키워드, 의미 기반, 재귀, 상시 활성화 출처와 함께 `current_location`을 **Active Context**에 보고합니다.
- 이동, 다시 불러오기, 재생성, 스와이프, 분기를 포함해 Roleplay와 Game에서 동작이 같음을 증명합니다.
- Connected Conversation이 위치 로어 ID도 내용도 받지 않음을 증명합니다.

종료 조건: 제작자가 기존 로어를 위치에 명시적으로 연결할 수 있고, 소유자 프롬프트에서는 수락된 현재 위치만 그 항목들을 활성화합니다.

### Phase 2B: 로어북에 근거한 지도 초안 작성

- 생성, 교체, 기록 안전 확장 요청에 근거 모드와 명시적인 로어북 또는 항목 출처 선택을 추가합니다.
- 키워드 활성화나 생성된 세계 개요에 기대지 않고, 이 제작 작업을 위해 선택된 활성 로어 항목을 직접 읽습니다.
- 누락 개수가 보이고 순서가 결정적인, 연결 용량을 고려한 제한된 출처 카탈로그를 만듭니다.
- 모델에는 임시 출처 키를 주고, 반환된 키는 모두 서버에서 검증하며, 저장은 안정적인 항목 ID만 합니다.
- 미리보기 출처 표시와 함께 `setup_only`, `lore_strict`, `lore_expand` 동작을 지원합니다.
- 유효한 출처 항목을 생성된 위치에 자동으로 연결하되, **Apply**와 **Save**는 별개의 검토 경계로 유지합니다.
- 추가만 하는 확장 중에는 기존 위치 ID와 로어 연결을 모두 보존합니다.

종료 조건: 로어북을 잘 아는 제작자가 선택한 정식 설정에 직접 근거한 지도를 생성하고, 근거 없는 추가를 모두 찾아내며, 저장 전에 거절하거나 수정할 수 있습니다.

### Phase 2C: 위치 시각 정체성과 장면 참조

- 빈 값 호환 기본값과 함께 길이를 제한한 `visualIdentity`, `visualReferences` 필드를 추가합니다.
- 영구적인 프로필 갤러리 이미지 ID와 기존의 안전한 갤러리 업로드, 메타데이터, 이미지 생성 경로를 그대로 씁니다. 원본 경로, 외부 URL, base64는 정의에 절대 저장하지 않습니다.
- 채팅별 Illustrator 설정과 Game 위치 참조 설정을 나란히 추가합니다. 첫 대표 지정 시의 **Save** 흐름에서 제공자 사용에 대한 동의를 명시적으로 받습니다.
- 범위를 제한한 정확한 위치 컨텍스트와 활성화된 첨부 로어만으로 설정 참조를 생성합니다. 관련 없는 로어북이나 계층 구조 가지를 훑지 않습니다.
- **Location Editor**에 인라인 대표, 보조, 역할, 사용 메모, 갤러리 선택, 업로드, 생성, 떼기, 끊어진 참조, 역링크 상태를 추가합니다.
- 메시지와 스와이프의 정확한 위치를 자격이 있는 Game 및 Roleplay 장면 아트 요청에 해석해 넣고, 위치, 캐릭터, 페르소나, 명시적 참조를 제공자별 한도 아래에서 합칩니다.
- 생성된 아트에 명시적인 `Set as location reference` 승격을 추가합니다. 생성된 장면을 자동으로 승격하는 일은 절대 없습니다.
- 분기와 JSONL 메타데이터 내보내기에서 시각 참조 ID를 보존하고, 대상에 자산이 없으면 경고하며, 프로필 백업과 복원에 그 자산을 포함합니다.
- 스토리 프롬프트와 Connected Conversation이 위치 이미지 ID, 바이트, 경로, 이미지 전용 메모를 전혀 받지 않음을 증명합니다.

종료 조건: 제작자가 장소를 시각적으로 정립하고, 검토를 마친 그 정체성을 재사용하는 장면을 여러 개 생성하며, 어떤 시각 참조가 전달되었는지 정확히 확인하고, 공간이나 로어 기준을 바꾸지 않고도 그 참조를 제거하거나 교체할 수 있습니다.

### Phase 2D: 스토리보드 시각 참조 매니페스트

- 공간 저장 로직을 스토리보드에 묶는 대신, Phase 2C의 시각 리졸버를 감싸는 하위 스토리보드 어댑터를 추가합니다.
- 원본 메시지와 스와이프의 공간 스냅샷을 해석한 뒤, 위치와 개체 참조 은행 및 키프레임별 제공자 페이로드를 동결합니다.
- 용량이 허용하면 정확한 위치의 대표를 키프레임 전반에서 재사용하고, 캐릭터와 페르소나 참조는 각 프레임의 등장 캐릭터 목록에서 고릅니다.
- 재생성을 재현할 수 있도록 제공자 정보, 참조 용량, 순서가 있는 선택, 누락 사유를 저장합니다.
- 스토리보드 미리보기와 재생성에 인라인 `Visual sources`, `Review references`, 명시적 `Refresh references` 상태를 추가합니다.
- 이미지가 없거나 제공자 용량이 줄었을 때 조용히 다시 고르는 동작을 거부합니다. 새로 생긴 용량을 자동으로 채우지 않습니다.
- 기존 스토리보드 수명 주기 전반에서 매니페스트를 보존하고, 키프레임 이미지-동영상 변환이 렌더링된 키프레임만 첫 프레임 입력으로 계속 쓴다는 것을 증명합니다.

종료 조건: 모든 스토리보드 키프레임이 자신의 시각 입력을 설명하고 재현할 수 있으며, 반복되는 프레임이 역사적으로 올바른 장소 정체성을 공유하고, 제공자 제약이 위치나 등장 인물을 조용히 바꾸는 일이 없습니다.

### Phase 3: Connected Conversation

- 생성 시점에 `connectedChatId`로 최신 소유자 상태를 해석합니다.
- 범위를 제한한 읽기 전용 프로젝션을 추가합니다.
- 존재 여부는 보수적으로 표현합니다.
- 소유자 모드 생성이 쓰더라도 위치에 첨부된 로어 ID와 내용, 시각 참조 ID와 메타데이터, 이미지 경로, 이미지 바이트는 제외합니다.
- 연결 해제, 재연결, 삭제된 소유자, 잘못된 링크, 완결된 스토리, 위치 로어 부정 검증을 다룹니다.

### Phase 4: 모델이 요청하는 이동

- 소유자 모드용으로 타입이 정해진 `change_location` 요청을 추가합니다.
- 리비전, 도달 가능성, 멱등성 검증을 똑같이 적용합니다.
- 수락한 요청과 거부한 요청을 디버그 진단에 기록합니다.
- Conversation은 계속 전환을 요청할 수 없습니다.

### Phase 5: 제작자 템플릿

- 재사용 가능한 위치 하위 트리나 지도 전체를 저장하고 가져옵니다.
- 소유권과 병합 동작을 정한 뒤, 제작자가 캐릭터와 함께 시작용 지도를 배포할 수 있게 합니다.
- 다른 채팅으로 복사할 때 내부 참조를 유지하면서 새 ID를 만듭니다.

## 저장소 구현 청사진

계획 기준: 2026-07-13에 `staging`을 `4fd752ea`에서 병합한 뒤의 `hierarchical-locations`. 이 기준 시점에서 브랜치에는 V1, V2, V3 계획 문서만 있습니다. Spatial Context 런타임 코드는 아직 없습니다.

### 확인된 통합 제약

| 항목 | 현재 저장소 동작 | 구현상 결과 |
| --- | --- | --- |
| 정의 저장 | 채팅 메타데이터는 JSON이고, 일반 메타데이터 업데이트는 부분 병합입니다. | 공간 정의는 `chat.metadata.spatialContext`에 그대로 두되, 일반 메타데이터 패치 경로 대신 전용 검증 엔드포인트를 씁니다. |
| 런타임 기록 | 메시지와 스와이프로 주소를 지정하는 세계 상태 기록은 `game_state_snapshots`뿐입니다. | 모드에 중립적인 공간 스냅샷 테이블을 추가합니다. Game 전용 스냅샷에 Spatial Context 열을 추가하지 마세요. |
| 소유자 턴 시작 | `/api/generate`는 보이는 Game 상태를 커밋하고 사용자 메시지를 만든 뒤, 첨부 파일과 페르소나 데이터를 별도 호출로 업데이트합니다. | 사용자 메시지 생성과 수락된 공간 이동이 함께 성공하거나 함께 실패하도록, 트랜잭션에 묶인 작은 소유자 턴 서비스를 추가합니다. 제공자 호출은 트랜잭션 밖에 둡니다. |
| 스와이프와 분기 | 스와이프를 삭제하면 Game 스냅샷 인덱스가 밀립니다. 분기를 만들면 모든 Game 및 턴 Game 스냅샷을 새 메시지 ID로 복사합니다. | 공간 스냅샷도 두 경로에 모두 참여해야 하며, 더 이른 분기 지점에서 유효했던 스냅샷을 복사해야 합니다. |
| 프롬프트 조립 | 실시간 생성, 드라이런, 실시간 **Peek Prompt**, 캐시된 **Peek Prompt**, Game GM 프롬프트는 각각 다른 조립 경로를 씁니다. | 구조화된 공간 데이터를 한 번 해석한 뒤, 모든 실시간 경로에서 공용 포매터와 주입기를 호출합니다. 캐시된 **Peek Prompt**는 저장된 제공자 요청을 그대로 계속 읽습니다. |
| 클라이언트 데이터 | 서버 데이터는 React Query를 씁니다. 채팅별 입력 초안은 화면 이동과 다시 불러오기 후에도 남습니다. 무거운 편집기는 `AppShell`을 통해 지연 로딩됩니다. | 전용 쿼리/뮤테이션 훅을 추가하고, 대기 중 전환을 채팅별 초안 옆에 저장하며, 지연 로딩되는 **Location Editor**를 기존 상세 화면 모델로 연결합니다. |
| Game 이동 | Game 지도에는 이미 그리드와 노드 좌표가 있고, 대기 중인 지도 이동은 보이는 `*moves to ...*` 텍스트가 됩니다. | 선택 사항인 안정적 ID 연결을 추가합니다. 연결된 목적지는 보이는 문장 없이 구조화된 공간 요청을 쓰고, 연결되지 않은 이동은 기존 전술 흐름을 유지합니다. |
| 저장소 | 파일 기반 스냅샷이 유일한 저장 백엔드입니다. 쓰기 반응 속도를 유지하려고 작은 트랜잭션을 쓰고 큰 트랜잭션 반복은 피합니다. | 소유자 턴 트랜잭션의 크기를 일정하게 유지하고, 기능을 확장하기 전에 파일 기반 저장소에서 먼저 증명합니다. |
| 로어북 처리 | 로어북 활성화는 이미 명시적 채팅 ID, 키워드 및 의미 기반 일치, 매크로, 재귀, 순서, 프롬프트 마커를 지원합니다. 초기 Game 설정은 채팅 메시지가 없는 상태로 훑기 때문에, 일반 키워드 항목이 이후 지도 초안의 직접적인 근거가 되지 못합니다. | 공용 로어북 처리기에 현재 위치 강제 후보를 추가하고, 지도 초안 작성에는 별도의 명시적이고 제한된 출처 카탈로그 경로를 줍니다. 세계 개요만으로 지도의 정식 설정을 추론하지 마세요. |
| 이미지 일관성 | 이미지 스타일 프로필이 프롬프트 스타일을 정하고, 캐릭터와 페르소나 아바타는 이미 참조로 보낼 수 있으며, 제공자마다 최대 참조 개수가 다릅니다. 갤러리는 파일 경로와 별개로 안정적인 이미지 ID를 저장합니다. | 장소 정체성을 전역 스타일 및 캐릭터 정체성과 분리해 둡니다. 해당하는 공간 스냅샷을 해석하고, 자격이 있는 장면 아트 요청에만 안정적인 갤러리 이미지를 붙이며, 기존 제공자 어댑터로 후보를 결정적으로 줄입니다. |
| 스토리보드 참조 | 스토리보드는 이미 키프레임별 등장 캐릭터를 계획하고, 제공자별 참조 한도를 해석하며, 캐릭터 이미지를 미리보기와 렌더링에 보내고, 원본 메시지와 스와이프를 저장하며, 렌더링된 각 키프레임을 동영상 첫 프레임으로 씁니다. | 과거 위치를 한 번 해석하고, 키프레임마다 캐릭터를 달리하며, 순서가 있는 선택을 재생성 후에도 보존하는 동결 시각 참조 매니페스트를 추가합니다. 이미지-동영상 입력은 그대로 둡니다. |

### 대상 모듈 지도

새 공용 모듈:

- `packages/shared/src/types/spatial-context.ts`: 공개 정의, 스냅샷, 전환, 프로젝션, 응답, 경고, 오류 코드 타입.
- `packages/shared/src/schemas/spatial-context.schema.ts`: Zod 스키마와 모든 저장/요청 제한.
- `packages/shared/src/utils/spatial-context.ts`: 순수 함수로 된 그래프 인덱싱, 검증, 브레드크럼, 도달 가능성, 보관 검사, 결정적 목적지 정렬.
- `packages/shared/src/index.ts`: 새 공용 계약의 명시적 export.

새 서버 모듈:

- `packages/server/src/db/schema/spatial-context.ts`: `spatial_context_snapshots` 스키마.
- `packages/server/src/services/storage/spatial-context.storage.ts`: 스냅샷 읽기, 쓰기, 분기 복사, 스와이프 이동, 명령 조회, 정리.
- `packages/server/src/services/spatial-context/state-resolution.ts`: 부트스트랩, 보이는 스와이프, 재생성, 분기, 체크포인트에 대한 유효 스냅샷 해석.
- `packages/server/src/services/spatial-context/projection.ts`: 구조화된 소유자 및 연결 프로젝션과 길이를 제한한 텍스트 포매팅.
- `packages/server/src/services/spatial-context/visual-reference-resolution.ts`: 스냅샷을 고려한 위치 시각 선택, 상속, 제공자 후보, 안전한 진단.
- `packages/server/src/services/spatial-context/storyboard-reference-manifest.ts`: 동결된 스토리보드 참조 은행, 키프레임별 페이로드 선택, 제공자 용량 검토, 새로고침, 안전한 직렬화.
- `packages/server/src/services/spatial-context/owner-turn.ts`: 검증과 크기가 일정한 원자적 이동, 사용자 메시지 커밋.
- `packages/server/src/services/spatial-context/game-map-binding.ts`: 기준 브레드크럼 프로젝션과 명시적인 Game 지도, 칸, 노드 연결 해석.
- `packages/server/src/routes/spatial-context.routes.ts`: 전용 GET 경로와 리비전을 쓰는 PUT 경로.

새 클라이언트 모듈:

- `packages/client/src/hooks/use-spatial-context.ts`: 쿼리 키, GET, 정의 PUT, 충돌 처리, 캐시 무효화.
- `packages/client/src/features/spatial-context/SpatialContextSettingsSection.tsx`: 간결한 **Chat Settings** 요약과 편집기 열기 동작.
- `packages/client/src/features/spatial-context/SpatialMapWorkspace.tsx`: 지연 로딩되는 전체 화면 편집기 셸.
- `packages/client/src/features/spatial-context/components/HierarchyNavigator.tsx`: 계층 구조 탐색과 키보드 조작.
- `packages/client/src/features/spatial-context/components/LocalMapCanvas.tsx`: 좌표가 있는 자식 위치 지도.
- `packages/client/src/features/spatial-context/components/LayerSelector.tsx`: 순서가 있는 층, 탑, 던전 레이어.
- `packages/client/src/features/spatial-context/components/LocationInspector.tsx`: 필드 편집, 미리보기, 링크, 보관 컨트롤, 인라인 검증.
- `packages/client/src/features/spatial-context/components/SpatialContextRuntimeBar.tsx`: 브레드크럼, 목적지 선택기, 대기 상태, 지우기 동작.
- `packages/client/src/features/spatial-context/lib/editor-state.ts`: 작업 사본 조작과 서버 오류 매핑. 클라이언트 내부에만 두며 배럴로 export하지 않습니다.

변경이 예상되는 기존 통합 파일:

- 저장: 테이블 등록에 필요한 범위에서 `packages/server/src/db/migrate.ts`, `packages/server/src/db/schema/index.ts`, `packages/server/src/db/file-backed-store.ts`, `packages/server/src/services/storage/chats.storage.ts`, `packages/server/src/routes/backup.routes.ts`.
- 채팅 수명 주기: `packages/server/src/routes/chats.routes.ts`, `packages/server/src/routes/generate.routes.ts`, `packages/shared/src/schemas/chat.schema.ts`.
- 프롬프트 경로: `packages/server/src/routes/generate/dry-run-route.ts`, `packages/server/src/services/generation/game-gm-prompt-runtime.ts`, `packages/server/src/routes/chats.routes.ts`의 실시간 미리보기 부분.
- 로어북 근거 연결과 활성화: `packages/server/src/services/lorebook/`, `packages/server/src/routes/spatial-context.routes.ts`, `packages/client/src/features/spatial-context/components/LocationInspector.tsx`, 로어북 편집기, **Active Context** UI.
- 위치 참조 아트: `packages/server/src/db/schema/gallery.ts`, 갤러리 저장과 경로, `packages/server/src/services/image/`, `packages/server/src/routes/generate/illustrator-references.ts`, `packages/server/src/routes/game.routes.ts`의 Game 일러스트와 스토리보드 조립, `packages/server/src/services/storage/game-storyboards.storage.ts`, 공용 스토리보드 프롬프트 계약, `packages/client/src/features/spatial-context/components/LocationInspector.tsx`, 이미지 생성 UI와 스토리보드 미리보기 UI.
- 클라이언트 라우팅과 전송 경로: `packages/client/src/stores/ui.store.ts`, `packages/client/src/stores/chat.store.ts`, `packages/client/src/components/layout/AppShell.tsx`, `packages/client/src/components/chat/ChatSettingsDrawer.tsx`, `packages/client/src/components/chat/ChatArea.tsx`, `packages/client/src/components/chat/ChatRoleplaySurface.tsx`, `packages/client/src/components/chat/ChatInput.tsx`, `packages/client/src/components/game/GameSurface.tsx`, `packages/client/src/components/game/GameInput.tsx`.
- 이식성과 검증: `packages/server/src/routes/chats.routes.ts`와 `packages/server/src/services/import/`의 네이티브 채팅 가져오기/내보내기 코드, `scripts/regressions/`, `e2e/core-flows.e2e.ts`, 루트 `package.json` 스크립트.

이 파일 목록은 경계일 뿐, 하나의 풀 리퀘스트에서 모든 파일을 고쳐야 한다는 뜻은 아닙니다. 아래 각 작업 패키지는 변경 범위를 좁게 유지해야 합니다.

### 저장 계약

정의는 채팅 메타데이터 안에 남고, 분기가 채팅 메타데이터를 복사할 때 함께 복사됩니다. 런타임 상태는 별도 테이블을 씁니다.

```ts
interface SpatialContextSnapshotRow {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  source: "bootstrap" | "owner_turn" | "assistant_swipe" | "definition_repair" | "branch_copy";
  transitionCommandId: string | null;
  transitionPayloadHash: string | null;
  createdAt: string;
}
```

필요한 인덱스와 불변 조건:

- `(chatId, messageId, swipeIndex)`마다 유효한 행은 하나입니다.
- 전환 명령 ID는 null이 아닐 때 그 채팅 안에서 고유합니다.
- 목적지, 예상 리비전, 예상 현재 위치가 다른데 같은 명령 ID가 다시 오면 `409 spatial_transition_command_mismatch`를 반환합니다.
- 페이로드가 같은 명령 ID가 다시 오면 `409 spatial_transition_already_applied`를 반환하고, 커밋된 스냅샷과 사용자 메시지 ID를 함께 담으며, 두 번째 쓰기는 하지 않습니다. 클라이언트는 턴을 다시 보내는 대신 그 응답으로 상태를 맞춥니다.
- 스냅샷 행은 안정적인 위치 ID를 씁니다. 이름 변경과 상위 변경은 스냅샷을 다시 쓰지 않습니다.
- 부트스트랩 행은 커밋된 메시지 기준점이 생길 때까지 `messageId: ""`와 스와이프 `0`을 씁니다.
- 채팅, 메시지, 스와이프를 삭제하면 지금 Game 및 턴 Game 스냅샷을 관리하는 바로 그 자리에서 해당 공간 행도 지우거나 밀어 줍니다.

새 테이블은 파일 테이블 정의, 파일 기반 테이블 목록, 캐스케이드 그래프, 프로필 백업 및 복원, Mari DB 무결성 메타데이터에 등록해야 합니다. 조회 동작은 파일 기반 회귀 검증으로 다뤄야 합니다.

### 유효 상태와 기록 규칙

API, 프롬프트, 분기, 클라이언트 응답에 모두 하나의 리졸버를 씁니다.

1. 특정 메시지와 스와이프를 요청하면 그 공간 스냅샷을 반환합니다.
2. 현재 화면에서는 마지막으로 보이는 어시스턴트 메시지와 그 활성 스와이프를 봅니다.
3. 그 어시스턴트 스와이프에 행이 없으면, 보이는 메시지 순서에서 가장 가까운 사용자 턴 또는 어시스턴트 스냅샷까지 거슬러 올라갑니다.
4. 그래도 없으면 부트스트랩 행으로 되돌아갑니다.
5. 스냅샷이 하나도 없고 활성화된 정의에 유효한 시작 위치가 있으면, 메모리상의 시작 상태를 반환하고 첫 소유자 턴에서 실제로 만듭니다.

소유자 턴 기준점 잡기:

- 저장 전에는 타임스탬프만 보고 가장 새 행을 고르지 말고, 현재 보이는 기록에서 원본 상태를 해석합니다.
- 원자적 턴 트랜잭션 안에서 사용자 메시지, 첫 스와이프, 채팅 타임스탬프, 그리고 그 사용자 메시지에 고정된 `owner_turn` 공간 스냅샷을 만듭니다.
- 어시스턴트 응답을 저장한 뒤에는 같은 상태를 그 `(messageId, swipeIndex)`에 `assistant_swipe`로 만듭니다.
- 제공자 호출이 실패하거나 중단되어도 수락된 사용자 턴과 그 공간 스냅샷은 커밋된 채로 남습니다. 그래서 다시 불러오면 어시스턴트 응답을 지어내지 않고 이동과 저장된 사용자 메시지를 보여 줍니다.
- 재생성은 대상 어시스턴트 메시지 바로 앞의 상태를 해석해 새 스와이프에 씁니다. 이어 쓰기는 대상 스와이프의 상태를 유지합니다.
- 스와이프를 고르면 기존 활성 스와이프 행을 통해 유효 상태가 바뀝니다. 다른 스냅샷을 다시 쓰지는 않습니다.
- 분기를 만들면 정의를 복사하고, 복사된 모든 공간 스냅샷의 키를 새 메시지 ID로 바꾸며, 부트스트랩 행도 포함합니다. 앞쪽 메시지에서 만든 분기는 선택한 지점에서 복사를 멈춥니다.
- Game 체크포인트는 해당하는 공간 스냅샷 ID를 저장하거나, 그 현재 위치와 정의 리비전의 안정적인 사본을 저장합니다. 체크포인트를 불러오면 Game 상태와 공간 상태를 함께 복원합니다.

정의 편집에는 기록이 남지 않습니다. 안정적인 위치 ID는 그 분기의 현재 정의로 해석되므로, 이름이나 상위를 바꾸면 예전 스냅샷에 표시되는 브레드크럼도 바뀝니다. 예전 스냅샷이 보관된 위치를 가리킬 수도 있습니다. 그래도 읽을 수는 있지만, 다음 목적지는 활성 상태이면서 도달 가능한 노드여야 합니다. 편집기가 지금 유효한 위치를 보관 처리하면 `replacementCurrentLocationId`가 필요하며, 서버는 새 정의 리비전과 같은 트랜잭션에서 현재 보이는 기준점에 `definition_repair` 스냅샷을 씁니다.

### 원자적 소유자 턴 절차

`generateRequestSchema`와 클라이언트 생성 계약에 선택 항목 `pendingSpatialTransition`을 추가합니다. 이 값은 Roleplay와 Game 소유자 채팅에서만 받습니다.

서버 절차는 다음과 같습니다.

1. 기존의 채팅별 생성 잠금을 획득합니다.
2. 요청 수명 주기 안에서 요청을 파싱하고 채팅을 불러옵니다.
3. 공간 전환이 없으면 기존 메시지 흐름을 그대로 유지합니다.
4. 전환이 있으면 크기가 일정한 데이터베이스 트랜잭션을 시작합니다.
5. 트랜잭션 안에서 정의와 보이는 상태를 다시 읽습니다.
6. 소유자 모드, 활성화 상태, 예상 정의 리비전, 예상 현재 위치, 명령 ID, 목적지 상태, 도달 가능성을 검증합니다.
7. 트랜잭션에 묶인 채팅 저장 인스턴스로 사용자 메시지와 첫 스와이프를 만듭니다.
8. 공간 스냅샷을 넣고 채팅 타임스탬프를 업데이트합니다.
9. Game에서는 가능한 범위에서 보이는 Game 스냅샷도 같은 트랜잭션에서 커밋합니다.
10. 커밋한 뒤, 첨부 파일 보강, 페르소나 스냅샷 저장, 프롬프트 조립, 제공자 작업은 트랜잭션 밖에서 이어 갑니다.

검증 실패는 낙관적 클라이언트 상태가 기준으로 굳기 전에 일어납니다. `400` 그래프 오류나 목적지 오류, `409` 오래된 상태 오류에는 안정적인 기계 판독용 코드, 사용자에게 보여도 안전한 문구, 현재 리비전, 현재 브레드크럼이 들어갑니다. 숨김이나 차단 상태인 목적지 이름은 절대 들어가지 않습니다.

클라이언트는 서버가 턴을 수락할 때까지 제출한 텍스트, 첨부 파일, 대기 중 목적지를 유지합니다. 충돌이 나면 낙관적 메시지를 지우고, Spatial Context 쿼리를 새로 고치고, 초안을 되살리고, `Review destinations`를 제안합니다. 수락되면 이 셋을 한꺼번에 정리합니다.

### 공용 프로젝션 계약

리졸버는 프롬프트 텍스트를 만들기 전에 구조화된 데이터를 반환합니다.

```ts
interface ResolvedOwnerSpatialProjection {
  kind: "owner";
  chatId: string;
  ownerMode: SpatialOwnerMode;
  definitionRevision: number;
  currentLocationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  description: string;
  modelMemory: string | null;
  lorebookEntryIds: string[];
  destinations: Array<{ id: string; name: string; label?: string }>;
  omittedDestinationCount: number;
}

interface ResolvedLocationVisualProjection {
  chatId: string;
  messageId: string | null;
  swipeIndex: number | null;
  locationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  visualIdentity: string | null;
  references: Array<{
    imageId: string;
    role: LocationVisualReferenceRole;
    usageNote: string | null;
    sourceLocationId: string;
    inherited: boolean;
  }>;
}

interface StoryboardVisualReferenceCandidate {
  imageId: string;
  source: "explicit" | "location" | "character" | "persona" | "inherited_style";
  entityId?: string;
  label: string;
  role: string;
  order: number;
}

interface StoryboardKeyframeReferencePayload {
  keyframeIndex: number;
  imageIds: string[];
  omitted: Array<{
    imageId: string;
    reason: "provider_limit" | "not_visible" | "missing" | "setting_disabled";
  }>;
}

interface StoryboardVisualReferenceManifest {
  sourceMessageId: string;
  sourceSwipeIndex: number;
  locationId: string | null;
  definitionRevision: number | null;
  provider: string;
  model: string;
  providerReferenceLimit: number;
  status: "ready" | "needs_review";
  candidates: StoryboardVisualReferenceCandidate[];
  keyframes: StoryboardKeyframeReferencePayload[];
  createdAt: string;
}
```

프롬프트 제한은 저장 제한과 별개입니다.

- 브레드크럼 노드는 최대 20개.
- 소유자 설명은 최대 4,000자.
- 비공개 모델 기억은 최대 8,000자.
- 목적지는 `sortOrder`, 이름, ID 순의 결정적 순서로 최대 50개이며, 그 뒤에는 생략 개수만 붙습니다.
- 현재 위치 로어북 참조는 로어북 처리기가 항목 예산과 토큰 예산을 적용하기 전 기준으로 최대 50개.
- 위치당 저장 시각 참조는 최대 6개이고, 제공자의 총 참조 한도를 적용하기 전 일반 장면 요청의 위치 참조 후보는 최대 2개.
- 스토리보드 매니페스트는 감사와 새로고침을 위해 해석된 후보 ID를 전부 남길 수 있지만, 각 키프레임 페이로드는 매니페스트를 만들 때 기록한 제공자 한도까지만 담습니다.
- 연결용 `awarenessSummary` 또는 대체 공개 설명 발췌는 최대 1,000자.

포매터 하나가 공용 구조의 소유자 블록을 만듭니다. Roleplay와 Game은 그 블록을 감싸는 얇은 어댑터를 씁니다. 포매터는 `lorebookEntryIds`를 절대 직렬화하지 않습니다. 그 값은 소유자 프롬프트 파이프라인이 로어북 처리기를 통해 소비합니다. Phase 3에서만 도입하는 두 번째 포매터는 사생활 보호를 위해 축소된 Conversation 블록을 만들며 위치 로어 필드를 받지 않습니다.

모든 실시간 경로는 최종 모델 요청을 준비하기 직전에 같은 리졸버와 포매터를 호출합니다.

- 일반 Roleplay 생성.
- Game GM 생성.
- `/api/generate/dryRun`.
- 저장된 요청이 정확히 남아 있지 않을 때의 실시간 **Peek Prompt** 조립.
- 프롬프트를 다시 만드는 재시도 경로와 이어 쓰기 경로.

캐시된 정확한 **Peek Prompt**에는 새 조립이 필요 없습니다. 이미 저장된 제공자 요청을 그대로 보여 주며, 거기에는 그 스와이프에 쓰인 공간 블록이 들어 있어야 합니다. 회귀 검증은 같은 픽스처에 대해 실시간 생성, 드라이런, 실시간 **Peek Prompt**의 정규화된 공간 블록을 비교해야 합니다.

### 로어북 근거 초안 계약

지도 근거 연결은 명시적인 제작 입력입니다.

```ts
interface SpatialMapGroundingRequest {
  mode: "setup_only" | "lore_strict" | "lore_expand";
  lorebookIds: string[];
  entryIds?: string[];
}
```

Game 설정은 `lorebookIds`의 기본값을 `GameSetupConfig.activeLorebookIds`에서 가져옵니다. Roleplay는 채팅의 활성 전역 로어북, 연결된 로어북, 고정된 로어북에서 가져옵니다. 제작자는 생성 전에 선택을 바꿀 수 있습니다. 비활성화했거나 명시적으로 제외한 로어북과 항목은 절대 보내지 않습니다.

이것은 로어북 활성화 스캔이 아닙니다. 서버는 선택한 출처를 직접 읽고, 지원되는 매크로를 소유자 설정 컨텍스트로 해석하되 그 결과 텍스트를 저장하지는 않으며, 다음을 담은 카탈로그를 만듭니다.

- 임시 출처 키
- 항목 이름과 로어북 이름
- 활성화 키와 태그
- 있는 경우 항목 설명
- 없으면 길이를 제한한 내용 발췌

카탈로그 크기는 항목 100개, 16,000자, 그리고 설정, 시스템, 요청 출력 공간을 확보하고 남은 연결 컨텍스트 가운데 가장 작은 값으로 제한합니다. 우선순위는 결정적입니다.

1. 명시적으로 선택한 `entryIds`.
2. 위치를 가리키는 태그, 이름, 키가 있는 항목.
3. 제작자가 설명을 쓴 항목.
4. 안정적인 로어북 순서와 항목 순서에 따른 나머지 항목.

항목이 빠지면 미리보기가 그 개수를 알리고 **Refine sources**를 제안합니다. 로어북 전체를 검토한 것처럼 보이게 하지 않습니다.

단순화한 모델 계획은 제안된 각 위치에 임시 출처 키를 붙입니다. 서버는 모르는 키를 거부하고, 유효한 키를 안정적인 항목 ID로 매핑하고, 중복을 없애고, 미리보기용 출처 표시를 계산합니다.

- `Lore-backed`: 검증된 출처 항목이 하나 이상 있습니다.
- `Inferred`: 출처 자료에서 끌어낸 관계나 포함 관계이지만 그 자체로 출처 항목은 아닙니다.
- `Added by AI`: 노드를 뒷받침하는 출처 항목이 없습니다.

`lore_strict`는 검증된 출처 키가 없는 노드를 모두 거부합니다. `lore_expand`는 추론 노드와 추가 노드를 받아들이되 눈에 띄게 표시합니다. 유효한 출처 키는 출처가 있다는 것을 증명할 뿐 의미가 정확하다는 뜻은 아닙니다. 제작자가 **Apply** 전에 잘못 읽은 관계나 이름을 잡아낼 수 있도록 미리보기가 출처 발췌를 보여 줘야 합니다.

생성 엔드포인트는 정규화된 초안 정의와 함께, 생성된 위치 ID를 키로 하는 임시 출처 표시 맵을 반환합니다. **Save** 이후에 남는 것은 `lorebookEntryIds`뿐입니다. 교체와 확장에는 기존 기록 보호가 그대로 적용되며, 확장은 새 노드에 연결을 더할 수는 있어도 기존 위치나 연결을 다시 쓸 수는 없습니다.

### Game 호환성 경계

Game 채팅에서 Spatial Context를 켜면 다음과 같습니다.

- `SpatialContextSnapshot.currentLocationId`가 기준입니다.
- Game 상태의 `location`은 호환용 프로젝션일 뿐입니다.
- Game 상태 GET 응답과 트래커 UI는 해석된 브레드크럼을 표시 위치로 받습니다.
- 세계 상태 에이전트가 보내는 패치와 수동 Game 트래커 패치는 `location`을 독자적으로 쓸 수 없습니다. 서버는 그 필드를 버리고 디버그 진단을 남기거나, 명시적인 수동 편집에는 필드 단위 충돌을 반환합니다.
- 새 Game 스냅샷은 세션 기록과 기존 UI를 계속 읽을 수 있도록 브레드크럼을 레거시 `location` 값에 그대로 옮겨 담지만, 프롬프트 코드는 여전히 공간 프로젝션을 읽습니다.
- Game 지도, 그리드 칸, 노드는 안정적인 계층 구조 위치 ID에 명시적으로 연결할 수 있습니다.
- 연결된 목적지를 고르면 구조화된 대기 중 공간 전환이 만들어지고, 이동을 서술하는 문장은 넣지 않습니다.
- 연결되지 않은 칸과 노드의 이동은 전술적 이동으로 남아 파티 위치만 바꿉니다.
- 연결된 위치에 들어가면 가능한 경우 그 로컬 지도를 고르고, 나가면 가능한 경우 가장 가까운 연결된 조상 지도를 고릅니다.
- 둘 다 보일 때 UI는 두 시스템을 `Story location`과 `Map position`으로 구분해 표시합니다.
- Spatial Context를 끄면 공간 정의나 스냅샷을 지우지 않고 곧바로 기존 레거시 Game 위치 동작으로 돌아갑니다.

부정 검증에서는 모델이 내보낸 Game 위치 패치, 수동 트래커 편집, 연결되지 않은 지도 클릭이 `currentLocationId`를 바꿀 수 없음을 증명해야 합니다. 긍정 검증에서는 유효한 연결 클릭이 일반 전환 검증기를 거친다는 것을 증명합니다.

### 소유자 UI 계약

**Chat Settings**에는 Roleplay와 Game에만 간결한 `Hierarchical Map` 섹션 하나를 추가합니다. 활성화 상태, 현재 브레드크럼, 활성 및 보관 개수, 경고 개수, `Open Map Editor`를 보여 줍니다. 전체 편집기를 패널 안에 넣지는 않습니다.

**Location Editor**는 기존 전체 화면 편집기 경로를 따릅니다.

- 데스크톱에서는 계층 구조 내비게이터, 로컬 지도 또는 레이어 뷰, 선택한 위치의 인스펙터를 씁니다.
- 모바일에서는 계층 구조를 먼저, 상세를 다음에 보여 주고 **Back to locations** 동작을 눈에 띄게 둡니다. 어떤 조작도 마우스 올리기나 끌기에 의존하지 않습니다.
- 각 행은 자식 추가, 형제 추가, 상위 변경, 하위 트리 복제, 보관, 링크 동작을 라벨이 붙은 컨트롤로 제공합니다.
- 로컬 뷰는 자식을 좌표가 있는 지도 노드, 순서 있는 레이어, 접근성 있는 목록으로 그립니다.
- 선택하면 위치를 미리 보고, 이동은 별도의 **Enter** 동작으로 합니다.
- 인스펙터에는 이름, 종류, 공개 설명, 비공개 모델 기억, 아이콘, 표현 방식, 배치나 레이어 순서, 상태, 상위, 직접 링크, 연결된 로어가 들어갑니다.
- 시각 정체성은 화면을 가리는 창이 아니라 인스펙터 안의 인라인 섹션입니다. 대표 미리보기를 먼저 보여 주고, 이어서 보조 참조, 역할, 사용 메모, 상속 상태, 끊어진 상태, 이미지 출처 메타데이터를 보여 줍니다.
- 갤러리 선택과 업로드는 기존 이미지 컨트롤을 그대로 씁니다. `Generate establishing reference`는 미리보기를 열고, 이미지를 받아들이는 동작과 대표로 지정하는 동작은 각각 명시적입니다.
- 생성된 장면에는 기존 이미지 동작에서 `Set as location reference`를 제공합니다. 그 장소에서 장면이 생성되었다는 이유만으로 위치를 바꾸는 일은 절대 없습니다.
- 연결된 로어는 화면을 가리는 창이 아니라 검색 가능한 인라인 펼침 영역을 씁니다. 결과는 로어북별로 묶고, 첨부 전에 비활성이나 제외 상태를 드러냅니다.
- 첨부된 행은 **Open entry**와 **Detach**를 제공합니다. **Detach**는 로어를 삭제하지 않으며, 하위 트리 복제는 연결도 함께 복사합니다.
- 로어북 편집기는 현재 채팅의 지도 역링크를 보여 주므로, 제작자가 한 항목을 쓰는 모든 위치를 찾을 수 있습니다.
- AI 초안 컨트롤은 출처 로어북, 근거 모드, 검토한 항목 수와 빠진 항목 수, 출처 표시를 프롬프트 지식 없이도 알아볼 수 있게 보여 줍니다.
- 검증은 인라인으로 표시하고 **Save** 근처에도 요약합니다. 요약 항목을 고르면 해당 노드와 입력란에 포커스가 갑니다.
- 편집기는 로컬 작업 사본과 리비전을 쓰는 **Save** 동작 하나를 씁니다. `editorDirty`가 화면 이동을 막아 줍니다. 서버 충돌이 나면 작업 사본을 지키고 **Reload server version** 또는 **Review differences**를 제안하며, 그냥 덮어쓰는 길은 없습니다.
- 빈 상태는 첫 동작을 알려 줍니다. `Create a starting location`입니다. 유효한 활성 시작 위치가 생기기 전에는 활성화할 수 없습니다.
- 로딩은 기존 편집기 스켈레톤 표현을 씁니다. 저장, 충돌, 보관, 숨김, 차단, 오류 상태는 색뿐 아니라 텍스트나 아이콘으로도 구분합니다.

소유자 채팅 화면은 `SpatialContextRuntimeBar`를 함께 씁니다.

- 저장된 브레드크럼은 스토리 내용을 가리지 않고 입력란 위나 옆에 보입니다.
- 목적지 선택기는 상위, 자식, 직접 링크를 라벨이 붙은 그룹으로 나열하면서 결정적 순서를 유지합니다.
- 목적지를 고르면 분명한 라벨이 붙은 대기 칩이 만들어집니다. 상태가 곧바로 바뀌지는 않습니다.
- 칩은 지울 수 있고, 채팅을 바꾸거나 다시 불러와도 텍스트 초안과 함께 남습니다.
- 보낼 때는 텍스트, 첨부 파일, 또는 대기 중 목적지만 있어도 됩니다. 전환은 요청 데이터이며 보이는 메시지 텍스트에 붙지 않습니다.
- 충돌 뒤에도 오래된 대기 목적지는 `Needs review` 표시와 함께 계속 보이며, 사용자가 유효한 대체 목적지를 고르거나 지울 때까지 남습니다.
- 화면이 좁으면 브레드크럼을 가운데에서 줄이되 현재 위치 이름은 남기고, 전체 경로는 접근성 있는 펼침 영역으로 제공합니다.

편집기와 런타임 컨트롤은 기존 시맨틱 테마 토큰을 쓰고, 다크 테마, 라이트 테마, SillyTavern 테마를 지원하며, 모바일 주요 동작에 44px 터치 영역을 유지하고, 눈에 보이는 포커스 상태를 포함합니다. 움직임은 150에서 250 ms까지의 상태 전환으로 제한하고, 장식만을 위해 레이아웃을 움직이지 않습니다.

### 이식성과 수명 주기 범위

Marinara 네이티브 채팅 내보내기에는 다음이 담겨야 합니다.

- `marinara_metadata` 안의 현재 정의.
- 표시 이름이 아니라 내보낸 메시지 순번과 스와이프 인덱스를 키로 하는 공간 스냅샷.
- 있는 경우 부트스트랩 스냅샷.

가져오기는 정의 안의 위치 ID는 유지하면서 채팅, 메시지, 스냅샷 ID를 새로 만듭니다. 가져온 그래프가 잘못되어 있으면 Spatial Context를 끄고, 복구할 수 있도록 원본 정의를 보존하며, 경고를 반환합니다. 조용히 이름으로 대조하거나 일부만 활성화하는 일은 절대 없습니다.

채팅 JSONL 내보내기는 위치와 항목을 잇는 ID가 정의의 일부이므로 그대로 보존하지만, 로어북 내용을 조용히 함께 담지는 않습니다. 가져오기는 그 참조를 대상 프로필에서 해석하고, 없는 항목은 이름 대조 없이 고칠 수 있는 경고로 알립니다. 프로필 백업과 복원은 공간 정의와 로어북 테이블을 모두 담기 때문에 참조가 살아 있는 상태로 유지됩니다. 앞으로 명시적인 캠페인 패키지가 생기면 프로필 간 이식을 위해 참조된 로어북을 함께 담을 수 있습니다.

채팅 JSONL은 위치와 이미지를 잇는 ID, 역할, 사용 메모, 순서도 보존하지만 이미지 바이트를 넣지는 않습니다. 가져오기는 그 ID를 대상 프로필에서 해석하고, 없는 이미지는 경로나 파일 이름 대조 없이 고칠 수 있는 경고로 알립니다. 프로필 백업과 복원에는 프로필 갤러리 기록과 파일이 들어갑니다. 앞으로 명시적인 캠페인 패키지가 생기면 내보내기 전에 자산 개수, 총 용량, 라이선스 안내와 함께 `Include location images`를 제안할 수 있습니다.

기존 스토리보드 수명 주기를 내보내거나 복사할 때, 시각 매니페스트는 원본 메시지 순번과 스와이프, 해석된 위치 ID, 후보 이미지 ID, 키프레임 순서를 바이트 없이 보존합니다. 가져오기는 메시지 ID와 스토리보드 ID를 다시 매핑하고, 갤러리 이미지 ID를 대상 프로필에서 해석하며, 없는 자산은 `needs_review`로 표시합니다. 매니페스트가 없는 예전 스토리보드는 첫 재생성 때 저장된 원본 메시지와 스와이프에서 매니페스트를 만들어 냅니다. 이름 대조나 채팅의 최신 위치로 넘어가는 일은 절대 없습니다.

프로필 백업과 복원은 `FILE_BACKED_TABLES`를 통해 새 테이블을 포함합니다. 채팅 삭제, 일괄 삭제, 완전 삭제, 분기 삭제, 스와이프 삭제, 메시지 삭제는 기존 캐스케이드 및 정리 경로를 따릅니다. 메타데이터가 없으면 Spatial Context가 꺼진 상태이므로, 기존 채팅은 서둘러 이전할 필요가 없습니다.

### 작업 패키지와 병합 순서

#### Package A: 코어 계약과 검증 스파이크

- 공용 타입, 스키마, 순수 그래프 헬퍼, 제한, 픽스처, 안정적인 오류 코드를 추가합니다.
- 파일 기반 저장소에서 크기가 일정한 트랜잭션을 확인할 임시 검증 하네스를 추가합니다. `.test.ts` 파일은 남기지 마세요.
- 부트스트랩, 보이는 스와이프, 더 이른 분기 지점, 보관된 과거 현재 위치, 오래된 정의 픽스처로 상태 리졸버를 증명합니다.
- 얕은 그래프, 깊이 20 그래프, 폭 500 그래프, 긴 텍스트 그래프, 링크가 많은 그래프의 프로젝션 크기를 측정합니다.

통과 기준: UI 작업을 시작하기 전에 그래프 의미, 프로젝션 상한, 스냅샷 기준점, 트랜잭션 실현 가능성을 보여 줍니다.

#### Package B: 정의 API와 저장

- 스키마, 마이그레이션, 파일 기반 등록, 저장 어댑터, GET, 리비전을 쓰는 PUT을 추가합니다.
- 보관 작업을 위한 현재 위치 교체를 추가합니다.
- 삭제, 스와이프 이동, 프로필 백업 및 복원을 연결합니다.
- 리비전 충돌, 잘못된 그래프, 숨김 관련 오류, 명령 재사용에 대한 서버 회귀 검증을 추가합니다.

통과 기준: 정의와 스냅샷이 두 저장 백엔드에서 모두 왕복하고, 잘못된 쓰기가 어떤 부분 상태도 남기지 않습니다.

#### Package C: 소유자 턴 기록 통합

- 생성 요청에 `pendingSpatialTransition`을 추가합니다.
- 원자적 소유자 턴 저장과 어시스턴트 스와이프 상태 생성을 추가합니다.
- 재생성, 이어 쓰기, 활성 스와이프, 분기, Game 체크포인트를 통합합니다.
- 정의와 스냅샷의 네이티브 채팅 내보내기/가져오기를 추가합니다.

통과 기준: 다시 불러오기, 제공자 실패, 스와이프 변경, 앞쪽 메시지 분기, 가져오기/내보내기, 체크포인트 복원이 예상한 위치를 해석합니다.

#### Package D: 프롬프트 프로젝션과 Game 기준 정리

- 구조화된 프로젝션과 길이를 제한한 포매터를 추가합니다.
- 실시간 생성, Game GM, 드라이런, 실시간 **Peek Prompt**, 재시도, 이어 쓰기를 통합합니다.
- Game 호환성 경계와 트래커 브레드크럼 표시를 적용합니다.
- 사생활 보호와 비활성 위치에 대한 부정 검증을 추가합니다.

통과 기준: 모든 프롬프트 경로에 같은 공간 블록이 들어가고, 관련 없는 위치 텍스트가 새지 않으며, Game이 경쟁하는 기준 위치를 따로 유지할 수 없습니다.

#### Package E: 지도 브라우저와 편집기

- React Query 훅, 충돌 매핑, 설정 요약, 지연 로딩 편집기 경로를 추가합니다.
- 계층 구조, 로컬 지도, 레이어, 목록, 미리보기, 인스펙터, 하위 트리 복제 흐름을 추가합니다.
- 접근성 있는 데스크톱 상태와 모바일 상태를 추가합니다.
- 리비전 충돌이 나도 저장하지 않은 편집을 보존합니다.

통과 기준: 제작자가 끌기, 마우스 올리기, 정밀 입력 없이도 중첩 지도를 만들고 고칠 수 있습니다.

#### Package E.1: AI 보조 지도 초안 작성

- 범위를 제한한 Game 또는 Roleplay 설정 컨텍스트를 쓰는 필요 시 생성기를 추가합니다. 턴 진행 중에 암묵적으로 상태를 바꾸는 일은 없습니다.
- 단순화된 키 기반 지도 계획을 생성한 뒤, 안정적인 ID를 부여하고, 안전한 배치 누락을 보정하고, 완성된 정의를 서버에서 검증합니다.
- 편집기 상태를 교체하기 전에 생성된 계층 구조를 로컬 초안으로 미리 봅니다.
- **Apply**와 **Save** 동작을 명시적으로 요구합니다. 생성만으로 Spatial Context가 켜지거나 정의가 저장되는 일은 없습니다.
- 일반 채팅 기록은 생성 프롬프트에 넣지 않고, 최종 프롬프트는 디버그 로그로 확인할 수 있게 합니다.

통과 기준: 기술을 모르는 제작자가 세계를 설명하고, 유효한 중첩 지도를 받고, 살펴본 뒤, **Save** 전까지 저장 상태를 바꾸지 않고 거절하거나 적용할 수 있습니다.

#### Package E.1.1: 기록 안전 AI 지도 확장

- 지도 전체를 AI로 만드는 작업은 캠페인 시작 전 워크플로로 다룹니다. 메시지에 연결된 공간 기록이 생긴 뒤에는 기존 위치 ID를 서버에서 모두 보존합니다.
- 진행 중인 캠페인에서는 전체 생성기를 대신해, 선택한 활성 위치를 범위로 하는 추가 전용 확장 워크플로를 씁니다.
- 현재 위치, 시작 위치, 기존 설명, 링크, 배치, 보관된 노드, 앞으로의 Game 연결을 보존합니다. 새로 안정적인 ID를 받는 것은 추가된 위치뿐입니다.
- 확장은 일반 턴 기록이 아니라 범위를 제한한 설정과 선택한 위치의 컨텍스트를 바탕으로 합니다.
- 새 위치를 로컬 초안으로 미리 보고 기존의 **Apply** 및 **Save** 경계를 유지합니다.
- 지도 전체 교체는 커밋된 공간 기록이 생기기 전에만 허용하고, 지도가 이미 있으면 확장을 더 안전한 기본값으로 둡니다.

통과 기준: AI가 턴 스냅샷을 고아로 만들거나 현재 위치를 바꾸거나 기존 ID를 교체하지 않고도 진행 중인 캠페인 지도를 넓힐 수 있습니다.

#### Package E.2: Game 설정 마법사의 지도 옵션

- 기존 **Features** 단계에 선택 항목 `Draft a hierarchical world map`과 간단한 크기 선택을 추가합니다.
- 지도 생성은 `/game/setup`이 세계 개요와 스토리 아크를 저장한 뒤에만 실행합니다. 게임 플레이 턴은 필요하지 않습니다.
- 후속 초안을 만드는 동안, 보정된 설정 페이로드를 적용한 뒤까지 포함해 설정 화면이 진행 중임을 보여 줍니다.
- 생성이 끝나면 평소의 AI 미리보기와 지도 편집기를 엽니다. 건너뛰기는 게임으로 돌아가고, **Apply**는 작업 사본만 바꾸며, 저장 경계는 **Save**입니다.
- 지도 생성에 실패하면 성공적으로 만들어진 게임은 그대로 두고, 실패 이유를 설명하고, 나중에 **Chat Settings**에서 지도를 만들 수 있게 합니다.
- 좁은 설정 마법사에 전체 지도 편집기를 넣거나, 생성된 정의를 조용히 켜고 저장하지 마세요.

통과 기준: 제작자가 마법사의 불완전한 로컬 상태로 생성하거나 검토를 건너뛰지 않고도, 설정 단계에서 더 풍부한 초기 지도를 요청할 수 있습니다.

#### Package F: Roleplay와 Game 런타임 UI

- 공용 런타임 바와 채팅별 대기 중 전환 저장을 추가합니다.
- 보이는 메시지 텍스트를 바꾸지 않고 Roleplay와 Game의 전송 경로를 통합합니다.
- 명시적인 Game 지도, 칸, 노드 연결 컨트롤을 추가합니다.
- 전환이 수락되면 연결된 지도를 고르면서도 연결되지 않은 전술 이동은 유지합니다.

통과 기준: Roleplay와 Game에서 이동하고, 오래된 상태에서 회복하고, 다시 불러오고, 채팅을 바꾸고, 키보드와 터치로 기능을 쓸 수 있습니다.

#### Package F.1: 위치 로어북 연결과 런타임 활성화

- 공용 스키마와 편집기 작업 사본에 개수를 제한한 `lorebookEntryIds`를 추가합니다.
- 인라인 지도 첨부 컨트롤, 로어북 역링크, 끊어진 참조 경고를 추가합니다.
- 공용 로어북 처리에 강제 후보 ID, 활성화 출처 중복 제거, 제외 처리, 예약된 위치 로어 상한을 추가합니다.
- 같은 리졸버를 Roleplay, Game GM, 드라이런, 실시간 **Peek Prompt** 경로에 통합합니다.
- **Active Context**에 출처와 잘림 보고를 추가합니다.
- 분기와 JSONL 내보내기/가져오기 흐름에서 참조 ID를 보존하고, 대상에 로어가 없으면 경고합니다.

통과 기준: 위치를 옮기면 모든 소유자 프롬프트 경로에서 목적지의 활성 첨부 로어만 작동하고, 중복 주입이나 Conversation 유출이 없습니다.

#### Package F.2: 로어북에 근거한 지도 초안 작성

- 생성, 교체, 확장 요청에 근거 모드와 명시적인 출처 선택을 추가합니다.
- 일반 채팅 훑기가 아니라 선택한 로어북에서 제한된 출처 카탈로그를 만듭니다.
- 임시 출처 키를 검증하고, 유효한 항목을 생성된 노드에 자동으로 연결합니다.
- 초안 미리보기에 `Lore-backed`, `Inferred`, `Added by AI` 출처 표시와 출처 확인 기능을 보여 줍니다.
- `Strict canon`에서는 출처 기반 노드만 허용하고, `Canon with expansion`에서는 근거 없는 추가를 눈에 띄게 표시합니다.
- 기록 안전한 추가 전용 확장과 기존의 **Apply** 후 **Save** 검토 경계를 유지합니다.

통과 기준: 선택한 로어북 사실이 생성된 계층 구조의 직접적인 근거가 되고, 근거 없는 위치가 **Save** 전에 모두 드러나며, 엄격 모드에서는 참조 없는 생성 노드를 저장할 수 없습니다.

#### Package F.3: 위치 시각 정체성과 장면 아트 참조

- 위치 스키마와 편집기 작업 사본에 길이를 제한한 시각 정체성 텍스트와 안정적인 프로필 갤러리 연결을 추가합니다.
- 인라인 시각 정체성 편집기, 대표와 보조 역할, 명시적 스타일 상속, 갤러리 역링크, 끊어진 참조 복구를 추가합니다.
- 채팅별 Illustrator 설정과 Game 제공자 사용 설정을 나란히 추가하고, 첫 대표 지정 시 동의를 받으며, 하위 호환을 위해 기본값은 꺼짐으로 둡니다.
- 필요 시 설정 참조 생성과, 검토를 마친 생성 장면의 명시적 승격을 추가합니다.
- Roleplay Illustrator와 Game 장면 아트 요청에 해당하는 메시지와 스와이프의 위치를 해석합니다.
- 명시적, 위치, 캐릭터, 페르소나, 상속 스타일 후보를 각 제공자의 기존 한도 아래에서 결정적으로 합치고, 누락 사유를 보여 줍니다.
- 분기와 JSONL에서 ID와 메타데이터를 보존하고, 프로필 백업 및 복원에 바이너리를 포함하며, 스토리 프롬프트와 Conversation 부정 검증을 추가합니다.

통과 기준: 한 위치에서 반복 생성하는 아트가 검토를 마친 장소 정체성을 재사용하면서 캐릭터 참조와의 절충을 결정적이고 눈에 보이게 처리하고, 과거 메시지의 아트는 그 시점의 위치를 해석하며, 시각 전용 데이터가 텍스트 프롬프트로 새지 않습니다.

#### Package F.3.1: 스토리보드 시각 참조 매니페스트

- F.3.1은 F.3의 하위 소비자이자 별도로 검토할 변경으로 유지합니다. F.3의 저장 통과 기준을 넓히지 않습니다.
- 스토리보드 메타데이터에 동결된 참조 은행과 순서가 있는 키프레임별 페이로드 매니페스트를 추가합니다.
- 위치 해석을 스토리보드의 원본 메시지와 스와이프에 고정한 뒤, 같은 장소 후보를 그 프레임들에서 재사용합니다.
- 캐릭터와 페르소나 참조는 각 키프레임의 등장 캐릭터 목록에서 고르고, 화면에 없는 인물에는 용량을 쓰지 않습니다.
- 명시적, 자리 하나, 자리 여러 개, 보조, 상속 스타일 우선순위를 기존 제공자 기능 리졸버로 결정적으로 적용합니다.
- 미리보기와 재생성에 점진적 `Visual sources`, 누락 사유, 검토 필요 충돌, 명시적 `Refresh references`를 추가합니다.
- Spatial Context가 꺼져 있거나 자격 있는 위치 참조가 없으면 기존 스토리보드 동작을 유지합니다.

통과 기준: 키프레임을 다시 생성하면 동결된 페이로드를 재사용하고, 위치와 캐릭터 선택이 역사적으로 정확하며 확인할 수 있고, 제공자 용량이 바뀌어도 기존 스토리보드가 조용히 달라지지 않습니다.

#### Package G: Connected Conversation

- Package A부터 F.3.1까지 안정된 뒤에만 구현합니다.
- 생성 시점에 연결된 소유자를 해석하고 축소 프로젝션 포매터를 씁니다.
- 보수적인 존재 표현과 읽기 전용 UI를 추가합니다.
- 연결 해제, 재연결, 삭제된 소유자, 잘못된 상호 링크, 순환, 완결된 스토리 동작을 증명합니다.

통과 기준: Conversation은 비공개 모델 기억, 내부 ID, 숨김 목적지, 위치에 첨부된 로어 ID나 내용, 위치 시각 참조 ID나 내용, 변경 권한을 절대 받지 않습니다.

모델이 요청하는 이동, 제작자 템플릿, 이식 가능한 캠페인 패키지, 이미지에서 지도 추론, 모든 위치의 참조 아트 일괄 생성, 여러 시점의 캐릭터 참조 자동 선택, 캐릭터별 위치는 소유자 근거 연결, 시각 정체성, 스토리보드 매니페스트 작업이 출시된 뒤의 별도 패키지로 남습니다.

### 이슈와 풀 리퀘스트 경계

이것은 저장소 워크플로 기준으로 큰 기능입니다. Package A 구현을 시작하기 전에 다음을 진행하세요.

1. 단일 추적 이슈를 확인하거나 새로 열고, 담당자를 그 이슈에 드러냅니다.
2. 이슈에 연결된 기존 브랜치, 초안 풀 리퀘스트, 프로젝트 보드 항목이 있는지 확인합니다.
3. 구현을 시작하는 즉시 `staging`을 대상으로 초안 풀 리퀘스트를 엽니다.
4. 가능한 경우 작업 패키지를 검토 가능한 PR 경계로 삼으세요. PR 개수를 줄이려고 소유자 MVP와 Connected Conversation을 합치지 마세요.

권장 이슈 분할:

1. Spatial Context 공용 코어, 저장, 정의 API.
2. 소유자 턴 스냅샷, 스와이프, 분기, 체크포인트, 이식성.
3. 소유자 프롬프트 프로젝션과 Game 호환성.
4. 소유자 편집기와 런타임 이동 UI.
5. 위치 로어북 연결과 소유자 런타임 활성화.
6. 로어북에 근거한 지도 초안 작성.
7. 위치 시각 정체성과 장면 아트 참조 해석.
8. 스토리보드의 동결 시각 참조 매니페스트.
9. Connected Conversation 읽기 전용 프로젝션.
10. 모델이 요청하는 이동.

### 검증 매트릭스

| 주장 | 자동 검증 | 수동 검증 |
| --- | --- | --- |
| 위치 로어 활성화가 정확하고 범위가 제한됩니다 | 픽스처가 수락된 이동, 대기 중 및 거부된 이동, 비활성 및 제외 항목, 중복 활성화 출처, 토큰 잘림, 다시 불러오기, 스와이프, 분기를 다룹니다 | Roleplay와 Game에서 로어가 다르게 연결된 두 위치를 오간 뒤 **Active Context**와 **Peek Prompt**를 확인합니다 |
| 로어북 근거 연결을 확인할 수 있습니다 | 엄격 모드 픽스처가 참조 없는 노드를 거부하고, 확장 픽스처가 검증된 출처 키를 보존하며 근거 없는 노드를 표시하고, 카탈로그 상한과 누락 개수가 결정적입니다 | 큰 기존 로어북으로 초안을 만들고, 출처 발췌를 열고, `Strict canon`과 `Canon with expansion`을 비교하고, 지어낸 위치를 거절합니다 |
| 위치 아트가 일관되고 범위가 제한됩니다 | 픽스처가 정확한 위치 선택, 과거 스와이프 해석, 명시적 스타일 상속, 누락 이미지, 제공자 한도, 요청 종류, 결정적 누락 사유를 다룹니다 | 대표 참조를 지정하고, 같은 장소에서 Game과 Roleplay 장면을 여러 개 생성하고, 다른 곳으로 이동하고, 예전 스와이프의 아트를 다시 만들고, 시각 출처 미리보기를 확인합니다 |
| 스토리보드 참조를 재현할 수 있습니다 | 픽스처가 원본 스와이프 고정, 동결된 참조 은행, 등장 캐릭터 선택, 자리 하나 및 여러 개인 제공자, 누락 자산, 줄거나 늘어난 교체 용량, 예전 매니페스트, 명시적 새로고침을 다룹니다 | 여러 프레임짜리 스토리보드를 만들고, 위치를 옮기고, 캐릭터와 위치 대표를 바꾸고, **Refresh references** 전후로 다시 생성하고, 모든 프레임의 `Visual sources`를 확인합니다 |
| 그래프 검증이 결정적입니다 | 긍정 픽스처와 부정 픽스처를 갖춘 전용 공간 회귀 스크립트 | 대표적인 잘못된 노드에 대한 인라인 편집기 오류를 확인합니다 |
| 이동과 사용자 메시지가 원자적입니다 | 두 백엔드 모두에서 각 트랜잭션 쓰기 전후에 저장 실패를 주입 | 초안과 목적지가 대기 중일 때 리비전을 일부러 오래된 상태로 만듭니다 |
| 기록이 올바른 위치를 복원합니다 | 다시 불러오기, 스와이프, 재생성, 분기 지점, 체크포인트를 다루는 스냅샷 회귀 검증 | Roleplay와 Game에서 각 흐름을 직접 해 봅니다 |
| 프롬프트 경로가 서로 일치합니다 | 생성 헬퍼, 드라이런, 실시간 **Peek Prompt**의 정규화된 블록을 비교 | 소유자 모드마다 채팅 하나씩 **Peek Prompt**와 디버그 출력을 확인합니다 |
| 컨텍스트 범위가 유지됩니다 | 폭이 넓은 픽스처와 긴 텍스트 픽스처로 글자 수 상한과 목적지 상한을 확인 | 깊고 넓은 계층 구조를 편집기와 목적지 선택기에서 확인합니다 |
| 사생활 보호가 지켜집니다 | 비공개 기억, 숨김 링크, 비활성 노드, 관련 없는 설명, 위치에 첨부된 로어 ID와 내용, 모든 위치 시각 참조 필드와 바이트에 대한 부정 단언 | Phase 3에서 Conversation 채팅을 연결하고 그 텍스트 요청과 이미지 요청 미리보기를 확인합니다 |
| Game의 위치 기준이 하나입니다 | 레거시 패치 거부, 연결된 전환 검증, 연결되지 않은 이동 보존 | 트래커 편집, 연결된 지도 이동과 연결되지 않은 지도 이동, 체크포인트 불러오기, 켜기, 끄기를 시도합니다 |
| UI가 잘 버팁니다 | 생성, 편집, 대기 중 이동, 충돌, 모바일 탐색에 대한 Playwright 흐름 | 다크, 라이트, SillyTavern 테마, 키보드, 터치, 긴 이름, 빈 상태를 확인합니다 |
| 이식성이 ID와 상태를 보존합니다 | 네이티브 내보내기/가져오기와 프로필 백업/복원 왕복이 공간, 로어, 이미지, 스토리보드 매니페스트 연결을 다루고, 대상에 로어나 이미지가 없으면 경고가 나옵니다 | 스토리보드가 있는 분기 채팅을 내보내고, 로어북과 갤러리 자산이 있을 때와 없을 때 각각 가져온 뒤 브레드크럼, 기록, 연결, 동결된 키프레임 출처, 경고를 확인합니다 |

`scripts/regressions/spatial-context.regression.ts`와 `regression:spatial` 패키지 스크립트를 추가한 다음 `pnpm regression`에 포함하세요. 영구적인 `.test.ts` 파일은 추가하지 마세요. 각 구현 PR은 좁은 범위의 공간 회귀 검증과 그 범위에 맞는 저장소 검사를 함께 실행합니다.

## 수락 기준

- 지도 위치는 로어북 항목 참조를 저장하며, 복사한 로어 내용을 저장하지 않습니다.
- 위치는 선택 사항인 시각 정체성 메타데이터와 안정적인 갤러리 이미지 참조를 저장하며, 원본 경로, 외부 URL, 이미지 바이트를 저장하지 않습니다.
- 렌더링 스타일은 이미지 스타일 프로필이, 장소 정체성은 위치 참조가, 대상 정체성은 캐릭터나 페르소나 참조가 정합니다.
- 자격이 있는 장면 아트 요청은 과거 재시도까지 포함해 자신의 메시지와 스와이프에 해당하는 정확한 위치를 해석하며, 이름으로 위치를 추정 대조하지 않습니다.
- 생성된 아트는 제작자의 명시적 동작이 있어야만 위치 참조가 됩니다.
- layout 참조는 일반 장면 생성에 자동으로 들어가지 않고, 자손에게 상속할 수 있는 것은 style 참조뿐입니다.
- 텍스트 프롬프트와 Connected Conversation은 위치 시각 참조 ID, 바이트, 경로, 이미지 전용 메모를 받지 않습니다.
- 스토리보드는 원본 메시지와 스와이프에서 위치를 해석하고, 참조 은행과 순서가 있는 키프레임 페이로드를 동결하며, 명시적으로 새로 고칠 때까지 재생성에서 그것을 재사용합니다.
- 각 스토리보드 키프레임은 해석된 위치와 등장 인물에 대해서만 참조를 고르고, 화면에 없는 인물은 용량을 쓰지 않습니다.
- 자리가 하나인 제공자와 여러 개인 제공자의 동작이 결정적이고 눈에 보이며, 제공자가 바뀌어도 동결된 참조가 조용히 추가, 제거, 교체되지 않습니다.
- 스토리보드 매니페스트는 안정적인 ID와 메타데이터를 저장하며, 이미지 바이트나 파일 시스템 경로를 저장하지 않습니다.
- 매니페스트가 없는 예전 스토리보드도 위치 이름 대조나 채팅의 최신 위치를 암묵적 복구 수단으로 쓰지 않습니다.
- 첨부된 로어를 강제로 활성화하는 것은 수락된 정확한 현재 위치뿐이며, 비활성, 제외, 중복 제거, 순서, 항목 제한, 토큰 예산 규칙을 따릅니다.
- **Active Context**는 현재 위치 활성화, 결합된 활성화 출처, 결정적 잘림을 알려 줍니다.
- 근거 기반 초안 작성은 키워드 스캔이나 생성된 세계 개요 요약에 기대지 않고, 명시적으로 선택한 로어 항목을 직접 읽습니다.
- `Strict canon`은 출처 기반 위치만 만들고, `Canon with expansion`은 추론했거나 근거 없는 추가를 **Save** 전에 모두 표시합니다.
- Connected Conversation은 위치에 첨부된 로어 ID나 내용을 받지 않습니다.
- 이름 변경과 상위 변경은 위치의 정체성을 보존합니다.
- 잘못된 그래프와 오래된 쓰기는 상태를 절대 바꾸지 않습니다.
- 이동은 사용자 턴과 함께 커밋되거나 아예 커밋되지 않습니다.
- 다시 불러오기, 스와이프 선택, 앞쪽 메시지 분기, Game 체크포인트 복원이 올바른 위치를 해석합니다.
- 소유자 프롬프트에는 활성 위치 컨텍스트와 유효한 목적지만 들어갑니다.
- 켜져 있을 때 Game은 경쟁하는 자유 입력 위치를 표시하거나 프롬프트에 넣지 않습니다.
- 기존 Game 지도는 전술 이동을 깨지 않고 계층 구조 위치에 명시적으로 연결할 수 있습니다.
- Roleplay와 Game은 같은 계층 구조와 전환 규칙을 씁니다.
- 드라이런과 **Peek Prompt**는 생성과 같은 프로젝션 동작을 씁니다.
- 기존 채팅과 Spatial Context가 꺼진 경우에는 현재 동작이 그대로 유지됩니다.
- Conversation은 공간 상태를 소유하거나 바꿀 수 없습니다.
- 비공개 모델 기억은 Conversation 프로젝션에 절대 들어가지 않습니다.

## 검증

결정적 검증에는 그래프 제한, 순환, 이동 방향, 숨김 및 차단 링크, 오래된 리비전, 멱등성, 분기 지점, 스와이프, 체크포인트, 로어북 참조 제한, 강제 활성화, 제외, 중복 제거, 토큰 잘림, 근거 카탈로그 상한, 출처 키 검증, 엄격 모드 거부, 출처 표시, 시각 참조 제한, 대표 및 상속 규칙, 과거 시각 해석, 제공자 후보 정리, 누락 이미지 경고, 요청 종류 제외, 스토리보드 원본 고정, 동결 매니페스트 재생성, 등장 캐릭터 필터링, 자리 하나 및 여러 개 선택, 제공자 용량 변경, 명시적 새로고침, 예전 매니페스트 대체 동작, 사생활 경계, 비활성 위치 부정 검증이 들어가야 합니다.

저장소 검사:

```bash
pnpm check
pnpm regression:prompt
pnpm smoke:ui
```

수동 검증에서는 데스크톱과 모바일 제작, 깊은 브레드크럼, 레이어, 좌표가 있는 지도, 긴 이름, 충돌 복구, 보관 보호, Roleplay, Game, 연결된 지도 이동과 연결되지 않은 지도 이동, 다시 불러오기, 분기, 체크포인트 복원, 연결된 로어 첨부와 역링크, 비활성 및 끊어진 로어, 큰 출처의 누락 경고, `Strict canon`과 `Canon with expansion` 미리보기, 시각 업로드와 갤러리 선택, 대표 및 보조 참조, 명시적 장면 승격, 상속된 스타일, 끊어진 이미지, 제공자 누락 보고, 과거 스와이프 아트, 스토리보드 `Visual sources`, 자리 하나 및 여러 개인 제공자, 동결 상태의 재생성, 제공자 변경 검토, 명시적 새로고침, 예전 스토리보드, **Active Context**, **Peek Prompt**를 다룹니다. PR 검증 체크박스는 사람이 확인하도록 체크하지 않은 채로 둡니다.

## 보류

- 채팅 턴 없이 즉시 이동
- 캐릭터별 독립 위치
- 범용 플래그, 이벤트, 스크립트
- 위치 템플릿과 시나리오 패키지
- 캐릭터별 공간 지식
- Conversation에서 공유 가능한 위치 로어
- 이미지에서 지도 자동 추론
- 생성된 장면을 위치 정식 설정으로 자동 승격
- 모든 위치의 참조 아트 일괄 생성
- 여러 캐릭터 의상, 각도, 표정, 세부 참조 중 샷을 고려한 자동 선택
- 제공자별 합성 참조나 콘택트 시트 참조 생성
