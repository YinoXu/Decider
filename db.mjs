// 1ST DRAFT DATA MODEL
import mongoose from 'mongoose';

// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more lists
const User = new mongoose.Schema({
  // username provided by authentication plugin
  // password hash provided by authentication plugin
  lists:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }]
});

// an item (or group of the same items) in a grocery list
// * includes the quantity of this item (multiple of the same item does not 
//   require additional Item documents; just increase the quantity!)
// * items in a list can be crossed off
const Item = new mongoose.Schema({
  name: {type: String, required: true},
  weight: {type: Number, min: 0, required: true},
  color: {type: String, default: 'white', required: true}
}, {
  _id: true
});

// a grocery list
// * each list must have a related user
// * a list can have 0 or more items
const List = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: {type: String, required: true},
  createdAt: {type: Date, required: true},
  items: [Item]
});

// TODO: add remainder of setup for slugs, connection, registering models, etc. below