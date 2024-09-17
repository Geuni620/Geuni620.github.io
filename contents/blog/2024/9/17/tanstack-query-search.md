---
date: '2024-09-17'
title: 'Tanstack-query를 이용한 검색기능 구현하기 + 검색조건 유지하기'
categories: ['개발']
summary: 'useSearchParams를 사용해보자'
---

![](./img.webp)

[예시 소스코드](https://github.com/Geuni620/tanstack-query-search)

> 검색기능은 크게 두 가지 case가 있는 것 같다.
>
> 검색어를 입력하자마자 **debounce를 적용해서 일정시간 뒤에 서버로 API를 호출**하는 방법이 있고,  
> 모든 검색조건을 입력한 뒤, **엔터(Enter) 또는 검색 버튼을 눌러야 서버로 API를 호출하는 방법**도 있다.  
> **두 번째 방법을 Tanstack-query를 사용했을 때 어떻게 구현할 수 있을까?**
>
> 그리고 추가로, **검색된 결과를 유지할 수 있는 방법에 대해 알아보자.**

# 1. 엔터(Enter) 또는 검색 버튼을 통해, <br/> 서버로 API를 호출하는 방법

## 1-1. useEffect를 사용했을 때

가장 먼저 useEffect만 사용했을 때, 어떻게 구현할 수 있을까?

```TSX
export function Dashboard() {
  const { onLogoutClick } = useLogin();
  const { pagination, onPaginationChange, onPageSizeChange } = usePagination();
  const { search, onSearchChange } = useSearchCondition();

  const [data, setData] = useState<InventoryInspectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 사용자의 입력 뒤, 엔터 또는 검색버튼을 클릭 시, 데이터를 불러옴.
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await getInventoryInspection({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        search,
      });
      setData(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    }
    setLoading(false);
  };

  // 처음 컴포넌트가 마운트 되었을 때, 데이터를 불러옴.
  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getInventoryInspection({
          page: pagination.pageIndex,
          size: pagination.pageSize,
        });

        if (!ignore) {
          setData(result);
        }
      } catch (err) {
        if (err instanceof Error) {
          if (!ignore) {
            setError(err);
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [pagination.pageIndex, pagination.pageSize]);

  return (
    // JSX
  );
}
```

- 검색을 입력할 때, search state내 검색값을 저장 → onSubmit시 search state를 이용해서 API 호출
- 페이지네이션이나, 페이지셀렉션에 따라 useEffect dependency에 state를 추가해,  
  `getInventoryInspection`가 호출되어야한다.

[Tkdodo 블로그 글](https://tkdodo.eu/blog/why-you-want-react-query)을 읽지 않았다면,  
Tanstack-query를 사용했을 때보다 간단하고 명확히 구성할 수 있다는 생각도 든다.

<br/>

하지만 블로그 글을 참고한 뒤, 여러 문제가 있다는 걸 인지할 수 있다.  
<small>이는 본 글의 주제가 아니니, 간략히 링크만 추가하고 넘어갈게요. 🙏</small>

<br/>

## 1-2. Tanstack-query를 사용했을 때

Tanstack-query를 사용했을 때, 크게 3가지로 나눌 수 있을 것 같다.

1. refetch를 사용하는 방법
2. isSubmmited와 같은 상태값을 추가해서 submit인 경우 true가 되고 → onSuccess일 경우, false로 변경
3. queryClient의 fetchQuery

이 중, 1번과 3번만 구현해봤다.  
2번은 좋은 방법이 아닌 것 같다.

불필요한 상태값의 추가로 useEffect를 사용하게 되고, 결국 복잡도가 올라갔다.  
예시를 만들다가, 좋은 예가 아닌 것 같아서 제거했다.

### 1-2-1. refetch

먼저, 가장 간단한 refetch를 사용하는 방법이다.

```TSX
export function Dashboard() {
  const { onLogoutClick } = useLogin();
  const { pagination, onPaginationChange, onPageSizeChange } = usePagination();
  const { search, onSearchChange } = useSearchCondition();

  const stockList = useGetInventoryInspection({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    search,
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    stockList.refetch();
  };

  useEffect(() => {
    if (!stockList.data) {
      stockList.refetch();
    }
  }, [stockList]);

  if (stockList.data)
  return (
    // JSX
  );
}
```

**개인적으로, 이 방법이 가장 간편하고, 명확한 것 같다.**

```TSX
// useGetInventoryInspection.ts
export const useGetInventoryInspection = ({ page, size, search }: Props) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: inventoryInspectionKeys.list({
      page,
      size,
    }),
    queryFn: ({ queryKey }) => getInventoryInspection({ queryKey, search }),
    placeholderData: keepPreviousData,
    enabled: false,
  });
};
```

하나 특이점이라면 queryKey의 lint에러를 disabled 해야한다는 점과, enabled를 false로 둬야한다는 점이다.  
lint에러가 나지 않게 하려면 queryKey 내에 search를 넣어줘야하는데, 이렇게 되면 유저가 검색값을 입력할 때마다 데이터를 불러온다.

즉, 위에서 언급했던 첫 번째 방법이 되어버린다.

<br/>

### 1-2-2. fetchQuery

```TSX
export function Dashboard() {
  const queryClient = useQueryClient();
  const { onLogoutClick } = useLogin();
  const { pagination, onPaginationChange, onPageSizeChange } = usePagination();
  const { search, onSearchChange } = useSearchCondition();

  const stockList = useGetInventoryInspection({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    search,
  });

  const fetchData = async () => {
    await queryClient.fetchQuery({
      queryKey: inventoryInspectionKeys.list({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        search,
      }),
      queryFn: getInventoryInspection,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetchData();
  };

  if (stockList.data)
    return (
     // JSX
    );
}
```

fetchQuery를 이용하면, useQuery의 선언적인 방법을 명령형으로 구현할 수 있다.  
단, fetchQuery로만 구현했을 땐, isLoading이나, error 등을 모두 직접 구현해야한다.

fetchQuery와 useQuery를 함께 사용하면 어느정도 일부는 선언적이게, 일부는 명령적이게 구성할 수 있었다.

- 페이지네이션, 페이지셀렉션은 선언적 → useQuery가 담당
- 검색어를 통한 submit은 명령적 → fetchQuery가 담당

그리고 fetchQuery로 API를 호출했을 때, stockList로 isLoading이나, isFetching으로 로딩효과를 주면 된다.

---

기획의 의도에 따라, 위 방법이 더 좋을 수 있지만,  
내가 속한 현 회사의 프로덕트의 경우, 검색조건을 유지시켜서 데이터 변경이 일어났을 때,  
**해당 페이지가 전체가 refresh되는게 아닌 현 상태 검색조건을 유지 + 데이터만 업데이트** 되길 원했다.  
이런 기획의 의도라면, 위 방법들은 맞지 않는다.

# 2. 검색조건 유지시키기

검색조건을 유지시키는 방법도, 여러가지가 있겠지만, 이 글에서 제시하고 싶은 방법은 **URL**이다.

react-router-dom를 사용해서 구현해보려고 한다.  
버전에 따라 v5에선 useLocation + useHistory를 사용해야했고,  
v6에선 useSearchParams로 간편하게 구현할 수 있다.

이 글에선 v6의 useSearchParams를 사용해서 구현해보려고 한다.  
v5의 구현은 [해당링크](https://codesandbox.io/p/sandbox/react-query-url-filtering-h0ikw?file=%2Fsrc%2FApp.tsx%3A64%2C30)를 통해 확인할 수 있다.  
<small>출처는 하단에 링크로 남겨놓을게요. 🙇‍♂️</small>

<br/>

## 2-1 react-router-dom v6, useSearchParams

단계별로 하나씩 수정해보자.

### 2-1-1. useQueryParams 추가

```TSX
// useQueryParams.ts
import { useSearchParams } from 'react-router-dom';

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10) - 1;
  const size = parseInt(searchParams.get('size') || '20', 10);
  const search = searchParams.get('search') || '';

  const queryParams = {
    page,
    size,
    search,
  };

  return [queryParams, setSearchParams] as const;
};
```

예시에선, `page`, `size`, `search`의 상태를 관리하고 있었다.  
이는 각각, `useSearchCondition`과, `usePagination`으로 관리하고 있었다.

```TSX
// usePagination.ts
export const usePagination = () => {
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 20,
  });

  const onPageSizeChange = (pageSize: number) => {
    setPagination((prev) => {
      return {
        ...prev,
        pageSize,
      };
    });
  };

  return {
    pagination,
    onPaginationChange: setPagination,
    onPageSizeChange: onPageSizeChange,
  };
};

---

// useSearchCondition.ts
export const useSearchCondition = () => {
  const [search, setSearch] = useState('');

  const onSearchChange = (newValue: string) => {
    setSearch(newValue);
  };

  return {
    search,
    onSearchChange,
  };
};
```

위와 같은 상태를 **useSearchParams를 사용하면, 모두 제거할 수 있다.**

<br/>

### 2-1-2. useGetInventoryInspection 수정

useQuery를 호출하는, custom hook인 useGetInventoryInspection을 수정해줬다.

```TSX
// useGetInventoryInspection.ts
// before
export const useGetInventoryInspection = ({ page, size, search }: Props) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: inventoryInspectionKeys.list({
      page,
      size,
    }),
    queryFn: ({ queryKey }) => getInventoryInspection({ queryKey, search }),
    placeholderData: keepPreviousData,
    enabled: false,
  });
};

// after
export const useGetInventoryInspection = () => {
  const [{ page, size, search }] = useQueryParams();

  return useQuery({
    queryKey: inventoryInspectionKeys.list({
      page,
      size,
      search,
    }),
    queryFn: getInventoryInspection,
    placeholderData: keepPreviousData,
  });
};
```

refetch에서 사용했던 코드에 비해 훨씬 명확해졌다.

- lint의 disabled를 제거할 수 있었다.
- queryKey에 search를 추가해줄 수 있다.
- props를 제거하고, useQueryParams hook으로 queryKey에 해당하는 인자값을 가져올 수 있다.

<br/>

### 2-1-3. Input 수정 (제어컴포넌트 → 비 제어컴포넌트)

```TSX
export const Search: React.FC<SearchProps> = ({ search }) => {
  return (
    <div className="ml-auto flex-1 sm:flex-initial">
      <div className="relative">
        <SearchIcon className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <Input
          className="bg-white pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
          placeholder="Search orders..."
          type="search"
          name="search"
          defaultValue={search}
        />
      </div>
    </div>
  );
};
```

위 코드에서 특이점은, onChange가 없다는 점이다.  
그리고 value가 아닌 defaultValue를 사용한다.

value를 사용하면, Input에 value를 변경하려 해도, 변경되지 않는다.  
onChange가 없기 때문이다.  
즉, 제어 컴포넌트가 아닌 비제어컴포넌트로 구성하는 것이다.

onChange가 없다면, 어떻게 search value를 가져올 수 있을까?  
먼저, name을 꼭 추가해줘야한다. 물론 attribute를 통해 type을 지정해줘도 가져올 수 있지만,  
name을 추가해서 명확히 가져오는게 더 좋은 방법이라고 생각된다.

```TSX
const [queryParams, setQueryParams] = useQueryParams();
const { page, size, search } = queryParams;

const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const newSearch = formData.get('search')?.toString() || ''; // here 🙋‍♂️

  setQueryParams((prevParams) => {
    prevParams.set('page', '1');

    if (newSearch) {
      prevParams.set('search', newSearch);
    } else {
      prevParams.delete('search');
    }

    return prevParams;
  });
};
```

다음으로 onSubmit 이벤트가 발생했을 때, formData를 통해 name의 현재 search값을 가져올 수 있다.  
이를 setQueryParams를 통해서, URL에 올려주는 것이다.

<br/>

### 2-1-4. page, size

```TSX
  const onPageSizeChange = (newPageSize: number) => {
    setQueryParams((prevParams) => {
      prevParams.set('size', newPageSize.toString());
      prevParams.set('page', '1');
      return prevParams;
    });
  };

  const onPaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    setQueryParams((prevParams) => {
      const currentPagination = { pageIndex: page, pageSize: size };

      const newPagination =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(currentPagination)
          : updaterOrValue;

      prevParams.set('page', (newPagination.pageIndex + 1).toString());
      prevParams.set('size', newPagination.pageSize.toString());

      return prevParams;
    });
  };
```

마지막으로 페이지네이션이나, 페이지셀렉션 역시 동일하게 setQueryParams를 사용하면 된다.

<br/>

### 정리

useSearchParams를 사용하기 위해 최근, react-router-dom v5 → v6로 버전 업을 진행했다.  
아직 미숙한 부분도 존재하지만, useSearchParams를 통해서, 우리 프로덕트의 검색기능을 개선한다면,  
불필요한 state를 대폭 제거할 수 있겠다는 확신이 생겼다.

추가로 사용자들의 검색조건 유지를, 굳이 localStorage와 같은 곳에 보관할 필요도 없어지며,  
컴포넌트 설계를 다시해서, re-rendering 잘 되던 state를 괜히 관심사에 맞지 않는 부모로 올리거나, 자식으로 내릴 필요도 없어진다.

조금 더 고도화해보면서, 프로덕트에 잘 녹여봐야겠다.

### 참고자료

[How to let Query are performed at the component onmount and triggered by user event later?](https://stackoverflow.com/questions/71077346/how-to-let-query-are-performed-at-the-component-onmount-and-triggered-by-user-ev/71093384#71093384)

- codesandbox 참조한 링크

[useQuery for a search API #957](https://github.com/TanStack/query/discussions/957)

[useLazyQuery #1205](https://github.com/TanStack/query/discussions/1205#discussioncomment-7108969)
