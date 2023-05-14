import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'

export type PostHeadInfoProps = {
  title: string
  date: string
  categories: string[]
}

const PostHeadInfo: FunctionComponent<PostHeadInfoProps> = function ({
  title,
  date,
  categories,
}) {
  return (
    <PostHeadInfoWrapper>
      <Title>{title}</Title>
      <PostData>
        <div>{categories.join(' / ')}</div>
        <div>{date}</div>
      </PostData>
    </PostHeadInfoWrapper>
  )
}

export default PostHeadInfo

const PostHeadInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 768px;
  margin: 0 auto;
  padding: 100px 0px 60px 0px;
  color: #ffffff;

  @media (max-width: 768px) {
    width: 100%;
  }
`

const Title = styled.div`
  margin-top: 20px;
  color: black;
  font-size: 45px;
  font-weight: 800;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`

const PostData = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: black;
  margin-top: 10px;
  font-size: 18px;
  font-weight: 700;
`
