---
date: '2023-08-28'
title: 'next-auth token 관리하기-3'
categories: ['daily']
summary: '우연히 발견한 github issue글을 토대로 해결할 수 있었다!'
---

[next-auth token 관리하기-1](https://geuni620.github.io/blog/2023/8/18/next-auth/)  
[next-auth token 관리하기-2](https://geuni620.github.io/blog/2023/8/24/next-auth/)

> 그리고 오늘 3번째 글을 작성하게 되었다.
> 간단히 시도했던 것들을 나열해보면 다음과 같다.

1. 유저가 signin 할 때, accessToken을 DB에 보내고, 저장 → api 요청시 header에 accessToken을 보내서 서버에서 비교 검증
2. next-auth는 로그인 했을 때 session에 cookie로 token을 저장하는데, 이 때 secret key를 통해서 저장 → 서버에서도 동일하게 securt key를 가지고 있으면 cookie를 통해 유저 정보를 식별할 수 있음

- local에선 정상동작했으나, 서버에 배포하면 cookie를 읽을 수 없었음
- https로 서버 클라이언트 모두 배포했으나, `secure:true`된 값만 반환.
- next-auth 자체에서 cookie option을 설정할 수 있었는데, httpOnly, secure를 모두 false로 두어도 로그인이 풀려버리거나, 로그아웃이 정상동작하지 않는 이슈 발생.

<br>

### next-auth 공식문서 잘 읽기

- 오늘 주말, 회사 출근해서 오늘은 꼭 밀린 일들 처리하고, 로그인은 accessToken으로 검증하는 방식으로 마무리 하려고 했음.
- 하지만 오늘도 열려있던 웹 브라우저 내에서 github issues들을 보게 도었다.
