export default function initLobbyController(db) {
  const index = (request, response) => {
    if (request.cookies.userId !== '')
    { response.render('lobby'); }
    else { response.render('login'); }
  };

  const createRoom = async (request, response) => {
    const player = request.cookies.userId;
    const { opponent } = request.body;

    // check if invited exist or not
    try {
      await db.User.findOne({
        where: {
          username: opponent,
        },
      }).then((data) => {
        if (data ? console.log(`${data.username} exist`) : console.log('user does not exist'));
      });
    } catch (err) {
      console.log('user does not exist');
    }
  };
  return { index, createRoom };
}
