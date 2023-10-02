---
date: '2023-09-30'
title: 'query와 params의 차이'
categories: ['개발']
summary: 'get 요청시 query와 params 항상 헷갈린다. '
---

> 가끔 api 요청을 보낼 때, query와 params를 어떨 때 쓰는지 헷갈리곤 한다.
> 그래서일까... 대부분은 params를 사용하곤 했다.
> 이번에 조금 더 명확히 정리해보자.

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
- **filtering**, **sorting**에 주로 사용한다.
- 빈 목록을 반환하려는 경우, 매개변수를 찾을 수 없는 경우, `https://domain.com/api/contents?name=geuni`

<br>

params

- 주소에 포함된 변수를 담아서 보낸다.
- 주로 이 params를 사용했는데, `:userEmail`과 같이 get요청시 유저의 email를 받아서 db에서 해당 데이터를 빼내 전달했다.
- 리소스를 식별해야할 경우 query.params를 사용한다.
- 404 오류를 반환하려고 하는 경우, params를 사용하는 게 좋은 것 같다.
- 예를들어 232 유저가 존재하지 않아서 404를 띄울 경우엔, `https://domain.com/api/user/232`를 사용함

<br>

---

아래 내용은 stack-over-flow에서 발견한 답변 중 query와 params를 구분하는 방법이다.  
[REST API Best practices: Where to put parameters?](https://stackoverflow.com/questions/4024271/rest-api-best-practices-where-to-put-parameters)

1. Locators - 아이디나, 보기/액션과 같은 리소스 식별자
2. Filters - 검색이나, 정렬, 또는 결과의 범위를 좁힐 때.
3. State - 세션, api 키값
4. Content - 데이터의 저장공간

이러한 값들은 다양한 위치에서 사용될 수 있는데 다음과 같다.

- 헤더나 쿠키
- URL의 쿼리스트링(queryString)
- URL의 경로(path)
- Body 내

<br>

일반적으로 State는 유형에 따라 쿠키 또는 헤더에 저장되고, 필요한 경우 `x-my-header`를 사용함.  
마찬가지로 콘텐츠는 쿼리 문자열 또는 http 멀티파트, JSON 콘텐츠로서 요청 본문(Body)에 속함

`id=5`, `action=refresh` 또는 `page=2`와 같은 로케이터는 각 부분이 무엇을 의미하는지 부분적으로 알고 있고, 추가 매개 변수가 URI의 일부로 지정되어 있는 `mysite.com/article/5/page=2`와 같이 URL 경로로 사용하는 것이 좋다.

필터는 올바른 데이터를 찾는 데 일부이지만 **로케이터**가 반환하는 것의 하위 집합 또는 수정된 부분만 반환하기 때문에 항상 쿼리 문자열에 포함됩니다. `mysite.com/article/?query=Obama(하위 집합)`의 검색은 필터이며, `/article/5?order=backwards(수정)`도 필터입니다. 필터의 이름만 보지 말고 필터가 하는 일을 생각해 보세요!

`보기`가 출력 형식을 결정하는 경우, 원하는 리소스로 이동하는 대신 검색된 리소스의 수정본을 반환하므로 **필터**`(mysite.com/article/5?view=pdf)`에 해당함.  
대신 문서의 어떤 특정 부분을 볼지 결정하는 경우`(mysite.com/article/5/view=summary)` 로케이터입니다.

리소스 집합의 범위를 좁히는 것이 `필터링이라는 점`을 기억할 것. / (query)  
리소스 내에서 특정 항목을 찾는 것은 `찾기`이다. / (path)  
하위 필터링은 원하는 수의 결과를 반환할 수 있음(0도 가능). / (query)  
위치 찾기는 항상 특정 인스턴스가 존재할 경우 해당 인스턴스를 찾는다. / (path)

<br>

### 참고자료

[REST API Best practices: args in query string vs in request body](https://stackoverflow.com/questions/25385559/rest-api-best-practices-args-in-query-string-vs-in-request-body)

[REST API Best practices: Where to put parameters?](https://stackoverflow.com/questions/4024271/rest-api-best-practices-where-to-put-parameters)
