---
date: '2024-12-25'
title: 'focus 이벤트 처리'
categories: ['개발']
summary: 'focus 이벤트 처리 방법'
---

[이전 글](https://geuni620.github.io/blog/2024/12/9/dom-event/)에서 한 가지 문제가 더 존재했다.  
바로 focus(이하 포커스)에 관련된 이벤트처리이다.

물류센터의 사용자들은 대체로 바코드 스캐너를 사용한다고 했다.  
키보드와 마우스가 가까운 위치에 놓여있지 않다.  
즉, Input에 포커스 되어있는 상태를 유지하는게 중요했다.

<br/>

<small>예시는 이전 글에서 첨부했던 예시와 동일합니다.</small>

### 1. useEffect + Ref

처음 회사업무를 진행할 당시엔, 회사에서 이와 같은 코드를 사용하고 있어서 그대로 차용했었다.

```TSX
// App.tsx
export const App = () => {
   //...
  useEffect(() => {
    // 모달이 닫힐 때 포커스 유지
    if (!isModalOpen) {
      inputRef.current?.focus();
    }
  }, [isModalOpen]);

  return (
    //...
  );
};

// Modal.tsx
export const ModalComponent: React.FC<ModalComponentProps> = ({
  toggle,
  onConfirm,
  onReset,
  totalCount,
}) => {


  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    //...
  );
};

```

useEFfect의 dependency array로 isModalOpen을 추가한 뒤, 모달이 닫혔을 때도 포커스가 유지되도록 적용했다.

![](./effect-ref-normal.gif)

원하는대로 잘 동작하는 듯하다.

<br/>

하지만 회사에선 모달창을 [reactstrap](https://reactstrap.github.io/?path=/story/home-installation--page)이라는 부트스트랩 기반의 컴포넌트를 사용한다.  
만약 reactstrap 모달 컴포넌트를 적용하면 어떻게 될까?

```TSX
// applying reactstrap
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

export const ModalComponent: React.FC<ModalComponentProps> = ({
  //...
}) => {
  //..

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div>
            <span>총 주문 수량: {totalCount}</span>
          </div>
          <input
            ref={inputRef}
            onChange={onScannedValueChange}
            value={scannedValue}
            className="mt-2 w-full rounded border border-gray-300 p-2"
          />
        </ModalBody>
        <ModalFooter>
          <Button type="submit">확인</Button>
          <Button type="button" onClick={handleCancel}>
            취소
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
```

![](./effect-ref-react-strap.gif)

모달창에서 포커스가 동작하지 않는다. 😭

<br/>

### 2. useEffect + Ref + requestAnimation

이전 글에서도 언급했지만, 회사에서 급하게 일정이 잡힌 백로그라 원인을 파악하고 하나씩 개선하기보단, 일단 동작하도록 만드는게 우선되었다.  
그래서 여러 방법을 찾아보다가, chatGPT에서 언급해준 [requestAnimationFrame](https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame)을 적용하니 원하는대로 동작했다.

현재 회사코드는 아래와 동일하게 작성되어있다.

```TSX
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

export const ModalComponent: React.FC<ModalComponentProps> = ({
  isOpen,
  toggle,
  onConfirm,
  onReset,
  totalCount,
}) => {

  useEffect(() => {
    // requestAnimation
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div>
            <span>총 주문 수량: {totalCount}</span>
          </div>
          <input
            ref={inputRef}
            onChange={onScannedValueChange}
            value={scannedValue}
            className="mt-2 w-full rounded border border-gray-300 p-2"
          />
        </ModalBody>
        <ModalFooter>
          <Button type="submit">확인</Button>
          <Button type="button" onClick={handleCancel}>
            취소
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
```

<br/>

하지만 궁금하다.  
왜 requestAnimationFrame을 적용해야하는걸까..? 🤔

<br/>

### 3. requestAnimationFrame이 뭐지?

<small>블로그 글의 주된 내용이 아니라 간략히 설명만 먹어놓을게요.</small>

[requestAnimationFrame](https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame)은 브라우저 렌더링 시, 리페인트 바로 전에 브라우저가 애니메이션을 업데이트를 지정한 함수를 호출하도록 요청한다.

특이점은 자바스크립트 이벤트 루프를 살펴봤을 때, task queue의 종류가 크게 3가지 있다는 점이고,  
이 중에 requestAnimation이 포함되어있다는 것이다.

크게 종류가 3가지 존재하고, 각각의 우선순위도 다르다.  
Microtask queue > Animation Frames > Task queue 순이다.

그럼, requestAnimation이 아니라, microtask queue와 Task queue에 해당하는 함수로 감쌌을 때도 동일하게 focus가 유지될까?

### 4. react-strap의 내부는 어떻게 동작하길래?

<br/>

### 마무리

### 참고자료
