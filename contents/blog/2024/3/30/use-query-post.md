---
date: '2024-03-30'
title: 'useQuery는 POST Method에 사용하면 안되는걸까?'
categories: ['개발']
summary: '검색기능을 위해 POST Method를 사용했던 이유'
---

### History

보통의 검색 조회를 할 땐, API Method로 GET을 사용한다.  
하지만 이번엔 POST로 조회를 해야하는 경우가 생겼다.  
검색조건으로 보내야하는 query의 길이가 길어서, 허용되는 최대 URL 길이를 넘어갈 것으로 예상되었기 때문이다.

[참고](https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers)  
<small>위 참고링크를 확인해보면, 대체로 2000자 이내를 권장하는 듯하다.</small>

<br/>

### MutateAsync

처음 나의 생각은 다음과 같았다.

```
1. 검색조건은 state에 담아주자
2. 검색조건을 Body에 POST로 보내자
3. 반환받은 데이터를 MutateAsync로 처리하자.
```

```TSX
export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const tableList = useTableDataGetMutation();

  useEffect(() => {
    // 초기 렌더링 시, 결과물을 불러오기 위함
    tableList.mutateAsync({ searchCondition: '' });
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputRef.current) {
      tableList.mutateAsync({ searchCondition: inputRef.current.value });
    }
  };

  return (
    <div className="h-screen w-screen">
      <div className="mx-auto w-[900px] pb-20 pt-10">
        <form
          onSubmit={onSubmit}
          className="mb-2 flex items-center justify-between gap-2"
        >
          <Input
            ref={inputRef} // 1. 검색조건은 state에 담아주자
            className="w-[20%]"
            type="text"
            placeholder="Task name"
          />
        </form>
        <TableComponents data={tableList.data?.list || []} /> // 3. 반환받은 데이터를 MutateAsync로 처리하자.
      </div>
    </div>
  );
}
```

- 위와 같이 작성했을 때 검색 결과에 대한, 해당 테이블 데이터는 잘 출력된다.
- 그래서 이때까진 큰 문제되는 사항이 없다고 생각했다.

<br/>

### 구독상태가 아니다.

위 기능을 구현하고, 잘 된다고 안심하고 있었다.
하지만, 곧 문제가 발생했다.

위 mutateAsync의 가장 큰 단점은 구독상태가 아니라는 점이다.
보통 useQuery를 사용하면, mutate로 invalidate를 호출하면 자동으로 다시 fetch를 하게 된다.  
하지만 mutateAsync는 그렇지 않다.

![mutateAsync로 요청시 dev tool에 아무것도 구독되지 않는다.](./query-dev-tool.png)

<br/>

여기서 만약 이런 요구사항이 있다고 가정해보자.

> Task가 완료되면, 체크박스를 클릭하여 완료처리를 하고, 체크된 Task의 날짜가 기록되어야한다.

<br/>

### 일이 커진다.

일이 커져버렸다. JSON파일로만 fs를 이용해 파일을 읽고 구현하려고 했는데, 욕심이 커져서 데이터를 저장할 공간이 필요해졌다.
이전이라면 prisma를 이용해서 mysql이나, sqllite를 사용하려고 했을 것 같다.

하지만, 최근에 supabase를 알고 난 뒤부턴 DB나, 저장할 공간의 필요성이 느껴지면 supabase부터 뒤적거리곤 한다.

<br/>

### 참고자료

[What is the maximum length of a URL in different browsers?](https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers)