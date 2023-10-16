---
date: '2023-10-16'
title: 'Image 최적화를 위해서는 lighthouse보단 performance로 측정해보자.'
categories: ['개발']
summary: ''
---

> [이전에 작성한 블로그 글](https://geuni620.github.io/blog/2023/10/13/next-image-optimization/)에 이어서 추가로 몇 가지 더 작성해보려고 한다.

### performance로 측정해보자.

[이전에 작성한 블로그 글](https://geuni620.github.io/blog/2023/10/13/next-image-optimization/)에서는 계속 lighthouse만을 통해서 성능을 검증했다. 하지만 위 글에서도 언급했듯이, 근본적으로 해결하고 싶던 문제는 **사용자가 이미지를 업로드했을 때, 이미지가 최소한의 로딩시간 후 렌더링 되는 것**이다.

이미지 용량 다운, loading처리, 심지어 CDN까지 많은 것을 고려했지만, 결국 원인은 Image 컴포넌트 내부에 있었다.

- 이상하게 이미지를 업로드하고, stale한 데이터를 react-query로 refresh 시키면 이미지가 로드되는데 시간이 오래걸렸다.
- 이를 performance로 측정해보니, 이미지가 로드되는데, 3s 이상 걸릴 때도 있었다.
- 원인은 .next/image cache에 있었다.

<br>

### .next/image cache

- next.js Image 컴포넌트는 많은 기능을 대체해준다.

<br>
