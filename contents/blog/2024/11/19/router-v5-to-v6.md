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

**먼저 기존 소스코드는 일관된 포맷을 제공하고 있지 않았다.**  
즉, 어떤 페이지는 hooks을 통해 useHistory나 useLocation으로 반영되어있고,  
다른 일부 페이지는 withRouter를 감싸서 props를 통해 받는 형태로 routing을 사용하고 있었다.

<br/>

나는 routing이 일관된 포맷으로 반영되길 원했다.  
현 프로덕트는 리액트 `v16`을 사용하고 있기에 hooks 패턴으로 변경을 시도했다.

검색을 통해 변경사항을 대략 파악하던 중, 생각보다 많은 부분을 변경해야함을 알았다.  
대체로 withRouter 형태라서, useHistory와 같은 hooks 패턴으로 변경하는 것과 useNavigate로 변경하는 것의 큰 공수 차이가 없어보였다.  
그래서 v6를 고려하게 됐다.

<br/>

**현재 검색을 할 땐, URL의 사용없이 모두 state로 관리한다.**  
즉, 뒤로가기나 새로고침을 통해 state를 리프레시 시키면, 이전 검색기록은 모두 날아가버린다.  
내가 입사하기 전부터 오랫동안 사용자의 개선요청이 있었다고 들었다.

여러가지 방법이 있겠지만, 나는 v6의 useSearchParams를 적극 사용해봐야겠다고 생각했다.  
참고로 이는 고민하던 찰나, 우연히 발견한 [Matt Pocock의 트윗을 확인하고 든 생각이다.](https://x.com/mattpocockuk/status/1819026288071352666)

<br/>

갑작스러운 변화의 적용으로 모든 서비스의 안정성이 무너질수도 있다.  
일일이 모두 테스트하기엔, 스쿼드 내 프론트는 나 혼자선 무리였다.  
하지만, react-router팀은 [잘 작성된 문서와 함께](https://github.com/remix-run/react-router/discussions/8753), 안정적으로 프로덕트의 마이그레이션을 돕는 react-router-dom-v5-compat을 제공해주었다.

이를 통해 **안정적인 마이그레이션이 가능하다고 판단했다.**  
참고로 react-router-dom-v5-compat은 v5와 v6를 모두 제공한다.

<br/>

이외에도, 현재 PAGES라고 작성된 **변수파일에는 router에 관련된 정보가 뭉쳐져 있는데, [createBrowserRouter](https://reactrouter.com/6.28.0/routers/create-browser-router#createbrowserrouter)함수와 유사하게 구성되어있어서,** 그대로 반영해도 좋겠다는 생각이 들었다.  
물론 createBrowserRouter함수를 씀으로서, loader와 같은 기능을 제공해주는 것도 매력적으로 느껴졌다.

---

### compat v5 → v6
