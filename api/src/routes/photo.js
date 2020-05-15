const debug = require('debug')('routes:Photo');
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const wrapper = require('../middleware/wrapper');
const router = express.Router();
const { PHOTO } = require('../config/config');

cloudinary.config({
  cloud_name: PHOTO.CLOUD_NAME,
  api_key: PHOTO.API_KEY,
  api_secret: PHOTO.API_SECRET,
});

const storage = cloudinaryStorage({
  cloudinary,
  folder: 'Hypertube',
  allowedFormats: ['jpg', 'png'],
  transformation: [{ width: 500, height: 500, crop: 'limit' }],
});

const parser = multer({ storage });

router.post('/', parser.single('image'), async (req, res) => {
  debug('req.file', req.file);
  const image = {};
  image.url = req.file.url;
  image.id = req.file.public_id;
  debug(image);
  return res.status(200).json(image);
});

module.exports = router;
