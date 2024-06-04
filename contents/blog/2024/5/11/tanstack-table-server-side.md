---
date: '2024-06-04'
title: 'Tanstack-table pagination server side로 구현하기'
categories: ['개발']
summary: '공식문서를 참고하며..'
---

## Server side pagination

Tanstack-table의 공식문서를 살펴보면, [해당 내용에 관한 글](https://tanstack.com/table/latest/docs/guide/pagination)이 존재한다.  
현재 회사 프로젝트에선, client side로 개발되어있지만, 추후엔 server side로 변경할 가능성이 높다.  
물론 문서를 확인해보면, client side에서도 충분히 높은 성능을 보여줄 수 있다고 한다.

현 글에선 supabase의 RLS를 적극적으로 사용해보고 싶어서, React로만 구현하려고 한다.  
그리고 Tanstack-table과 Tanstack-query를 사용할 것이다.

<br/>

### client side pagination

먼저, tanstack-table을 이용해서, client-side로 pagination은 어떻게 구현할 수 있을까?

[이전 글에서 pagination 구현 소스코드](https://geuni620.github.io/blog/2023/12/2/tanstack-table/#3-pagination-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0)를 살펴보면 다음과 같다.

```TSX
import { useReactTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/react-table';

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },

    // Pagination
    getPaginationRowModel: getPaginationRowModel(),
  });
```

`getPaginationRowModel`에 import 시킨 `getPaginationRowModal()`을 실행시키면, 끝이다.  
이후 페이지네이션을 사용해야할 땐, table Instance만으로 pagiantion 구현이 가능하다.

사용은 다음과 같이 하면된다.

```TSX
<div>
  {table.getState().pagination.pageIndex + 1} // 현재 페이지
  {table.getPageCount()} // 총 페이지 수
</div>
```

<br/>

### server side pagination

그럼 이제 본격적으로 server side pagination을 살펴보자.

### 직접 만들어보기
