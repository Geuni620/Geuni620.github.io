---
date: '2023-12-02'
title: '테이블을 편하게, Tanstack-table 사용하기'
categories: ['개발']
summary: '똥인 줄 알았는데, 금이었다.'
---

> 최근에 Tanstack-Table 라이브러리를 '다시' 사용하게 되었다.  
> 어드민을 개발할 때 동료분께서 '편해보인다.'는 이유로 적용하셨었는데,  
> 그 업무를 내가 맡게 되면서 처음 접하게 되었다.

현재 Tanstack-Table은 v8버전이며, 당시에 v7에서 v8로 업데이트된지 얼마 안되어서 공식문서를 제외한 자료도 찾기 어려웠다.  
그렇다고 공식문서가 친절한 것도 아니었다.  
(github issue 탭을 확인해보면 '이거 좋아 근데, 예시보단 문서 좀 잘 적어줘'라는 문구를 한 번씩 접하게 된다.)

<br/>

한 날은 트위터에서 Tanstack-table을 Material-ui로 커스텀한 라이브러리인 [material-react-table](https://github.com/KevinVandy/material-react-table)의 메인테이너가 ['이 영상 추천해'](https://x.com/KevinVanCott/status/1706408044874055973?s=20)라고 올려주었다.

<br/>

'한번 봐야지..' 생각하고 있던 찰나, 써볼 일도 생겨서 영상을 보게됐고, 라이브러리가 제공해주는 기능을 사용하면서 평소 많이 듣던 '바퀴를 다시 발명하지 마라'는 격언에 크게 공감하게 됐다.  
오늘은 이 영상을 정리해보려고 한다.

<br/>

- 기본적인 Tutorial에 관한 내용은 [여기](https://github.com/Geuni620/tanstack-table-v8-tutorials)에 정리해두었다.
- 당시 내가 필요했던 기능은

  1. 총 8개의 column을 가진 테이블을 만들어야 함
  2. 전체, 테이블 row 단위 체크박스 구현
  3. 페이지네이션 단, 20개, 50개, 100개 단위로 보여줬을 때, 테이블이 바로바로 업데이트 되어야했다.

<br/>

###
