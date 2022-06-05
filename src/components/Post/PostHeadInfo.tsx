import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'

export type PostHeadInfoProps = {
  title: string
  date: string
  categories: string[]
}

const PostHeadInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 768px;
  /* height: 100%; */
  margin: 0 auto;
  padding: 60px 0;
  color: #ffffff;
`

const Title = styled.div`
  margin-top: 20px;
  color: black;
  font-size: 45px;
  font-weight: 800;
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
