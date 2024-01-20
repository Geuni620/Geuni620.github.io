---
date: '2023-08-28'
title: 'next-auth token 관리하기-3'
categories: ['개발']
summary: '우연히 발견한 github issue글을 토대로 해결할 수 있었다!'
---

[next-auth token 관리하기-1](https://geuni620.github.io/blog/2023/8/18/next-auth/)  
[next-auth token 관리하기-2](https://geuni620.github.io/blog/2023/8/24/next-auth/)

[next-auth token 관리하기-4](https://geuni620.github.io/blog/2023/9/10/next-auth/)

> 그리고 오늘 3번째 글을 작성하게 되었다.
> 간단히 시도했던 것들을 나열해보면 다음과 같다.

1. 유저가 signIn 할 때, accessToken을 DB에 보내고, 저장 → api 요청시 header에 accessToken을 보내서 서버에서 비교 검증
2. next-auth는 로그인 했을 때 session에 cookie로 token을 저장하는데, 이 때 secret key를 통해서 저장 → 서버에서도 동일하게 secret key를 가지고 있으면 cookie를 통해 유저 정보를 식별할 수 있음.

   - local에선 정상동작했으나, 서버에 배포하면 cookie를 읽을 수 없었음
   - https로 서버 클라이언트 모두 배포했으나, `secure:true`된 값만 반환.
   - next-auth 자체에서 cookie option을 설정할 수 있었는데, httpOnly, secure를 모두 false로 두어도 로그인이 풀려버리거나, 로그아웃이 정상동작하지 않는 이슈 발생.

3. server 컴포넌트에서 cookie를 읽어온 후, client 컴포넌트로 cookie 정보를 props로 전달, header에 담아서 보내봤지만, JWT token 복호화 과정에서 문제 발생

   - 처음엔 잘 되는 듯하다가, 어느 순간 복호화 실패 오류메시지가 뜸.

4. next-auth의 session에 accessToken을 전달할 수 있음. 이렇게 했을 때 useSession으로 accessToken을 가져올 수 있음.
   - 그럼 이 accessToken을 header에 담아서 서버로 전달, 서버에선 accessToken을 구글 oauth에 전달해서 해당 유저가 맞는지 검증
   - 해당 유저가 맞을 경우, 데이터를 반환

<br>

현재까진 4로 적용해 놓은 상태이다.

### next-auth 공식문서 잘 읽기

- 오늘 주말, 회사 출근해서 '오늘은 꼭 밀린 일들 처리하고, 로그인은 accessToken으로 검증하는 방식으로 마무리하자!' 고 다짐했음.
- 하지만 오늘도 열려있던 웹 브라우저 내에서 github issues들을 보게 되었다.

<br>

[What is the best way to have same authentication on all subdomains?](https://github.com/nextauthjs/next-auth/issues/405)

- 위 링크를 보자마자 혹여나 하는 생각에 sub-domain을 잘못 입력한 것 같다는 생각이 들었다.

```TSX
// lib/auth.ts
const useSecureCookies = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
    }),
  ],
  // 이 부분이 중요!
  cookies: {
    sessionToken: {
      name: `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: '.jejodo.life',
        secure: useSecureCookies,
      },
    },
  },
};
```

- production 환경에서는 name에 \_\_Secure가 붙는다.
- 여기서 중요한게 domain을 원래는 `dev.jejodo.life` 또는 `api.jejodo.life`라고 입력했었는데, 이걸 `.jejodo.life`로 바꿔주었다.
- 그리고 token 값을 서버에서 확인 해봤을 때, 기존에 null 뜨던게, 정상 동작한다.
- 즉, [next-auth token 관리하기-2](https://geuni620.github.io/blog/2023/8/24/next-auth/)에서 마지막에 해결하지 못했던 cookie 값을 EC2 배포 이후에도 정상적으로 가져올 수 있게 되었다.

<br>

- 이젠 고민 중이다.

  1. session을 이용해서만 maxAge를 적용한 상태로, maxAge가 끝나면 log-out 시키기
  2. google oauth를 사용하고 있으니, refresh token을 적용해서 accessToken은 header를 통해서 가져오고, refresh token은 cookie에 보관한다.
     - 이 방법은 정확하지 않다. 더 찾아봐야할 것 같다.

- 결국 문제는, accessToken를 적용해놓았는데, 만료시간이 짧고, refreshToken이 없어서 자주 로그아웃을 해야한다는 불편함이 존재한다.
- 이제 이 문제를 해결해야한다.
