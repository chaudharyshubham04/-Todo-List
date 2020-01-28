const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash"); 
const mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); 

const itemSchema={
	name:String
};
const Item=mongoose.model("Item",itemSchema);

 item1=new Item({
	name:"Buy Food"
});
 item2=new Item({
	name:"Cook Food"
});
 item3=new Item({
	name:"Eat Food"
});
/*item1.save();
item2.save();
item3.save();  */ 


const defaultItems=[item1,item2,item3];


const listSchema={
	name:String,
	items:[itemSchema]
};

const List=mongoose.model("List",listSchema);

 

app.get("/", function(req, res){

	Item.find({},function(err,foundItems){
		if(err){
			console.log(err);
		} else {
			
			if(foundItems.length===0){

              Item.insertMany(defaultItems,function(err){
	           if(err){
		        console.log(err);}
	           else {
		        console.log("items is saved successfully ");
	                 }
              }); 
              res.redirect("/");
			
			                }
			else{
              res.render("list",{ListTitle:"Today",newListItem:foundItems});
			    }
		}
	});
  
  

});

app.post("/",function(req,res){
	const itemName=req.body.newItem;
	const listName=req.body.button;

	var item=new Item({
	 	name:itemName
	});
	
	if(listName==="Today"){ 
        item.save();
	    res.redirect("/");
	}else{

   List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
   });
   
   } 
});

app.post("/delete",function(req,res){
	var itemId=req.body.checkbox;
	var listName=req.body.listName; 
	if(listName==="Today"){
	Item.findByIdAndRemove(itemId,function(err){
		if(err){
			console.log(err);
		} else {
			console.log("item is deleted");
		       }
	});
	res.redirect("/"); 
	}
	else{

     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},function(err,foundList){
     	if(!err){
     		res.redirect("/"+listName);
     	}
     });		
	} 
});


app.get("/:customListName",function(req,res){
	const customListName=_.capitalize(req.params.customListName);
	List.findOne({name:customListName},function(err,foundList){
		if(!err){
			if(!foundList){
				const list=new List({
                   name:customListName,
                   items:defaultItems
				});
				list.save();
				res.redirect("/"+ customListName);
			              }
			else{
                res.render("list",{ListTitle:foundList.name,newListItem:foundList.items});
			    }              
		       }
	});
});


app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
