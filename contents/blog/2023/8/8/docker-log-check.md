---
date: '2023-08-08'
title: 'deploy 후 docker log 확인하기'
categories: ['개발']
summary: 'docker container를 이용해서 EC2에 배포했는데, 웹사이트가 멈춰버렸다. 왜 멈춘걸까? 어떻게 해결할 수 있을까?'
---

> 최근 블로그에서 조회수 기능을 추가하면서 deploy를 많이 하게 되었는데, 처음엔 잘 돌아가던 웹사이트가 한 번씩 죽어버렸다.
> 어떻게 원인을 찾아야할지 고민했는데, EC2에 접속해서, docker container log를 확인하면 된다.

<br>

방법은 간단하다. 터미널을 열어서 EC2에 접속해보자. vscode의 `호스트에 연결하기`를 사용하면 손 쉽게 지정해 놓은 호스트에 접속할 수 있다.
참고로 나는 보통 터미널을 통해서 접속한다

```
ssh -i "key.pem" ubuntu@0.00.000
```

사내에서 EC2에 접속하는 권한을 설정하려고 한다. 하지만 현재는 ubuntu로 접속한다.

```
sudo docker ps # docker container 목록을 확인 할 수 있다.
```

먼저 container 명을 확인한다.

```
sudo docker logs <container name> # container log를 확인할 수 있다.
sudo docker logs -f <container name> # 실시간으로 log를 확인할 수 있다.
```

위와 같은 방법을 통해, 어디서 에러가 나는지 발견할 수 있었다.

나의 경우엔 총 두 가지를 확인할 수 있었는데, 첫 번째는 조회수에서 나는 에러였고, 두 번째는 댓글에서 나는 에러였다.

첫 번째 같은 경우는 dynamic 속성을 수정하여 해결할 수 있었는데, 두 번째는 nest.js로 작성된 백엔드 서버를 확인해야한다.
nest.js 문법을 잘 모르는데, 얼른 찍먹이라도 해봐야할 것 같다.
