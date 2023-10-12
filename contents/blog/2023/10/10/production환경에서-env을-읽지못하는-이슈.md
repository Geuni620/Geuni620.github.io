---
date: '2023-10-10'
title: 'production환경에서 .env을 읽지 못하는 이슈'
categories: ['개발']
summary: ''
---

> s3 bucket에 이미지를 올리기 위해선 AWS의 access key와 secret key가 필요하다.  
> 이는 .env파일에 저장하여 사용하려 했다.  
> 현재 배포는 rsync를 이용하여 EC2서버에 옮겨준 후, docker container를 띄워서 배포하고 있다.  
> 그런데 .env파일에서 access key와 secret key를 읽지 못하는 이슈가 발생했다.

### 문제상황

```TSX
// lib/s3.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESSKEY_ID || '',
    secretAccessKey: process.env.S3_ACCESSKEY_SECRET || '',
  },
  region: 'ap-northeast-2',
});
```

- 위와 같이 작성한 후, multer-s3를 이용해서 s3로 이미지를 올린 후, key는 db에 저장한다.
- 로컬에선 잘 동작한다. 문제는 production에 배포하고 나서 동작하지 않는다.
- docker container 내부에서 .env.production을 확인했을 땐 업데이트 된 내용이 잘 반영되어 있었다.
- **하지만, 사용하는 코드에선 bucket이 없다는 에러가 발생했다.**

<br>

### 해결과정

[dotenv로 환경 변수를 .env 파일로 관리하기](https://www.daleseo.com/js-dotenv/#es-%EB%AA%A8%EB%93%88%EC%97%90%EC%84%9C-%ED%99%98%EA%B2%BD-%EB%B3%80%EC%88%98-%EB%B6%88%EB%9F%AC%EC%98%A4%EA%B8%B0-import)

- 많은 글들을 확인해보다가 위 블로그 글을 발견했다.
- 여기서 잠깐, ESM을 사용하고 있다고 생각했는데 tsconfig.json에 확인해보니 modules은 commonjs이다.
- import/export 문을 사용하고 있어서 당연히 ESM이라고 생각했었는데...

<br>

- 확인결과 tsconfig.json도 module에 common.js를 사용하고 있었고, package.json에서 type을 따로 지정해주지 않았었다. 즉, default로 common.js로 build되고 있었다.
- 하지만, import문을 사용했었는데, 문제가 되진 않았고 빌드에러도 발생하지 않았다.
- import문이 사용가능했다는게 의아하긴 하지만, 결국 common.js를 사용했다.
- 결정적인건 이미지 업로드할 때 업로드 후 다시 불러오는 과정에서 이미지 로딩이 오래걸렸다.
  - 로딩 fallback이 사라졌음에도 불구하고 이미지가 즉각적으로 보이진 않았다.
- 그래서 [plaiceholder](https://plaiceholder.co/docs)를 이용해서 dash64를 생성하고, 이를 next/image의 [blurDataUrl](https://nextjs.org/docs/app/api-reference/components/image#blurdataurl)에 넣어주려고 했다.
- 하지만 plaiceholder는 common.js를 지원하지 않는다. 즉, ESM만 지원한다. 그래서 에러가 발생했었다.

<br>

### 이상하다

왜냐하면, ESM이 아닌 common.js는 동기적으로 동작하는데, env 파일이 import 되지 않았었기 때문이다.
