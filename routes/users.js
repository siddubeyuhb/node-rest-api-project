const User = require("../models/User")
const router = require("express").Router();
const bcrypt = require("bcrypt")

//Update User
router.put("/:id", async(req,res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch(err){
                return res.status(500).json(err)
            }
        }
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("account has been updated")
        } catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(403).json("You can only update YOUR account")
    }
});

//Delete User
router.delete("/:id", async(req,res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){

        try{
            await User.findByIdAndDelete(req.params.id);
            return res.status(200).json("account has been deleted");
        } catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(403).json("You can only delete YOUR account");
    }
});

//Get a User
router.get("/:id", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        const{password, updatedAt, ...other} = user._doc
        res.status(200).json(other);
    }catch(err){
        res.status(500).json(err);
    }
});

//Follow a User
router.put("/:id/follow", async (req,res) =>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers:req.body.userId}});
                await currentUser.updateOne({$push:{following:req.body.id}});
                res.status(200).json("User has been followed");
            } else{
                res.status(403).json("You already follow this user")
            }
        } catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("Cant follow self")
    }
});

//Unfollow a user
router.put("/:id/unfollow", async (req,res) =>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers:req.body.userId}});
                await currentUser.updateOne({$pull:{following:req.body.id}});
                res.status(200).json("User has been unfollowed");
            } else{
                res.status(403).json("You dont follow this user");
            }
        } catch(err){
            res.status(500).json(err);
        }
    }else{
    res.status(403).json("Cant unfollow self")
    }
});

module.exports = router;