const debug = require('debug')('routes:comments');
const express = require('express');
const Comment = require('../models/Comment');
const router = express.Router();
const _ = require('lodash');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const checkComment = ((comment) => ((!comment.filmId || !comment.userName || !comment.text) ? false : true));

router.put('/', async (req, res) => {
  debug('lol');
  if (req.body.text && req.body.text.length > 200) req.body.text = req.body.text.substring(0, 200);
  const modifiedComment = await Comment.findByIdAndUpdate(req.body.id, { text: req.body.text, date: Date.now() });
  if (!modifiedComment) return res.status(404).send('The comment with the given id doesn\'t exists in the DB');
  res.send(modifiedComment);
});

router.post('/', async (req, res) => {
  if (checkComment(req.body)) {
    debug(req.body);
    if (req.body.text.length > 200) req.body.text = req.body.text.substring(0, 200);
    const newComment = new Comment(_.pick(req.body, [
      'filmId',
      'userName',
      'text',
    ]));
    await newComment.save();
    return res.status(200).send('Comment added');
  }
});

router.get('/:filmId', async (req, res) => res.status(200).send(await Comment.find({ filmId: req.params.filmId })));

router.delete('/', async (req, res) => {
  debug(req.body);
  const comment = await Comment.findByIdAndRemove(req.body.id);
  if (!comment) return res.status(404).send('The comment with the given id doesn\'t exists in the DB');
  res.send(comment);
});

module.exports = router;
