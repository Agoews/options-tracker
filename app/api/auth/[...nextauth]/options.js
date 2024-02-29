import GoogleProvider from "next-auth/providers/google";


export const options = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      const url = process.env.NEXTAUTH_URL
      const checkUserUrl = `${url}/api/users/check-user/`;
      console.log('checkUserUrl ', checkUserUrl)
      console.log('profile ', profile.email)
      try {
        const checkUserResponse = await fetch(checkUserUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: profile.email })
        });
        const userExistsStatus = await checkUserResponse.json();

        let userId = userExistsStatus.userId
        if (!userExistsStatus.userId) {
          const createUserUrl = `${url}/api/users/create-user/`;
          console.log('createUserUrl ', createUserUrl)

          const createUserResponse = await fetch(createUserUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: profile.email, name: profile.name })
          });
          if (!createUserResponse.ok) {
            console.log('Failed to create new user');
            return false;
          }

          const userData = await createUserResponse.json()
          const userId = userData.user.userid
        } else {
          const userId = userExistsStatus.userId
        }
        account.userId = userId
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  }
};
