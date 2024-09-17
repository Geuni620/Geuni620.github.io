---
date: '2024-09-07'
title: 'Tanstack-query를 이용한 다양한 검색기능 구현하기'
categories: ['개발']
summary: 'tanstack query 검색 예시'
---

> 검색기능은 크게 두 가지 case가 있는 것 같다.
>
> 검색어를 입력하자마자 **debounce를 적용해서 일정시간 뒤에 서버로 API를 호출**하는 방법이 있고,  
> 모든 검색조건을 입력한 뒤, **엔터(Enter) 또는 검색 버튼을 눌러야 서버로 API를 호출하는 방법**도 있다.  
> **두 번째 방법을 Tanstack-query를 사용했을 때 어떻게 구현할 수 있을까?**
>
> 그리고 추가로, **검색된 결과를 유지할 수 있는 방법에 대해 알아보자.**

# 엔터 또는 검색 버튼을 눌러야 서버로 API를 호출하는 방법

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
- 페이지네이션이나, 페이지셀렉션에 따라 useEffect 디펜던시에 state를 추가해, `getInventoryInspection`가 호출되어야한다.

[Tkdodo 블로그 글](https://tkdodo.eu/blog/why-you-want-react-query)을 참고하지 않은 상태라면,  
Tanstack-query를 사용했을 때보다 간단하고 명확히 구성할 수 있다는 생각도 든다.

<br/>

하지만 블로그 글을 참고한 뒤, 여러 문제가 있다는 걸 인지할 수 있다.  
<small>이는 본 글의 주제가 아니니, 간략히 링크만 추가하고 넘어갈게요. 🙏</small>

<br/>

## 1-2. Tanstack-query를 사용했을 때

Tanstack-query를 사용했을 때, 크게 3가지로 나눌 수 있을 것 같다.

1. refetch를 사용하는 방법
2. isSubmmited와 같은 상태값을 추가해서 submit인 경우 true가 되고, onSuccess일 경우, false로 변경
3. fetch

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

### 1-2-2. isSubmmited

```TSX
  const [isSubmitted, setIsSubmitted] = useState(true); // 초기값을 true로 설정
```

**이 방법은 개인적으로 좋지 못한 방법인 것 같다.**  
불필요한 state를 하나 더 추가해서, isSubmitted를 통해서 API의 호출여부를 핸들링하게 되는데,  
페이지네이션, 페이지셀렉션이 추가될수록 useEffect의 의존성이 추가되고, 복잡도가 올라간다.

Tanstack-query는 라이브러리 특성상 선언적인 라이브러리인데, 이를 명령형이게 억지로 끼워맞추려고 하니 온전히 동작하지 않는 경우가 많다.  
즉, 이렇게 쓸 것이라면 Tanstack-query를 안쓰는게 더 효율적일 것이다. → refetch로 사용 또는 useEffect로 구현

<br/>

### 1-2-3. fetchQuery

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

<br/>

기획의 의도에 따라, 위 방법이 더 좋을 수 있지만,  
내가 속한 현 회사의 프로덕트의 경우, 검색조건을 유지시켜서 데이터 변경이 일어났을 때,  
해당 페이지가 refresh되는게 아닌 현 상태 검색조건을 유지 + 데이터만 업데이트 되길 원했다.  
이런 기획의 의도라면, 위 방법들은 맞지 않는다.

# 검색조건 유지시키기

검색조건을 유지시키는 방법도 크게는 한 가지이지만(url을 사용하는 방법), 버전에 따라 나눠보면 두 가지이다.

react-router-dom v6의 경우, useSearchParams를 이용해서 쉽게 구현할 수 있다.  
react-router-dom v5의 경우, useLocation, useHistory로 각각을 구현해야한다.

이 경우엔, tanstack-query와 useSearchParams를 이용해서 손 쉽게 검색조건을 유지시켜보자.

<br/>

### 참고자료

[How to let Query are performed at the component onmount and triggered by user event later?](https://stackoverflow.com/questions/71077346/how-to-let-query-are-performed-at-the-component-onmount-and-triggered-by-user-ev/71093384#71093384)
