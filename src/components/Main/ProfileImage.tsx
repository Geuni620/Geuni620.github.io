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
    <React.Fragment>
      <ProfileImageWrapper
        image={file.childImageSharp.gatsbyImageData}
        alt="Profile Image"
      />
    </React.Fragment>
  )
}

export default ProfileImage

const ProfileImageWrapper = styled(GatsbyImage)`
  width: 50px;
  height: 50px;
  padding: 5px;
  display: flex;
  justify-content: center;
  border-radius: 50%;
  isolation: isolate;
`
