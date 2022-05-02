export default function initLoginController(db) {
  const register = (request, response) => {
    if (request.cookies.userId) {
      response.redirect('/');
    } else {
      response.render('register', { errormsg: '' });
    }
  };

  const newUser = async (request, response) => {
    const { username } = request.body;
    const { password1 } = request.body;
    try {
      await db.User.create({
        username,
        password: password1,
      });
      let message;
      response.render('login', { message });
    } catch (err) {
      const errormsg = 'username already exist, please choose a different one';
      response.render('register', { errormsg });
    }
    // console.log(JSON.stringify(ifUserExist, null, 2));
  };

  const login = (request, response) => {
    response.render('login', { errormsg: '' });
  };

  const loginAttempt = (request, response) => {
    const { username } = request.body;
    const { password } = request.body;

    db.User.findOne({
      where: {
        username,
      },
    }).then((data) => {
      if (data === null) {
        const errmsg = 'username does not exist, would you like to create one';
        return response.render('login', { errormsg: errmsg });
      }
      if (data.password !== password) {
        const errmsg = 'incorrect password';
        return response.render('login', { errormsg: errmsg });
      }
      response.cookie('userId', username);
      return response.render('lobby', { username });
    });
  };

  return {
    register, newUser, login, loginAttempt,
  };
}
