---
date: '2023-11-18'
title: 'setState는 비동기함수일까? 동기함수일까?'
categories: ['개발']
summary: '잘못 알고 있었던 내용을 수정해보자.'
---

> 지금까지 setState는 비동기함수라고 이해하고 있었다.
> 그런데, setState는 동기함수였다.
> 어떻게 생각이 변화되었는지 알아보자.

<br>

사내에 배울게 많은 동료가 있다. 이 동료가, useState는 비동기처리방식, useReducer는 동기처리방식이라는 말을 해주었다.
조금 의아했다. 마침 이전에 읽었던 글 중 [콘솔로그가 이상한건 setState가 비동기 함수여서가 아닙니다. (feat: fiber architecture)](https://velog.io/@jay/setStateisnotasync)이 생각나서 영상도 보고, 내용도 정독했다.

<br>

글에선, 결국 setState는 동기적으로 동작하는데, 이를 업데이트 하는 가상돔이 비동기로 동작하기 때문에, setState 역시 비동기라고 오해하는 사람이 많다.
하지만, setState는 동기적으로 동작한다. 는게 핵심 내용이었다.

<br>

그럼 궁금했다.

1. 가상돔에 대한 개념 및 동작방식
2. setState를 포함한 useReducer는 어떻게 동작할까?

### 가상돔에 대한 개념 및 동작방식

### 참고자료

[콘솔로그가 이상한건 setState가 비동기 함수여서가 아닙니다. (feat: fiber architecture)](https://velog.io/@jay/setStateisnotasync)
