const router = require('express').Router();
const { User, Post, Comment } = require('../models')
const withAuth = require('../utils/auth')


//renders homepage
router.get('/', async (req, res) => {

  try {
    const postData = await Post.findAll({
      include: [{
        model: User,
        attributes: ['name'],
      }],
    });
    const posts = postData.map((post) => post.get({ plain: true }));

    res.render('homepage', {
      posts,
      logged_in: req.session.logged_in
    })
  } catch (err) {
    res.status(500).json(err);
  }

});

//get single post
router.get('/post/:id', async (req, res) => {
 try{
  const postData = await Post.findByPk(req.params.id, {
    include: [
      {
        model: User,
        attributes: ['name'],
      },
      {
        model: Comment,
        attributes: ['id', 'comment', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['name']

        }
      }
    ]
});

const post = postData.get({plain: true});

res.render('individual-post', {
  post, 
  logged_in: req.session.logged_in

});

 }catch (err) {
  res.status(500).json(err);
 }

});


//when logged in user directed to dashboard 
router.get('/dashboard', withAuth, async(req, res) => {
  try{
    const userData = await User.findByPk (req.session.user_id, {
      attributes: {exlude: ['password']},
      include: [{ model: Post}],
    });
    const user = userData.get({ plain: true});
    res.render('dashboard',{
      ...user,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});



//login route
router.get('/login', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }
  res.render('login');
});


module.exports = router;

