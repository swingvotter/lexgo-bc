const Case = require("../../models/casesModel")



const createCase = async(req,res)=>{
    try{

    }catch(error){
          return res
      .status(500)
      .json({ success: false, message:error.message });
  }
}