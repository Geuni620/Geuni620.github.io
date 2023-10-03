---
date: '2023-10-03'
title: 'next.js에서 useQuery + Suspense를 사용했을 때 fallback ui가 보이지 않는다'
categories: ['개발']
summary: 'react에선 새로고침할 때마다 fallback ui를 잘 보여주는데...'
---

[suspense-fallback-ui](https://github.com/Geuni620/suspense-fallback-ui)

- test 중인 레포.

> 현재 진행 중인 프로젝트에서 Nav Bar에 user의 정보를 가져와서 보여줘야하는 게 있다.  
> 이때 Nav Bar 내에서 useQuery로 데이터를 가져오는데, 새로고침을 하면 Suspense를 적용해서 fallback ui를 보여주고자 했다.  
> 하지만 fallback ui가 보이지 않는다. 그래서 테스트해보기 시작했다.

<br>

### 구성요소

```TSX
// app/page.tsx
'use client';

import UsequeryComp from 'app/components/UsequeryComp';
import { Suspense } from 'react';

export default function Home() {
  return (
      <Suspense fallback={<div>useQuery loading...</div>}>
        <div className="flex items-center justify-center bg-blue-500">
          <UsequeryComp />
        </div>
      </Suspense>
  );
}
```

- 먼저 root page에 client-components로 변경시켜주고, UsequeryComp를 Suspense로 감싸줬다.
- 여기서 UsequeryComp는 다음과 같이 구성했다.

```TSX
// app/components/UsequeryComp.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosPostQuery } from 'app/api/route';
import React from 'react';

import { Post } from '@/type';

const UsequeryComp = () => {
  const { data: posts } = useQuery(['posts'], axiosPostQuery);

  return (
    <ul>
      {posts.map((post: Post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
};

export default UsequeryComp;
```

- 그리고 axiosPostQuery는 다음과 같이 구성했다.

```TSX
// app/api/route.ts
import axios from 'axios';

const wait = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const fetchPostEffect = async () => {
  await wait(3000);
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');

  console.log('effect 서버가 동작했다~!');
  const data = await response.json();
  return data;
};

export const fetchPostQuery = async () => {
  await wait(3000);
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    next: { revalidate: 0 },
  });

  console.log('query 서버가 동작했다~!');
  const data = await response.json();
  return data;
};

export const axiosPostQuery = async () => {
  await wait(3000);

  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/posts',
  );
  return response.data;
};
```

- axiosPostQuery를 사용한 이유는, next.js 13 version의 fetch는 Web API인 **fetch와 조금 다르기 때문이다.**
- next.js app디렉토리에 맞게 cache 등이 포함된 확장된 [fetch API](https://nextjs.org/docs/app/api-reference/functions/fetch) 이다.
- 그래서 순수하게 cache 설정을 따로 하지 않은 axios를 설치해서 사용했다.

<br>

### 원하는 동작

- 원하는 동작은 심플하다.

> 새로고침을 할 때마다 fallback ui가 보여야한다.

- 원인을 파악할 수 없어, react로 동일하게 구성했었다.
- react는 새로고침할 때마다 suspesne의 fallback ui가 띄워진다.
- 하지만 next.js를 새로고침할 때마다 suspesne fallback ui를 띄우다가 어느순간엔 **즉시 데이터를 반환해버린다.**

<br>

### 원인파악 중

- 현재 원인을 계속 파악하는 중이다.
- cache 되었는게 분명하긴 한데, 어디서 어떻게 cache 된 것인지 모르겠다.
- network tab에서 `disable cache`옵션을 체크했는데도 불구하고 새로고침을 연발하다보면, 즉시 데이터를 반환한다.
- 의하해서 Nav Bar를 만들고 페이지 라우팅을 시켜보았는데, 페이지 라우팅을 시키면 Suspense의 fallback UI가 돌기시작한다.

<br>
