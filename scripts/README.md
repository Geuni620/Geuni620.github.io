# 스크랩 추가 스크립트

스크랩 링크를 쉽게 추가할 수 있는 자동화 스크립트입니다.

## 두 가지 방법

### 1. 수동 커밋 버전 (권장)

링크만 추가하고 커밋/푸시는 직접 제어하고 싶을 때 사용합니다.

```bash
npm run add-scrap <링크> [메모]
```

또는

```bash
./scripts/add-scrap.sh <링크> [메모]
```

### 2. 전체 자동화 버전

링크 추가부터 브랜치 생성, 커밋, 푸시까지 모두 자동으로 처리합니다.

```bash
npm run add-scrap-auto <링크> [메모]
```

또는

```bash
./scripts/add-scrap-auto.sh <링크> [메모]
```

## 사용 예시

### 기본 사용

```bash
npm run add-scrap https://velog.io/@rewq5991/typescript-project-type-safe-refactor-with-typescript
```

### 메모와 함께 추가

```bash
npm run add-scrap https://example.com/article "- 좋은 글입니다"
```

### 전체 자동화 (커밋/푸시까지)

```bash
npm run add-scrap-auto https://example.com/article "- 좋은 글입니다"
```

## 동작 방식

### 수동 버전 (`add-scrap`)
1. 링크에서 제목을 자동으로 가져옵니다
2. 현재 날짜의 스크랩 파일을 찾습니다
3. 파일 끝에 새로운 항목을 추가합니다
4. 커밋 및 PR 생성 안내를 표시합니다

### 자동화 버전 (`add-scrap-auto`)
1. 링크에서 제목을 자동으로 가져옵니다
2. 현재 날짜의 스크랩 파일을 찾습니다
3. 파일 끝에 새로운 항목을 추가합니다
4. 새 브랜치 생성 (`add-scrap-{timestamp}`)
5. 자동 커밋 및 푸시
6. PR 생성 링크 표시

## 주의사항

- 스크랩 파일이 해당 월에 존재해야 합니다
- 파일이 없으면 먼저 생성해야 합니다
- 제목을 자동으로 가져올 수 없으면 수동 입력을 요청합니다
- 자동화 버전은 현재 브랜치에서 새 브랜치를 생성합니다

## 추천 워크플로우

### 방법 1: 수동 제어 (더 안전)
```bash
# 1. 링크 추가
npm run add-scrap <링크>

# 2. 변경사항 확인
git status
git diff

# 3. 커밋 및 푸시
git add contents/blog/YYYY/MM/11월\ 스크랩.md
git commit -m "Add scrap link: 제목"
git push

# 4. GitHub에서 PR 생성
```

### 방법 2: 빠른 자동화 (편리함)
```bash
# 한 번에 처리
npm run add-scrap-auto <링크>

# 표시된 PR 링크 클릭하여 PR 생성
```

## 팁

- 메모는 선택사항입니다
- 메모를 추가할 때는 따옴표로 감싸주세요
- 여러 줄 메모는 `-` 로 시작하는 형식을 권장합니다
