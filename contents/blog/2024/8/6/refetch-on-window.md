---
date: '2024-08-04'
title: ''
categories: ['개발']
summary: ''
---

최근까지 회사의 기술적 난이도가 높지 않고, 똑같은 일만 반복해야하는 점에 불만이 있었는데,  
**자만**이었다.

오늘 간단히 해결할 수 있는 문제를 가지고 또 시간을 허비했다.

대략 이러한 문제였다.

```
react-query v3를 사용합니다.

현재 useEffect로 데이터를 가져오는 구간이 존재하는데,
해당 부분에서 데이터가 변경되면 DB에 반영됐을 겁니다.

그리고 주문번호라는 걸 클릭하면, 업데이트된 데이터를 기반으로 데이터를 가져올 것 입니다.
이때는 queryKey로 useQuery로 데이터를 호출하는 겁니다.

근데, 만약, 주문번호로 먼저 데이터를 가져온 상태에서,
useEffect를 사용하는 구간에 데이터가 변경됐고,
이후에 다시 주문번호를 클릭했을 때,

제 생각엔, cacheTime과 staleTime이 5분과 0ms이기 때문에,
isFetching은 true가 되어야하고,
그럼 데이터를 새롭게 가져와야할 것 같습니다.

하지만 invalidateQuery 또는 refetch가 이뤄지지 않는다면,
해당 부분의 데이터는 계속 캐싱된 데이터를 가져오고,
isLoading과 isFetching 역시 false를 리턴합니다.
```

네, 이해가 어려운 부분이 있으신 것 같습니다. react-query의 동작 방식에 대해 설명드리겠습니다.

useEffect와 DB 업데이트:
useEffect로 데이터를 가져오고 DB에 반영하는 부분은 react-query와 직접적인 관련이 없습니다. 이는 일반적인 React 컴포넌트의 부수 효과로 처리되는 부분입니다.
주문번호 클릭 시 useQuery 사용:
useQuery를 사용하여 데이터를 가져오는 것은 올바른 접근입니다.
cacheTime과 staleTime:

cacheTime (5분): 캐시된 데이터가 메모리에 유지되는 시간입니다.
staleTime (0ms): 데이터가 "오래된" 것으로 간주되는 시간입니다.

staleTime이 0ms라는 것은 데이터를 가져온 직후부터 "오래된" 것으로 간주한다는 의미입니다. 하지만 이것이 자동으로 리페치를 트리거하지는 않습니다.

isFetching과 데이터 갱신:
staleTime이 0ms이더라도, react-query는 자동으로 매번 데이터를 다시 가져오지 않습니다. 대신, 다음과 같은 경우에 리페치가 발생합니다:

컴포넌트가 다시 마운트될 때
윈도우가 다시 포커스될 때
네트워크가 다시 연결될 때
refetchInterval이 설정된 경우

캐시된 데이터 사용:
invalidateQueries나 refetch를 명시적으로 호출하지 않으면, react-query는 캐시된 데이터를 계속 사용합니다. 이는 성능 최적화를 위한 것입니다.

해결 방안:

refetchOnMount 옵션 사용:

javascriptCopyuseQuery('orderKey', fetchOrderData, { refetchOnMount: 'always' });
이 옵션을 사용하면 컴포넌트가 마운트될 때마다 데이터를 다시 가져옵니다.

수동으로 refetch 호출:
주문번호를 클릭할 때마다 수동으로 refetch를 호출할 수 있습니다.

javascriptCopyconst { data, refetch } = useQuery('orderKey', fetchOrderData);

const handleOrderClick = () => {
refetch();
};

queryClient.invalidateQueries 사용:
DB 업데이트 후 관련 쿼리를 무효화할 수 있습니다.

javascriptCopyconst queryClient = useQueryClient();

useEffect(() => {
// DB 업데이트 후
queryClient.invalidateQueries('orderKey');
}, [데이터변경트리거]);
이러한 방법들을 통해 데이터가 변경될 때 최신 데이터를 가져올 수 있습니다. 상황에 따라 가장 적합한 방법을 선택하시면 됩니다.
더 자세한 설명이 필요하거나 다른 질문이 있으시면 말씀해 주세요.
