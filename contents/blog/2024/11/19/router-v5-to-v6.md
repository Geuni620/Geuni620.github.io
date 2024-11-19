---
date: '2024-11-19'
title: 'react-router v5 → v6로 업그레이드 하기'
categories: ['개발']
summary: 'react-router v5 → v6로 업그레이드 하기'
---

> 8월쯔음, react-router-dom v5에서 v5-compat 버전으로 업데이트를 했고,  
> 최근 노드버전을 올리면서, 드디어 v6까지 업데이트 했다.

<br/>

### 예시를 만들어보며.

예시를 만들어보다가 routing을 적용했는데 url만 바뀌고 페이지 이동이 이루어지지 않는 현상이 발생했다.  
무엇이 문제일까 고민하던 찰나, main.tsx에서 React.StrictMode가 BrowserRouter보다 상위에 존재하면, 페이지 이동이 이루어지지 않는 것이다.

[react-router #7870](https://github.com/remix-run/react-router/issues/7870#issuecomment-1099884642)

위 이슈를 확인해보면, 관련된 답변이 적혀있다.  
결국 해답은 BrowserRouter를 React.strictMode 바깥에서 감싸주는 것이다.

```TSX
// main.tsx
async function enableMocking() {
  //...
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    // BrowserRouter가 React.StrictMode의 내부에 래핑되어있을 경우 url만 변경되고 페이지 이동이 이뤄지지 않는다.
    <BrowserRouter>
      <React.StrictMode>
        // ...
      </React.StrictMode>
    </BrowserRouter>,
  );
});

```

<br/>

### 왜 올려야했을까?

> 굳이 올릴 필요 있었을까?

다시 본론으로 돌아가서 왜 옮겨야했을까?

<br/>
