// Test-only stand-in for Supabase: keeps records in this browser (localStorage), signed in as owner.
(function(){
  const KEY="apTest.records";
  let rows=null;
  function load(){if(rows)return rows;try{rows=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
    if(!rows){const x=new XMLHttpRequest();x.open("GET","sample.json",false);x.send();rows=JSON.parse(x.responseText);persist()}return rows}
  function persist(){localStorage.setItem(KEY,JSON.stringify(rows))}
  function q(table){
    const st={table,op:"select",filters:[],range:null,payload:null,single:false};
    const run=()=>{
      if(table==="app_users"){const u={user_id:"u1",email:"owner@ap-plastic.app",username:"owner",role:"owner"};return {data:st.single?u:[u],error:null}}
      const R=load();
      if(st.op==="select"){let d=R.map(r=>({col:r.col,id:r.id,data:r.data}));if(st.range)d=d.slice(st.range[0],st.range[1]+1);return {data:d,error:null}}
      if(st.op==="upsert"){[].concat(st.payload).forEach(p=>{const i=R.findIndex(r=>r.col===p.col&&r.id===p.id);if(i>=0)R[i]={col:p.col,id:p.id,data:p.data};else R.push({col:p.col,id:p.id,data:p.data})});persist();return {data:null,error:null}}
      if(st.op==="delete"){const f=Object.fromEntries(st.filters);rows=R.filter(r=>!(r.col===f.col&&r.id===f.id));persist();return {data:null,error:null}}
      return {data:null,error:null}};
    const b={select(){return b},range(a,z){st.range=[a,z];return b},eq(k,v){st.filters.push([k,v]);return b},maybeSingle(){st.single=true;return b},
      upsert(p){st.op="upsert";st.payload=p;return b},delete(){st.op="delete";return b},update(p){st.op="update";st.payload=p;return b},
      then(res,rej){try{res(run())}catch(e){rej&&rej(e)}}};
    return b}
  const client={from:q,rpc:async()=>({data:true,error:null}),channel(){const c={on(){return c},subscribe(){return c}};return c},
    auth:{getSession:async()=>({data:{session:{user:{id:"u1",email:"owner@ap-plastic.app"}}}}),signOut:async()=>{},signInWithPassword:async()=>({data:{user:{id:"u1",email:"owner@ap-plastic.app"}},error:null})}};
  window.supabase={createClient:()=>client};
  window.fakeReset=()=>{localStorage.removeItem(KEY);rows=null;location.reload()};
})();
