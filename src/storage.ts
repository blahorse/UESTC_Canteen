import seed from './seed.json';
import {categories,type State,type Restaurant} from './types';
const KEY='uestc-canteen:v1';
const initial=():State=>({restaurants:structuredClone(seed),logs:[]});
const text=(v:unknown,n:number)=>typeof v==='string'?v.trim().slice(0,n):'';
const fail=(s:string):never=>{throw new Error(s)};
const validDate=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function validateBackup(value:unknown):State{
 const root=value as any;const data=root?.data??root;
 if(!data||!Array.isArray(data.restaurants)||!Array.isArray(data.logs)||!data.restaurants.length||data.restaurants.length>10000||data.logs.length>100000)fail('备份格式不正确，未修改现有记录');
 const ids=new Set<string>(),logIds=new Set<string>(),meals=new Set<string>();
 const restaurants=data.restaurants.map((r:any)=>{
  if(!r||typeof r.id!=='string'||!r.id||r.id.length>100||ids.has(r.id)||!text(r.name,80)||!categories.includes(r.category)||typeof r.liked!=='boolean'||typeof r.enabled!=='boolean')fail('备份中的饭店数据不正确');
  ids.add(r.id);return {id:r.id,name:text(r.name,80),category:r.category,address:text(r.address,160),dish:text(r.dish,240),originalType:text(r.originalType,40),liked:r.liked,enabled:r.enabled};
 });
 const logs=data.logs.map((l:any)=>{
  if(!l||typeof l.id!=='string'||!l.id||logIds.has(l.id)||!ids.has(l.restaurantId)||!validDate(l.date)||l.date>today()||!['午餐','晚餐'].includes(l.meal))fail('备份中的用餐记录不正确');
  const key=JSON.stringify([l.restaurantId,l.date,l.meal]);if(meals.has(key))fail('备份中有重复的用餐记录');meals.add(key);logIds.add(l.id);
  return {id:l.id,restaurantId:l.restaurantId,date:l.date,meal:l.meal,note:text(l.note,240)};
 });return {restaurants,logs};
}
export function readState():State{
 const raw=localStorage.getItem(KEY);if(!raw)return initial();
 try{return validateBackup(JSON.parse(raw))}catch{fail('浏览器中的记录无法读取，请先导出原始数据备份，避免覆盖。')}
}
export function readRaw(){return localStorage.getItem(KEY)||''}
function save(state:State){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{fail('浏览器存储空间不足或被禁用，未保存。请导出备份并检查浏览器设置。')}}
export const storageKey=KEY;
export async function updateState(input:any):Promise<State>{
 const apply=()=>{
  const state=readState(),r=state.restaurants.find(r=>r.id===input.restaurantId);
  switch(input.action){
   case 'like':if(!r)fail('找不到这家饭店');r.liked=!!input.liked;break;
   case 'restaurant':{
    const name=text(input.name,80),category=text(input.category,40);if(!name)fail('请输入店名');if(!categories.includes(category))fail('请选择分类');
    if(state.restaurants.some(x=>x.name===name&&x.id!==input.restaurantId))fail('这家饭店已在清单里');
    const fields={name,category,address:text(input.address,160),dish:text(input.dish,240)};
    if(r)Object.assign(r,fields);else state.restaurants.push({...fields,id:crypto.randomUUID(),enabled:true,liked:false});break;
   }
   case 'enable':if(!r)fail('找不到这家饭店');r.enabled=!!input.enabled;break;
   case 'record':{
    if(!r)fail('请先选择一家饭店');if(!validDate(input.date)||input.date>today())fail('请选择今天或过去的有效日期');if(!['午餐','晚餐'].includes(input.meal))fail('请选择午餐或晚餐');
    if(state.logs.some(l=>l.restaurantId===r.id&&l.date===input.date&&l.meal===input.meal))fail('这一餐已经记过啦');
    state.logs.unshift({id:crypto.randomUUID(),restaurantId:r.id,date:input.date,meal:input.meal,note:text(input.note,240)});break;
   }
   case 'deleteLog':state.logs=state.logs.filter(l=>l.id!==input.id);break;
   case 'import':{const next=validateBackup(input.data);save(next);return next;}
   default:fail('不支持此操作');
  }save(state);return state;
 };
 return navigator.locks? navigator.locks.request(KEY,apply):apply();
}
