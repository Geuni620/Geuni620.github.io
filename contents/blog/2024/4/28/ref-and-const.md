---
date: '2024-05-05'
title: 'React, 변수와 Ref'
categories: ['개발']
summary: ''
---

### 문제의 상황

테이블 내, 체크박스가 존재한다.  
체크박스에 체크를 한 뒤, Done 버튼을 클릭하면, DB에 해당 체크박스 데이터가 저장된다.  
단, 체크박스 중 **상태가 변경된 체크박스만** 서버로 전달해야한다.

예를 들어, 다음과 같은 Log가 있다.

```JSON
// 초기 initial
{
  "0": true,
  "1": true,
  "2": true
}

// rowSelection state
{
  "0": true,
  "2": true,
  "3": true
}
```

이 경우엔, row.id 중 1번, 3번을 서버로 전달해야한다.  
1번은 체크가 해지되었고, 3번은 체크가 추가되었기 때문이다.

<br/>

여기서 문제는, '초기 initial 상태를 어디에 저장할 것인가?'이다.  
나는 초기값이 변경되면 안된다고 생각해서, useRef를 사용하려고 했다.  
그래서 다음과 같이 코드를 생각했다.

```TSX
// app/page.tsx
export default function Home() {
  const tableList = useTableDataGetQuery({
    searchCondition,
  });

if (tableList.data)
  return (
    <div className="h-screen w-screen">
      <div className="mx-auto w-[900px] pb-20 pt-10">
        <TableComponents data={tableList.data.list} />
      </div>
    </div>
  );
}
```

그리고, `TableComponents`에서 다음과 같이 작성해주었다.

```TSX
// app/components/TableComponents.tsx
export const TableComponents: React.FC<TableComponentsProps> = ({ data }) => {
  const initialRowSelectionRef = useRef<null | RowSelectionState>(
    createRowSelection(data),
  );
  const [rowSelection, setRowSelection] = useState({});
  const toggleMutation = useToggleMutation();

  useEffect(() => {
    // useEffect를 통해, tanstack-query로 받아온 서버상태와 TableComponents 상태를 동기화한다.
    const newRowSelection = createRowSelection(data);
    setRowSelection(newRowSelection);
  }, [data]);


  console.log(
    'ref',
    initialRowSelectionRef.current,
    'rowSelection',
    rowSelection,
  );

  return (
    //...
  );
};
```

Tanstack-table에서 체크박스에 대한 설명은 [다른 글](https://geuni620.github.io/blog/2023/12/2/tanstack-table/#2-%EC%A0%84%EC%B2%B4-%ED%85%8C%EC%9D%B4%EB%B8%94-row-%EB%8B%A8%EC%9C%84-%EC%B2%B4%ED%81%AC%EB%B0%95%EC%8A%A4)에서 다루었다. 🍀

<br/>

다음과 같은 동작을 예상했다.

1. 서버로부터 data를 받아온다.
2. `initialRowSelectionRef`에 `createRowSelection(data)`를 저장한다.
3. `rowSelection`에 `createRowSelection(data)`를 저장한다.  
   (이 때, `rowSelection`은 `initialRowSelectionRef`와 동일한 값을 가진다.)
4. 체크박스를 클릭하면, `rowSelection`이 변경된다.
5. Done 버튼을 클릭하면, `rowSelection`과 `initialRowSelectionRef`를 비교하고, 변경된 `row.id`를 서버로 전달한다.

그리고, invalidateQueries가 동작한 뒤, refresh된 데이터를 받아온다. 이후엔 1번부터 다시 반복된다.  
하지만, 원하는대로 동작하지 않았다.  
문제는, `initialRowSelectionRef`가 업데이트 되지 않는다는 점이다.

<br/>

해결방법은 간단하다. initialRowSelectionRef를 initialRowSelection 변수로 변경하는 것이다.

```TSX
export const TableComponents: React.FC<TableComponentsProps> = ({ data }) => {
  const initialRowSelection = createRowSelection(data);
  // const initialRowSelectionRef = useRef<null | RowSelectionState>(
  //   createRowSelection(data),
  // );
}
```

이렇게 하면, data가 업데이트 될 때마다, 컴포넌트가 리렌더링 되고, initialRowSelection도 업데이트 된다.  
즉, 데이터를 불러와서 ~ 사용자가 `Done`을 누를 때까지 초기값을 저장해놓을 수 있다.

<br/>

### useRef는 왜 업데이트 되지 않은 것일까?

내가 react를 사용하면서 ref를 사용한 사례는 크게 두 가지가 있다.

1. React가 관리하는 DOM을 직접조작할 때.
2. 컴포넌트가 일부 값을 저장해야 하지만 렌더링 로직에 영향을 미치지 않는 경우

<br/>

대체로 1번의 사례만 사용해서, 잊고 있었다..  
ref는 컴포넌트 내부에서 일부 값을 저장해놓았을 떄,
리렌더링을 유발하지도 않고, 리렌더링 되어도 값이 변경되지도 않는다.  
즉, 렌더링 로직에 영향을 받지 않는다.

그래서 업데이트하기 위해선,

<br/>

### 그럼, useRef와 변수의 차이는 무엇일까?

차이를 먼저 살펴보기 전에, useRef는 왜 업데이트 되지 않는 것일까?  
일단, useRef를 어떻게 하면 업데이트 시킬 수 있을까?  
두 가지 방법이 존재한다.

첫 번째는, `useEffect`를 사용하는 것이다.

```TSX
useEffect(() => {
  initialRowSelectionRef.current = createRowSelection(data);
}, [data]);
```

data가 업데이트 될 때마다, initialRowSelectionRef.current를 업데이트 시켜주면 된다.

<br/>

두 번째는, 새로고침을 하는 것이다.

```
command + R
```

이제 다시 본론으로 돌아와서, useRef와 변수의 차이는 무엇일까?  
핵심은 리렌더링이다.

만약, 이런 경우를 생각해보자.  
리렌더링 되어도 초기화되면 안되는 값이 있다.

<br/>

예를 들어 이런 경우를 생각해보자.

```TSX
const components = () => {
  const styles = {
    width: '100px',
    height: '100px',
    backgroundColor: 'red',
  }

  return (
    <div style={styles}>
      //...
    </div>
  )
}
```

여기서 styles는 components가 리렌더링 될 때마다 항상 새롭게 생성된다.  
이런 경우는 한 번만 초기화하고, components가 리렌더링 될 때마다, 새로 생성되지 않길 원한다.  
다음과 같이 수정할 수 있을 것이다.

```TSX
const styles = {
    width: '100px',
    height: '100px',
    backgroundColor: 'red',
  }

const components = () => {
  return (
    <div style={styles}>
      //...
    </div>
  )
}
```

이렇게 하면, styles는 한 번만 초기화되고, 리렌더링 될 때마다 새로 생성되지 않는다.  
또는, useRef를 사용할 수 있다.

```TSX
const Component = () => {
  const styles = React.useRef({
    width: '100px',
    height: '100px',
    backgroundColor: 'red',
  })

  return (
    <div style={styles.current}>
      //...
    </div>
  )
}
```

ref를 사용하면, 리렌더링 될 때마다, 초기화되지 않는다.

<br/>

결론은, useRef는 컴포넌트가 리렌더링 될 때마다, 초기화되지 않는다는 점이다.
하지만 변수는 컴포넌트가 리렌더링 될 때마다, 초기화된다.

그래서 나의 경우엔, data가 업데이트 될 때마다, initialRowSelection도 업데이트 되어야 했기 때문에, 변수를 사용하는 것이 맞았다.

- 컴포넌트가 마운트 됐을 때, 초기화되어야 하는 값이 있다면, useRef를 사용하자.
- 컴포넌트가 리렌더링 됐을 때, 초기화되어야 하는 값이 있다면, 변수를 사용하자.

<br/>

### 참고자료

[useState for one-time initializations](https://tkdodo.eu/blog/use-state-for-one-time-initializations)
