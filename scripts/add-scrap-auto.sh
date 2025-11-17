#!/bin/bash

# 스크랩 링크 자동 추가 및 PR 생성 스크립트 (전체 자동화)
# 사용법: ./scripts/add-scrap-auto.sh <링크> [메모]

set -e

LINK="$1"
MEMO="$2"

if [ -z "$LINK" ]; then
  echo "❌ 사용법: ./scripts/add-scrap-auto.sh <링크> [메모]"
  echo "예시: ./scripts/add-scrap-auto.sh https://example.com/article \"- 좋은 글\""
  exit 1
fi

# 현재 날짜 정보 가져오기
YEAR=$(date +"%Y")
MONTH=$(date +"%m")
DAY=$(date +"%d")
DATE_STR="${YEAR}-${MONTH}-${DAY}"

# 스크랩 파일 경로
SCRAP_FILE="contents/blog/${YEAR}/${MONTH}/11월 스크랩.md"

# 파일이 존재하는지 확인
if [ ! -f "$SCRAP_FILE" ]; then
  echo "❌ 스크랩 파일을 찾을 수 없습니다: $SCRAP_FILE"
  echo "💡 파일을 먼저 생성해주세요."
  exit 1
fi

# 링크에서 제목 가져오기
echo "🔍 링크에서 제목을 가져오는 중..."
TITLE=$(curl -sL "$LINK" | grep -oE '<title[^>]*>.*</title>' | sed -E 's/<title[^>]*>([^<]*)<\/title>/\1/' | head -1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

if [ -z "$TITLE" ]; then
  # og:title 시도
  TITLE=$(curl -sL "$LINK" | grep -oE 'property="og:title"[^>]*content="[^"]*"' | sed -E 's/.*content="([^"]*)".*/\1/' | head -1)
fi

if [ -z "$TITLE" ]; then
  echo "⚠️  제목을 자동으로 가져올 수 없습니다. 수동으로 입력해주세요:"
  read -r TITLE
fi

# 새 항목 생성
NEW_ENTRY="### ${DATE_STR}

[${TITLE}](${LINK})"

if [ -n "$MEMO" ]; then
  NEW_ENTRY="${NEW_ENTRY}

${MEMO}"
fi

# 파일 끝에 추가
echo "" >> "$SCRAP_FILE"
echo "$NEW_ENTRY" >> "$SCRAP_FILE"

echo "✅ 스크랩 파일에 추가되었습니다!"

# Git 작업
echo ""
echo "📦 Git 작업을 진행합니다..."

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
TIMESTAMP=$(date +%s)
BRANCH_NAME="add-scrap-${TIMESTAMP}"

# 새 브랜치 생성
echo "🌿 새 브랜치 생성: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

# 파일 추가 및 커밋
git add "$SCRAP_FILE"
COMMIT_MSG="Add scrap link: ${TITLE}"
git commit -m "$COMMIT_MSG"

# 푸시
echo "🚀 변경사항 푸시 중..."
git push -u origin "$BRANCH_NAME"

# PR 생성 링크 표시
REPO_URL=$(git remote get-url origin | sed 's/.*github.com[:/]\([^.]*\).*/\1/')
PR_URL="https://github.com/${REPO_URL}/compare/scrap...${BRANCH_NAME}?expand=1"

echo ""
echo "✨ 완료!"
echo ""
echo "📝 추가된 내용:"
echo "$NEW_ENTRY"
echo ""
echo "🔗 PR 생성 링크:"
echo "$PR_URL"
echo ""
echo "💡 위 링크를 클릭하여 PR을 생성하세요 (base: scrap)"
