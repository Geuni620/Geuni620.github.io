---
date: '2024-05-12'
title: 'Tanstack-table pagination server side로 구현하기'
categories: ['개발']
summary: '공식문서를 참고하며..'
---

여담으로 글을 시작해보자면, Tanstack-table을 처음 사용할 22년 말 ~ 23년 초쯤 인 것 같다.  
동료가 테이블을 편하게 사용하기 위해 Tanstack-table v8을 사용했는데, 자료가 거의 없었다.

이후에 동료는 다른 프로젝트를 맡게되었고, 동료가 담당하는 부분은 내가 개발하게 됐다.  
그러면서 자연스럽게 Tanstack-table을 사용하게 되었다.

당시엔 자료도 없고, 복잡하기만 한 이 라이브러리를 왜 사용했는지 의문이었는데,  
돌아와 생각해보니 동료에게 오히려 고맙다.  
현 회사에서 처음 테이블을 사용할 때 큰 허들없이 사용할 수 있었기 때문이다.

초창기 공식문서는 빈약했다.  
공식문서를 봐도 어떻게 사용할 수 있는지 감이 오지 않았다.  
예시만 주구장창 존재했다..🥲

현재는 많은 것이 변했다.  
Tanstack-table의 메인테이너가 [공식문서를 꼼꼼하게 작성해주고 있기 때문](https://x.com/KevinVanCott/status/1788269293802860890)이다.  
해당 내용을 읽어보면, 이 블로그 글보다 훨씬 더 많은 내용을 학습할 수 있을 것이라고 확신한다.

여담은 여기까지하고,

---

## Server side pagination

Tanstack-table의 공식문서를 살펴보면, [해당 내용에 관한 글](https://tanstack.com/table/latest/docs/guide/pagination)이 존재한다.  
현재 회사 프로젝트에선, client side로 개발되어있지만, 추후엔 server side로 변경할 가능성이 높다.  
물론 문서를 확인해보면, client side에서도 충분히 높은 성능을 보여줄 수 있다고 한다.

현 글에선 supabase의 RLS를 적극적으로 사용해보고 싶어서, React로만 구현하려고 한다.  
그리고 Tanstack-table과 Tanstack-query를 사용할 것이다.

기존에 [블로그](https://geuni620.github.io/blog/2023/12/2/tanstack-table/)를 작성하면서, 만들어놓은 [Repo](https://github.com/Geuni620/tanstack-table-v8-tutorials)들이 존재하지만, 위 공식문서의 가이드를 읽고, 더 나은 방법으로 작성해보고자 한다.

만들어진 코드는 [이곳]()에 올려놓겠다.
