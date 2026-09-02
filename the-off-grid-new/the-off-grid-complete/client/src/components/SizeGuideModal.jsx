import React from "react";
import {X} from "lucide-react";
export default function SizeGuideModal({onClose}) {
 const rows=[["S","36\"","27\"","17\""],["M","39\"","28\"","18\""],["L","42\"","29\"","19\""],["XL","45\"","30\"","20\""]];
 return <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="size-modal"><button className="modal-x" onClick={onClose}><X/></button><span>THE OFF GRID / GUIDE</span><h2>FIND YOUR <em>FIT.</em></h2><table><thead><tr><th>SIZE</th><th>CHEST</th><th>LENGTH</th><th>SHOULDER</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}>{r.map((x,i)=><td key={i}>{x}</td>)}</tr>)}</tbody></table><p>Measurements are a general reference and can vary slightly by garment.</p></div></div>
}
