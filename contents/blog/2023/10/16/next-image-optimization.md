---
date: '2023-10-16'
title: 'Image 최적화를 위해서는 lighthouse보단 performance로 측정해보자.'
categories: ['개발']
summary: ''
---

> [이전에 작성한 블로그 글](https://geuni620.github.io/blog/2023/10/13/next-image-optimization/)에 이어서 추가로 몇 가지 더 작성해보려고 한다.

### performance로 측정해보자

[이전에 작성한 블로그 글](https://geuni620.github.io/blog/2023/10/13/next-image-optimization/)에서는 계속 lighthouse만을 통해서 성능을 검증했다. 하지만 위 글에서도 언급했듯이, 근본적으로 해결하고 싶던 문제는 다으과 같다.

**사용자가 이미지를 업로드했을 때, 이미지가 최소한의 로딩시간 후 렌더링 되는 것**이다.

이미지 용량 다운, loading처리, 심지어 CDN까지 많은 것을 고려했지만, 결국 원인은 Image 컴포넌트 내부에 있었다.

<br>

참고로 회사 인터넷 속도가 빨라서 이를 기준으로 측정했다.

![인터넷 속도는 다음과 같다.](./internet-speed.png)

### 이미지 최적화 이전

이전 블로그를 기준으로 이미지를 최적화하기 위해 크게 두 가지를 변경했었다.

1. 이미지 용량 압축(browser-image-compression lib)
2. 이미지 포맷을 webp → avif로 변경

<br>

그럼 변경하기 전과 변경하고 난 후에 lighthouse performance 점수는 45 → 70으로 25 증가했었다.
(이전 블로그 작성할 때에 비해 매일 이미지와 기록을 더 많이 남겼다. 현재는 당시기준으로 돌아가서 light-house를 테스트해보면 performance점수가 24로 떨어졌다. 🥲)

<br>

하지만 performance를 확인해보자

- 먼저 record를 불러오는데 → 251.45ms
- 이미지를 submit해서 서버에서 이미지를 s3에 업로드하고, db에 저장하는데까지 → 397.04ms
- record 데이터를 refresh 시켜서 useQuery가 다시 불러오는데 → 140.24s
- 그리고 이미지를 Image컴포넌트에 src로 지정해주는데, 이때 next.js 자체 서버에 cache 및 re-size 등등을 수행하는 듯하다. → 이게 620.26ms나 걸린다.
- 총 1408.99ms 걸린다.

![최적화 이전 light-house](./최적화_전_lighthouse.png)

![최적화 이전 performance](./최적화_전_2.0mb.png)

<br>

### 이미지 최적화 이후

위에서 언급했듯이, 최적화 이후엔 용량압축, 포맷을 webp → avif로 변경했다.
webp에서 avif로 변경한 이유는 압축율이 20% 더 좋다는 vercel 공식문서를 참고했다.

- lighthouse 점수는 더 높게 나온다 아까 24 → 46으로 22점 증가했다.

<br>

동일하게 performance를 측정해봤다.

- record를 불러오는데 → 226.85ms
- 이미지를 submit해서 서버에서 이미지를 s3에 업로드하고, db에 저장하는데까지 → 225.36ms
- record 데이터를 refresh 시켜서 useQuery가 다시 불러오는데 → 140.33ms
- Image 컴포넌트 src에 이미지를 지정하는데 → 921.52ms
- 여긴 하나 더 추가되는게, 이미지를 압축하는 browser-image-compression이 추가된다. → 132.22ms
- 총 1646.28ms 걸린다.

오히려 이미지를 업로드하고 불러오는데 더 많은 시간이 걸린다.

![최적화 이후 performance](./최적화_후_2.0mb.png)

<br>

![최적화 이후 light-house](./최적화_후_lighthouse.png)

<br>

<br>

Image 컴포넌트가 문제인 듯 하여, img 태그를 사용하려고 했다. img태그를 아무 동작없이 사용하면, 로딩속도는 급감시킬 수 있다.
하지만 이 img태그 역시 avif로 변환하는 라이브러리를 사용했을 때 로딩속도가 지연된다는 것을 알 수 있었다.

즉, avif가 이미지 압출율은 좋지만, 압축하는데 걸리는 시간은 오히려 더 많이 소요된다는 것을 알 수 있었다.

그래서, webp를 사용하되, avif는 제거하였다. 그리고 minimumCacheTTL을 추가했다.

### .next/image cache

- next.js Image 컴포넌트는 많은 기능을 대체해준다.

<br>
