---
date: '2024-01-17'
title: 'next-auth의 인증/인가 동작방식 이해하기'
categories: ['개발']
summary: '-'
---

> 이전 `next-auth`를 사용해서 구글로그인 기능을 추가했었다.

- 당시 작성했던 관련 글  
  [next-auth token 관리하기-1](https://geuni620.github.io/blog/2023/8/18/next-auth/)  
  [next-auth token 관리하기-2](https://geuni620.github.io/blog/2023/8/24/next-auth/)  
  [next-auth token 관리하기-3](https://geuni620.github.io/blog/2023/8/28/next-auth/)  
  [next-auth token 관리하기-4](https://geuni620.github.io/blog/2023/9/10/next-auth/)

<br/>

# 1. Token의 필요성

현재 사이드프로젝트를 진행하고 있다.  
여기서 조금 의아한게 있는데, next-auth를 통해 로그인을 했는데(=인증했는데), **API요청시 Token을 Header에 포함시켜서 요청을 보내지 않는다.**(=인가)
조금 더 풀어서 설명해보면, 요청을 보낼 때 유저를 구분하는 기준이 userId이다. 즉, Token을 전혀 사용하고 있지 않다.

<br/>

머릿속에 의문점이 떠올랐다.

`💬 userId를 다른 사용자가 알고 있다면, postman이나, thunder-client로 DB 데이터를 꺼내오거나, 수정할 수 있는 거 아닌가? 심지어 삭제까지.`

그래서 확인해보고 싶어졌다. 과연, userId를 알고 있다면 DB에 데이터를 보낼 수 있을까?

![큰일이다;](./thuner-client.png)

위 이미지처럼 vercel로 임시 배포한 상태로 thunder-client에 데이터를 요청해봤다.
여기서 userId와 recipientId는 사용자가 다른사람에게 공유하기 위해선 노출되는 부분이기 때문에 누구나 쉽게 확인할 수 있다.

즉, userId나, recipientId만 알고 있다면 누구나 DB에 데이터를 요청할 수 있고, 삭제도 가능하다는 것이다.
만약 DB의 데이터를 보호해야한다면, userId만으로 서버 데이터를 반환하기엔 무리가 있다고 생각되었다.
그래서 이때 Token이 필요하다.

> 참고로 기획 특성상, 사이드프로젝트에선 Token이 필요하지 않다. 익명으로 누구나 글을 쓸 수 있도록 했고, Delete API는 존재하지 않기 때문이다.

<br/>

# 2. next-auth Token의 종류

next-auth의 token 종류를 알아보기 전, next-auth의 token을 관리하는 방법에 대해서 알아보자.  
next-auth에선 크게 Token을 관리하는 방법을 2가지 소개한다.  
첫번째는, jwt로 관리하는 방법이고, 두 번째는 DB에서 관리하는 방법이다.

이전 글을 쓸 당시엔, **DB에 token 정보를 담고 싶지 않았다.** 그래서 jwt를 사용했다.
jwt가 아닌, DB에서 Token을 관리하려면 next-auth에선 편하게 adapter를 제공해준다.

jwt로 Token을 관리할 때 크게 session, access, refresh token을 사용했다.
여기서 session은 인증을, access와 refresh는 인가에 사용했다.

## 2-1. 인증과 인가가 뭘까?

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

<br/>
