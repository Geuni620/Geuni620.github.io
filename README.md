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

<!-- AUTO-GENERATED-CONTENT:END -->
