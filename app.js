// app.js - client-side auth & record system (demo only)
// Admin email was set to 'woonylsm1608@gmail.com'.
// Note: this is a front-end demo. Do not use for production.
(function(){
  const ADMIN_EMAIL = 'woonylsm1608@gmail.com'; // 입력하신 값에서 @@가 보였으나 일반적 이메일은 @ 하나입니다. 필요하면 수정하세요.
  const LS_USERS = 'woonyl_users_v1';
  const LS_CUR = 'woonyl_currentUser';
  const LS_RECORDS = 'woonyl_records_v1';

  // helper
  function nowStr(){ return new Date().toLocaleString('ko-KR'); }

  // users stored as [{name,email,password,role}]
  function _readUsers(){ try{ return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); }catch(e){ return []; } }
  function _writeUsers(u){ localStorage.setItem(LS_USERS, JSON.stringify(u)); }

  function app_auth_signup({name, email, pass}){
    const users = _readUsers();
    if(users.find(x=>x.email.toLowerCase()===email.toLowerCase())) return {success:false, message:'이미 등록된 이메일입니다.'};
    const role = (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? 'admin' : 'user';
    users.push({name, email, password:pass, role});
    _writeUsers(users);
    _pushRecord({time: nowStr(), email, action:'signup', note: role});
    return {success:true};
  }

  function app_auth_login(email, pass){
    const users = _readUsers();
    const user = users.find(x=>x.email.toLowerCase()===email.toLowerCase() && x.password===pass);
    if(!user) return {success:false, message:'이메일 또는 비밀번호가 일치하지 않습니다.'};
    localStorage.setItem(LS_CUR, JSON.stringify({email:user.email, name:user.name, role:user.role}));
    _pushRecord({time: nowStr(), email:user.email, action:'login'});
    return {success:true, user};
  }

  function app_auth_logout(){
    const cur = JSON.parse(localStorage.getItem(LS_CUR) || 'null');
    if(cur) _pushRecord({time: nowStr(), email:cur.email, action:'logout'});
    localStorage.removeItem(LS_CUR);
  }

  function app_get_current(){
    return JSON.parse(localStorage.getItem(LS_CUR) || 'null');
  }

  function app_is_admin(){
    const cur = app_get_current();
    if(!cur) return {isAdmin:false};
    return {isAdmin: cur.email && cur.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(), user:cur};
  }

  function _pushRecord(r){
    const arr = JSON.parse(localStorage.getItem(LS_RECORDS) || '[]');
    arr.push(r);
    localStorage.setItem(LS_RECORDS, JSON.stringify(arr));
  }

  function app_get_records(){ return JSON.parse(localStorage.getItem(LS_RECORDS) || '[]'); }
  function app_clear_records(){ localStorage.removeItem(LS_RECORDS); }
  function app_records_to_csv(records){
    const rows = [['time','email','action','note']].concat(records.map(r=>[r.time, r.email, r.action, r.note||'']));
    return rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  }

  // expose to window for pages
  window.app_auth_signup = app_auth_signup;
  window.app_auth_login = app_auth_login;
  window.app_auth_logout = app_auth_logout;
  window.app_get_records = app_get_records;
  window.app_clear_records = app_clear_records;
  window.app_is_admin = app_is_admin;
  window.app_get_current = app_get_current;
  window.app_records_to_csv = app_records_to_csv;
})();
