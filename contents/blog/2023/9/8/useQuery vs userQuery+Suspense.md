---
date: '2023-09-08'
title: 'useQuery와 useQuery+Suspense 중 어떤게 loading UI를 사용자에게 더 빨리 보여줄 수 있을까?'
categories: ['react-query', 'tanstack-query', 'react']
summary: '어떤 게 사용자에게 더 빠르게 Loading UI라도 먼저 보여줄 수 있을까?'
---

> useQuery에선 isLoading을 return 해준다.
> Suspense에서도 Promise가 pending 상태라면, fallback을 보여준다.
> 그럼 useQuery만 사용했을 때와, useQuery와 Suspense를 사용했을 때 어떤 게 더 빨리 Loading UI를 사용자에게 보여줄 수 있을까?

<br>

하나의 가정이 필요하다.

- 네트워크 속도 동일.

<br>

처음 이 주제에 대해 궁금하기 시작한 건 동료개발자분 덕이다.
내가 만들고 있는 서비스에서 Nav에 user가 sign-up할 때 작성했던 데이터를 불러와서 보여줘야하는 부분이 있었다.
UserInfoNav라는 컴포넌트에 작성했는데, Suspense로 감싸서 fallback ui를 적용했는데, 다음과 같았다.

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
- 그 이유는, Suspense로 감싸주었을 때 fallback ui를 보여주어야하는데, 이게 동작하지 않는다.
- 해당 부분에서 `useGiRokEInfoGetQuery` hooks는 서버에 데이터를 요청하기 때문에 Promise를 return하는데도 불구하고 동작하지 않는다.
- **아직 원인 파악 중이다...**

<br>

어쨌든, 위 내용을 동료개발자분께 공유드리는데, 동료개발자 분이 Suspense를 사용하는 이유가 "fallback ui를 보여주기 위해서'만' 있는 건 아니다."  
"data의 fetching 시점을 더 빨리 가져가기 위함이다."라고 말씀하신게 흥미를 불러일으켰다.

<br>

지금 이 글은 제목에서도 적혀있듯, 'useQuery와 useQuery+Suspense 중 어떤게 loading UI를 사용자에게 더 빨리 보여줄 수 있을까?' 이다.
처음 나의 흥미를 불러 일으킨, 'data의 fetching 시점은 어떤게 더 빠를까?'였는데, 탐구하다보니, 기준을 위와 같이 잡게 됐다.
당시 탐구할 땐 같은 주제라고 생각했는데, 지금와서 생각해보니 data의 fetching 시점은 다른 주제인 것 같다.
data fetching 시점은 useQuery를 사용하기 때문에 어쨌든 동일할 것이라는 생각이 든다. (개인적인 생각이다)
그리고 탐구하다보니 알게 된 사실인데, react-query가 존재하기 전에는 useEffect를 사용해서 data fetching 했다.(고 한다.)
'useEffect와 useQuery 둘 중 data의 fetching 시점은 어떤게 더 빠를까?'  
useEffect와 useQuery 내부 동작이 어떤지는 찾아보지 않아서 잘 모르겠지만, 둘이 실행되는 시점은 **동일**하다.
즉, mount 된 후에 useQuery도 useEffect도 실행된다.

<br>

### Suspense

다시 본론으로 돌아와서, useQuery만 사용했을 때와 useQuery+Suspense를 사용했을 때 어떤게 더 빠를까?
Suspense 내부 코드를 먼저 확인해보고 싶었다.

[Data fetching with React Suspense](https://blog.logrocket.com/data-fetching-react-suspense/)

위 글에선 Suspense 내부 동작을 직접 구현해 놓은 코드가 있다.

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
- 여기서 핵심은 ErrorBoundary로 error를 throw하듯이, suspense로 Promise를 throw하고 Suspense에서 Promise를 받아서 상태를 확인한다는 것이다.

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

### 결론

'useQuery와 useQuery+Suspense 중 어떤게 loading UI를 사용자에게 더 빨리 보여줄 수 있을까?'

결국 **Suspense로 감싸주었을 때가 더 빠를 것이라고 추측**할 수 있다.
추측컨데, 다음과 같이 동작할 것이라고 생각된다.

- Suspense를 감싼 컴포넌트가 있다.
- 컴포넌트 상단에서부터 코드를 쭉 읽어간다.
- 약 5줄 쯤에 useQuery를 만난다.
- useQuery promise를 throw한다.
- suspense에서 promise를 받아서 pending 상태인지 확인한다.
- pending 상태라면, fallback ui를 보여준다.

<br>

만약 useQuery만 사용한다면 다음과 같을 것이다.

- 컴포넌트 상단에서부터 코드를 쭉 읽어간다.
- useQuery를 만나도 일단 내려간다.
- 컴포넌트가 모두 그려진 후에 useQuery가 실행된다.

<br>

두 과정을 비교해봤을 때, 큰 차이는 없을 것이라고 생각되지만, useQuery + suspense를 사용했을 때가 미세하게(정말정말) 더 빠를 것이라고 생각된다.

<br>

### 참고자료

suspense
[토스ㅣSLASH 21 - 프론트엔드 웹 서비스에서 우아하게 비동기 처리하기](https://youtu.be/FvRtoViujGg?si=rixcZx7yBijQ7Orq)
[sebmarkbage SynchronousAsync.js](https://gist.github.com/sebmarkbage/2c7acb6210266045050632ea611aebee)

<br>

react-query
[Inside React Query 번역본](https://velog.io/@hyunjine/Inside-React-Query)  
[Inside React Query](https://tkdodo.eu/blog/inside-react-query)
