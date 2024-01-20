---
date: '2024-01-17'
title: 'next-auth의 인증/인가 동작방식 이해하기'
categories: ['개발']
summary: '-'
---

- 작성했던 관련 글  
  [next-auth token 관리하기-1](https://geuni620.github.io/blog/2023/8/18/next-auth/)  
  [next-auth token 관리하기-2](https://geuni620.github.io/blog/2023/8/24/next-auth/)  
  [next-auth token 관리하기-3](https://geuni620.github.io/blog/2023/8/28/next-auth/)  
  [next-auth token 관리하기-4](https://geuni620.github.io/blog/2023/9/10/next-auth/)

<br/>

# 1. Token의 필요성

현재 사이드프로젝트를 진행하고 있다.  
여기서 조금 의아한게 있는데, next-auth를 통해 로그인을 했는데(=인증했는데), **API요청시 Token을 header에 포함시켜서 요청을 보내지 않는다.**(=인가)

조금 더 풀어서 설명해보면, 요청을 보낼 때 유저를 구분하는 기준이 `userId`이다.  
즉, Token을 전혀 사용하고 있지 않다.

<br/>

머릿속에 의문점이 떠올랐다.  
💬 `userId를 다른 사용자가 알고 있다면, postman이나, thunder-client로 DB 데이터를 꺼내오거나, 수정할 수 있는 거 아닌가? 심지어 삭제까지.`  
그래서 확인해보고 싶어졌다. 과연, userId를 알고 있다면 DB에 데이터를 보낼 수 있을까?

![큰일이다;](./thuner-client.png)

위 이미지처럼 vercel로 임시 배포한 상태로 thunder-client에 데이터를 요청해봤다.  
여기서 userId와 recipientId는 사용자가 다른사람에게 공유하기 위해선 노출되는 부분이기 때문에 누구나 쉽게 확인할 수 있다.

즉, userId나, recipientId만 알고 있다면 누구나 DB에 데이터를 요청할 수 있고, 삭제도 가능하다는 것이다.
만약 DB의 데이터를 보호해야한다면, userId만으로 서버 데이터를 반환하기엔 무리가 있다고 생각되었다.  
이때 Token이 필요하다.

> 참고로 기획 특성상, 사이드프로젝트에선 Token이 필요하지 않다. 익명으로 누구나 글을 쓸 수 있도록 했고, Delete API는 존재하지 않기 때문이다.

<br/>

# 2. next-auth Token 관리 방법

next-auth의 token을 관리하는 방법에 대해서 알아보자.  
next-auth에선 크게 Token을 관리하는 방법을 [2가지](https://next-auth.js.org/getting-started/upgrade-v4#session-strategy) 소개한다.  
첫번째는, **jwt로 관리하는 방법**이고, 두 번째는 **DB에서 관리하는 방법**이다.

이전 글을 쓸 당시엔, **DB에 token 정보를 담고 싶지 않았다.** 그래서 jwt를 사용했다.
jwt가 아닌, DB에서 Token을 관리하려면 next-auth에선 편하게 [adapter](https://next-auth.js.org/adapters)를 제공해준다.

jwt로 Token을 관리할 때 크게 session, access, refresh token을 사용했다.
여기서 session은 인증을, access와 refresh는 인가에 사용했다.

<br/>

# 3. 인증과 인가가 뭘까?

초반엔 둘의 개념이 너무 헷갈렸다.
이를 가장 잘 설명해준 [영상](https://youtu.be/y0xMXlOAfss?si=6oSS8O34KMrJhaS3&t=62)을 찾았다.

해당 영상의 설명을 조금 빌려서 이야기해보자면,  
(나는... 이상하게 군대밖에 생각나지 않는다.)

휴가를 다녀온 21살의 나, 첫 휴가 복귀할 때 위병소에서 휴가증을 보여주며 복귀를 알린다.
이때 나의 신원을 조회하는 헌병들, 휴가복귀자임을 확인한 후 위병소를 통과시켜준다.
이게 인증이라고 이해했다.

<br/>

복귀하고 일 주일 후, 훈련에 참여하게 된 나, 내일 있을 사격훈련을 위해 미리 연습한다는 선임;
나에게 총기를 가져오라고 시킨다. 나는, 총기소지함에 뚜벅뚜벅 걸어가지만, 그 앞에 서있는 경계병들.
그 들은 나에게 신원을 확인하지만, 총기소지함에 들어갈 권한이 없는 나는 그대로 돌아오게 된다.
이게 인가라고 이해했다.

<br/>

즉 다시 정리해보면  
`인증: 서비스에 등록된 유저의 신원을 입증하는 과정(=로그인)`
`인가: 인증된 사용자에 대한 자원 접근 권한 확인(=API 요청에 따른 해당 유저의 데이터 반환)` 이다.

그래서 나는 session Token은 로그인 / access, refresh Token은 API 요청에 따른 데이터 반환에 사용했다.

<br/>

# 4. next-auth는 인증을 어떻게 유지할까?

next-auth로 간단히 login을 구현해보자
(이번에도) DB에 token을 저장하지 않고, jwt를 사용했다.
그리고 이를 위해, google oauth를 사용했다.

```TSX
// app/api/auth/[...nextauth].ts
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
    // Seconds - How long until an idle ses
    maxAge: 30, // 30 days
  },
});

export { handler as GET, handler as POST };
```

인증과정을 거쳐서 로그인이 됐다!

![로그인이 됐다!](./success-login.png)

하지만 next-auth는 이 로그인을 어떻게 유지하는걸까?  
페이지를 닫았다가, 열어도 로그인이 유지된다.

단, 다른 브라우저로 열거나 크롬의 시크릿모드로 열었을 땐, 로그인이 유지되지 않는다.  
즉, 브라우저 어딘가에서 유저 정보를 저장하고 있을 것 이다.

<br/>

## 4-1. 로그인 했을 때 브라우저에 저장되는 정보

크게 로그인 정보는 `localStorage`나 `SessionStorage`, 또는 `cookie`에 저장할 수 있다.  
구글 시크릿모드로 열어서, 로그인 하기전에 localStorage와 SessionStorage, cookie를 확인해보자.

![Local Storage](./local-storage.png)  
![Session Storage](./session-storage.png)  
![Cookie](./cookie.png)

Session Storage에는 아무것도 존재하지 않는다. 하지만 Local Storage와 Cookie에는 next-auth의 정보가 저장된다.

먼저, LocalStorage에는 정보가 저장될거라 예상못했는데, 확인해보자  
자세히 보니, getSession이라는 단어가 가장 먼저 눈에 띄었다.  
next-auth에서 [getSession](https://next-auth.js.org/getting-started/client#getsession)이라는 API를 제공하는데 그 역할이 무엇인지 확인해봤다.

```
When called, getSession() will send a request to /api/auth/session
and returns a promise with a session object, or null if no session exists.

호출되면 getSession()은 /api/auth/session으로 요청을 보내고
세션 객체가 있는 프로미스를 반환하거나 세션이 존재하지 않는 경우 null을 반환합니다.
```

session 정보를 요청하고, 세션객체가 있다면 세션에 담긴 정보를, 세션이 없다면 null을 반환하는 걸로 보인다.

<br/>

그 다음엔 어떻게 했을 때, localStorage에 이 정보가 저장되는지 확인해봤다.  
next-auth를 사용하기 위해선, 다음과 같이 SessionProvider를 감싸줘야한다.

```TSX
'use client';

import { SessionProvider } from 'next-auth/react';

type Props = {
  children: React.ReactNode;
};

export const AuthContext: React.FC<Props> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
```

그래야 useSession hook을 클라이언트 환경에서 사용할 수 있기 때문이다.  
(참고로, 서버에서 사용하려면, [getServerSession](https://next-auth.js.org/configuration/nextjs#getserversession)을 사용한다.)

<br/>

근데 이 provider를 감싸지 않으니, localStorage에 더 이상 정보가 저장되지 않았다.  
그래서 [SessionProvider 내부](https://github.com/nextauthjs/next-auth/blob/a595ca72595b2bd350b23068f9e437726cef9a9d/packages/next-auth/src/react.tsx#L337)를 한 번 확인해봤다.

```TSX
export async function getSession(params?: GetSessionParams) {
  const session = await fetchData<Session>(
    "session",
    __NEXTAUTH,
    logger,
    params
  )
  if (params?.broadcast ?? true) {
    broadcast().postMessage({ // broadcast???
      event: "session",
      data: { trigger: "getSession" },
    })
  }
  return session
}
```

SessionProvider 내부에 getSession이 존재하고, getSession에서 broadcast가 존재한다.
이 broadcast를 찾아보니, localStorage에 저장하는 로직을 발견했다.

```TSX
export function BroadcastChannel(name = "nextauth.message") {
  return {
    /** Get notified by other tabs/windows. */
    receive(onReceive: (message: BroadcastMessage) => void) {
      const handler = (event: StorageEvent) => {
        if (event.key !== name) return
        const message: BroadcastMessage = JSON.parse(event.newValue ?? "{}")
        if (message?.event !== "session" || !message?.data) return

        onReceive(message)
      }
      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    },
    /** Notify other tabs/windows. */
    post(message: Record<string, unknown>) {
      if (typeof window === "undefined") return
      try {
        localStorage.setItem( // 이 부분
          name,
          JSON.stringify({ ...message, timestamp: now() })
        )
      } catch {
        /**
         * The localStorage API isn't always available.
         * It won't work in private mode prior to Safari 11 for example.
         * Notifications are simply dropped if an error is encountered.
         */
      }
    },
  }
}
```

즉, 정리해보면 localStorage에 저장되는 정보는, session의 상태가 변경될 때마다, broadcast를 통해 localStorage에 저장되는 것 같다.
그리고 다른 탭이나, 윈도우에서도 localStorage에 저장된 정보를 받아서, 세션 정보를 업데이트하는 것 같다.

<br/>

그럼 이제 cookie를 살펴보자.

# 4. next-auth의 인가는 어떻게 이루어질까?
