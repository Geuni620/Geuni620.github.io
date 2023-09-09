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

나의 경우엔 next-auth를 사용해서 google oauth를 사용하고 있다.
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

- ms 기준으로 구현했음,
