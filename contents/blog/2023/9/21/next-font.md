---
date: '2023-09-21'
title: 'app directory에서 font를 설정해보자~!'
categories: ['next.js']
summary: 'css로 font를 적용했을 때와, next/font로 적용했을 때 무엇이 더 나을까?'
---

<br>

> next.js 13의 app directory에선 font 설정이 조금 특이하다.  
> sign-up 페이지를 작업하다가 font 설정에 대해서 고민하게 됐다.

'프로젝트에선 tailwind를 사용하고 있다. global.css에 font를 적용한 후, 새로고침을 하면, 원래 font가 적용되었다가, global.css가 읽어진 후에 style이 변경된다.'
잠깐의 찰나이지만, 순간적으로 기본 font가 적용되었다가, 의도했던 styling font가 적용되는 것을 볼 수 있다.

<br>

미세한 차이이지만, 사용자 입장에선 안 좋은 경험을 제공할 수 있다. 그래서 원하는 바는 명확했다.

`화면에 UI가 뜰 때 font가 적용된 상태로 뜨길 바랐다.`

<br>

먼저 디자이너분의 요구사항도 있었다. [google font](https://fonts.google.com/)에서 제공하지 않는 font를 주셨다.
`학교안심 우주`라는 폰트였고, [이 곳](https://copyright.keris.or.kr/wft/fntDwnldView)에 접속하면 다운받을 수 있다.

<br>

기존의 방법이라면 google font에서 두 가지로 font를 적용할 수 있다.

1. global css에 @import문을 사용해서 적용한다.

```
// global.css

```

<br>

2. root layout에 link를 추가해서 font를 적용할 수도 있다.

```TSX
// layout.tsx

```

### 참고자료

[Using Fonts in Next.js (Google Fonts, Local Fonts, Tailwind CSS)](https://youtu.be/L8_98i_bMMA?si=ou80EcPUz9HGnx3L)

[Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

[How @next/font works](https://blog.mathpresso.com/how-next-font-works-8bb72c2bae39)
