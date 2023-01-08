import React, { FunctionComponent, useEffect, useState } from 'react'
import styled from '@emotion/styled'
import ProfileImage from 'components/Main/ProfileImage'

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
        <ProfileImage />
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

  @media (max-width: 768px) {
    /**@todo 작성할 것 */
  }
`

const Wrapper = styled.div`
  display: flex;
  margin: 0 auto;
  padding: 10px 60px;

  @media (max-width: 768px) {
    width: 100%;
    padding: 0 20px;
  }
`
