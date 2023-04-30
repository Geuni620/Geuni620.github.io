import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { GatsbyImage } from 'gatsby-plugin-image'
import { graphql, useStaticQuery } from 'gatsby'

const ProfileImage: FunctionComponent = function () {
  const { file } = useStaticQuery(graphql`
    query {
      file(name: { eq: "profile-image" }) {
        childImageSharp {
          gatsbyImageData(width: 120, height: 120)
        }
      }
    }
  `)

  return (
    <ProfileImageWrapper
      image={file.childImageSharp.gatsbyImageData}
      alt="Profile Image"
    />
  )
}

export default ProfileImage

const ProfileImageWrapper = styled(GatsbyImage)`
  width: 50px;
  height: 50px;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
`
