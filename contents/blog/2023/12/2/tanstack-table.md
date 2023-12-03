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

<!--

1. 내게 필요했던 것을 먼저
2. 그 다음 내가 개선했던 부분
3. 영상에서 추가로 알려주는 부분
4. shadcn-ui로 스타일 입혀보기

-->
