export default {
  providers: [
    {
      // The Convex deployment itself is the JWT issuer for @convex-dev/auth.
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
