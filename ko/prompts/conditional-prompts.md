# 조건부 프롬프트({{#if}})

이 가이드에서는 Marinara Engine의 `{{#if}}` 블록을 쓰는 방법을 설명합니다. 조건 블록을 쓰면 정해 둔 규칙에 값이 맞을 때만 특정 프롬프트 문구를 넣을 수 있습니다. 조건 블록은 매크로 기능의 일부라서 매크로가 동작하는 곳이면 어디서든 쓸 수 있습니다. 캐릭터 카드, 페르소나, 로어북 항목, 프롬프트 프리셋 모두 해당합니다.

## 조건부 프롬프트가 하는 일

매크로는 `{{중괄호 두 개}}`로 감싼 자리 표시자이고, Marinara Engine이 프롬프트를 만들 때 실제 값으로 바꿔 넣습니다. 조건 블록은 여기서 한 걸음 더 나아갑니다. 값을 확인한 다음 문구 하나만 남기고 나머지는 버립니다.

조건, 조건이 참일 때 쓸 문구, 그리고 필요하다면 거짓일 때 쓸 문구를 적습니다. Marinara는 프롬프트를 만들 때마다 조건을 다시 읽습니다. 즉, 같은 카드나 프리셋이라도 캐릭터, 페르소나, 채팅에 따라 다르게 동작합니다.

자주 쓰는 방법 하나는 공용 프리셋 하나 안에 캐릭터별 지시를 담아 두는 것입니다. 또 하나는 내용이 있는 필드만 넣어서 빈 라벨이 모델에 전달되지 않게 하는 것입니다.

## 기본 문법

조건 블록은 `{{#if condition}}`으로 시작해서 `{{/if}}`로 끝납니다. 그 사이의 내용이 조건이 참일 때 쓰이는 문구입니다.

```
{{#if condition}}
Text used when the condition is true.
{{/if}}
```

거짓일 때를 위해 `{{else}}` 분기를 넣을 수 있습니다.

```
{{#if condition}}
Text used when true.
{{else}}
Text used when false.
{{/if}}
```

`{{else if}}`로 조건을 더 이어 붙일 수도 있습니다. Marinara는 위에서 아래로 각 분기를 차례로 확인합니다. 조건이 참인 첫 번째 분기만 남기고 그 안의 매크로를 처리한 뒤, 나머지 분기는 모두 버립니다. 참인 조건이 하나도 없고 `{{else}}`도 없으면 블록 전체가 빈 내용이 됩니다.

```
{{#if length == "short"}}
Keep your reply to one or two sentences.
{{else if length == "long"}}
Write a detailed, multi-paragraph reply.
{{else}}
Write a reply of normal length.
{{/if}}
```

블록은 위 예시처럼 여러 줄로 써도 되고 한 줄로 써도 됩니다. 큰 조건 블록의 한 분기 안에 다른 조건 블록을 넣는 것도 가능합니다.

## 사용할 수 있는 연산자

조건은 보통 왼쪽 값, 연산자, 오른쪽 값으로 이루어집니다. `char == "Alice"`가 그런 예입니다. 아래 표에 쓸 수 있는 연산자를 모두 정리했습니다. 각 연산자는 코드 서식으로 표시했습니다.

| 연산자 | 뜻 |
| --- | --- |
| `==`, `=`, `is` | 같습니다. |
| `!=`, `is not` | 같지 않습니다. |
| `>` | 더 큽니다(숫자만). |
| `<` | 더 작습니다(숫자만). |
| `>=` | 크거나 같습니다(숫자만). |
| `<=` | 작거나 같습니다(숫자만). |
| `contains`, `includes` | 왼쪽 값이 오른쪽 값을 문자열로 포함합니다. |
| `not contains`, `not includes` | 왼쪽 값이 오른쪽 값을 포함하지 않습니다. |

비교 방식은 다음 규칙을 따릅니다.

1. `==`, `=`, `is`, `!=`, `is not`은 양쪽이 모두 숫자처럼 보이면 숫자로 비교합니다. 그래서 `5`와 `5.0`은 같습니다. 그렇지 않으면 대소문자를 무시하고 문자열로 비교합니다. 그래서 `Mari`와 `mari`는 같습니다.
2. `>`, `<`, `>=`, `<=`는 양쪽이 모두 숫자여야 합니다. 한쪽이라도 숫자가 아니면 조건은 거짓입니다.
3. `contains`, `includes`, `not contains`, `not includes`는 대소문자를 구분하지 않습니다. 그래서 `contains "dr"`은 `Dr Smith`라는 문자열에 맞습니다.

## OR와 AND로 조건 묶기

둘 중 하나만 맞아도 될 때는 `||`를, 모든 조건이 맞아야 할 때는 `&&`를 씁니다.

```
{{#if character == "Maukie" || character == "Pantalone"}}
Use the shared Maukie and Pantalone instructions.
{{/if}}

{{#if characters contains "Maukie" && characters contains "Pantalone"}}
Both characters are present in this chat.
{{/if}}
```

`&&`가 `||`보다 먼저 처리됩니다. 순서를 직접 정하고 싶을 때는 괄호를 넣으세요.

```
{{#if (character == "Maukie" || character == "Pantalone") && scenario contains "lake"}}
Use the lakeside instructions for either character.
{{/if}}
```

같은 값에 대해 여러 선택지를 비교할 때는 `||` 뒤에서 반복되는 왼쪽 값을 생략해도 됩니다.

```
{{#if character == "Maukie" || "Pantalone"}}
Use the shared instructions.
{{/if}}
```

이 줄임 표기는 `character == "Maukie" || character == "Pantalone"`과 같은 뜻입니다. 등호 연산자 `==`, `=`, `is`에만 적용됩니다. `&&`의 양쪽에는 조건을 온전히 다 쓰세요. 값 하나가 서로 다른 선택지 둘과 동시에 같아지는 경우는 거의 없기 때문입니다.

### truthy 검사(연산자 없음)

연산자 없이 값만 적으면 Marinara는 truthy 검사를 합니다. 이 값에 실제 내용이 들어 있는지만 따지는 간단한 확인입니다.

```
{{#if scenario}}
Current scene: {{scenario}}
{{else}}
No specific scene is set.
{{/if}}
```

truthy 검사는 값이 비어 있지 않고 `false`, `0`, `no`, `off`, `null`, `undefined` 중 어느 것도 아닐 때 참이 됩니다. 이 단어 비교는 대소문자를 구분하지 않습니다. 어떤 필드가 채워져 있을 때만 문구를 넣고 싶다면 truthy 검사를 쓰세요.

### 비교할 수 있는 대상

조건의 왼쪽이나 오른쪽에는 다음을 쓸 수 있습니다.

1. 필드나 신원 키워드. `char`, `user`, `group`, `persona`, `description`, `personality`, `scenario`, `input`, `model` 등이 있습니다. 같은 이름의 매크로와 똑같은 값을 읽습니다. `group`은 지금 답하는 캐릭터를 뺀 나머지 활성 캐릭터를 나열합니다.
2. 따옴표로 감싼 리터럴. `"Alice"`가 그런 예입니다.
3. 프리셋 변수 이름. `length`가 그런 예입니다. 프리셋 변수는 프롬프트 프리셋에서 직접 이름을 붙여 정의한 값입니다. [프리셋 변수](preset-variables.md)를 참고하세요.
4. `var:name` 또는 `var.name` 형태로 명시한 변수 조회.
5. 다른 매크로. 먼저 값을 구한 다음 비교합니다.

키워드가 아닌 낱말을 따옴표 없이 적으면 Marinara는 그것을 변수 이름으로 봅니다. 그런 이름의 변수가 없으면 그 낱말 자체를 문자열로 씁니다. 리터럴 값에 따옴표를 붙이면 이런 혼동이 없으니, 헷갈릴 때는 따옴표를 쓰세요.

## 따옴표 규칙

정해진 문구와 비교할 때는 따옴표로 감싸세요. 그래야 Marinara가 키워드나 변수가 아니라 있는 그대로의 리터럴로 처리합니다.

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{/if}}
```

곧은 큰따옴표와 곧은 작은따옴표 모두 쓸 수 있습니다. Marinara는 굽은(활자용) 따옴표도 받아 주지만, 곧은 따옴표가 가장 안전하고 앱 안의 모든 예시와도 일치합니다. 따옴표 안에서는 백슬래시로 따옴표를 이스케이프할 수 있고, 줄바꿈은 `\n`으로 적을 수 있습니다.

`"Dr Smith"`처럼 공백이 들어간 리터럴에는 반드시 따옴표를 붙이세요. 따옴표 없이 여러 낱말을 적으면 통째로 변수 이름 하나로 읽히는데, 의도한 결과인 경우는 거의 없습니다.

## 캐릭터가 여럿일 때 쓰는 그룹 블록

캐릭터가 둘 이상인 그룹 채팅에서는 그룹 블록이 같은 문구를 캐릭터 수만큼 반복합니다. 덕분에 블록 하나만 써도 장면에 있는 모든 캐릭터를 설명할 수 있습니다.

그룹 블록은 `[` 하나만 있는 줄로 시작하고, 그 아래에 문구를 적은 뒤, `]` 하나만 있는 줄로 끝냅니다. 블록 안에는 `{{char}}`나 `{{description}}` 같은 캐릭터 매크로가 있거나, `{{#if char == "Alice"}}`처럼 캐릭터를 따지는 조건이 있어야 합니다. 그러면 Marinara가 캐릭터마다 블록을 한 번씩 반복하면서 캐릭터 매크로를 차례로 그 캐릭터의 값으로 채웁니다.

```
[
{{char}}'s current attitude:
{{#if char == "Alice"}}cheerful and open{{else}}guarded and quiet{{/if}}
]
```

Alice와 Bob이 있는 그룹 채팅이라면 이 블록은 두 번 실행됩니다. 첫 번째에는 Alice의 이름이 들어가고 Alice에 맞는 분기가 선택됩니다. 두 번째에는 Bob의 이름이 들어가고 Bob에 맞는 분기가 선택됩니다. 그룹 블록 바깥에서는 캐릭터 매크로가 현재 캐릭터 또는 주 캐릭터 하나에만 대응합니다.

그룹 블록은 캐릭터가 둘 이상인 채팅에서만 펼쳐집니다. 캐릭터가 하나뿐인 채팅에서는 `[`와 `]` 줄이 그냥 글자 그대로 남습니다.

## 적용 예시(적용 전과 후)

모델이 실제로 받는 결과까지 보여 주는 예시 3가지입니다.

공용 프리셋 안에서 캐릭터별로 말투를 다르게 하기.

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{else}}
Speak warmly and casually.
{{/if}}
```

캐릭터 이름이 `Dottore`이면 모델은 `Speak in a cold, clinical tone.`을 받습니다. 그 밖의 캐릭터에게는 `Speak warmly and casually.`가 전달됩니다.

내용이 채워져 있을 때만 필드 넣기.

```
{{#if backstory}}
Backstory to remember: {{backstory}}
{{/if}}
```

캐릭터에 **Backstory**(배경 이야기)가 있으면 모델은 그 배경 이야기가 들어간 줄을 받습니다. **Backstory** 입력란이 비어 있으면 블록 전체가 빈 내용이 되므로 빈 라벨은 전달되지 않습니다.

이름 일부만 맞춰서 판단하기.

```
{{#if user contains "Dr"}}
Address the user as Doctor.
{{/if}}
```

페르소나 이름에 `Dr`이 들어 있으면 모델은 Doctor라고 부르라는 지시를 받습니다. 들어 있지 않으면 블록은 빈 내용이 됩니다.

## 관련 가이드

- [프롬프트 매크로](macros.md)
- [프리셋 변수](preset-variables.md)
- [그룹 채팅과 여럿이 나누는 대화](../chats/group-chats.md)
