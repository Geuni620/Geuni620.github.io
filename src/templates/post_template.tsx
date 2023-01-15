import React, { FunctionComponent } from 'react'
import { graphql } from 'gatsby'
import styled from '@emotion/styled'

import Template from 'components/Common/Template'
import PostHead from 'components/Post/PostHead'
import PostContent from 'components/Post/PostContent'
import CommentWidget from 'components/Post/CommentWidget'
import { PostFrontmatterType } from 'types/PostItem.types'
import TableOfContents from 'components/Post/TableOfContents'

type PostTemplateProps = {
  data: {
    allMarkdownRemark: {
      edges: PostPageItemType[]
    }
  }
  location: {
    href: string
  }
}

export type PostPageItemType = {
  node: {
    html: string
    tableOfContents: string
    frontmatter: PostFrontmatterType
  }
}

const PostTemplate: FunctionComponent<PostTemplateProps> = function ({
  data: {
    allMarkdownRemark: { edges },
  },
  location: { href },
}) {
  const {
    node: {
      html,
      tableOfContents,
      frontmatter: { title, summary, date, categories },
    },
  } = edges[0]

  return (
    <Template title={title} description={summary} url={href}>
      <Layout>
        <Post>
          <PostHead title={title} date={date} categories={categories} />
          <PostContent html={html} />
        </Post>
        <TableOfContents contents={tableOfContents} />
      </Layout>

      <CommentWidget />
    </Template>
  )
}

export default PostTemplate

const Layout = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
`

const Post = styled.div`
  /* for Layout */
`

export const queryMarkdownDataBySlug = graphql`
  query queryMarkdownDataBySlug($slug: String) {
    allMarkdownRemark(filter: { fields: { slug: { eq: $slug } } }) {
      edges {
        node {
          html
          tableOfContents
          frontmatter {
            title
            summary
            date(formatString: "YYYY.MM.DD.")
            categories
          }
        }
      }
    }
  }
`
