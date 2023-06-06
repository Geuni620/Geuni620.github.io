---
date: '2023-06-06'
title: 'react-deploy-with-docker'
categories: ['docker', 'react']
summary: '-'
---

<br>

> [Docker + ReactJS tutorial: Development to Production workflow + multi-stage builds + docker compose](https://youtu.be/3xDAU5cvi5E) 영상을 보고 내용정리.

### 리액트 프로젝트 만들기

```
create-react-app react-docker-yt
```

<br>

![root에 Dockerfile 생성](./root%EC%97%90-dockerfile-%EC%83%9D%EC%84%B1.png)

<br>

### 도커 이미지 만들기

- Dockerfile을 root에 만들어주고 아래와 같이 입력한다.

```DOCKER
# 가져올 이미지 정의 및 버전
FROM node:18.15.0

# 작업할 디렉토리 설정
WORKDIR /app

# package.json을 WORKDIR에 복사
COPY package.json .

# 명령어 실행
RUN npm install

# 현재 디렉토리의 모든 파일을 WORKDIR에 복사
COPY . .

# npm start 스크립트 실행
CMD ["npm", "start"]

# . 찍으면 root를 기준으로 Dockerfile을 찾는다.
docker build .
```

- 빌드 됐는지 확인하기 위해선 다음과 같이 입력해서 확인해보자

```
# 둘은 똑같은 결과물을 보여줌.
docker image ls
docker images
```

![docker images 찍어본 결과](./docker-images.png)

<br>

- 위 빌드한 이미지에는 별칭 또는 이름이 없다.
- 위 빌드한 이미지를 삭제하고, 이름을 넣어서 다시 빌드해보자

```
# 방금 이름없이 생성된 이미지 삭제
docker image rm 35f840f6e74d

# react-image라는 이름으로 build
docker image -t react-image .
```

- 여기서 -t 옵션은 이름을 지정해주는 옵션이다.

![docker image for name](./docker-images-for-name.png)

<br>

### 도커 컨테이너 만들기

<br>

### 참고자료

[프론트엔드 개발자를 위한 Docker로 React 개발 및 배포하기](https://velog.io/@oneook/Docker%EB%A1%9C-React-%EA%B0%9C%EB%B0%9C-%EB%B0%8F-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0)
