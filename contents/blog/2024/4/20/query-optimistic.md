---
date: '2024-04-21'
title: 'tanstack-query v5에서 제공하는 낙관적 업데이트(optimistic updates) 2가지 방법'
categories: ['개발']
summary: ''
---

> [공식문서](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)에 적혀 있는 두 가지 예시를 모두 구현해보자.

<br/>

### 낙관적 업데이트(Optimistic updates)는 어떨 때 사용할까?

낙관적 업데이트는 한 마디로,  
데이터를 변경하려 할 때, **응답을 기다리기 전 미리 UI를 업데이트 시키는 것**이다.

<br/>

나는 다음과 같은 상황에 쓰려고 했다.

- 체크박스가 존재한다.
- 체크박스를 클릭하자마자 DB에 해당 체크박스으 변경된 정보를 저장한다.

간단히 예시를 만들어보자.

![](./detail-ui.png)

<br/>

여기서 `Mark as Complete`의 체크박스를 클릭하면, DB에 데이터가 반영되는 구조다.  
날짜 정보 역시 업데이트 시킨다.

<br/>

![No throttling](./No-throttling.gif)

테스트해보니, 생각보다.. 업데이트 반응이 느리지 않았다.  
하지만 이는 데스크탑 상황이다.  
데스크탑보다 모바일 성능은 당연히 떨어지며, 반응 역시 느려진다.  
(실제, 이미지 업로드 같은 경우는 업로드 시키고 다시 불러오는데까지 데스크탑보다 훨씬 느렸다.)

모바일 환경이라고 가정해보고 테스트를 해보면 다음과 같다.  
(네트워크탭에서 no throtting를 **Fast 3G**로 변경했다.)

![](./fast-3g.gif)  
확연히 반응속도가 느린 것을 알 수 있었다.  
그럼 이를 개선해보자.

<br/>

Tanstack-query v5 공식문서에선 두 가지 낙관적 업데이트(optimistic updates) 방법을 제시한다.

### 1. Via the UI

이 방법은 비교적 간단한 방법으로 cache의 직접적은 변경없이도 구현이 가능했다.

```TSX
// useToggleOptimistic
export const useToggleOptimistic = () => {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: changeToggle,
    onSuccess: () => {

      toast.success('성공적으로 업데이트 하였습니다!');
      /**
      return queryClient.invalidateQueries({
        queryKey: ['detail'],
      });
      */
    },
    onSettled: () => {
      // 반드시 return 시켜줘야함
      // 쿼리를 무효화할 때 프로미스를 반환해야한다.
      // 무효화가 완료되기 전까지 pening가 유지되도록 함
      return queryClient.invalidateQueries({
        queryKey: ['detail'],
      });
    },
    mutationKey: [MUTATION_KEY],
  });

  return toggleMutation;
};
```

- 보통 mutation의 onSuccess 내에서 invalidateQueies를 통해 캐시를 무효화시킨다.
- 하지만 낙관적 업데이트를 하기 위해선, onSettled에서 invalidateQueries를 작성해주었다.  
  이 둘의 차이점은,

  - `onSuccess`는 mutation이 **성공하고 결과를 전달할 때 실행**
  - `onSettled`는 mutation이 **성공하든 실패하든 모두 실행**

- 주의할 점은, onSettled에서 invalidateQueries로 캐시를 무효화할 땐, 꼭 return을 붙여줘야한다.
  - 이는 promise를 반환할 때, pending상태임을 인지하기 위해서이다.
  - 이 부분의 이유는 아래에 더 자세히 적어두었다.

<br/>
