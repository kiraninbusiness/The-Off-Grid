import React from "react";
import {X,Ruler} from "lucide-react";

export default function SizeGuideModal({onClose,product}){
 const category=String(product?.category||"").toUpperCase();
 const isBottom=["BOTTOMS","FOOTWEAR"].includes(category);
 const rows=isBottom
  ? [["28","28\"","—","—"],["30","30\"","—","—"],["32","32\"","—","—"],["34","34\"","—","—"],["36","36\"","—","—"]]
  : [["S","36\"","27\"","17\""],["M","39\"","28\"","18\""],["L","42\"","29\"","19\""],["XL","45\"","30\"","20\""]];
 return <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="size-modal size-guide-premium"><button className="modal-x" onClick={onClose}><X/></button><span><Ruler size={13}/> THE OFF GRID / GUIDE</span><h2>FIND YOUR <em>FIT.</em></h2><p className="size-guide-product">{product?.name}</p><table><thead><tr><th>SIZE</th><th>{isBottom?"WAIST":"CHEST"}</th><th>{isBottom?"INSEAM":"LENGTH"}</th><th>{isBottom?"—":"SHOULDER"}</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}>{r.map((x,i)=><td key={i}>{x}</td>)}</tr>)}</tbody></table><p>Measurements are a general reference and can vary slightly by garment. If you prefer a relaxed streetwear look, consider sizing up.</p></div></div>;
}
