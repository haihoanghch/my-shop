import express from "express"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const app = express()
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

app.post("/mock-payment", async (req,res)=>{
  const { orderCode } = req.body

  const { data:order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_code",orderCode)
    .single()

  if(!order) return res.sendStatus(404)

  if(order.status==="paid")
    return res.json({message:"Already paid"})

  await supabase.from("orders")
    .update({
      status:"paid",
      paid_at:new Date(),
      payment_ref:"MOCK_"+Date.now()
    })
    .eq("id",order.id)

  const { data:items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id",order.id)

  for(let item of items){
    await supabase.rpc("decrease_stock",{
      p_id:item.product_id,
      qty:item.quantity
    })
  }

  res.json({success:true})
})

app.listen(3000,()=>console.log("Server running at 3000"))
