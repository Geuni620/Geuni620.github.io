---
date: '2024-12-25'
title: 'focus 이벤트 처리'
categories: ['개발']
summary: 'focus 이벤트 처리 방법'
---

[이전 글](https://geuni620.github.io/blog/2024/12/9/dom-event/)에서 한 가지 문제가 더 존재했다.  
바로 focus(이하 포커스)에 관련된 이벤트처리이다.

물류센터의 사용자들은 키보드와 마우스를 사용하지 않는다고 했다.  
대신, 바코드 스캐너에 의존한다.

나의 역할은 최대한 사용자들이 바코드스캐너로만 필요한 모든 동작을 할 수 있도록 지원하는 일이다.  
대표적인 것 중 하나가 Input에 포커스 되어있는 상태를 유지하는 것이다.

<br/>

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

useEffect의 dependency array로 isModalOpen을 추가한 뒤, 모달이 닫혔을 때도 포커스가 유지되도록 적용했다.

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

모달창에서 포커스가 잡히지 않는다. 😭

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

하지만 궁금하다.  
왜 requestAnimationFrame을 적용해야하는걸까..? 🤔

<br/>

사실 requestAnimationFrame만 가능한 것은 아니다.  
setTimeout도 가능하고, Promise.then를 사용해도 가능하다.

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
즉, 이 모든 함수는 자바스크립트 런타임 중, **Call Stack에서 즉시 처리할 수 없는 동작**이다.

Task Queue, Microtask Queue, Animation Queue를 통해 Call Stack(콜 스택)이 비었는지 이벤트루프가 확인한 후, 해당 Queue에서 사용 가능한 첫 번째 작업들을 콜 스택으로 이동해서 실행하는 것이다. 핵심은 콜 스택이 비워져야 Queue에 있는 스택들이 콜 스택으로 이동하는 것이다.

- Promise: Microtaks Queue
- setTimeout: Task Queue
- requestAnimationFrame: Animation Frame Queue

<br/>

### 3. 원인 분석 & 추측

사실 react-strap에서는 useEffect를 통한 focus를 적용하는 방법이 아닌, 권장하는 방법이 존재한다.  
바로 **onOpened 메서드를 사용하는 것**이다.

```TSX
<Modal
  isOpen={isOpen}
  toggle={toggle}
  onOpened={() => {
    // Function to be triggered on open
    inputRef.current?.focus();
  }}
>
 //...
</Modal>
```

Modal이 모두 렌더링 된 이후에 focus를 적용하면 되는 것이다.  
아래는 reactstrap 모달컴포넌트 소스코드 일부이다.

```JS
//...

class Modal extends React.Component {
  constructor(props) {
    //..
  }


 //...
  render() {
    const { unmountOnClose } = this.props;

    if (!!this._element && (this.state.isOpen || !unmountOnClose)) {
      //...

      return (
        <Portal node={this._element}>
          <div className={mapToCssModules(wrapClassName)}>
            <Fade
              {...modalAttributes}
              {...modalTransition}
              in={isOpen}
              onEntered={this.onOpened}
              onExited={this.onClosed}
              cssModule={cssModule}
              className={mapToCssModules(
                classNames(
                  'modal',
                  modalClassName,
                  this.state.showStaticBackdropAnimation && 'modal-static',
                ),
                cssModule,
              )}
              innerRef={innerRef}
            >
              {external}
              {this.renderModalDialog()}
            </Fade>
            {Backdrop}
          </div>
        </Portal>
      );
    }

    return null;
  }
}
```

reactstrap은 [Portal](https://github.com/reactstrap/reactstrap/blob/090bc1eeb19bcc269970151d330c6bc03f731635/src/Portal.js#L11)을 사용하여 모달을 DOM 트리의 다른 부분에 렌더링함으로써, 부모 요소의 스타일이나 레이아웃에 영향을 받지 않도록 분리할 수 있다.

[Fade](https://github.com/reactstrap/reactstrap/blob/090bc1eeb19bcc269970151d330c6bc03f731635/src/Fade.js#L42) 컴포넌트가 눈에 띄는데, 모달의 애니메이션 효과를 담당한다.

즉, useEffect를 통해 focus가 동작하지 않은 이유는, Portal나 Fade로 인해 렌더링 지연이 발생하여 useEffect가 실행될 때 input 요소가 아직 완전히 렌더링 되지 않았기 때문이라고 추측된다.

<br/>

### 4. performance + console.time

지금까지 내용을 확인하고 난 뒤, 여전히 몇 가지 '찝찝함'이 남았다.  
조금 더 명확하게 확인해보고 싶은데, 추측이 아닌 직접 눈으로 검증할 수 있는 방법은 없을까..?

<br/>

> 크롬 DevTools 중, performance을 이용해서 각 렌더링 시점을 알 수 있는 방법이 없을까?

이와 같은 고민을 하던 중, `console.time`을 활용하여 시작 시점과 종료 시점을 기록하면,  
performance 탭의 Timings 섹션에서 해당 로그를 확인할 수 있다는 사실을 알게 되었다.

먼저 위에서 예시로 사용했던 코드를 그대로 가져와서 console.time을 반영했다.

```TSX
export const ReactStrapModal: React.FC<ModalComponentProps> = ({
  isOpen,
  toggle,
  onConfirm,
  onReset,
  totalCount,
}) => {
  //...

  useEffect(() => {
    if (isOpen) {
      // # useEffct → ❌
      console.time('useEffect');
      inputRef.current?.focus();
      console.timeEnd('useEffect');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // # useEffect + requestAnimation → ✅
      requestAnimationFrame(() => {
        console.time('animationFrame');
        inputRef.current?.focus();
        console.timeEnd('animationFrame');
      });
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      onOpened={() => {
        // # onOpened → ✅
        console.time('opened');
        inputRef.current?.focus();
        console.timeEnd('opened');
      }}
    >
      <div className="min-w-[300px] rounded-lg bg-white p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            //..
            <input
              ref={(node) => {
                if (node) {

                  inputRef.current = node;

                  // # callback ref → ❌
                  console.time('callback-ref-focus');
                  node.focus();
                  console.timeEnd('callback-ref-focus');
                }
              }}
              onChange={onScannedValueChange}
              value={scannedValue}
              className="mt-2 w-full rounded border border-gray-300 p-2"
            />
          </div>
          //..
        </form>
      </div>
    </Modal>
  );
};
```

총 4 곳에 반영했다.

- useEffct → focus ❌
- useEffect + requestAnimation → focus ✅
- onOpened → focus ✅
- callback ref → focus ❌

단독으로 적용했을 때, useEffect + requestAnimationFrame와 onOpened는 focus가 잘 반영되고,  
나머지 useEffect만 사용했을 때와, callback ref는 focus가 반영되지 않았다.

<br/>

![](./onSearchList-rendering.png)

해당 부분은 onSearchList 함수를 호출하고 난 뒤, modal 렌더링이 시작되는 부분이다.

<br/>

![](./useEffect.png)

useEffect를 통한 focus를 시도했지만, Modal이 아직 렌더링 중이라, ref는 null이었을 것이다. → ❌

<br/>

![](./ref-rendering.png)

callback ref가 실행되었지만, Modal은 여전히 rendering 중이다.

<br/>

![](./modal-render-end.png)

드디어 모달이 모두 그려졌다.

<br/>

![](./requestAnimation-focus.png)

콜 스택이 빈 뒤에 이벤트 루프가 requstAnimationFrame을 콜 스택에 반영했을 것이다.

<br/>

![](./opened.png)

참고로 onOpened는 가장 마지막에 실행되었다.

<br/>

### 마무리

### 참고자료
