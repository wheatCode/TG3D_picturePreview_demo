module.exports = {
  publicPath: '/labeling/',

  pluginOptions: {
    s3Deploy: {
      awsProfile: process.env.VUE_APP_S3D_AWS_PROFILE || 'default',
      registry: undefined,
      region: process.env.VUE_APP_S3D_REGION,
      bucket: process.env.VUE_APP_S3D_BUCKET,
      createBucket: false,
      staticHosting: false,
      assetPath: 'dist',
      assetMatch: '**',
      deployPath: '/labeling/',
      acl: 'public-read',
      pwa: false,
      enableCloudfront: true,
      cloudfrontId: process.env.VUE_APP_S3D_CLOUDFRONT_ID,
      cloudfrontMatchers: '/*',
      uploadConcurrency: 5,
      pluginVersion: '3.0.0',
    },
  },
};
