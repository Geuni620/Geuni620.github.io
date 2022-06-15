### 개인 블로그 만들기

[참고자료](https://www.inflearn.com/course/gatsby-%EA%B8%B0%EC%88%A0%EB%B8%94%EB%A1%9C%EA%B7%B8/dashboard)

---

<!-- AUTO-GENERATED-CONTENT:START (STARTER) -->

<span>이슈 정리</span>

<details>
<summary>220602_slug 에러</summary>
`Cannot read properties of undefined (reading 'slug')`
'Error in function eval in ./src/components/Main/PostList.tsx:55'
다음과 같은 에러메세지가 떴음.

현재 blog를 만들고 있고 썸네일이 없는게 개인적으론 더 깔끔하다고 생각했음.
그래서 썸네일을 자체적으로 지운 상태로 작업 중.

```
thumbnail {
  childImageSharp {
  gatsbyImageData(width: 768, height: 400)
  }
}
```

다음과 같은 내용이 query에 속해있어서 에러가 발생했음.

</details>

<details>
<summary>220616_자동배포 설정 에러</summary>
인프런에 나와있는 강의는 main을 build하고 dev branch를 관리함.
하지만 main을 build 하고나니, repo에 들어왔을 때 build 파일명으로 먹히는데 깔끔하지 못했음.

그래서 gh-pages를 build 하고, main을 블로그 관리용으로 쓰고 싶음.
하지만, 배포과정이 까다로움,,, 무엇때문인지 모르겠지만 main에 push 한 후 빌드과정에서 에러가 발생함.

현재는 수정중,,, 작업은 자동배포로 설정해보고 있음.

</details>
