export const categories=['中餐','快餐','面粉饺子','火锅干锅','烤肉自助','日韩料理','饮品酒水','甜点小吃','校园食堂'];
export type Restaurant={id:string;name:string;dish:string;address:string;originalType?:string;category:string;liked:boolean;enabled:boolean};
export type Meal={id:string;restaurantId:string;date:string;meal:'午餐'|'晚餐';note:string};
export type State={restaurants:Restaurant[];logs:Meal[]};
