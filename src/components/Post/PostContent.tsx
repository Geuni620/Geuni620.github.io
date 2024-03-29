import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'

interface PostContentProps {
  html: string
}

const MARGIN_BOTTON = '1.5rem'

const MarkdownRenderer = styled.div`
  // Renderer Style
  display: flex;
  flex-direction: column;
  width: 768px;
  margin: 0 auto;
  padding-bottom: 50px;
  word-break: break-all;

  // Markdown Style
  font-size: 18px;
  font-weight: 400;

  // Apply Padding Attribute to All Elements
  p {
    padding: 3px 0;
    margin-bottom: ${MARGIN_BOTTON};
    line-height: 1.6em;
  }

  // Adjust Heading Element Style
  h1,
  h2,
  h3 {
    font-weight: 800;
    margin-bottom: ${MARGIN_BOTTON};
  }

  * + h1,
  * + h2,
  * + h3 {
    margin-top: 0.5rem;
  }

  hr + h1,
  hr + h2,
  hr + h3 {
    margin-top: 0;
  }

  h1 {
    font-size: 50px;
  }

  h2 {
    font-size: 40px;
  }

  h3 {
    font-size: 30px;
  }

  // Adjust Quotation Element Style
  blockquote {
    padding: 20px;
    border-left: 5px solid #a3aaae;
    font-weight: 400;
    font-style: normal;
    line-height: 28px;
    font-size: 18px;
    color: #000;
    background-color: #f7f7f7;
    margin-bottom: ${MARGIN_BOTTON};

    p {
      margin: 10px 0;
    }
  }

  ol,
  ul {
    margin-bottom: ${MARGIN_BOTTON};
    margin-left: 20px;
  }

  // Hide markers for list items with checkboxes
  ul > li:has(input[type='checkbox']) {
    list-style: none;
  }

  // 체크박스 스타일일 경우 margin-left 0으로 간격 유지
  .contains-task-list {
    margin-left: 0;
  }

  li {
    margin-bottom: 0.5em;
  }

  // Adjust Horizontal Rule style
  hr {
    border: 1px solid rgb(233, 236, 239);
    margin-bottom: 48px;
  }

  // Adjust Link Element Style
  a {
    color: #0687f0;
    font-weight: 500;
    transition: all 0.3s ease-in-out;
  }

  a:hover {
    text-decoration: underline;
  }

  pre[class*='language-'] {
    margin: 0 0 30px 0;
    padding: 15px;
    font-size: 15px;

    /* ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.5);
      border-radius: 3px;
    } */
  }

  code[class*='language-'],
  pre[class*='language-'] {
    tab-size: 2;
    font-size: 14px;
  }

  li,
  p {
    code {
      color: #eb5757;
      background-color: hsla(44, 6%, 50%, 0.15);
    }
  }

  figcaption {
    font-size: 14px;
    margin-top: 5px;
    text-align: center;
    color: #888;
  }

  p {
    strong {
      font-weight: 700;
    }
  }

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    vertical-align: middle;

    margin-right: 5px;
  }

  @media (max-width: 768px) {
    width: 100%;
    line-height: 1.6;
    font-size: 14px;

    h1 {
      font-size: 23px;
    }

    h2 {
      font-size: 20px;
    }

    h3 {
      font-size: 17px;
    }

    img {
      width: 100%;
    }

    hr {
      margin: 50px 0;
    }
  }
`

const PostContent: FunctionComponent<PostContentProps> = function ({ html }) {
  return <MarkdownRenderer dangerouslySetInnerHTML={{ __html: html }} />
}

export default PostContent
