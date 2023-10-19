---
date: '2023-10-19'
title: '서버에서부터 끌어올린 에러를 프론트로 던져주자'
categories: ['개발']
summary: 'API 서버에서 에러를 처리하고, 프론트에도 이 에러를 알려서 사용성을 높여보자'
---

> 오늘은 express로 관리하고 있던 api 서버를 수정했다.  
> 아직 블로그 에디터에 대한 구체적인 시안이 나온게 아니라서, 이 참에 관리하기 복잡했던 express.js를 좀 더 구조화할 필요성이 있다고 생각했다.  
> 그리고 사실 금방할 거라고 생각해서 시작했다... 하지만 화요일 오후부터 목요일 오후까지 2일정도 걸린 것 같다.

<br>

사내 개발세션 때 다 같이 [만들면서 배우는 클린 아키텍처](https://www.yes24.com/Product/Goods/105138479)에 대해서 스터디를 진행했었다.  
이 또한 추후에 시간을 잡아서 정리해야겠다. 책의 내용도 좋았고, 팀내 사람들과의 생각도 공유할 수 있었다.  
나의 경우엔 핵사고날 아키텍처를 현재 내가 맡고 있는 프로젝트에 적용하기엔 너무너무 오버엔지니어링이라고 생각했고, 또 완전히 이해하지 못한 아키텍처를 적용해서 유지보수 및 개발에 어려움을 겪는 것도 싫었다.  
그래서 계층형 아키텍처를 고려했고, 가장 작게 service만이라도 분리해봐야겠다는 생각을 했다.
이는 velog를 만든 벨로퍼트님의 [veltrends 레포](https://github.com/velopert/veltrends)를 참고했다.  
위 레포는 fastify로 진행되었고, fastfiy와 express가 유사하기 때문에 나의 프로젝트에도 비슷하게 적용할 부분을 찾아서 적용했다.

### 1. service 분리하기

- 가장 먼저 service부터 분리하려고 했다.
- 참고로 프로젝트에서 express.js와 함께 ORM은 prisma를 사용한다.
- 그래서 service로 분리하고자 했던 부분은 비즈니스 로직이다.

```TSX
// api/user/index.ts
user.get('/info/:userEmail', async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail) {
      res.status(400).json({ error: 'userEmail 파라미터가 필요합니다.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        giRokEName: true,
        selectedEgg: true,
        profileImage: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: '해당 유저 정보를 찾을 수 없습니다.' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: '유저 정보를 불러오는 도중 에러가 발생했어요!' });
  }
});
```

- 위 코드는 userEmail을 가지고 userInfo를 가져오는 부분이다.
- 서버를 처음 만들다보니 어떻게 코드를 작성해야할지 몰라서 chat-GPT가 짜준 코드를 그대로 복붙했던게 기억난다.
- 잘 돌아가니 일단 진행했었다.

<br>

- 여기서 service를 처음엔 다음과 같이 분리해봤다.

```TSX
// 일단 router를 추가해서 다음과 같이 폴더구조를 갖추었다.
// router/api/user/index.ts
user.get(
  '/info/:userEmail',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmail: email } = req.params;
      const user = await userService.getUserInfoByEmail(email);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
);
```

- 위와 같이 분리해주고, userService에선 다음과 같이 작성했다.

```TSX
const userService = {
  async getUserInfoByEmail(email: string) {
    if (!email) {
      throw new AppError('userEmail 파라미터가 필요합니다.', 400);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        giRokEName: true,
        selectedEgg: true,
        profileImage: true,
      },
    });

    if (!user) {
      throw new AppError('해당 유저 정보를 찾을 수 없습니다.', 404);
    }

    return user;
  },
};
```

- 이렇게 작성한 후, userService내에서 if문을 통해 error를 throw 하려고 했다.
- 그리고 이 에러들은 middleware를 통해서 한 globalErrorHandler 내에서 처리하려고 했다.

```TSX
// middleware/error.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error('Global Error Handler:', err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ error: '서버 내부 오류!' });
};
```

- console.error을 통해 log에도 에러를 남기고 싶었다.
- 그리고 클라이언트에도 에러가 발생했을 때 message를 전달해서 toast로 사용자에게 알릴 필요가 있다면 알리고 싶었다.

<br>

<br>

<br>

### 참고자료

[HTTP 상태 코드](https://ko.wikipedia.org/wiki/HTTP_%EC%83%81%ED%83%9C_%EC%BD%94%EB%93%9C)  
[Error Handling](https://expressjs.com/en/guide/error-handling.html)  
[에러 처리를 위한 익스프레스 가이드](https://jeonghwan-kim.github.io/node/2017/08/17/express-error-handling.html)  
[Node.js express와 error handling](https://teamdable.github.io/techblog/express-error-handling)
