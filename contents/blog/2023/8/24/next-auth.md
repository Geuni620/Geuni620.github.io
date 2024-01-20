---
date: '2023-08-24'
title: 'next-auth token 관리하기-2'
categories: ['개발']
summary: 'next-auth, 대체 어떻게 잘 다룰 수 있는걸까...?'
---

[next-auth token 관리하기-1](https://geuni620.github.io/blog/2023/8/18/next-auth/)

[next-auth token 관리하기-3](https://geuni620.github.io/blog/2023/8/28/next-auth/)  
[next-auth token 관리하기-4](https://geuni620.github.io/blog/2023/9/10/next-auth/)

> 일 주일 전쯤에, next-auth token 관리하기 라는 글을 썼는데, 알고보니 잘못된 코드가 많았다.

### 1. cookie에 jwt를 저장한 후, server에서 cookie로 api 인증하려고 했다면.

- 이 전글에서 다음과 같은 코드를 보여줬다.

```TSX
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

- 여기선 불필요한 부분이 존재한다.

  1. authHeader에 authorization이라는 token을 심어서 보냈다.
     이때, 이 token은 불필요하다. 왜냐하면, cookie를 통해서 jwt가 암호화된 상태로 전달되기 때문이다.
     그리고 이 jwt는 서버에서 cookie-parser를 통해서 가져온 후, secret를 통해서 복호화한다.
     즉, header의 accessToken은 불필요했다.

  2. `if (!token || token.accessToken !== accessToken)` 중 앞의 `!token`과 뒤의 `token.accessToken !== accessToken`는 각각 error 문구를 다르게 보여줘야했다.  
     예를 들면, !token은, `getToken으로 cookie를 복호화하는 도중 에러가 발생했어요.` 라고 보여줘야했을 것 같고, 뒤의 부분은 `token.accessToken과 accessToken이 같지않아요.` 라고 보여줘야했을 것 같다.

<br>

### 2. ec2 배포 이후에, 정상적으로 동작하지 않는다.

내가 원하던 방식은 다음과 같다.

1. next-auth를 통해서 google oauth로 로그인한다
2. 로그인 하고 나서 cookie에 `next-auth-session-token`이 저장된다.
3. server로 요청을 보낼 때 cookie를 심어서 보낸다.
4. server에서 middleware로 cookie를 가져오고, getToken 함수에 request와 secret key를 넣어서 cookie를 복호화한다.
5. 복호화하면 유저정보가 나오는데, 이 정보를 이용해서 db에 해당하는 유저정보는 반환한다.

<br>

위 방식은 **로컬에선** 잘 동작하는 듯 보인다. 하지만, ec2에 **다른 도메인**으로 배포한 후엔 **정상적으로 동작하지 않는다.**

문제는 cookie에서 next-auth-session-token을 서버에서 가져오려고 하면 `secure:true`되어 있어, https에서만 가져올 수 있다는 것이다.
하지만, ec2에 https로 도메인을 달아준 상태인데, 이게 왜 안되는지 모르겠다.  
여러 원인이 있겠지만, next-auth에선 [cookies option](https://next-auth.js.org/configuration/options#cookies) session을 설정해줄 수 있다.

그래서 sessionToken을 굉장히 러프하게 설정해봤다 sameSite: "none" / httpsOnly: false 등등
그래도 정상적으로 동작하지 않았다.

<br>

결국 방법을 아직 찾지 못했다. 찾게 되면 다시 글을 써야할 것 같다.
현재는 jwt token을 서버에서 자체 생성하고, 암호화한 후 복호화할 땐 client와 server에 env 파일 내 secret key를 가지고 복호화하는 방식으로 진행하고 있다.
