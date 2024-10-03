---
date: '2024-10-04'
title: 'cursor IDE 발열현상'
categories: ['일상']
summary: 'cursor를 켜놓고 개발하니, 노트북이 뜨거워진다..'
---

최근 [cursor IDE](https://www.cursor.com/)를 사용하고 있다.  
사용하다보니 만족스러워서 유료결제를 진행하고 한 달정도 사용 중이었다.

근데 한 가지 문제점이 있다.  
발열현상이 심하다는 점이다.

예를들어, 현재 내 노트북 m1 16gb 기준으로 노트북을 켜놓으면 발열현상이 심해진다.  
또 의문인건, 회사 노트북 m2 64gb는 cursor를 켜놓고 한 시간정도 개발을 하면 노트북이 뜨거워진다..

아직 불안전해서 그런건가 싶기도하고, 여러 고민을 하다가 vscode로 돌아갔었는데,  
우연히 [이 질문을 발견했다.](https://forum.cursor.com/t/cursor-helper-plugin-is-killing-my-m1-cpu/2305)

이상하게 이런 질문은 자기 전 번뜩 떠오른 생각의 꼬리의 꼬리를 물어 검색한 뒤, 발견하게 된다.  
해당 내용은 cursor를 사용할 때, CPU가 엄청 높아진다는 내용이었다.  
(확인해보니, 나 역시 cursor를 켜놓고 불특정하게 CPU사용량이 100%를 훌쩍 넘었다 내려가곤 했다.)

위 글의 답변이 적혀있는데, 원인은 [import cost extension](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) 때문이라고 주장하는 댓글을 발견했다.

확인해본 결과, 나 역시 사용중이었다.  
위 extension은 그렇게 중요하지 않다.  
단지, import 되는 모듈의 크기를 보여주는 정도의 기능이었다.

<br/>

**제거 후, 일 주일정도 지났는데, 발열현상은 사라졌다.**  
**회사, 개인노트북 모두.**
