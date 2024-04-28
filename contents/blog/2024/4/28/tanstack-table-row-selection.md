---
date: '2024-04-21'
title: 'tanstack-table row selection 업데이트 하기 '
categories: ['개발']
summary: ''
---

tanstack-table에서 체크박스 상태를 관리하기 위해선, rowSelection이라는 상태값을 만들어서 사용한다.  
그럼 만약 이런 경우라면 어떻게 처리해줘야할까?
서버로부터 전달받은 데이터를, table 컴포넌트에 props로 내려줬다.

<br/>

```TSX
export default function Home() {
  //...

  const tableList = useTableDataGetQuery({
    searchCondition,
  });

  return (
    <div className="h-screen w-screen">
      <div className="mx-auto w-[900px] pb-20 pt-10">
        //...

        <TableComponents data={tableList.data?.list || []} />
      </div>
    </div>
  );
}
```

<br/>

```TSX
export const TableComponents: React.FC<TableComponentsProps> = ({ data }) => {
  const toggleMutation = useToggleMutation();
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

    state: {
      rowSelection,
      columnFilters,
      sorting,
    },

    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  useEffect(() => {
    const newSelectedRows: Record<number, boolean> = {};

    data.forEach((row) => {
      if (row.done) {
        newSelectedRows[row.id - 1] = row.done;
      }
    });

    setRowSelection(newSelectedRows);
  }, [data]);

  return (
    // ...
  );
};
```

가장 먼저 useEffect를 사용할 수 있을 것 같다.  
의존성배열에 data를 넣어줘서, data가 변경될 때마다, useEffect를 통해, rowSelection 상태를 table과 동기화 시킨다.

<br/>

만약 rowSelection 상태를 useEffect가 아닌 다른 방법으로 사용할 순 없을까?
최근 useEffect를 사용하면, useEffect를 사용하지 않고 적용할 수 있는 방법은 없을까? 깊게 고민해보게 된다.  
사실 이 경우는, 리액트의 철학에 일치한다고 생각한다.  
useEffect의 목적은 내부가 아닌 외부 상태와 현재 리액트의 상태를 동기화하기 위함인데, useEffect를 이용해서 rowSelection과 외부 api를 통해 받은 데이터를 동기화시킬 수 있기 때문이다.

<br/>

두 가지 방법정도를 생각했는데, 결론부터 말하면 둘 다 실패했다.  
하나씩 시도해보고, 기록용으로 남겨둔다.

### 1. 간단한 조건문을 사용하는 방법

### 2. if문을 사용하는 방법
