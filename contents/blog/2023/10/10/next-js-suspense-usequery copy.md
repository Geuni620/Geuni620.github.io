---
date: '2023-10-10'
title: 'next.js에서 useQuery + Suspense를 사용했을 때 fallback ui가 보이지 않는다. -2'
categories: ['개발']
summary: '원인을 찾은 것 같기도...'
---

[next.js에서 useQuery + Suspense를 사용했을 때 fallback ui가 보이지 않는다. -1](https://geuni620.github.io/blog/2023/10/3/next-js-suspense-usequery/)

첫 번째 글에서 해결하지 못했던 문제가 있었다.

- 왜 useQuery + Suspense를 사용해서 새로고침을 연발하면 어느순간 cache가 되는가?

<br>

우연히 열어놓은 Next.js 공식문서에서 [Lazy loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)을 찾았다.
위 글에선 다음과 같이 작성되어있다.

```
Next.js의 지연 로딩은 경로를 렌더링하는 데 필요한 JavaScript의 양을 줄여
애플리케이션의 초기 로딩 성능을 개선하는 데 도움이 됩니다.

이를 통해 클라이언트 컴포넌트와 가져온 라이브러리의 로딩을 지연시키고 필요할 때만 클라이언트 번들에 포함할 수 있습니다.
예를 들어 사용자가 클릭하여 모달을 열 때까지 로딩을 지연시키고 싶을 수 있습니다.

(중략)

기본적으로 서버 컴포넌트는 자동으로 코드 분할되며,
스트리밍을 사용하여 서버에서 클라이언트로 UI 조각을 점진적으로 전송할 수 있습니다.

지연 로딩은 클라이언트 컴포넌트에 적용됩니다.
```

- 서버컴포넌트는 자동으로 lazy loading, 즉 Streaming 된다.
- 그리고 클라이언트에선 dynamic을 적용하면 lazy loading 되기 때문에 새로고침 할 때마다 로딩 fallback이 보였다.

```TSX
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const UsequeryComp = dynamic(() => import('./components/UsequeryComp'), {
  ssr: false,
  loading: () => <div>useQuery loading...</div>,
});

export default function Home() {
  return (
    <>
        <div className="flex items-center justify-center bg-blue-500">
          <UsequeryComp />
        </div>
    </>
  );
}
```

<br>

- 그럼 useQuery + Suspense에서 lazy loading을 적용하지 않으면(=react의 lazy 또는 next의 dynamic을 사용하지 않으면), import는 lazy loading 되지 않는다.  
  즉, 새로고침해도 그때그때 로딩해서 번들에 포함시키는 게 아닌, 이미 번들에 포함되어 있었던 건 아닐까?

<br>

- 위와 같은 생각을 하던 찰나, 아래 공식문서에 이와 같이 적혀있다.

```
SSR 건너뛰기
React.lazy() 및 Suspense를 사용할 때, 클라이언트 컴포넌트는 기본적으로 사전 렌더링(SSR)됩니다.

클라이언트 컴포넌트에 대해 사전 렌더링을 사용하지 않으려면 ssr 옵션을 false로 설정하면 됩니다:
```

- 아하...! useQuery + Suspense를 사용하면 **사전 SSR이 되는 것이다.**
- 그렇다면 서버로부터 HTML로 그려서 오는데, 데이터가 그 사이에 resolve 되면 HTML에 데이터가 포함되어 오는 것이고, 데이터가 pending이라면 loading fallback이 그려져서 오는 것이다.

<br>

### 결론

> 확실하진 않으나, 추측상으론

cache 되는 것이 아니라, 사전 SSR에 의해 서버로부터 이미 HTML에 데이터가 포함되어서 오는 것이었다.

<br>

### 참고자료

[Lazy loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
