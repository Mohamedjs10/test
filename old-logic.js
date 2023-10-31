//* index.js (Home)
useEffect(() => {
  if (userInfo === null) {
    router.isReady &&
      getUserInfo(phone).then((res) => {
        // will not happen as the user can't reach this ui in mobile unless he is exist
        if (res.message === "client does not exist" && res.statusCode == 400) {
          // add user
          addUser(phone, nationalId, name).then(() => {
            // get user info
            getUserInfo(phone).then((res) => {
              // dispatch user info to redux
              dispatch(userInfoActions.update(res));
            });
          });
        } else {
          dispatch(userInfoActions.update(res));
        }
      });
  }
}, [router.isReady]);
