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
      const checkUserUrl = 'http://localhost:3000/api/users/check-user/';
      try {
        // console.log('email being sent', JSON.stringify({ email: profile.email }))
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
          const createUserUrl = 'http://localhost:3000/api/users/create-user/';
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
          console.log('new userId: ', userId)
        } else {
          const userId = userExistsStatus.userId
          console.log('existing userId: ', userId)
        }

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  }
};
