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

사실 requestAnimationFrame만 가능한 것은 아니다.  
setTimeout도 가능하고, Promise를 사용해도 가능하다.

```TSX
// # promise → ✅
useEffect(() => {
  Promise.resolve().then(() => {
    inputRef.current?.focus();
  });
}, []);

// # setTimeout → ✅
useEffect(() => {
  setTimeout(() => {
    inputRef.current?.focus();
  }, 0);
}, []);
```

눈치빠른 사람들은 알겠지만, useEffect 실행 시, 사용된 함수들은 모두 Web API이다.  
즉, 이 모든 함수는 자바스크립트 런타임 중, **Call Stack에서 즉시 처리할 수 없는 동작(=스택)**들이다.  
Task Queue, Microtask Queue, Animation Queue를 통해 Call Stack이 비었는지 이벤트루프가 확인한 후, 해당 Queue에서 사용 가능한 첫 번째 작업들을 호출 스택으로 이동해서 실행하는 것이다. 핵심은 Call Stack이 비워져야 Queue에 있는 스택들이 호출스택으로 이동하는 것이다.

- Promise: Microtaks Queue
- setTimeout: Task Queue
- requestAnimationFrame: Animation Frame Queue

<br/>

### 4. react-strap의 내부는 어떻게 동작하길래?

react-strap은 어떤 동작들이 있길래, useEffect만으로 실행이 안되는걸까?  
궁금해서 chatGPT에게 간략히 요약을 부탁해봤다.

<br/>

### 마무리

### 참고자료
