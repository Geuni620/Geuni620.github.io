---
date: '2023-08-13'
title: '블로그를 다시 만들까 하는 고민'
categories: ['일상']
summary: '-'
---

> 이 블로그를 gatsby로 만든 블로그이다. 작년 5월쯔음 [인프런에서 블로그 만드는 강의](https://www.inflearn.com/course/gatsby-%EA%B8%B0%EC%88%A0%EB%B8%94%EB%A1%9C%EA%B7%B8/dashboard)를 보고 개발했다.

당시엔, 따라서 만들어 보는 것에 큰 의의를 두었다. 그저 나의 블로그를 내 손으로 만들어보고 싶었다.  
하지만, 기술적으로나, 역량적으로나 많이 부족했던 것 같다. 어떻게 시작해야할지 막막했다.
우연히 발견한 인프런 강의를 보면서 하나씩 따라 만들어보고, 만든 블로그를 조금 더 심플하게 변형해보면서 많은 에러를 만났다.
`작은 기능하나 수정하는데도 이렇게 많은 에러를 만나다니...`
당시 이런 생각을 했던 것 같다. (정확히 기억나진 않지만.)

최근엔 블로그에 불만이 조금씩 생긴다.

1. build하는데 오래걸린다.

- 크리티컬하진 않다. 블로그다보니 참을 수 있다.

2. 작은 기능하나 추가하는데 오랜 시간이 걸린다.

- 현재 업무에 `graphql`을 전혀 사용하고 있지 않다. 그러다보니, `graphql`을 사용하는 방법을 까먹게 되고, 익숙지 않다.
- 작은 기능 하나 추가하려 해도, `graphql`, `gatsby`까지 공부해야한다.
- 회사에서 프론트 / 백엔드를 모두 경험해볼 기회가 생겼다. 좋은 기회이지만, 아직은 버거운게 사실이다.
- 그렇다보니, 회사 업무에 뒤쳐지지 않아야하고, 자연스럽게 (현재는) 불필요한 기술스택을 조금씩 멀리하게 된다. +효율을 따지게 된다.
- 즉, 필요한 것부터 하나씩 쌓아가는 걸 선호하게 된다.
- 지금 `graphql`이 그렇다. 공부했을 때 사용할 수 있는 곳은 블로그다. 대신 nest.js / DB / AWS / docker 등은 현 회사 업무에 바로 적용할 수 있고 배울 수 있는 것들이다.
- 그리고 사내 기술스택으로 프론트는 app 디렉토리 기반의 `next.js`이다.
- 자연스럽게 `gatsby` / `graphql`을 뒷전으로 밀리게 된다.
- 밀리다보니, 스트레스를 받는다. 작은 기능하나 추가하는 것도, 지금 공부해야할 것들도 많은데 (현재 내게) 마이너한 기술까지 공부해야할까 하는 생각이든다. 이 시간이면 더 나은 제품 및 코드를 생산할 수 있을 것만 같다.

<br>

결과적으로 `next.js` 기반으로 블로그를 바꿔야겠다. 나에겐 회사 업무가 중요하고, 회사 업무를 통해 가장 큰 성장을 할 수 있어서, 사이드 프로젝트는 조금 뒷전이지만, 그래도 블로그를 하나씩 개선해봐야겠다.

구상을 해봐야겠다.
