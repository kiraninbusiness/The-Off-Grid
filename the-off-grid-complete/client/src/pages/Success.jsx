import React from "react";
import {Link,useLocation} from "react-router-dom";
export default function Success(){const {state}=useLocation();const o=state?.order;return <div className="success-page"><span>THE OFF GRID / COMPLETE</span><h1>ORDER<br/><em>PLACED.</em></h1><p>{o?`Your order ${o.id} has been received.`:"Your order has been received."}</p><div><Link className="orange-btn" to="/">CONTINUE SHOPPING</Link><Link className="outline-btn" to="/orders">VIEW ORDERS</Link></div></div>}
