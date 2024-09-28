---
date: '2024-09-22'
title: 'Tanstack-table '
categories: ['개발']
summary: ''
---

[이전 글에서도 언급했지만](https://geuni620.github.io/blog/2024/6/7/tanstack-table-server-side/), Tanstack-table을 페이지네이션을 client-side와 server-side 모두 적용할 수 있다.

server-side를 알게 된 이후, 최근까진 Tanstack-table을 사용해야할 경우 모두 server-side로 구현했다.  
일단, 서버에 의존적이라는게 나는 오히려 좋았다.  
자주 요청을 보내더라도, 보여줘야할 양 만큼만 가져오는게 마음에 든다.  
하지만 이번에 새롭게 배포한 기능에선 예상지 못한 이슈가 발생했는데, 다음과 같다.

![](./problem.png)

1. 1페이지에서 원하는 데이터를 체크박스에 체크했다.
2. 다른 페이지에서 데이터를 선택하기 위해, 페이지를 이동했다. 2페이지로 갔다고 가정해보자
3. 2페이지에서 원하는 데이터를 선택했다.

그리고 확인을 누르면, 1페이지에서 선택한 데이터가 유지되지 않는 것이다.

페이지네이션이 서버에 의존하고 있어서,  
1페이지에서 2페이지로 넘어갔을 때, 2페이지에 해당 하는 양만큼 새롭게 데이터를 불러오고,  
이때 1페이지에서 선택한 데이터는 날아가버린다.

<br/>

**어떻게하면 페이지네이션 변경에 따라 데이터를 유지시킬 수 있을까?**

Tanstack-table을 사용했을 때, 크게 두 가지 방법이 있는 것 같다.  
첫 번째는, useReactTable의 onRowSelectionChange 메서드에 custom한 함수를 등록하는 방법,  
두 번째는, rowSelection에 따라 useEffect로 데이터를 동기화시키는 것이다.

사실 처음 봤을 땐, 첫 번째가 더 나은 방법이라는 생각도 들지만,
확실히 간단하고 '동기화'라는 개념으로 봤을 때, 두 번째도 절-대 나쁜 코드라고 생각되지 않는다.

각각 살펴보자.

<br/>

### 1. onRowSelectionChange

먼저, Tanstack-table의 useReactTable가 어떻게 만들어지는지 살펴보자.

```TSX
// https://github.com/TanStack/table/blob/6b4d616dd7c8917616eb4fecaf09dda7030fd115/packages/react-table/src/index.tsx#L57C1-L94C2
export function useReactTable<TData extends RowData>(
  options: TableOptions<TData>
) {
  // Compose in the generic options to the user options
  const resolvedOptions: TableOptionsResolved<TData> = {
    state: {}, // Dummy state
    onStateChange: () => {}, // noop
    renderFallbackValue: null,
    ...options,
  }

  // Create a new table and store it in state
  const [tableRef] = React.useState(() => ({
    current: createTable<TData>(resolvedOptions),
  }))

  // By default, manage table state here using the table's initial state
  const [state, setState] = React.useState(() => tableRef.current.initialState)

  // Compose the default state above with any user state. This will allow the user
  // to only control a subset of the state if desired.
  tableRef.current.setOptions(prev => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state,
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: updater => {
      setState(updater)
      options.onStateChange?.(updater)
    },
  }))

  return tableRef.current
}
```

여기서 createTable이 존재하는데, 이를 따라가보면,

```TSX
// https://github.com/TanStack/table/blob/6b4d616dd7c8917616eb4fecaf09dda7030fd115/packages/table-core/src/core/table.ts#L283C1-L299C40
export function createTable<TData extends RowData>(
  options: TableOptionsResolved<TData>
): Table<TData> {
  if (
    process.env.NODE_ENV !== 'production' &&
    (options.debugAll || options.debugTable)
  ) {
    console.info('Creating Table Instance...')
  }


  const _features = [...builtInFeatures, ...(options._features ?? [])]


  let table = { _features } as unknown as Table<TData>


  const defaultOptions = table._features.reduce((obj, feature) => {
    return Object.assign(obj, feature.getDefaultOptions?.(table))
  }, {}) as TableOptionsResolved<TData>


// https://github.com/TanStack/table/blob/6b4d616dd7c8917616eb4fecaf09dda7030fd115/packages/table-core/src/core/table.ts#L41C1-L57C11
const builtInFeatures = [
  Headers,
  ColumnVisibility,
  ColumnOrdering,
  ColumnPinning,
  ColumnFaceting,
  ColumnFiltering,
  GlobalFaceting, //depends on ColumnFaceting
  GlobalFiltering, //depends on ColumnFiltering
  RowSorting,
  ColumnGrouping, //depends on RowSorting
  RowExpanding,
  RowPagination,
  RowPinning,
  RowSelection,
  ColumnSizing,
] as const
```

여기서 builtInFeatures 내 우리가 찾는 rowSelection에 관한 것도 정의되어있다.

```TSX
// https://github.com/TanStack/table/blob/6b4d616dd7c8917616eb4fecaf09dda7030fd115/packages/table-core/src/features/RowSelection.ts#L199-L219
export const RowSelection: TableFeature = {
  getInitialState: (state): RowSelectionTableState => {
    return {
      rowSelection: {},
      ...state,
    }
  },


  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>
  ): RowSelectionOptions<TData> => {
    return {
      // makeStateUpdater는 여기 링크를 참고하면 된다.
      // https://github.com/TanStack/table/blob/6b4d616dd7c8917616eb4fecaf09dda7030fd115/packages/table-core/src/utils.ts#L91C1-L103C2
      onRowSelectionChange: makeStateUpdater('rowSelection', table),
      enableRowSelection: true,
      enableMultiRowSelection: true,
      enableSubRowSelection: true,
      // enableGroupingRowSelection: false,
      // isAdditiveSelectEvent: (e: unknown) => !!e.metaKey,
      // isInclusiveSelectEvent: (e: unknown) => !!e.shiftKey,
    }
  },
```

즉, 정리해보면, createTable에 의해 테이블에 필요한 기능들을 쭉 만들게 되는데,
이때 RowSelection에 관련된 기능도 생성하게 되는 것이다.

그리고, 우리는 useReactTable hooks을 호출한 뒤, state에 rowSelection에 사용할 state를 등록하고,
onRowSelectionChange 함수에 해당 setState를 등록하면 state를 업데이트 시킬 수 있는 구조다.

<br/>

그럼 이제, rowSelection이 선택되었을 때, 바로 setState를 적용하는게 아니라,  
rowSelection의 행을 기반으로 그 행의 row data를 다른 state에 저장해주자.

```TSX
  const onRowSelectionChangeHandler: OnChangeFn<RowSelectionState> = (
    updaterOrValue: Updater<RowSelectionState>,
  ) => {
    const updateRowSelection =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(rowSelection)
        : updaterOrValue;

    setRowSelection(updateRowSelection);

    const selectedRows = Object.entries(updateRowSelection).reduce(
      (acc, [key, isSelected]) => {
        if (isSelected) {
          const index = Number(key);
          acc.push(data[index]);
        }
        return acc;
      },
      [] as TData[],
    );

    setSelectedRowData(selectedRows);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
    onPaginationChange,
    onRowSelectionChange: onRowSelectionChangeHandler,
    state: { pagination, rowSelection },
  });
```

하지만 여기서 또 의문인게, updateOrValue가 무엇인지, 어떻게 동작하는지 잘 모르겠다.

```TSX
    console.log('updaterOrValue', updaterOrValue);
```

로그를 찍어 확인해보자.

<br/>

```TSX
// https://github.com/TanStack/table/blob/6b4d616dd7c8917616eb4fecaf09dda7030fd115/packages/table-core/src/features/RowSelection.ts#L469
export const RowSelection: TableFeature = {
  // ...
  createRow: <TData extends RowData>(
    row: Row<TData>,
    table: Table<TData>
  ): void => {
    row.toggleSelected = (value, opts) => {
      const isSelected = row.getIsSelected()

      table.setRowSelection(old => {
        value = typeof value !== 'undefined' ? value : !isSelected

        if (row.getCanSelect() && isSelected === value) {
          return old
        }

        const selectedRowIds = { ...old }

        mutateRowIsSelected(
          selectedRowIds,
          row.id,
          value,
          opts?.selectChildren ?? true,
          table
        )

        return selectedRowIds
      })
    }
  },
}

const mutateRowIsSelected = <TData extends RowData>(
  selectedRowIds: Record<string, boolean>,
  id: string,
  value: boolean,
  includeChildren: boolean,
  table: Table<TData>
) => {
  const row = table.getRow(id, true)

  // const isGrouped = row.getIsGrouped()

  // if ( // TODO: enforce grouping row selection rules
  //   !isGrouped ||
  //   (isGrouped && table.options.enableGroupingRowSelection)
  // ) {
  if (value) {
    if (!row.getCanMultiSelect()) {
      Object.keys(selectedRowIds).forEach(key => delete selectedRowIds[key])
    }
    if (row.getCanSelect()) {
      selectedRowIds[id] = true
    }
  } else {
    delete selectedRowIds[id]
  }
  // }

  if (includeChildren && row.subRows?.length && row.getCanSelectSubRows()) {
    row.subRows.forEach(row =>
      mutateRowIsSelected(selectedRowIds, row.id, value, includeChildren, table)
    )
  }
}
```

로그로 확인해보면, 해당 부분은 table.setRowSelection을 호출한다.

그리고 여기서 변경사항이 동일하다면 old를 return하고, 변경사항이 존재한다면, mutateRowIsSelected를 호출한다.
그리고, if(value)내부의 코드를 통해 rowSelection을 업데이트하는 것이다.

즉 위에서 우린 이런 코드를 본 적이 있다.

```TSX
  tableRef.current.setOptions(prev => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state,
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: updater => {
      setState(updater)
      options.onStateChange?.(updater)
    },
  }))
```

여기서 우린 setState를 통해, Table내의 table를 업데이트시키는 과정이었던 것이다.
그리고 options.onStateChange?.(updater)이 우리가 등록한 setRowSelection을 업데이트하는 부분이다.

<br/>

<br/>

### 2. rowSelection → useEffect

```TSX
export const DataTable = <TData, TValue>({
  data,
  columns,
  total,
  pagination,
  onPaginationChange,
  getRowId,
}: DataTableProps<TData, TValue>) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedRowData, setSelectionRowData] = useState<InventoryInspectionResponse['data']>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    state: { pagination, rowSelection },
    getRowId,
  });

  useEffect(() => {
    const handleSelectionState = (selections: RowSelectionState) => {
      setSelectionRowData((prev) =>
        Object.keys(selections)
          .map(
            (key) =>
              table.getSelectedRowModel().rowsById[key]?.original ||
              prev.find((row) => row.inspectionCode === key),
          )
      );
    };

    handleSelectionState(rowSelection);
  }, [rowSelection]);

  return (
    // ...
  );
};
```

server-side가 아니라, client-side로 구성했다면,

```TSX
table.getSelectedRowModal().flatRows.map((row) => row.original)
```

이 가능하다. table내 모든 데이터가 한번에 관리되고 있기 때문이다.  
하지만, server-side를 페이지를 전
