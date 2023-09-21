---
date: '2023-09-21'
title: 'next.js app directory의 font 설정'
categories: ['next.js']
summary: 'css로 font를 적용했을 때와, next/font로 적용했을 때 무엇이 더 나을까?'
---

<br>

> next.js 13의 app directory에선 font 설정이 조금 특이하다.  
> sign-up 페이지를 작업하다가 font 설정에 대해서 고민하게 됐다.

'프로젝트에선 tailwind를 사용하고 있다. global.css에 font를 적용한 후, 새로고침을 하면, 원래 font가 적용되었다가, global.css가 읽어진 후에 style이 변경된다.'
잠깐의 찰나이지만, 순간적으로 기본 font가 적용되었다가, styling한 font가 적용되는 것을 볼 수 있다.

<br>

### 참고자료

[Using Fonts in Next.js (Google Fonts, Local Fonts, Tailwind CSS)](https://youtu.be/L8_98i_bMMA?si=ou80EcPUz9HGnx3L)

[Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
