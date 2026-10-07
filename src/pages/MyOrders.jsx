import React, { useEffect, useState } from 'react'
import {
  Package, MapPin, CreditCard, Truck, CheckCircle2, Clock3, XCircle,
  ChevronDown, ChevronUp, ShoppingBag, RefreshCw, RotateCcw, X,
  Send, AlertCircle, Check, LockKeyhole, Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './MyOrders.css'

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || (isLocalhost? 'http://localhost:5000/api' : 'https://sarika-fashions-backend-rfwh.onrender.com/api')

const CUSTOMER_TOKEN_KEY = 'sarika_customer_order_token'
const CUSTOMER_PHONE_KEY = 'sarika_customer_phone'
const RETURN_REQUESTS_KEY = 'sarika_return_requests'

const RETURN_REASONS = [
  'Damaged / defective item', 'Wrong item received', 'Item does not match description',
  'Color / design is different', 'Quality issue', 'Size / fit issue',
  'Received a different product', 'Changed my mind', 'Other',
]

const getCustomerOrderToken = () => localStorage.getItem(CUSTOMER_TOKEN_KEY) || localStorage.getItem('customer_order_token') || ''
const getCustomerPhone = () => localStorage.getItem(CUSTOMER_PHONE_KEY) || localStorage.getItem('customer_phone') || ''
const getCustomerOrderHeaders = () => {
  const token = getCustomerOrderToken()
  return token? { Authorization: `Bearer ${token}`, 'X-Customer-Order-Token': token } : {}
}
const getStoredReturnRequests = () => {
  try {
    const stored = localStorage.getItem(RETURN_REQUESTS_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed)? parsed : []
  } catch { return [] }
}
const saveStoredReturnRequests = (requests) => {
  try { localStorage.setItem(RETURN_REQUESTS_KEY, JSON.stringify(requests)) } catch {}
}
const formatDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
const formatTime = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
const money = (v) => `₹${Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`
const getOrderId = (o) => o?.id || o?._id || o?.order_id || o?.orderId || ''
const getOrderNumber = (o) => o?.order_number || o?.orderNumber || o?.order_no || o?.orderNo || o?.id || o?._id || 'Order'
const getOrderDate = (o) => o?.created_at || o?.createdAt || o?.order_date || o?.orderDate || o?.date || ''
const getOrderStatus = (o) => String(o?.status || o?.order_status || o?.orderStatus || 'Pending')
const getPaymentStatus = (o) => String(o?.payment_status || o?.paymentStatus || o?.payment?.status || 'Pending')
const getItemName = (i) => i?.product_name || i?.productName || i?.name || i?.title || i?.product?.name || 'Saree'
const getItemPrice = (i) => Number(i?.price?? i?.unit_price?? i?.unitPrice?? i?.product?.price?? 0)
const getItemQuantity = (i) => Number(i?.quantity?? i?.qty?? 1)
const getItemImage = (i) => i?.image_url || i?.imageUrl || i?.image || i?.product_image || i?.productImage || i?.product?.image_url || i?.product?.image || ''
const getOrderItems = (o) => { const items = o?.items || o?.order_items || o?.orderItems || o?.products || []; return Array.isArray(items)? items : [] }
const isReceived = (o) => { const s = getOrderStatus(o).toLowerCase(); return s.includes('deliver') || s.includes('completed') || s.includes('closed') || o?.delivered === true || o?.is_delivered === true || o?.isDelivered === true }
const isOrderDelivered = (o) => isReceived(o)
const getStatusClass = (s) => {
  const v = String(s||'').toLowerCase()
  if (v.includes('deliver')||v.includes('complete')||v.includes('success')) return 'status-delivered'
  if (v.includes('cancel')||v.includes('reject')) return 'status-cancelled'
  if (v.includes('ship')||v.includes('process')) return 'status-processing'
  return 'status-pending'
}
const getTrackingStep = (o) => {
  const s = getOrderStatus(o).toLowerCase()
  if (s.includes('cancel')||s.includes('reject')) return -1
  if (s.includes('deliver')||s.includes('complete')) return 4
  if (s.includes('ship')) return 3
  if (s.includes('process')||s.includes('packed')) return 2
  if (s.includes('confirm')||s.includes('accept')) return 1
  return 0
}
const getReturnStatusClass = (s) => { const v=String(s||'').toLowerCase(); if(v==='approved') return 'return-approved'; if(v==='rejected') return 'return-rejected'; return 'return-pending' }
const getOrderTotals = (o) => {
  const items = getOrderItems(o)
  const calc = items.reduce((t,i)=> t + getItemPrice(i)*getItemQuantity(i),0)
  const subtotal = Number(o?.subtotal?? o?.sub_total?? o?.subTotal?? calc)
  const shipping = Number(o?.shipping?? o?.shipping_fee?? o?.shippingFee?? 0)
  const tax = Number(o?.tax?? o?.gst?? 0)
  const discount = Number(o?.discount?? 0)
  const total = Number(o?.total?? o?.grand_total?? o?.grandTotal?? subtotal+shipping+tax-discount)
  return { subtotal, shipping, tax, discount, total }
}

const TrackingTimeline = ({ order }) => {
  const currentStep = getTrackingStep(order)
  if (currentStep === -1) return (<div className="tracking-cancelled"><XCircle size={20} /><div><strong>Order Cancelled</strong><span>This order has been cancelled.</span></div></div>)
  const steps = [{label:'Order Placed',icon:ShoppingBag},{label:'Confirmed',icon:CheckCircle2},{label:'Processing',icon:Package},{label:'Shipped',icon:Truck},{label:'Delivered',icon:MapPin}]
  return (<div className="tracking-timeline">{steps.map((step,index)=>{const Icon=step.icon; const active=index<=currentStep; const completed=index<currentStep; return (<React.Fragment key={step.label}><div className={`tracking-step ${active?'active':''} ${completed?'completed':''}`}><div className="tracking-icon"><Icon size={17} /></div><span>{step.label}</span></div>{index<steps.length-1 && <div className={`tracking-line ${index<currentStep?'active':''}`} />}</React.Fragment>)})}</div>)
}

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [phoneInput, setPhoneInput] = useState(getCustomerPhone())
  const [returnRequests, setReturnRequests] = useState([])
  const [returnModalOrder, setReturnModalOrder] = useState(null)
  const [returnForm, setReturnForm] = useState({ itemId: '', reason: '', description: '', evidence: null })
  const [returnPreview, setReturnPreview] = useState('')
  const [returnError, setReturnError] = useState('')
  const [returnSubmitting, setReturnSubmitting] = useState(false)
  const [returnSuccess, setReturnSuccess] = useState('')

  useEffect(()=>{ setReturnRequests(getStoredReturnRequests()) },[])

  const fetchOrders = async (manualPhone=null) => {
    const storedPhone = getCustomerPhone()
    const customerToken = getCustomerOrderToken()
    const phone = (manualPhone!==null? manualPhone : storedPhone).trim()
    if (!phone &&!customerToken){ setOrders([]); setLoading(false); return }
    try {
      setError('')
      if(manualPhone!==null) setRefreshing(true); else setLoading(true)
      let url = `${API_BASE}/my-orders`
      if(phone) url += `?phone=${encodeURIComponent(phone)}`
      const response = await fetch(url, { method:'GET', credentials:'include', headers:{ Accept:'application/json',...getCustomerOrderHeaders() } })
      if(!response.ok){
        const text = await response.text()
        let message=text
        try{ const d=JSON.parse(text); message=d?.error||d?.message||text }catch{}
        throw new Error(message||`Request failed ${response.status}`)
      }
      const data = await response.json()
      let receivedOrders=[]
      if(Array.isArray(data)) receivedOrders=data
      else if(Array.isArray(data?.orders)) receivedOrders=data.orders
      else if(Array.isArray(data?.data)) receivedOrders=data.data
      setOrders(receivedOrders)
      if(phone) localStorage.setItem(CUSTOMER_PHONE_KEY, phone)
    } catch(err){
      console.error(err)
      setError(err?.message||'Unable to load orders')
      setOrders([])
    } finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(()=>{ const p=getCustomerPhone(); const t=getCustomerOrderToken(); if(p||t) fetchOrders(); else setLoading(false) },[])

  const handlePhoneSearch = (e) => {
    e.preventDefault()
    const phone = phoneInput.trim()
    if(!phone){ setError('Please enter your phone number.'); return }
    localStorage.setItem(CUSTOMER_PHONE_KEY, phone)
    fetchOrders(phone)
  }

  const toggleOrder = (id) => setExpandedOrder((c)=> c===id? null : id)
  const getReturnsForOrder = (orderId) => returnRequests.filter((r)=> String(r.orderId)===String(orderId))
  const hasReturnedItem = (orderId,itemId) => returnRequests.some((r)=> String(r.orderId)===String(orderId) && String(r.itemId)===String(itemId))

  const openReturnModal = (order) => {
    const items = getOrderItems(order)
    const availableItem = items.find((item,index)=>!hasReturnedItem(getOrderId(order), item?.id||item?._id||item?.item_id||item?.product_id||index)) || items[0]
    const availableIndex = availableItem? items.indexOf(availableItem) : 0
    const availableItemId = availableItem?.id || availableItem?._id || availableItem?.item_id || availableItem?.product_id || availableIndex
    setReturnModalOrder(order)
    setReturnForm({ itemId:String(availableItemId), reason:'', description:'', evidence:null })
    setReturnPreview(''); setReturnError(''); setReturnSuccess('')
  }
  const closeReturnModal = () => {
    if(returnSubmitting) return
    setReturnModalOrder(null)
    setReturnForm({ itemId:'', reason:'', description:'', evidence:null })
    setReturnPreview(''); setReturnError(''); setReturnSubmitting(false)
  }
  const handleReturnFieldChange = (e) => {
    const {name,value}=e.target
    setReturnForm((p)=>({...p,[name]:value}))
    setReturnError('')
  }
  const handleEvidenceChange = (e) => {
    const file=e.target.files?.[0]
    if(!file) return
    if(!file.type.startsWith('image/')){ setReturnError('Please upload an image file.'); return }
    if(file.size>5*1024*1024){ setReturnError('Image size must be less than 5 MB.'); return }
    setReturnForm((p)=>({...p,evidence:file}))
    setReturnError('')
    const reader=new FileReader()
    reader.onloadend=()=> setReturnPreview(reader.result)
    reader.readAsDataURL(file)
  }

  // *** NO SESSION CHECK ANYMORE - DIRECT SUBMIT ***
  const submitReturnRequest = async (e) => {
    e.preventDefault()
    if(!returnModalOrder) return
    const items=getOrderItems(returnModalOrder)
    const selectedIndex=items.findIndex((item,index)=>{
      const itemId=item?.id||item?._id||item?.item_id||item?.product_id||index
      return String(itemId)===String(returnForm.itemId)
    })
    const selectedItem=selectedIndex>=0? items[selectedIndex]:null
    if(!selectedItem){ setReturnError('Please select the item you want to return.'); return }
    if(!returnForm.reason){ setReturnError('Please select a return reason.'); return }
    if(!returnForm.description.trim()){ setReturnError('Please describe the issue.'); return }

    const orderId=getOrderId(returnModalOrder)
    const itemId=selectedItem?.id||selectedItem?._id||selectedItem?.item_id||selectedItem?.product_id||selectedIndex
    if(!orderId){ setReturnError('Unable to identify order. Refresh.'); return }
    if(hasReturnedItem(orderId,itemId)){ setReturnError('Return already exists for this item.'); return }

    try{
      setReturnSubmitting(true); setReturnError(''); setReturnSuccess('')
      const customerToken=getCustomerOrderToken()
      const customerPhone=getCustomerPhone() || phoneInput.trim() || returnModalOrder?.phone || returnModalOrder?.customer_phone || ''

      const productId=selectedItem?.product_id??selectedItem?.productId??selectedItem?.product?.id??selectedItem?.product?._id??selectedItem?.id??null
      const orderNumber=getOrderNumber(returnModalOrder)

      const requestBody={
        order_id:orderId,
        order_number:orderNumber,
        product_id:productId,
        product_name:getItemName(selectedItem),
        quantity:getItemQuantity(selectedItem),
        reason:returnForm.reason,
        description:returnForm.description.trim(),
        phone:customerPhone,
        customer_phone:customerPhone,
      }

      console.log('↩️ Submitting return:', requestBody)

      const response=await fetch(`${API_BASE}/returns`,{
        method:'POST',
        credentials:'include',
        headers:{
          'Content-Type':'application/json',
          Accept:'application/json',
         ...(customerToken? { Authorization:`Bearer ${customerToken}`, 'X-Customer-Order-Token':customerToken } : {}),
        },
        body:JSON.stringify(requestBody),
      })

      const text=await response.text()
      let data={}
      try{ data=text? JSON.parse(text):{} }catch{ data={message:text} }
      console.log('Return response:', data)
      if(!response.ok) throw new Error(data?.error||data?.message||`Failed ${response.status}`)

      const request={
        id:data?.return_id||data?.id||`RET-${Date.now()}`,
        orderId, orderNumber,
        itemId:String(itemId),
        itemName:getItemName(selectedItem),
        itemImage:getItemImage(selectedItem),
        itemPrice:getItemPrice(selectedItem),
        quantity:getItemQuantity(selectedItem),
        reason:returnForm.reason,
        description:returnForm.description.trim(),
        evidenceName:returnForm.evidence?.name||'',
        status:data?.return_status||data?.status||'Return Requested',
        requestedAt:data?.requested_at||new Date().toISOString(),
        backendSaved:true,
      }

      const updated=[...returnRequests, request]
      setReturnRequests(updated)
      saveStoredReturnRequests(updated)
      setReturnSuccess(`Return request submitted for ${getItemName(selectedItem)}.`)
      setReturnModalOrder(null)
      setReturnForm({ itemId:'', reason:'', description:'', evidence:null })
      setReturnPreview('')
      await fetchOrders()
    }catch(err){
      console.error(err)
      setReturnError(err?.message||'Unable to submit return. Try again.')
    }finally{ setReturnSubmitting(false) }
  }

  const getReturnStatusForOrder=(orderId)=>{
    const reqs=getReturnsForOrder(orderId)
    if(!reqs.length) return null
    return reqs[reqs.length-1]
  }

  if(loading) return (<div className="my-orders-page"><div className="orders-loading"><div className="orders-spinner"></div><p>Loading your orders...</p></div></div>)

  return (
    <div className="my-orders-page">
      <div className="orders-container">
        <div className="orders-page-header">
          <div><span className="orders-eyebrow">SARIKA FASHIONS</span><h1>My Orders</h1><p>Track your saree orders and manage your purchases.</p></div>
          <button type="button" className={`refresh-orders-btn ${refreshing?'refreshing':''}`} onClick={()=>fetchOrders()} disabled={refreshing}><RefreshCw size={17}/>Refresh</button>
        </div>
        {returnSuccess && (<div className="orders-alert orders-alert-success"><CheckCircle2 size={18}/><span>{returnSuccess}</span><button type="button" onClick={()=>setReturnSuccess('')}><X size={16}/></button></div>)}
        {error && (<div className="orders-alert orders-alert-error"><AlertCircle size={18}/><span>{error}</span><button type="button" onClick={()=>setError('')}><X size={16}/></button></div>)}
        {!orders.length && (
          <div className="orders-search-card">
            <div className="orders-search-icon"><Search size={24}/></div>
            <div className="orders-search-content"><h2>Find Your Orders</h2><p>Enter the phone number used while placing your order.</p>
              <form className="orders-search-form" onSubmit={handlePhoneSearch}><input type="tel" value={phoneInput} onChange={(e)=>setPhoneInput(e.target.value)} placeholder="Enter phone number" maxLength={15}/><button type="submit"><Search size={17}/>Find Orders</button></form>
            </div>
          </div>
        )}
        {!orders.length &&!error && (<div className="orders-empty"><div className="empty-bag"><ShoppingBag size={44}/></div><h2>No orders found</h2><p>We couldn't find any orders for this phone number.</p><Link to="/shop" className="shop-now-btn">Continue Shopping</Link></div>)}
        {orders.length>0 && (
          <div className="orders-list">
            {orders.map((order,orderIndex)=>{
              const orderId=getOrderId(order)||`order-${orderIndex}`
              const orderNumber=getOrderNumber(order)
              const orderStatus=getOrderStatus(order)
              const paymentStatus=getPaymentStatus(order)
              const items=getOrderItems(order)
              const totals=getOrderTotals(order)
              const isExpanded=expandedOrder===orderId
              const orderReturns=getReturnsForOrder(orderId)
              const latestReturn=getReturnStatusForOrder(orderId)
              return (
                <article className={`order-card ${isExpanded?'order-card-expanded':''}`} key={orderId}>
                  <button type="button" className="order-card-header" onClick={()=>toggleOrder(orderId)}>
                    <div className="order-header-left"><div className="order-icon"><Package size={20}/></div><div><span className="order-label">ORDER</span><h2>#{orderNumber}</h2><p>{formatDate(getOrderDate(order))}{getOrderDate(order)&&formatTime(getOrderDate(order)) && <>{' • '}{formatTime(getOrderDate(order))}</>}</p></div></div>
                    <div className="order-header-right"><span className={`order-status ${getStatusClass(orderStatus)}`}>{orderStatus}</span>{isExpanded? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</div>
                  </button>
                  <div className="order-summary"><div><span>Items</span><strong>{items.length}</strong></div><div><span>Total</span><strong>{money(totals.total)}</strong></div><div><span>Payment</span><strong>{paymentStatus}</strong></div></div>
                  {(order?.address||order?.shipping_address||order?.shippingAddress) && (<div className="delivery-address"><div className="section-icon"><MapPin size={18}/></div><div><span className="section-label">DELIVERY ADDRESS</span><p>{order?.address||order?.shipping_address||order?.shippingAddress}</p></div></div>)}
                  <div className="order-actions">
                    <button type="button" className="view-order-btn" onClick={()=>toggleOrder(orderId)}>{isExpanded?'Hide Details':'View Details'}{isExpanded? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>
                    {isOrderDelivered(order) && (orderReturns.length>0? (<button type="button" className="return-requested-btn" onClick={()=>toggleOrder(orderId)}><Check size={16}/>Return Requested</button>) : (<button type="button" className="return-item-btn" onClick={()=>openReturnModal(order)}><RotateCcw size={16}/>Return Item</button>))}
                  </div>
                  {latestReturn && (<div className={`return-status-card ${getReturnStatusClass(latestReturn.status)}`}><div className="return-status-icon">{String(latestReturn.status).toLowerCase()==='approved'? <CheckCircle2 size={19}/> : String(latestReturn.status).toLowerCase()==='rejected'? <XCircle size={19}/> : <Clock3 size={19}/>}</div><div className="return-status-content"><div className="return-status-heading"><strong>Return Request</strong><span>{latestReturn.status}</span></div><p>{latestReturn.itemName}</p><small>Requested on {formatDate(latestReturn.requestedAt)}</small></div></div>)}
                  {isExpanded && (
                    <div className="order-details">
                      <section className="order-section"><div className="section-heading"><div><span className="section-label">ORDER TRACKING</span><h3>Track your delivery</h3></div><Truck size={22}/></div><TrackingTimeline order={order}/></section>
                      <section className="order-section">
                        <div className="section-heading"><div><span className="section-label">PRODUCTS</span><h3>Items in this order</h3></div><ShoppingBag size={22}/></div>
                        <div className="order-products">
                          {items.length===0? <div className="no-items">No product details available.</div> : items.map((item,itemIndex)=>{
                            const itemId=item?.id||item?._id||item?.item_id||item?.product_id||itemIndex
                            const returned=hasReturnedItem(orderId,itemId)
                            return (<div className="order-product" key={`${orderId}-${itemId}`}><div className="product-image-wrap">{getItemImage(item)? <img src={getItemImage(item)} alt={getItemName(item)}/> : <div className="product-image-placeholder"><ShoppingBag size={25}/></div>}</div><div className="product-info"><h4>{getItemName(item)}</h4><p>Qty: {getItemQuantity(item)}</p>{returned && <span className="returned-badge"><Check size={13}/>Return Requested</span>}</div><strong className="product-price">{money(getItemPrice(item)*getItemQuantity(item))}</strong></div>)
                          })}
                        </div>
                      </section>
                      <section className="order-section">
                        <div className="section-heading"><div><span className="section-label">PAYMENT</span><h3>Payment summary</h3></div><CreditCard size={22}/></div>
                        <div className="payment-summary"><div><span>Subtotal</span><strong>{money(totals.subtotal)}</strong></div><div><span>Shipping</span><strong>{totals.shipping===0?'FREE':money(totals.shipping)}</strong></div>{totals.tax>0 && <div><span>Tax</span><strong>{money(totals.tax)}</strong></div>}{totals.discount>0 && <div className="discount-row"><span>Discount</span><strong>-{money(totals.discount)}</strong></div>}<div className="payment-total"><span>Total Paid</span><strong>{money(totals.total)}</strong></div></div>
                        <div className="payment-method"><LockKeyhole size={16}/><span>Payment Status: <strong>{paymentStatus}</strong></span></div>
                      </section>
                      {isOrderDelivered(order) && orderReturns.length===0 && (<button type="button" className="large-return-btn" onClick={()=>openReturnModal(order)}><RotateCcw size={18}/>Request Return</button>)}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
      {returnModalOrder && (
        <div className="return-modal-overlay" onMouseDown={(e)=>{ if(e.target===e.currentTarget) closeReturnModal() }}>
          <div className="return-modal">
            <div className="return-modal-header"><div><span className="section-label">RETURN ITEM</span><h2>Request a return</h2><p>Order #{getOrderNumber(returnModalOrder)}</p></div><button type="button" className="modal-close-btn" onClick={closeReturnModal} disabled={returnSubmitting}><X size={21}/></button></div>
            <form onSubmit={submitReturnRequest} className="return-form">
              <div className="return-form-group"><label>Select item</label><div className="return-product-list">{getOrderItems(returnModalOrder).map((item,index)=>{ const itemId=item?.id||item?._id||item?.item_id||item?.product_id||index; const selected=String(returnForm.itemId)===String(itemId); const returned=hasReturnedItem(getOrderId(returnModalOrder),itemId); return (<button type="button" key={String(itemId)} className={`return-product-option ${selected?'selected':''} ${returned?'already-returned':''}`} onClick={()=>{ if(returned) return; setReturnForm((p)=>({...p,itemId:String(itemId)})); setReturnError('') }} disabled={returned}><div className="return-product-image">{getItemImage(item)? <img src={getItemImage(item)} alt={getItemName(item)}/> : <ShoppingBag size={22}/>}</div><div className="return-product-details"><strong>{getItemName(item)}</strong><span>Qty: {getItemQuantity(item)}</span>{returned && <small>Already requested</small>}</div><div className="return-radio">{selected && <Check size={14}/>}</div></button>)})}</div></div>
              <div className="return-form-group"><label htmlFor="return-reason">Reason for return</label><select id="return-reason" name="reason" value={returnForm.reason} onChange={handleReturnFieldChange}><option value="">Select a reason</option>{RETURN_REASONS.map((r)=>(<option key={r} value={r}>{r}</option>))}</select></div>
              <div className="return-form-group"><label htmlFor="return-description">Describe the issue</label><textarea id="return-description" name="description" value={returnForm.description} onChange={handleReturnFieldChange} placeholder="Please tell us what went wrong..." rows={4} maxLength={500}/><span className="character-count">{returnForm.description.length}/500</span></div>
              <div className="return-form-group"><label>Add photo evidence <span>(optional)</span></label><label htmlFor="return-evidence" className="evidence-upload"><Send size={20}/><div><strong>Upload an image</strong><span>JPG, PNG or WEBP • Max 5 MB</span></div><input id="return-evidence" type="file" accept="image/*" onChange={handleEvidenceChange}/></label>{returnPreview && (<div className="evidence-preview"><img src={returnPreview} alt="Return evidence preview"/><button type="button" onClick={()=>{ setReturnPreview(''); setReturnForm((p)=>({...p,evidence:null})) }}><X size={15}/></button></div>)}</div>
              <div className="return-info-box"><AlertCircle size={18}/><p>Your return request will be reviewed by our team. Keep the product unused and in its original packaging where possible.</p></div>
              {returnError && (<div className="return-form-error"><AlertCircle size={17}/><span>{returnError}</span></div>)}
              <div className="return-modal-actions"><button type="button" className="cancel-return-btn" onClick={closeReturnModal} disabled={returnSubmitting}>Cancel</button><button type="submit" className="submit-return-btn" disabled={returnSubmitting}>{returnSubmitting? <><span className="button-spinner"/>Submitting...</> : <><RotateCcw size={17}/>Submit Return Request</>}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default MyOrders