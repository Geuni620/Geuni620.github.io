---
date: '2023-08-19'
title: 'next-auth token 관리하기-1'
categories: ['개발']
summary: 'http 통신할 때, accessToken을 서버에선 어떻게 가지고 있을 수 있을까?'
---

아래에 내용은 잘못된 부분이 존재합니다. 당시엔 저렇게 생각했지만 현재는 다음과 같은 글을 다시 썼습니다.
읽어보시기 전에 이 글을 보셔도 좋고, 읽고 나서 이 글을 보셔도 좋습니다.
이 글은 꼭 읽어주셨으면 합니다. **아래는 잘못된 내용이 포함**되어 있으니까요.

[next-auth token 관리하기-2](https://geuni620.github.io/blog/2023/8/24/next-auth/)  
[next-auth token 관리하기-3](https://geuni620.github.io/blog/2023/8/28/next-auth/)  
[next-auth token 관리하기-4](https://geuni620.github.io/blog/2023/9/10/next-auth/)

---

> next-auth로 어떻게 token을 관리하는걸까?  
> 현재 프론트는 next.js / backend는 express로 구성되어있다.  
> db는 mysql, orm은 prisma를 사용했다.  
> 구글 oauth를 통해 로그인을 하고, 유저의 정보를 DB에 저장하긴 하는데,,, 유저가 만약 geuni620이라면, geuni620에 해당하는 데이터를 줘야할 텐데, authorization을 어떻게 할 수 있지???

<br>

### next-auth로 token 관리하기

맨 처음엔, `userEmail`을 가지고 DB에서 해당 데이터를 return해주었다.  
아무것도 모르다보니, 그리고 기능구현에 급급하다보니, 혼자하다보니, 이렇게 만들었는데 문득 이런 생각이 들었다.

`api 서버도 배포를 했는데, url로 예를들어 deep.jejodo.life/geuni620을 치면, geuni620에 해당하는 데이터를 반환하면 안되지않나?`

<br>

그래서 next-auth 공식문서를 찾아봤고, 결국 두 가지로 관리할 수 있다는 걸 알게됐다.

1. next-auth의 session
2. db

<br>

db를 사용하려면 [adapter](https://authjs.dev/reference/adapters)를 쓰는 것 같은데, 나는 DB로 token을 관리하고 싶지 않았다.
cookie와 session으로 관리하고 싶었고, db에 token을 저장하고 싶지도 않았다.

<br>

accessToken은 아래 코드를 통해 session에 추가해주면 반환받을 수 있다.
만약 추가해주지 않는다면, useSession hooks을 통해 accessToken을 가져올 수 없다.

```TSX
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }) {
      const dataToSend = {
        user: {
          ...user,
          accessToken: account?.access_token,
          expires: account?.expires_at,
        },
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user`,
        {
          method: 'POST',
          body: JSON.stringify(dataToSend),
        },
      );

      if (!res.ok) {
        console.error('error!');
        return false;
      }

      return true;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token; // accessToken을 token에 넣어준다.
      }

      return token;
    },

    async session({ session, token }) {
      session.user = token as any; // sesstion에 token을 넣어준다, 그리고 useSesstion hooks을 통해 accessToken을 받아올 수 있다.

      return session;
    },
  },
};
```

자 그럼 accessToken은 useSession hooks을 통해 받아올 수 있게 됐다.
그럼 이걸 fetch의 header에 넣어서 보내주면 되겠지?
그럼 express 서버에서는 이 accessToken을 어떻게 authorization할까???

<br>

### express에서 token 관리하기

```TS
// middleware.ts
import { Request, Response, NextFunction } from 'express';
import { getToken } from 'next-auth/jwt';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '토큰이 없어요!!!' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.accessToken !== accessToken) {
      return res
        .status(401)
        .json({ error: 'client와 server의 토큰이 같지 않아요!!!' });
    }

    (req as any).accessToken = accessToken;

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(401).json({
        error: '토큰 검증 중 에러가 발생했어요!!!',
        details: error.message,
      });
    } else {
      return res
        .status(401)
        .json({ error: '토큰 검증 중 알 수 없는 에러가 발생했어요!!!' });
    }
  }
};
```

**결국 backend에서도 next-auth package를 설치한다.** 그리고 import로 getToken 함수를 가져온다.
secret key는 `.env` 환경변수로 관리해주고, 클라이언트에서 header에 심어서 오는 accessToken과 cookie에 심어져 오는 accessToken을 비교해준다.
비교한 결과가 true로 일치할 경우 해당 user에 대한 정보를 반환한다.

express에서 위 검증과정을 위해 middleware를 사용했다.

next-auth는 풀스택을 위한 라이브러리이다. next.js를 이용해서 로그인 로직을 구현할 때 api폴더를 사용해서 서버 api를 구현할 수 있다.
즉, next.js내에서만 next-auth를 사용하면 되는 것이다. 하지만 나의 경우엔, express server를 따로 두고 있다.

cookie의 token은 암호화된 상태로 오게되는데, jwt이다. 이걸 복호화하기 위해 복호화 라이브러리도 설치해서 적용해봤는데, 결국 다 에러가 난다.
즉, `getToken`을 통해 간단히 cookie에 심어져오는 token을 복호화 할 수 있다.
