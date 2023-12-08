---
date: '2023-12-02'
title: '테이블을 편하게, Tanstack-table 사용하기'
categories: ['개발']
summary: '똥인 줄 알았는데, 금이었다.'
---

> 최근에 Tanstack-Table 라이브러리를 '다시' 사용하게 되었다.  
> 어드민을 개발할 때 동료분께서 '편해보인다.'는 이유로 적용하셨었는데,  
> 그 업무를 내가 맡게 되면서 처음 접하게 되었다.

현재 Tanstack-Table은 v8버전이며, 당시에 v7에서 v8로 업데이트된지 얼마 안되어서 공식문서를 제외한 자료도 찾기 어려웠다.  
그렇다고 공식문서가 친절한 것도 아니었다.  
(github issue 탭을 확인해보면 '이거 좋아 근데, 예시보단 문서 좀 잘 적어줘'라는 문구를 한 번씩 접하게 된다.)

<br/>

한 날은 트위터에서 Tanstack-table을 Material-ui로 커스텀한 라이브러리인 [material-react-table](https://github.com/KevinVandy/material-react-table)의 메인테이너가 ['이 영상 추천해'](https://x.com/KevinVanCott/status/1706408044874055973?s=20)라고 올려주었다.

<br/>

'한번 봐야지..' 생각하고 있던 찰나, 써볼 일도 생겨서 영상을 보게됐고, 라이브러리가 제공해주는 기능을 사용하면서 평소 많이 듣던 '바퀴를 다시 발명하지 마라'는 격언에 크게 공감하게 됐다.  
오늘은 이 영상을 정리해보려고 한다.

<br/>

- 기본적인 Tutorial에 관한 내용은 [여기](https://github.com/Geuni620/tanstack-table-v8-tutorials)에 정리해두었다.
- 당시 내가 필요했던 기능은

  1. 총 4개의 column을 가진 테이블을 만들어보자
  2. 전체, 테이블 row 단위 체크박스
  3. 페이지네이션 단, 20개, 50개, 100개 단위로 보여줬을 때, 테이블이 바로바로 업데이트 되어야했다.

<br/>

### 1. 총 4개의 column을 가진 테이블을 만들어보자

- 먼저 tanstack-table에서 useReactTable이라는 hook을 제공해준다.
- 이 hook엔 helper function을 다양하게 제공해주는데, 필요한 것을 가져와서 사용하면 된다.

```TSX
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useState } from 'react';

import DATA from '@/data';

const columns = [
  {
    accessorKey: 'task',
    header: 'Task',
    cell: (props) => <p>{props.getValue()}</p>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (props) => <p>{props.getValue()?.name}</p>,
  },
  {
    accessorKey: 'due',
    header: 'Due',
    cell: (props) => <p>{props.getValue()?.toLocaleTimeString()}</p>,
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: (props) => <p>{props.getValue()}</p>,
  },
];

export const Table: React.FC = () => {
  const [data, setData] = useState(DATA);

  //  useReactTable
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {/* Table 헤더 */}
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>{flexRender(header.column.columnDef.header, getContext())}</th>
            ))}
          </tr>
        ))}
      </thead>
    </table>
  );
};
```

```TSX
{
  task: 'Add a New Feature',
  status: STATUS_ON_DECK,
  due: new Date('2023/10/15'),
  notes: 'This is a note',
},
```

- data는 테이블에 들어갈 데이터를 의미한다.
- `task`, `status`, `due`, `notes`는 `accessorKey`로 사용된다.(위 columns에 작성되어있는 부분)
- `getCoreRowModel`은 테이블의 row를 구성하는데 필요한 기본적인 정보를 제공해준다.
- 'th' 태그에는 `header.column.columnDef.header`를 넣어주었는데, 지금은 헤더를 잘 렌더링 하는 듯 보이지만, 변경해줘야한다.

<br>

- 이를 위해 `flexRender`라는 유틸리티를 import 시켜준다.
- 그 이유는, column을 보면, cell이 jsx를 반환하고 있다.

![jsx를 반환함](./cell-return-jsx.png)

- 이를 flexRender함수로 감싸주면, jsx를 반환하는 cell을 렌더링 할 수 있다.

수정해보면 다음과 같다.

```TSX
const columns = [
  //...
];

export const Table: React.FC = () => {
  const [data, setData] = useState(DATA);
  const table = useReactTable({
    //...
  });

  return (
    <table>
      <thead>
        {/* Table 헤더 */}
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      // cell 또한 header와 유사하다
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

![테이블이 보인다...!](./first-rendered-table.png)

- 첫 번째 목표(4개 컬럼을 렌더링하기)는 이룬 듯 하지만, 간격이 맞지 않다.  
  간격만 맞춰보자
- tanstack-table에서는 [getTotalSize](https://tanstack.com/table/v8/docs/api/features/column-sizing#gettotalsize)라는 이름을 가진 helper function을 제공해준다. 이를 적용해보면,

```TSX
export const Table: React.FC = () => {
  //...

  return (
    <table style={{ width: `${table.getTotalSize()}px` }}>
      <thead>
        {/* Table 헤더 */}
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                style={{
                  width: `${header.getSize()}px`,
                }}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                style={{
                  width: `${cell.column.getSize()}px`,
                  textAlign: 'center',
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

- `getTotalSize()`와 `header.getSize()`, `cell.column.getSize()`를 사용해서 간격을 맞춰주었다.
- 이는 width의 사이즈를 변경시킬 수 있는데, 간단히 column에 size property를 추가해주면 된다.
- 나의 경우엔 셀의 데이터가 두 줄로 변환되는 것을 원하지 않았고, 한 셀에 한 줄로 표현되길 원했다.

```TSX
const columns = [
  {
    accessorKey: 'task',
    header: 'Task',
    cell: (props) => <p>{props.getValue()}</p>,
    size: 250,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (props) => <p>{props.getValue()?.name}</p>,
    size: 100,
  },
  {
    accessorKey: 'due',
    header: 'Due',
    cell: (props) => <p>{props.getValue()?.toLocaleTimeString()}</p>,
    size: 100,
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: (props) => <p>{props.getValue()}</p>,
    size: 300,
  },
];
```

- size를 추가해서 각각 cell의 width 값을 조정해주었다. 최대 800px로 고정시켜놓은 상태에서, size를 모두 합하면 750px이지만, 비율만큼 tanstack-table이 알아서 조정해준다.

![간격을 조절한 후 테이블](./adjust-size-table.png)

<br/>

### 2. 전체, 테이블 row 단위 체크박스

- 이 다음엔 전체/테이블 row 단취 체크박스를 만들어보자.

```TSX
const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        id="header-checkbox"
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        id={`cell-checkbox-${row.id}`}
        type="checkbox"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    size: 50,
  },
  {
    accessorKey: 'task',
    header: 'Task',
    cell: (props) => <p>{props.getValue()}</p>,
    size: 250,
  },
   //...
];
```

- 처음 column을 만들 때 사용했던 column 변수에, select 부분을 추가해주면 된다.

<br/>

- 그럼 체크박스에 row를 체크했을 때, 이 데이터는 어디에 보관되는걸까? id값을 추출하는게 있는걸까?
- 이는 tanstack-table에서 제공하는 useReactTable hooks내에 state를 추가해주면 된다.

```TSX
export const Table: React.FC = () => {
  const [data, setData] = useState(DATA);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // 여기에 onChange와 state를 저장해주면 된다.
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    //...
    </table>
  );
};
```

![console.log('row 선택하기', rowSelection);](./row-selection.gif)

- 이렇게 하면, row를 선택할 때마다, rowSelection이라는 state에 선택한 row의 id가 저장된다.

<br/>

### 3. Pagination 적용하기

- 먼저 데이터가 너무 적어서, faker.js를 사용해서 데이터를 늘려주었다. (6개 → 100개)

```TSX
import {
  //...
  getPaginationRowModel,
} from '@tanstack/react-table';

export const Table: React.FC = () => {
  //...

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


  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
       //...
      </thead>

      <tbody>
       //...
      </tbody>

      // Pagination
      <div>
        {table.getState().pagination.pageIndex + 1} // 현재 페이지
        {table.getPageCount()} // 총 페이지 수
      </div>
    </table>
  );
};
```

- `getPaginationRowModel`을 추가해주면, Pagination을 사용할 수 있다.
- useReactTable에 `getPaginationRowModel`을 추가해주면, 현재 페이지와 총 페이지 수를 알 수 있다.

버튼도 추가해보면,

```TSX
  <div className="mt-[10px] flex items-center justify-center gap-2">
    <button
      disabled={!table.getCanPreviousPage()} // 이전페이지가 없을 때 버튼 비활성화
      onClick={() => table.previousPage()} // 이전 페이지
    >
      {'‹'}
    </button>

    <div className="text-base font-bold">
      Page {table.getState().pagination.pageIndex + 1} of{' '}
      {table.getPageCount()}
    </div>

    <button
      disabled={!table.getCanNextPage()} // 다음페이지가 없을 때 버튼 비활성화
      onClick={() => table.nextPage()} // 다음 페이지
    >
      {'›'}
    </button>
  </div>
```

pagination 챕터 중 마지막으로 pageSize를 선택하고, size를 변경했을 때 pagination의 index값이 적절히 변경되도록 해보자

- 먼저 TableControls를 만들어주었다.

```TSX
const PAGE_SIZE_OPTIONS = [
  {
    value: 20,
    label: '20개씩 보기',
  },
  {
    value: 50,
    label: '50개씩 보기',
  },
  {
    value: 100,
    label: '100개씩 보기',
  },
];

  {/* TableControls */}
  <div>
    <select
      className="my-2 rounded-[4px] border-[1px] py-1 pl-2 pr-9 text-sm"
      value={table.getState().pagination.pageSize} // 현재 페이지 사이즈
      onChange={(e) => {
        table.setPageSize(Number(e.target.value)); // 페이지 사이즈 변경
      }}
    >
      {PAGE_SIZE_OPTIONS.map(({ value, label }) => (
        <option key={label} value={value}>
          {label}
        </option>
      ))}
    </select>
  </div>
```

- 변경시켜주었을 때 잘 적용되는 것을 확인할 수 있다!

근데, 조금 이상하다... 처음 테이블이 랜더링 되면 pageSize는 20개씩 보여야한다.

- 하지만, 20개라고 하기엔 너무 적은 것 같은데.. 🤔 → 직접 세아려보니, 10개씩 랜더링 되었다.  
  추가로 Controls를 통해 20개를 선택해야 20개씩 보였다.
- 처음부터 20개씩 보여줄 순 없는걸까..?

```TSX
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  onRowSelectionChange: setRowSelection,
  state: {
    rowSelection,

    pagination: {
      pageSize: 20, // 이렇게 추가해주면, 처음부터 20개씩 보여주지만, 컨트롤러에 의해 개수가 변경되지 않는다.
    },
  },

  getPaginationRowModel: getPaginationRowModel(),
});
```

- 영상에선 useReactTable내에서 state key의 pagination을 추가해서 pageSize와 pageIndex를 custom 할 수 있다고 제시해준다.
- 하지만 pageSize를 20개로 넣어놓으면, 컨트롤러를 통해 개수가 변경되지 않았다. 즉, state를 통해 값을 변경해야하는 것 같다.
- 나의 경우엔 state를 추가할 필요 없이, 초기 설정될 때 20개로만 변경해주면 되는데, 이런 기능은 없는걸까?
- github issues를 찾아보니, 역시 있었다

[How to set default page size? #2029](https://github.com/TanStack/table/discussions/2029#discussioncomment-4860455)

```TSX
  const table = useReactTable({
    // initialState에 pagination을 추가해주면 된다. 초기에 20개씩 랜더링 될 것이다.
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });


const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  onRowSelectionChange: setRowSelection,
  state: {
    rowSelection,
  },

  // initialState에 pagination을 추가해주면 된다. 초기에 몇 개씩 렌더링할 것인지 정할 수 있다.
  initialState: {
    pagination: {
      pageSize: 20,
    },
  },

  getPaginationRowModel: getPaginationRowModel(),
});
```

이제 새로고침 했을 때 20개씩 랜더링 된다~!

<br/>

추가로 몇 가지만 더 정리해보자!

### 4. TypeScript 적용하기

- 영상에선 Javascript로 작업했지만, 타입을 추가해서 사용할 수 있다.
- 사실 초반부터 작성했으면 가장 베스트했을 것 같은데, 나의 경우엔 영상에서 제시하는 방법보단, `createColumnHelper`로 사용하는걸 더 선호한다.
  - 이렇게 적용했을 때 타입추론이 잘 되어서 따로 타입을 명시하는 것보다 효과적이라고 생각했다.
  - [React Table Tutorial (TanStack Table)](https://youtu.be/CjqG277Hmgg?si=q4jbaMvNXM1hEvlH)소개 했던 이 영상의 가장 많은 좋아요를 받은 댓글 역시 `createColumnHelper`를 사용하길 권한다. 그리고 이 사람은 Tanstack-table의 메인테이너이기도 하다.

<br/>

- 그럼 한번 변경해보자

```TSX
// column 직접 컬럼 선언
const columns = [
  {
    accessorKey: 'task',
    header: 'Task',
    cell: (props) => {
      console.log('props', props);
      return <p>{props.getValue()}</p>;
    },
    size: 250,
  },
  // ...
];


// createColumnHelper를 사용해서 컬럼 선언
const columnHelper = createColumnHelper<ColumnDataProps>();
const columns = [ // 보통은 type을 ColumnDef<ColumnDataProps>[]과 같이 명시해주지만, 명시했을 때 오히려 발생하는 에러가 더 많아서 추론되도록 하였다.
    columnHelper.accessor('task', {
      header: () => <p>Task</p>,
      cell: (info) => info.getValue(),
      size: 250,
    }),
    //...
  ];
```

그래서 정리해보면 다음과 같다.

```TSX
import type { Row as TRow, Table as TTable } from '@tanstack/react-table';
import {
  type ColumnDef,
  //...
} from '@tanstack/react-table';
import { useState } from 'react';

import DATA from '@/data';

interface Status {
  id: number;
  name: string;
}

interface ColumnDataProps {
  task: string;
  status: Status;
  due?: Date | null;
  notes: string;
}

interface TableProps {
  table: TTable<ColumnDataProps>;
}

interface RowProps {
  row: TRow<ColumnDataProps>;
}

const PAGE_SIZE_OPTIONS = [
  //...
];

export const Table: React.FC = () => {
  //...
  const columnHelper = createColumnHelper<ColumnDataProps>();
  const columns = [
    {
      id: 'select',
      header: ({ table }: TableProps) => (
        <input
          id="header-checkbox"
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }: RowProps) => (
        <input
          id={`cell-checkbox-${row.id}`}
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 50,
    },
    columnHelper.accessor('task', {
      header: 'Task',
      cell: (props) => <p>{props.getValue()}</p>,
      size: 250,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (props) => <p>{props.getValue().name}</p>,
      size: 100,
    }),
    columnHelper.accessor('due', {
      header: 'Due',
      cell: (props) => <p>{props.getValue()?.toLocaleTimeString()}</p>,
      size: 100,
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      size: 300,
      cell: (props) => <p>{props.getValue()}</p>,
    }),
  ];

  const table = useReactTable({
    //...,
  });

  return (
  //...
  );
};
```

- props의 getValue()를 사용할 때도 이제, 뒤에 무엇이 오는지 타입으로 체크가능하다

![id와 name을 확인할 수 있다.](./getValue-type.png)

<br/>

### 5. 스타일 입히기

### 6. 더 알아보기

<!--

1. 내게 필요했던 것을 먼저
2. 그 다음 내가 개선했던 부분
3. 영상에서 추가로 알려주는 부분
4. shadcn-ui로 스타일 입혀보기

-->

```

```

```

```
