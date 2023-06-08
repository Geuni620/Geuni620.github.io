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
docker build -t react-image .
```

- 여기서 -t 옵션은 이름을 지정해주는 옵션이다.

![docker image for name](./docker-images-for-name.png)

<br>

### 도커 컨테이너 만들기

```
# docker run -d --name <컨테이너 이름> <이미지 이름>
docker run -d --name react-app react-image
```

- -d 옵션은 detached 모드이고, 이건 [여기](https://github.com/Geuni620/TIL/blob/main/Docker/%5BDocker%5D%20attached%20vs%20detached%20mode.md)서 확인할 수 있다.

<br>

```
# 실행 중인 컨테이너만 확인할 수 있음.
docker ps

# 모든 컨테이너를 확인하고 싶다면
docker ps -a
```

<br>

- 이제 컨테이너를 띄웠으니, localhost:3000으로 접속해보자
- 아무것도 뜨지 않을 것이다.

<br>

### 로컬포트와 도커 컨테이너 노출포트 동기화하기

```
# 아까 입력한 건 이거.
docker run -d --name  react-app react-image

# -p 옵션을 추가해주자, -p <호스트 포트>:<컨테이너 포트>
docker run -d --name  react-app -p 3307:3000 react-image
```

- 호스트 포트를 3307로 지정했음.
- localhost:3307 포트로 접근하는 모든 트래픽을 도커 컨테이너 3000으로 보낸다는 뜻
- 즉, 3307로 접근하면 됨 → 도커 컨테이너 내 3000으로 접속하는 것과 같음.

[Synchronize localhost and containerhost](./localhost-container-host.png)

<br>

### docker container 터미널 환경으로 접속

```
# docker exec -it <컨테이너 이름> bash
docker exec -it react-app bash
```

- 접속한 후 ls를 눌러보면, 개발환경의 모든 파일이 복사되었는지 확인 할 수 있음
- 불필요한 것까지 복사되었음
  - node_modules
  - package-lock.json

<br>

### dockerignore 파일을 만들어서 불필요한 파일을 제외하기

```
# .dockerignore 파일을 만들어서 불필요한 파일들을 제외시킬 수 있음.
node_modules
Dockerfile
.git
.gitignore
.dockerignore
.env
```

<br>

- 기존 컨테이너 / 이미지를 모두 제거하고 다시 build하고 컨테이너 띄우기

```
docker rm react-app -f
docker image rm react-image -f
docker build -t react-image .
docker run -d --name react-app -p 3000:3000 react-image

# 이제 ls 찍어서 확인해보기
docker exec -it react-app bash
```

<br>

![apply-docker-ignore](./apply-dockerignore.png)

- 단 node_modules는 복사 되어있는데, 이건 컨테이너 내부에서 npm install 한 결과임

<br>

### Volume and Bind Mount

- 코드를 변경했을 때, 도커를 이용해서 띄워놓은 컨테이너의 코드도 변경되는가?
  - 변경되지 않음.
- 그럼 컨테이너 종료 → 다시 이미지 빌드 → 컨테이너 띄우기를 반복하기엔 너무 번거로움.

<br>

- 이럴 때 사용하는 것이 Volume과 Bind Mount

![volume&bind-mount](./volume%26bind-mount.png)

- 우리는 로컬 환경에서 실시간으로 컨테이너에 수정사항을 반영해야함
- 그래서 Bind Mount 방식으로 컨테이너를 띄워보자.

<br>

```
# docker run -d --name <컨테이너 이름> -v <호스트 디렉토리>:<컨테이너 디렉토리> <이미지 이름>
docker run -d --name react-app -v $(pwd)/src:/app/src -d -p 3000:3000 --name react-app react-image
```

- local dir과 docker container로 띄운 app dir를 동기화시킴

<br>

```
docker exec -it react-app bash
cd src/
touch hello // 도커 컨테이너 내부에 파일을 만듦


exit

docker rm react-app -f # 그리고 hello 파일도 삭제할 것.
```

- 의도치 않게 컨테이너 환경에서 소스 코드를 수정하게 될 수도 있음
- 이 경우 도커 컨테이너에서 호스트를 수정하지 못하도록 읽기 전용 모드를 사용하면 양방향 Sync에서 호스트 → 컨테이너로 동기화 됨

```
# :ro를 추가해서 읽기전용으로 만듦
docker run -d --name react-app -v $(pwd)/src:/app/src:ro -d -p 3000:3000 --name react-app react-image

docker exec -it react-app bash
cd src
touch hello # 에러 발생, touch: cannot touch 'hello': Read-only file system
```

![touch-hello-error](./touch-hello-error.png)

### 참고자료

[프론트엔드 개발자를 위한 Docker로 React 개발 및 배포하기](https://velog.io/@oneook/Docker%EB%A1%9C-React-%EA%B0%9C%EB%B0%9C-%EB%B0%8F-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0)

[Docker 컨테이너에 데이터 저장 (볼륨/바인드 마운트)](https://www.daleseo.com/docker-volumes-bind-mounts/)
