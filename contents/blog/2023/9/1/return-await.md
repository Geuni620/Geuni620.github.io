---
date: '2023-09-02'
title: 'promise의 반환으로 no return, return, return await의 차이'
categories: ['개발']
summary: '각각을 테스트해보자.'
---

> 속해있는 단톡방에서 `return await something()`에 대한 질문이 올라왔다.  
> 부끄럽지만, 사실 tanstack-query를 사용할 때, return await res.json()을 사용했다가 return res.json()으로 변경했다.  
> 왜냐하면 큰 차이가 없다고 생각했기 때문이다. 하지만, 내가 몰랐던 차이가 존재했다. 즉 테스트해보았다.

### 예시

[예시코드](https://github.com/Geuni620/return-await-test)

```TSX
// 원래 함수
async function waitAndMaybeReject() {
  await new Promise((r) => setTimeout(r, 1000));
  const isHeads = Boolean(Math.round(Math.random()));

  if (isHeads) return "yay";
  throw Error("Boo!");
}
```

### a func

```TSX
// 그냥 함수를 호출하는 경우
async function a() {
// A 구간
  try {
    waitAndMaybeReject();
  } catch (e) {
    return "caught";
  }
}

// B 구간
a()
  .then((result) => console.log(`a() result: ${result}`))
  .catch((e) => console.log(`a() error: ${e.message}`));
```

- 위 예시에서 a()함수는 promise를 반환할 때 await을 붙이지 않았다.
- 그래서 `undefined`만 반환할 것이다.
- 그리고 `try...catch`블록은 무용지물이 된다. 즉, 구간 A와 B 모두 catch 하지 못하고, Error문이 떠버린다.

### b func

```TSX
// return 사용
async function b() {
// A 구간
  try {
    return waitAndMaybeReject();
  } catch (e) {
    return "caught";
  }
}

// B 구간
b()
  .then((result) => console.log(`b() result: ${result}`))
  .catch((e) => console.log(`b() error: ${e.message}`));

```

- await는 붙이지않고, return을 사용했다.
- 이때 A구간의 `try...catch`블록은 무용지물이 된다.
- return `waitAndMaybeReject()`는 예외를 던지지 않고, 대신 rejected 상태의 Promise를 반환한다.
- 그래서 B 구간에서 catch문으로 Error를 잡을 수 있다.

<br>

### c func

```TSX
// return await 사용
async function c() {
// A 구간
  try {
    return await waitAndMaybeReject();
  } catch (e) {
    return "caught";
  }
}

// B 구간
c()
  .then((result) => console.log(`c() result: ${result}`))
  .catch((e) => console.log(`c() error: ${e.message}`));
```

- 이번에는 await을 붙여서 return을 사용했다.
- waitAndMaybeReject() 함수가 완료될 때까지 기다린 후 그 결과를 반환하거나 예외를 캐치할 수 있다.
- 이땐 A구간의 `try...catch`블록은 예외를 잡을 수 있다.
- 즉, 이 경우엔 B구간의 catch는 무용지물이 된다.

<br>

### d func

```TSX
async function d() {
// A 구간
  try {
    await waitAndMaybeReject();
  } catch (e) {
    return "caught!";
  }
}

// B 구간
d()
.then((result) => console.log(`d() result: ${result}`))
.catch((e) => console.log(`d() error: ${e.message}`));
```

- 이번엔 await만 붙여줬다.
- 이때 A구간 내에서 await waitAndMaybeReject()의 결과로 undefined 또는 rejected 상태의 Promise가 반환된다.
- reject 되었을 땐, return "caught!"가 실행되고, B구간은 실행되지 않는다.
- 여기서 왜 `yay`이 실행되지 않는지 의문을 가질 수 있다.
- d() 함수의 return을 찾아보자. return이 없다. 즉, undefined인 것이다.

### 참고자료

[await vs return vs return await](https://jakearchibald.com/2017/await-vs-return-vs-return-await/)

[await vs return vs return await: 비동기 이해하기](https://ooeunz.tistory.com/47)

[no return, await, return, await return 의 차이](https://yceffort.kr/2021/02/run-await-return-return-await)
