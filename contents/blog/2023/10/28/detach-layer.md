---
date: '2023-10-28'
title: 'Express 레이어 분리하기'
categories: ['개발']
summary: 'API 서버에서 에러를 처리하고, 프론트에도 이 에러를 알려서 사용성을 높여보자'
---

> 오늘은 express로 관리하고 있던 api 서버를 수정했다.  
> 아직 블로그 에디터에 대한 구체적인 시안이 나온게 아니라서, 이 참에 관리하기 복잡했던 express.js를 좀 더 구조화할 필요성이 있다고 생각했다.  
> 그리고 사실 금방할 거라고 생각해서 시작했다..  
> 하지만 화요일 오후부터 목요일 오후까지 2일정도 걸린 것 같다.

<br>

사내 개발세션 때 다 같이 [만들면서 배우는 클린 아키텍처](https://www.yes24.com/Product/Goods/105138479)에 대해서 스터디를 진행했었다.  
이 또한 추후에 시간을 잡아서 정리해야겠다. 책의 내용도 좋았고, 팀내 사람들과의 생각도 공유할 수 있었다.  
나의 경우엔 핵사고날 아키텍처를 현재 내가 맡고 있는 프로젝트에 적용하기엔 너무너무 오버엔지니어링이라고 생각했고, 또 완전히 이해하지 못한 아키텍처를 적용해서 유지보수 및 개발에 어려움을 겪는 것도 싫었다.  
그래서 계층형 아키텍처를 고려했고, 가장 작게 service만이라도 분리해봐야겠다는 생각을 했다.
이는 velog를 만든 벨로퍼트님의 [veltrends 레포](https://github.com/velopert/veltrends)를 참고했다.  
위 레포는 fastify로 진행되었고, fastfiy와 express가 유사하기 때문에 나의 프로젝트에도 비슷하게 적용할 부분을 찾아서 적용했다.

<br>

큰 틀에선 다음과 같은 생각의 흐름을 거쳤다.

> 1. service 분리하기
> 2. controller(router)를 service 분리한 것을 토대로 작성
> 3. error 분기처리가 똑바로 되고 있나?  
>    → 원했던 방향은 서버에서 에러를 클라이언트로 전달하고, 클라이언트에선 400번대에러는 toast로 띄워주려고 했음  
>    → 확인결과 toast는 뜨는데 메시지가 전달되지 않았음(toast만 뜨고 있었음)  
>    → toast 뜨도록 분기시켜주기 위해 server에 globalHandler 추가  
>    → 서버에 로그를 남기고, 클라이언트에서도 에러를 사용자에게 보여주도록 변경
> 4. error 분기처리를 하다보니 httpStatusMessage가 통일성 있게 관리되었으면 했음  
>    → constants로 생성, [velog v3](https://github.com/velog-io/velog/blob/main/packages/velog-server/src/common/constants/HttpStatusConstants.ts)코드를 참고했다.
> 5. if문을 controller에서 제거하고 싶었는데, validation을 함수로 만들어서 추가할까 고민했었다.(왜냐하면 검증하는게 대부분 비슷했기 때문에, userEmail 등등)  
>    → 이 if문은 service로 이관하고, service에서 관리하는게 더 깔금할 것 같다고 생각했다.  
>    → 그래서 controller는 코드 가독성을 높이고, service에 if에러 문구를 모두 넣어줬다.

<br>

### 분리 전

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
- 서버를 처음 만들다보니, 어떻게 코드를 작성해야할지 몰라서 chatGPT가 짜준 코드를 그대로 복붙했던게 기억난다.
- 잘 돌아가니 일단 진행했었다.
- 참고로 프로젝트에서 express.js와 함께 ORM은 prisma를 사용한다.

<br>

### 분리 후

```TSX
// api/router/user/index.ts
user.get(
  '/info/:userEmail',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmail: email } = req.params;
      const user = await userService.getUserInfoByEmail(email);

      res.status(HttpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  },
);

export default user;
```

- userService를 만들고 비즈니스로직은 모두 service로 이관했다.
- 그리고 Error를 global하게 관리하고 싶었다.
- ErrorBoundary처럼 global한 에러 핸들러를 추가해서 에러를 던져주고자 했다.

<br>

### globalErrorHandler

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

- globalErrorHandler를 추가해줬다. 이는 express의 미들웨어이다. catch로 에러를 잡아서 throw를 던져주면, 이 미들웨어에서 에러를 처리해준다.
- 이를 위해선 api 코드의 3번째 매개변수로 next함수를 추가했고, 이는 catch문내에서 next(error)를 통해 미들웨어로 에러를 던져준다.
- 서버에서 log를 남겨놓은 뒤, 클라이언트에 에러를 전달해준다. 클라이언트 에러처리는 [프론트 에러 핸들링하기](https://geuni620.github.io/blog/2023/9/7/%ED%94%84%EB%A1%A0%ED%8A%B8%20%EC%97%90%EB%9F%AC%20%ED%95%B8%EB%93%A4%EB%A7%81%20%ED%95%98%EA%B8%B0/)에서 확인할 수 있다.
- log를 남겨놓긴한데, 이를 확인하기 위해선 docker container내 log를 확인해야한다. 최근에 알게 됐는데, Sentry나 Datadog같은 모니터링 서비스를 이용하면 훨씬 편하고 좋을 것 같다.

<br>

### Service 내

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

- 마지막으로 userService 내에선 다음과 같이 작성했다.

<br>

### 마무리

- 사실 service에 대한 정확한 개념은 아직 잘 모르겠다.
- 하지만, 이렇게 분리하고 나니 좋은 점은 다음과 같다.

1. controller에서 prisma가 사용되지 않는다. prisma는 오직 service에서만 사용한다.  
   → 경계(layer)가 생겼다
2. controller에서 인자를 검증할 필요가 없어졌다. 모두 service 내에서 인자값을 검증하면 된다.  
   → controller의 코드 가독성이 높아졌다.
3. if 에러 처리를 service에서 해주니, 굳이 controller에서 왔다갔다 코드를 확인할 필요가 없다. 그냥 에러가 나면 service부터 보게 된다.  
   → 디버깅이 편해졌다.

<br>

- 명확한 레이어 구분이었는지, 확신할 순 없지만, 분명히 알게 된 사실은, 레이어를 분리하고 경계를 만들면 디버깅이 편해진다는 것이다.
- 경계가 잡히면, 위에서부터 타고타고 코드를 검증할 필요가 많이 줄어든다. 에러가 나면 대부분 service부터 보게된다.
- 이 전엔 경계 구분이 없으니, router부터 들여다봐야했다. router의 어떤 부분이 잘못된 건지 찾는 수고를 경험해야겠다.
- 또한 express router내에서 app.get / app.post와 같이 경계없이 작성하다보니 복잡도가 올라가다보면 더 디버깅하기 어려워질 것 같다는 생각을 수십번 했다.
- nest.js나 java가 인기가 많은지 조금 알 것 같다. 일관된 아키텍처를 유지하게 된다. 즉, '이곳엔 이게 있겠지', '이런 코드가 존재하겠지' 하는 예측가능한 범위가 된다.
- 이는 디버깅 속도를 높이고, 협업하기 좋은 코드구조를 갖추기 수월하겠다는 생각이 들었다.

<br>

### 참고자료

[HTTP 상태 코드](https://ko.wikipedia.org/wiki/HTTP_%EC%83%81%ED%83%9C_%EC%BD%94%EB%93%9C)  
[Error Handling](https://expressjs.com/en/guide/error-handling.html)  
[에러 처리를 위한 익스프레스 가이드](https://jeonghwan-kim.github.io/node/2017/08/17/express-error-handling.html)  
[Node.js express와 error handling](https://teamdable.github.io/techblog/express-error-handling)  
[veltrends 개발 후기](https://velog.io/@velopert/veltrends-dev-review)
