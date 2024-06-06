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

### 1. getPaginationRowModel 제거 → manualPagiantion 추가

그럼 이제 본격적으로 server side pagination을 살펴보자.  
[공식문서의 내용](https://tanstack.com/table/latest/docs/guide/pagination#manual-server-side-pagination)을 그대로 따라가면서 학습했다. 그래서 순서가 동일하다.

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
-   // getPaginationRowModel: getPaginationRowModel(), remove!
+   manualPagination: true
  });
```

`manualPagination`을 true로 설정함으로써,  
table 인스턴스에게 더 이상 client-side로 페이지네이션을 사용하지 않겠다고 알려주는 것이다.

이후, table 인스턴스는 내부적으로, `table.getPrePaginationRowModel`을 활성화시키며,  
table 인스턴스는 사용자가 전달한 데이터가 이미 페이지네이션 된 것으로 간주한다.

실제로, client-side 되어있는 상태에서, getPaginationRowModel을 제거하면, 더 이상 페이지네이션이 동작하지 않는다.  
그리고 manualPagination을 true로 설정했을 때, 큰 변화가 보이지 않는다. 하지만 꼭 설정해줘야한다.

<br/>

### 2. Page Count(페이지 수)와 Row Count(행의 수) 추가하기

```TSX
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total, // 서버로 부터 받아온 row의 총 개수
    // pageCount: total / pageSize // 서버로 부터 받아온 페이지 수가 있다면 이를 추가할 수도 있음
    onPaginationChange,
    state: { pagination },
  });
```

이제 table 인스턴스에게 페이지 수가 몇인지, 행의 수는 몇 개씩 보여줄 것인지 알려주지 않으면,  
table 인스턴스는 이를 알 수 있는 방법이 없다.  
그래서 rowCount 또는 pageCount와 같이 table 인스턴스에게 이를 알려주어야한다.

**rowCount는 서버로 부터 받아온 row의 총 개수이다.** 예시에선 이를 사용했다.  
**pageCount는 서버로 부터 받아온 pagination 수를 바로 지정해주는 것이다.**  
예를 들어, 서버로부터 받아온 row의 총 개수가 200개이고, pageSize를 20으로 지정해 총 행을 20개씩 보여준다고 가정했을 때,  
pageCount는 10이 될 것이고, pagination은 1부터 10까지 노출될 것이다.

<br/>

### 3. Pagination State
