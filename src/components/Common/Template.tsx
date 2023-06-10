import React, { FunctionComponent, ReactNode } from 'react'
import styled from '@emotion/styled'
import GlobalStyle from 'components/Common/GlobalStyle'
import { Helmet } from 'react-helmet'
import Footer from 'components/Common/Footer'
import Header from 'components/Main/Header'

type TemplateProps = {
  title: string
  description: string
  url: string
  image?: string
  children: ReactNode
}

const Template: FunctionComponent<TemplateProps> = function ({
  title,
  description,
  url,
  image,
  children,
}) {
  return (
    <Container>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html;charset=UTF-8" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={title} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:site" content="@Geuni620" />
        <meta name="twitter:creator" content="@Geuni620" />

        <meta
          name="google-site-verification"
          content="bHJqVdOg6rrFDK-dWGOElA4Egv3IPQlc-COuY76j678"
        />
        <meta
          name="naver-site-verification"
          content="1c3c437586a7b1a24609a56a8bf7adbb6ba019c2"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff"></meta>

        <html lang="ko" />
      </Helmet>

      <GlobalStyle />
      <Header />
      {children}
      <Footer />
    </Container>
  )
}

export default Template

const Container = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;

  @media (max-width: 768px) {
    width: 90%;
    margin: 0 auto;
  }
`
