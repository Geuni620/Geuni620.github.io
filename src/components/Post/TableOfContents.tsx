import React, { useEffect, useMemo } from 'react'
import ScrollSpy from 'hooks/scroll-spy'

import styled from '@emotion/styled'

interface TableOfContentElement {
  contents: any
}

const TableOfContents: React.FC<TableOfContentElement> = ({ contents }) => {
  useEffect(() => {
    const headers = Array.from(document.querySelectorAll('h1, h2, h3')).filter(
      (h: any) => h.id,
    )

    const toc = document.querySelector('#post-toc')
    new ScrollSpy(toc as HTMLElement, headers as HTMLElement[])
  }, [])

  return (
    <Layout>
      <Contents id="post-toc" dangerouslySetInnerHTML={{ __html: contents }} />
    </Layout>
  )
}

export default TableOfContents

const Layout = styled.aside`
  position: sticky;
  top: 0;
  right: 0;
  padding-top: 130px;
  margin-left: 5rem;
  overflow: auto;
`

const Contents = styled.div`
  position: sticky;
  border-left: 2px solid #ddd8d8;
  background-color: white;
  user-select: none;

  ul {
    color: gray;
    padding-left: 1rem;
    list-style: none;
    line-height: 24px;
    scale: 1;

    & .active {
      color: #0969da;
      background-color: #ddf4ff;
      font-weight: 700;
      border-radius: 5%;
      transform: scale(1.1);
    }
  }

  @media (max-width: 1300px) {
    display: None;
  }
`
