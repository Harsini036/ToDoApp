//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb+srv://Neofragon1:Neohar678@cluster1.buvlfpj.mongodb.net/todolistDB');
}
 
// Creating a schema (similar to collection)
const itemsSchema = new mongoose.Schema({
  name: String
});
 
// Creating a model under the schema//
const Item = mongoose.model("Item", itemsSchema);
 
const item1 = new Item({
  name : "To complete course 1"
});
//item1.save();
const item2 = new Item({
  name : "To complete course 2"
});
//item2.save();
const item3 = new Item({
  name : "To complete course 3"
});
//item3.save();

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);


/* Item.insertMany([item1,item2,item3]).then (function () {
  console.log("Successfully saved all lists");
}) .catch(function (err) {
  console.log(err);
});   */


/* Item.deleteMany({name:"To complete course 1"})
      .then(res=>{
        //mongoose.connection.close();
        console.log("Successful deletion!");
      })
      .catch(err=>{
        console.log(err);
});  */ 

/* Item.find()
  .then(function(items){
    //mongoose.connection.close();
    console.log("Items name");
    items.forEach((item)=>{
      console.log(item.name);
    });
  })
  .catch(function(err){
    console.log(err);
  }); */

app.get("/", function(req, res) {
  Item.find()
  .then(function(items){
    if(items.length===0){
      Item.insertMany([item1,item2,item3]).then (function () {
        console.log("Successfully saved all lists");
      }) .catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    }
    else{
      const day = date.getDate();
      res.render("list", {listTitle: day, newListItems: items});

    }
    //mongoose.connection.close();
    
  })
  .catch(function(err){
    console.log(err);
  });
  

});

app.post("/", function(req, res){
  const day = date.getDate();
  const newItem = req.body.newItem;
  const listName = req.body.list;
 
  const newItemDB = new Item({
    name : newItem
  });

  if(listName===day){
    newItemDB.save();
    res.redirect("/");  
  }else{
    List.findOne({name:listName})
    .then(result=>{
      result.items.push(newItemDB);
      result.save();
      //console.log(result.name +":" +result.items);
      //console.log("/"+listName);
      res.redirect("/"+listName);
    })
    .catch(err=>{
      console.log(err);
  });
  }


});

app.post("/delete",function(req, res){

  //console.log(req.body);
  const day = date.getDate();
  const deleteId = req.body.checkbox;
  const listName = req.body.listName;
  //console.log(deleteId);
  if(listName===day){
    Item.deleteOne({_id : deleteId})
  .then(res=>{
    //mongoose.connection.close();
    console.log("Successful deletion of checked item!");
  })
  .catch(err=>{
    console.log(err);
});
res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{
      $pull:{items:{_id:deleteId}}
    })
    .then(result=>{
    console.log("Successful deletion of item from array");
    res.redirect("/"+listName);
    }
    )
    .catch(err=>{
      console.log(err);
    });
  }
  

});

app.get("/:route1",(req,res1)=>{
  const route1 = _.capitalize(req.params.route1);
  List.findOne({name:route1})
  .then(res=>{
    
      if(!res){
          //console.log("Doesn't exist");
          const list = new List({
            name : route1,
            items : [item1,item2,item3]
        });
        
        list.save();
        res1.redirect("/"+route1);
        //res1.render("list",{listTitle:res.name,newListItems:res.items});
      }
      else{
        console.log("exist");
        console.log(res.items);
        res1.render("list",{listTitle:res.name,newListItems:res.items});
      }
  })
  .catch(err=>{
    console.log(err);
});
  
});


app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(3000, function() {
  console.log("Server started on port 3000");
});