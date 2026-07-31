# Noodle 프롬프트 내부 구조(개발자용)

Noodle의 생성 프롬프트가 코드 어디에 있는지, 어떻게 고치는지, 최종 프롬프트를 어떻게 확인하는지 정리한 개발자용 참고 문서입니다. 일반 사용자는 Noodle의 Settings 패널에서 설정하면 됩니다. `docs/noodle/`의 Noodle 가이드를 참고하세요.

## 프롬프트 소스 맵

현재 Noodle에는 코드에 직접 작성된 텍스트 생성 프롬프트 1개, 등록된 텍스트 프롬프트 재정의 1개, 등록된 이미지 프롬프트 재정의 1개가 있습니다.

| 용도 | 소스 | 주요 심볼 | 수정 방법 |
| ---- | ---- | --------- | --------- |
| 타임라인 게시물, 답글, 팔로우, 설문, 투표, 요약 | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` | 코드 안의 시스템 메시지와 컨텍스트 메시지를 직접 수정합니다. 어조와 창작 자유도 부분은 아래의 **Noodle Timeline Voice & Tone** 재정의가 담당하며, 나머지(스키마에 직결되는 출력 형식 규칙)는 UI에서 바꿀 수 없습니다. |
| 타임라인 어조 지시(시스템 프롬프트의 일부) | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_TIMELINE_VOICE` (`noodle.timelineVoice`) | **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Timeline Voice & Tone**에서 수정하거나, 코드에서 등록된 기본값(`noodle-prompt.ts`의 `noodleTimelineVoiceDefaultText(enhanced)`)을 바꿉니다. 범위를 어조로만 한정한 것은 의도적입니다. 구조화된 액션 제한, 대상 필드 규칙을 비롯해 스키마에 직결되는 지시는 이 재정의 바깥에 하드코딩해 두었기 때문에, 재정의를 통째로 다시 써도 `noodleGeneratedRefreshSchema` 파싱이 깨지지 않습니다. 수정하지 않은 기본값은 Noodle 설정 `enableEnhancedTimelineWriting`(`ctx.enhanced`)을 따르며, 꺼 두면 원래의 한 줄짜리 어조 지시가 그대로 나옵니다. 재정의 문구를 한 번 저장하면 이 설정과 무관하게 저장한 문구가 우선합니다. |
| 캐릭터 계정의 최초 프로필 | `packages/server/src/routes/noodle.routes.ts` | `generateMissingNoodleProfiles()` | 코드 안의 시스템 메시지와 사용자 메시지를 직접 수정합니다. 참가자 선정이 먼저 실행되고, 선정된 캐릭터 계정 중 `profileGenerated`가 없는 계정만 이 프롬프트로 넘어갑니다. |
| 생성된 게시물의 이미지 프롬프트 | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_IMAGE_POST` (`noodle.imagePost`) | **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Post Image**에서 수정하거나, 코드에서 등록된 기본값을 바꿉니다. |
| Noodle 전용 기본 이미지 지시 | `packages/shared/src/schemas/noodle.schema.ts` | `DEFAULT_NOODLE_SETTINGS.imageGenerationPrompt` | UI에서 Noodle 설정을 바꾸거나, 코드에서 스키마 기본값을 바꿉니다. |
| 타임라인 생성에 들어가는, 사용자가 동의한 채팅 컨텍스트 | `packages/server/src/routes/noodle.routes.ts` | `buildOptedInChatContext()` | 컨텍스트 조립 방식을 코드에서 바꿉니다. 동의 여부는 각 채팅의 설정에 그대로 남습니다. |
| 타임라인 게시물과 답글의 이미지 입력 | `packages/server/src/services/noodle/noodle-vision.ts` | `prepareNoodleVisionAttachments()` | 이미지 선택, 정규화, 개수 제한, 텍스트 전용 호환 대체 동작을 코드에서 바꿉니다. |
| 채팅 프롬프트에 들어가는 Noodle 활동 | `packages/server/src/services/noodle/noodle-context.ts` | `buildRecentSocialMediaActivityBlock()` | 필터링이나 블록 조립 방식을 코드에서 바꿉니다. 대상 모드와 항목 개수 제한은 Noodle Settings에서 사용자가 정하고, 감싼 블록에는 8,192 토큰이라는 상한이 걸려 있습니다. |
| 생성 결과의 JSON 계약 | `packages/shared/src/schemas/noodle.schema.ts` | `noodleGeneratedRefreshSchema` | 프롬프트, 라우트 처리, 공용 타입, 회귀 테스트 범위를 함께 손볼 때만 바꿉니다. |
| 타임라인 생성에 들어가는 로어북의 세계관 컨텍스트 | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()`(`processLorebooks()` 호출) | Noodle 설정 **Lorebook context**(`enableLorebookContext`, 기본값 꺼짐)로 켜고 끕니다. 그룹 채팅에서 쓰는 다중 캐릭터용 `processLorebooks()`를 그대로 재사용하되, `noodle-prompt.ts`의 `noodleLorebookTokenBudget()`이 계산한 Noodle 전용 토큰 예산을 씁니다. 이 예산은 활성 캐릭터 수에 따라 조정되며 8,192 토큰을 넘지 않습니다. Noodle에는 고정과 쿨다운 타이밍 상태를 저장할 채팅별 슬롯이 없기 때문에 `previewOnly: true`로 실행됩니다. |

타임라인 프롬프트와 프로필 프롬프트는 아직 Prompt Overrides UI에 나오지 않습니다. 거기에 노출되는 Noodle 생성 프롬프트는 **Noodle Post Image** 템플릿 하나뿐입니다. Noodle 안에 있는 **Prompt instructions**(프롬프트 지침) 입력란은 그 이미지 템플릿으로 전달되며, 타임라인 작성 프롬프트에는 영향을 주지 않습니다.

이미지 라우트는 `NOODLE_IMAGE_POST`를 불러온 다음, 그 결과를 `compileImagePrompt()`에 통과시키고 나서 이미지 제공자에 보냅니다. 따라서 최종 요청은 선택한 이미지 스타일 프로필과 연결 기본값에도 영향을 받습니다.

## 최종 프롬프트 확인하기

Debug Mode를 켠 상태에서 새로고침을 직접 실행하면, 최종 프로필 메시지와 타임라인 모델 메시지가 공용 서버 로거로 기록됩니다. 다음 줄을 찾으세요.

```text
[debug/noodle] Profile prompt sent to model
[debug/noodle] Prompt sent to model
[debug/noodle] Attached N timeline image input(s) to the refresh prompt
```

타임라인 이미지 데이터는 디버그 로그에 base64로 기록되지 않습니다. 로그에 남는 텍스트에는 모델에 보낸 것과 같은 게시물/답글 첨부 키와 네이티브 이미지 입력 개수만 담깁니다. Noodle은 이 입력을 `noodle-vision.ts`에서 정규화하고 개수를 제한합니다. 제공자가 이미지 인식 콘텐츠를 명시적으로 거부하면, 라우트는 그 사실을 로그로 남기고 미리 조립해 둔 텍스트 전용 대체 프롬프트를 보냅니다.

이미지의 경우 **Settings -> Generations -> Image Generation**에서 **Expose media prompts before sending**(전송 전에 미디어 프롬프트 표시)을 켜면, 요청을 보내기 전에 최종적으로 컴파일된 긍정 프롬프트와 부정 프롬프트를 확인하고 수정할 수 있습니다.

## 안전하게 수정하기

프롬프트 조립은 호환성이 쉽게 깨지는 위험한 경계입니다. 수정할 때는 프롬프트, `noodleGeneratedRefreshSchema`, 라우트 처리, Noodle 멘션 및 설문 회귀 테스트가 서로 어긋나지 않게 유지하세요. 최소한 다음을 실행하세요.

```bash
pnpm check
pnpm regression:prompt
pnpm regression:noodle
```

## 관련 가이드

- [Noodle: 앱 안의 소셜 타임라인](../noodle/overview.md)
- [Noodle 설정과 채팅 반영](../noodle/settings.md)
- [아키텍처 지도(개발자용)](architecture-map.md)
