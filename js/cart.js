import { supabase, formatMoney } from "./supabase.js"

const BANK_CODE = "970436"        // ví dụ Vietcombank
const BANK_ACCOUNT = "0123456789"

let cart = JSON.parse(localStorage.getItem("cart")) || []
let discountPercent = 0
let finalTotal = 0

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart))
}

function updateBadge(){
  const count = cart.reduce((a,b)=>a+b.qty,0)
  document.getElementById("cartCount").innerText = count
}

export function addToCart(id,name,price){
  const found = cart.find(p=>p.id===id)
  if(found) found.qty++
  else cart.push({id,name,price,qty:1})
  renderCart()
}

function removeItem(index){
  cart.splice(index,1)
  renderCart()
}

export function renderCart(){
  let html=""
  let total=0

  cart.forEach((p,i)=>{
    total+=p.price*p.qty
    html+=`
      <div class="cart-item">
        ${p.name} x${p.qty}
        <b>${formatMoney(p.price*p.qty)}</b>
        <button onclick="window.removeItem(${i})">✕</button>
      </div>
    `
  })

  finalTotal = total - (total*discountPercent/100)

  document.getElementById("cartItems").innerHTML = html
  document.getElementById("total").innerHTML =
    "Tổng: <b>"+formatMoney(finalTotal)+"</b>"

  saveCart()
  updateBadge()
}

window.removeItem = removeItem

export async function applyDiscount(){
  const code = document.getElementById("discountCode").value.trim()
  if(!code) return

  const {data,error} = await supabase
    .from("discounts")
    .select("*")
    .eq("code",code)
    .eq("active",true)
    .single()

  if(error || !data) return alert("Mã sai")

  if(new Date(data.expiry_date) < new Date())
    return alert("Mã hết hạn")

  discountPercent = data.percent
  renderCart()
}

export async function submitOrder(){
  const name = document.getElementById("name").value.trim()
  const phone = document.getElementById("phone").value.trim()
  const address = document.getElementById("address").value.trim()

  if(!name || !phone || !address)
    return alert("Nhập đủ thông tin")

  if(!/^0[0-9]{9}$/.test(phone))
    return alert("SĐT không hợp lệ")

  const orderCode = "ORD"+Date.now()

  const {data:order,error} = await supabase
    .from("orders")
    .insert([{
      order_code:orderCode,
      customer_name:name,
      phone,
      address,
      total_amount:finalTotal,
      status:"pending"
    }])
    .select()
    .single()

  if(error) return alert("Lỗi tạo đơn")

  for(let item of cart){
    await supabase.from("order_items").insert([{
      order_id:order.id,
      product_id:item.id,
      quantity:item.qty,
      price:item.price
    }])
  }

  generateQR(orderCode)

  cart=[]
  renderCart()
}

function generateQR(orderCode){
  const qrUrl = `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACCOUNT}-compact2.png?amount=${finalTotal}&addInfo=${orderCode}`

  const deeplink = `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACCOUNT}-compact2.png?amount=${finalTotal}&addInfo=${orderCode}`

  document.getElementById("qrBox").innerHTML=`
    <h3>Quét QR để thanh toán</h3>
    <img src="${qrUrl}" width="220"/>
    <p>Nội dung: <b>${orderCode}</b></p>
    <a href="${deeplink}" target="_blank" class="pay-btn">Mở app ngân hàng</a>
  `
}
