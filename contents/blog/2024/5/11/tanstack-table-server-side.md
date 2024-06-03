---
date: '2024-06-04'
title: 'Tanstack-table pagination server side로 구현하기'
categories: ['개발']
summary: '공식문서를 참고하며..'
---

## Server side pagination

Tanstack-table의 공식문서를 살펴보면, [해당 내용에 관한 글](https://tanstack.com/table/latest/docs/guide/pagination)이 존재한다.  
현재 회사 프로젝트에선, client side로 개발되어있지만, 추후엔 server side로 변경할 가능성이 높다.  
물론 문서를 확인해보면, client side에서도 충분히 높은 성능을 보여줄 수 있다고 한다.

현 글에선 supabase의 RLS를 적극적으로 사용해보고 싶어서, React로만 구현하려고 한다.  
그리고 Tanstack-table과 Tanstack-query를 사용할 것이다.

<br/>
