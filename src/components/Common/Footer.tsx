import styled from '@emotion/styled'

const Footer = () => {
  return (
    <Wrapper>© {new Date().getFullYear()} Geuni, Powered By Gatsby.</Wrapper>
  )
}

const Wrapper = styled.footer`
  display: grid;
  place-items: center;
  margin-top: auto;
  padding: 70px 0;
  color: gray;
  font-size: 15px;
  text-align: center;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 50px 0;
  }
`

export default Footer
