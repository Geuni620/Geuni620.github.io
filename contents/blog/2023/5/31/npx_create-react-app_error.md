---
date: '2023-05-31'
title: 'npx create-react-app error'
categories: ['개발']
summary: 'template was not provided.'
---

# create-react-app error

> 리액트 새로운 프로젝트를 생성하려고 하던 찰나 다음과 같은 에러가 발생했음.

```
npx create-react-app 폴더명


// error
A template was not provided. This is likely because you're using an outdated version of create-react-app.
Please note that global installs of create-react-app are no longer supported.
You can fix this by running npm uninstall -g create-react-app or yarn global remove create-react-app before using create-react-app again.
```

- 터미널에서 뜬 에러대로 수정을 해보았지만 계속 위 에러만 발생했음.

<br>

```
create-react-app 폴더명
```

- 위와 같이 작성하니 잘 생성됨.
