import {useEffect,useRef,useState} from 'react';
import {Download,X,Smartphone} from 'lucide-react';
type InstallEvent=Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export default function InstallApp(){
 const [installed,setInstalled]=useState(false),[guide,setGuide]=useState(false),[offline,setOffline]=useState(false);const prompt=useRef<InstallEvent|null>(null);
 useEffect(()=>{
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
  const check=()=>setInstalled(matchMedia('(display-mode: standalone)').matches||!!(navigator as Navigator & {standalone?:boolean}).standalone);check();
  const display=matchMedia('(display-mode: standalone)');display.addEventListener('change',check);
  const capture=(e:Event)=>{e.preventDefault();prompt.current=e as InstallEvent};
  const done=()=>{setInstalled(true);setGuide(false);prompt.current=null};
  const connection=()=>setOffline(!navigator.onLine);connection();
  window.addEventListener('beforeinstallprompt',capture);window.addEventListener('appinstalled',done);window.addEventListener('offline',connection);window.addEventListener('online',connection);
  return()=>{display.removeEventListener('change',check);window.removeEventListener('beforeinstallprompt',capture);window.removeEventListener('appinstalled',done);window.removeEventListener('offline',connection);window.removeEventListener('online',connection)};
 },[]);
 return <>{offline&&<div className="offline-status" role="status">当前离线，抽签和记餐仍可使用，记录保存在本机。</div>}{!installed&&<button className="install-app-btn" onClick={async()=>{if(prompt.current){await prompt.current.prompt();await prompt.current.userChoice;prompt.current=null}else setGuide(true)}}><Download size={15}/>安装 App</button>}{guide&&<div className="modal-backdrop" onClick={()=>setGuide(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={e=>e.stopPropagation()}><div className="section-top"><h2 id="install-title"><Smartphone size={21}/> 把美味装进口袋</h2><button className="icon-button" aria-label="关闭安装说明" onClick={()=>setGuide(false)}><X size={19}/></button></div><p>无需注册或登录，添加到主屏幕后即可像 App 一样打开。</p><div className="install-guide"><b>iPhone / iPad</b><p>用 Safari 打开 → 分享 → 添加到主屏幕；如有「作为网页 App 打开」，请开启。</p><b>安卓手机 / 电脑</b><p>用 Chrome 或 Edge 打开 → 浏览器菜单 → 安装应用或添加到主屏幕。</p></div><p className="muted">饭店、点赞和用餐记录只保存在当前浏览器。更换设备或清除网站数据前，请在用餐日记导出备份；新设备可导入恢复。第一次打开需要联网，此后支持离线使用。</p><button className="btn primary full" onClick={()=>setGuide(false)}>知道了</button></section></div>}</>;
}
