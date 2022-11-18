---
date: '2022-11-31'
title: '2022-11 스크랩'
categories: ['스크랩']
summary: '-'
---

## 2022-11-16 (수)

[React에서의 querySelector, 잘 쓰고 있는 걸까?(feat. Ref)](https://mingule.tistory.com/61)

* react에서 querySelector을 사용하지 않는 이유는, 직접적인 DOM 조작이 필요하지 않기 때문
* 가상돔(virtual dom)이 이를 대신해줌, 직접적인 DOM 조작이 오히려 react 가상돔에 방해될 수 있음.

<br>

[(번역) 우리가 CSS-in-JS와 헤어지는 이유](https://junghan92.medium.com/%EB%B2%88%EC%97%AD-%EC%9A%B0%EB%A6%AC%EA%B0%80-css-in-js%EC%99%80-%ED%97%A4%EC%96%B4%EC%A7%80%EB%8A%94-%EC%9D%B4%EC%9C%A0-a2e726d6ace6)

<br>

[Next.js 코드 컨벤션](https://tech.toktokhan.dev/2020/08/30/front-convention/)

<br>

---

## 2022-11-17 (목)

[코드 리뷰 in 뱅크샐러드 개발 문화](https://blog.banksalad.com/tech/banksalad-code-review-culture/#%EC%BB%A4%EB%AE%A4%EB%8B%88%EC%BC%80%EC%9D%B4%EC%85%98-%EB%B9%84%EC%9A%A9%EC%9D%84-%EC%A4%84%EC%9D%B4%EA%B8%B0-%EC%9C%84%ED%95%9C-pn-%EB%A3%B0)
* 작은 PR 규칙, 1개 PR은 1,000 Line을 넘을 수 없다.
* 테스트 코드를 작성하는 이유는 build시간과도 관련이 있음.
  - 테스트 하지 않은 코드를 build하고, 문제가 발생했다면 다시 build 해야함
  - 하지만 테스트 코드를 작성했을 시 이런 번복사항을 줄일 수 있음.

<br>

---

## 2022-11-18 (금)

[react-hook-form을 선택한 이유와 적용 과정](https://tech.inflab.com/202207-rallit-form-refactoring/react-hook-form/)
