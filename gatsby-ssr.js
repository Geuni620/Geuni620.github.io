const React = require('react')

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    React.createElement('meta', {
      key: 'google-adsense-account',
      name: 'google-adsense-account',
      content: 'ca-pub-9901489090188954',
    }),
  ])
}
