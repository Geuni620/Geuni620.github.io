---
date: '2024-05-21'
title: '재사용 가능하게, Tanstack-table 사용하기'
categories: ['개발']
summary: 'tanstack-table reusable'
---

올해 초 이직을 하면서 주된 프로덕트가 어드민이다.  
어드민에서 테이블, 폼과 같은 구조를 많이 다루게 된다.  
처음 맡은 프로젝트에서 Tanstack-table을 사용했는데, 점점 사람들에게 알려지기도 하고,  
메인테이너가 [docs도 깔끔하게 정리 중](https://x.com/KevinVanCott/status/1788269291751760089)이라 더 관심이 간다.  
(초반 docs는 예시밖에 없었다;)

기본 바탕이 되는 내용은 [이전 글](https://geuni620.github.io/blog/2023/12/2/tanstack-table)에서 다뤘으니, 이번엔 재사용 가능하게 Tanstack-table을 구성해보려고 한다.  
shadcn/ui의 [Data Table docs](https://ui.shadcn.com/docs/components/data-table)를 참고했으며, 따라해보면서 겪었던 문제를 공유해본다.

<br/>

## 재사용가능한 구조로 나누기

```
- └── table
-     └── index.tsx


+ └── table
+     ├── columns.tsx
+     ├── pagination.tsx
+     ├── selection.tsx
+     └── data-table.tsx
```

<br/>

기존에는 모든 소스코드가 table 내 index.tsx에 포함되어있었다.  
table/index.tsx내 columns도, pagination, selection 모든게 포함되어있다.
즉, 1번 사용할 순 있지만, 재사용하긴 어려운 구조다.

폴더구조를 변경시킴으로써, 해당 부분에서 columns만 모아놓고 필요한 것만 빼내서 사용할 수 있다.

```TSX
// table/columns.tsx
-  const columnHelper = createColumnHelper<ColumnDataProps>();
-  const columns = [
-    //...
-  ];
```

기존엔 `createColumnHelper`를 사용했었고, 이전 글에도 이걸 더 권장했다.  
하지만, 이번에 적용해보면서, 타입설정해주기가 너무 까다롭다는 걸 알게됐다.  
data-table의 제네릭으로 내려주는 게 있는데, coulmns에서 타입에러를 뱉어냈다.  
고민하다가, 다음과 같은 방법으로 바꾸었다.

```TSX

```
