---
date: '2023-07-19'
title: 'ec2-docker-deploy-multi-container'
categories: ['개발']
summary: 'ec2에 서버와 프론트 모두 배포해보자'
---

> 이름을 거창하게 지어봤지만, 이전 [ec2-docker-deploy](https://geuni620.github.io/blog/2023/6/26/ec2-docker-deploy/)에서 server 배포가 추가된 것 뿐이다.

### multi-stage

오늘 정확히 오후 2시부터 저녁 9시까지 배포와의 씨름이었다.
조금 무모했던게, 동료분들이 선 배포하실 때 썼던 코드가 있었음에도 불구하고, 조금 고집을 부렸다...  
그래도 부딪히면서 배우는게 가장 크게 배우는 점이라는 생각으로 부턱대고 부딪혔다.

<br>

대략 핵심은 이러했다. 이전에 client 배포를 했었는데, 이번엔 client와 server배포를 한 번에 진행하는 것이었다.  
docker를 이용해서 compose에 client와 server docker를 둘 다 작성해주었다.

```
// 대략 폴더구조는 이러하다.
├── cicd.sh // root에서 sh cicd.sh를 실행하면 모든게 자동배포되길 바랐다.
├── client
│   ├── README.md
│   ├── app
│   ├── components
│   ├── dockerfile
│   ├── lib
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public
│   ├── tailwind.config.js
│   └── tsconfig.json
├── deploy
│   ├── client
│   ├── deploy.sh
│   ├── package.sh
│   ├── production.sh
│   ├── production.yml
│   └── server
└── server
    ├── dist
    ├── dockerfile
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── prisma
    ├── src
    └── tsconfig.json
```

순서는 다음과 같다.

1. sh cicd.sh 실행

```BASH
# cicd.sh
sh deploy/package.sh && sh deploy/deploy.sh
```

2. sh deploy/package.sh 실행

```BASH
# 프로젝트의 루트 디렉토리를 정의
PROJECT_ROOT=$(dirname $(realpath $0))/..
CLIENT_PROJECT_DIR="${PROJECT_ROOT}/client"
SERVER_PROJECT_DIR="${PROJECT_ROOT}/server"
CLIENT_DEPLOY_DIR="${PROJECT_ROOT}/deploy/client"
SERVER_DEPLOY_DIR="${PROJECT_ROOT}/deploy/server"

# # 클라이언트 코드를 빌드
cd $CLIENT_PROJECT_DIR
npm run build &&
rsync -avz --delete $CLIENT_PROJECT_DIR/.next $CLIENT_DEPLOY_DIR/ &&
rsync -avz --delete $CLIENT_PROJECT_DIR/package.json $CLIENT_DEPLOY_DIR/ &&
rsync -avz --delete $CLIENT_PROJECT_DIR/package-lock.json $CLIENT_DEPLOY_DIR/ &&
rsync -avz --delete $CLIENT_PROJECT_DIR/next.config.js $CLIENT_DEPLOY_DIR/ &&
rsync -avz --delete $CLIENT_PROJECT_DIR/public $CLIENT_DEPLOY_DIR/ &&
rsync -avz --delete $CLIENT_PROJECT_DIR/.env.production $CLIENT_DEPLOY_DIR/ &&

rsync -avz --delete $CLIENT_PROJECT_DIR/dockerfile $CLIENT_DEPLOY_DIR/ &&

echo "client packaging done"


# 서버 코드를 빌드
cd $SERVER_PROJECT_DIR
npm run build &&
rsync -avz --delete $SERVER_PROJECT_DIR/dist $SERVER_DEPLOY_DIR/ &&
rsync -avz --delete $SERVER_PROJECT_DIR/package.json $SERVER_DEPLOY_DIR/ &&
rsync -avz --delete $SERVER_PROJECT_DIR/package-lock.json $SERVER_DEPLOY_DIR/ &&
rsync -avz --delete $SERVER_PROJECT_DIR/.env $SERVER_DEPLOY_DIR/ && # .env.production이 아닌 .env로 넘겨줬다. ec2환경에서 docker container 내에서 .env.production을 읽지 못하는 이슈때문이었다.
rsync -avz --delete $SERVER_PROJECT_DIR/prisma $SERVER_DEPLOY_DIR/ &&

rsync -avz --delete $SERVER_PROJECT_DIR/dockerfile $SERVER_DEPLOY_DIR/ &&

echo "server packaging done"
```

여기서 rsync가 무엇인지, -avz가 무엇인진 잘 모른다. 대략 흐름정도만 이해하고 있다.  
client와 server가 각각 build된 파일 중 production 환경에서 실행에 필요한 파일들만 deploy/client와 deploy/server롤 복사해준다.
--delete는 기존에 담겨져 있던 파일이 있다면 삭제하고 새롭게 갈아끼워준다.

<br>

3. sh deploy/deploy.sh 실행

```BASH
# rsync 명령어를 사용하여 파일 및 디렉토리를 복사합니다.
rsync -e "ssh -i ~/desktop/keys/geuni.pem" -avz --delete deploy/client/ ubuntu@number-value:경로경로/deep-jejodo-life/client &&
rsync -e "ssh -i ~/desktop/keys/geuni.pem" -avz --delete deploy/server/ ubuntu@number-value:경로경로/deep-jejodo-life/server &&
rsync -e "ssh -i ~/desktop/keys/geuni.pem" -avz --delete deploy/production.yml ubuntu@number-value:경로경로/deep-jejodo-life/ &&
rsync -e "ssh -i ~/desktop/keys/geuni.pem" -avz --delete deploy/production.sh ubuntu@number-value:경로경로/deep-jejodo-life/ &&

echo "Deployment done" &&

ssh -i ~/desktop/keys/geuni.pem ubuntu@number-value "cd /home/geuni/deep-jejodo-life/ && sudo sh production.sh" &&

echo "Docker Container Start!!!"
```

여기서는 위 deploy폴더 내에 build 된 파일들을 EC2 server 환경으로 복사해서 옮겨준다.  
본 프로젝트는 deep-jejodo-life 프로젝트이므로, deep-jejodo-life폴더 내 모두 담아주게 된다.

<br>

4. sh production.sh

```BASH
BASEDIR=$(dirname $0);
cd ${BASEDIR} &&
docker compose -f production.yml up --force-recreate --build -d
```

production.sh가 실행되는 환경은 EC2 서버 내에서 실행된다. 그래서 production.yml compose 파일이 실행되는데 이건 다음과 같이 작성해주었다.

```YML
version: "3.1"

name: deep-jejodo-life

services:
  deep-jejodo-life-client:
    container_name: deep-jejodo-life-client
    build:
      context: ./client
      dockerfile: dockerfile # client내 dockerfile을 작성해놓았다
    restart: always
    ports:
      - "3040:3000" #container 외부포트는 30400으로 받지만, 내부포트는 3000번이다.

  deep-jejodo-life-server:
    container_name: deep-jejodo-life-server
    build:
      context: ./server # server내 dockerfile을 작성해놓았다
      dockerfile: dockerfile
    restart: always
    ports:
      - "8040:8000" #container 외부포트는 8040으로 받지만, 내부포트는 8000번이다.
```

<br>

```DOCKER
# client/dockerfile
FROM node:18.15.0 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY ./next.config.js /app/next.config.js
COPY ./.env.production /app/.env.production
COPY ./.next /app/.next
COPY ./public /app/public
CMD ["npm", "run", "start"]


server/dockerfile
FROM node:18.15.0 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY ./next.config.js /app/next.config.js
COPY ./.env /app/.env
COPY ./.next /app/.next
COPY ./public /app/public
CMD ["npm", "run", "start"]
```

여기서 좀 헤맸던게, prisma 폴더를 넘겨줘야하는지, 아닌지 몰라서 헤맸다. prisma내에 migrate된 폴더들이 존재하는데, 처음엔 옮겨주지 않아서 server-container내에서 log를 찍었을 때 에러가 떴다...  
이것 찾느라고 한 참 걸렸다. 분명 prisma를 복사해서 docker app 내에 넣어줬는데, EC2 서버에선 없는게 아닌가... 알고보니, package.sh에서 부터 prisma를 빼먹어서, dockerfile내에서는 prisma폴더가 없으니, 복사하려고해도 복사할 prisma폴더가 존재하지 않았던 것이었다.

<br>

이후에 `echo "Docker Container Start!!!" `가 터미널에 찍히면, 배포가 완료된 것이다

<br>

### 그 외 오늘 배포하면서 익힌 것들.

- docker images를 통해 docker image 리스트를 확인할 수 있다
- docker ps를 통해 docker container 리스트를 확인할 수 있다
- docker images를 삭제하려면 container부터 stop시키고, container 삭제 후 image를 삭제한다
- docker stop container_id && docker rm container_id && docker rmi image_id 한번에 하는 명령어가 있었는데, 기억이 안나서 이렇게 작성했다.

<br>

그리고 EC2에 접속해서는 sudo를 붙여야했다. 그리고 기존에 deep-jejodo-life 폴더 내 배포된 것은 client 파일들이었다. 한 번 EC2서버내에서 폴더를 삭제하고, 다시 폴더를 만든 후, 작업하려 했는데, 권한상 문제가 생겨서 chat-gpt를 통해서 권한을 입혀주는 작업을 했다...
정확히는 무엇인 모르겠는데, geuni.pem의 권한이 조금 낮은 것 같고, 기존 높은 권한 파일로 지정해주니 잘 적용되었다.
(사실 이 부분은 아직 명확히 모르겠다.)

<br>

뭔가 최근에 조금 답답함이 있었는데, 열심히하는 것 같은데 성장하지 못한다는 기분때문이었다. 하지만 역시 개발은 계단식 성장이다. 남과 비교하지말고, 나와 비교하면서 조금씩만 성장해보자.

<br>

그리고, 오늘 든 생각인데, 사회의 인정도 중요하다. 하지만 그게 꼭 빅테크, 큰 기업일 필요는 없다. 기업보다 나 자신의 가치가 높아진다면 그것만큼 멋진게 있을까...?
