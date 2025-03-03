import React, { FunctionComponent, useEffect, useState } from 'react'
import styled from '@emotion/styled'
import ProfileImage from 'components/Main/ProfileImage'
import { Link } from 'gatsby'

const Header: FunctionComponent = function () {
  const [previousScrollY, setPreviousScrollY] = useState(0)
  const [visible, setVisible] = useState(true)

  const detectScrollDirection = () => {
    const currentScrollY = window.scrollY

    if (previousScrollY > currentScrollY) {
      //scroll up
      setVisible(true)
    } else if (previousScrollY < currentScrollY && 400 <= currentScrollY) {
      // scroll down
      setVisible(false)
    }

    setPreviousScrollY(window.scrollY)
  }

  useEffect(() => {
    window.addEventListener('scroll', detectScrollDirection)

    return () => window.removeEventListener('scroll', detectScrollDirection)
  }, [previousScrollY])

  return (
    <Background isVisible={visible}>
      <Wrapper>
        <Link to="/">
          <ProfileImage />
        </Link>
        <SpeechBubble>
          <StyledLink target="_blank" to="https://www.geuni.me/">
            블로그를 옮겼어요.
          </StyledLink>
        </SpeechBubble>
      </Wrapper>
    </Background>
  )
}

export default Header

interface VisibleProps {
  isVisible: boolean
}

const Background = styled.header<VisibleProps>`
  position: fixed;
  width: 100%;
  top: ${({ isVisible }) => (isVisible ? 0 : -70)}px;
  left: 0;

  color: #ffffff;
  backdrop-filter: blur(5px);
  box-shadow: rgb(0 0 0 / 8%) 0px 0px 8px;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};

  transition: top 0.5s ease 0s, opacity 0.5s ease 0s;
  z-index: 999;
`

const Wrapper = styled.div`
  position: relative;
  display: flex;
  margin: 0 auto;
  padding: 10px 60px;

  @media (max-width: 768px) {
    padding: 10px 20px;
  }
`

const SpeechBubble = styled.div`
  position: absolute;
  top: 2rem;
  left: 7rem;
  padding: 0.5rem 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  animation: float 2s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 20%;
    transform: translateY(-50%);
    border: 4px solid transparent;
    border-right-color: white;
    rotate: 10deg;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  @media (max-width: 768px) {
    left: 4.5rem;
  }
`

const StyledLink = styled(Link)`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #3182ce;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #2c5282;
  }
`
