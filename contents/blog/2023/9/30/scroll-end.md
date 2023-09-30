---
date: '2023-09-30'
title: 'query와 params의 차이'
categories: ['개발']
summary: 'get 요청시 query와 params 항상 헷갈린다. '
---

> 가끔 api 요청을 보낼 때, query와 params를 어떨 때 쓰는지 헷갈리곤 한다.
> 그래서일까... 대부분은 params를 사용하곤 했다.
> 요번에 조금 더 명확히 정리해보자.

<br>

### req.query vs res.params

```
// req.query
// https://domain.com/api?name=geuni620

// req.params
// https://domain.com/api/${userName}
```

query

- 위와같이 query는 ?(물음표) 뒤에 필요한 변수를 key=value 형태로 전달한다.
- &을 통해 추가적인 조건을 전달할 수 있다.
- filtering, sorting에 주로 사용한다.

<br>

params

- 주소에 포함된 변수를 담아서 보낸다.
- 주로 이 params를 사용했는데, :username과 같이 get요청시 유저의 email를 받아서 db에서 해당 데이터를 빼내 전달했다.
- 리소스를 식별해야할 경우 query.params를 사용하는 것 같다.

### 참고자료

[그런 REST API로 괜찮은가](https://youtu.be/RP_f5dMoHFc?si=8Ny7-YsstYfA0i3E)

- 이전에 봤던 영상, 기억이 나서 다시 봤다.

<br>

[REST API Best practices: args in query string vs in request body](https://stackoverflow.com/questions/25385559/rest-api-best-practices-args-in-query-string-vs-in-request-body)
