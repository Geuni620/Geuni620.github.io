---
date: '2023-09-10'
title: 'next-auth token 관리하기-4'
categories: ['next-auth']
summary: '사용자에게 log-out 하게 만드는 상황을 만들지 말아보자!'
---

> 여기선 accessToken, refreshToken, sessionToken에 대해서 다룬다.
> 근데, 토큰이 너무 많다...
> 각각의 토큰 역할부터 먼저 알아보자

### Token

[difference between session token and access token? #693](https://github.com/nextauthjs/next-auth/issues/693)

내가 했던 고민을 그대로 했던 누군가가 next-auth github issue에 작성해놓은 질문이 있었다.
이 질문에 대한 대답도 작성되어 있었는데, 궁금증을 완벽히 해결해주었다.

<br>

나의 경우엔 next-auth를 사용해서 google oauth로 로그인을 구현했다.
그래서 토큰을 크게 3개정도 가지게 되는데 다음과 같다.

- session Token
- access Token
- refresh Token

<br>

조금 명확히 나눠보자면

- session Token
- access Token / refresh Token

이렇게 나눌 수 있다.

- 세션 토큰 같은 경우는, '사용자가 로그아웃하지 않는 한, 변경되지 않지만 일부 애플리케이션 같은 경우엔 rotate 될 수 있다.
- 그리고 js를 통해 session token에 접근할 수 없어야한다. 즉, js로 읽을 수 없어야한다.

- 반면, accessToken 같은 경우는 한 마디로 'session Token보단 덜 중요한 Token이다.'
- 그래서 나의 경우엔 api를 쏠 때 header에 access Token을 담아서 보낸다. 그리고 서버에서 이 사용자가 유효한 사용자인지 확인하고, 유효하다면 api를 실행한다.
- 그리고 access Token은 session Token과 달리 js로 읽을 수 있다. 그래서 Token이 노출 되었을 경우 refresh Token을 이용해 access Token을 재발급 받고, 탈취당한 access Token은 만료시켜버린다.
- google oauth 같은 경우는 access Token의 유효한 시간은 1시간이다. 1시간 이후엔 refresh Token을 이용해 재 발급 받아야한다.

- 사실 access Token은 사용하지 않아도, 즉 관리하지 않아도 된다. session Token만 사용해도 무방한 듯 하다.
- 하지만 위에서 언급했듯, 나의 경우엔 accessToken으로 api를 인가하고, 1시간 뒤에 refresh Token으로 access Token을 재발급하려고 한다.

<br>

생각한대로 구현하기 위해선, refresh Token과 session Token의 시간을 정해서 이 시간 내에 재발급 할 수 있도록 구현해야한다.
어떻게 구현했는지 살펴보자.

<br>

### refresh token

일단, refresh Token은 단위를 ms 기준으로 잡았다.
왜냐하면, 단위가 여러 개 일수록 헷갈리기 때문이다. 즉, 단순화시키기 위해 단위를 ms로 통일했다.

```TS
// auth.ts

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// TODO: type error, any type 제거
const GOOGLE_AUTHORIZATION_URL =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    prompt: 'consent',
    access_type: 'offline',
    response_type: 'code',
  });

async function refreshAccessToken(token: any) {
  try {
    const url =
      'https://oauth2.googleapis.com/token?' +
      new URLSearchParams({
        client_id: process.env.GOOGLE_ID ?? '',
        client_secret: process.env.GOOGLE_SECRET ?? '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // 1hour
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('refreshAccessToken-error', error);
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
      authorization: GOOGLE_AUTHORIZATION_URL,

      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    // Seconds - How long until an idle ses
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    // email, credentials 은 undefined되어있음, account는 token에 필요한 정보!
    async signIn({ user }) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        },
      );

      if (!res.ok) {
        console.error('구글 로그인 도중 에러가 발생했어요!!!');
        return false;
      }

      return true;
    },

    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at * 1000;
        token.refreshToken = account.refresh_token;

        return token;
      }

      const nowTime = Date.now();
      const accessTokenExpires = token.accessTokenExpires as number;
      const TEN_MINUTES_AGO_IN_MS = 60 * 10 * 1000; // 10분 전

      // 10분전에 토큰을 갱신해준다.
      const shouldRefreshTime =
        accessTokenExpires - nowTime - TEN_MINUTES_AGO_IN_MS;

      if (shouldRefreshTime > 0) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      const sessionUser = {
        ...token,
      };
      delete sessionUser.refreshToken;
      session.user = sessionUser as any;

      return session;
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
```

사실 해당 코드는 [next-auth에서 예시로 제공하는 코드](https://authjs.dev/guides/basics/refresh-token-rotation)를 많이 참고했다.
하지만 [이 블로그](https://jeongyunlog.netlify.app/develop/nextjs/next-auth/)에서 `shouldRefreshTime`를 정해놓고, refresh 시키는 코드를 봤다.
그리고 이를 적용시켜주었다.
코드를 조금 더 자세히 살펴보자.

<br>

### 참고자료
