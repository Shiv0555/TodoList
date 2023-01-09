
const express = require("express");
const bodyParse = require("body-parser");
const mongoose = require("mongoose");
const date =require(__dirname + "/date.js");
const _=require("lodash");
const app= express();
app.use(express.static("public"));
mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://Shivraj0555:shiv555@cluster0.e6xcoro.mongodb.net/todolistDB');
const itemsSchema ={
  name : String
};
const Iteam = mongoose.model("Iteam" , itemsSchema);

const iteam1 = new Iteam({
  name :"Wel-come to todolist"
});
const iteam2 = new Iteam({
  name :"Hit + button to add todolist"
});

const iteam3 = new Iteam({
  name :"Hit <-- to delete to todolist"
});

const defaultIteam = [iteam1 , iteam2, iteam3];
const listSchema = {
  name : String ,
  iteams : [itemsSchema]
};
const List = mongoose.model("list" , listSchema);
app.set('view engine','ejs');
app.use(bodyParse.urlencoded({extended : true}));
app.get("/" , function(req,res){
let day = date.getDate();
Iteam.find({}, function(err,foundeiteam){
if(defaultIteam.length === 0){
  Iteam.insertMany(defaultIteam  , function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully saved Defauly items to DB");
    }
  });
  res.redirect("/");
}
else{
    res.render("list" , {listTitle : "Today" , newListItems : foundeiteam});
}
});

});


app.get("/:customsParamsName" , function(req,res){
    const param = _.capitalize(req.params.customsParamsName) ;
  List.findOne({name : param} , function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name : param ,
          iteams : defaultIteam
        });
        list.save();
        res.redirect("/" + param)
      }
    else{
        res.render("list" , {listTitle : foundList.name , newListItems :foundList.iteams });
    }
    }
  });
  });
  app.post("/" , function(req,res){

   const itemName = req.body.newItem ;
   const listName = req.body.list ;

   const iteam = new Iteam({
     name : itemName
   });
   if(listName == "Today"){
     iteam.save();
     res.redirect("/");
   }
   else{
     List.findOne({name : listName} , function(err, foundList){
       foundList.iteams.push(iteam);
       foundList.save();
       res.redirect("/" + listName);
     });
   }
  });


app.post("/delete" , function(req,res){
const chechboxIteam = req.body.checkbox;
const listName = req.body.listName ;
if(listName==="Today"){
  Iteam.findByIdAndRemove(chechboxIteam, function(err){
    if(!err){
      // console.log("Successfully deleted chechboxIteam");
        res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull : {iteams : {_id :chechboxIteam}}}, function(err){
    if(!err){
      res.redirect("/" + listName);
    }

  });
}


});







app.listen(3000, function(){
console.log("server is sarted on port 3000");
});
