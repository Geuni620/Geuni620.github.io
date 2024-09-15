---
date: '2024-09-07'
title: '검색된 결과를 유지하기'
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

## 1. 엔터 또는 검색 버튼을 눌러야 서버로 API를 호출하는 방법

### 1-1. useEffect를 사용했을 때

가장 먼저, tanstack-query가 없는 환경에선, 어떻게 구현할 수 있을까?

```TSX
export function Dashboard() {
  const { onLogoutClick } = useLogin();
  const { pagination, onPaginationChange, onPageSizeChange } = usePagination();
  const { search, onSearchChange } = useSearchCondition();

  const [data, setData] = useState<InventoryInspectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

다음과 같이 구성할 수 있을 것 같다.

- 검색을 입력할 때, search state내 검색값을 저장 → onSubmit시 search state를 이용해서 API 호출
- 페이지네이션이나, 페이지셀렉션에 따라 useEffect 디펜던시에 state를 추가해, getInventoryInspection가 호출되어야한다.

오히려 [Tkdodo 블로그 글](https://tkdodo.eu/blog/why-you-want-react-query)을 참고하지 않은 상태라면,  
Tanstack-query를 사용했을 때보다 간단하고 명확히 구성할 수 있다는 생각도 든다.

<br/>

하지만 블로그글을 참고하면, 여러 문제가 있다는 걸 인지할 수 있다.
<small>이는 본 글의 주제가 아니니, 간략히 링크만 추가하고 넘어갈게요. 🙏</small>

<br/>

### 1-2. Tanstack-query를 사용했을 때

사실 Tanstack-query는 여러 방법이 존재한다.

isSubmitState 사용하기
refetch
fetchQuery

<br/>

사실 방법은 크게 두 가지가 존재하는 듯하다.
하나는, useSearchParams를 사용하는 방법이 있는 것 같고,  
다른 하나는, useLocation과 useNavigate를 함께 사용하는 방법이 있는 것 같다.  
각각을 알아보자.
