---
date: '2023-09-08'
title: 'useQuery와 useQuery+Suspense 중 어떤게 loading UI를 사용자에게 더 빨리 보여줄 수 있을까?'
categories: ['개발']
summary: '어떤 게 사용자에게 더 빠르게 Loading UI라도 먼저 보여줄 수 있을까?'
---

> useQuery에선 isLoading을 return 해준다.  
> Suspense에서도 Promise가 pending 상태라면, fallback을 보여준다.  
> 그럼 useQuery만 사용했을 때와, useQuery와 Suspense를 사용했을 때 어떤 게 더 빨리 Loading UI를 사용자에게 보여줄 수 있을까?

<br>

하나의 가정이 필요하다.

- 네트워크 속도 동일하다.

<br>

처음 이 주제에 대해 궁금하기 시작한 건 동료개발자분 덕이다.  
내가 만들고 있는 서비스에서 Nav에 user가 sign-up할 때 작성했던 데이터를 불러와서 보여줘야하는 부분이 있었다.  
`UserInfoNav`라는 컴포넌트에 작성했는데, Suspense로 감싸서 fallback ui를 적용했는데, 다음과 같았다.

```TSX
// UserInfoNav.tsx
const UserInfoNav: React.FC<Props> = ({ isUrlRecord }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { giRokEInfo, isLoading } = useGiRokEInfoGetQuery(session?.user.email);

  if (isLoading)
    return (
      <div className="text-base font-medium leading-6 tracking-tighter">
        <p>loading...</p>
      </div>
    );

  return (
    <div className="text-base font-medium leading-6 tracking-tighter">
      {isUrlRecord ? (
        <Image
          onClick={() => router.push('/dashboard')}
          src="temp-icon/arrow.svg"
          width={32}
          height={32}
          alt="arrow-icon"
        />
      ) : (
        <p>
          {session?.user.name}의 기록이 {giRokEInfo?.giRokEName}의 집
        </p>
      )}
    </div>
  );
};

export default UserInfoNav;
```

- 여기선 useQuery에서 return해주는 isLoading으로 처리해주었다.
- 그 이유는, Suspense로 감싸주었을 때, fallback ui를 보여주어야하는데 이게 동작하지 않는다.
- 해당 부분에서 `useGiRokEInfoGetQuery` hooks는 서버에 데이터를 요청하기 때문에 Promise를 return하는데도 불구하고 동작하지 않는다.
- **아직 원인 파악 중이다...**

<br>

어쨌든, 위 내용을 동료개발자분께 공유드리는데, 동료개발자 분이 Suspense를 사용하는 이유가 "fallback ui를 보여주기 위해서'만' 있는 건 아니다."  
"data의 fetching 시점을 더 빨리 가져가기 위함이다."라고 말씀하신게 흥미를 불러일으켰다.

<br>

지금 이 글은 제목에서도 적혀있듯, 'useQuery와 useQuery+Suspense 중 어떤게 loading UI를 사용자에게 더 빨리 보여줄 수 있을까?' 이다.
처음 나의 흥미를 불러 일으킨, 'data의 fetching 시점은 어떤게 더 빠를까?'였는데, 탐구하다보니, 기준을 위와 같이 잡게 됐다.

<br>

~~당시 탐구할 땐 같은 주제라고 생각했는데, 지금와서 생각해보니 data의 fetching 시점은 다른 주제인 것 같다.~~
~~data fetching 시점은 useQuery를 사용하기 때문에 어쨌든 동일할 것이라는 생각이 든다. (개인적인 생각이다)~~

<br>

그리고 탐구하다보니 알게 된 사실인데, react-query가 존재하기 전에는 useEffect를 사용해서 data fetching 했다.(고 한다.)  
'useEffect와 useQuery 둘 중 data의 fetching 시점은 어떤게 더 빠를까?'  
useEffect와 useQuery 내부 동작이 어떤지는 찾아보지 않아서 잘 모르겠지만, 둘이 실행되는 시점은 **동일**하다.
즉, mount 된 후에 useQuery도 useEffect도 실행된다.

<br>

### Suspense

다시 본론으로 돌아와서, useQuery만 사용했을 때와 useQuery+Suspense를 사용했을 때 어떤게 더 빠를까?
Suspense 내부 코드를 먼저 확인해보고 싶었다.

[Data fetching with React Suspense](https://blog.logrocket.com/data-fetching-react-suspense/)

위 글에선 Suspense 내부 동작을 **참고용**으로 구현해 놓은 코드가 있다.

```TSX
// wrapPromise.ts
function wrapPromise(promise: any) {
  let status = 'pending';
  let response: any;

  const suspender = promise.then(
    (res: any) => {
      status = 'success';
      response = res;
    },
    (err: any) => {
      status = 'error';
      response = err;
    },
  );

  const read = () => {
    switch (status) {
      case 'pending':
        throw suspender;
      case 'error':
        throw response;
      default:
        return response;
    }
  };

  return { read };
}

export default wrapPromise;

// fetchData.ts
import wrapPromise from './wrapPromise';

function fetchData(url: string) {
  const promise = fetch(url)
    .then((res) => res.json())
    .then((res) => res.data);

  return wrapPromise(promise);
}

export default fetchData;
```

```TSX
// https://velog.io/@imnotmoon/React-Suspense-ErrorBoundary-%EC%A7%81%EC%A0%91-%EB%A7%8C%EB%93%A4%EA%B8%B0
// https://velog.io/@seeh_h/suspense%EC%9D%98-%EB%8F%99%EC%9E%91%EC%9B%90%EB%A6%AC
// 두 블로그에서 코드를 참고했다 🙇‍♂️
import React from "react";

export interface SuspenseProps {
  fallback: React.ReactNode;
}

interface SuspenseState {
  pending: boolean;
  error?: any;
}

function isPromise(i: any): i is Promise<any> {
  return i && typeof i.then === "function";
}

export default class Suspense extends React.Component<
  SuspenseProps,
  SuspenseState
> {
  private mounted = false;
  public state: SuspenseState = {
    pending: false
  };

  public componentDidMount() {
    this.mounted = true;
  }

  public componentWillUnmount() {
    this.mounted = false;
  }

  public componentDidCatch(err: any) {
    if (!this.mounted) {
      return;
    }

    if (isPromise(err)) {
      this.setState({ pending: true });
      err
        .then(() => {
          this.setState({ pending: false });
        })
        .catch(err => {
          this.setState({ error: err || new Error("Suspense Error") });
        });
    } else {
      throw err;
    }
  }

  public componentDidUpdate() {
    if (this.state.pending && this.state.error) {
      throw this.state.error;
    }
  }

  public render() {
    return this.state.pending ? this.props.fallback : this.props.children;
  }
}
```

- 위 코드에서 확인할 수 있듯이, Suspense 내부에서는 Promise를 확인한다.
- 그리고 Promise가 pending 상태라면, pending을 true로 설정하고 fallback ui를 보여주는 것이다.
- 여기서 핵심은 ErrorBoundary로 error를 throw하듯이, suspense로 **Promise를 throw하고 Suspense에서 Promise를 받아서 상태를 확인한다는 것**이다.

<br>

### useQuery

그럼 궁금한게 하나 생긴다.
**useQuery는 대체 언제 실행될까?**

[Inside React Query 번역본](https://velog.io/@hyunjine/Inside-React-Query)  
[Inside React Query](https://tkdodo.eu/blog/inside-react-query)

<br>

```
the component mounts, it calls useQuery, which creates an Observer.
컴포넌트가 마운트되면 Observer를 생성하는 useQuery를 호출합니다.
```

- useQuery는 컴포넌트가 마운트 되면 실행된다.
- 즉, 컴포넌트 맨 위 코드부터 쭉 읽어가다가, return 부분에 '<div>'태그들을 모두 그리고 난 후 useQuery가 실행되는 것이다.

아하... 명확해졌다.

<br>

### 여기서 잠깐만.

- 그럼 suspense는 컴포넌트 마운트 되기 전, 컴포넌트를 그리는 단계에서 promise를 catch 하는게 맞나?
- react 실행되는 생명주기는 어떻게 되는 걸까?
- react-query 내부는 어떻게 동작할까?
- react의 hooks는 어떻게 동작하지? 이게 schedule와 연관된 걸까?

<br>

이런 궁금증이 남는다.
잠깐 찾아본 결과 궁금증의 해답을 제시하는 글을 발견했다.

[[React] React-Query와 Suspense](https://programmerplum.tistory.com/179#toc-Suspense)  
[Suspense for Data Fetching의 작동 원리와 컨셉 (feat.대수적 효과)](https://maxkim-j.github.io/posts/suspense-argibraic-effect/)

- 위 두 글을 통해서 '그럼 suspense는 컴포넌트 마운트 되기 전, 컴포넌트를 그리는 단계에서 promise를 catch 하는게 맞나?'의 정답을 찾았다!

<br>

- suspense로 감싸진 컴포넌트(예를 들어 <UserInfoNav/>)가 렌더링을 시도한다.
- 내부에서 useQuery는 어떠한 resource에 의해 감싸지게 될텐데, 이게 위에서 본 wrapPromise이다.
- 이 wrapPromise는 read()를 호출한 후, 데이터가 들어오기 전이라면, 컴포넌트 렌더링을 정지한다.
- 그리고 react는 이 컴포넌트를 패스하고 다른 컴포넌트를 렌더링 시도한다.
- 렌더링 시도할 컴포넌트가 남아있지 않을 경우, 컴포넌트 트리 상에서 존재하는 것 중 가장 가까운 Suspense(여기선 다시 정지한 컴포넌트(<UserInfoNav/>)의 가장 가까운 Suspense)의 fallback ui를 찾는다.

<br>

- 즉 컴포넌트를 렌더링하는 단계에서 promise를 catch하는 것이 맞다.
- 그리고 위에서 개인적인 생각이라고 말했던 부분도, 정정이 필요하다.

```
당시 탐구할 땐 같은 주제라고 생각했는데, 지금와서 생각해보니 data의 fetching 시점은 다른 주제인 것 같다.
data fetching 시점은 useQuery를 사용하기 때문에 어쨌든 동일할 것이라는 생각이 든다. (개인적인 생각이다)
```

- 위 부분 역시 Suspense를 적용함으로써, 응답을 기다리며 명령형으로 코드를 작성할 필요가 없어졌다.
- 즉, useQuery의 isLoading과 같은 값을 리턴할 이유도 없어졌으니, 코드가 줄어들고, 비동기 데이터의 표시는 더 빨라질 것이라고 추측된다.

<br>

### 결론

- suspense + useQuery가 loading 시점도 빨리 보여준다.
- suspense + useQuery가 data의 fetching 시점도 빨리 가져간다.

<br>

아직 해결하지 못한 궁금증들

- react 실행되는 생명주기는 어떻게 되는 걸까?
- react-query 내부는 어떻게 동작할까?
- react의 hooks는 어떻게 동작하지? 이게 schedule와 연관된 걸까?

아래 세 가지는 react에 관련된 내용이니, 또 다음 주제를 통해 블로그를 작성해야겠다.

<br>

### 참고자료

suspense  
[토스ㅣSLASH 21 - 프론트엔드 웹 서비스에서 우아하게 비동기 처리하기](https://youtu.be/FvRtoViujGg?si=rixcZx7yBijQ7Orq)

[sebmarkbage SynchronousAsync.js](https://gist.github.com/sebmarkbage/2c7acb6210266045050632ea611aebee)

[Suspense와 선언적으로 Data fetching처리](https://fe-developers.kakaoent.com/2021/211127-211209-suspense/)

[Suspense for Data Fetching의 작동 원리와 컨셉 (feat.대수적 효과)](https://maxkim-j.github.io/posts/suspense-argibraic-effect/)

[Suspense을 사용해 선언적으로 로딩 화면 구현하기](https://lasbe.tistory.com/160)

[Suspense의 동작 원리](https://velog.io/@seeh_h/suspense%EC%9D%98-%EB%8F%99%EC%9E%91%EC%9B%90%EB%A6%AC)

[React Suspense 소개 (feat. React v18)](https://www.daleseo.com/react-suspense/)

<br>

react-query  
[Inside React Query 번역본](https://velog.io/@hyunjine/Inside-React-Query)  
[Inside React Query](https://tkdodo.eu/blog/inside-react-query)

<br>
