import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { IGatsbyImageData } from 'gatsby-plugin-image'
import ProfileImage from 'components/Main/ProfileImage'

type IntroductionProps = {
  profileImage: IGatsbyImageData
}

const Introduction: FunctionComponent<IntroductionProps> = function ({
  profileImage,
}) {
  return (
    <Background>
      <Wrapper>
        <ProfileImage profileImage={profileImage} />
        <Title>이근휘블로그</Title>
      </Wrapper>
    </Background>
  )
}

export default Introduction

const Background = styled.div`
  width: 100%;
  background-image: linear-gradient(60deg, #29323c 0%, #485563 100%);
  color: #ffffff;
`

const Wrapper = styled.div`
  display: flex;
  margin: 0 auto;
  padding: 10px 50px;

  @media (max-width: 768px) {
    width: 100%;
    padding: 0 20px;
  }
`

const Title = styled.div`
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5px;
  font-size: 30px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 25px;
  }
`
